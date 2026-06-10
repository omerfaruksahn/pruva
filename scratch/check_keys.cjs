const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'public', 'locales');
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

// Helper to flatten object keys
function flattenObj(obj, prefix = '') {
  let result = {};
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObj(obj[key], prefix + key + '.'));
    } else {
      result[prefix + key] = obj[key];
    }
  }
  return result;
}

const langData = {};
const allKeys = new Set();

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const flat = flattenObj(data);
    langData[lang] = flat;
    Object.keys(flat).forEach(k => allKeys.add(k));
  } else {
    console.log(`Missing file for ${lang}`);
  }
});

console.log(`Total unique keys found across all languages: ${allKeys.size}`);

// Find missing keys for each language
langs.forEach(lang => {
  const flat = langData[lang] || {};
  const missing = [];
  allKeys.forEach(key => {
    if (!(key in flat)) {
      missing.push(key);
    }
  });
  console.log(`\n--- Missing keys in ${lang.toUpperCase()} (${missing.length}) ---`);
  if (missing.length > 0) {
    console.log(missing.join('\n'));
  } else {
    console.log('None!');
  }
});
