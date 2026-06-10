const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js';
const htmlDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site';

// Regex for Turkish-specific letters: ı ğ ş ö ç İ Ğ Ş Ö Ç
// We'll also catch typical UI text patterns inside tags or quotes
const turkishRegex = /[ığşöçİĞŞÖÇ]/;

function scanDir(dir, results = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'locales') {
                scanDir(fullPath, results);
            }
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (turkishRegex.test(line)) {
                    // Ignore comments
                    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
                    // Ignore i18n.t() calls if they somehow have turkish
                    // Ignore logs
                    if (line.includes('console.log') || line.includes('console.error')) return;
                    // Ignore predefined data structures if they are just dictionaries
                    if (fullPath.includes('logisticsKnowledge.js') || fullPath.includes('pricingData.js')) return;
                    
                    results.push({ file: fullPath.replace(srcDir, '').replace(htmlDir, ''), line: i + 1, text: line.trim() });
                }
            });
        }
    }
    return results;
}

const res = scanDir(htmlDir);
// Output up to 100 matches to avoid flooding
console.log(`Found ${res.length} lines with Turkish characters (excluding comments/logs/data).`);
res.slice(0, 100).forEach(r => console.log(`${r.file}:${r.line} -> ${r.text}`));
