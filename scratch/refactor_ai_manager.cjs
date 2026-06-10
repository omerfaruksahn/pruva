const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\components\\pruvaAiManager.js';
let content = fs.readFileSync(path, 'utf8');

// We will use standard english keys for variables:
// KONTEYNER_TİPİ -> CONTAINER_TYPE
// ADET -> QTY
// YÜKLEME_TARİHİ -> LOAD_DATE
// YÜK_CİNSİ -> CARGO_TYPE
// PAKET_ADEDI -> PKG_QTY
// HACIMSEL_AGIRLIK -> VOL_WEIGHT
// BOYUT -> DIMENSIONS
// UCUŞ_GÜZERGAHI -> FLIGHT_ROUTE
// ARAÇ_TİPİ -> TRUCK_TYPE
// GÜMRÜK_NOKTASI -> CUSTOMS
// GÜZERGAH -> ROUTE
// ARAÇ_ADEDI -> TRUCK_QTY
// TAŞIYICI_ADI -> CARRIER_NAME
// MÜŞTERİ_ADI -> CUSTOMER_NAME
// MÜŞTERİ_MAİL -> CUSTOMER_EMAIL
// NAVLUN_FİYATI -> FREIGHT_PRICE
// GEÇERLİLİK_SÜRESİ -> VALIDITY
// BEKLENEN_FİYAT -> TARGET_PRICE
// FARK -> DIFF
// ŞİRKET_ADI -> COMPANY_NAME
// İMZA -> SIGNATURE
// TARİH -> DATE
// BÖLGE -> REGION
// EKSİK_BİLGİLER -> MISSING_INFO
// MEVCUT_BİLGİLER -> AVAILABLE_INFO
// ARMATÖR -> SHIPOWNER

const keyMap = {
    'KONTEYNER_TİPİ': 'CONTAINER_TYPE',
    'ADET': 'QTY',
    'YÜKLEME_TARİHİ': 'LOAD_DATE',
    'YÜK_CİNSİ': 'CARGO_TYPE',
    'PAKET_ADEDI': 'PKG_QTY',
    'HACIMSEL_AGIRLIK': 'VOL_WEIGHT',
    'BOYUT': 'DIMENSIONS',
    'UCUŞ_GÜZERGAHI': 'FLIGHT_ROUTE',
    'ARAÇ_TİPİ': 'TRUCK_TYPE',
    'GÜMRÜK_NOKTASI': 'CUSTOMS',
    'GÜZERGAH': 'ROUTE',
    'ARAÇ_ADEDI': 'TRUCK_QTY',
    'TAŞIYICI_ADI': 'CARRIER_NAME',
    'MÜŞTERİ_ADI': 'CUSTOMER_NAME',
    'MÜŞTERİ_MAİL': 'CUSTOMER_EMAIL',
    'NAVLUN_FİYATI': 'FREIGHT_PRICE',
    'GEÇERLİLİK_SÜRESİ': 'VALIDITY',
    'BEKLENEN_FİYAT': 'TARGET_PRICE',
    'FARK': 'DIFF',
    'ŞİRKET_ADI': 'COMPANY_NAME',
    'İMZA': 'SIGNATURE',
    'TARİH': 'DATE',
    'BÖLGE': 'REGION',
    'EKSİK_BİLGİLER': 'MISSING_INFO',
    'MEVCUT_BİLGİLER': 'AVAILABLE_INFO',
    'ARMATÖR': 'SHIPOWNER'
};

for (const [trKey, enKey] of Object.entries(keyMap)) {
    const regex1 = new RegExp(`'${trKey}'`, 'g');
    content = content.replace(regex1, `'${enKey}'`);
    
    const regex2 = new RegExp(`{{${trKey}}}`, 'g');
    content = content.replace(regex2, `{{${enKey}}}`);
}

// Now replace this.DEFAULT_TEMPLATES = { ... } with a dynamic getter that fetches from i18n
// First, find the block.
const templateBlockStart = content.indexOf('this.DEFAULT_TEMPLATES = {');
const endOfConstructor = content.indexOf('        // 1. Olay Dinleyicileri', templateBlockStart);

const dynamicTemplates = `
        Object.defineProperty(this, 'DEFAULT_TEMPLATES', {
            get: () => {
                const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k, fallback) => fallback;
                return {
                    'fcl-request': {
                        name: t('ai_tpl.fcl_req_name', 'FCL Rate Request'),
                        subject: t('ai_tpl.fcl_req_sub', 'Rate Request – {{POL}} / {{POD}} – {{CONTAINER_TYPE}} x{{QTY}} – {{LOAD_DATE}}'),
                        body: t('ai_tpl.fcl_req_body', 'Sayın {{CARRIER_NAME}},\\n\\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\\n\\nPOL: {{POL}}\\nPOD: {{POD}}\\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\\nYükleme Tarihi: {{LOAD_DATE}}\\nIncoterm: {{INCOTERM}}\\nYük Cinsi: {{CARGO_TYPE}}\\n\\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\\n\\nTeşekkürler,\\n{{SIGNATURE}}')
                    },
                    'fcl-offer': {
                        name: t('ai_tpl.fcl_off_name', 'FCL Müşteri Teklifi'),
                        subject: t('ai_tpl.fcl_off_sub', 'Navlun Teklifi – {{POL}} / {{POD}} – {{CONTAINER_TYPE}} x{{QTY}}'),
                        body: t('ai_tpl.fcl_off_body', 'Sayın {{CUSTOMER_NAME}},\\n\\nTalebiniz doğrultusunda aşağıdaki navlun teklifini sunmaktayız:\\n\\nGüzergah: {{POL}} → {{POD}}\\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\\nYükleme Tarihi: {{LOAD_DATE}}\\nIncoterm: {{INCOTERM}}\\nNavlun (All-in): USD {{FREIGHT_PRICE}} / konteyner\\nFiyat Geçerliliği: {{VALIDITY}}\\n\\nSorularınız için her zaman ulaşabilirsiniz.\\n\\nSaygılarımızla,\\n{{SIGNATURE}}')
                    },
                    'fcl-negotiation': {
                        name: t('ai_tpl.fcl_neg_name', 'FCL Pazarlık'),
                        subject: t('ai_tpl.fcl_neg_sub', 'Re: Rate Request – {{POL}} / {{POD}} – Revize Talep'),
                        body: t('ai_tpl.fcl_neg_body', 'Sayın {{CARRIER_NAME}},\\n\\nVerdiğiniz fiyat için teşekkür ederiz. Ancak müşterimizin bütçesi doğrultusunda USD {{TARGET_PRICE}} seviyesinde revize talep ediyoruz.\\n\\nMevcut fiyatınız: USD {{FREIGHT_PRICE}}\\nBeklenen fiyat: USD {{TARGET_PRICE}}\\nFark: USD {{DIFF}}\\n\\nBu güzergahta düzenli yük potansiyelimiz bulunmaktadır. Revizenizi bekliyoruz.\\n\\nTeşekkürler,\\n{{SIGNATURE}}')
                    },
                    'fcl-followup': {
                        name: t('ai_tpl.fcl_fol_name', 'FCL Takip'),
                        subject: t('ai_tpl.fcl_fol_sub', 'Durum Sorgulama – {{POL}} / {{POD}} – {{CONTAINER_TYPE}}'),
                        body: t('ai_tpl.fcl_fol_body', 'Sayın {{CARRIER_NAME}},\\n\\nGeçtiğimiz günlerde ilettiğimiz {{POL}} - {{POD}} talebimizle ilgili fiyat çalışmanız tamamlandı mı?\\n\\nMüşterimizden acil dönüş bekliyoruz, navlunu bugün iletebilirseniz çok seviniriz.\\n\\nİyi çalışmalar,\\n{{SIGNATURE}}')
                    },
                    'common': {
                        name: t('ai_tpl.common_name', 'Ortak Şablon'),
                        subject: t('ai_tpl.common_sub', 'Talep – {{POL}} / {{POD}}'),
                        body: t('ai_tpl.common_body', 'Sayın İlgili,\\n\\nAşağıdaki detaylara istinaden fiyat çalışmanızı rica ederiz.\\n\\nPOL: {{POL}}\\nPOD: {{POD}}\\n\\nTeşekkürler,\\n{{SIGNATURE}}')
                    }
                };
            }
        });
`;

content = content.substring(0, templateBlockStart) + dynamicTemplates + content.substring(endOfConstructor);

// Same for variableLabels
const labelBlockStart = content.indexOf('this.variableLabels = {');
const nextBlockStart = content.indexOf('this.demoData = {', labelBlockStart);

const dynamicLabels = `
        Object.defineProperty(this, 'variableLabels', {
            get: () => {
                const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k, fallback) => fallback;
                return {
                    'POL': t('ai_tpl.lbl_pol', 'Yükleme Limanı (POL)'),
                    'POD': t('ai_tpl.lbl_pod', 'Varış Limanı (POD)'),
                    'CONTAINER_TYPE': t('ai_tpl.lbl_cont', 'Konteyner Tipi (Örn: 20DC, 40HC)'),
                    'QTY': t('ai_tpl.lbl_qty', 'Adet'),
                    'LOAD_DATE': t('ai_tpl.lbl_load_date', 'Yükleme Tarihi'),
                    'INCOTERM': t('ai_tpl.lbl_incoterm', 'Teslim Şekli (Incoterm)'),
                    'CARGO_TYPE': t('ai_tpl.lbl_cargo', 'Yük Cinsi'),
                    'CBM': t('ai_tpl.lbl_cbm', 'Hacim (CBM)'),
                    'PKG_QTY': t('ai_tpl.lbl_pkg_qty', 'Paket Adedi'),
                    'VOL_WEIGHT': t('ai_tpl.lbl_vol_weight', 'Hacimsel Ağırlık (Air)'),
                    'DIMENSIONS': t('ai_tpl.lbl_dim', 'Boyutlar'),
                    'FLIGHT_ROUTE': t('ai_tpl.lbl_flight', 'Uçuş Parkuru'),
                    'TRUCK_TYPE': t('ai_tpl.lbl_truck_type', 'Araç Tipi'),
                    'LDM': t('ai_tpl.lbl_ldm', 'Yükleme Metresi (LDM)'),
                    'KG': t('ai_tpl.lbl_kg', 'Ağırlık (KG)'),
                    'CUSTOMS': t('ai_tpl.lbl_customs', 'Gümrük Noktası'),
                    'ROUTE': t('ai_tpl.lbl_route', 'Güzergah'),
                    'TRUCK_QTY': t('ai_tpl.lbl_truck_qty', 'Araç Adedi')
                };
            }
        });
`;
content = content.substring(0, labelBlockStart) + dynamicLabels + content.substring(nextBlockStart);

// Same for categoryMap
const catBlockStart = content.indexOf('const categoriesMap = {');
const nextCatBlock = content.indexOf('Object.keys(grouped).forEach', catBlockStart);
if (catBlockStart !== -1) {
    const dynamicCats = `
        const categoriesMap = {
            'armator': window.i18n ? window.i18n.t('ai_tpl.cat_armator', 'Armatör') : 'Armatör',
            'acente': window.i18n ? window.i18n.t('ai_tpl.cat_agency', 'Acente'),
            'hava': window.i18n ? window.i18n.t('ai_tpl.cat_air', 'Hava Nakliye'),
            'kara': window.i18n ? window.i18n.t('ai_tpl.cat_road', 'Kara Nakliye')
        };
`;
    // We'll just replace the specific text
    content = content.replace(/const categoriesMap = {[\s\S]*?'kara': 'Kara Nakliye'\s*};/m, dynamicCats);
}

fs.writeFileSync(path, content, 'utf8');
console.log('pruvaAiManager.js refactored successfully.');
