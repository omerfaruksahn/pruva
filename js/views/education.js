window.educationView = (state) => {
    const app = window.app || { state };
        // State kontrolleri
        const viewState = app.state || {};
        const viewMode = viewState.campusViewMode || 'storefront'; // storefront, product_detail, library
        const category = viewState.campusCategory || 'all';
        const selectedId = viewState.campusSelectedProduct;
        const library = viewState.campusLibrary || [];

        // Data kontrolleri
        const content = window.campusContent;
        if (!content) {
            return `
                <div class="education-container">
                    <div class="campus-main-content">
                        <div class="campus-empty-state">
                            <i data-lucide="alert-circle"></i>
                            <h3>İçerik Yüklenemedi</h3>
                            <p>Pruva Kampüs verilerine şu an ulaşılamıyor. Lütfen sayfayı yenileyin.</p>
                            <button class="campus-btn campus-btn-primary" onclick="location.reload()">Yenile</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Seçili Ürün
        const selectedProduct = selectedId ? content.products.find(p => p.id === selectedId) : null;

        // Navigasyon (Vitrin vs Kütüphanem)
        const renderHeader = () => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div style="display: flex; gap: 1rem;">
                    <button class="campus-filter-pill ${viewMode !== 'library' ? 'active' : ''}" onclick="window.utils.setCampusView('storefront')" style="font-size: 1.1rem; padding: 12px 24px;">
                        <i data-lucide="compass"></i> Mağazayı Keşfet
                    </button>
                    <button class="campus-filter-pill ${viewMode === 'library' ? 'active' : ''}" onclick="window.utils.setCampusView('library')" style="font-size: 1.1rem; padding: 12px 24px;">
                        <i data-lucide="library"></i> Kütüphanem
                    </button>
                </div>
            </div>
        `;

        // ---------------------------------------------------------
        // 1. STOREFRONT (VİTRİN)
        // ---------------------------------------------------------
        const renderStorefront = () => {
            // Kategori Filtreleri
            const filtersHTML = content.categories.map(cat => `
                <button class="campus-filter-pill ${category === cat.id ? 'active' : ''}" onclick="window.utils.setCampusCategory('${cat.id}')">
                    <i data-lucide="${cat.icon}"></i> ${cat.name}
                </button>
            `).join('');

            // Ürünleri Filtrele
            const filteredProducts = category === 'all' 
                ? content.products 
                : content.products.filter(p => p.categoryId === category);

            // Öne Çıkan Ürün (Hero)
            const featured = content.products[0];

            return `
                <!-- HERO SECTION -->
                ${category === 'all' ? `
                <div class="campus-hero">
                    <div class="campus-hero-content">
                        <div class="campus-badge"><i data-lucide="sparkles"></i> Haftanın Öne Çıkanı</div>
                        <h1 class="campus-hero-title">
                            Geleceğin <br><span class="gradient-text">Lojistik Uzmanı</span> Olun
                        </h1>
                        <p class="campus-hero-desc">
                            Pruva Kampüs ile sektörün en iyi uzmanlarından, pratik ve teorik eğitimleri alın. Kariyerinize bugün yön verin.
                        </p>
                        <button class="campus-btn campus-btn-primary" onclick="window.utils.viewCampusProduct('${featured.id}')" style="font-size: 1.2rem; padding: 16px 32px;">
                            <i data-lucide="play-circle"></i> Hemen İncele
                        </button>
                    </div>
                    <div class="campus-hero-visual">
                        <div class="campus-glass-icon">
                            <i data-lucide="rocket"></i>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- FILTERS -->
                <div class="campus-filters">
                    ${filtersHTML}
                </div>

                <!-- GRID -->
                <div class="campus-grid">
                    ${filteredProducts.map(p => {
                        const instructor = content.instructors.find(i => i.id === p.instructorId);
                        const typeIcon = p.type === 'book' ? 'book-open' : p.type === 'article' ? 'file-text' : 'video';
                        const typeLabel = p.type === 'book' ? 'E-Kitap' : p.type === 'article' ? 'Makale' : 'Video Eğitim';
                        
                        return `
                        <div class="campus-card" onclick="window.utils.viewCampusProduct('${p.id}')">
                            <div class="campus-card-cover" style="background-image: url('${p.coverImage}')">
                                <div class="campus-card-overlay"></div>
                                <div class="campus-card-badge" style="background: ${p.type === 'video' ? 'var(--campus-accent)' : 'var(--campus-secondary)'}">
                                    <i data-lucide="${typeIcon}" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
                                    ${typeLabel}
                                </div>
                            </div>
                            <div class="campus-card-body">
                                <h3 class="campus-card-title">${p.title}</h3>
                                <div class="campus-card-instructor">
                                    <img src="${instructor.avatar}" alt="${instructor.name}">
                                    <span>${instructor.name}</span>
                                </div>
                                <div class="campus-card-footer">
                                    <div class="campus-card-rating">
                                        <i data-lucide="star" style="fill: currentColor; width: 16px; height: 16px;"></i> 4.9
                                    </div>
                                    <div class="campus-card-price">${p.price === 0 ? 'Ücretsiz' : p.price + '₺'}</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        };


        // ---------------------------------------------------------
        // 2. PRODUCT DETAIL
        // ---------------------------------------------------------
        const renderProductDetail = () => {
            if (!selectedProduct) return `<div class="campus-empty-state">Ürün bulunamadı.</div>`;
            const p = selectedProduct;
            const instructor = content.instructors.find(i => i.id === p.instructorId);
            const isOwned = library.includes(p.id);

            return `
                <button class="campus-btn campus-btn-secondary" onclick="window.utils.setCampusView('storefront')" style="margin-bottom: 2rem;">
                    <i data-lucide="arrow-left"></i> Mağazaya Dön
                </button>

                <div class="campus-detail-layout">
                    <div class="campus-detail-left">
                        <div class="campus-detail-cover" style="background-image: url('${p.coverImage}')"></div>
                        
                        <div class="campus-buy-panel">
                            <div class="campus-buy-price">${p.price === 0 ? 'Ücretsiz' : p.price + ' ₺'}</div>
                            ${isOwned ? `
                                <button class="campus-btn campus-btn-primary" style="width: 100%; justify-content: center; background: var(--campus-accent);" onclick="window.utils.setCampusView('library')">
                                    <i data-lucide="check-circle"></i> Kütüphanemde
                                </button>
                            ` : `
                                <button class="campus-btn campus-btn-primary" style="width: 100%; justify-content: center;" onclick="window.utils.addToLibrary('${p.id}')">
                                    <i data-lucide="shopping-cart"></i> Satın Al / Ekle
                                </button>
                            `}
                            <p style="margin-top: 1rem; color: var(--campus-text-muted); font-size: 0.85rem;">
                                ${p.type === 'video' ? 'Ömür Boyu Erişim • Sınırsız Tekrar' : 'Anında İndirilebilir PDF/EPUB'}
                            </p>
                        </div>
                    </div>

                    <div class="campus-detail-right">
                        <div class="campus-detail-tags">
                            <span class="campus-detail-tag"><i data-lucide="${p.type === 'video' ? 'video' : 'book'}" style="width: 14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> ${p.type.toUpperCase()}</span>
                            <span class="campus-detail-tag"><i data-lucide="globe" style="width: 14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Türkçe</span>
                        </div>
                        
                        <h1 class="campus-detail-title">${p.title}</h1>
                        
                        <div class="campus-instructor-profile">
                            <img src="${instructor.avatar}" alt="${instructor.name}">
                            <div class="campus-instructor-info">
                                <h4>${instructor.name}</h4>
                                <p>${instructor.title}</p>
                            </div>
                        </div>

                        <h3 class="campus-section-title"><i data-lucide="info"></i> İçerik Hakkında</h3>
                        <p class="campus-detail-desc">${p.description}</p>

                        <h3 class="campus-section-title"><i data-lucide="check-square"></i> Neler Öğreneceksiniz?</h3>
                        <ul class="campus-feature-list">
                            <li class="campus-feature-item"><i data-lucide="check" style="color: var(--campus-accent)"></i> Lojistik sektöründe güncel trendler</li>
                            <li class="campus-feature-item"><i data-lucide="check" style="color: var(--campus-accent)"></i> Gerçek dünya senaryoları ile analiz</li>
                            <li class="campus-feature-item"><i data-lucide="check" style="color: var(--campus-accent)"></i> Operasyonel maliyet düşürme taktikleri</li>
                            <li class="campus-feature-item"><i data-lucide="check" style="color: var(--campus-accent)"></i> Global tedarik zinciri yönetimi</li>
                        </ul>
                    </div>
                </div>
            `;
        };

        // ---------------------------------------------------------
        // 3. LIBRARY
        // ---------------------------------------------------------
        const renderLibrary = () => {
            const myItems = content.products.filter(p => library.includes(p.id));

            if (myItems.length === 0) {
                return `
                    <div class="campus-library-header">
                        <h1 class="campus-library-title"><i data-lucide="library"></i> Kütüphanem</h1>
                    </div>
                    <div class="campus-empty-state">
                        <i data-lucide="book-dashed"></i>
                        <h3>Kütüphaneniz Henüz Boş</h3>
                        <p>Pruva Kampüs mağazasından ilginizi çeken eğitimleri ve kitapları alarak kendinizi geliştirmeye başlayın.</p>
                        <button class="campus-btn campus-btn-primary" onclick="window.utils.setCampusView('storefront')">
                            Mağazayı Keşfet
                        </button>
                    </div>
                `;
            }

            return `
                <div class="campus-library-header">
                    <h1 class="campus-library-title"><i data-lucide="library"></i> Kütüphanem</h1>
                    <span class="campus-filter-pill" style="cursor:default;">${myItems.length} İçerik</span>
                </div>

                <div class="campus-grid">
                    ${myItems.map(p => {
                        const typeIcon = p.type === 'book' ? 'book-open' : p.type === 'article' ? 'file-text' : 'video';
                        const progress = Math.floor(Math.random() * 60) + 10; // Demo progress
                        const gradient = p.type === 'video' ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #38bdf8, #2563eb)';

                        return `
                        <div class="campus-card">
                            <div class="campus-card-cover" style="background-image: url('${p.coverImage}'); height: 140px;">
                                <div class="campus-card-overlay"></div>
                                <div class="campus-card-badge" style="background: var(--campus-primary)">
                                    <i data-lucide="${typeIcon}" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i>
                                </div>
                            </div>
                            <div class="campus-card-body">
                                <h3 class="campus-card-title" style="font-size: 1.1rem; margin-bottom: 1rem;">${p.title}</h3>
                                
                                <div style="margin-top: auto;">
                                    <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--campus-text-muted);">
                                        <span>İlerleme</span>
                                        <span>%${progress}</span>
                                    </div>
                                    <div class="campus-progress-bg">
                                        <div class="campus-progress-fill" style="width: ${progress}%; background: ${gradient};"></div>
                                    </div>
                                    <button class="campus-btn campus-btn-secondary" style="width: 100%; justify-content: center; margin-top: 1rem; padding: 8px;">
                                        ${p.type === 'video' ? '<i data-lucide="play"></i> İzlemeye Devam Et' : '<i data-lucide="book-open"></i> Okumaya Devam Et'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        };

        // Ana Render Çıktısı
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
