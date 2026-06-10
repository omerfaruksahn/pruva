const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let modified = false;

    // Traverse first level
    for (const [namespace, obj] of Object.entries(data)) {
        if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
                if (key.includes('.')) {
                    // This is a duplicate/broken key like "pricing_settings.add_carrier" inside "pricing_settings"
                    console.log(`[${file}] Deleting duplicate nested key: ${namespace}['${key}']`);
                    delete obj[key];
                    modified = true;
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Saved cleaned ${file}`);
    }
}
