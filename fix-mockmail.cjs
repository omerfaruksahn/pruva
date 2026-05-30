const fs = require('fs');
let content = fs.readFileSync('js/components/pruvaAiManager.js', 'utf8');

const regex = /\} catch \(e\) \{\s*if \(!silent\) this\.showToast\('.*?ba\u015Far\u0131s\u0131z oldu\.', 'danger'\);\s*\}/m;

const newStr = `} catch (e) {
            console.warn('[PRUVA AI] API bulunamadi, MOCK veri uretiliyor...', e);
            if (!silent) this.showToast('Backend yok, Mock e-posta \u00fcretiliyor...', 'warning');
            this.simulateNewMockEmail();
        }`;

content = content.replace(regex, newStr);

const mockFunc = `
    simulateNewMockEmail() {
        const mockEmails = [
            { from: 'Ar\u00e7elik', logo: 'A', bg: '#e63946', body: 'Merhaba, \u00c7in (Shanghai) - T\u00fcrkiye (\u0130zmir) i\u00e7in 5x40HC konteyner navlun teklifi rica ediyoruz. Y\u00fckleme tarihi 15 A\u011Fustos civar\u0131.' },
            { from: 'Beko', logo: 'B', bg: '#457b9d', body: 'Hamburg liman\u0131ndan Gemlik liman\u0131na 1 adet standart 20FT konteyner ta\u015F\u0131mas\u0131 i\u00e7in g\u00fcncel navlunlar\u0131n\u0131z\u0131 iletebilir misiniz?' },
            { from: 'Ford Otosan', logo: 'F', bg: '#1d3557', body: 'Rotterdam - Derince hatt\u0131nda otomotiv yedek par\u00e7a y\u00fcklememiz olacak. 3x40HC acil fiyat bekliyoruz.' },
            { from: 'T\u00fcpra\u015F', logo: 'T', bg: '#f4a261', body: 'Alia\u011Fa tesisi i\u00e7in yurtd\u0131\u015F\u0131ndan gelecek kimyasal maddeler i\u00e7in ISO Tank fiyatland\u0131rmas\u0131 talep ediyoruz.' }
        ];
        const randomEmail = mockEmails[Math.floor(Math.random() * mockEmails.length)];
        
        let convs = this.app.state.pricingConversations || [];
        
        // Find existing conversation
        let existing = convs.find(c => c.company === randomEmail.from);
        
        const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        if (existing) {
            existing.messages.push({
                type: 'incoming',
                sender: randomEmail.from,
                text: randomEmail.body,
                time: timeStr
            });
            existing.lastMessage = randomEmail.body.substring(0, 40) + '...';
            existing.time = timeStr;
            existing.status = 'PENDING';
            
            // Move to top
            convs = [existing, ...convs.filter(c => c.id !== existing.id)];
        } else {
            // Create new
            const newConv = {
                id: Date.now(),
                company: randomEmail.from,
                email: randomEmail.from.toLowerCase() + '@' + randomEmail.from.toLowerCase() + '.com',
                logoLetter: randomEmail.logo,
                logoBg: randomEmail.bg,
                status: 'PENDING',
                customerType: 'B\u00fcy\u00fck \u00dcretici',
                regions: ['Avrupa', 'Asya'],
                messages: [
                    { type: 'incoming', sender: randomEmail.from, text: randomEmail.body, time: timeStr }
                ],
                lastMessage: randomEmail.body.substring(0, 40) + '...',
                time: timeStr
            };
            convs.unshift(newConv);
        }
        
        // Push AI analysis message shortly after
        setTimeout(() => {
            const currentConvs = this.app.state.pricingConversations;
            const updatedExisting = currentConvs.find(c => c.company === randomEmail.from);
            if (updatedExisting) {
                updatedExisting.messages.push({
                    type: 'ai_suggestion',
                    sender: 'Pruva AI',
                    text: \`Bu e-postadan RFQ alg\u0131land\u0131. "\${randomEmail.from}" firmas\u0131 i\u00e7in taslak navlun \u00e7al\u0131\u015Fmas\u0131 ba\u015Flat\u0131ls\u0131n m\u0131?\`,
                    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    action: 'PREPARE_DRAFT'
                });
                localStorage.setItem('pruva_pricing_conversations', JSON.stringify(currentConvs));
                this.app.commit();
            }
        }, 1500);

        this.app.state.pricingConversations = convs;
        localStorage.setItem('pruva_pricing_conversations', JSON.stringify(convs));
        this.app.commit();
        
        if (!this.app.state.detailsDrawerOpen) {
            this.showToast(randomEmail.from + ' firmas\u0131ndan yeni mail!', 'success');
        }
    }
`;

if (!content.includes('simulateNewMockEmail(')) {
    content = content.replace('connectOutlook() {', mockFunc + '\n    connectOutlook() {');
}

fs.writeFileSync('js/components/pruvaAiManager.js', content);
