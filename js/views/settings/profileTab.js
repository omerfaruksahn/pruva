export function renderProfileTab(user) {
    const userAvatarHTML = user.avatar 
        ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` 
        : user.name.charAt(0).toUpperCase();

    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> <span data-i18n="settings.profile.back">Geri</span>
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);" data-i18n="settings.profile.title">Profil Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2 data-i18n="settings.profile.header_title">Profil Bilgileri</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;" data-i18n="settings.profile.header_desc">Hesap kimliğinizi ve iletişim bilgilerinizi yönetin.</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn-outline" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.app.router.navigate('home')" data-i18n="settings.profile.cancel">İptal</button>
                <button class="btn-primary" style="padding: 8px 24px; font-size: 0.85rem;" onclick="window.settingsManager.saveProfile()" data-i18n="settings.profile.save">Değişiklikleri Kaydet</button>
            </div>
        </div>
        
        <!-- Profil Fotoğrafı Yönetimi -->
        <div class="profile-upload-section">
            <div class="avatar-wrapper-settings" onclick="window.handleAvatarUpload()">
                <div class="avatar-big">${userAvatarHTML}</div>
                <div class="avatar-overlay">
                    <i data-lucide="camera"></i>
                    <span data-i18n="settings.profile.avatar_change">Değiştir</span>
                </div>
            </div>
            <div class="upload-controls">
                <h4 data-i18n="settings.profile.avatar_title">Profil Fotoğrafı</h4>
                <p data-i18n="settings.profile.avatar_desc">En az 400x400px boyutunda, JPG veya PNG formatında olmalıdır.</p>
                <div style="display: flex; gap: 10px; margin-top: 12px;">
                    <button class="btn-primary" style="padding: 6px 14px; font-size: 0.75rem;" onclick="window.handleAvatarUpload()" data-i18n="settings.profile.avatar_upload">Yeni Yükle</button>
                    <button class="btn-outline" style="padding: 6px 14px; font-size: 0.75rem; color: var(--danger); border-color: #fee2e2;" onclick="window.removeAvatar()" data-i18n="settings.profile.avatar_remove">Kaldır</button>
                </div>
            </div>
        </div>

        <!-- Temel Bilgiler -->
        <h3 class="section-subtitle" data-i18n="settings.profile.basic_info">Temel Bilgiler</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label data-i18n="settings.profile.fullname">Ad Soyad / Yetkili</label>
                <input type="text" id="profile-name" value="${user.name}" placeholder="Ad Soyad">
            </div>
            <div class="input-group">
                <label><span data-i18n="settings.profile.email">E-posta Adresi</span> 
                    ${window.fbAuth?.currentUser?.emailVerified 
                        ? '<span class="verified-tag"><i data-lucide="check-circle-2"></i> <span data-i18n="settings.profile.verified">Doğrulandı</span></span>' 
                        : '<button type="button" class="btn-outline btn-sm" onclick="window.settingsManager.sendEmailVerification()" style="padding:2px 8px; font-size:0.7rem; margin-left:10px;" data-i18n="settings.profile.send_verification">Doğrulama Gönder</button>'
                    }
                </label>
                <div class="input-with-icon">
                    <i data-lucide="mail"></i>
                    <input type="email" id="profile-email" value="${user.email}" placeholder="eposta@sirket.com">
                </div>
            </div>
            <div class="input-group">
                <label><span data-i18n="settings.profile.phone">Telefon</span> 
                    ${user.phoneVerified 
                        ? '<span class="verified-tag"><i data-lucide="check-circle-2"></i> <span data-i18n="settings.profile.verified">Doğrulandı</span></span>' 
                        : '<button type="button" class="btn-outline btn-sm" onclick="window.settingsManager.startPhoneVerification()" style="padding:2px 8px; font-size:0.7rem; margin-left:10px;" data-i18n="settings.profile.verify">Doğrula</button>'
                    }
                </label>
                <div class="input-with-icon">
                    <i data-lucide="phone"></i>
                    <input type="tel" id="profile-phone" value="${user.phone || ''}" placeholder="+90 5xx xxx xx xx">
                </div>
            </div>
            <div class="input-group">
                <label data-i18n="settings.profile.position">Pozisyon / Unvan</label>
                <input type="text" id="profile-title" value="${user.title || window.i18n.t('settings.profile.default_title')}" placeholder="${window.i18n.t('settings.profile.placeholder_title')}">
            </div>
        </div>

        <!-- Profesyonel Detaylar -->
        <h3 class="section-subtitle" data-i18n="settings.profile.professional_details">Profesyonel Detaylar</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label data-i18n="settings.profile.language">Dil Tercihi</label>
                <select id="lang-switcher" onchange="window.i18n.setLanguage(this.value)">
                    <option value="tr" ${window.i18n?.currentLang === 'tr' ? 'selected' : ''}>Türkçe (TR)</option>
                    <option value="en" ${window.i18n?.currentLang === 'en' ? 'selected' : ''}>English (EN)</option>
                    <option value="zh" ${window.i18n?.currentLang === 'zh' ? 'selected' : ''}>中文 (ZH)</option>
                    <option value="ru" ${window.i18n?.currentLang === 'ru' ? 'selected' : ''}>Русский (RU)</option>
                    <option value="es" ${window.i18n?.currentLang === 'es' ? 'selected' : ''}>Español (ES)</option>
                </select>
            </div>
            <div class="input-group">
                <label data-i18n="settings.profile.timezone">Saat Dilimi</label>
                <select id="profile-timezone">
                    <option value="utc3" ${user.timezone === 'utc3' ? 'selected' : ''}>(GMT+03:00) Istanbul</option>
                    <option value="utc2" ${user.timezone === 'utc2' ? 'selected' : ''}>(GMT+02:00) Berlin</option>
                    <option value="utc0" ${user.timezone === 'utc0' ? 'selected' : ''}>(GMT+00:00) London</option>
                </select>
            </div>
        </div>

        <div class="input-group">
            <label data-i18n="settings.profile.bio">Profesyonel Özet (Bio)</label>
            <textarea id="profile-bio" placeholder="${window.i18n.t('settings.profile.placeholder_bio')}" style="height: 100px;">${user.bio || window.i18n.t('settings.profile.default_bio')}</textarea>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;" data-i18n="settings.profile.bio_desc">Maksimum 500 karakter.</p>
        </div>

        <!-- Sosyal Medya -->
        <h3 class="section-subtitle" style="margin-top: 32px;" data-i18n="settings.profile.social_profiles">Sosyal Profiller</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label>LinkedIn</label>
                <div class="input-with-icon">
                    <i data-lucide="briefcase"></i>
                    <input type="text" id="profile-linkedin" value="${user.linkedin || ''}" placeholder="linkedin.com/in/username">
                </div>
            </div>
            <div class="input-group">
                <label data-i18n="settings.profile.website">Web Sitesi</label>
                <div class="input-with-icon">
                    <i data-lucide="globe"></i>
                    <input type="text" id="profile-website" value="${user.website || ''}" placeholder="www.sirket.com">
                </div>
            </div>
        </div>
    </div>`;
}