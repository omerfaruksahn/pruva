const fs = require('fs');
const path = require('path');

const targetDirs = [
    'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views',
    'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\components',
    'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\router',
    'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\index.html'
];

const turkishRegex = /[ığşöçüİĞŞÖÇÜ]/;

const ignoreList = [
    'data-i18n',
    'window.i18n',
    'console.log',
    'console.error',
    'console.warn',
    'showToast', // Toast messages might be OK for now, but let's see them if we want
];

let totalFound = 0;

function scanPath(p) {
    if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).forEach(file => {
            scanPath(path.join(p, file));
        });
    } else if (p.endsWith('.js') || p.endsWith('.html')) {
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        
        let foundInFile = false;
        
        lines.forEach((line, i) => {
            if (turkishRegex.test(line)) {
                const trimmed = line.trim();
                // ignore comments
                if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) return;
                
                // check ignore list
                if (ignoreList.some(ig => trimmed.includes(ig))) return;
                
                if (!foundInFile) {
                    console.log(`\n=== ${p} ===`);
                    foundInFile = true;
                }
                
                console.log(`Line ${i + 1}: ${trimmed}`);
                totalFound++;
            }
        });
    }
}

targetDirs.forEach(scanPath);
console.log(`\nTotal potentially untranslated lines found: ${totalFound}`);
