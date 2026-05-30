window.loginView = (state) => {
    return `
    <div class="auth-wrapper">
        <div class="card auth-card">
            <div class="auth-header">
                <h2 class="auth-title">Hoş Geldiniz</h2>
                <p class="auth-subtitle">Lojistiğin yeni adresine giriş yapın</p>
            </div>

            <form id="login-form">
                <div class="form-group auth-form-group">
                    <label>E-posta Adresi</label>
                    <input type="email" id="login-email" name="email" class="form-control auth-input" placeholder="admin@pruva.com" required>
                </div>
                <div class="form-group auth-form-group">
                    <label>Şifre</label>
                    <input type="password" id="login-password" name="password" class="form-control auth-input" placeholder="••••••••" required>
                    <div style="text-align: right; margin-top: 8px;">
                        <a href="#" class="auth-link">Şifremi Unuttum</a>
                    </div>
                </div>

                <button type="submit" class="btn-primary auth-submit-btn">Giriş Yap</button>
            </form>



            <div class="auth-footer">
                Hesabınız yok mu? <a onclick="window.app.router.navigate('register')" class="auth-link" style="font-weight: 700;">Hemen Kayıt Olun</a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed var(--border); text-align: center;">
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">Teknik bir sorun mu yaşıyorsunuz?</p>
                <button onclick="window.app.auth.resetState()" class="btn-outline" style="font-size: 0.7rem; padding: 5px 15px; border-color: #ff4d4f; color: #ff4d4f;">
                    Sistemi Sıfırla ve Yeniden Başlat
                </button>
            </div>
        </div>
    </div>
    `;
};


