window.carrierDashboardView = (state) => {
    const activeSub = window.utils.getSubscriptionStatus(state);
    const activeTab = state.carrierActiveTab || 'my-bids';
    const currentUser = state.currentUser;
    // Geçerli kullanıcının state verisini bul
    state.currentUserData = state.users.find(u => u.name === currentUser);
    
    // Verileri ayrıştır
    const biddedAds = state.ads.filter(ad => ad.bids && ad.bids.some(bid => bid.company === currentUser));
    const wonAds = state.ads.filter(ad => ad.status === 'accepted' && ad.acceptedBid && ad.acceptedBid.company === currentUser);
    
    const TAB_RENDERERS = {
        'my-bids': () => `
            <div style="animation: fadeIn 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 class="dash-ad-title" style="color: var(--secondary);">My Active Bids</h3>
                    <button class="btn-primary" onclick="window.app.router.navigate('marketplace')" style="padding: 8px 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="search" style="width: 14px; height: 14px;"></i> Yeni İlanlar Bul</button>
                </div>
                
                <div class="dash-ad-list">
                    ${biddedAds.length === 0 ? `
                        <div class="card" style="text-align: center; padding: 60px; color: #999;">
                            <div style="font-size: 3rem; margin-bottom: 20px;"><i data-lucide="briefcase" style="width: 48px; height: 48px; margin: 0 auto;"></i></div>
                            <p>Henüz bir teklif vermediniz.</p>
                            <button class="btn-outline" style="margin-top: 15px;" onclick="window.app.router.navigate('marketplace')">Pazara Göz At</button>
                        </div>
                    ` : biddedAds.map(ad => {
                        const myBid = ad.bids.find(b => b.company === currentUser);
                        const isWon = ad.status === 'accepted' && ad.acceptedBid && ad.acceptedBid.company === currentUser;
                        
                        return `
                        <div class="card dash-ad-card" style="border-left-color: ${isWon ? '#27ae60' : 'var(--secondary)'}">
                            <div class="dash-ad-main" style="cursor: default;">
                                <div class="dash-ad-info">
                                    <div class="dash-ad-icon" style="background: #f0f7ff; color: var(--secondary);">
                                        ${window.utils.getTransportIcon(ad.transport)}
                                    </div>
                                    <div>
                                        <h4 class="dash-ad-title">
                                            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                            ${ad.origin} ➔ ${ad.destination}
                                        </h4>
                                        <div class="dash-ad-meta">
                                            Teklifiniz: <strong style="color: #27ae60;">${myBid.price}</strong> • Transit: ${myBid.time}
                                        </div>
                                    </div>
                                </div>
                                <div class="dash-ad-status-box">
                                    <span class="status-badge" style="background: ${isWon ? '#e6ffec' : '#fff9e6'}; color: ${isWon ? '#27ae60' : '#f39c12'}; margin: 0; display: flex; align-items: center; gap: 4px;">
                                        ${isWon ? 'Kazandınız <i data-lucide="check" style="width: 12px; height: 12px;"></i>' : 'Değerlendirmede <i data-lucide="clock" style="width: 12px; height: 12px;"></i>'}
                                    </span>
                                    <div class="dash-ad-label" style="margin-top: 5px;">İlan No: #ID-${ad.id.toString().slice(-5)}</div>
                                </div>
                            </div>
                            <div style="padding: 0 25px 20px; display: flex; gap: 10px; justify-content: flex-end;">
                                <button class="btn-outline" style="padding: 6px 12px; font-size: 0.75rem; display: flex; align-items: center; gap: 4px;" onclick="window.chatManager.toggleChat(true, '${ad.id}', '${ad.owner}')"><i data-lucide="message-square" style="width: 14px; height: 14px;"></i> Mesaj Gönder</button>
                                <button class="btn-outline" style="padding: 6px 12px; font-size: 0.75rem; color: #ff4d4f; border-color: #ffccc7; display: flex; align-items: center; gap: 4px;" onclick="window.carrierManager.withdrawBid('${ad.id}')"><i data-lucide="x-circle" style="width: 14px; height: 14px;"></i> Geri Çek</button>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `,
        'favorites': () => {
            const favoriteAds = state.ads.filter(ad => state.favorites.includes(ad.id));
            return `
                <div style="animation: fadeIn 0.4s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h3 class="dash-ad-title" style="color: var(--secondary);">Saved Ads</h3>
                        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">${favoriteAds.length} ilan kaydedildi</div>
                    </div>
                    <div class="dash-ad-list">
                        ${favoriteAds.length === 0 ? `
                            <div class="card" style="text-align: center; padding: 60px; color: #999;">
                                <div style="font-size: 3rem; margin-bottom: 20px;"><i data-lucide="bookmark" style="width: 48px; height: 48px; margin: 0 auto; opacity: 0.3;"></i></div>
                                <p>Henüz kaydettiğiniz bir ilan bulunmuyor.</p>
                                <button class="btn-outline" style="margin-top: 15px;" onclick="window.app.router.navigate('marketplace')">Pazara Göz At</button>
                            </div>
                        ` : favoriteAds.map(ad => {
                            const rightStatusHTML = `
                                <div class="dash-ad-status-box" style="text-align: right; display: flex; align-items: center; gap: 15px;">
                                    ${activeSub === 'premium' ? `<div style="font-size: 0.75rem; color: var(--secondary); font-weight: 700;">PREMIUM İNCELEME ${state.expandedAdId === ad.id ? '▲' : '▼'}</div>` : ''}
                                    <button class="favorite-btn active" onclick="event.stopPropagation(); window.app.store.toggleFavorite('${ad.id}')" title="Kaydı Kaldır">
                                        <i data-lucide="bookmark" style="width: 20px; height: 20px; fill: var(--secondary); color: var(--secondary);"></i>
                                    </button>
                                </div>
                            `;
                            const footerHTML = (activeSub === 'premium' && state.expandedAdId === ad.id) ? `
                                <div style="padding: 0 25px 25px; animation: slideUp 0.3s ease; border-top: 1px dashed var(--border-dim); padding-top: 20px; margin-top: 5px;">
                                    <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                                        <div>
                                            <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>Malın Cinsi:</strong> ${window.utils.escapeHTML(ad.goodsType) || 'Belirtilmedi'}</p>
                                            <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>Kategori:</strong> <span style="color: ${ad.cargoCategory?.includes('Tehlikeli') ? 'red' : 'green'}; font-weight: 600;">${window.utils.escapeHTML(ad.cargoCategory) || 'Genel Kargo'}</span></p>
                                            <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>Incoterm:</strong> <span class="status-badge" style="background: var(--border-dim); color: var(--text-primary); margin:0;">${ad.incoterm || 'Belirtilmedi'}</span></p>
                                        </div>
                                        <div>
                                            <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>Yükleme Tarihi:</strong> ${ad.deadline}</p>
                                            ${ad.cargoItems?.some(item => item.type === 'Parsiyel') || ad.cargoType?.includes('Parsiyel') ? `
                                                <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>İstifleme:</strong> ${ad.isStackable ? 'Evet' : 'Hayır'}</p>
                                            ` : ''}
                                            <p style="margin-bottom: 8px; font-size: 0.9rem;"><strong>Hacim/Ağırlık:</strong> ${ad.totalCBM || ad.volume || '-'} / ${ad.weight || '-'}</p>
                                        </div>
                                    </div>

                                    ${ad.cargoItems ? `
                                        <div style="margin-bottom: 20px;">
                                            <p style="margin-bottom: 10px; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Yük Kalemleri ve Fotoğrafları:</p>
                                            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                                                ${ad.cargoItems.map(item => `
                                                    <div style="background: var(--bg-page); padding: 12px; border-radius: 10px; border: 1px solid var(--border-dim); font-size: 0.85rem; border-left: 4px solid var(--accent);">
                                                        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
                                                            <span>${window.utils.escapeHTML(item.goods)}</span>
                                                            <span class="status-badge" style="background: var(--border-dim); color: var(--text-secondary); padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; font-weight: normal; margin: 0;">${window.utils.escapeHTML(item.type)}</span>
                                                        </div>
                                                        <div style="color: var(--text-secondary); margin-bottom: 6px;">${window.utils.escapeHTML(item.detail)}</div>
                                                        ${item.photos && item.photos.length > 0 ? `
                                                            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                                                                ${item.photos.map(p => `
                                                                    <img src="${p}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 1px solid var(--border-dim); transition: transform 0.2s;" onclick="event.stopPropagation(); window.open('${p}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                                                `).join('')}
                                                            </div>
                                                        ` : ''}
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}

                                    <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
                                        <div style="font-size: 0.8rem; color: #666; margin-right: auto; background: #e6f7ff; padding: 4px 10px; border-radius: 4px; border-left: 3px solid #1890ff;">
                                            Premium Üye: Bu ilana buradan doğrudan teklif verebilirsiniz.
                                        </div>
                                        <button class="btn-outline" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.marketplaceManager.toggleAd('${ad.id}')">Kapat</button>
                                        <button class="btn-primary" style="padding: 8px 20px; font-size: 0.85rem; background: var(--secondary);" onclick="window.marketplaceManager.showAdDetails('${ad.id}')">
                                            <i data-lucide="send" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> Teklif Ver
                                        </button>
                                    </div>
                                </div>
                            ` : '';

                            const onclick = activeSub === 'premium' ? `window.marketplaceManager.toggleAd('${ad.id}')` : `window.marketplaceManager.focusOnAd('${ad.id}')`;

                            return window.utils.renderAdCard(ad, {
                                customStyle: 'border-left: 5px solid var(--secondary);',
                                onclick,
                                rightStatusHTML,
                                footerHTML
                            });
                        }).join('')}
                    </div>
                </div>
            `;
        },
        'won-jobs': () => `
            <div style="animation: fadeIn 0.4s ease;">
                <h3 class="dash-ad-title" style="color: #27ae60; margin-bottom: 25px;">Won Shipments</h3>
                <div class="dash-ad-list">
                    ${wonAds.length === 0 ? `
                        <div class="card" style="text-align: center; padding: 60px; color: #999;">
                            <div style="font-size: 3rem; margin-bottom: 20px;"><i data-lucide="trophy" style="width: 48px; height: 48px; margin: 0 auto; color: #f39c12;"></i></div>
                            <p>Henüz kazanılmış bir işiniz bulunmuyor. Teklif vermeye devam edin!</p>
                        </div>
                    ` : wonAds.map(ad => {
                        const loader = state.users.find(u => u.name === ad.owner) || { email: 'destek@pruva.com', phone: '+90 216 ...' };
                        const daysOverdue = ad.estimatedDeliveryDate ? Math.floor((Date.now() - ad.estimatedDeliveryDate) / (1000 * 60 * 60 * 24)) : 0;
                        const isArchivable = daysOverdue > 14;

                        // Dynamic labels based on transport mode
                        const optLabels = {
                            sea: {
                                loaded: 'Gemiye Yüklendi', loadedIcon: 'ship',
                                customs: 'Liman / Gümrük Bölgesinde', customsIcon: 'anchor',
                                transit: 'Açık Denizde', transitIcon: 'compass'
                            },
                            air: {
                                loaded: 'Uçağa Yüklendi', loadedIcon: 'plane',
                                customs: 'Liman / Gümrük Bölgesinde', customsIcon: 'building-2',
                                transit: 'Uçuşta', transitIcon: 'send'
                            },
                            land: {
                                loaded: 'Araca Yüklendi', loadedIcon: 'package',
                                customs: 'Sınır Kapısında', customsIcon: 'shield',
                                transit: 'Yolda', transitIcon: 'truck'
                            }
                        };
                        const transportType = ad.transport || 'land';
                        const labels = optLabels[transportType] || optLabels.land;

                        return `
                        <div class="card dash-ad-card active-shipment">
                            <div class="dash-ad-main" onclick="window.marketplaceManager.toggleAd('${ad.id}')">
                                <div class="dash-ad-info">
                                    <div class="dash-ad-icon" style="background: #e6ffec; color: #27ae60;">
                                        <i data-lucide="package"></i>
                                    </div>
                                    <div>
                                        <h4 class="dash-ad-title">
                                            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                            ${ad.origin} ➔ ${ad.destination}
                                        </h4>
                                        <div class="dash-ad-meta">
                                            Yük Sahibi: <strong>${ad.owner}</strong> • Fiyat: <span style="color: #27ae60; font-weight: 700;">${ad.acceptedBid.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="dash-ad-status-box">
                                    <div class="dash-ad-label">Durum</div>
                                    <div class="dash-ad-value" style="color: #27ae60;">${ad.operationTimeline && ad.operationTimeline.length > 0 ? ad.operationTimeline[0].text.toUpperCase() : 'YÜKLEMEYE HAZIR'}</div>
                                </div>
                            </div>
 
                            ${state.expandedAdId === ad.id ? `
                                <div style="padding: 0 25px 25px; animation: slideUp 0.3s ease;">
                                    <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid var(--border-dim); padding-top: 20px;">
                                        <!-- İletişim Kartı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px;">
                                            <h5 style="margin-bottom: 12px; font-size: 0.85rem; color: var(--secondary); display: flex; align-items: center; gap: 8px;"><i data-lucide="phone" style="width: 16px; height: 16px;"></i> Yük Sahibi İletişim</h5>
                                            <div style="font-size: 0.9rem; margin-bottom: 8px;"><strong>E-posta:</strong> ${loader.email}</div>
                                            <div style="font-size: 0.9rem;"><strong>Telefon:</strong> ${loader.phone}</div>
                                            <button class="btn-outline" style="width: 100%; margin-top: 15px; padding: 8px; font-size: 0.8rem;" onclick="window.chatManager.toggleChat(true, '${ad.id}', '${ad.owner}')">Mesajlara Git</button>
                                        </div>
                                        <!-- Operasyon Kartı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px;">
                                            <h5 style="margin-bottom: 12px; font-size: 0.85rem; color: var(--secondary); display: flex; align-items: center; gap: 8px;"><i data-lucide="settings" style="width: 16px; height: 16px;"></i> Operasyonel Adımlar</h5>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                                                <button class="btn-primary" style="padding: 8px; font-size: 0.75rem; background: #3498db; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="event.stopPropagation(); window.operationModal.show('${ad.id}', '${labels.loaded}')"><i data-lucide="${labels.loadedIcon}" style="width: 14px; height: 14px;"></i> ${labels.loaded.split(' ')[0]}</button>
                                                <button class="btn-primary" style="padding: 8px; font-size: 0.75rem; background: #f39c12; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="event.stopPropagation(); window.operationModal.show('${ad.id}', '${labels.customs}')"><i data-lucide="${labels.customsIcon}" style="width: 14px; height: 14px;"></i> Liman/Gümrük</button>
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                                <button class="btn-primary" style="padding: 8px; font-size: 0.75rem; background: #9b59b6; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="event.stopPropagation(); window.operationModal.show('${ad.id}', '${labels.transit}')"><i data-lucide="${labels.transitIcon}" style="width: 14px; height: 14px;"></i> ${labels.transit.split(' ')[0]}</button>
                                                <button class="btn-primary" style="padding: 8px; font-size: 0.75rem; background: #27ae60; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="event.stopPropagation(); window.operationModal.show('${ad.id}', 'Teslim Edildi')"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Teslim</button>
                                            </div>
                                            
                                            <!-- Test Simülasyon Butonu (Deniz/Hava için) -->
                                            <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr; gap: 8px;">
                                                <button class="btn-outline" style="padding: 8px; font-size: 0.75rem; color: #d46b08; border-color: #ffe58f; background: #fffbe6; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; width: 100%;" onclick="event.stopPropagation(); window.carrierManager.simulatePortArrival('${ad.id}')">
                                                    🧪 Liman Girişi Simüle Et (Test)
                                                </button>
                                            </div>

                                            ${ad.estimatedDeliveryDate ? `
                                            <div style="margin-top: 10px; border-top: 1px dashed var(--border-dim); padding-top: 10px;">
                                                <h5 style="margin-bottom: 8px; font-size: 0.8rem; color: #e74c3c; display: flex; align-items: center; gap: 6px;"><i data-lucide="calendar-clock" style="width: 14px; height: 14px;"></i> Teslimat Takibi</h5>
                                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Planlanan: ${new Date(ad.estimatedDeliveryDate).toLocaleDateString('tr-TR')}</div>
                                                ${(ad.delayCount || 0) < 1 ? `
                                                <button class="btn-outline" style="width: 100%; padding: 6px; font-size: 0.75rem; color: #e74c3c; border-color: #ffccc7; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="event.stopPropagation(); window.carrierManager.showDelayModal('${ad.id}')"><i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i> Gecikme Bildir (1 Hakkınız Var)</button>
                                                ` : `
                                                <div style="font-size: 0.7rem; color: #888; background: #f5f5f5; padding: 6px; border-radius: 4px; text-align: center;">Erteleme hakkı kullanıldı. Ek gecikme için support@pruvahub.com.</div>
                                                `}
                                            </div>
                                            ` : ''}
                                            <div style="margin-top: 10px; border-top: 1px dashed var(--border-dim); padding-top: 10px;">
                                                <button class="btn-outline" style="width: 100%; padding: 8px; font-size: 0.8rem; background: var(--bg-surface); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="event.stopPropagation(); window.loaderManager.uploadDocument('${ad.id}')"><i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Evrak Yükle</button>
                                                <button class="btn-outline" style="width: 100%; padding: 8px; font-size: 0.8rem; color: #e74c3c; border-color: #ffccc7; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="event.stopPropagation(); window.carrierManager.withdrawFromShipment('${ad.id}')"><i data-lucide="x-octagon" style="width: 16px; height: 16px;"></i> Seferden Çekil</button>
                                                ${isArchivable ? `<button class="btn-primary" style="width: 100%; padding: 8px; font-size: 0.8rem; background: #95a5a6; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="event.stopPropagation(); window.carrierManager.archiveShipment('${ad.id}')"><i data-lucide="archive" style="width: 16px; height: 16px;"></i> Süreci Kapat / Arşive Kaldır</button>` : ''}
                                            </div>
                                        </div>
                                        
                                        <!-- Free Time & Demurrage Tracking Widget -->
                                        ${window.utils.renderFreeTimeWidget(ad)}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `,
        'completed-jobs': () => {
            const completedAds = state.ads.filter(ad => ad.status === 'completed' && ad.acceptedBid && ad.acceptedBid.company === currentUser);
            return `
                <div style="animation: fadeIn 0.4s ease;">
                    <h3 class="dash-ad-title" style="color: #27ae60; margin-bottom: 25px;">Completed Shipments</h3>
                    <div class="dash-ad-list">
                        ${completedAds.length === 0 ? `
                            <div class="card" style="text-align: center; padding: 60px; color: #999;">
                                <div style="font-size: 3rem; margin-bottom: 20px;"><i data-lucide="flag" style="width: 48px; height: 48px; margin: 0 auto;"></i></div>
                                <p>Henüz tamamlanmış bir işiniz bulunmuyor.</p>
                            </div>
                        ` : completedAds.map(ad => `
                            <div class="card" style="padding: 20px; border-left: 5px solid #27ae60;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 45px; height: 45px; background: #f0fdf4; color: #27ae60; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                            <i data-lucide="check-circle"></i>
                                        </div>
                                        <div>
                                            <h4 class="dash-ad-title" style="margin: 0;">
                                                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                                ${ad.origin} ➔ ${ad.destination}
                                            </h4>
                                            <div class="dash-ad-meta">Yük Sahibi: ${ad.owner}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        ${(ad.reviews && ad.reviews[state.currentUser]) ? `
                                            <span style="color: #27ae60; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">Puanlandı <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i></span>
                                        ` : `
                                            <button class="btn-primary" style="padding: 6px 12px; font-size: 0.75rem; background: var(--secondary); display: flex; align-items: center; gap: 4px;" onclick="window.reviewModal.show('${ad.id}', '${ad.owner}', 'loader')"><i data-lucide="star" style="width: 12px; height: 12px;"></i> Yük Sahibini Değerlendir</button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },
        'references': () => {
            const refs = (state.currentUserData && state.currentUserData.references) || [];
            const verifiedRefs = refs.filter(r => r.status === 'verified');
            const pendingRefs = refs.filter(r => r.status === 'pending');
            const rejectedRefs = refs.filter(r => r.status === 'rejected');

            return `
                <div style="animation: fadeIn 0.4s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h3 class="dash-ad-title" style="color: var(--secondary);">Company References</h3>
                        <button class="btn-primary" onclick="document.getElementById('ref-add-form').style.display = document.getElementById('ref-add-form').style.display === 'none' ? 'block' : 'none'" style="padding: 8px 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="plus" style="width: 14px; height: 14px;"></i> Referans Ekle</button>
                    </div>

                    <!-- Referans Ekleme Formu -->
                    <div id="ref-add-form" class="card" style="display: none; border-left: 5px solid var(--secondary); margin-bottom: 25px;">
                        <div style="padding: 25px;">
                            <h4 style="margin-bottom: 20px; color: var(--secondary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="clipboard-list"></i> Yeni Referans Ekle</h4>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 20px; padding: 10px; background: var(--bg-elevated); border-radius: 8px; border-left: 3px solid var(--warning);">
                                ⚠️ Referans olarak göstereceğiniz firma ile <strong>son 3 ay içinde</strong> yaptığınız iş belgesi (irsaliye, sözleşme veya referans mektubu) yüklemeniz gerekmektedir.
                            </p>
                            <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label style="font-size: 0.85rem;">Firma Adı *</label>
                                    <input type="text" id="ref-company" class="form-control" placeholder="Örn: Migros A.Ş." required>
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.85rem;">Sektör *</label>
                                    <select id="ref-sector" class="form-control">
                                        <option value="">Seçiniz</option>
                                        <option value="FMCG / Perakende">FMCG / Perakende</option>
                                        <option value="Otomotiv">Otomotiv</option>
                                        <option value="Tekstil / Hazır Giyim">Tekstil / Hazır Giyim</option>
                                        <option value="Beyaz Eşya / Elektronik">Beyaz Eşya / Elektronik</option>
                                        <option value="İnşaat / Yapı Malzemeleri">İnşaat / Yapı Malzemeleri</option>
                                        <option value="Kimya / İlaç">Kimya / İlaç</option>
                                        <option value="Gıda / Tarım">Gıda / Tarım</option>
                                        <option value="Enerji / Maden">Enerji / Maden</option>
                                        <option value="E-Ticaret / Lojistik">E-Ticaret / Lojistik</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.85rem;">İlişki Süresi *</label>
                                    <select id="ref-duration" class="form-control">
                                        <option value="">Seçiniz</option>
                                        <option value="0-6 ay">0 - 6 Ay</option>
                                        <option value="6 ay - 1 yıl">6 Ay - 1 Yıl</option>
                                        <option value="1-2 yıl">1 - 2 Yıl</option>
                                        <option value="2-5 yıl">2 - 5 Yıl</option>
                                        <option value="5+ yıl">5+ Yıl</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.85rem;">Taşıma Türü *</label>
                                    <select id="ref-transport" class="form-control">
                                        <option value="">Seçiniz</option>
                                        <option value="Karayolu FTL">Karayolu FTL</option>
                                        <option value="Karayolu LTL">Karayolu LTL</option>
                                        <option value="Denizyolu FCL">Denizyolu FCL</option>
                                        <option value="Denizyolu LCL">Denizyolu LCL</option>
                                        <option value="Havayolu">Havayolu</option>
                                        <option value="Soğuk Zincir Karayolu">Soğuk Zincir Karayolu</option>
                                        <option value="Multimodal">Multimodal</option>
                                        <option value="Proje Kargo">Proje Kargo</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top: 10px;">
                                <label style="font-size: 0.85rem;">📎 Belge Yükle (Son 3 Ay İçi İrsaliye / Sözleşme / Referans Mektubu) *</label>
                                <div id="ref-doc-upload" style="margin-top: 8px; border: 2px dashed var(--border); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: var(--transition); background: var(--bg-elevated);" onclick="document.getElementById('ref-doc-input').click()">
                                    <div id="ref-doc-preview" style="display: none;"></div>
                                    <div id="ref-doc-placeholder">
                                        <div style="font-size: 2rem; margin-bottom: 10px; color: var(--text-muted);"><i data-lucide="file-up" style="width: 48px; height: 48px; margin: 0 auto;"></i></div>
                                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Belge yüklemek için tıklayın</p>
                                        <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">JPG, PNG veya PDF • Max 5MB</p>
                                    </div>
                                </div>
                                <input type="file" id="ref-doc-input" accept="image/*,.pdf" style="display: none;" onchange="window.referenceManager.handleDocUpload(event)">
                            </div>
                            <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                                <button type="button" class="btn-outline" onclick="document.getElementById('ref-add-form').style.display = 'none'">Vazgeç</button>
                                <button type="button" class="btn-primary" onclick="window.referenceManager.submitReference()">Referansı Gönder</button>
                            </div>
                        </div>
                    </div>

                    <!-- Doğrulanmış Referanslar -->
                    ${verifiedRefs.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 0.85rem; color: var(--success); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;"><i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Doğrulanmış Referanslar (${verifiedRefs.length})</h4>
                            ${verifiedRefs.map(ref => `
                                <div class="card" style="padding: 20px; border-left: 5px solid var(--success); margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <div style="width: 45px; height: 45px; background: rgba(16, 185, 129, 0.1); color: var(--success); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i data-lucide="building-2"></i></div>
                                            <div>
                                                <h4 class="dash-ad-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                                    ${ref.companyName}
                                                    <span style="background: rgba(16, 185, 129, 0.1); color: var(--success); font-size: 0.6rem; padding: 3px 8px; border-radius: 6px; font-weight: 700;">✅ DOĞRULANDI</span>
                                                </h4>
                                                <div class="dash-ad-meta">${ref.sector} • ${ref.duration} • ${ref.transportType}</div>
                                            </div>
                                        </div>
                                        <button class="btn-outline" style="padding: 5px 10px; font-size: 0.7rem; color: var(--danger); border-color: var(--danger);" onclick="event.stopPropagation(); window.referenceManager.removeReference('${ref.id}')">Kaldır</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Onay Bekleyen Referanslar -->
                    ${pendingRefs.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 0.85rem; color: var(--warning); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;"><i data-lucide="clock" style="width: 16px; height: 16px;"></i> Onay Bekleyen Referanslar (${pendingRefs.length})</h4>
                            ${pendingRefs.map(ref => `
                                <div class="card" style="padding: 20px; border-left: 5px solid var(--warning); margin-bottom: 12px; opacity: 0.85;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <div style="width: 45px; height: 45px; background: rgba(245, 158, 11, 0.1); color: var(--warning); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i data-lucide="clock"></i></div>
                                            <div>
                                                <h4 class="dash-ad-title" style="margin: 0;">${ref.companyName}</h4>
                                                <div class="dash-ad-meta">${ref.sector} • ${ref.duration} • Admin onayı bekleniyor</div>
                                            </div>
                                        </div>
                                        <span style="font-size: 0.75rem; color: var(--warning); font-weight: 600;">İnceleniyor</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Reddedilen Referanslar -->
                    ${rejectedRefs.length > 0 ? `
                        <div>
                            <h4 style="font-size: 0.85rem; color: var(--danger); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;"><i data-lucide="x-circle" style="width: 16px; height: 16px;"></i> Reddedilen Referanslar (${rejectedRefs.length})</h4>
                            ${rejectedRefs.map(ref => `
                                <div class="card" style="padding: 20px; border-left: 5px solid var(--danger); margin-bottom: 12px; opacity: 0.6;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <div style="width: 45px; height: 45px; background: rgba(239, 68, 68, 0.1); color: var(--danger); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i data-lucide="x-circle"></i></div>
                                            <div>
                                                <h4 class="dash-ad-title" style="margin: 0;">${ref.companyName}</h4>
                                                <div class="dash-ad-meta">${ref.sector} • Belge yetersiz veya geçersiz</div>
                                            </div>
                                        </div>
                                        <button class="btn-outline" style="padding: 5px 10px; font-size: 0.7rem;" onclick="event.stopPropagation(); window.referenceManager.removeReference('${ref.id}')">Sil</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${refs.length === 0 ? `
                        <div class="card" style="text-align: center; padding: 60px; color: var(--text-muted);">
                            <div style="font-size: 3rem; margin-bottom: 20px;"><i data-lucide="building-2" style="width: 48px; height: 48px; margin: 0 auto;"></i></div>
                            <p>Henüz referans eklenmemiş.</p>
                            <p style="font-size: 0.8rem; margin-top: 10px;">Referans ekleyerek tekliflerinizi güçlendirin. Doğrulanmış referanslar yükleyicilere güven verir.</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    };

    const tabContent = TAB_RENDERERS[activeTab] ? TAB_RENDERERS[activeTab]() : '';

    return `
    <div class="container dashboard-wrapper">


        <!-- Test Plan Toggle (Prominent) -->
        <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 12px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); animation: slideDown 0.5s ease;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: #ffeeba; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🧪</div>
                <div>
                    <strong style="display: block; font-size: 0.9rem; margin-bottom: 2px;">Test Modu Kontrol Paneli</strong>
                    <span style="font-size: 0.8rem; opacity: 0.9;">Mevcut Üyelik: <strong style="color: #634d02; text-transform: uppercase;">${window.utils.getSubscriptionStatus(state) === 'premium' ? '✨ PREMIUM' : 'STANDART'}</strong></span>
                </div>
            </div>
            <button class="btn-primary" style="background: #856404; border: none; padding: 10px 20px; font-size: 0.85rem; font-weight: 700; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onclick="window.carrierManager.toggleSubscription()">
                Planı Değiştir (Premium ⇄ Standart)
            </button>
        </div>

        <!-- Header -->
        <div class="dashboard-header">
            <div class="dashboard-title">
                <h1 style="color: var(--secondary);">Carrier Dashboard</h1>
                <p>Tekliflerinizi yönetin, yeni yükler bulun ve kazancınızı artırın.</p>
            </div>

            <div class="dashboard-user-info">
                <div class="dashboard-user-label">Aktif Şirket</div>
                <div class="dashboard-user-name" style="color: var(--secondary);">${currentUser}</div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="dashboard-stats" style="grid-template-columns: repeat(4, 1fr);">
            <div class="stat-card" style="border-bottom-color: var(--secondary);">
                <div class="stat-card-icon"><i data-lucide="file-text"></i></div>
                <div>
                    <div class="stat-card-number" style="color: var(--secondary);">${biddedAds.length}</div>
                    <div class="stat-card-label">Bekleyen Teklif</div>
                </div>
            </div>
            
            <div class="stat-card success">
                <div class="stat-card-icon"><i data-lucide="trophy"></i></div>
                <div>
                    <div class="stat-card-number">${wonAds.length}</div>
                    <div class="stat-card-label">Kazanılan İş</div>
                </div>
            </div>

            <div class="stat-card" style="border-bottom-color: #f39c12; position: relative;">
                ${state.currentUserData && state.currentUserData.performance && state.currentUserData.performance.overallRating >= 4.5 ? '<div style="position:absolute; top:-10px; right:-10px; background:#f39c12; color:white; font-size:0.7rem; padding:4px 8px; border-radius:10px; font-weight:bold;">Süper Taşıyıcı</div>' : ''}
                <div class="stat-card-icon"><i data-lucide="star"></i></div>
                <div>
                    <div class="stat-card-number" style="color: #f39c12;">${(state.currentUserData && state.currentUserData.performance) ? state.currentUserData.performance.overallRating : 'Yeni'}</div>
                    <div class="stat-card-label">Genel Puan</div>
                </div>
            </div>
            
            <div class="stat-card" style="border-bottom-color: ${((state.currentUserData && state.currentUserData.performance) ? state.currentUserData.performance.trackingScore : 100) < 50 ? '#e74c3c' : '#3498db'};">
                <div class="stat-card-icon"><i data-lucide="target"></i></div>
                <div>
                    <div class="stat-card-number" style="color: ${((state.currentUserData && state.currentUserData.performance) ? state.currentUserData.performance.trackingScore : 100) < 50 ? '#e74c3c' : '#3498db'};">%${(state.currentUserData && state.currentUserData.performance) ? state.currentUserData.performance.trackingScore : 100}</div>
                    <div class="stat-card-label">Statü Başarısı</div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="dashboard-tabs">
            <button class="tab-btn ${activeTab === 'my-bids' ? 'active' : ''}" style="${activeTab === 'my-bids' ? 'color: var(--secondary); border-bottom-color: var(--secondary);' : ''}" onclick="window.carrierManager.switchTab('my-bids')">
                My Bids
            </button>
            <button class="tab-btn ${activeTab === 'favorites' ? 'active' : ''}" style="${activeTab === 'favorites' ? 'color: var(--secondary); border-bottom-color: var(--secondary);' : ''}" onclick="window.carrierManager.switchTab('favorites')">
                <i data-lucide="bookmark" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px; ${activeTab === 'favorites' ? 'fill: var(--secondary);' : ''}"></i> Saved
            </button>
            <button class="tab-btn ${activeTab === 'won-jobs' ? 'active' : ''}" style="${activeTab === 'won-jobs' ? 'color: var(--secondary); border-bottom-color: var(--secondary);' : ''}" onclick="window.carrierManager.switchTab('won-jobs')">
                Active Jobs
            </button>
            <button class="tab-btn ${activeTab === 'completed-jobs' ? 'active' : ''}" style="${activeTab === 'completed-jobs' ? 'color: var(--secondary); border-bottom-color: var(--secondary);' : ''}" onclick="window.carrierManager.switchTab('completed-jobs')">
                Completed
            </button>
            <button class="tab-btn ${activeTab === 'references' ? 'active' : ''}" style="${activeTab === 'references' ? 'color: var(--secondary); border-bottom-color: var(--secondary);' : ''}" onclick="window.carrierManager.switchTab('references')">
                <i data-lucide="clipboard-list" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> References
            </button>
        </div>

        <!-- Tab Content -->
        ${tabContent}
    </div>`;
};
