const fs = require('fs');
let code = fs.readFileSync('js/components/pruvaAiManager.js', 'utf8');
code = code.replace(/fetch\('\/api\//g, "fetch(CONFIG.API_URL + '/");
code = code.replace(/fetch\(`\/api\//g, "fetch(CONFIG.API_URL + `/");
fs.writeFileSync('js/components/pruvaAiManager.js', code);
console.log('Fixed API routes');
