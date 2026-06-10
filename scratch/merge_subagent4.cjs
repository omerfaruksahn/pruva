const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const subagentScratchDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\brain\\c79dffc7-a2bc-449b-bd6c-f6e4d6f2fbb8\\scratch';

const jsonFiles = [
    'translations_profileTab.json',
    'translations_companyTab.json',
    'translations_notificationsTab.json',
    'translations_securityTab.json'
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
                // Merge keys
                Object.keys(subData[lang]).forEach(key => {
                    // key might be "settings.profile.xxx", we can just put it at root or expand it
                    // The easiest is to just inject it at root or as nested
                    // Let's assume subData[lang] is flat: { "settings.profile.xxx": "yyy" } or nested { "settings": { ... } }
                    // Actually, if it's flat, let's expand it or just merge it directly depending on structure
                    const mergeDeep = (target, source) => {
                        for (const k in source) {
                            if (source[k] instanceof Object && key in target) {
                                Object.assign(source[k], mergeDeep(target[k], source[k]));
                            }
                        }
                        Object.assign(target || {}, source);
                        return target;
                    };
                    
                    // Simple deep merge
                    if (typeof subData[lang][key] === 'object') {
                        localeData[key] = localeData[key] || {};
                        mergeDeep(localeData[key], subData[lang][key]);
                    } else {
                        // if it's flat like "settings.profile.name": "İsim"
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
