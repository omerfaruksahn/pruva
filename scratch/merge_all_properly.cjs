const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain';
const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

// Map of filename to the correct nested path
const prefixMap = {
    'translations_inbox.js.json': ['inbox'],
    'translations_pricingActions.js.json': ['pricing_actions'],
    'translations_pricingSettings.js.json': ['pricing_settings'],
    'translations_navbarComponent.js.json': ['navbar'],
    'translations_utils.js.json': ['utils'],
    'translations_bidModal.js.json': ['comp', 'bid'],
    'translations_marketplaceManager.js.json': ['market'],
    'translations_operationModal.js.json': ['comp', 'operation'],
    'translations_postAdManager.js.json': ['post_ad']
};

function setNestedValue(obj, pathArr, key, value) {
    let current = obj;
    for (let i = 0; i < pathArr.length; i++) {
        if (!current[pathArr[i]]) current[pathArr[i]] = {};
        current = current[pathArr[i]];
    }
    current[key] = value;
}

function findAndMerge(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndMerge(fullPath);
        } else if (prefixMap[file]) {
            console.log(`Processing ${file}`);
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            const prefixArr = prefixMap[file];
            
            langs.forEach(lang => {
                if (data[lang]) {
                    const localePath = path.join(localesDir, `${lang}.json`);
                    if (fs.existsSync(localePath)) {
                        const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
                        for (const [k, v] of Object.entries(data[lang])) {
                            setNestedValue(localeData, prefixArr, k, v);
                            // Also try to delete from root if polluted
                            if (localeData[k] === v) delete localeData[k];
                        }
                        fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
                    }
                }
            });
        }
    }
}

findAndMerge(brainDir);
console.log('All missing translations merged successfully!');
