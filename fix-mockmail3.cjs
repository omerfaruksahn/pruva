const fs = require('fs');
let content = fs.readFileSync('js/components/pruvaAiManager.js', 'utf8');

const mockFunc = `
    simulateNewMockEmail() {
        const mockEmails = [
            { from: 'Arcelik', logo: 'A', bg: '#e63946', body: 'Merhaba, Cin (Shanghai) - Turkiye (Izmir) icin 5x40HC konteyner navlun teklifi rica ediyoruz. Yukleme tarihi 15 Agustos civari.' },
            { from: 'Beko', logo: 'B', bg: '#457b9d', body: 'Hamburg limanindan Gemlik limanina 1 adet standart 20FT konteyner tasimasi icin guncel navlunlarinizi iletebilir misiniz?' },
            { from: 'Ford Otosan', logo: 'F', bg: '#1d3557', body: 'Rotterdam - Derince hattinda otomotiv yedek parca yuklememiz olacak. 3x40HC acil fiyat bekliyoruz.' },
            { from: 'Tupras', logo: 'T', bg: '#f4a261', body: 'Aliaga tesisi icin yurtdisindan gelecek kimyasal maddeler icin ISO Tank fiyatlandirmasi talep ediyoruz.' }
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
                customerType: 'Buyuk Uretici',
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
                    text: \`Bu e-postadan RFQ algilandi. "\${randomEmail.from}"firmasi icin taslak navlun calismasi baslatilsin mi?\`,
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
            this.showToast(randomEmail.from + ' firmasindan yeni mail!', 'success');
        }
    }
`;

// Only add if definition is missing (check for function body brace)
if (!content.includes('simulateNewMockEmail() {')) {
    content = content.replace('async connectOutlook() {', mockFunc + '\n    async connectOutlook() {');
    
    // Also fix the extra brace from previous replace
    content = content.replace('}    }', '}\n    ');
    
    fs.writeFileSync('js/components/pruvaAiManager.js', content);
    console.log('Fixed syntax and injected simulateNewMockEmail');
} else {
    console.log('simulateNewMockEmail already exists');
}
