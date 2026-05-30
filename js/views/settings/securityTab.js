function getDeviceDetails() {
    const ua = navigator.userAgent;
    let browser = "Tarayıcı";
    let os = "İşletim Sistemi";
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
                <i data-lucide="chevron-left"></i> Geri
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Güvenlik Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2>Güvenlik ve Erişim</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Hesabınızın güvenliğini ve aktif oturumlarınızı buradan yönetin.</p>
            </div>
        </div>

        <!-- Şifre Güncelleme -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon"><i data-lucide="lock"></i></div>
                <div>
                    <h4 style="margin-bottom: 2px;">Şifre Yönetimi</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">Yeni şifreniz en az 12 karakter uzunluğunda olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.</p>
                </div>
            </div>
            <div class="settings-grid">
                <div class="input-group">
                    <label>Mevcut Şifre</label>
                    <input type="password" id="current-password" placeholder="••••••••">
                    <div style="margin-top: 6px;">
                        <a href="#" onclick="event.preventDefault(); window.settingsManager.sendPasswordResetEmail()" style="font-size: 0.75rem; color: var(--secondary); text-decoration: none; font-weight: 600;">Şifrenizi mi unuttunuz?</a>
                    </div>
                </div>
                <div></div>
                <div class="input-group">
                    <label>Yeni Şifre</label>
                    <input type="password" id="new-password" placeholder="Yeni Şifre" oninput="window.updatePasswordStrength(this.value)">
                    <div id="password-strength-meter" style="height: 4px; background: #eee; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                        <div id="strength-bar" style="height: 100%; width: 0%; transition: all 0.3s ease;"></div>
                    </div>
                    <span id="strength-text" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">Zayıf</span>
                </div>
                <div class="input-group">
                    <label>Yeni Şifre (Tekrar)</label>
                    <input type="password" id="confirm-password" placeholder="Yeni Şifre (Tekrar)">
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <button class="btn-primary" style="padding: 8px 24px; font-size: 0.85rem;" onclick="window.settingsManager.updatePassword()">Şifreyi Güncelle</button>
            </div>
        </div>

        <!-- İki Faktörlü Doğrulama -->
        <div class="security-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="security-card-header" style="margin-bottom: 0;">
                    <div class="security-card-icon" style="background: ${user.phoneVerified ? '#e6f7ed' : 'var(--bg-page)'}; color: ${user.phoneVerified ? '#27ae60' : 'var(--text-muted)'};"><i data-lucide="shield-check"></i></div>
                    <div>
                        <h4 style="margin-bottom: 2px;">İki Faktörlü Doğrulama (2FA)</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">Hesabınıza girişte ekstra bir güvenlik katmanı ekleyin.</p>
                    </div>
                </div>
                <div class="status-badge ${user.phoneVerified ? 'success' : ''}" style="background: ${user.phoneVerified ? '#e6f7ed' : 'var(--bg-page)'}; color: ${user.phoneVerified ? '#27ae60' : 'var(--text-muted)'};">
                    ${user.phoneVerified ? 'Aktif' : 'Pasif'}
                </div>
            </div>
            
            <div style="margin-top: 24px; padding: 16px; background: var(--bg-page); border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <i data-lucide="smartphone" style="color: var(--text-muted);"></i>
                    <div>
                        <div style="font-size: 0.9rem; font-weight: 600;">SMS Doğrulama</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${user.phoneVerified 
                                ? `Doğrulanmış numara: ${user.phone ? user.phone.slice(0, 6) + ' ••• •• ' + user.phone.slice(-2) : '+90 ••• •• ••'}` 
                                : 'Hesap güvenliğiniz için bir telefon numarası doğrulayın.'
                            }
                        </div>
                    </div>
                </div>
                <button class="btn-outline" style="padding: 6px 12px; font-size: 0.75rem;" onclick="${user.phoneVerified ? "alert('Telefon numaranızı profil tabından güncelleyebilirsiniz.')" : "window.settingsManager.startPhoneVerification()" }">
                    ${user.phoneVerified ? 'Düzenle' : 'Numara Doğrula'}
                </button>
            </div>
        </div>

        <!-- Aktif Oturumlar -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon" style="background: #fff9e6; color: #f39c12;"><i data-lucide="monitor"></i></div>
                <div>
                    <h4 style="margin-bottom: 2px;">Aktif Oturumlar</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">Hesabınızın açık olduğu tüm cihazları kontrol edin.</p>
                </div>
            </div>

            <div class="session-list">
                <div class="session-item current">
                    <div class="session-info">
                        <i data-lucide="${device.icon}"></i>
                        <div>
                            <div class="session-name">${device.name} <span class="current-badge">Bu Cihaz</span></div>
                            <div id="current-session-meta" class="session-meta">Konum alınıyor...</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-outline" style="width: 100%; margin-top: 20px; color: var(--danger); border-color: #fee2e2;" onclick="if(window.notificationManager) window.notificationManager.showToast('Tüm diğer oturumlar sonlandırıldı.', 'success')">Tüm Oturumlardan Çıkış Yap</button>
        </div>

        <!-- Güvenlik Logları -->
        <div class="security-card">
            <div class="security-card-header">
                <div class="security-card-icon" style="background: #f0f7ff; color: #3498db;"><i data-lucide="list"></i></div>
                <h4 style="margin-bottom: 2px;">Son Güvenlik Hareketleri</h4>
            </div>
            <div class="audit-log">
                <div class="audit-item">
                    <div class="audit-dot success"></div>
                    <div class="audit-content">
                        <div class="audit-text">Başarılı giriş yapıldı</div>
                        <div class="audit-time">Bugün, 14:22 • IP: 192.168.1.1</div>
                    </div>
                </div>
                <div class="audit-item">
                    <div class="audit-dot info"></div>
                    <div class="audit-content">
                        <div class="audit-text">Şifre değiştirildi</div>
                        <div class="audit-time">2 gün önce • IP: 192.168.1.1</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tehlike Bölgesi -->
        <div style="margin-top: 40px; padding: 24px; border: 1px solid #fee2e2; border-radius: var(--radius-lg); background: #fff1f0;">
            <h4 style="color: var(--danger); margin-bottom: 8px;">Hesabı Devre Dışı Bırak</h4>
            <p style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 16px;">Hesabınızı kapattığınızda tüm ilanlarınız ve geçmişiniz silinecektir. Bu işlem geri alınamaz.</p>
            <button class="btn-primary" style="background: var(--danger);" onclick="window.settingsManager.deleteAccount()">Hesabı Sil</button>
        </div>
    </div>`;
}