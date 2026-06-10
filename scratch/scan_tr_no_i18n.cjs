const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const trCharsRegex = /[çğışöüÇĞİŞÖÜ]/;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'public' && file !== 'scratch' && file !== 'dist') {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (['.html', '.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        if (
          file === 'check_keys.cjs' || 
          file === 'check_keys.js' || 
          file === 'update_translations.cjs' ||
          file === 'pricing-ai.html' ||
          file === 'local-admin.html' ||
          file === 'temp.js' ||
          file === 'settings.js' ||
          file === 'scan_hardcoded_turkish.cjs' ||
          file === 'scan_tr_no_i18n.cjs'
        ) return;
        scanFile(fullPath);
      }
    }
  });
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }
    
    if (trCharsRegex.test(line)) {
      // Check if it does NOT contain data-i18n, window.t, i18n.t, or t(
      const hasI18n = line.includes('data-i18n') || line.includes('window.t(') || line.includes('i18n.t(') || line.includes('window.i18n.t(') || line.includes('window.i18n?.t(');
      if (!hasI18n) {
        const relPath = path.relative(projectRoot, filePath);
        console.log(`[${relPath}:${idx + 1}] ${trimmed}`);
      }
    }
  });
}

console.log("Scanning for Turkish strings WITHOUT i18n localization attributes...");
scanDirectory(projectRoot);
