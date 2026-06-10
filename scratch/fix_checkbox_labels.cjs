const fs = require('fs');

const path = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\views\\pricingSettings.js';
let content = fs.readFileSync(path, 'utf8');

// Replace ${v} with ${window.pruvaAiManager.variableLabels[v] || v} in pricingSettings.js
content = content.replace(
    /<span style="font-size: 0\.75rem; font-weight: 600; color: var\(--text-primary\);">\$\{v\}<\/span>/g,
    '<span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary);">${window.pruvaAiManager.variableLabels[v] || v}</span>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('pricingSettings.js checkbox labels fixed.');
