window.security = {
    /**
     * Metin içerisindeki telefon numarası, e-posta ve iletişim tariflerini maskeler.
     * @param {string} text - Maskelenecek metin
     * @param {Array} history - (Opsiyonel) Bağlam için önceki mesajlar/metinler
     * @param {Object} options - (Opsiyonel) { sender: string, adId: number }
     * @returns {string} - Maskelenmiş metin
     */
    maskSensitiveInfo: function(text, history = [], options = {}) {
        if (!text) return text;

        const contextText = history.concat(text).join(' ').toLowerCase();
        
        // Türkçe karakterleri İngilizce karşılıklarına çevirme (Normalize)
        const trMap = { 'ç':'c', 'ğ':'g', 'ı':'i', 'i':'i', 'ö':'o', 'ş':'s', 'ü':'u' };
        let normalizedText = contextText.replace(/[çğıöşü]/g, match => trMap[match]);

        // 1. Tüm boşlukları, özel karakterleri ve noktalama işaretlerini tamamen yok et (Sıfır tolerans)
        // Kullanıcı "0 5 3 2" veya "0.5.3.2" veya "g m a i l" yazsa bile bitişik algılanacak.
        let strippedText = normalizedText.replace(/[\s\.\-\_\,\:\/\\]/g, '');

        // 2. Türkçe ve ASCII Sayı Kelimelerini Rakamlara Çevir (Kapsamlı harita)
        const numMap = {
            'sıfır':'0', 'sifir':'0', 'bir':'1', 'iki':'2', 'üç':'3', 'uc':'3', 'dört':'4', 'dort':'4', 
            'beş':'5', 'bes':'5', 'altı':'6', 'alti':'6', 'yedi':'7', 'sekiz':'8', 'dokuz':'9',
            'on':'1', 'yirmi':'2', 'otuz':'3', 'kırk':'4', 'kirk':'4', 'elli':'5', 'altmış':'6', 'altmis':'6', 
            'yetmiş':'7', 'yetmis':'7', 'seksen':'8', 'doksan':'9', 'yüz':'0', 'yuz':'0', 'bin':'0'
        };
        
        Object.keys(numMap).forEach(word => {
            // Kelime geçişlerini rakama dönüştür (boşluksuz metinde arama)
            strippedText = strippedText.split(word).join(numMap[word]);
        });

        // 3. Agresif Rakam Kontrolü (Peş peşe veya arasına kelime sızmış ama toplamı 10 eden rakamlar)
        const allDigits = strippedText.match(/\d/g);
        let phoneDetected = false;
        
        // Eğer arındırılmış metinde ardışık 10 rakam varsa (örneğin kelimeler rakama dönüştükten sonra)
        if (allDigits && allDigits.length >= 10) {
            // Sadece toplam 10 rakam olması yetmez, bunların bir araya gelme yoğunluğuna bakalım
            // Ancak en üst düzey güvenlik istendiği için, bir mesajda toplam 10'dan fazla rakam geçiyorsa riskli kabul ediyoruz.
            phoneDetected = true;
        }

        // 4. E-posta Sağlayıcı ve Karakter Kontrolü (Boşluksuz metin üzerinden)
        let isProviderDetected = false;
        const providers = ['gmail', 'hotmail', 'outlook', 'yahoo', 'yandex', 'proton', 'icloud', 'gmailcom', 'hotmailcom'];
        
        providers.forEach(p => {
            if (strippedText.includes(p)) {
                isProviderDetected = true;
            }
        });

        // "@" işareti veya yazılışını arama
        if (strippedText.includes('@') || strippedText.includes('atişareti') || strippedText.includes('atisareti')) {
            isProviderDetected = true;
        }

        // 5. Gelişmiş Semantik Niyet Kontrolü (Boşluksuz metin üzerinden arama)
        // Artık kelimeler 'ı' yerine 'i' gibi standardize edildiği için ascii yazmamız yeterli.
        const suspiciousPhrases = ['gerisi', 'devami', 'kalani', 'adresi', 'numarasi', 'mailden', 'epostadan', 'yazbana', 'ulasbana', 'arayin', 'ararsin', 'numaram', 'kurumsal'];
        const mailKeywords = ['mail', 'eposta', 'iletisim', 'tel', 'telefon', 'numara', 'wp', 'whatsapp'];
        
        let semanticViolation = false;
        suspiciousPhrases.forEach(p => {
            mailKeywords.forEach(k => {
                // Her iki kelime de boşluksuz metin içinde geçiyorsa niyet okuması yap.
                if (strippedText.includes(p) && strippedText.includes(k)) {
                    semanticViolation = true;
                }
            });
        });

        // Belirli anahtar kelimelerin yan yana gelişi
        if (strippedText.includes('numaramıbırakıyorum') || strippedText.includes('numaramibirakiyorum') || strippedText.includes('banaulasin')) {
            semanticViolation = true;
        }

        // Maskeleme ve Loglama Kararı
        const isViolation = phoneDetected || isProviderDetected || semanticViolation;

        if (isViolation) {
            // Loglama (Sadece uygulama state'i varsa)
            if (window.app && window.app.state && window.app.state.securityLogs) {
                window.app.state.securityLogs.unshift({
                    id: Date.now(),
                    user: options.sender || 'Bilinmeyen',
                    adId: options.adId || null,
                    originalText: text,
                    type: isProviderDetected ? 'E-posta' : (phoneDetected ? 'Telefon/Sayısal' : 'İletişim Tarifi'),
                    date: new Date().toLocaleString('tr-TR')
                });
            }

            if (semanticViolation) {
                return ' [SİSTEM UYARISI: İletişim tarifi tespit edildi ve engellendi] ';
            }
            if (phoneDetected) {
                return ' [SİSTEM UYARISI: Telefon numarası paylaşımı engellendi] ';
            }
            if (isProviderDetected) {
                return ' [SİSTEM UYARISI: E-posta paylaşımı engellendi] ';
            }
            
            return ' [GİZLİ BİLGİ - Güvenlik nedeniyle maskelendi] ';
        }

        return text;
    }
};
