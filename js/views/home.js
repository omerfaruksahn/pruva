window.homeView = (state) => {
    const totalAds = state.ads.length;
    const activeAds = state.ads.filter(a => a.status === 'pending' || a.status === 'bidded').length;
    const totalBids = state.ads.reduce((acc, ad) => acc + (ad.bids ? ad.bids.length : 0), 0);
    const completedShipments = state.ads.filter(a => a.status === 'completed').length;
    const recentAds = state.ads.filter(a => a.status === 'pending').slice(0, 6);
    const totalPorts = Object.values(window.logisticsKnowledge.ports).flat().length;

    return `
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge" style="background: rgba(59, 130, 246, 0.15) !important; color: #60a5fa !important; border: 1px solid rgba(59, 130, 246, 0.3) !important;">
                <i data-lucide="sparkles" style="width: 14px; height: 14px; margin-right: 8px;"></i>
                Türkiye'nin Dijital Lojistik Operatörü
            </div>
            <h1>Yükünüzü Geleceğe Taşıyın</h1>
            <p>Onlarca doğrulanmış lojistik firmasından anında teklif alın. Deniz, kara ve havayolu çözümleriyle işinizi büyütün.</p>
            <div class="hero-buttons">
                <button class="btn-primary hero-btn" onclick="window.app.router.navigate('marketplace')">
                    Pazaryerini Keşfet
                    <i data-lucide="arrow-right" style="width: 18px; height: 18px; margin-left: 8px;"></i>
                </button>
                <button class="btn-primary hero-btn hero-btn-alt" onclick="window.app.router.navigate('post-ad')">Hemen İlan Ver</button>
            </div>
        </div>
    </section>

    <!-- Live Stats Bar -->
    <div class="container">
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-number">${totalAds.toLocaleString('tr-TR')}</div>
                <div class="stat-label">Toplam İlan</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${activeAds.toLocaleString('tr-TR')}</div>
                <div class="stat-label">Aktif İlan</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${totalBids.toLocaleString('tr-TR')}</div>
                <div class="stat-label">Teklif Sayısı</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${totalPorts}+</div>
                <div class="stat-label">Global Liman</div>
            </div>
        </div>
    </div>

    <!-- How It Works -->
    <div class="container section-block">
        <div class="section-header">
            <h2>Sistem Nasıl İşler?</h2>
            <p>Karmaşık lojistik süreçlerini basitleştirdik</p>
        </div>
        <div class="steps-grid">
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-icon-wrapper"><i data-lucide="clipboard-edit"></i></div>
                <h3>Yükünüzü Tanımlayın</h3>
                <p>İhtiyacınızı detaylandırın. 2 dakika içinde ilanınız yayına alınsın.</p>
            </div>
            <div class="step-arrow"><i data-lucide="chevron-right"></i></div>
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-icon-wrapper"><i data-lucide="banknote"></i></div>
                <h3>Teklifleri Karşılaştırın</h3>
                <p>Global firmalardan gelen şeffaf teklifleri değerlendirin.</p>
            </div>
            <div class="step-arrow"><i data-lucide="chevron-right"></i></div>
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-icon-wrapper"><i data-lucide="ship"></i></div>
                <h3>Süreci Yönetin</h3>
                <p>Anlaşmayı onaylayın ve yükünüzü varış noktasına kadar izleyin.</p>
            </div>
        </div>
    </div>

    <!-- Why Pruva -->
    <div class="container section-block">
        <div class="section-header">
            <h2>Neden Pruva?</h2>
            <p>Profesyonel operasyonel mükemmellik</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-blue"><i data-lucide="zap"></i></div>
                <h3>Hız ve Verimlilik</h3>
                <p>Teklif alma süreçlerini %80 hızlandırarak zaman tasarrufu sağlayın.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-green"><i data-lucide="shield-check"></i></div>
                <h3>Tam Güvenlik</h3>
                <p>Doğrulanmış şirket profilleri ve şeffaf değerlendirme sistemi.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-amber"><i data-lucide="map-pin"></i></div>
                <h3>Anlık İzlenebilirlik</h3>
                <p>Tüm aşamaları panelinizden adım adım takip edin.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-indigo"><i data-lucide="globe"></i></div>
                <h3>Küresel Erişim</h3>
                <p>Dünya çapında ${totalPorts}+ liman ve stratejik nokta ağı.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-rose"><i data-lucide="message-square"></i></div>
                <h3>Kesintisiz İletişim</h3>
                <p>Gelişmiş mesajlaşma altyapısı ile doğrudan koordinasyon.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-cyan"><i data-lucide="bar-chart-3"></i></div>
                <h3>Veri Analitiği</h3>
                <p>Lojistik maliyetlerinizi analiz edin ve optimize edin.</p>
            </div>
        </div>
    </div>

    <!-- Transport Modes -->
    <div class="container section-block">
        <div class="section-header">
            <h2>Lojistik Çözümleri</h2>
            <p>Her yük için özelleştirilmiş taşıma modları</p>
        </div>
        <div class="transport-modes-grid">
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="ship"></i></div>
                <h3>Deniz Yolu</h3>
                <p>FCL/LCL, Konteyner ve Proje Kargo çözümleri.</p>
                <div class="tm-badge">Global Limanlar</div>
            </div>
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="truck"></i></div>
                <h3>Kara Yolu</h3>
                <p>FTL/LTL ve Komple Tır taşımacılığı.</p>
                <div class="tm-badge">Tüm Avrupa</div>
            </div>
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="plane"></i></div>
                <h3>Hava Yolu</h3>
                <p>Express ve Standart havayolu kargo.</p>
                <div class="tm-badge">En Hızlı Seçenek</div>
            </div>
        </div>
    </div>

    <!-- Pruva Ecosystem -->
    <div class="container section-block">
        <div class="section-header">
            <h2>Pruva Ekosistemi</h2>
            <p>Sadece bir pazaryeri değil, lojistik çözüm ortağınız</p>
        </div>
        <div class="ecosystem-grid">
            <div class="ecosystem-card education">
                <div class="eco-content">
                    <div class="eco-badge">Eğitim Portalı</div>
                    <h3>Pruva Akademi</h3>
                    <p>16 modülden oluşan kapsamlı müfredatımızla lojistik dünyasında uzmanlaşın. Freight forwarder operasyonlarından gümrük süreçlerine kadar her şey burada.</p>
                    <ul class="eco-features">
                        <li><i data-lucide="check-circle-2"></i> 16 Kapsamlı Modül</li>
                        <li><i data-lucide="check-circle-2"></i> Profesyonel Sözlük & Terimler</li>
                        <li><i data-lucide="check-circle-2"></i> İnteraktif Hesaplama Araçları</li>
                    </ul>
                    <button class="btn-primary eco-btn" onclick="window.app.router.navigate('education')">Keşfetmeye Başla</button>
                </div>
                <div class="eco-image">
                    <i data-lucide="graduation-cap"></i>
                </div>
            </div>

            <div class="ecosystem-card ai-special" onclick="window.app.router.navigate('pruva-ai')" style="cursor: pointer;">
                <div class="eco-content">
                    <div class="eco-badge">Yapay Zeka</div>
                    <h3>Pruva AI</h3>
                    <p>Şirket mailinize entegre, teklifleri otomatik analiz eden ve sizin yerinize en iyi fiyatı pazarlık eden akıllı asistan.</p>
                    <div class="ai-status" style="background: rgba(16, 185, 129, 0.1); color: #34d399;">
                        <span class="status-dot" style="background: #10b981;"></span>
                        Pricing Modülü Aktif
                    </div>
                    <ul class="eco-features">
                        <li><i data-lucide="mail"></i> Otomatik Mail Tarama</li>
                        <li><i data-lucide="brain-circuit"></i> Akıllı Teklif Analizi</li>
                        <li><i data-lucide="trending-down"></i> Otomatik Fiyat Pazarlığı</li>
                    </ul>
                    <button class="btn-primary eco-btn ai-btn" style="background: var(--accent); color: #0f172a; border-color: var(--accent);">Şimdi Keşfet</button>
                </div>
                <div class="eco-image">
                    <i data-lucide="bot"></i>
                </div>
            </div>
        </div>
    </div>

    `;
};
