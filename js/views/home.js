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
                <span data-i18n="home.hero_badge">Türkiye'nin Dijital Lojistik Operatörü</span>
            </div>
            <h1 data-i18n="home.hero_title">Yükünüzü Geleceğe Taşıyın</h1>
            <p data-i18n="home.hero_desc">Onlarca doğrulanmış lojistik firmasından anında teklif alın. Deniz, kara ve havayolu çözümleriyle işinizi büyütün.</p>
            <div class="hero-buttons">
                <button class="btn-primary hero-btn" onclick="window.app.router.navigate('marketplace')">
                    <span data-i18n="home.hero_btn_explore">Pazaryerini Keşfet</span>
                    <i data-lucide="arrow-right" style="width: 18px; height: 18px; margin-left: 8px;"></i>
                </button>
                <button class="btn-primary hero-btn hero-btn-alt" onclick="window.app.router.navigate('post-ad')" data-i18n="home.hero_btn_post">Hemen İlan Ver</button>
            </div>
        </div>
    </section>

    <!-- Live Stats Bar -->
    <div class="container">
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-number">${totalAds.toLocaleString('tr-TR')}</div>
                <div class="stat-label" data-i18n="home.stats_total_ads">Toplam İlan</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${activeAds.toLocaleString('tr-TR')}</div>
                <div class="stat-label" data-i18n="home.stats_active_ads">Aktif İlan</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${totalBids.toLocaleString('tr-TR')}</div>
                <div class="stat-label" data-i18n="home.stats_bids">Teklif Sayısı</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <div class="stat-number">${totalPorts}+</div>
                <div class="stat-label" data-i18n="home.stats_ports">Global Liman</div>
            </div>
        </div>
    </div>

    <!-- How It Works -->
    <div class="container section-block">
        <div class="section-header">
            <h2 data-i18n="home.how_it_works_title">Sistem Nasıl İşler?</h2>
            <p data-i18n="home.how_it_works_desc">Karmaşık lojistik süreçlerini basitleştirdik</p>
        </div>
        <div class="steps-grid">
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-icon-wrapper"><i data-lucide="clipboard-edit"></i></div>
                <h3 data-i18n="home.step1_title">Yükünüzü Tanımlayın</h3>
                <p data-i18n="home.step1_desc">İhtiyacınızı detaylandırın. 2 dakika içinde ilanınız yayına alınsın.</p>
            </div>
            <div class="step-arrow"><i data-lucide="chevron-right"></i></div>
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-icon-wrapper"><i data-lucide="banknote"></i></div>
                <h3 data-i18n="home.step2_title">Teklifleri Karşılaştırın</h3>
                <p data-i18n="home.step2_desc">Global firmalardan gelen şeffaf teklifleri değerlendirin.</p>
            </div>
            <div class="step-arrow"><i data-lucide="chevron-right"></i></div>
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-icon-wrapper"><i data-lucide="ship"></i></div>
                <h3 data-i18n="home.step3_title">Süreci Yönetin</h3>
                <p data-i18n="home.step3_desc">Anlaşmayı onaylayın ve yükünüzü varış noktasına kadar izleyin.</p>
            </div>
        </div>
    </div>

    <!-- Why Pruva -->
    <div class="container section-block">
        <div class="section-header">
            <h2 data-i18n="home.why_title">Neden Pruva?</h2>
            <p data-i18n="home.why_desc">Profesyonel operasyonel mükemmellik</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-blue"><i data-lucide="zap"></i></div>
                <h3 data-i18n="home.feature1_title">Hız ve Verimlilik</h3>
                <p data-i18n="home.feature1_desc">Teklif alma süreçlerini %80 hızlandırarak zaman tasarrufu sağlayın.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-green"><i data-lucide="shield-check"></i></div>
                <h3 data-i18n="home.feature2_title">Tam Güvenlik</h3>
                <p data-i18n="home.feature2_desc">Doğrulanmış şirket profilleri ve şeffaf değerlendirme sistemi.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-amber"><i data-lucide="map-pin"></i></div>
                <h3 data-i18n="home.feature3_title">Anlık İzlenebilirlik</h3>
                <p data-i18n="home.feature3_desc">Tüm aşamaları panelinizden adım adım takip edin.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-indigo"><i data-lucide="globe"></i></div>
                <h3 data-i18n="home.feature4_title">Küresel Erişim</h3>
                <p><span data-i18n="home.feature4_desc">Dünya çapında liman ve stratejik nokta ağı.</span></p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-rose"><i data-lucide="message-square"></i></div>
                <h3 data-i18n="home.feature5_title">Kesintisiz İletişim</h3>
                <p data-i18n="home.feature5_desc">Gelişmiş mesajlaşma altyapısı ile doğrudan koordinasyon.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon-wrapper fi-cyan"><i data-lucide="bar-chart-3"></i></div>
                <h3 data-i18n="home.feature6_title">Veri Analitiği</h3>
                <p data-i18n="home.feature6_desc">Lojistik maliyetlerinizi analiz edin ve optimize edin.</p>
            </div>
        </div>
    </div>

    <!-- Transport Modes -->
    <div class="container section-block">
        <div class="section-header">
            <h2 data-i18n="home.modes_title">Lojistik Çözümleri</h2>
            <p data-i18n="home.modes_desc">Her yük için özelleştirilmiş taşıma modları</p>
        </div>
        <div class="transport-modes-grid">
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="ship"></i></div>
                <h3 data-i18n="home.mode1_title">Deniz Yolu</h3>
                <p data-i18n="home.mode1_desc">FCL/LCL, Konteyner ve Proje Kargo çözümleri.</p>
                <div class="tm-badge" data-i18n="home.mode1_badge">Global Limanlar</div>
            </div>
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="truck"></i></div>
                <h3 data-i18n="home.mode2_title">Kara Yolu</h3>
                <p data-i18n="home.mode2_desc">FTL/LTL ve Komple Tır taşımacılığı.</p>
                <div class="tm-badge" data-i18n="home.mode2_badge">Tüm Avrupa</div>
            </div>
            <div class="transport-mode-card">
                <div class="tm-icon-wrapper"><i data-lucide="plane"></i></div>
                <h3 data-i18n="home.mode3_title">Hava Yolu</h3>
                <p data-i18n="home.mode3_desc">Express ve Standart havayolu kargo.</p>
                <div class="tm-badge" data-i18n="home.mode3_badge">En Hızlı Seçenek</div>
            </div>
        </div>
    </div>

    <!-- Pruva Ecosystem -->
    <div class="container section-block">
        <div class="section-header">
            <h2 data-i18n="home.eco_title">Pruva Ekosistemi</h2>
            <p data-i18n="home.eco_desc">Sadece bir pazaryeri değil, lojistik çözüm ortağınız</p>
        </div>
        <div class="ecosystem-grid">
            <div class="ecosystem-card education">
                <div class="eco-content">
                    <div class="eco-badge" data-i18n="home.campus_badge">Eğitim Merkezi</div>
                    <h3 data-i18n="home.campus_title">Pruva Kampüs</h3>
                    <p data-i18n="home.campus_desc">Öğretmenlerin ve sektör uzmanlarının kendi yazdıkları kitaplara, makalelere ve videolara ulaşın. Pruva Kampüs ile doğrudan uzmanlardan öğrenin ve kariyerinizi geliştirin.</p>
                    <ul class="eco-features">
                        <li><i data-lucide="check-circle-2"></i> <span data-i18n="home.campus_f1">Yüzlerce Kitap & Makale</span></li>
                        <li><i data-lucide="check-circle-2"></i> <span data-i18n="home.campus_f2">Uzman Eğitmenlerden İçerikler</span></li>
                        <li><i data-lucide="check-circle-2"></i> <span data-i18n="home.campus_f3">Kendi Dijital Kütüphanen</span></li>
                    </ul>
                    <button class="btn-primary eco-btn" onclick="window.app.router.navigate('education')" data-i18n="home.campus_btn">Kampüsü Keşfet</button>
                </div>
                <div class="eco-image">
                    <i data-lucide="library"></i>
                </div>
            </div>

            <div class="ecosystem-card ai-special" onclick="window.app.router.navigate('pruva-ai')" style="cursor: pointer;">
                <div class="eco-content">
                    <div class="eco-badge" data-i18n="home.ai_badge">Yapay Zeka</div>
                    <h3 data-i18n="home.ai_title">Pruva AI</h3>
                    <p data-i18n="home.ai_desc">Şirket mailinize entegre, teklifleri otomatik analiz eden ve sizin yerinize en iyi fiyatı pazarlık eden akıllı asistan.</p>
                    <div class="ai-status" style="background: rgba(16, 185, 129, 0.1); color: #34d399;">
                        <span class="status-dot" style="background: #10b981;"></span>
                        <span data-i18n="home.ai_status">Pricing Modülü Aktif</span>
                    </div>
                    <ul class="eco-features">
                        <li><i data-lucide="mail"></i> <span data-i18n="home.ai_f1">Otomatik Mail Tarama</span></li>
                        <li><i data-lucide="brain-circuit"></i> <span data-i18n="home.ai_f2">Akıllı Teklif Analizi</span></li>
                        <li><i data-lucide="trending-down"></i> <span data-i18n="home.ai_f3">Otomatik Fiyat Pazarlığı</span></li>
                    </ul>
                    <button class="btn-primary eco-btn ai-btn" style="background: var(--accent); color: #0f172a; border-color: var(--accent);" data-i18n="home.ai_btn">Şimdi Keşfet</button>
                </div>
                <div class="eco-image">
                    <i data-lucide="bot"></i>
                </div>
            </div>
        </div>
    </div>

    `;
};
