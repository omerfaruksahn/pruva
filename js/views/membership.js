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
                    ${activeSub === 'none' ? 'Ücretsiz Üye' : 'Premium Üye'}
                    ${activeSub !== 'none' ? ` — Kalan Süre: ${daysLeft} Gün` : ''}
                </div>
                <h1>Üyelik Planınızı Seçin</h1>
                <p>Lojistik ağınızı büyütmek için size en uygun planı seçin. İstediğiniz zaman iptal edebilirsiniz.</p>
            </header>

            <div class="membership-card-container">
                <!-- Premium Plan -->
                <div class="premium-saas-card ${activeSub === 'premium' ? 'is-active' : ''}">
                    <div class="premium-badge-icon">
                        <i data-lucide="crown"></i>
                    </div>
                    
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Premium Plan</h3>
                    
                    <div class="premium-price-block">
                        <span class="currency">₺</span>
                        <span class="amount">1250</span>
                        <span class="period">/ay</span>
                    </div>
                    
                    <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;">
                        Profesyonel lojistik yönetimi için tüm özellikleri açan, gelişmiş filtreleme ve analiz içeren tam paket.
                    </p>
                    
                    <ul class="premium-features-list">
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span>Sınırsız İlan Detayı & Teklif Verme</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span>Gelişmiş Akıllı Filtreleme</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span>Bölgesel ve Sektörel Analizler</span>
                        </li>
                        <li>
                            <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                            <span>Öncelikli Destek Hattı</span>
                        </li>
                    </ul>
                    
                    <button class="btn-premium-subscribe" onclick="window.membershipManager.subscribe('premium', 1250)" ${activeSub === 'premium' ? 'disabled' : ''}>
                        ${activeSub === 'premium' ? '<i data-lucide="check"></i> Aktif Plan' : '<i data-lucide="zap"></i> Premium Planı Başlat'}
                    </button>
                </div>
            </div>

            <div class="membership-history-section">
                <h3>
                    <i data-lucide="credit-card" style="width: 24px; height: 24px; color: #ca8a04;"></i>
                    Ödeme ve Abonelik Geçmişi
                </h3>
                <div id="membership-history-table" class="history-table-glass">
                    <!-- Tablo buraya yüklenecek -->
                </div>
            </div>
        </div>
    `;
};
