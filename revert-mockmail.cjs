const fs = require('fs');
let content = fs.readFileSync('js/components/pruvaAiManager.js', 'utf8');

const regex = /\} catch \(e\) \{\s*console\.warn\('\[PRUVA AI\] API bulunamadi, MOCK veri uretiliyor\.\.\.', e\);\s*if \(!silent\) this\.showToast\('Backend yok, Mock e-posta \u00fcretiliyor\.\.\.', 'warning'\);\s*this\.simulateNewMockEmail\(\);\s*\}/m;

content = content.replace(regex, `} catch (e) {
            if (!silent) this.showToast('Tarama ba\u015Far\u0131s\u0131z oldu.', 'danger');
        }`);

const funcRegex = /simulateNewMockEmail\(\) \{[\s\S]*?if \(!this\.app\.state\.detailsDrawerOpen\) \{\s*this\.showToast\(randomEmail\.from \+ ' firmasindan yeni mail!', 'success'\);\s*\}\s*\}/m;

content = content.replace(funcRegex, '');

fs.writeFileSync('js/components/pruvaAiManager.js', content);
