const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\components\\pruvaAiManager.js';
let content = fs.readFileSync(path, 'utf8');

const dynamicCode = `
        // Varsayılan Değerler
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

        Object.defineProperty(this, 'variableLabels', {
            get: () => {
                const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k, fallback) => fallback;
                return {
                    'POL': t('ai_tpl.lbl_pol', 'Yükleme Limanı (POL)'),
                    'POD': t('ai_tpl.lbl_pod', 'Varış Limanı (POD)'),
                    'CONTAINER_TYPE': t('ai_tpl.lbl_cont', 'Konteyner Tipi'),
                    'QTY': t('ai_tpl.lbl_qty', 'Adet'),
                    'LOAD_DATE': t('ai_tpl.lbl_load_date', 'Yükleme Tarihi'),
                    'INCOTERM': t('ai_tpl.lbl_incoterm', 'Incoterm'),
                    'CARGO_TYPE': t('ai_tpl.lbl_cargo', 'Yük Cinsi'),
                    'CBM': t('ai_tpl.lbl_cbm', 'Hacim (CBM)'),
                    'PKG_QTY': t('ai_tpl.lbl_pkg_qty', 'Paket Adedi'),
                    'VOL_WEIGHT': t('ai_tpl.lbl_vol_weight', 'Hacimsel Ağırlık'),
                    'DIMENSIONS': t('ai_tpl.lbl_dim', 'Boyutlar'),
                    'FLIGHT_ROUTE': t('ai_tpl.lbl_flight', 'Uçuş Parkuru'),
                    'TRUCK_TYPE': t('ai_tpl.lbl_truck_type', 'Araç Tipi'),
                    'LDM': t('ai_tpl.lbl_ldm', 'LDM'),
                    'KG': t('ai_tpl.lbl_kg', 'KG'),
                    'CUSTOMS': t('ai_tpl.lbl_customs', 'Gümrük'),
                    'ROUTE': t('ai_tpl.lbl_route', 'Güzergah'),
                    'TRUCK_QTY': t('ai_tpl.lbl_truck_qty', 'Araç Adedi')
                };
            }
        });

        this.templateVariables = {
            fcl: ['POL', 'POD', 'CONTAINER_TYPE', 'QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
            lcl: ['POL', 'POD', 'CBM', 'KG', 'PKG_QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
            air: ['POL', 'POD', 'KG', 'VOL_WEIGHT', 'DIMENSIONS', 'PKG_QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
            road: ['POL', 'POD', 'TRUCK_TYPE', 'KG', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE']
        };
`;

// Find where this.DEFAULT_TEMPLATES is defined and replace it entirely up to this.templateVariables definition end.
const startStr = '// Varsayılan Değerler';
const startIndex = content.indexOf(startStr);
const endStr = '};'; // end of templateVariables
const templateVarsStart = content.indexOf('this.templateVariables = {', startIndex);
const endIndex = content.indexOf(endStr, templateVarsStart) + endStr.length;

if (startIndex !== -1 && templateVarsStart !== -1) {
    content = content.substring(0, startIndex) + dynamicCode + content.substring(endIndex);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed pruvaAiManager.js safely!');
