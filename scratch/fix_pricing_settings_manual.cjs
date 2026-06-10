const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js';
let content = fs.readFileSync(path, 'utf8');

// Fix the double prefix created by the previous script
content = content.replace(/data-i18n="pricing_settings\.pricing_settings\./g, 'data-i18n="pricing_settings.');

// Manually fix the ones that failed to match due to text discrepancies
content = content.replace(/data-i18n="pricing_settings\.hero_title"/g, 'data-i18n="pricing_settings.title"');
content = content.replace(/data-i18n="pricing_settings\.hero_desc"/g, 'data-i18n="pricing_settings.subtitle"');
content = content.replace(/data-i18n="pricing_settings\.add_new_carrier"/g, 'data-i18n="pricing_settings.add_carrier"');
content = content.replace(/data-i18n="pricing_settings\.preference_score"/g, 'data-i18n="pricing_settings.star_rating"');
content = content.replace(/data-i18n="pricing_settings\.cat_armator"/g, 'data-i18n="pricing_settings.cat_shipowner"');
content = content.replace(/data-i18n="pricing_settings\.cat_agent"/g, 'data-i18n="pricing_settings.cat_agency"');
content = content.replace(/data-i18n="pricing_settings\.active_regions"/g, 'data-i18n="pricing_settings.service_regions"');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed pricingSettings.js manually!');
