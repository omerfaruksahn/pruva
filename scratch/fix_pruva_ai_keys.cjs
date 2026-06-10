const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const sourceFile = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain\\90777918-4c45-41dc-a584-b7616ffb2fb2\\scratch\\translations_pruvaAi.js.json';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

if (fs.existsSync(sourceFile)) {
    const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    
    langs.forEach(lang => {
        const localePath = path.join(localesDir, `${lang}.json`);
        if (fs.existsSync(localePath)) {
            let localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
            
            // Ensure pruva_ai object exists
            if (!localeData.pruva_ai || typeof localeData.pruva_ai === 'string') {
                localeData.pruva_ai = {};
            }
            
            // Move keys from sourceData[lang] into localeData.pruva_ai
            if (sourceData[lang]) {
                for (const [key, value] of Object.entries(sourceData[lang])) {
                    localeData.pruva_ai[key] = value;
                    
                    // Optionally, remove the polluted root key if it exists
                    if (localeData[key] === value) {
                        delete localeData[key];
                    }
                }
            }
            
            fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
            console.log(`Fixed pruva_ai keys in ${lang}.json`);
        }
    });
} else {
    console.error('Source file not found!');
}
