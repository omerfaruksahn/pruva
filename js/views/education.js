// Demo amaçlı arama fonksiyonu (Canlı Filtreleme)
window.handleCampusSearch = function(query) {
    const products = window.campusContent ? window.campusContent.products : [];
    const lowerQuery = query.toLowerCase();
    
    const filtered = products.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery)
    );
    
    const gridElement = document.querySelector('.up-grid');
    if(gridElement) {
        if(filtered.length === 0) {
            gridElement.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--up-text-muted);" data-i18n="edu.no_content">${window.t ? window.t('edu.no_content') : 'Aradığınız kriterlere uygun içerik bulunamadı.'}</div>`;
        } else {
            const appState = window.app && window.app.state ? window.app.state : {};
            const library = appState.campusLibrary || [];
            
            gridElement.innerHTML = filtered.map(p => {
                const typeLabel = p.type === 'book' ? `<span data-i18n="edu.report_ebook">${window.t ? window.t('edu.report_ebook') : 'Rapor / E-Kitap'}</span>` : p.type === 'article' ? `<span data-i18n="edu.article">${window.t ? window.t('edu.article') : 'Makale'}</span>` : `<span data-i18n="edu.training_set">${window.t ? window.t('edu.training_set') : 'Eğitim Seti'}</span>`;
                const isFavorited = library.includes(p.id);
                return `
                <div class="up-card" onclick="window.utils.viewCampusProduct('${p.id}')" style="position: relative;">
                    <button class="up-bookmark-btn ${isFavorited ? 'active' : ''}" onclick="window.toggleFavorite(event, '${p.id}')" title="${window.t ? window.t('edu.add_to_lib') : 'Kütüphaneme Ekle'}" data-i18n="[title]edu.add_to_lib">
                        <i data-lucide="bookmark" ${isFavorited ? 'fill="currentColor"' : ''}></i>
                    </button>
                    <div class="up-card-cover" style="background-image: url('${p.cover}')">
                        <div class="up-card-badge">${typeLabel}</div>
                    </div>
                    <div class="up-card-body">
                        <h3 class="up-card-title">${p.title}</h3>
                        <div class="up-card-footer">
                            <div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);" data-i18n="edu.free">${window.t ? window.t('edu.free') : 'Ücretsiz'}</div>
                            <div class="up-card-rating" style="color: var(--up-text-muted); font-weight: 600;">
                                <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i> ${p.id.length * 37 % 500 + 120}
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
        if(window.lucide) window.lucide.createIcons();
    }
};

// Demo amaçlı sayfa değiştirme simülasyonu (Global Scope)
window.mockChangePage = function(pageNum, btnElement) {
    // Tüm butonları pasif yap
    document.querySelectorAll('#campus-pagination .page-btn').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--up-text-body)';
        btn.style.border = '1px solid var(--up-border)';
        btn.style.boxShadow = 'none';
        btn.classList.remove('active');
    });
    
    // Tıklananı aktif yap
    btnElement.style.background = 'var(--up-primary)';
    btnElement.style.color = 'white';
    btnElement.style.border = 'none';
    btnElement.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    btnElement.classList.add('active');
    
    // Kampüs başlığına yumuşak kaydır
    const header = document.getElementById('campus-header-anchor');
    if(header) {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.educationView = (state) => {
    const app = window.app || { state };
    
    // State kontrolleri
    const viewState = app.state || {};
    const viewMode = viewState.campusViewMode || 'storefront'; // storefront, product_detail, library
    const category = viewState.campusCategory || 'all';
    const selectedId = viewState.campusSelectedProduct;
    const library = viewState.campusLibrary || [];

    // Auth kontrolü (Favorileme için)
    const isLoggedIn = !!(app.auth && app.auth.currentUser);

    // Data kontrolleri
    const content = window.campusContent;
    if (!content) {
        return `
            <div class="education-container">
                <div class="campus-main-content">
                    <div style="text-align:center; padding: 5rem;" data-i18n="edu.data_failed">Veri Yüklenemedi.</div>
                </div>
            </div>
        `;
    }

    const selectedProduct = selectedId ? content.products.find(p => p.id === selectedId) : null;

    // Favoriye Ekleme İşlevi (UI tabanlı)
    window.toggleFavorite = (e, id) => {
        if (e) e.stopPropagation();
        if (!isLoggedIn) {
            alert(window.t ? window.t('edu.login_to_favorite') : 'Favoriye eklemek için lütfen giriş yapın veya kayıt olun.');
            return;
        }
        
        const index = library.indexOf(id);
        if (index > -1) {
            library.splice(index, 1);
        } else {
            library.push(id);
        }
        
        // Re-render the view
        if(window.utils && window.utils.setCampusView) {
             window.utils.setCampusView(viewMode);
        }
    };

    // Slider ve İkon Kontrolleri (Global)
    window.goToSlide = (index) => {
        const container = document.getElementById('whisperContainer');
        const dots = document.querySelectorAll('.whisper-dot');
        if(container) {
            window.currentSlide = index;
            container.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => {
                dot.className = i === index ? 'whisper-dot active' : 'whisper-dot';
            });
        }
    };

    if (!window.whisperInterval) {
        window.currentSlide = 0;
        window.whisperInterval = setInterval(() => {
            if(document.getElementById('whisperContainer')) {
                const next = (window.currentSlide + 1) % 3;
                window.goToSlide(next);
            }
        }, 5000);
    }

    // Lucide ikonlarını HTML render olduktan sonra yenile
    setTimeout(() => {
        if(window.lucide) window.lucide.createIcons();
        if(window.i18n) window.i18n.updateDOM();
    }, 100);

    // Navigasyon
    const renderHeader = () => `
        <div class="up-header-bar">
            <h2 style="margin:0; font-size: 1.5rem; color: var(--up-text-title); font-weight: 800; letter-spacing: -0.5px;">Whisper</h2>
            <div class="up-filters">
                <button class="up-filter-pill ${viewMode !== 'library' ? 'active' : ''}" onclick="window.utils.setCampusView('storefront')">
                    <i data-lucide="compass"></i> <span data-i18n="edu.campus">Kampüs</span>
                </button>
                <button class="up-filter-pill ${viewMode === 'library' ? 'active' : ''}" onclick="window.utils.setCampusView('library')">
                    <i data-lucide="library"></i> <span data-i18n="edu.my_library">Kütüphanem</span>
                </button>
            </div>
        </div>
    `;

    // ---------------------------------------------------------
    // 1. STOREFRONT (KAMPÜS)
    // ---------------------------------------------------------
    const renderStorefront = () => {
        const filteredProducts = content.products;

        return `
            <!-- WHISPER SLIDER SECTION -->
            <div class="whisper-slider" id="whisperSlider">
                <div class="whisper-slides-container" id="whisperContainer">
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="zap" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> <span data-i18n="edu.industry_news">Sektörel Haberler</span></div>
                            <h1 class="whisper-title" data-i18n="edu.slide1_title">
                                Yeni Nesil <span class="whisper-highlight">Yeşil Lojistik</span> Trendleri
                            </h1>
                            <p class="whisper-desc" data-i18n="edu.slide1_desc">
                                Sürdürülebilirlik odaklı yeşil taşımacılık modelleri ile karbon ayak izini azaltın. Sektörün önde gelen liderlerinin analizlerini keşfedin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="trending-up" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> <span data-i18n="edu.case_study">Vaka Analizi</span></div>
                            <h1 class="whisper-title" data-i18n="edu.slide2_title">
                                Yapay Zeka ile <span class="whisper-highlight">Rota Optimizasyonu</span>
                            </h1>
                            <p class="whisper-desc" data-i18n="edu.slide2_desc">
                                Maliyetleri %30'a varan oranda düşüren yeni makine öğrenmesi algoritmaları lojistik ağlarını nasıl baştan yaratıyor? Gerçek verilerle inceleyin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="award" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> <span data-i18n="edu.new_training">Yeni Eğitim</span></div>
                            <h1 class="whisper-title" data-i18n="edu.slide3_title">
                                Global Tedarik Zinciri <span class="whisper-highlight">Kriz Yönetimi</span>
                            </h1>
                            <p class="whisper-desc" data-i18n="edu.slide3_desc">
                                Beklenmedik küresel krizlerde tedarik zincirini ayakta tutmanın altın kuralları ve modern kriz yönetim stratejilerini uzmanından dinleyin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>
                </div>
                <div class="whisper-controls">
                    <div class="whisper-dot active" onclick="window.goToSlide(0)"></div>
                    <div class="whisper-dot" onclick="window.goToSlide(1)"></div>
                    <div class="whisper-dot" onclick="window.goToSlide(2)"></div>
                </div>
            </div>

            <!-- KAMPÜS HEADER & FILTERS -->
            <div id="campus-header-anchor" style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--up-border); padding-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 4px; height: 28px; background: var(--up-primary); border-radius: 4px;"></div>
                    <h2 style="font-size: 2rem; font-weight: 800; color: var(--up-text-title); margin: 0; letter-spacing: -0.5px;" data-i18n="edu.campus">Kampüs</h2>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div style="position: relative;">
                        <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: var(--up-text-muted);"></i>
                        <input type="text" onkeyup="window.handleCampusSearch(this.value)" placeholder="İçerik, yazar veya konu ara..." data-i18n="[placeholder]edu.search_placeholder" style="padding: 8px 16px 8px 36px; border-radius: 20px; border: 1px solid var(--up-border); background: var(--up-surface-solid); font-size: 0.9rem; outline: none; width: 240px; transition: all 0.2s;">
                    </div>
                </div>
            </div>

            <!-- GRID -->
            <div class="up-grid">
                ${filteredProducts.map(p => {
                    const typeLabel = p.type === 'book' ? `<span data-i18n="edu.report_ebook">Rapor / E-Kitap</span>` : p.type === 'article' ? `<span data-i18n="edu.article">Makale</span>` : `<span data-i18n="edu.training_set">Eğitim Seti</span>`;
                    const isFavorited = library.includes(p.id);
                    
                    return `
                    <div class="up-card" onclick="window.utils.viewCampusProduct('${p.id}')" style="position: relative;">
                        <!-- Bookmark Button -->
                        <button class="up-bookmark-btn ${isFavorited ? 'active' : ''}" onclick="window.toggleFavorite(event, '${p.id}')" title="Kütüphaneme Ekle" data-i18n="[title]edu.add_to_lib">
                            <i data-lucide="bookmark" ${isFavorited ? 'fill="currentColor"' : ''}></i>
                        </button>
                        
                        <div class="up-card-cover" style="background-image: url('${p.cover}')">
                            <div class="up-card-badge">${typeLabel}</div>
                        </div>
                        <div class="up-card-body">
                            <h3 class="up-card-title">${p.title}</h3>
                            <div class="up-card-footer">
                                <div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);" data-i18n="edu.free">Ücretsiz</div>
                                <div class="up-card-rating" style="color: var(--up-text-muted); font-weight: 600;">
                                    <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i> ${p.id.length * 37 % 500 + 120}
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <!-- CLASSIC PAGINATION MOCK -->
            <div id="campus-pagination" style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 4rem; margin-bottom: 2rem;">
                <button style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--up-border); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--up-text-muted); transition: all 0.2s;">
                    <i data-lucide="chevron-left" style="width: 18px; height: 18px;"></i>
                </button>
                <button class="page-btn active" onclick="window.mockChangePage(1, this)" style="width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--up-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: all 0.2s;">1</button>
                <button class="page-btn" onclick="window.mockChangePage(2, this)" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--up-border); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--up-text-body); font-weight: 600; transition: all 0.2s;">2</button>
                <button class="page-btn" onclick="window.mockChangePage(3, this)" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--up-border); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--up-text-body); font-weight: 600; transition: all 0.2s;">3</button>
                <span style="color: var(--up-text-muted); margin: 0 4px; font-weight: 800;">...</span>
                <button class="page-btn" onclick="window.mockChangePage(25, this)" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--up-border); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--up-text-body); font-weight: 600; transition: all 0.2s;">25</button>
                <button style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--up-border); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--up-text-title); transition: all 0.2s;">
                    <i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            </div>
        `;
    };


    // ---------------------------------------------------------
    // 2. PRODUCT DETAIL (PDF VIEWER)
    // ---------------------------------------------------------
    const renderProductDetail = () => {
        if (!selectedProduct) return `<div>Bulunamadı</div>`;
        const p = selectedProduct;
        const isFavorited = library.includes(p.id);

        return `
            <div class="pdf-viewer-layout" oncontextmenu="return false;">
                <!-- PDF HEADER -->
                <div class="pdf-viewer-header">
                    <h2 class="pdf-viewer-title">
                        <button class="up-btn up-btn-secondary" onclick="window.utils.setCampusView('storefront')" style="padding: 6px 12px;">
                            <i data-lucide="arrow-left"></i> <span data-i18n="edu.go_back">Geri Dön</span>
                        </button>
                        <span style="margin-left: 12px;">${p.title}</span>
                    </h2>
                    
                    <button class="up-btn ${isFavorited ? 'up-btn-secondary' : 'up-btn-primary'}" onclick="window.toggleFavorite(event, '${p.id}')" style="${isFavorited ? 'color: var(--up-primary); border-color: var(--up-primary);' : ''}">
                        <i data-lucide="bookmark" ${isFavorited ? 'fill="currentColor"' : ''}></i> 
                        ${isFavorited ? '<span data-i18n="edu.added_to_lib">Kütüphanede Eklendi</span>' : '<span data-i18n="edu.add_to_lib">Kütüphaneme Ekle</span>'}
                    </button>
                </div>

                <!-- PDF MOCK VIEWER -->
                <div class="pdf-mock-frame">
                    <!-- Fake PDF Page 1 -->
                    <div class="pdf-page">
                        <div class="pdf-page-header">
                            <span>${p.title}</span>
                            <span data-i18n="edu.chapter_1">Bölüm 1</span>
                        </div>
                        
                        <div class="pdf-page-content">
                            <h1 data-i18n="edu.pdf_h1">1. Sektöre Giriş ve Temel Kavramlar</h1>
                            
                            <p data-i18n="edu.pdf_p1">
                                Lojistik ve tedarik zinciri yönetimi, günümüz küresel ekonomisinin bel kemiğini oluşturur. Ürünlerin üreticiden tüketiciye ulaştığı bu karmaşık süreçte zaman, maliyet ve kalite optimizasyonu hayati önem taşır. Bu bağlamda, modern teknolojilerin entegrasyonu sektörel bir zorunluluk haline gelmiştir. Geleneksel nakliye yöntemlerinden, veri güdümlü akıllı rotalama sistemlerine geçiş, sadece operasyonel bir değişiklik değil, aynı zamanda stratejik bir devrim niteliğindedir.
                            </p>
                            
                            <p data-i18n="edu.pdf_p2">
                                <strong>Bu metni seçmeyi ve kopyalamayı deneyebilirsiniz.</strong> Eğer sistem doğru çalışıyorsa, farenizin sol tuşuna basılı tutarak bu yazıları mavi renge (seçim moduna) alamayacaksınız. Aynı zamanda sayfaya sağ tıklayıp "Kopyala" seçeneğini de görememeniz gerekmektedir. Platformun güvenlik katmanı, içerik üreticilerinin fikri mülkiyet haklarını korumak üzere özel olarak tasarlanmıştır.
                            </p>
                            
                            <h3 data-i18n="edu.pdf_h3">Yapay Zeka ve Verimlilik Etkisi</h3>
                            
                            <p data-i18n="edu.pdf_p3">
                                İlerleyen sayfalarda rota optimizasyonu algoritmaları ve yeşil lojistik uygulamaları hakkında detaylı vaka analizlerini inceleyeceğiz. Özellikle yapay zeka destekli tahminleme modellerinin stok maliyetlerini nasıl minimize ettiğini sayısal verilerle göreceksiniz. Araştırmalara göre, dijital dönüşümünü tamamlamış lojistik firmaları, operasyonel giderlerinde %20'ye varan düşüşler yaşamıştır.
                            </p>
                        </div>
                        
                        <div class="pdf-page-footer">1</div>
                    </div>
                </div>
            </div>
        `;
    };

    // ---------------------------------------------------------
    // 3. LIBRARY (FAVORİLERİM)
    // ---------------------------------------------------------
    const renderLibrary = () => {
        const myItems = content.products.filter(p => library.includes(p.id));

        if (myItems.length === 0) {
            return `
                <div style="text-align:center; padding: 6rem 2rem; background: var(--up-surface-solid); border: 1px solid var(--up-border); border-radius: var(--up-radius-lg); box-shadow: var(--up-shadow-card);">
                    <i data-lucide="bookmark" style="width:64px; height:64px; color:var(--up-text-muted); opacity:0.5; margin-bottom:2rem;"></i>
                    <h3 style="font-size:1.5rem; font-weight:800; color:var(--up-text-title); margin-bottom:1rem;" data-i18n="edu.lib_empty">Kütüphaneniz Henüz Boş</h3>
                    <p style="font-size:1.1rem; color:var(--up-text-body); margin-bottom:2rem;" data-i18n="edu.lib_empty_desc">Kampüs içeriklerini inceleyip ayraç (bookmark) ikonuna basarak buraya ekleyebilirsiniz.</p>
                    <button class="up-btn up-btn-primary" onclick="window.utils.setCampusView('storefront')" data-i18n="edu.explore_campus">Kampüsü İncele</button>
                </div>
            `;
        }

        return `
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 2rem; border-bottom: 1px solid var(--up-border); padding-bottom: 1rem;">
                <h2 style="font-size: 1.5rem; color: var(--up-text-title); font-weight: 800; margin:0;" data-i18n="edu.your_library">Kütüphaneniz</h2>
                <span style="font-size:1rem; font-weight:600; color:var(--up-text-muted);">${myItems.length} <span data-i18n="edu.content">İçerik</span></span>
            </div>

            <div class="up-grid">
                ${myItems.map(p => {
                    return `
                    <div class="up-card" style="position: relative;" onclick="window.utils.viewCampusProduct('${p.id}')">
                        <button class="up-bookmark-btn active" style="top: 8px; right: 8px; width: 32px; height: 32px;" onclick="window.toggleFavorite(event, '${p.id}')">
                            <i data-lucide="bookmark" fill="currentColor"></i>
                        </button>
                    
                        <div class="up-card-cover" style="background-image: url('${p.cover}'); height: 160px;"></div>
                        <div class="up-card-body" style="padding: 1.5rem;">
                            <h3 class="up-card-title" style="font-size:1.15rem; margin-bottom: 1.5rem;">${p.title}</h3>
                            
                            <div style="margin-top: auto;">
                                <button class="up-btn up-btn-primary" style="width: 100%; margin-top: 1.5rem;">
                                    ${p.type === 'video' ? '<i data-lucide="play"></i> <span data-i18n="edu.watch">İzle</span>' : '<i data-lucide="book-open"></i> <span data-i18n="edu.read">Oku</span>'}
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    return `
        <div class="education-container">
            <div class="campus-main-content">
                ${renderHeader()}
                ${viewMode === 'storefront' ? renderStorefront() : ''}
                ${viewMode === 'product_detail' ? renderProductDetail() : ''}
                ${viewMode === 'library' ? renderLibrary() : ''}
            </div>
        </div>
    `;
};
