const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../authMiddleware');

// ─────────────────────────────────────────────
// 1. BEKLEYEN AKSİYONLAR VE RFQ'LAR
// ─────────────────────────────────────────────

// @route   GET api/pricing/actions
// @desc    Kullanıcının bekleyen (PENDING) tüm AI aksiyonlarını getirir
router.get('/actions', auth, async (req, res) => {
    try {
        const query = `
            SELECT pa.id, pa.rfq_id, pa.action_type as type, pa.title, pa.description, 
                   pa.suggested_mail, pa.carriers_to_contact as carriers, 
                   pr.sender_name as "from", pr.subject as mail_subject, pr.body as mail_body,
                   pr.transport_mode, pr.extracted_data
            FROM pricing_actions pa
            INNER JOIN pricing_rfqs pr ON pa.rfq_id = pr.id
            WHERE pa.user_id = $1 AND pa.status = 'PENDING'
            ORDER BY pa.created_at DESC;
        `;
        const result = await db.query(query, [req.user.id]);

        // Frontend formatına map et
        const actions = result.rows.map(row => {
            const suggestedMail = typeof row.suggested_mail === 'string' 
                ? JSON.parse(row.suggested_mail) 
                : row.suggested_mail;
            
            const carriers = typeof row.carriers === 'string' 
                ? JSON.parse(row.carriers) 
                : row.carriers;

            const extracted = typeof row.extracted_data === 'string' 
                ? JSON.parse(row.extracted_data) 
                : row.extracted_data;

            const routeStr = extracted && extracted.origin && extracted.destination 
                ? `${extracted.origin} → ${extracted.destination}` 
                : 'Güzergah Belirsiz';

            return {
                id: row.id,
                rfq_id: row.rfq_id,
                type: row.type,
                transport_mode: row.transport_mode,
                from: row.from,
                route: routeStr,
                subject: suggestedMail ? suggestedMail.subject : row.mail_subject,
                preview: suggestedMail ? suggestedMail.body.substring(0, 80) + '...' : row.mail_body.substring(0, 80) + '...',
                body: suggestedMail ? suggestedMail.body : row.mail_body,
                carriers: carriers ? carriers.map(c => c.name || c) : [],
                status: 'PENDING'
            };
        });

        res.json(actions);
    } catch (err) {
        console.error('[GET ACTIONS ERR]', err);
        res.status(500).json({ error: 'Bekleyen aksiyonlar getirilemedi.' });
    }
});

// @route   GET api/pricing/rfqs
// @desc    Kullanıcının tüm taranan RFQ taleplerini getirir
router.get('/rfqs', auth, async (req, res) => {
    try {
        const query = `
            SELECT id, received_at, sender_name as company, subject, transport_mode, status, extracted_data
            FROM pricing_rfqs
            WHERE user_id = $1
            ORDER BY received_at DESC;
        `;
        const result = await db.query(query, [req.user.id]);

        // Frontend formatına map et
        const rfqs = result.rows.map(row => {
            const extracted = typeof row.extracted_data === 'string' 
                ? JSON.parse(row.extracted_data) 
                : row.extracted_data;

            const routeStr = extracted && extracted.origin && extracted.destination 
                ? `${extracted.origin} → ${extracted.destination}` 
                : 'Güzergah Belirsiz';

            let modeText = 'Deniz FCL';
            if (row.transport_mode === 'DENIZ_LCL') modeText = 'Deniz LCL';
            else if (row.transport_mode === 'HAVA') modeText = 'Hava';
            else if (row.transport_mode === 'KARA') modeText = 'Kara';

            const dateStr = row.received_at 
                ? new Date(row.received_at).toLocaleDateString('tr-TR') 
                : '29.05.2026';

            return {
                id: row.id,
                date: dateStr,
                company: row.company || 'Bilinmeyen Firma',
                route: routeStr,
                mode: modeText,
                status: row.status
            };
        });

        res.json(rfqs);
    } catch (err) {
        console.error('[GET RFQS ERR]', err);
        res.status(500).json({ error: 'Talepler listesi getirilemedi.' });
    }
});

// ─────────────────────────────────────────────
// 2. AKSİYON ONAY/RED VE FİYATLAR
// ─────────────────────────────────────────────

// @route   POST api/pricing/actions/:id/approve
// @desc    Aksiyonu onaylar (E-posta gönderimi simüle edilir, durum güncellenir)
router.post('/actions/:id/approve', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { edited_subject, edited_body, selected_carriers } = req.body;

        // 1. Aksiyon detaylarını al ve doğrula
        const actionResult = await db.query(
            'SELECT rfq_id, action_type, user_id FROM pricing_actions WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (actionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Aksiyon bulunamadı.' });
        }

        const { rfq_id, action_type } = actionResult.rows[0];

        // 2. Simüle mail gönderimi (Console Log)
        console.log(`\n==================================================`);
        console.log(`[EXPRESS BACKEND - PRICING AI] AKSİYON ONAYLANDI VE GÖNDERİLDİ`);
        console.log(`Aksiyon ID: ${id} | RFQ ID: ${rfq_id}`);
        console.log(`Tipi: ${action_type}`);
        console.log(`Gönderilen Taşıyıcılar: ${selected_carriers ? selected_carriers.join(', ') : 'Müşteri'}`);
        console.log(`E-posta Konusu: ${edited_subject}`);
        console.log(`E-posta İçeriği:\n"""\n${edited_body}\n"""`);
        console.log(`==================================================\n`);

        // 3. Aksiyon durumunu 'COMPLETED' yap ve düzenlenen mail içeriğini kaydet
        const actionCheck = await db.query(
            'SELECT suggested_mail FROM pricing_actions WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        let suggestedMail = {};
        if (actionCheck.rows.length > 0 && actionCheck.rows[0].suggested_mail) {
            suggestedMail = typeof actionCheck.rows[0].suggested_mail === 'string'
                ? JSON.parse(actionCheck.rows[0].suggested_mail)
                : actionCheck.rows[0].suggested_mail;
        }
        suggestedMail.subject = edited_subject || suggestedMail.subject || '';
        suggestedMail.body = edited_body || suggestedMail.body || '';

        await db.query(
            'UPDATE pricing_actions SET status = \'COMPLETED\', suggested_mail = $1 WHERE id = $2 AND user_id = $3',
            [JSON.stringify(suggestedMail), id, req.user.id]
        );

        // 4. İlgili RFQ'nun durumunu aksiyon tipine göre güncelle
        let rfqStatus = 'RATES_REQUESTED';
        if (action_type === 'SEND_MISSING_INFO') rfqStatus = 'MISSING_INFO_SENT';
        else if (action_type === 'SEND_OFFER') rfqStatus = 'OFFER_SENT';

        await db.query(
            'UPDATE pricing_rfqs SET status = $1 WHERE id = $2 AND user_id = $3',
            [rfqStatus, rfq_id, req.user.id]
        );

        res.json({ success: true, message: 'Aksiyon başarıyla onaylandı ve gönderildi.' });
    } catch (err) {
        console.error('[APPROVE ACTION ERR]', err);
        res.status(500).json({ error: 'Aksiyon onaylanırken hata oluştu.' });
    }
});

// @route   POST api/pricing/actions/:id/reject
// @desc    Aksiyonu reddeder
router.post('/actions/:id/reject', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Aksiyon detaylarını al ve doğrula
        const actionResult = await db.query(
            'SELECT rfq_id FROM pricing_actions WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (actionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Aksiyon bulunamadı.' });
        }

        // 2. Aksiyon durumunu 'CANCELLED' (Reddedildi) yap
        await db.query(
            'UPDATE pricing_actions SET status = \'CANCELLED\' WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        res.json({ success: true, message: 'Aksiyon reddedildi.' });
    } catch (err) {
        console.error('[REJECT ACTION ERR]', err);
        res.status(500).json({ error: 'Aksiyon reddedilirken hata oluştu.' });
    }
});

// @route   GET api/pricing/rates/:rfqId
// @desc    Bir RFQ talebi için alınan tüm fiyat tekliflerini (rates) getirir
router.get('/rates/:rfqId', auth, async (req, res) => {
    try {
        const { rfqId } = req.params;
        const query = `
            SELECT id, carrier_name, extracted_price, currency, price_per, validity_date, status, received_at
            FROM pricing_rates
            WHERE rfq_id = $1
            ORDER BY extracted_price ASC;
        `;
        const result = await db.query(query, [rfqId]);
        res.json(result.rows);
    } catch (err) {
        console.error('[GET RATES ERR]', err);
        res.status(500).json({ error: 'Fiyatlar getirilemedi.' });
    }
});

module.exports = router;
