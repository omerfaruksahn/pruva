const fs = require('fs');

// 1. Fix the remaining [placeholder]/[title] double prefixes in pricingSettings.js
const htmlPath = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/\[(placeholder|title)\]pricing_settings\.pricing_settings\./g, '[$1]pricing_settings.');
fs.writeFileSync(htmlPath, html, 'utf8');

// 2. Add missing keys to translation files
const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const missingEn = {
    "system_control_panel": "System Control Panel",
    "return_pruva_ai": "Return to Pruva AI",
    "category": "CATEGORY",
    "region_africa": "Africa",
    "clear": "Clear",
    "registered_carriers": "Registered Carriers & Agencies",
    "registered_carriers_desc": "List of agencies and lines to send automated rate inquiries",
    "company_name_placeholder": "e.g., MSC, Maersk..."
};

const missingTr = {
    "system_control_panel": "Sistem Kontrol Paneli",
    "return_pruva_ai": "Pruva AI Ekranına Dön",
    "category": "KATEGORİ",
    "region_africa": "Afrika",
    "clear": "Temizle",
    "registered_carriers": "Kayıtlı Taşıyıcı ve Acenteler",
    "registered_carriers_desc": "Otomatik rate sorgulamaları gönderilecek acente ve hatların listesi",
    "company_name_placeholder": "Örn: MSC, Mars Lojistik..."
};

const missingOther = {
    "system_control_panel": "System Control Panel",
    "return_pruva_ai": "Return to Pruva AI",
    "category": "CATEGORY",
    "region_africa": "Africa",
    "clear": "Clear",
    "registered_carriers": "Registered Carriers & Agencies",
    "registered_carriers_desc": "List of agencies and lines to send automated rate inquiries",
    "company_name_placeholder": "e.g., MSC, Maersk..."
};

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
for (const file of files) {
    const filePath = require('path').join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.pricing_settings) data.pricing_settings = {};

    let toAdd = missingOther;
    if (file === 'en.json') toAdd = missingEn;
    else if (file === 'tr.json') toAdd = missingTr;

    for (const [k, v] of Object.entries(toAdd)) {
        if (!data.pricing_settings[k]) {
            data.pricing_settings[k] = v;
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Missing keys appended to JSON and placeholders fixed.');
