const fs = require('fs');
let content = fs.readFileSync('js/components/pruvaAiManager.js', 'utf8');

const regex = /const response = await fetch\('\/api\/outlook\/disconnect'[\s\S]*?this\.showToast\('.*?kesilemedi\.', 'danger'\);\r?\n        }/m;

const newStr = `            try {
                await fetch('/api/outlook/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`
                    }
                });
            } catch(e) { console.warn('API fail', e); }

            this.app.state.outlookConnected = false;
            delete this.app.state.outlookEmail;
            this.app.store.save();
            this.app.commit();
            this.showToast('Outlook ba\u011Flant\u0131s\u0131 ba\u015Far\u0131yla kesildi.', 'success');
        } catch (e) {
            console.error('Outlook disconnect error:', e);
            this.showToast('Ba\u011Flant\u0131 kesilemedi.', 'danger');
        }`;

content = content.replace(regex, newStr);
fs.writeFileSync('js/components/pruvaAiManager.js', content);
