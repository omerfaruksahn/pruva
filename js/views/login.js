window.loginView = (state) => {
    return `
    <div class="auth-wrapper">
        <div class="card auth-card">
            <div class="auth-header">
                <h2 class="auth-title" data-i18n="auth.login.title">Hoş Geldiniz</h2>
                <p class="auth-subtitle" data-i18n="auth.login.subtitle">Lojistiğin yeni adresine giriş yapın</p>
            </div>

            <form id="login-form">
                <div class="form-group auth-form-group">
                    <label data-i18n="auth.login.email_label">E-posta Adresi</label>
                    <input type="email" id="login-email" name="email" class="form-control auth-input" placeholder="admin@pruva.com" required>
                </div>
                <div class="form-group auth-form-group">
                    <label data-i18n="auth.login.password_label">Şifre</label>
                    <input type="password" id="login-password" name="password" class="form-control auth-input" placeholder="••••••••" required>
                    <div style="text-align: right; margin-top: 8px;">
                        <a href="#" class="auth-link" data-i18n="auth.login.forgot_password">Şifremi Unuttum</a>
                    </div>
                </div>

                <button type="submit" class="btn-primary auth-submit-btn" data-i18n="auth.login.submit_btn">Giriş Yap</button>
            </form>



            <div class="auth-footer">
                <span data-i18n="auth.login.no_account">Hesabınız yok mu?</span> <a onclick="window.app.router.navigate('register')" class="auth-link" style="font-weight: 700;" data-i18n="auth.login.register_now">Hemen Kayıt Olun</a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed var(--border); text-align: center;">
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;" data-i18n="auth.login.tech_issue">Teknik bir sorun mu yaşıyorsunuz?</p>
                <button onclick="window.app.auth.resetState()" class="btn-outline" style="font-size: 0.7rem; padding: 5px 15px; border-color: #ff4d4f; color: #ff4d4f;" data-i18n="auth.login.reset_system">
                    Sistemi Sıfırla ve Yeniden Başlat
                </button>
            </div>
        </div>
    </div>
    `;
};


