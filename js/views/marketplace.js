window.marketplaceView = (state) => {
    const activeSub = window.utils.getSubscriptionStatus(state);
    
    // Veri Seviyesinde Filtreleme (Kalıcı olması için)
    const filteredAds = state.ads.filter(ad => {
        // Onaylanmış ilanlar pazar yerinden kaldırılır
        if (ad.status === 'accepted') return false;

        // Süresi dolmuş veya spam olarak işaretlenmiş ilanlar pazar yerinden kaldırılır
        if (ad.status === 'spam_hidden') return false;

        // Taşıyıcı kendisi şikayet ettiyse bu ilanı görmesin (Reporter-Only Hide)
        if (ad.reports && ad.reports.some(r => r.by === state.currentUser)) return false;

        // Süresi dolmuş ilanlar pazar yerinden kaldırılır
        if (ad.expiryDate && ad.expiryDate < Date.now()) return false;

        const f = state.filters;
        
        // Favori Filtresi
        if (f.onlyFavorites && !state.favorites.includes(ad.id)) return false;

        const matchOrigin = !f.origin || ad.origin.toLowerCase().includes(f.origin.toLowerCase());
        const matchDest = !f.destination || ad.destination.toLowerCase().includes(f.destination.toLowerCase());
        const matchTransport = !f.transport || ad.transport === f.transport;
        const matchCargo = !f.cargoType || ad.cargoType === f.cargoType;
        const matchId = !f.adId || window.utils.formatAdNumber(ad.id).toLowerCase().includes(f.adId.toLowerCase());
        return matchOrigin && matchDest && matchTransport && matchCargo && matchId;
    });

    // Sayfalama (Pagination)
    const perPage = 20;
    const currentPage = state.marketplacePage || 1;
    const totalPages = Math.max(1, Math.ceil(filteredAds.length / perPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * perPage;
    const pagedAds = filteredAds.slice(startIdx, startIdx + perPage);

    // Pagination butonlarını oluştur
    let paginationHTML = '';
    if (totalPages > 1) {
        const prevDisabled = safePage <= 1 ? 'disabled' : '';
        const nextDisabled = safePage >= totalPages ? 'disabled' : '';
        
        let pageButtons = '';
        const maxVisible = 5;
        let startPage = Math.max(1, safePage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

        if (startPage > 1) pageButtons += `<button class="pagination-btn" onclick="window.marketplaceManager.goToPage(1)">1</button>`;
        if (startPage > 2) pageButtons += `<span class="pagination-dots">...</span>`;
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === safePage;
            pageButtons += `<button class="pagination-btn ${isActive ? 'active' : ''}" onclick="window.marketplaceManager.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages - 1) pageButtons += `<span class="pagination-dots">...</span>`;
        if (endPage < totalPages) pageButtons += `<button class="pagination-btn" onclick="window.marketplaceManager.goToPage(${totalPages})">${totalPages}</button>`;

        paginationHTML = `
            <div class="pagination-container">
                <button class="pagination-btn nav" onclick="window.marketplaceManager.goToPage(${safePage - 1})" ${prevDisabled} style="display: flex; align-items: center; gap: 4px;"><i data-lucide="chevron-left" style="width: 14px; height: 14px;"></i> Önceki</button>
                ${pageButtons}
                <button class="pagination-btn nav" onclick="window.marketplaceManager.goToPage(${safePage + 1})" ${nextDisabled} style="display: flex; align-items: center; gap: 4px;">Sonraki <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i></button>
            </div>
            <div class="pagination-info">${filteredAds.length} ilandan ${startIdx + 1}–${Math.min(startIdx + perPage, filteredAds.length)} arası gösteriliyor</div>
        `;
    }

    return `
    <div class="container">
        <div class="market-header animate-fade-in-up">
            <div class="market-header-top">
                <h1>Pazaryeri Akışı</h1>
                <div class="market-count">${filteredAds.length} aktif ilan bulundu</div>
            </div>
            
            <!-- Mobile Filter Toggle Button -->
            <div class="mobile-filter-header" style="width: 100%; margin-bottom: 12px;">
                <button class="btn-outline mobile-filter-trigger" onclick="window.marketplaceManager.toggleMobileFilterPanel()" style="display: flex; align-items: center; gap: 8px; justify-content: center; width: 100%; height: 44px; font-weight: 600; border-radius: var(--radius-md); border: 1.5px solid var(--border);">
                    <i data-lucide="sliders-horizontal" style="width: 18px; height: 18px;"></i>
                    Filtreleri Göster / Gizle
                </button>
            </div>
            
            <div class="market-filter-bar">
                <div class="form-group" style="margin: 0;">
                    <label>Çıkış Noktası</label>
                    <div class="autocomplete-wrapper">
                        <input type="text" id="market-origin-input" placeholder="Şehir / Liman" class="form-control" autocomplete="off" value="${state.filters.origin || ''}" onkeyup="if(event.key==='Enter') window.marketplaceManager.applyMarketFilters()">
                        <div id="market-origin-results" class="autocomplete-results"></div>
                    </div>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label>Varış Noktası</label>
                    <div class="autocomplete-wrapper">
                        <input type="text" id="market-dest-input" placeholder="Şehir / Liman" class="form-control" autocomplete="off" value="${state.filters.destination || ''}" onkeyup="if(event.key==='Enter') window.marketplaceManager.applyMarketFilters()">
                        <div id="market-dest-results" class="autocomplete-results"></div>
                    </div>
                </div>
                <button class="btn-primary" onclick="window.marketplaceManager.applyMarketFilters()" style="height: 48px;">Filtrele</button>
                <div class="form-group" style="margin: 15px 0 0 0; grid-column: 1 / 2;">
                    <label>İlan No Sorgula</label>
                    <div style="position: relative;">
                        <input type="text" id="market-id-input" placeholder="PRV-XXXXXX" class="form-control" autocomplete="off" value="${state.filters.adId || ''}" onkeyup="if(event.key==='Enter') window.marketplaceManager.applyMarketFilters()">
                        <i data-lucide="search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted); pointer-events: none;"></i>
                    </div>
                </div>
            </div>

            <div class="filter-chips-container">
                <div class="filter-chip ${state.filters.transport === 'sea' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('transport', 'sea')"><i data-lucide="ship" style="width: 14px; height: 14px; margin-right: 6px;"></i> Deniz</div>
                <div class="filter-chip ${state.filters.transport === 'land' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('transport', 'land')"><i data-lucide="truck" style="width: 14px; height: 14px; margin-right: 6px;"></i> Kara</div>
                <div class="filter-chip ${state.filters.transport === 'air' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('transport', 'air')"><i data-lucide="plane" style="width: 14px; height: 14px; margin-right: 6px;"></i> Hava</div>
                <div style="width: 1px; height: 20px; background: var(--border-dim); margin: 0 5px;"></div>
                <div class="filter-chip ${state.filters.cargoType === 'Parsiyel' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('cargoType', 'Parsiyel')"><i data-lucide="package" style="width: 14px; height: 14px; margin-right: 6px;"></i> Parsiyel</div>
                <div class="filter-chip ${state.filters.cargoType === 'Konteyner' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('cargoType', 'Konteyner')"><i data-lucide="container" style="width: 14px; height: 14px; margin-right: 6px;"></i> Konteyner</div>
                <div class="filter-chip ${state.filters.cargoType === 'Komple' ? 'active' : ''}" onclick="window.marketplaceManager.toggleFilter('cargoType', 'Komple')"><i data-lucide="truck" style="width: 14px; height: 14px; margin-right: 6px;"></i> Komple Tır</div>
                
                <!-- Premium Filters -->
                <div style="width: 1px; height: 20px; background: var(--border-dim); margin: 0 5px;"></div>
                <div class="filter-chip ${activeSub !== 'premium' ? 'locked-chip' : ''}" onclick="${activeSub === 'premium' ? "window.marketplaceManager.toggleFilter('premium', 'urgent')" : "window.app.router.navigate('membership')"}" title="${activeSub !== 'premium' ? 'Premium Üyelik Gerektirir' : ''}">
                    <i data-lucide="${activeSub === 'premium' ? 'zap' : 'lock'}" style="width: 14px; height: 14px; margin-right: 6px;"></i> 
                    Acil İlanlar
                </div>
                <div class="filter-chip ${activeSub !== 'premium' ? 'locked-chip' : ''}" onclick="${activeSub === 'premium' ? "window.marketplaceManager.toggleFilter('premium', 'verified')" : "window.app.router.navigate('membership')"}" title="${activeSub !== 'premium' ? 'Premium Üyelik Gerektirir' : ''}">
                    <i data-lucide="${activeSub === 'premium' ? 'check-square' : 'lock'}" style="width: 14px; height: 14px; margin-right: 6px;"></i> 
                    Onaylı Yükleyiciler
                </div>


                <div class="filter-chip" onclick="window.marketplaceManager.clearFilters()" style="margin-left: auto; background: #fff1f0; color: #ff4d4f; border-color: #ffa39e;">Filtreleri Temizle</div>
            </div>
        </div>

        <div class="marketplace-list">
            ${pagedAds.map(ad => {
                const isExpanded = state.expandedAdId === ad.id;
                const isFavorite = state.favorites.includes(ad.id);
                const icon = window.utils.getTransportIcon(ad.transport);
                return `
                <div class="ticket-card ${isExpanded ? 'expanded' : ''}" id="ad-${ad.id}" onclick="window.marketplaceManager.toggleAd('${ad.id}')">
                    <div class="ticket-stub">
                        <div class="transport-icon">${icon}</div>
                    </div>
                    <div class="ticket-main">
                        <div class="ticket-header">
                            <div class="ticket-header-left">
                                <span class="status-badge status-${ad.status}">
                                    ${ad.status === 'pending' ? 'Bekliyor' : ad.status === 'accepted' ? 'Onaylandı' : 'Teklif Var'}
                                </span>
                                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-left: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                <span style="font-size: 0.75rem; color: #e67e22; font-weight: 700; margin-left: 12px; display: flex; align-items: center; gap: 4px;" title="İlanın yayında kalacağı süre">
                                    <i data-lucide="clock" style="width: 13px; height: 13px;"></i>
                                    ${window.utils.formatTimeRemaining(ad.expiryDate)}
                                </span>
                                <h3 class="ticket-header-title" style="margin-top: 4px;">
                                    <strong>${window.utils.escapeHTML(ad.origin)}</strong> 
                                    <span>to</span> 
                                    <strong>${window.utils.escapeHTML(ad.destination)}</strong>
                                </h3>
                            </div>
                            <div class="ticket-header-right" style="display: flex; align-items: center; gap: 8px;">
                                <button class="share-btn" 
                                        onclick="event.stopPropagation(); window.marketplaceManager.shareAd('${ad.id}')"
                                        title="İlanı Paylaş">
                                    <i data-lucide="share-2" style="width: 20px; height: 20px; color: var(--text-muted);"></i>
                                </button>
                                ${state.userRole === 'carrier' ? `
                                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); window.app.store.toggleFavorite('${ad.id}')"
                                            title="${isFavorite ? 'Kaydı Kaldır' : 'İlanı Kaydet'}">
                                        <i data-lucide="bookmark" style="width: 20px; height: 20px; ${isFavorite ? 'fill: var(--secondary); color: var(--secondary);' : 'color: var(--text-muted);'}"></i>
                                    </button>
                                ` : ''}
                                <div class="ticket-toggle-icon">
                                    ${isExpanded ? '−' : '+'}
                                </div>
                            </div>
                        </div>
                        
                        ${state.userRole === 'loader' && isExpanded ? `
                            <div class="ticket-privacy-notice">
                                <p>
                                    <strong>Gizlilik Notu:</strong> Diğer yükleyicilerin ilan detayları ve teklifleri güvenliğiniz için gizlenmiştir. Kendi ilanlarınızın detaylarını <strong>Panelim</strong> sayfasından görebilirsiniz.
                                </p>
                            </div>
                        ` : ''}

                        ${state.userRole === 'carrier' && isExpanded ? `
                            <div class="ticket-details">
                                <div style="font-size: 1.15rem; font-weight: 800; color: var(--secondary); margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--border-dim); display: flex; align-items: center; gap: 8px;">
                                    <i data-lucide="tag" style="width: 18px; height: 18px; color: var(--secondary);"></i>
                                    ${window.utils.escapeHTML(ad.title || 'Yük Sevkiyat İlanı')}
                                </div>
                                <div class="ticket-info-grid">
                                    <div>
                                        <p><strong>Malın Cinsi:</strong> ${window.utils.escapeHTML(ad.goodsType) || 'Belirtilmedi'}</p>
                                        <p><strong>Kategori:</strong> <span style="color: ${ad.cargoCategory?.includes('Tehlikeli') ? 'red' : 'green'}; font-weight: 600;">${window.utils.escapeHTML(ad.cargoCategory) || 'Genel Kargo'}</span></p>
                                        <p><strong>Incoterm:</strong> <span class="status-badge" style="background: var(--border-dim); color: var(--text-primary); margin:0;">${ad.incoterm || 'Belirtilmedi'}</span></p>
                                    </div>
                                    <div>
                                        <p><strong>Yük Detayları:</strong></p>
                                        <ul style="list-style: none; padding-left: 0; margin-top: 5px;">
                                            ${ad.cargoItems ? ad.cargoItems.map(item => `
                                                <li style="background: var(--bg-page); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 0.85rem; border-left: 3px solid var(--accent);">
                                                    <div style="font-weight: 600; margin-bottom: 4px;">${window.utils.escapeHTML(item.goods)}:</div>
                                                    <div style="color: var(--text-secondary);">${window.utils.escapeHTML(item.detail)}</div>
                                                    ${item.photos && item.photos.length > 0 ? `
                                                        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                                                            ${item.photos.map(p => `
                                                                <img src="${p}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 1px solid var(--border-dim); transition: transform 0.2s;" onclick="event.stopPropagation(); window.open('${p}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                                            `).join('')}
                                                        </div>
                                                    ` : ''}
                                                </li>
                                            `).join('') : `<li>${window.utils.escapeHTML(ad.cargoType)} ${ad.quantity ? `(${ad.quantity} Adet)` : ''}</li>`}
                                        </ul>
                                        ${ad.weight && !ad.cargoItems ? `<p><strong>Ağırlık:</strong> ${ad.weight}</p>` : ''}
                                        ${ad.totalCBM ? `<p><strong>Toplam Hacim:</strong> <span style="color: var(--secondary); font-weight: 600;">${ad.totalCBM} CBM</span></p>` : ad.volume && !ad.cargoItems ? `<p><strong>Hacim:</strong> <span style="color: var(--secondary); font-weight: 600;">${ad.volume}</span></p>` : ''}
                                        ${ad.cargoItems?.some(item => item.type === 'Parsiyel') || ad.cargoType?.includes('Parsiyel') ? `
                                            <p><strong>İstifleme:</strong> ${ad.isStackable ? '<span style="color: #27ae60; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> İstiflenebilir</span>' : '<span style="color: #e74c3c; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="x-circle" style="width: 14px; height: 14px;"></i> İstiflenemez</span>'}</p>
                                        ` : ''}
                                        <p><strong>Yükleme Tarihi:</strong> ${ad.deadline}</p>
                                    </div>
                                </div>
                                
                                ${ad.additionalNotes ? `
                                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.015); border-radius: 12px; border: 1px dashed var(--border-dim);">
                                        <p style="margin-bottom: 6px; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 6px;">
                                            <i data-lucide="file-text" style="width: 14px; height: 14px; color: var(--accent);"></i> Açıklama ve Sevkiyat Notları
                                        </p>
                                        <p style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.5; white-space: pre-line; margin: 0;">
                                            ${window.utils.escapeHTML(ad.additionalNotes)}
                                        </p>
                                    </div>
                                ` : ''}
                                
                                ${ad.photos && ad.photos.length > 0 ? `
                                    <div style="margin-top: 20px;">
                                        <p><strong>Yük Fotoğrafları:</strong></p>
                                        <div class="photo-gallery">
                                            ${ad.photos.map(photo => `
                                                <img src="${photo}" class="photo-thumbnail" onclick="event.stopPropagation(); window.open('${photo}')">
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}

                                <div style="margin-top: 25px; display: flex; gap: 15px; align-items: center; width: 100%;">
                                    ${activeSub === 'none' ? `
                                        <div class="subscription-lock-notice" onclick="event.stopPropagation(); window.app.router.navigate('membership')" style="flex: 1;">
                                            <i data-lucide="lock" style="width: 16px; height: 16px;"></i>
                                            Teklif verebilmek için <strong>Profesyonel Üyelik</strong> gereklidir.
                                        </div>
                                    ` : `
                                        <button class="btn-primary" onclick="event.stopPropagation(); window.marketplaceManager.showAdDetails('${ad.id}')">
                                            Teklif Ver / Detaylar
                                        </button>
                                    `}
                                    <button class="btn-outline" onclick="event.stopPropagation(); window.marketplaceManager.toggleAd('${ad.id}')">
                                        Kapat
                                    </button>
                                    <button class="btn-outline" style="color: #ff4d4f; border-color: #ffa39e; margin-left: auto; display: flex; align-items: center; gap: 6px; padding: 10px 15px;" onclick="event.stopPropagation(); window.marketplaceManager.reportAd('${ad.id}')" title="İlanı Spam/Sahte Olarak Şikayet Et">
                                        <i data-lucide="alert-triangle" style="width: 14px; height: 14px; color: #ff4d4f;"></i> Spam Bildir
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>

        ${paginationHTML}
    </div>
`;
};
