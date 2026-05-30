window.registerView = (state) => {
    return `
    <div class="auth-wrapper">
        <div class="card auth-card" style="max-width: 550px;">
            <div class="auth-header">
                <h2 class="auth-title">Hesap Oluştur</h2>
                <p class="auth-subtitle">Ücretsiz kayıt olun ve lojistik dünyasına katılın</p>
            </div>

            <form id="register-form" class="auth-form">
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group auth-form-group">
                        <label>Şirket Adı</label>
                        <input type="text" name="companyName" class="form-control auth-input" placeholder="Lojistik A.Ş." required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label>Şirket Türü</label>
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
                        <label>Vergi Dairesi</label>
                        <input type="text" name="taxOffice" class="form-control" placeholder="Örn: Beyoğlu V.D." required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label>Vergi Numarası (VKN/TCKN)</label>
                        <input type="text" name="taxNumber" class="form-control" placeholder="10 veya 11 haneli" maxlength="11" required>
                    </div>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group auth-form-group">
                        <label>Telefon Numarası</label>
                        <input type="tel" name="phone" class="form-control" placeholder="05XX XXX XX XX" required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label>Rolünüz</label>
                        <select name="role" class="form-control" required>
                            <option value="loader">Yükleyici (İhracatçı/İthalatçı)</option>
                            <option value="carrier">Taşıyıcı (Nakliye Firması)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group auth-form-group" style="margin-bottom: 20px;">
                    <label>Firma Adresi</label>
                    <textarea name="address" class="form-control" placeholder="Açık adresinizi giriniz..." rows="2" required></textarea>
                </div>

                <div class="form-group auth-form-group">
                    <label>E-posta Adresi <span style="font-size: 0.7rem; color: #e74c3c;">(Sadece kurumsal e-posta kabul edilir)</span></label>
                    <input type="email" name="email" class="form-control" placeholder="ornek@sirketadi.com" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 8px;" class="grid-2col">
                    <div class="form-group auth-form-group">
                        <label>Şifre</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <div class="form-group auth-form-group">
                        <label>Şifre (Tekrar)</label>
                        <input type="password" name="passwordConfirm" class="form-control" placeholder="••••••••" required>
                    </div>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 20px;">* Şifre en az 12 karakter olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.</p>

                <div style="margin-bottom: 25px;">
                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                        <input type="checkbox" name="terms" required style="margin-top: 4px;">
                        <span><a onclick="window.legalModal.show('term')" class="auth-link">Kullanım Koşulları</a> ve <a onclick="window.legalModal.show('kvkk')" class="auth-link">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum.</span>
                    </label>
                </div>

                <button type="submit" class="btn-primary auth-submit-btn">Kayıt İşlemini Tamamla</button>
            </form>

            <div class="auth-footer">
                Zaten hesabınız var mı? <a onclick="window.app.router.navigate('login')" class="auth-link" style="font-weight: 700;">Giriş Yapın</a>
            </div>
        </div>
    </div>
    `;
};
