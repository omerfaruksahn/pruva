export function renderNotificationsTab(user) {
    const prefs = user.notificationPreferences || { email: true, opportunities: true, announcements: false };
    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> Geri
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Bildirim Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2>Bildirim Tercihleri</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Hangi durumlarda haber almak istediğinizi seçin.</p>
            </div>
            <button class="btn-primary" style="padding: 8px 24px; font-size: 0.85rem;" onclick="window.settingsManager.saveNotifications()">Değişiklikleri Kaydet</button>
        </div>

        <div class="security-card">
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1; padding-right: 15px;">
                        <h4 style="margin-bottom: 4px;">Yeni Teklif Bildirimleri</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Yayınladığınız ilanlara yeni teklif geldiğinde anında e-posta alın.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="notify-new-bid" ${prefs.email !== false ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px;">
                    <div style="flex: 1; padding-right: 15px;">
                        <h4 style="margin-bottom: 4px;">Pazaryeri Fırsatları</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Profilinize ve ilgi alanlarınıza en uygun yeni yük ilanlarından haberdar olun.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="notify-ops" ${prefs.opportunities !== false ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px;">
                    <div style="flex: 1; padding-right: 15px;">
                        <h4 style="margin-bottom: 4px;">Sistem Duyuruları</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Platform güncellemeleri, önemli sistem bakımları ve resmi duyurular.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="notify-sys" ${prefs.announcements === true ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    </div>`;
}