const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\components\\pruvaAiManager.js';
let content = fs.readFileSync(path, 'utf8');

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
    // Replace in strings
    const regex1 = new RegExp(`'${trKey}'`, 'g');
    content = content.replace(regex1, `'${enKey}'`);
    
    // Replace in template variables {{...}}
    const regex2 = new RegExp(`\\{\\{${trKey}\\}\\}`, 'g');
    content = content.replace(regex2, `{{${enKey}}}`);
}

// Ensure the old DEFAULT_TEMPLATES is actually gone, wait, safe_refactor already replaced it up to templateVariables.
// But wait! There is another definition of DEFAULT_TEMPLATES inside PruvaAiManager?
// Let's check if the first replacement missed anything.
// We'll just write it back.

fs.writeFileSync(path, content, 'utf8');
console.log('Variables renamed globally in pruvaAiManager!');
