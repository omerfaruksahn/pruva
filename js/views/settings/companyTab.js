export function renderCompanyTab(user) {
    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> <span data-i18n="settings.company.back">Geri</span>
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);" data-i18n="settings.company.title">Şirket Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2 data-i18n="settings.company.header_title">Şirket Detayları</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;" data-i18n="settings.company.header_desc">Resmi şirket bilgileri ve fatura detayları.</p>
            </div>
            <button class="btn-primary" onclick="window.settingsManager.saveCompany()" data-i18n="settings.company.save">Değişiklikleri Kaydet</button>
        </div>

        <div class="settings-grid">
            <div class="input-group">
                <label data-i18n="settings.company.name">Şirket Ünvanı</label>
                <input type="text" value="${user.name} A.Ş.">
            </div>
            <div class="input-group">
                <label data-i18n="settings.company.tax_number">Vergi Numarası / VKN</label>
                <input type="text" value="${user.taxNumber || '1234567890'}">
            </div>
            <div class="input-group">
                <label data-i18n="settings.company.tax_office">Vergi Dairesi</label>
                <input type="text" value="Büyük Mükellefler V.D.">
            </div>
            <div class="input-group">
                <label data-i18n="settings.company.founded_year">Kuruluş Yılı</label>
                <input type="number" value="2015">
            </div>
        </div>

        <div class="input-group">
            <label data-i18n="settings.company.address">Şirket Adresi</label>
            <textarea style="height: 100px;">Maslak Mah. Büyükdere Cad. No:123, Sarıyer, İstanbul</textarea>
        </div>
    </div>`;
}