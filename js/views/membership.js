window.membershipView = (state) => {
    const currentSub = state.subscriptionType || 'none';
    const expiresAt = state.subscriptionExpiresAt;
    
    // Abonelik süresi kontrolü
    let daysLeft = 0;
    if (expiresAt) {
        const diff = new Date(expiresAt) - new Date();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const isExpired = expiresAt && daysLeft <= 0;
    const activeSub = (currentSub !== 'none' && !isExpired) ? currentSub : 'none';

    return `
        <div class="view-membership">
            <header class="membership-hero">
                <div class="membership-status-pill ${activeSub === 'premium' ? 'active' : ''}">
                    <span class="indicator"></span>
                    ${activeSub === 'none' ? window.i18n.t('membership.free_member') : window.i18n.t('membership.premium_member')}
                    ${activeSub !== 'none' ? ` — ` + window.i18n.t('membership.days_left').replace('{days}', daysLeft) : ''}
                </div>
                <h1 data-i18n="membership.title">Üyelik Planınızı Seçin</h1>
                <p data-i18n="membership.subtitle">Lojistik ağınızı büyütmek için size en uygun planı seçin. İstediğiniz zaman iptal edebilirsiniz.</p>
            </header>

            <div class="membership-card-container">
                <!-- Premium Plan -->
                <div class="premium-saas-card ${activeSub === 'premium' ? 'is-active' : ''}">
                    <div class="premium-badge-icon">
                        <i data-lucide="crown"></i>
                    </div>
                    
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);" data-i18n="membership.premium_plan">Premium Plan</h3>
                    
                    <div class="premium-price-block">
                        <span class="currency">₺</span>
                        <span class="amount">1250</span>
                        <span class="period" data-i18n="membership.per_month">/ay</span>
                    </div>
                    
                    <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;" data-i18n="membership.premium_desc">
                        Profesyonel lojistik yönetimi için tüm özellikleri açan, gelişmiş filtreleme ve analiz içeren tam paket.
                    </p>
                    
                    <ul class="premium-features-list">
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span data-i18n="membership.f1">Sınırsız İlan Detayı & Teklif Verme</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span data-i18n="membership.f2">Gelişmiş Akıllı Filtreleme</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span data-i18n="membership.f3">Bölgesel ve Sektörel Analizler</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span data-i18n="membership.f4">Öncelikli Destek Hattı</span>
                        </li>
                    </ul>
                    
                    <button class="btn-premium-subscribe" onclick="window.membershipManager.subscribe('premium', 1250)" ${activeSub === 'premium' ? 'disabled' : ''}>
                        ${activeSub === 'premium' ? `<i data-lucide="check"></i> <span data-i18n="membership.active_plan">Aktif Plan</span>` : `<i data-lucide="zap"></i> <span data-i18n="membership.start_premium">Premium Planı Başlat</span>`}
                    </button>
                </div>
            </div>

            <div class="membership-history-section">
                <h3>
                    <i data-lucide="credit-card" style="width: 24px; height: 24px; color: #ca8a04;"></i>
                    <span data-i18n="membership.history_title">Ödeme ve Abonelik Geçmişi</span>
                </h3>
                <div id="membership-history-table" class="history-table-glass">
                    <!-- Tablo buraya yüklenecek -->
                </div>
            </div>
        </div>
    `;
};
