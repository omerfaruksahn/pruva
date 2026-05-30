window.LegalModal = class LegalModal {
    constructor() {
        this.isOpen = false;
        this.currentType = 'kvkk'; // 'kvkk', 'term', 'kvkk-light'
        this.createElements();
    }

    createElements() {
        const modal = document.createElement('div');
        modal.id = 'legal-modal';
        modal.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
            display: none; align-items: center; justify-content: center;
            z-index: 10000; animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="card" style="width: 90%; max-width: 800px; max-height: 85vh; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                <div style="padding: 20px 30px; background: var(--primary-gradient); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h3 id="legal-title" style="margin: 0; font-size: 1.2rem; font-weight: 700;">Yasal Metinler</h3>
                    <button onclick="window.legalModal.hide()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                <div id="legal-body" style="padding: 30px; overflow-y: auto; line-height: 1.8; color: #444; font-size: 0.95rem;">
                    <!-- İçerik buraya gelecek -->
                </div>
                <div style="padding: 20px 30px; background: #f8f9fa; border-top: 1px solid #eee; text-align: right;">
                    <button class="btn-primary" onclick="window.legalModal.hide()" style="padding: 10px 25px;">Okudum, Anladım</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.body = modal.querySelector('#legal-body');
        this.title = modal.querySelector('#legal-title');
    }

    show(type) {
        this.currentType = type;
        this.isOpen = true;
        this.modal.style.display = 'flex';
        this.updateContent();
    }

    hide() {
        this.isOpen = false;
        this.modal.style.display = 'none';
    }

    updateContent() {
        if (this.currentType === 'kvkk') {
            this.title.innerText = 'KVKK Aydınlatma Metni';
            this.body.innerHTML = `
                <h4>1. Veri Sorumlusu</h4>
                <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Pruva Lojistik Platformu ("Platform") olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan kapsamda işleyeceğiz.</p>
                
                <h4>2. Kişisel Verilerin İşlenme Amacı</h4>
                <p>Platform üzerinden toplanan şirket unvanı, VKN, kurumsal e-posta ve operasyonel verileriniz; servislerin sunulması, kullanıcı doğrulama, ilan ve teklif süreçlerinin yönetilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>
                
                <h4>3. Veri Aktarımı ve Korunması</h4>
                <p>Verileriniz, yalnızca hizmetin ifası için gerekli olduğu ölçüde (eşleşen taşıyıcı/yükleyici ile) paylaşılır. Platformumuz, verilerinizin güvenliği için endüstri standardı şifreleme ve güvenlik önlemlerini uygulamaktadır.</p>
                
                <h4>4. Haklarınız</h4>
                <p>KVKK'nın 11. maddesi uyarınca; verilerinizin silinmesini isteme, işlenip işlenmediğini öğrenme ve düzeltme hakkına sahipsiniz. Başvurularınızı kurumsal e-posta adresimiz üzerinden yapabilirsiniz.</p>
            `;
        } else if (this.currentType === 'term') {
            this.title.innerText = 'Kullanıcı Sözleşmesi';
            this.body.innerHTML = `
                <div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    ÖNEMLİ: Pruva Lojistik bir "Aracı Hizmet Sağlayıcı"dır. Taşıma sürecindeki hiçbir hasar, gecikme veya kayıptan doğrudan sorumlu tutulamaz.
                </div>
                
                <h4>1. Tarafların Sorumlulukları</h4>
                <p><strong>Pruva Lojistik:</strong> Sadece yükleyici ile taşıyıcıyı bir araya getiren dijital bir pazaryeridir. Taraflar arasındaki ticari anlaşmazlıklarda hakemlik yapmaz, garanti vermez.</p>
                
                <h4>2. Veri Doğruluğu</h4>
                <p>Kullanıcı, kayıt sırasında sunduğu VKN ve şirket bilgilerinin doğruluğunu taahhüt eder. Yanlış veya sahte belge sunulması durumunda doğacak hukuki sorumluluk tamamen kullanıcıya aittir ve hesabı süresiz kapatılır.</p>
                
                <h4>3. Platform Kullanımı</h4>
                <p>Platform üzerinden elde edilen fiyat teklifleri ve müşteri bilgileri "Ticari Sır" kapsamındadır. Bu bilgilerin platform dışına sızdırılması veya kötüye kullanılması durumunda Pruva Lojistik tazminat hakkını saklı tutar.</p>
                
                <h4>4. Sorumluluk Sınırlandırması</h4>
                <p>Pruva Lojistik; sistem kesintileri, veri kayıpları veya mücbir sebeplerden dolayı oluşabilecek dolaylı zararlardan sorumlu değildir. Platform "Olduğu Gibi" (As-Is) esasıyla sunulmaktadır.</p>
            `;
        }
    }
};
