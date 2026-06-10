const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js';
const content = fs.readFileSync(path, 'utf8');

const enJson = JSON.parse(fs.readFileSync('c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales\\en.json', 'utf8'));

const missing = [];

// 1. Text content
const regex = /data-i18n="pricing_settings\.([^"]+)"([^>]*)>([^<]+)</g;
let match;
while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const text = match[3].trim();
    if (!enJson.pricing_settings[key]) {
        missing.push({ key, text });
    }
}

// 2. Attributes (placeholder, title)
const attrRegex = /<[^>]+data-i18n="\[(placeholder|title)\]pricing_settings\.([^"]+)"[^>]+>/g;
while ((match = attrRegex.exec(content)) !== null) {
    const attrType = match[1];
    const key = match[2];
    if (!enJson.pricing_settings[key]) {
        // find the actual value of placeholder="..."
        const valRegex = new RegExp(`${attrType}="([^"]+)"`);
        const valMatch = match[0].match(valRegex);
        if (valMatch) {
            missing.push({ key, text: valMatch[1] });
        }
    }
}

console.log(JSON.stringify(missing, null, 2));
