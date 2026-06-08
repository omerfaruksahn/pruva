window.registerView = (state) => {
    return `
    <div class="auth-wrapper">
        <div class="card auth-card" style="max-width: 550px;">
            <div class="auth-header">
                <h2 class="auth-title" data-i18n="auth.register.title">Hesap Oluştur</h2>
                <p class="auth-subtitle" data-i18n="auth.register.subtitle">Ücretsiz kayıt olun ve lojistik dünyasına katılın</p>
            </div>

            <form id="register-form" class="auth-form">
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.company_name">Şirket Adı</label>
                        <input type="text" name="companyName" class="form-control auth-input" placeholder="Lojistik A.Ş." required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.company_type">Şirket Türü</label>
                        <select name="companyType" class="form-control" required>
                            <option value="Limited">Limited Şirket</option>
                            <option value="Anonim">Anonim Şirket</option>
                            <option value="Sahis">Şahıs Şirketi</option>
                            <option value="Kollektif">Kollektif Şirket</option>
                        </select>
                    </div>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.tax_office">Vergi Dairesi</label>
                        <input type="text" name="taxOffice" class="form-control" placeholder="Örn: Beyoğlu V.D." required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.tax_number">Vergi Numarası (VKN/TCKN)</label>
                        <input type="text" name="taxNumber" class="form-control" placeholder="10 veya 11 haneli" maxlength="11" required>
                    </div>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.phone">Telefon Numarası</label>
                        <input type="tel" name="phone" class="form-control" placeholder="05XX XXX XX XX" required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.role">Rolünüz</label>
                        <select name="role" class="form-control" required>
                            <option value="loader" data-i18n="auth.register.role_loader">Yükleyici (İhracatçı/İthalatçı)</option>
                            <option value="carrier" data-i18n="auth.register.role_carrier">Taşıyıcı (Nakliye Firması)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group auth-form-group" style="margin-bottom: 20px;">
                    <label data-i18n="auth.register.address">Firma Adresi</label>
                    <textarea name="address" class="form-control" placeholder="..." rows="2" required></textarea>
                </div>

                <div class="form-group auth-form-group">
                    <label><span data-i18n="auth.register.email">E-posta Adresi</span> <span style="font-size: 0.7rem; color: #e74c3c;" data-i18n="auth.register.email_hint">(Sadece kurumsal e-posta kabul edilir)</span></label>
                    <input type="email" name="email" class="form-control" placeholder="ornek@sirketadi.com" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 8px;" class="grid-2col">
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.password">Şifre</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label data-i18n="auth.register.password_confirm">Şifre (Tekrar)</label>
                        <input type="password" name="passwordConfirm" class="form-control" placeholder="••••••••" required>
                    </div>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 20px;" data-i18n="auth.register.password_hint">* Şifre en az 12 karakter olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.</p>

                <div style="margin-bottom: 25px;">
                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                        <input type="checkbox" name="terms" required style="margin-top: 4px;">
                        <span><a onclick="window.legalModal.show('term')" class="auth-link" data-i18n="auth.register.terms_link">Kullanım Koşulları</a> <span data-i18n="auth.register.terms_read">'ni okudum, onaylıyorum.</span> <a onclick="window.legalModal.show('kvkk')" class="auth-link" data-i18n="auth.register.kvkk_link">KVKK Aydınlatma Metni</a></span>
                    </label>
                </div>

                <button type="submit" class="btn-primary auth-submit-btn" data-i18n="auth.register.submit_btn">Kayıt İşlemini Tamamla</button>
            </form>

            <div class="auth-footer">
                <span data-i18n="auth.register.has_account">Zaten hesabınız var mı?</span> <a onclick="window.app.router.navigate('login')" class="auth-link" style="font-weight: 700;" data-i18n="auth.register.login_now">Giriş Yapın</a>
            </div>
        </div>
    </div>
    `;
};
