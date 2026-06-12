// Demo amaçlı arama fonksiyonu (Canlı Filtreleme)
window.handleCampusSearch = function(query) {
    // Statik ürünler + Firestore'dan yüklenen admin kursları birlikte aranır
    const staticProducts = window.campusContent ? window.campusContent.products : [];
    const firestoreCourses = window.app?.state?.campusCourses || [];
    const products = [...staticProducts, ...firestoreCourses];
    const lowerQuery = query.toLowerCase();
    
    const filtered = products.filter(p => 
        (p.title || '').toLowerCase().includes(lowerQuery) || 
        (p.description || '').toLowerCase().includes(lowerQuery)
    );
    
    const gridElement = document.querySelector('.up-grid');
    if(gridElement) {
        if(filtered.length === 0) {
            gridElement.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--up-text-muted);" data-i18n="edu.no_content">${window.t ? window.t('edu.no_content') : 'Aradığınız kriterlere uygun içerik bulunamadı.'}</div>`;
        } else {
            const appState = window.app && window.app.state ? window.app.state : {};
            const library = appState.campusLibrary || [];
            
            gridElement.innerHTML = filtered.map(p => {
                const typeLabel = (p.type === 'books' || p.type === 'book') ? `<span data-i18n="edu.report_ebook">${window.t ? window.t('edu.report_ebook') : 'Rapor / E-Kitap'}</span>`
                    : (p.type === 'articles' || p.type === 'article') ? `<span data-i18n="edu.article">${window.t ? window.t('edu.article') : 'Makale'}</span>`
                    : (p.type === 'videos' || p.type === 'video') ? `<span data-i18n="edu.video_training">${window.t ? window.t('edu.video_training') : 'Video Eğitim'}</span>`
                    : `<span data-i18n="edu.training_set">${window.t ? window.t('edu.training_set') : 'Eğitim Seti'}</span>`;
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
                        <h3 class="up-card-title" data-i18n="${p.i18nKey || ''}">${window.t && p.i18nKey ? window.t(p.i18nKey) : p.title}</h3>
                        <div class="up-card-footer">
                            ${p.price ? `<div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);">${p.price}</div>` : `<div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);" data-i18n="edu.free">${window.t ? window.t('edu.free') : 'Ücretsiz'}</div>`}
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

    const selectedProduct = selectedId ? allProducts().find(p => p.id === selectedId) : null;

    // ── Firestore'dan admin kurslarını yükle (bir kez, arka planda) ──
    // Admin panelden eklenen kurslar artık kullanıcıya GERÇEKTEN görünüyor
    // (eskiden eğitim sayfası Firestore'u hiç okumuyordu, admin kursları kayboluyordu)
    if (viewState.campusCoursesLoaded === undefined) {
        viewState.campusCoursesLoaded = false; // tekrar tetiklenmesin
        (async () => {
            try {
                const svc = window.FirestoreService
                    || (await import('../services/firestoreService.js')).FirestoreService;
                const courses = await svc.getCourses();
                viewState.campusCourses = courses.map(c => ({
                    id: 'course-' + c.id,
                    type: 'courses',
                    title: c.title || 'İsimsiz Kurs',
                    description: c.description || '',
                    price: 'Ücretsiz',
                    cover: c.cover || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400',
                    badge: 'Kurs',
                    tags: c.tags || ['Eğitim'],
                    rating: c.rating || ''
                }));
            } catch (e) {
                console.warn('[CAMPUS] Kurslar yüklenemedi:', e.message);
                viewState.campusCourses = [];
            }
            viewState.campusCoursesLoaded = true;
            if (window.app?.router) window.app.router.render();
        })();
    }

    // Statik kampüs ürünleri + Firestore kursları birleşik liste
    function allProducts() {
        return [...(content.products || []), ...(viewState.campusCourses || [])];
    }

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

    // ── Temel Eğitim (Course Reader) navigasyonu ──
    window.openCourseReader = (chapterId) => {
        if (!window.app?.state) return;
        const chapters = window.educationContent?.chapters || [];
        window.app.state.campusViewMode = 'course_reader';
        window.app.state.campusChapterId = chapterId || (chapters[0] ? chapters[0].id : null);
        if (window.app.store) window.app.store.save();
        window.app.router.render();
        window.scrollTo(0, 0);
    };

    window.setCourseChapter = (chapterId) => {
        if (!window.app?.state) return;
        window.app.state.campusChapterId = chapterId;
        if (window.app.store) window.app.store.save();
        window.app.router.render();
        window.scrollTo(0, 0);
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

    // ── Whisper haberlerini Firestore'dan çek (bot bunları yazıyor) ──
    // Eskiden slider'da koda gömülü 3 sahte haber vardı, botun gerçek haberleri
    // ekrana hiç düşmüyordu. Artık gerçek veriyi çekip slider'ı yeniden basıyoruz.
    if (viewState.whispersLoaded === undefined) {
        viewState.whispersLoaded = false;
        (async () => {
            try {
                const svc = window.FirestoreService
                    || (await import('../services/firestoreService.js')).FirestoreService;
                const news = await svc.getWhispers(12);
                viewState.whispers = news;
            } catch (e) {
                console.warn('[WHISPER] Haberler yüklenemedi:', e.message);
                viewState.whispers = [];
            }
            viewState.whispersLoaded = true;
            if (window.app?.router) window.app.router.render();
        })();
    }

    const whisperCount = (viewState.whispers && viewState.whispers.length) ? viewState.whispers.length : 3;

    // Slider otomatik geçiş — önceki interval'i temizle (bellek sızıntısı önlemi)
    if (window.whisperInterval) {
        clearInterval(window.whisperInterval);
        window.whisperInterval = null;
    }
    window.currentSlide = 0;
    window.whisperInterval = setInterval(() => {
        const container = document.getElementById('whisperContainer');
        if (container) {
            const total = container.children.length || whisperCount;
            const next = (window.currentSlide + 1) % total;
            window.goToSlide(next);
        } else {
            // Slider artık sayfada değil (başka view'a geçildi) → interval'i durdur
            clearInterval(window.whisperInterval);
            window.whisperInterval = null;
        }
    }, 5000);

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
                <button class="up-filter-pill ${viewMode !== 'library' && viewMode !== 'course_reader' ? 'active' : ''}" onclick="window.utils.setCampusView('storefront')">
                    <i data-lucide="compass"></i> <span data-i18n="edu.campus">${window.t ? window.t('edu.campus') : 'Kampüs'}</span>
                </button>
                <button class="up-filter-pill ${viewMode === 'course_reader' ? 'active' : ''}" onclick="window.openCourseReader()">
                    <i data-lucide="graduation-cap"></i> <span data-i18n="edu.basic_training">${window.t ? window.t('edu.basic_training') : 'Temel Eğitim'}</span>
                </button>
                <button class="up-filter-pill ${viewMode === 'library' ? 'active' : ''}" onclick="window.utils.setCampusView('library')">
                    <i data-lucide="library"></i> <span data-i18n="edu.my_library">${window.t ? window.t('edu.my_library') : 'Kütüphanem'}</span>
                </button>
            </div>
        </div>
    `;

    // ---------------------------------------------------------
    // 1. STOREFRONT (KAMPÜS)
    // ---------------------------------------------------------
    const renderStorefront = () => {
        // Statik ürünler + Firestore kursları; kategori filtresi gerçekten uygulanıyor
        const merged = allProducts();
        const filteredProducts = category === 'all'
            ? merged
            : merged.filter(p => p.type === category);

        // 'Kurslar' kategorisi (Firestore'dan gelenler için) listede yoksa ekle
        const categories = [...(content.categories || [])];
        if (!categories.some(c => c.id === 'courses')) {
            categories.push({ id: 'courses', name: 'Kurslar', icon: 'graduation-cap' });
        }

        // ── Whisper slaytları: Gerçek bot haberleri varsa onları, yoksa varsayılan tanıtım slaytları ──
        const realNews = viewState.whispers || [];
        const fallbackSlides = `
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="zap" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Sektörel Haberler</div>
                            <h1 class="whisper-title">
                                Yeni Nesil <span class="whisper-highlight">Yeşil Lojistik</span> Trendleri
                            </h1>
                            <p class="whisper-desc">
                                Sürdürülebilirlik odaklı yeşil taşımacılık modelleri ile karbon ayak izini azaltın. Sektörün önde gelen liderlerinin analizlerini keşfedin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="trending-up" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Vaka Analizi</div>
                            <h1 class="whisper-title">
                                Yapay Zeka ile <span class="whisper-highlight">Rota Optimizasyonu</span>
                            </h1>
                            <p class="whisper-desc">
                                Maliyetleri %30'a varan oranda düşüren yeni makine öğrenmesi algoritmaları lojistik ağlarını nasıl baştan yaratıyor? Gerçek verilerle inceleyin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="award" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Yeni Eğitim</div>
                            <h1 class="whisper-title">
                                Global Tedarik Zinciri <span class="whisper-highlight">Kriz Yönetimi</span>
                            </h1>
                            <p class="whisper-desc">
                                Beklenmedik küresel krizlerde tedarik zincirini ayakta tutmanın altın kuralları ve modern kriz yönetim stratejilerini uzmanından dinleyin.
                            </p>
                        </div>
                        <div class="whisper-visual" style="background-image: url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop');"></div>
                    </div>`;

        const defaultVisual = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop';
        const realSlides = realNews.map(n => `
                    <div class="whisper-slide">
                        <div class="whisper-content">
                            <div class="whisper-badge"><i data-lucide="newspaper" style="width:14px; height:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> ${escapeHTML(n.sourceName || n.source || 'Sektörel Haber')}</div>
                            <h1 class="whisper-title">${escapeHTML(n.title || '')}</h1>
                            <p class="whisper-desc">${escapeHTML((n.summary || '').slice(0, 240))}${(n.summary || '').length > 240 ? '...' : ''}</p>
                            ${(n.sourceUrl || n.link) ? `<a href="${escapeHTML(n.sourceUrl || n.link)}" target="_blank" rel="noopener noreferrer" class="up-btn up-btn-secondary" style="margin-top: 12px; display: inline-flex; width: fit-content;"><i data-lucide="external-link"></i> Haberin Kaynağı</a>` : ''}
                        </div>
                        <div class="whisper-visual" style="background-image: url('${escapeHTML(n.imageUrl || n.image_url || defaultVisual)}');"></div>
                    </div>`).join('');

        const slidesHtml = realNews.length > 0 ? realSlides : fallbackSlides;
        const slideTotal = realNews.length > 0 ? realNews.length : 3;
        const dotsHtml = Array.from({ length: slideTotal }, (_, i) =>
            `<div class="whisper-dot ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})"></div>`
        ).join('');

        return `
            <!-- WHISPER SLIDER SECTION -->
            <div class="whisper-slider" id="whisperSlider">
                <div class="whisper-slides-container" id="whisperContainer">
                    ${slidesHtml}
                </div>
                <div class="whisper-controls">
                    ${dotsHtml}
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

            <!-- KATEGORİ FİLTRELERİ (eskiden hiç render edilmiyordu — kategori sistemi ölüydü) -->
            <div class="up-filters" style="margin-bottom: 2rem; flex-wrap: wrap; display: flex; gap: 0.5rem;">
                ${categories.map(c => `
                    <button class="up-filter-pill ${category === c.id ? 'active' : ''}" onclick="window.utils.setCampusCategory('${c.id}')">
                        <i data-lucide="${c.icon}"></i> <span data-i18n="edu.category_${c.id}">${window.t ? window.t('edu.category_' + c.id) : c.name}</span>
                    </button>
                `).join('')}
            </div>

            <!-- GRID -->
            <div class="up-grid">
                ${filteredProducts.length === 0 ? `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--up-text-muted);" data-i18n="edu.no_content_category">${window.t ? window.t('edu.no_content_category') : 'Bu kategoride henüz içerik yok.'}</div>
                ` : filteredProducts.map(p => {
                    const typeLabel = (p.type === 'books' || p.type === 'book') ? `<span data-i18n="edu.report_ebook">${window.t ? window.t('edu.report_ebook') : 'Rapor / E-Kitap'}</span>`
                        : (p.type === 'articles' || p.type === 'article') ? `<span data-i18n="edu.article">${window.t ? window.t('edu.article') : 'Makale'}</span>`
                        : (p.type === 'videos' || p.type === 'video') ? `<span data-i18n="edu.video_training">${window.t ? window.t('edu.video_training') : 'Video Eğitim'}</span>`
                        : `<span data-i18n="edu.training_set">${window.t ? window.t('edu.training_set') : 'Eğitim Seti'}</span>`;
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
                            <h3 class="up-card-title" data-i18n="${p.i18nKey || ''}">${window.t && p.i18nKey ? window.t(p.i18nKey) : p.title}</h3>
                            <div class="up-card-footer">
                                ${p.price ? `<div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);">${p.price}</div>` : `<div class="up-card-price" style="font-size: 1rem; color: var(--up-accent);" data-i18n="edu.free">${window.t ? window.t('edu.free') : 'Ücretsiz'}</div>`}
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

        // Ürünün GERÇEK verilerini göster (eski kod her ürün için aynı sahte PDF sayfasını basıyordu)
        const instructor = (content.instructors || []).find(i => i.id === p.instructorId);
        const typeLabel = (p.type === 'books' || p.type === 'book') ? `<span data-i18n="edu.report_ebook">${window.t ? window.t('edu.report_ebook') : 'Rapor / E-Kitap'}</span>`
            : (p.type === 'articles' || p.type === 'article') ? `<span data-i18n="edu.article">${window.t ? window.t('edu.article') : 'Makale'}</span>`
            : (p.type === 'videos' || p.type === 'video') ? `<span data-i18n="edu.video_training">${window.t ? window.t('edu.video_training') : 'Video Eğitim'}</span>`
            : `<span data-i18n="edu.training_set">${window.t ? window.t('edu.training_set') : 'Eğitim Seti'}</span>`;

        return `
            <div class="pdf-viewer-layout">
                <!-- HEADER -->
                <div class="pdf-viewer-header">
                    <h2 class="pdf-viewer-title">
                        <button class="up-btn up-btn-secondary" onclick="window.utils.setCampusView('storefront')" style="padding: 6px 12px;">
                            <i data-lucide="arrow-left"></i> <span data-i18n="edu.go_back">${window.t ? window.t('edu.go_back') : 'Geri Dön'}</span>
                        </button>
                        <span style="margin-left: 12px;" data-i18n="${p.i18nKey || ''}">${window.t && p.i18nKey ? window.t(p.i18nKey) : p.title}</span>
                    </h2>
                    
                    <button class="up-btn ${isFavorited ? 'up-btn-secondary' : 'up-btn-primary'}" onclick="window.toggleFavorite(event, '${p.id}')" style="${isFavorited ? 'color: var(--up-primary); border-color: var(--up-primary);' : ''}">
                        <i data-lucide="bookmark" ${isFavorited ? 'fill="currentColor"' : ''}></i> 
                        ${isFavorited ? `<span data-i18n="edu.added_to_lib">${window.t ? window.t('edu.added_to_lib') : 'Kütüphanede'}</span>` : `<span data-i18n="edu.add_to_lib">${window.t ? window.t('edu.add_to_lib') : 'Kütüphaneme Ekle'}</span>`}
                    </button>
                </div>

                <!-- ÜRÜN DETAYI -->
                <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; background: var(--up-surface-solid); border: 1px solid var(--up-border); border-radius: var(--up-radius-lg); padding: 2rem; box-shadow: var(--up-shadow-card);">
                    <!-- Kapak -->
                    <div>
                        <div style="width: 100%; aspect-ratio: 3/4; background-image: url('${p.cover}'); background-size: cover; background-position: center; border-radius: var(--up-radius-lg); box-shadow: var(--up-shadow-card);"></div>
                    </div>

                    <!-- Bilgiler -->
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <span class="up-card-badge" style="position: static;">${typeLabel}</span>
                            ${p.badge ? `<span class="up-card-badge" style="position: static; background: var(--up-accent);">${p.badge}</span>` : ''}
                            ${p.rating ? `<span style="font-size: 0.85rem; color: var(--up-text-muted); font-weight: 600;">⭐ ${p.rating}</span>` : ''}
                        </div>

                        <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--up-text-title); margin: 0; letter-spacing: -0.5px;" data-i18n="${p.i18nKey || ''}">${window.t && p.i18nKey ? window.t(p.i18nKey) : p.title}</h1>

                        ${instructor ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--up-bg); border-radius: var(--up-radius-lg);">
                                <img src="${instructor.avatar}" alt="${instructor.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">
                                <div>
                                    <div style="font-weight: 700; color: var(--up-text-title);">${instructor.name}</div>
                                    <div style="font-size: 0.8rem; color: var(--up-text-muted);">${instructor.title}</div>
                                </div>
                            </div>
                        ` : ''}

                        <p style="font-size: 1rem; line-height: 1.7; color: var(--up-text-body); margin: 0;">${p.description || ''}</p>

                        ${p.tags?.length ? `
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${p.tags.map(t => `<span style="font-size: 0.75rem; padding: 4px 10px; background: var(--up-bg); border: 1px solid var(--up-border); border-radius: 12px; color: var(--up-text-muted); font-weight: 600;">#${t}</span>`).join('')}
                            </div>
                        ` : ''}

                        <div style="margin-top: auto; display: flex; align-items: center; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--up-border);">
                            <span style="font-size: 1.4rem; font-weight: 800; color: var(--up-accent);">${p.price ? p.price : `<span data-i18n="edu.free">${window.t ? window.t('edu.free') : 'Ücretsiz'}</span>`}</span>
                            <span style="font-size: 0.85rem; color: var(--up-text-muted); font-style: italic;" data-i18n="edu.full_version_soon">${window.t ? window.t('edu.full_version_soon') : 'İçeriğin tam sürümü yakında platformda yayınlanacaktır.'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // ---------------------------------------------------------
    // TEMEL EĞİTİM OKUYUCU (educationContent.js'i canlandırır)
    // ---------------------------------------------------------
    const renderCourseReader = () => {
        const course = window.educationContent;
        if (!course || !course.chapters?.length) {
            return `<div style="text-align:center; padding: 5rem; color: var(--up-text-muted);" data-i18n="edu.course_reader_error">${window.t ? window.t('edu.course_reader_error') : 'Eğitim içeriği yüklenemedi.'}</div>`;
        }

        const chapters = course.chapters;
        const activeId = viewState.campusChapterId || chapters[0].id;
        const activeIdx = Math.max(0, chapters.findIndex(c => c.id === activeId));
        const chapter = chapters[activeIdx];
        const prevCh = chapters[activeIdx - 1];
        const nextCh = chapters[activeIdx + 1];

        // ── Bölüm içindeki her section'ı veri tipine göre render et ──
        const renderSection = (s) => {
            let html = `<div style="margin-bottom: 2.5rem;">`;
            html += `<h3 style="font-size: 1.2rem; font-weight: 800; color: var(--up-text-title); margin: 0 0 0.75rem 0; display:flex; align-items:center; gap:8px;">
                        ${s.icon ? `<i data-lucide="${s.icon}" style="width:20px; height:20px; color: var(--up-primary);"></i>` : ''}
                        ${s.title}
                     </h3>`;
            if (s.content) {
                html += `<p style="font-size: 1rem; line-height: 1.8; color: var(--up-text-body); margin: 0 0 1rem 0;">${s.content}</p>`;
            }
            if (s.formula) {
                html += `<div style="padding: 12px 16px; background: var(--up-bg); border-left: 4px solid var(--up-primary); border-radius: 8px; font-family: monospace; font-weight: 700; color: var(--up-text-title); margin-bottom: 1rem;">📐 ${s.formula}</div>`;
            }
            if (s.example) {
                html += `<div style="padding: 12px 16px; background: rgba(14, 165, 233, 0.08); border: 1px dashed var(--up-primary); border-radius: 8px; font-size: 0.95rem; color: var(--up-text-body); margin-bottom: 1rem;"><b>Örnek:</b> ${s.example}</div>`;
            }
            if (s.highlights?.length) {
                html += s.highlights.map(h => `
                    <div style="display:flex; gap:8px; align-items:flex-start; padding: 8px 12px; background: var(--up-bg); border-radius: 8px; margin-bottom: 6px; font-size: 0.95rem; color: var(--up-text-body);">
                        <span style="color: var(--up-accent);">💡</span><span>${h}</span>
                    </div>`).join('');
            }
            if (s.list?.length) {
                html += `<ul style="margin: 0 0 1rem 0; padding-left: 1.25rem; line-height: 2; color: var(--up-text-body);">` +
                    s.list.map(li => `<li>${li}</li>`).join('') + `</ul>`;
            }
            const tableStyle = `width:100%; border-collapse:collapse; margin-bottom:1rem; font-size:0.9rem;`;
            const thStyle = `text-align:left; padding:10px 12px; background:var(--up-bg); color:var(--up-text-title); font-weight:800; border-bottom:2px solid var(--up-border);`;
            const tdStyle = `padding:10px 12px; border-bottom:1px solid var(--up-border); color:var(--up-text-body);`;
            if (s.glossary?.length) {
                html += `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Terim</th><th style="${thStyle}">Açıklama</th></tr></thead><tbody>` +
                    s.glossary.map(g => `<tr><td style="${tdStyle}"><b>${g.term}</b></td><td style="${tdStyle}">${g.desc}</td></tr>`).join('') +
                    `</tbody></table>`;
            }
            if (s.incoterms?.length) {
                html += s.incoterms.map(t => `
                    <div style="padding: 12px 16px; border: 1px solid var(--up-border); border-radius: 10px; margin-bottom: 8px; background: var(--up-surface-solid);">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px; flex-wrap:wrap;">
                            <span style="font-weight:900; color:var(--up-primary); font-size:1rem;">${t.code}</span>
                            <span style="font-weight:700; color:var(--up-text-title);">${t.name}</span>
                            <span style="font-size:0.7rem; padding:2px 8px; border-radius:10px; background:var(--up-bg); color:var(--up-text-muted); font-weight:700;">${t.mode === 'sea' ? '🚢 Sadece Deniz' : '🌐 Tüm Modlar'}</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--up-text-body); margin-bottom:4px;">${t.desc}</div>
                        <div style="font-size:0.8rem; color:var(--up-text-muted);">⚠️ Risk Geçişi: <b>${t.risk}</b> &nbsp;|&nbsp; 💰 Navlun: <b>${t.cost}</b></div>
                    </div>`).join('');
            }
            if (s.table?.length) {
                html += `<table style="${tableStyle}"><thead><tr>
                    <th style="${thStyle}">Terim</th><th style="${thStyle}">İhracat Gümrük</th><th style="${thStyle}">Yükleme</th><th style="${thStyle}">Navlun</th><th style="${thStyle}">İthalat Gümrük</th><th style="${thStyle}">Risk Geçişi</th>
                    </tr></thead><tbody>` +
                    s.table.map(r => `<tr><td style="${tdStyle}"><b>${r.term}</b></td><td style="${tdStyle}">${r.export}</td><td style="${tdStyle}">${r.loading}</td><td style="${tdStyle}">${r.freight}</td><td style="${tdStyle}">${r.import}</td><td style="${tdStyle}">${r.risk}</td></tr>`).join('') +
                    `</tbody></table>`;
            }
            if (s.comparison?.length) {
                html += `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Mod</th><th style="${thStyle}">Hız</th><th style="${thStyle}">Maliyet</th><th style="${thStyle}">Kapasite</th></tr></thead><tbody>` +
                    s.comparison.map(r => `<tr><td style="${tdStyle}"><b>${r.mode}</b></td><td style="${tdStyle}">${r.speed}</td><td style="${tdStyle}">${r.cost}</td><td style="${tdStyle}">${r.capacity}</td></tr>`).join('') +
                    `</tbody></table>`;
            }
            if (s.containers?.length) {
                html += `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Tip</th><th style="${thStyle}">Hacim</th><th style="${thStyle}">Kullanım</th></tr></thead><tbody>` +
                    s.containers.map(r => `<tr><td style="${tdStyle}"><b>${r.type}</b></td><td style="${tdStyle}">${r.vol}</td><td style="${tdStyle}">${r.use}</td></tr>`).join('') +
                    `</tbody></table>`;
            }
            if (s.docs?.length) {
                html += s.docs.map(d => `
                    <div style="display:flex; gap:10px; align-items:flex-start; padding: 10px 14px; border: 1px solid var(--up-border); border-radius: 10px; margin-bottom: 6px;">
                        <i data-lucide="file-text" style="width:18px; height:18px; color:var(--up-primary); flex-shrink:0; margin-top:2px;"></i>
                        <div><b style="color:var(--up-text-title);">${d.name}</b><div style="font-size:0.85rem; color:var(--up-text-body);">${d.desc}</div></div>
                    </div>`).join('');
            }
            html += `</div>`;
            return html;
        };

        return `
            <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start;">
                <!-- BÖLÜM LİSTESİ (Sidebar) -->
                <div style="background: var(--up-surface-solid); border: 1px solid var(--up-border); border-radius: var(--up-radius-lg); padding: 1rem; position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto;">
                    <div style="font-weight: 800; color: var(--up-text-title); padding: 0.5rem; font-size: 0.95rem;" data-i18n="edu.intro_to_logistics">${window.t ? window.t('edu.intro_to_logistics') : '📚 Lojistiğe Giriş Eğitimi'}</div>
                    ${chapters.map((c, i) => `
                        <button onclick="window.setCourseChapter('${c.id}')" style="display: block; width: 100%; text-align: left; padding: 10px 12px; margin-bottom: 4px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: ${c.id === chapter.id ? '800' : '600'}; background: ${c.id === chapter.id ? 'var(--up-primary)' : 'transparent'}; color: ${c.id === chapter.id ? '#fff' : 'var(--up-text-body)'}; transition: all 0.15s;">
                            ${c.title}
                            <span style="display:block; font-size: 0.7rem; opacity: 0.75; margin-top: 2px;">${c.badge} · ${c.readTime}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- İÇERİK -->
                <div style="background: var(--up-surface-solid); border: 1px solid var(--up-border); border-radius: var(--up-radius-lg); padding: 2.5rem; box-shadow: var(--up-shadow-card);">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.7rem; padding: 3px 10px; border-radius: 10px; background: var(--up-primary); color: #fff; font-weight: 800;">${chapter.badge}</span>
                        <span style="font-size: 0.8rem; color: var(--up-text-muted);">⏱ ${chapter.readTime}</span>
                    </div>
                    <h2 style="font-size: 1.8rem; font-weight: 900; color: var(--up-text-title); margin: 0 0 2rem 0; letter-spacing: -0.5px;">${chapter.title}</h2>

                    ${chapter.sections.map(renderSection).join('')}

                    <!-- Önceki / Sonraki -->
                    <div style="display:flex; justify-content: space-between; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--up-border);">
                        ${prevCh ? `<button class="up-btn up-btn-secondary" onclick="window.setCourseChapter('${prevCh.id}')"><i data-lucide="arrow-left"></i> <span data-i18n="edu.prev_chapter">${window.t ? window.t('edu.prev_chapter') : 'Önceki Bölüm'}</span></button>` : '<span></span>'}
                        ${nextCh ? `<button class="up-btn up-btn-primary" onclick="window.setCourseChapter('${nextCh.id}')"><span data-i18n="edu.next_chapter">${window.t ? window.t('edu.next_chapter') : 'Sonraki Bölüm'}</span> <i data-lucide="arrow-right"></i></button>` : `<button class="up-btn up-btn-primary" onclick="window.utils.setCampusView('storefront')"><span data-i18n="edu.finish_course">${window.t ? window.t('edu.finish_course') : '🎉 Eğitimi Bitirdin! Kampüse Dön'}</span></button>`}
                    </div>
                </div>
            </div>
        `;
    };

    // ---------------------------------------------------------
    // 3. LIBRARY (FAVORİLERİM)
    // ---------------------------------------------------------
    const renderLibrary = () => {
        const myItems = allProducts().filter(p => library.includes(p.id));

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
                            <h3 class="up-card-title" style="font-size:1.15rem; margin-bottom: 1.5rem;" data-i18n="${p.i18nKey || ''}">${window.t && p.i18nKey ? window.t(p.i18nKey) : p.title}</h3>
                            
                            <div style="margin-top: auto;">
                                <button class="up-btn up-btn-primary" style="width: 100%; margin-top: 1.5rem;">
                                    ${(p.type === 'videos' || p.type === 'video') ? '<i data-lucide="play"></i> <span data-i18n="edu.watch">İzle</span>' : '<i data-lucide="book-open"></i> <span data-i18n="edu.read">Oku</span>'}
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
                ${viewMode === 'course_reader' ? renderCourseReader() : ''}
                ${viewMode === 'library' ? renderLibrary() : ''}
            </div>
        </div>
    `;
};
