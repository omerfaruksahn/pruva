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
        // Skip config/utils/backup files
        if (
          file === 'check_keys.cjs' || 
          file === 'check_keys.js' || 
          file === 'update_translations.cjs' ||
          file === 'pricing-ai.html' ||
          file === 'local-admin.html' ||
          file === 'temp.js' ||
          file === 'settings.js'
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
    // Basic regex to find strings or HTML text containing Turkish chars
    // But we want to filter out comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }
    
    if (trCharsRegex.test(line)) {
      // Check if it looks like code, string, or text
      // Let's print out lines that contain Turkish characters but do not contain data-i18n
      // We can inspect manually
      const relPath = path.relative(projectRoot, filePath);
      console.log(`[${relPath}:${idx + 1}] ${trimmed}`);
    }
  });
}

console.log("Scanning for hardcoded Turkish strings in HTML/JS files...");
scanDirectory(projectRoot);
