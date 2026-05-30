const fs = require('fs');
const path = require('path');

const files = [
    'js/components/chatManager.js',
    'js/services/firestoreService.js'
];

files.forEach(f => {
    const fullPath = path.join('c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site', f);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        console.log(`=== ${f} ===`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('adId') || line.includes('createChat') || line.includes('getChat') || line.includes('participants')) {
                console.log(`${idx + 1}: ${line.trim()}`);
            }
        });
    }
});
