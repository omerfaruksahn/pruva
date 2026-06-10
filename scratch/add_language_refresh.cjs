const fs = require('fs');
const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\components\\pruvaAiManager.js';
let content = fs.readFileSync(path, 'utf8');

const listenerCode = `
        // Dil değiştiğinde şablonları anında yeni dile göre sıfırla
        window.addEventListener('languageChanged', () => {
            if (this.DEFAULT_TEMPLATES) {
                this.templates = JSON.parse(JSON.stringify(this.DEFAULT_TEMPLATES));
                if (typeof this.renderTemplates === 'function') {
                    this.renderTemplates();
                }
                if (this.activeTemplateKey && typeof this.selectTemplate === 'function') {
                    this.selectTemplate(this.activeTemplateKey);
                }
            }
        });
`;

// Insert it right after this.activeStarsForm = 5;
content = content.replace(
    'this.activeStarsForm = 5;',
    'this.activeStarsForm = 5;\n' + listenerCode
);

fs.writeFileSync(path, content, 'utf8');
console.log('Language refresh listener added to pruvaAiManager.js');
