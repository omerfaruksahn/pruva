export function renderMembershipTab(state) {
    const activeSub = window.utils.getSubscriptionStatus(state);
    const expiresAt = state.subscriptionExpiresAt;
    let daysLeft = 0;
    if (expiresAt) {
        const diff = new Date(expiresAt) - new Date();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return `
    <div class="settings-section">
        <div class="mobile-back-header">
            <button class="mobile-back-btn" onclick="window.backToSettingsMenu()">
                <i data-lucide="chevron-left"></i> Geri
            </button>
            <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Abonelik Ayarları</span>
        </div>
        <div class="settings-header">
            <div>
                <h2>Üyelik ve Abonelik</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Mevcut planınızı yönetin ve faturalandırma geçmişinizi görün.</p>
            </div>
            <button class="btn-primary" onclick="window.app.router.navigate('membership')">Plan Değiştir</button>
        </div>

        <div class="security-card ${activeSub !== 'none' ? 'active-sub-card' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div class="security-card-icon" style="background: ${activeSub === 'premium' ? '#fef3c7' : activeSub === 'silver' ? '#f1f5f9' : '#f3f4f6'}; color: ${activeSub === 'premium' ? '#d97706' : '#64748b'};">
                        <i data-lucide="${activeSub === 'premium' ? 'crown' : 'award'}"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 2px;">${activeSub === 'none' ? 'Standart Üyelik' : activeSub.toUpperCase() + ' Üyelik'}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">${activeSub === 'none' ? 'Sınırlı özellikler' : 'Tüm profesyonel özellikler aktif'}</p>
                    </div>
                </div>
                ${activeSub !== 'none' ? `<div class="status-badge success">${daysLeft} Gün Kaldı</div>` : '<div class="status-badge">Ücretsiz</div>'}
            </div>
            
            ${activeSub !== 'none' ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Sonraki faturalandırma: <strong>${new Date(expiresAt).toLocaleDateString('tr-TR')}</strong>
                    </div>
                    <button class="btn-outline" style="color: var(--danger); border-color: #fee2e2; padding: 6px 12px; font-size: 0.75rem;" onclick="if(window.notificationManager) window.notificationManager.showToast('Aboneliğiniz dönem sonunda iptal edilecek şekilde ayarlandı.', 'info')">Aboneliği İptal Et</button>
                </div>
            ` : `
                <div style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; display: flex; gap: 12px; align-items: center;">
                    <i data-lucide="info" style="color: #3498db; width: 20px;"></i>
                    <p style="font-size: 0.85rem; color: #2c3e50; margin: 0;">Teklif verebilmek ve detaylı analizlere ulaşmak için bir üst plana geçebilirsiniz.</p>
                </div>
            `}
        </div>

        <h3 class="section-subtitle" style="margin-top: 32px;">Faturalandırma Geçmişi</h3>
        <div id="settings-billing-history">
            <p style="color: var(--text-muted); font-size: 0.85rem; padding: 20px; text-align: center;">Henüz bir fatura kaydı bulunmuyor.</p>
        </div>
    </div>`;
}