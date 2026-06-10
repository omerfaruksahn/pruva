function getDeviceDetails() {
    const ua = navigator.userAgent;
    let browser = window.i18n.t('auth.device_browser');
    let os = window.i18n.t('auth.device_os');
    let icon = "monitor";

    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/iphone|ipad|ipod/i.test(ua)) { os = "iOS"; icon = "smartphone"; }
    else if (/android/i.test(ua)) { os = "Android"; icon = "smartphone"; }
    else if (/linux/i.test(ua)) os = "Linux";

    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opera/i.test(ua)) {
        browser = "Chrome";
        if (icon !== 'smartphone') icon = "chrome";
    }
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/edge|edg/i.test(ua)) browser = "Edge";
    else if (/opr|opera/i.test(ua)) browser = "Opera";

    return {
        name: `${browser} (${os})`,
        icon: icon
    };
}

export function renderSecurityTab(user) {
    const device = getDeviceDetails();
    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> <span data-i18n="settings.security.back">Geri</span>
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);" data-i18n="settings.security.title">Güvenlik Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2 data-i18n="settings.security.header_title">Güvenlik ve Erişim</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;" data-i18n="settings.security.header_desc">Hesabınızın güvenliğini ve aktif oturumlarınızı buradan yönetin.</p>
            </div>
        </div>

        <!-- Şifre Güncelleme -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon"><i data-lucide="lock"></i></div>
                <div>
                    <h4 style="margin-bottom: 2px;" data-i18n="settings.security.password_management">Şifre Yönetimi</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="settings.security.password_rules">Yeni şifreniz en az 12 karakter uzunluğunda olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.</p>
                </div>
            </div>
            <div class="settings-grid">
                <div class="input-group">
                    <label data-i18n="settings.security.current_password">Mevcut Şifre</label>
                    <input type="password" id="current-password" placeholder="••••••••">
                    <div style="margin-top: 6px;">
                        <a href="#" onclick="event.preventDefault(); window.settingsManager.sendPasswordResetEmail()" style="font-size: 0.75rem; color: var(--secondary); text-decoration: none; font-weight: 600;" data-i18n="settings.security.forgot_password">Şifrenizi mi unuttunuz?</a>
                    </div>
                </div>
                <div></div>
                <div class="input-group">
                    <label data-i18n="settings.security.new_password">Yeni Şifre</label>
                    <input type="password" id="new-password" placeholder="Yeni Şifre" oninput="window.updatePasswordStrength(this.value)">
                    <div id="password-strength-meter" style="height: 4px; background: #eee; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                        <div id="strength-bar" style="height: 100%; width: 0%; transition: all 0.3s ease;"></div>
                    </div>
                    <span id="strength-text" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;" data-i18n="settings.security.password_weak">Zayıf</span>
                </div>
                <div class="input-group">
                    <label data-i18n="settings.security.new_password_again">Yeni Şifre (Tekrar)</label>
                    <input type="password" id="confirm-password" placeholder="Yeni Şifre (Tekrar)">
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <button class="btn-primary" style="padding: 8px 24px; font-size: 0.85rem;" onclick="window.settingsManager.updatePassword()" data-i18n="settings.security.update_password">Şifreyi Güncelle</button>
            </div>
        </div>

        <!-- İki Faktörlü Doğrulama -->
        <div class="security-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="security-card-header" style="margin-bottom: 0;">
                    <div class="security-card-icon" style="background: ${user.phoneVerified ? '#e6f7ed' : 'var(--bg-page)'}; color: ${user.phoneVerified ? '#27ae60' : 'var(--text-muted)'};"><i data-lucide="shield-check"></i></div>
                    <div>
                        <h4 style="margin-bottom: 2px;" data-i18n="settings.security.2fa">İki Faktörlü Doğrulama (2FA)</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="settings.security.2fa_desc">Hesabınıza girişte ekstra bir güvenlik katmanı ekleyin.</p>
                    </div>
                </div>
                <div class="status-badge ${user.phoneVerified ? 'success' : ''}" style="background: ${user.phoneVerified ? '#e6f7ed' : 'var(--bg-page)'}; color: ${user.phoneVerified ? '#27ae60' : 'var(--text-muted)'};">
                    ${user.phoneVerified ? '<span data-i18n="settings.security.active">Aktif</span>' : '<span data-i18n="settings.security.passive">Pasif</span>'}
                </div>
            </div>
            
            <div style="margin-top: 24px; padding: 16px; background: var(--bg-page); border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <i data-lucide="smartphone" style="color: var(--text-muted);"></i>
                    <div>
                        <div style="font-size: 0.9rem; font-weight: 600;" data-i18n="settings.security.sms_auth">SMS Doğrulama</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${user.phoneVerified 
                                ? `<span data-i18n="settings.security.verified_number">Doğrulanmış numara:</span> ${user.phone ? user.phone.slice(0, 6) + ' ••• •• ' + user.phone.slice(-2) : '+90 ••• •• ••'}` 
                                : '<span data-i18n="settings.security.verify_phone_desc">Hesap güvenliğiniz için bir telefon numarası doğrulayın.</span>'
                            }
                        </div>
                    </div>
                </div>
                <button class="btn-outline" style="padding: 6px 12px; font-size: 0.75rem;" onclick="${user.phoneVerified ? "alert(window.i18n.t('settings.security.alert_update_phone'))" : "window.settingsManager.startPhoneVerification()" }">
                    ${user.phoneVerified ? '<span data-i18n="settings.security.edit">Düzenle</span>' : '<span data-i18n="settings.security.verify_number">Numara Doğrula</span>'}
                </button>
            </div>
        </div>

        <!-- Aktif Oturumlar -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon" style="background: #fff9e6; color: #f39c12;"><i data-lucide="monitor"></i></div>
                <div>
                    <h4 style="margin-bottom: 2px;" data-i18n="settings.security.active_sessions">Aktif Oturumlar</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="settings.security.sessions_desc">Hesabınızın açık olduğu tüm cihazları kontrol edin.</p>
                </div>
            </div>

            <div class="session-list">
                <div class="session-item current">
                    <div class="session-info">
                        <i data-lucide="${device.icon}"></i>
                        <div>
                            <div class="session-name">${device.name} <span class="current-badge" data-i18n="settings.security.this_device">Bu Cihaz</span></div>
                            <div id="current-session-meta" class="session-meta" data-i18n="settings.security.getting_location">Konum alınıyor...</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-outline" style="width: 100%; margin-top: 20px; color: var(--danger); border-color: #fee2e2;" onclick="if(window.notificationManager) window.notificationManager.showToast(window.i18n.t('settings.security.toast_sessions_terminated'), 'success')" data-i18n="settings.security.logout_all">Tüm Oturumlardan Çıkış Yap</button>
        </div>

        <!-- Güvenlik Logları -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon" style="background: #f0f7ff; color: #3498db;"><i data-lucide="list"></i></div>
                <h4 style="margin-bottom: 2px;" data-i18n="settings.security.recent_activity">Son Güvenlik Hareketleri</h4>
            </div>
            <div class="audit-log">
                <div class="audit-item">
                    <div class="audit-dot success"></div>
                    <div class="audit-content">
                        <div class="audit-text" data-i18n="settings.security.login_success">Başarılı giriş yapıldı</div>
                        <div class="audit-time">${window.i18n.t('settings.security.today')}, 14:22 • IP: 192.168.1.1</div>
                    </div>
                </div>
                <div class="audit-item">
                    <div class="audit-dot info"></div>
                    <div class="audit-content">
                        <div class="audit-text" data-i18n="settings.security.password_changed">Şifre değiştirildi</div>
                        <div class="audit-time">${window.i18n.t('settings.security.days_ago').replace('{{days}}', '2')} • IP: 192.168.1.1</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tehlike Bölgesi -->
        <div style="margin-top: 40px; padding: 24px; border: 1px solid #fee2e2; border-radius: var(--radius-lg); background: #fff1f0;">
            <h4 style="color: var(--danger); margin-bottom: 8px;" data-i18n="settings.security.deactivate_account">Hesabı Devre Dışı Bırak</h4>
            <p style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 16px;" data-i18n="settings.security.deactivate_desc">Hesabınızı kapattığınızda tüm ilanlarınız ve geçmişiniz silinecektir. Bu işlem geri alınamaz.</p>
            <button class="btn-primary" style="background: var(--danger);" onclick="window.settingsManager.deleteAccount()" data-i18n="settings.security.delete_account">Hesabı Sil</button>
        </div>
    </div>`;
}