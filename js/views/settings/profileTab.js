export function renderProfileTab(user) {
    const userAvatarHTML = user.avatar 
        ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` 
        : user.name.charAt(0).toUpperCase();

    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> Geri
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Profil Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2>Profil Bilgileri</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Hesap kimliğinizi ve iletişim bilgilerinizi yönetin.</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn-outline" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.app.router.navigate('home')">İptal</button>
                <button class="btn-primary" style="padding: 8px 24px; font-size: 0.85rem;" onclick="window.settingsManager.saveProfile()">Değişiklikleri Kaydet</button>
            </div>
        </div>
        
        <!-- Profil Fotoğrafı Yönetimi -->
        <div class="profile-upload-section">
            <div class="avatar-wrapper-settings" onclick="window.handleAvatarUpload()">
                <div class="avatar-big">${userAvatarHTML}</div>
                <div class="avatar-overlay">
                    <i data-lucide="camera"></i>
                    <span>Değiştir</span>
                </div>
            </div>
            <div class="upload-controls">
                <h4>Profil Fotoğrafı</h4>
                <p>En az 400x400px boyutunda, JPG veya PNG formatında olmalıdır.</p>
                <div style="display: flex; gap: 10px; margin-top: 12px;">
                    <button class="btn-primary" style="padding: 6px 14px; font-size: 0.75rem;" onclick="window.handleAvatarUpload()">Yeni Yükle</button>
                    <button class="btn-outline" style="padding: 6px 14px; font-size: 0.75rem; color: var(--danger); border-color: #fee2e2;" onclick="window.removeAvatar()">Kaldır</button>
                </div>
            </div>
        </div>

        <!-- Temel Bilgiler -->
        <h3 class="section-subtitle">Temel Bilgiler</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label>Ad Soyad / Yetkili</label>
                <input type="text" id="profile-name" value="${user.name}" placeholder="Ad Soyad">
            </div>
            <div class="input-group">
                <label>E-posta Adresi 
                    ${window.fbAuth?.currentUser?.emailVerified 
                        ? '<span class="verified-tag"><i data-lucide="check-circle-2"></i> Doğrulandı</span>' 
                        : '<button type="button" class="btn-outline btn-sm" onclick="window.settingsManager.sendEmailVerification()" style="padding:2px 8px; font-size:0.7rem; margin-left:10px;">Doğrulama Gönder</button>'
                    }
                </label>
                <div class="input-with-icon">
                    <i data-lucide="mail"></i>
                    <input type="email" id="profile-email" value="${user.email}" placeholder="eposta@sirket.com">
                </div>
            </div>
            <div class="input-group">
                <label>Telefon 
                    ${user.phoneVerified 
                        ? '<span class="verified-tag"><i data-lucide="check-circle-2"></i> Doğrulandı</span>' 
                        : '<button type="button" class="btn-outline btn-sm" onclick="window.settingsManager.startPhoneVerification()" style="padding:2px 8px; font-size:0.7rem; margin-left:10px;">Doğrula</button>'
                    }
                </label>
                <div class="input-with-icon">
                    <i data-lucide="phone"></i>
                    <input type="tel" id="profile-phone" value="${user.phone || ''}" placeholder="+90 5xx xxx xx xx">
                </div>
            </div>
            <div class="input-group">
                <label>Pozisyon / Unvan</label>
                <input type="text" id="profile-title" value="${user.title || 'Operasyon Müdürü'}" placeholder="Örn: Genel Müdür">
            </div>
        </div>

        <!-- Profesyonel Detaylar -->
        <h3 class="section-subtitle">Profesyonel Detaylar</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label>Dil Tercihi</label>
                <select id="profile-lang">
                    <option value="tr" ${user.lang === 'tr' ? 'selected' : ''}>Türkçe (TR)</option>
                    <option value="en" ${user.lang === 'en' ? 'selected' : ''}>English (US)</option>
                    <option value="de" ${user.lang === 'de' ? 'selected' : ''}>Deutsch (DE)</option>
                </select>
            </div>
            <div class="input-group">
                <label>Saat Dilimi</label>
                <select id="profile-timezone">
                    <option value="utc3" ${user.timezone === 'utc3' ? 'selected' : ''}>(GMT+03:00) Istanbul</option>
                    <option value="utc2" ${user.timezone === 'utc2' ? 'selected' : ''}>(GMT+02:00) Berlin</option>
                    <option value="utc0" ${user.timezone === 'utc0' ? 'selected' : ''}>(GMT+00:00) London</option>
                </select>
            </div>
        </div>

        <div class="input-group">
            <label>Profesyonel Özet (Bio)</label>
            <textarea id="profile-bio" placeholder="Şirketiniz veya kendiniz hakkında kısa bir bilgi..." style="height: 100px;">${user.bio || 'Lojistik sektöründe tecrübemizle Pruva platformunda aktif rol alıyoruz.'}</textarea>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Maksimum 500 karakter.</p>
        </div>

        <!-- Sosyal Medya -->
        <h3 class="section-subtitle" style="margin-top: 32px;">Sosyal Profiller</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label>LinkedIn</label>
                <div class="input-with-icon">
                    <i data-lucide="briefcase"></i>
                    <input type="text" id="profile-linkedin" value="${user.linkedin || ''}" placeholder="linkedin.com/in/username">
                </div>
            </div>
            <div class="input-group">
                <label>Web Sitesi</label>
                <div class="input-with-icon">
                    <i data-lucide="globe"></i>
                    <input type="text" id="profile-website" value="${user.website || ''}" placeholder="www.sirket.com">
                </div>
            </div>
        </div>
    </div>`;
}