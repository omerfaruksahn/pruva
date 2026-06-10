const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const subagentScratchDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\brain\\ce41107e-0ec2-4f9f-8475-710974900d15\\scratch';

const jsonFiles = [
    'translations_postAdManager.js.json',
    'translations_marketplaceManager.js.json',
    'translations_operationModal.js.json',
    'translations_bidModal.js.json'
];

const langs = ['tr', 'en', 'zh', 'ru', 'es'];

langs.forEach(lang => {
    const localePath = path.join(localesDir, `${lang}.json`);
    let localeData = {};
    if (fs.existsSync(localePath)) {
        localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    }

    jsonFiles.forEach(file => {
        const filePath = path.join(subagentScratchDir, file);
        if (fs.existsSync(filePath)) {
            const subData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (subData[lang]) {
                const mergeDeep = (target, source) => {
                    for (const k in source) {
                        if (source[k] instanceof Object && key in target) {
                            Object.assign(source[k], mergeDeep(target[k], source[k]));
                        }
                    }
                    Object.assign(target || {}, source);
                    return target;
                };
                
                Object.keys(subData[lang]).forEach(key => {
                    if (typeof subData[lang][key] === 'object') {
                        localeData[key] = localeData[key] || {};
                        mergeDeep(localeData[key], subData[lang][key]);
                    } else {
                        const parts = key.split('.');
                        let current = localeData;
                        for (let i = 0; i < parts.length - 1; i++) {
                            current[parts[i]] = current[parts[i]] || {};
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = subData[lang][key];
                    }
                });
            }
        }
    });

    fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    console.log(`Merged translations into ${lang}.json`);
});
