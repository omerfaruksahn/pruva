const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../authMiddleware');

// Varsayılan E-posta Şablonları (Seeding/Fallback için)
const DEFAULT_TEMPLATES = {
    'fcl-request': {
        name: 'FCL Rate Request',
        subject: 'Rate Request – {{POL}} / {{POD}} – {{KONTEYNER_TİPİ}} x{{ADET}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\n\nPOL: {{POL}}\nPOD: {{POD}}\nKonteyner: {{KONTEYNER_TİPİ}} x {{ADET}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{YÜK_CİNSİ}}\n\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\n\nTeşekkürler,\n{{İMZA}}'
    },
    'fcl-offer': {
        name: 'FCL Müşteri Teklifi',
        subject: 'Navlun Teklifi – {{POL}} / {{POD}} – {{KONTEYNER_TİPİ}} x{{ADET}}',
        body: 'Sayın {{MÜŞTERİ_ADI}},\n\nTalebiniz doğrultusunda aşağıdaki navlun teklifini sunmaktayız:\n\nGüzergah: {{POL}} → {{POD}}\nKonteyner: {{KONTEYNER_TİPİ}} x {{ADET}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nNavlun (All-in): USD {{NAVLUN_FİYATI}} / konteyner\nFiyat Geçerliliği: {{GEÇERLİLİK_SÜRESİ}}\n\nSorularınız için her zaman ulaşabilirsiniz.\n\nSaygılarimizla,\n{{İMZA}}'
    },
    'fcl-negotiation': {
        name: 'FCL Pazarlık',
        subject: 'Re: Rate Request – {{POL}} / {{POD}} – Revize Talep',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nVerdiğiniz fiyat için teşekkür ederiz. Ancak müşterimizin bütçesi doğrultusunda USD {{BEKLENEN_FİYAT}} seviyesinde revize talep ediyoruz.\n\nMevcut fiyatınız: USD {{NAVLUN_FİYATI}}\nBeklenen fiyat: USD {{BEKLENEN_FİYAT}}\nFark: USD {{FARK}}\n\nBu güzergahta düzenli yük potansiyelimiz bulunmaktadır. Revizenizi bekliyoruz.\n\nTeşekkürler,\n{{İMZA}}'
    },
    'fcl-followup': {
        name: 'FCL Takip',
        subject: 'Takip – Rate Request – {{POL}} / {{POD}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\n{{TARİH}} tarihinde ilettiğimiz rate request\'e henüz dönüş alamadık. Yükleme tarihi yaklaşmaktadır, fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{İMZA}}'
    },
    'lcl-request': {
        name: 'LCL Rate Request',
        subject: 'LCL Rate Request – {{POL}} / {{POD}} – {{CBM}} CBM / {{KG}} KG – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nAşağıdaki parsiyel yük için navlun fiyatı talep ediyoruz:\n\nPOL / CFS: {{POL}} / {{CFS_POL}}\nPOD / CFS: {{POD}} / {{CFS_POD}}\nHacim: {{CBM}} CBM\nAğırlık: {{KG}} KG\nPaket Adedi: {{PAKET_ADEDI}}\nW/M: {{W_M}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{YÜK_CİNSİ}}\n\nFiyatınızı geçerlilik süresiyle iletirseniz seviniriz.\n\nTeşekkürler,\n{{İMZA}}'
    },
    'lcl-offer': {
        name: 'LCL Müşteri Teklifi',
        subject: 'LCL Navlun Teklifi – {{POL}} / {{POD}} – {{CBM}} CBM',
        body: 'Sayın {{MÜŞTERİ_ADI}},\n\nParsiyel yük talebiniz için aşağıdaki teklifi sunmaktayız:\n\nGüzergah: {{POL}} → {{POD}}\nHacim: {{CBM}} CBM / {{KG}} KG\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nNavlun: USD {{NAVLUN_FİYATI}} / W/M\nFiyat Geçerliliği: {{GEÇERLİLİK_SÜRESİ}}\n\nSaygılarımızla,\n{{İMZA}}'
    },
    'lcl-negotiation': {
        name: 'LCL Pazarlık',
        subject: 'Re: LCL Rate Request – {{POL}} / {{POD}} – Revize Talep',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nFiyatınız için teşekkürler. USD {{BEKLENEN_FİYAT}}/W/M seviyesinde revize mümkün müdür?\n\nMevcut: USD {{NAVLUN_FİYATI}} / W/M\nBeklenen: USD {{BEKLENEN_FİYAT}} / W/M\n\nTeşekkürler,\n{{İMZA}}'
    },
    'lcl-followup': {
        name: 'LCL Takip',
        subject: 'Takip – LCL Rate Request – {{POL}} / {{POD}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\n{{TARİH}} tarihinde ilettiğimiz LCL rate request\'e dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{İMZA}}'
    },
    'air-request': {
        name: 'Hava Rate Request',
        subject: 'Air Freight Rate Request – {{POL}} / {{POD}} – {{CHARGEABLE_WEIGHT}} KG – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nAşağıdaki hava yükü için fiyat talep ediyoruz:\n\nGüzergah: {{UCUŞ_GÜZERGAHI}}\nGerçek Ağırlık: {{KG}} KG\nHacimsel Ağırlık: {{HACIMSEL_AGIRLIK}} KG\nChargeable Weight: {{CHARGEABLE_WEIGHT}} KG\nBoyutlar: {{BOYUT}} cm\nPaket Adedi: {{PAKET_ADEDI}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{YÜK_CİNSİ}}\n\nAll-in fiyat bekliyoruz.\n\nTeşekkürler,\n{{İMZA}}'
    },
    'air-offer': {
        name: 'Hava Müşteri Teklifi',
        subject: 'Hava Yolu Navlun Teklifi – {{POL}} / {{POD}} – {{CHARGEABLE_WEIGHT}} KG',
        body: 'Sayın {{MÜŞTERİ_ADI}},\n\nHava yolu talebiniz için teklifimiz:\n\nGüzergah: {{UCUŞ_GÜZERGAHI}}\nChargeable Weight: {{CHARGEABLE_WEIGHT}} KG\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nNavlun: USD {{NAVLUN_FİYATI}} / KG\nFiyat Geçerliliği: {{GEÇERLİLİK_SÜRESİ}}\n\nSaygılarımızla,\n{{İMZA}}'
    },
    'air-negotiation': {
        name: 'Hava Pazarlık',
        subject: 'Re: Air Freight Rate Request – {{POL}} / {{POD}} – Revize Talep',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nFiyatınız için teşekkürler. USD {{BEKLENEN_FİYAT}}/KG seviyesinde revize mümkün müdür?\n\nMevcut: USD {{NAVLUN_FİYATI}} / KG\nBeklenen: USD {{BEKLENEN_FİYAT}} / KG\n\nTeşekkürler,\n{{İMZA}}'
    },
    'air-followup': {
        name: 'Hava Takip',
        subject: 'Takip – Air Freight Rate Request – {{POL}} / {{POD}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\n{{TARİH}} tarihinde ilettiğimiz hava yolu rate request\'e dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{İMZA}}'
    },
    'road-request': {
        name: 'Kara Rate Request',
        subject: 'Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – {{ARAÇ_TİPİ}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nAşağıdaki kara taşıması için fiyat talep ediyoruz:\n\nGüzergah: {{GÜZERGAH}}\nAraç Tipi: {{ARAÇ_TİPİ}}\nAraç Adedi: {{ARAÇ_ADEDI}}\nAğırlık: {{KG}} KG\nYükleme Metresi: {{LDM}} LDM\nGümrük Noktası: {{GÜMRÜK_NOKTASI}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{YÜK_CİNSİ}}\n\nTeşekkürler,\n{{İMZA}}'
    },
    'road-offer': {
        name: 'Kara Müşteri Teklifi',
        subject: 'Kara Taşıma Teklifi – {{POL}} / {{POD}} – {{ARAÇ_TİPİ}}',
        body: 'Sayın {{MÜŞTERİ_ADI}},\n\nKara taşıma talebiniz için teklifimiz:\n\nGüzergah: {{GÜZERGAH}}\nAraç Tipi: {{ARAÇ_TİPİ}}\nYükleme Tarihi: {{YÜKLEME_TARİHİ}}\nNavlun: USD {{NAVLUN_FİYATI}} / araç\nFiyat Geçerliliği: {{GEÇERLİLİK_SÜRESİ}}\n\nSaygılarımızla,\n{{İMZA}}'
    },
    'road-negotiation': {
        name: 'Kara Pazarlık',
        subject: 'Re: Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – Revize Talep',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\nFiyatınız için teşekkürler. USD {{BEKLENEN_FİYAT}}/araç seviyesinde revize mümkün müdür?\n\nMevcut: USD {{NAVLUN_FİYATI}} / araç\nBeklenen: USD {{BEKLENEN_FİYAT}} / araç\n\nTeşekkürler,\n{{İMZA}}'
    },
    'road-followup': {
        name: 'Kara Takip',
        subject: 'Takip – Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – {{YÜKLEME_TARİHİ}}',
        body: 'Sayın {{TAŞIYICI_ADI}},\n\n{{TARİH}} tarihinde ilettiğimiz kara taşıma fiyat talebine dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{İMZA}}'
    },
    'common-missing': {
        name: 'Eksik Bilgi Sorgulama',
        subject: 'Navlun Talebi – Ek Bilgi Gerekli',
        body: 'Sayın {{MÜŞTERİ_ADI}},\n\nNavlun talebinizi aldık, teşekkür ederiz.\n\nFiyatlandırma yapabilmemiz için aşağıdaki bilgilere ihtiyaç duyuyoruz:\n{{EKSİK_BİLGİLER}}\n\nMevcut bilgileriniz:\n{{MEVCUT_BİLGİLER}}\n\nBu bilgileri ilettiğinizde en kısa sürede fiyat teklifimizi sunacağız.\n\nSaygılarımızla,\n{{İMZA}}'
    }
};

// ─────────────────────────────────────────────
// 1. E-POSTA ŞABLONLARI ENDPOINTS
// ─────────────────────────────────────────────

// @route   GET api/pricing/templates
// @desc    Kullanıcının tüm mail şablonlarını getirir
router.get('/templates', auth, async (req, res) => {
    try {
        const query = 'SELECT template_key, subject, body FROM pricing_templates WHERE user_id = $1';
        const result = await db.query(query, [req.user.id]);

        if (result.rows.length === 0) {
            // Veritabanında şablon yoksa default şablonları döndür
            return res.json(DEFAULT_TEMPLATES);
        }

        // DB verilerini key-value yapısına map et
        const templates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
        result.rows.forEach(row => {
            if (templates[row.template_key]) {
                templates[row.template_key].subject = row.subject;
                templates[row.template_key].body = row.body;
            }
        });

        res.json(templates);
    } catch (err) {
        console.error('[GET TEMPLATES ERR]', err);
        res.status(500).json({ error: 'Şablonlar getirilemedi.' });
    }
});

// @route   POST api/pricing/templates
// @desc    Şablon kaydeder veya günceller (Upsert)
router.post('/templates', auth, async (req, res) => {
    try {
        const { key, subject, body } = req.body;

        if (!key || !subject || !body) {
            return res.status(400).json({ error: 'Eksik parametreler.' });
        }

        // template_key'e göre transport_mode ve template_type değerlerini çıkar
        let transportMode = 'ORTAK';
        if (key.startsWith('fcl')) transportMode = 'DENIZ_FCL';
        else if (key.startsWith('lcl')) transportMode = 'DENIZ_LCL';
        else if (key.startsWith('air')) transportMode = 'HAVA';
        else if (key.startsWith('road')) transportMode = 'KARA';

        let templateType = 'MISSING_INFO';
        if (key.includes('request')) templateType = 'RATE_REQUEST';
        else if (key.includes('offer')) templateType = 'OFFER';
        else if (key.includes('negotiation')) templateType = 'NEGOTIATION';
        else if (key.includes('followup')) templateType = 'FOLLOW_UP';

        const upsertQuery = `
            INSERT INTO pricing_templates (user_id, template_key, transport_mode, template_type, subject, body, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (user_id, template_key) DO UPDATE
            SET subject = EXCLUDED.subject,
                body = EXCLUDED.body,
                updated_at = NOW();
        `;

        await db.query(upsertQuery, [req.user.id, key, transportMode, templateType, subject, body]);
        res.json({ success: true, message: 'Şablon başarıyla kaydedildi.' });
    } catch (err) {
        console.error('[POST TEMPLATE ERR]', err);
        res.status(500).json({ error: 'Şablon kaydedilemedi.' });
    }
});

// @route   DELETE api/pricing/templates/:key
// @desc    Şablonu siler (Varsayılan ayarlara dönmesini sağlar)
router.delete('/templates/:key', auth, async (req, res) => {
    try {
        const { key } = req.params;
        const deleteQuery = 'DELETE FROM pricing_templates WHERE template_key = $1 AND user_id = $2';
        await db.query(deleteQuery, [key, req.user.id]);
        res.json({ success: true, message: 'Şablon silindi (varsayılana sıfırlandı).' });
    } catch (err) {
        console.error('[DELETE TEMPLATE ERR]', err);
        res.status(500).json({ error: 'Şablon silinemedi.' });
    }
});

// ─────────────────────────────────────────────
// 2. TAŞIYICI VE ACENTE ENDPOINTS
// ─────────────────────────────────────────────

// @route   GET api/pricing/carriers
// @desc    Kullanıcının taşıyıcı listesini getirir
router.get('/carriers', auth, async (req, res) => {
    try {
        const query = 'SELECT id, name, email, category, regions, transport_modes, template_type, preference_score, is_active FROM pricing_carriers WHERE user_id = $1 ORDER BY id ASC';
        const result = await db.query(query, [req.user.id]);

        // Frontend formatına map edelim
        const carriers = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            category: row.category,
            regions: row.regions || [],
            rating: row.preference_score,
            template: row.template_type,
            active: row.is_active
        }));

        res.json(carriers);
    } catch (err) {
        console.error('[GET CARRIERS ERR]', err);
        res.status(500).json({ error: 'Taşıyıcı listesi getirilemedi.' });
    }
});

// @route   POST api/pricing/carriers
// @desc    Yeni taşıyıcı ekler
router.post('/carriers', auth, async (req, res) => {
    try {
        const { name, email, category, regions, rating, template } = req.body;

        if (!name || !email || !category) {
            return res.status(400).json({ error: 'Eksik parametreler.' });
        }

        // Taşıma modlarını şablondan türetelim
        let transportModes = ['DENIZ_FCL'];
        if (template && template.startsWith('lcl')) transportModes = ['DENIZ_LCL'];
        else if (template && template.startsWith('air')) transportModes = ['HAVA'];
        else if (template && template.startsWith('road')) transportModes = ['KARA'];

        const insertQuery = `
            INSERT INTO pricing_carriers (user_id, name, email, category, regions, transport_modes, template_type, preference_score, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING id;
        `;

        const result = await db.query(insertQuery, [
            req.user.id,
            name,
            email,
            category,
            regions || [],
            transportModes,
            template,
            rating || 3
        ]);

        res.json({ success: true, message: 'Taşıyıcı başarıyla eklendi.', id: result.rows[0].id });
    } catch (err) {
        console.error('[POST CARRIER ERR]', err);
        res.status(500).json({ error: 'Taşıyıcı eklenemedi.' });
    }
});

// @route   PUT api/pricing/carriers/:id
// @desc    Taşıyıcı günceller
router.put('/carriers/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, category, regions, rating, template, active } = req.body;

        let transportModes = ['DENIZ_FCL'];
        if (template && template.startsWith('lcl')) transportModes = ['DENIZ_LCL'];
        else if (template && template.startsWith('air')) transportModes = ['HAVA'];
        else if (template && template.startsWith('road')) transportModes = ['KARA'];

        const updateQuery = `
            UPDATE pricing_carriers
            SET name = $1, email = $2, category = $3, regions = $4, transport_modes = $5, template_type = $6, preference_score = $7, is_active = $8
            WHERE id = $9 AND user_id = $10;
        `;

        await db.query(updateQuery, [
            name,
            email,
            category,
            regions || [],
            transportModes,
            template,
            rating || 3,
            active !== undefined ? active : true,
            id,
            req.user.id
        ]);

        res.json({ success: true, message: 'Taşıyıcı başarıyla güncellendi.' });
    } catch (err) {
        console.error('[PUT CARRIER ERR]', err);
        res.status(500).json({ error: 'Taşıyıcı güncellenemedi.' });
    }
});

// @route   DELETE api/pricing/carriers/:id
// @desc    Taşıyıcı siler
router.delete('/carriers/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = 'DELETE FROM pricing_carriers WHERE id = $1 AND user_id = $2';
        await db.query(deleteQuery, [id, req.user.id]);
        res.json({ success: true, message: 'Taşıyıcı silindi.' });
    } catch (err) {
        console.error('[DELETE CARRIER ERR]', err);
        res.status(500).json({ error: 'Taşıyıcı silinemedi.' });
    }
});

// @route   PATCH api/pricing/carriers/:id/toggle
// @desc    Taşıyıcıyı aktif/pasif yapar
router.patch('/carriers/:id/toggle', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (active === undefined) {
            return res.status(400).json({ error: 'Eksik parametre (active).' });
        }

        const toggleQuery = 'UPDATE pricing_carriers SET is_active = $1 WHERE id = $2 AND user_id = $3';
        await db.query(toggleQuery, [active, id, req.user.id]);

        res.json({ success: true, message: `Taşıyıcı ${active ? 'aktif' : 'pasif'} yapıldı.` });
    } catch (err) {
        console.error('[PATCH CARRIER TOGGLE ERR]', err);
        res.status(500).json({ error: 'Taşıyıcı durumu güncellenemedi.' });
    }
});

// ─────────────────────────────────────────────
// 3. MARGİN KURALLARI ENDPOINTS (Faz 5)
// ─────────────────────────────────────────────

// @route   GET api/pricing/margins
// @desc    Kullanıcının margin kurallarını getirir
router.get('/margins', auth, async (req, res) => {
    try {
        const query = 'SELECT id, region, transport_mode, margin_percent, customer_type FROM pricing_margins WHERE user_id = $1 ORDER BY id ASC';
        const result = await db.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('[GET MARGINS ERR]', err);
        res.status(500).json({ error: 'Margin kuralları getirilemedi.' });
    }
});

// @route   POST api/pricing/margins
// @desc    Kullanıcıya yeni margin kuralı ekler
router.post('/margins', auth, async (req, res) => {
    try {
        const { region, transport_mode, margin_percent, customer_type } = req.body;

        if (margin_percent === undefined) {
            return res.status(400).json({ error: 'Eksik parametre (margin_percent).' });
        }

        const insertQuery = `
            INSERT INTO pricing_margins (user_id, region, transport_mode, margin_percent, customer_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const result = await db.query(insertQuery, [
            req.user.id,
            region || 'Tüm Bölgeler',
            transport_mode || 'ORTAK',
            margin_percent,
            customer_type || 'STANDARD'
        ]);

        res.json({ success: true, message: 'Margin kuralı başarıyla eklendi.', id: result.rows[0].id });
    } catch (err) {
        console.error('[POST MARGIN ERR]', err);
        res.status(500).json({ error: 'Margin kuralı eklenemedi.' });
    }
});

// ─────────────────────────────────────────────
// 4. MÜŞTERİ PROFİLLERİ CRUD ENDPOINTS (Faz 5)
// ─────────────────────────────────────────────

// @route   GET api/pricing/customers
// @desc    Kullanıcının müşteri listesini getirir
router.get('/customers', auth, async (req, res) => {
    try {
        const query = 'SELECT id, company_name, email, active_regions, monthly_volume, price_sensitivity, customer_type, notes FROM pricing_customers WHERE user_id = $1 ORDER BY id ASC';
        const result = await db.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('[GET CUSTOMERS ERR]', err);
        res.status(500).json({ error: 'Müşteri listesi getirilemedi.' });
    }
});

// @route   POST api/pricing/customers
// @desc    Yeni müşteri profili ekler
router.post('/customers', auth, async (req, res) => {
    try {
        const { company_name, email, active_regions, monthly_volume, price_sensitivity, customer_type, notes } = req.body;

        if (!company_name || !email) {
            return res.status(400).json({ error: 'Firma adı ve e-posta zorunludur.' });
        }

        const insertQuery = `
            INSERT INTO pricing_customers (user_id, company_name, email, active_regions, monthly_volume, price_sensitivity, customer_type, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        const result = await db.query(insertQuery, [
            req.user.id,
            company_name,
            email,
            active_regions || [],
            monthly_volume || 0,
            price_sensitivity || 'NORMAL',
            customer_type || 'STANDARD',
            notes || ''
        ]);

        res.json({ success: true, message: 'Müşteri profili başarıyla oluşturuldu.', id: result.rows[0].id });
    } catch (err) {
        console.error('[POST CUSTOMER ERR]', err);
        res.status(500).json({ error: 'Müşteri profili eklenemedi.' });
    }
});

// @route   PUT api/pricing/customers/:id
// @desc    Müşteri profilini günceller
router.put('/customers/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, email, active_regions, monthly_volume, price_sensitivity, customer_type, notes } = req.body;

        if (!company_name || !email) {
            return res.status(400).json({ error: 'Firma adı ve e-posta zorunludur.' });
        }

        const updateQuery = `
            UPDATE pricing_customers
            SET company_name = $1, email = $2, active_regions = $3, monthly_volume = $4, price_sensitivity = $5, customer_type = $6, notes = $7
            WHERE id = $8 AND user_id = $9;
        `;
        await db.query(updateQuery, [
            company_name,
            email,
            active_regions || [],
            monthly_volume || 0,
            price_sensitivity || 'NORMAL',
            customer_type || 'STANDARD',
            notes || '',
            id,
            req.user.id
        ]);

        res.json({ success: true, message: 'Müşteri profili başarıyla güncellendi.' });
    } catch (err) {
        console.error('[PUT CUSTOMER ERR]', err);
        res.status(500).json({ error: 'Müşteri profili güncellenemedi.' });
    }
});

// @route   DELETE api/pricing/customers/:id
// @desc    Müşteri profilini siler
router.delete('/customers/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = 'DELETE FROM pricing_customers WHERE id = $1 AND user_id = $2';
        await db.query(deleteQuery, [id, req.user.id]);
        res.json({ success: true, message: 'Müşteri profili silindi.' });
    } catch (err) {
        console.error('[DELETE CUSTOMER ERR]', err);
        res.status(500).json({ error: 'Müşteri profili silinemedi.' });
    }
});

// @route   GET api/pricing/carrier_performance
// @desc    Taşıyıcı performans skorlarını getirir (Faz 5)
router.get('/carrier_performance', auth, async (req, res) => {
    try {
        const query = 'SELECT id, carrier_id, response_hours, was_cheapest, was_selected, rfq_id FROM pricing_carrier_performance';
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('[GET PERFORMANCE ERR]', err);
        res.status(500).json({ error: 'Performans skorları getirilemedi.' });
    }
});

// @route   GET api/pricing/rate-history
// @desc    Güzergah bazlı fiyat geçmişini getirir (Faz 6)
router.get('/rate-history', auth, async (req, res) => {
    try {
        const { pol, pod, mode } = req.query;
        let query = 'SELECT id, pol, pod, transport_mode, container_type, carrier_name, price, currency, valid_until, created_at FROM pricing_rate_history WHERE 1=1';
        const queryParams = [];
        let paramIdx = 1;
        
        if (pol) {
            query += ` AND LOWER(pol) = LOWER($${paramIdx++})`;
            queryParams.push(pol);
        }
        if (pod) {
            query += ` AND LOWER(pod) = LOWER($${paramIdx++})`;
            queryParams.push(pod);
        }
        if (mode) {
            query += ` AND LOWER(transport_mode) = LOWER($${paramIdx++})`;
            queryParams.push(mode);
        }
        
        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('[GET RATE HISTORY ERR]', err);
        res.status(500).json({ error: 'Fiyat geçmişi getirilemedi.' });
    }
});
 
// @route   POST api/pricing/rfqs/:id/lost
// @desc    Kaybedilen teklif analiz detaylarını günceller (Faz 6)
router.post('/rfqs/:id/lost', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { lost_reason, competitor_price } = req.body;
        
        if (!lost_reason) {
            return res.status(400).json({ error: 'Kaybetme nedeni belirtilmelidir.' });
        }
 
        const updateQuery = 'UPDATE pricing_rfqs SET lost_reason = $1, competitor_price = $2, status = $3 WHERE id = $4';
        await db.query(updateQuery, [
            lost_reason,
            parseFloat(competitor_price) || 0,
            'CANCELLED',
            parseInt(id)
        ]);
 
        res.json({ success: true, message: 'Kaybedilen teklif analizi başarıyla kaydedildi.' });
    } catch (err) {
        console.error('[POST LOST DEAL ERR]', err);
        res.status(500).json({ error: 'Kaybedilen teklif kaydı başarısız.' });
    }
});



// @route   DELETE api/pricing/margins/:id
// @desc    Margin kuralını siler
router.delete('/margins/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = 'DELETE FROM pricing_margins WHERE id = $1 AND user_id = $2';
        await db.query(deleteQuery, [id, req.user.id]);
        res.json({ success: true, message: 'Margin kuralı silindi.' });
    } catch (err) {
        console.error('[DELETE MARGIN ERR]', err);
        res.status(500).json({ error: 'Margin kuralı silinemedi.' });
    }
});

// === METRICS ENDPOINT ===
router.get('/metrics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Toplam RFQ sayısı
    const rfqResult = await db.query(
      'SELECT COUNT(*) as total FROM pricing_rfqs WHERE user_id = $1',
      [userId]
    );
    
    // Toplam gönderilen teklif sayısı
    const offerResult = await db.query(
      `SELECT COUNT(*) as total FROM pricing_actions 
       WHERE user_id = $1 AND type = 'SEND_OFFER' AND status = 'COMPLETED'`,
      [userId]
    );
    
    // Kazanılan teklifler (completed RFQs)
    const wonResult = await db.query(
      `SELECT COUNT(*) as total FROM pricing_rfqs 
       WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    
    // Bu haftaki RFQ sayısı
    const weeklyRfqResult = await db.query(
      `SELECT COUNT(*) as total FROM pricing_rfqs 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [userId]
    );
    
    const totalRfqs = parseInt(rfqResult.rows[0].total) || 0;
    const totalOffers = parseInt(offerResult.rows[0].total) || 0;
    const totalWon = parseInt(wonResult.rows[0].total) || 0;
    const weeklyRfqs = parseInt(weeklyRfqResult.rows[0].total) || 0;
    
    const winRate = totalOffers > 0 
      ? Math.round((totalWon / totalOffers) * 100) 
      : 0;
    
    res.json({
      rfqCount: weeklyRfqs,
      offerCount: totalOffers,
      winRate: winRate,
      totalRfqs: totalRfqs,
      totalWon: totalWon
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.json({ rfqCount: 0, offerCount: 0, winRate: 0, totalRfqs: 0, totalWon: 0 });
  }
});

// === CONVERSATIONS ENDPOINT ===
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Otomatik olarak kullanıcının ürettiği sahte (mock) mailleri veritabanından temizle (Self-healing)
    try {
      if (userId) {
        await db.query("DELETE FROM pricing_actions WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_rates WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_carrier_performance WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1", [userId]);
      }
    } catch (dbErr) {
      console.warn('[DB CLEANUP WARNING] Sahte e-postalar temizlenemedi:', dbErr.message);
    }
    
    // RFQ'lardan konuşmaları oluştur — her sender_email bir konuşma
    const result = await db.query(`
      SELECT 
        r.id,
        r.sender_email,
        r.sender_name,
        r.subject,
        r.body,
        r.category,
        r.transport_mode,
        r.status,
        r.created_at,
        r.extracted_data,
        r.missing_fields,
        c.company_name as customer_company,
        c.id as customer_id,
        c.customer_type,
        c.active_regions
      FROM pricing_rfqs r
      LEFT JOIN pricing_customers c ON LOWER(c.email) = LOWER(r.sender_email) AND c.user_id = $1
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    
    // sender_email'e göre grupla → konuşma listesi oluştur
    const convMap = {};
    result.rows.forEach(row => {
      const email = row.sender_email;
      if (!convMap[email]) {
        const isCopilot = email === 'copilot@pruva.ai';
        const company = isCopilot ? 'Pruva AI Co-pilot' : (row.customer_company || row.sender_name || email.split('@')[0]);
        convMap[email] = {
          id: isCopilot ? 'copilot' : (row.customer_id || `rfq-${row.id}`),
          company: company,
          email: email,
          logoLetter: isCopilot ? '🤖' : company.charAt(0).toUpperCase(),
          logoBg: isCopilot ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : `hsl(${Math.abs(company.split('').reduce((a,c) => a + c.charCodeAt(0), 0)) % 360}, 60%, 50%)`,
          status: row.status,
          customerType: row.customer_type || 'unknown',
          regions: row.active_regions || [],
          messages: [],
          lastMessage: '',
          time: ''
        };
      }
      
      // Her RFQ'yu mesaj olarak ekle
      const isCopilot = email === 'copilot@pruva.ai';
      convMap[email].messages.push({
        sender: isCopilot ? 'Kullanıcı' : (row.sender_name || email),
        time: new Date(row.created_at).toLocaleString('tr-TR'),
        timestamp: new Date(row.created_at),
        type: isCopilot ? 'outgoing' : 'incoming',
        text: isCopilot ? row.subject : (row.subject + '\n' + (row.body || '').substring(0, 200))
      });
      
      // Son mesajı ve zamanı güncelle
      if (!convMap[email].time || new Date(row.created_at) > new Date(convMap[email].time)) {
        convMap[email].lastMessage = row.subject;
        convMap[email].time = new Date(row.created_at).toLocaleString('tr-TR', { 
          hour: '2-digit', minute: '2-digit' 
        });
        convMap[email].status = row.status;
      }
    });
    
    // İlgili action'ları da ekle
    const actions = await db.query(`
      SELECT a.*, r.sender_email 
      FROM pricing_actions a 
      JOIN pricing_rfqs r ON r.id = a.rfq_id 
      WHERE a.user_id = $1
      ORDER BY a.created_at ASC
    `, [userId]);
    
    actions.rows.forEach(action => {
      const conv = convMap[action.sender_email];
      if (conv) {
        let type = action.status === 'PENDING' ? 'ai_suggestion' : 'ai_action';
        let sender = 'Pruva AI';
        
        if (action.action_type === 'USER_MESSAGE') {
          type = 'outgoing';
          sender = 'Kullanıcı';
        } else if (action.action_type === 'AI_RESPONSE') {
          type = 'incoming';
          sender = 'Pruva AI';
        }

        conv.messages.push({
          sender: sender,
          time: new Date(action.created_at).toLocaleString('tr-TR'),
          timestamp: new Date(action.created_at),
          type: type,
          text: action.description || action.body || action.preview || action.subject,
          action: action.action_type || action.type,
          actionId: action.id,
          suggestedMail: action.suggested_mail
        });
      }
    });

    // Pinned Co-pilot kanalının her zaman var olmasını ve en tepede selamlama mesajıyla başlamasını garantileyelim
    if (!convMap['copilot@pruva.ai']) {
      convMap['copilot@pruva.ai'] = {
        id: 'copilot',
        company: 'Pruva AI Co-pilot',
        email: 'copilot@pruva.ai',
        logoLetter: '🤖',
        logoBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        status: 'COMPLETED',
        customerType: 'standard',
        regions: [],
        messages: [],
        lastMessage: 'Genel Komut & Yapay Zeka Sohbeti',
        time: ''
      };
    }

    const copilotConv = convMap['copilot@pruva.ai'];
    const hasGreeting = copilotConv.messages.some(m => m.text && m.text.includes('Ben Pruva AI Co-pilot'));
    if (!hasGreeting) {
      copilotConv.messages.unshift({
        sender: 'Pruva AI',
        time: 'Sistem',
        timestamp: new Date(0), // her zaman ilk mesaj olsun
        type: 'incoming',
        text: 'Merhaba! Ben Pruva AI Co-pilot. Bana dilediğiniz lojistik komutunu verebilirsiniz. Örneğin:<br><br>• <i>\'destek@pruvahub.com adresine [Firma Adı] adıyla tanıtım e-postası tasarla\'</i><br>• <i>\'Hamburg\'dan İzmir\'e TIR fiyatı al\'</i>'
      });
    }

    // Her konuşmanın mesajlarını zamana göre kronolojik sıralayalım
    Object.values(convMap).forEach(conv => {
      conv.messages.sort((a, b) => a.timestamp - b.timestamp);
    });
    
    res.json(Object.values(convMap));
  } catch (err) {
    console.error('Conversations error:', err);
    res.json([]);
  }
});

// === SEND EMAIL ENDPOINT ===
router.post('/send-email', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, cc, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Eksik parametreler (to, subject, body).' });
    }
    const { sendEmail } = require('../services/emailSender');
    const result = await sendEmail(userId, { to: Array.isArray(to) ? to : [to], cc: Array.isArray(cc) ? cc : (cc ? [cc] : []), subject, body });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'E-posta gönderilemedi.' });
  }
});

module.exports = router;
