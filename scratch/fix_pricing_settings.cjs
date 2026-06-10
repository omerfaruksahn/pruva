const fs = require('fs');

const trJson = JSON.parse(fs.readFileSync('c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales\\tr.json', 'utf8'));
const pricingKeys = trJson.pricing_settings;

let content = fs.readFileSync('c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js', 'utf8');

// Reverse map: value -> key
const valueToKey = {};
for (const [k, v] of Object.entries(pricingKeys)) {
    // Normalize string for better matching
    const normValue = v.toString().trim().replace(/\s+/g, ' ').toLowerCase();
    valueToKey[normValue] = k;
}

// 1. Fix innerHTML strings: data-i18n="pricing_settings.old_key">Turkish Text<
content = content.replace(/data-i18n="pricing_settings\.([^"]+)"([^>]*)>([^<]+)</g, (match, oldKey, rest, text) => {
    const normText = text.trim().replace(/\s+/g, ' ').toLowerCase();
    if (valueToKey[normText]) {
        const correctKey = valueToKey[normText];
        if (oldKey !== correctKey) {
            console.log(`Fixing text: "${text}" | ${oldKey} -> ${correctKey}`);
            return `data-i18n="pricing_settings.${correctKey}"${rest}>${text}<`;
        }
    }
    return match;
});

// 2. Fix placeholders: data-i18n="[placeholder]pricing_settings.old_key" placeholder="Turkish Text"
// Note: order might be placeholder="..." then data-i18n="..." or vice versa.
// Let's use a simpler regex that just finds the data-i18n attribute, then looks at the whole tag to find the placeholder or title.
content = content.replace(/<[^>]+data-i18n="\[(placeholder|title)\]pricing_settings\.([^"]+)"[^>]+>/g, (match, attrType, oldKey) => {
    // extract the actual attribute value (placeholder="..." or title="...")
    const attrRegex = new RegExp(`${attrType}="([^"]+)"`);
    const attrMatch = match.match(attrRegex);
    if (attrMatch) {
        const text = attrMatch[1];
        const normText = text.trim().replace(/\s+/g, ' ').toLowerCase();
        if (valueToKey[normText]) {
            const correctKey = valueToKey[normText];
            if (oldKey !== correctKey) {
                console.log(`Fixing ${attrType}: "${text}" | ${oldKey} -> ${correctKey}`);
                return match.replace(`pricing_settings.${oldKey}`, `pricing_settings.${correctKey}`);
            }
        }
    }
    return match;
});

// Also add window.i18n.updateDOM() to the end of all render functions
const renderFunctions = [
    'renderCarriersList = () => {',
    'renderTemplatesList = () => {',
    'renderMarginsList = () => {',
    'renderCustomersList = () => {',
    'renderHistoryList = async () => {'
];

// To insert updateDOM safely at the end of the functions, we can hook into the places where the innerHTML is set.
// For example:
// document.getElementById('sett-carriers-list-container').innerHTML = html;
// Replace with: document.getElementById('...').innerHTML = html; if(window.i18n) window.i18n.updateDOM();
content = content.replace(/(container\.innerHTML\s*=\s*html;)/g, '$1\n        if (window.i18n) window.i18n.updateDOM();');
content = content.replace(/(tbody\.innerHTML\s*=\s*html;)/g, '$1\n        if (window.i18n) window.i18n.updateDOM();');
content = content.replace(/(container\.innerHTML\s*=\s*'';)/g, '$1\n        if (window.i18n) window.i18n.updateDOM();');


fs.writeFileSync('c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js', content, 'utf8');
console.log('Fix applied to pricingSettings.js!');
