const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const brainDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\brain';

const langs = ['tr', 'en', 'zh', 'ru', 'es'];

// Helper to find all translations_*.json files in the brain directory recursively
function findTranslationFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findTranslationFiles(fullPath, fileList);
        } else if (file.startsWith('translations_') && file.endsWith('.json')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const translationFiles = findTranslationFiles(brainDir);
console.log(`Found ${translationFiles.length} translation files.`);

const mergeDeep = (target, source) => {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
};

langs.forEach(lang => {
    const localePath = path.join(localesDir, `${lang}.json`);
    let localeData = {};
    if (fs.existsSync(localePath)) {
        localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    }

    translationFiles.forEach(filePath => {
        try {
            const subData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (subData[lang]) {
                Object.keys(subData[lang]).forEach(key => {
                    if (typeof subData[lang][key] === 'object') {
                        localeData[key] = localeData[key] || {};
                        mergeDeep(localeData[key], subData[lang][key]);
                    } else {
                        const parts = key.split('.');
                        let current = localeData;
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) {
                                current[parts[i]] = {};
                            }
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = subData[lang][key];
                    }
                });
            }
        } catch (e) {
            console.error(`Error reading or parsing ${filePath}:`, e);
        }
    });

    fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    console.log(`Merged translations into ${lang}.json`);
});
