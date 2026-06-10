export function renderMembershipTab(state) {
    const activeSub = window.utils.getSubscriptionStatus(state);
    const expiresAt = state.subscriptionExpiresAt;
    let daysLeft = 0;
    if (expiresAt) {
        const diff = new Date(expiresAt) - new Date();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const currentLang = window.i18n?.currentLang || 'tr';
    const dateLocale = currentLang === 'tr' ? 'tr-TR' : currentLang === 'zh' ? 'zh-CN' : currentLang === 'ru' ? 'ru-RU' : currentLang === 'es' ? 'es-ES' : 'en-US';

    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> <span data-i18n="comp.membership_settings.back">Geri</span>
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);" data-i18n="comp.membership_settings.title">Abonelik Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2 data-i18n="comp.membership_settings.header_title">Üyelik ve Abonelik</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;" data-i18n="comp.membership_settings.header_desc">Mevcut planınızı yönetin ve faturalandırma geçmişinizi görün.</p>
            </div>
            <button class="btn-primary" onclick="window.app.router.navigate('membership')" data-i18n="comp.membership_settings.change_plan">Plan Değiştir</button>
        </div>

        <div class="security-card ${activeSub !== 'none' ? 'active-sub-card' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div class="security-card-icon" style="background: ${activeSub === 'premium' ? '#fef3c7' : activeSub === 'silver' ? '#f1f5f9' : '#f3f4f6'}; color: ${activeSub === 'premium' ? '#d97706' : '#64748b'};">
                        <i data-lucide="${activeSub === 'premium' ? 'crown' : 'award'}"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 2px;">${activeSub === 'none' ? window.i18n.t('comp.membership_settings.standard_membership') : activeSub.toUpperCase() + ' ' + window.i18n.t('comp.membership_settings.active_membership_suffix')}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">${activeSub === 'none' ? window.i18n.t('comp.membership_settings.limited_features') : window.i18n.t('comp.membership_settings.all_features_active')}</p>
                    </div>
                </div>
                ${activeSub !== 'none' ? `<div class="status-badge success">${window.i18n.t('comp.membership_settings.days_left').replace('{{days}}', daysLeft)}</div>` : `<div class="status-badge">${window.i18n.t('comp.membership_settings.free')}</div>`}
            </div>
            
            ${activeSub !== 'none' ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        ${window.i18n.t('comp.membership_settings.next_billing')} <strong>${new Date(expiresAt).toLocaleDateString(dateLocale)}</strong>
                    </div>
                    <button class="btn-outline" style="color: var(--danger); border-color: #fee2e2; padding: 6px 12px; font-size: 0.75rem;" onclick="if(window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.membership_settings.toast_cancelled'), 'info')" data-i18n="comp.membership_settings.cancel_sub">Aboneliği İptal Et</button>
                </div>
            ` : `
                <div style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; display: flex; gap: 12px; align-items: center;">
                    <i data-lucide="info" style="color: #3498db; width: 20px;"></i>
                    <p style="font-size: 0.85rem; color: #2c3e50; margin: 0;" data-i18n="comp.membership_settings.upgrade_desc">Teklif verebilmek ve detaylı analizlere ulaşmak için bir üst plana geçebilirsiniz.</p>
                </div>
            `}
        </div>

        <h3 class="section-subtitle" style="margin-top: 32px;" data-i18n="comp.membership_settings.billing_history">Faturalandırma Geçmişi</h3>
        <div id="settings-billing-history">
            <p style="color: var(--text-muted); font-size: 0.85rem; padding: 20px; text-align: center;" data-i18n="comp.membership_settings.no_billing_records">Henüz bir fatura kaydı bulunmuyor.</p>
        </div>
    </div>`;
}