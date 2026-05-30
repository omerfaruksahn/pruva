export const StatusPages = {
    blocked(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--danger">
                <div class="status-icon">🚫</div>
                <h1>Hesabınız Askıya Alındı</h1>
                <p>
                    Sayın <strong>${user.name}</strong>, hesabınız sistem kurallarına aykırı 
                    hareketler nedeniyle yönetici tarafından geçici olarak askıya alınmıştır.
                </p>
                <div class="status-reason">
                    <strong>Sebep:</strong> Güvenlik politikası ihlali veya şüpheli aktivite.
                </div>
                <button class="btn-outline" onclick="window.app.auth.logout()">🚪 Çıkış Yap</button>
            </div>
        </div>`;
    },

    pending(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--warning">
                <div class="status-icon">⏳</div>
                <h1>İnceleme Devam Ediyor</h1>
                <p>
                    Sayın <strong>${user.name}</strong>, üyeliğiniz başarıyla oluşturuldu. 
                    Platform güvenliği gereği şirket bilgileriniz admin ekibimiz tarafından incelenmektedir.
                </p>
                <div class="status-reason status-reason--info">
                    <strong>Durum:</strong> Onay Bekleniyor (VKN ve Şirket Doğrulaması)
                </div>
                <p class="status-note">
                    Onaylandığında kurumsal e-posta adresinize bir bilgilendirme gönderilecektir.
                </p>
                <button class="btn-outline" onclick="window.app.auth.logout()">🚪 Çıkış Yap</button>
            </div>
        </div>`;
    },

    rejected(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--danger">
                <div class="status-icon">❌</div>
                <h1>Başvurunuz Reddedildi</h1>
                <p>
                    Sayın <strong>${user.name}</strong>, platforma yapmış olduğunuz üyelik başvurusu 
                    yapılan incelemeler sonucunda maalesef kabul edilememiştir.
                </p>
                <div class="status-reason">
                    <strong>Sebep:</strong> Kurumsal doğrulama kriterleri karşılanamadı veya eksik bilgi.
                </div>
                <p class="status-note">
                    Farklı bir şirket veya bilgilerle tekrar başvurmak için çıkış yapabilirsiniz.
                </p>
                <button class="btn-outline" onclick="window.app.auth.logout()">🚪 Çıkış Yap</button>
            </div>
        </div>`;
    },

    viewError(errorMessage) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--warning">
                <div class="status-icon">⚠️</div>
                <h2>Sayfa Yüklenemedi</h2>
                <p>Bu sayfa render edilirken bir hata oluştu. Lütfen tekrar deneyin.</p>
                <code class="status-error-code">${window.utils.escapeHTML(errorMessage)}</code>
                <div class="status-actions">
                    <button class="btn-primary" onclick="window.app.router.navigate('home')">Ana Sayfa</button>
                    <button class="btn-outline" onclick="location.reload()">Yenile</button>
                </div>
            </div>
        </div>`;
    },

    skeleton() {
        return `
        <div class="loading-skeleton" style="padding: 40px; max-width: 1200px; margin: 0 auto;">
            <div class="skeleton-line" style="width: 40%; height: 28px; margin-bottom: 20px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 120px; margin-bottom: 15px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 80px; margin-bottom: 15px;"></div>
            <div class="skeleton-line" style="width: 70%; height: 80px;"></div>
        </div>`;
    }
};