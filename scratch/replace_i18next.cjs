const fs = require('fs');
const path = require('path');

const jsDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js';

function walkAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndReplace(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('window.i18next')) {
                console.log(`Replacing window.i18next in ${file}`);
                content = content.replace(/window\.i18next/g, 'window.i18n');
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

walkAndReplace(jsDir);
console.log('All window.i18next occurrences replaced.');
