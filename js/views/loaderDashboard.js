window.loaderDashboardView = (state) => {
    const activeTab = state.loaderActiveTab || 'open-ads';
    const myAds = state.ads.filter(ad => ad.owner === state.currentUser);
    
    // Tab bazlı veri ayrıştırma
    const openAds = myAds.filter(ad => ad.status === 'pending' || ad.status === 'bidded');
    const activeShipments = myAds.filter(ad => ad.status === 'accepted');
    const totalBids = openAds.reduce((acc, ad) => acc + (ad.bids ? ad.bids.filter(b => !b.isGhost).length : 0), 0);

    const TAB_RENDERERS = {
        'open-ads': () => `
            <div style="animation: fadeIn 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 class="dash-ad-title">Active Requests</h3>
                    <button class="btn-primary" onclick="window.app.router.navigate('post-ad')" style="padding: 8px 20px; font-size: 0.85rem;">+ Yeni İlan Oluştur</button>
                </div>
                
                <div class="dash-ad-list">
                    ${openAds.length === 0 ? window.utils.emptyState('package', 'Henüz aktif bir ilanınız bulunmuyor.', 'İlk İlanınızı Verin', "window.app.router.navigate('post-ad')") : openAds.map(ad => {
                        const isExpanded = state.expandedAdId === ad.id;
                        const bidCount = (ad.bids || []).filter(b => !b.isGhost).length;
                        const footerHTML = isExpanded ? `
                            <div style="padding: 0 25px 25px; animation: slideUp 0.3s ease;">
                                <div style="border-top: 1px dashed var(--border-dim); padding-top: 20px;">
                                    <h5 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                        <i data-lucide="banknote" style="width: 18px; height: 18px; color: var(--accent);"></i> Gelen Teklifler
                                    </h5>
                                    <div class="bid-list">
                                        ${bidCount === 0 ? `
                                            <div style="padding: 20px; text-align: center; background: var(--bg-page); border-radius: 12px; color: #aaa; font-size: 0.85rem;">
                                                Henüz teklif gelmedi. İlanınız taşıyıcılar tarafından inceleniyor.
                                            </div>
                                        ` : (ad.bids || []).filter(b => !b.isGhost).map((bid, idx) => {
                                            const carrier = state.users.find(u => u.name === bid.company);
                                            const verifiedRefs = carrier && carrier.references ? carrier.references.filter(r => r.status === 'verified') : [];
                                            
                                            return `
                                            <div class="bid-card" style="background: white; border: 1px solid var(--border-dim); border-radius: 12px; padding: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 20px; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='var(--border-dim)'; this.style.transform='translateX(0)'">
                                                
                                                <!-- Carrier Identity -->
                                                <div style="flex: 1.5; min-width: 180px;">
                                                    <div style="font-size: 0.7rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px;">Taşıyıcı Firma</div>
                                                    <div style="font-weight: 800; color: var(--primary); font-size: 1rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--secondary)'" onmouseout="this.style.color='var(--primary)'" onclick="window.userProfileModal.show('${bid.company}')">
                                                        ${bid.company || `Taşıyıcı #${idx + 1}`}
                                                        <span style="color: #f39c12; font-size: 0.85rem; background: #fff8e1; padding: 2px 8px; border-radius: 4px; border: 1px solid #ffe082; display: flex; align-items: center; gap: 4px;" title="Detaylı profil ve yorumları görmek için tıklayın">
                                                            <i data-lucide="star" style="width: 12px; height: 12px; fill: #f39c12;"></i> ${carrier && carrier.performance ? carrier.performance.overallRating : '4.5'}
                                                        </span>
                                                    </div>
                                                    <!-- References Under Name -->
                                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                                        ${verifiedRefs.length > 0 ? `
                                                            <div style="font-size: 0.65rem; color: #27ae60; font-weight: 600; display: flex; align-items: flex-start; gap: 4px;" title="Tüm Referanslar: ${verifiedRefs.map(r => r.companyName).join(', ')}">
                                                                <i data-lucide="check-check" style="width: 12px; height: 12px;"></i>
                                                                <span>Ref: ${verifiedRefs.slice(0, 3).map(r => r.companyName).join(', ')}${verifiedRefs.length > 3 ? `<span onclick="window.referenceManager.showAllReferences('${bid.company}')" style="color: var(--secondary); cursor: pointer; text-decoration: underline; margin-left: 4px;">+${verifiedRefs.length - 3} daha</span>` : ''}</span>
                                                            </div>
                                                        ` : `<span style="background: #f0f2f5; color: #888; font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; width: fit-content;">Yeni Üye / Belgesiz</span>`}
                                                    </div>
                                                </div>

                                                <!-- Price Column -->
                                                <div style="flex: 1; text-align: center; border-left: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0;">
                                                    <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Teklif Tutarı</div>
                                                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${bid.price}</div>
                                                </div>

                                                <!-- Stats Grid -->
                                                <div style="flex: 2.5; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; row-gap: 15px;">
                                                    <div>
                                                        <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Hat / Line</div>
                                                        <div style="font-size: 0.85rem; font-weight: 600; color: #444;">${bid.line || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Sefer Tipi</div>
                                                        <div style="font-size: 0.85rem; font-weight: 600; color: #444;">${bid.routeType || 'Direkt'}</div>
                                                    </div>
                                                    <div>
                                                        <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Transit</div>
                                                        <div style="font-size: 0.85rem; font-weight: 600; color: #444;">${bid.time || '15 Gün'}</div>
                                                    </div>
                                                    <div>
                                                        <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Free Time</div>
                                                        <div style="font-size: 0.85rem; font-weight: 600; color: #444;">${bid.freeTime || '7 Gün'}</div>
                                                    </div>
                                                    <div style="grid-column: span 2;">
                                                        <div style="font-size: 0.65rem; color: #aaa; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Geçerlilik</div>
                                                        <div style="font-size: 0.85rem; font-weight: 600; color: #444;">${bid.validity || '3 Gün'}</div>
                                                    </div>
                                                </div>

                                                <!-- Actions -->
                                                <div style="flex: 1.2; display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                                                    <button class="btn-primary" style="width: 100%; padding: 7px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 5px;" onclick="event.stopPropagation(); window.chatManager.toggleChat(true, '${ad.id}', '${bid.company}')">
                                                        <i data-lucide="message-square" style="width: 14px; height: 14px;"></i> Mesaj
                                                    </button>
                                                    <button class="btn-outline" style="width: 100%; padding: 7px; font-size: 0.75rem; border-radius: 8px; color: #27ae60; border-color: #27ae60; background: white;" onmouseover="this.style.background='#e6ffec'" onmouseout="this.style.background='white'" onclick="event.stopPropagation(); window.loaderManager.acceptBid('${ad.id}', ${idx})">
                                                        <i data-lucide="check" style="width: 14px; height: 14px;"></i> Onayla
                                                    </button>
                                                </div>
                                            </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                                <div style="margin-top: 20px; text-align: right;">
                                    <button onclick="event.stopPropagation(); window.loaderManager.cancelAd('${ad.id}')" style="background: none; border: none; color: #ff4d4f; font-size: 0.8rem; cursor: pointer; text-decoration: underline;">İlanı Yayından Kaldır</button>
                                </div>
                            </div>
                        ` : '';
                        return window.utils.renderAdCard(ad, { footerHTML });
                    }).join('')}
                </div>
            </div>
        `,
        'active-shipments': () => `
            <div style="animation: fadeIn 0.4s ease;">
                <h3 class="dash-ad-title" style="margin-bottom: 25px;">Ongoing Shipments</h3>
                <div class="dash-ad-list">
                    ${activeShipments.length === 0 ? window.utils.emptyState('ship', 'Henüz devam eden bir sevkiyatınız bulunmuyor.') : activeShipments.map(ad => {
                        const carrier = state.users.find(u => u.name === ad.acceptedBid?.company) || { email: 'bilgi@pruva.com', phone: '+90 212 ...' };
                        const daysOverdue = ad.estimatedDeliveryDate ? Math.floor((Date.now() - ad.estimatedDeliveryDate) / (1000 * 60 * 60 * 24)) : 0;
                        const isArchivable = daysOverdue > 14;
                        return `
                        <div class="card dash-ad-card active-shipment">
                            <div class="dash-ad-main" onclick="window.marketplaceManager.toggleAd('${ad.id}')">
                                <div class="dash-ad-info">
                                    <div class="dash-ad-icon" style="background: #e6ffec; color: #27ae60;">
                                        <i data-lucide="truck"></i>
                                    </div>
                                    <div>
                                        <h4 class="dash-ad-title">
                                            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                            ${ad.origin} ➔ ${ad.destination}
                                        </h4>
                                        <div class="dash-ad-meta">
                                            Taşıyıcı: <strong>${ad.acceptedBid?.company || 'Global Carrier'}</strong> • Durum: <span style="color: #27ae60; font-weight: 600;">${ad.operationTimeline && ad.operationTimeline.length > 0 ? ad.operationTimeline[0].text : 'Operasyon Başladı'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="dash-ad-status-box">
                                    <div class="dash-ad-label">İşlem Tarihi</div>
                                    <div class="dash-ad-value">Bugün</div>
                                </div>
                            </div>

                            ${state.expandedAdId === ad.id ? `
                                <div style="padding: 0 25px 25px; animation: slideUp 0.3s ease;">
                                    <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid var(--border-dim); padding-top: 20px;">
                                        <!-- İletişim Kartı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px;">
                                            <h5 style="margin-bottom: 12px; font-size: 0.85rem; color: var(--primary); display: flex; align-items: center; gap: 8px;"><i data-lucide="phone" style="width: 16px; height: 16px;"></i> Taşıyıcı İletişim</h5>
                                            <div style="font-size: 0.9rem; margin-bottom: 8px;"><strong>E-posta:</strong> ${carrier.email}</div>
                                            <div style="font-size: 0.9rem;"><strong>Telefon:</strong> ${carrier.phone}</div>
                                            <button class="btn-outline" style="width: 100%; margin-top: 15px; padding: 8px; font-size: 0.8rem;" onclick="window.chatManager.toggleChat(true, '${ad.id}', '${ad.acceptedBid?.company || ''}')">Mesajlara Git</button>
                                        </div>
                                        <!-- Evrak Alanı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px;">
                                            <h5 style="margin-bottom: 12px; font-size: 0.85rem; color: var(--primary); display: flex; align-items: center; gap: 8px;"><i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Sevkiyat Evrakları</h5>
                                            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                                <div style="flex: 1; padding: 8px; background: var(--bg-surface); border: 1px solid var(--border-dim); border-radius: 6px; font-size: 0.75rem; text-align: center;">CMR Bekleniyor</div>
                                                <div style="flex: 1; padding: 8px; background: var(--bg-surface); border: 1px solid var(--border-dim); border-radius: 6px; font-size: 0.75rem; text-align: center;">Fatura</div>
                                            </div>
                                            <button class="btn-primary" style="width: 100%; padding: 8px; font-size: 0.8rem; background: var(--secondary);" onclick="event.stopPropagation(); window.loaderManager.uploadDocument('${ad.id}')">Evrak Yükle</button>
                                        </div>

                                        <!-- Araç Gelmedi Alanı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px; grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; border: 1px solid #ffdce0;">
                                            <div>
                                                <h5 style="margin-bottom: 5px; font-size: 0.85rem; color: #e74c3c; display: flex; align-items: center; gap: 8px;"><i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i> Araç Gelmedi mi?</h5>
                                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Taşıyıcı iptal ettiyse ilanı tekrar diğer tekliflere açabilirsiniz.</div>
                                            </div>
                                            <button class="btn-outline" style="padding: 8px 15px; font-size: 0.8rem; color: #e74c3c; border-color: #ffdce0; white-space: nowrap;" onclick="event.stopPropagation(); window.loaderManager.reportNoShow('${ad.id}')">İlanı Tekrar Aç</button>
                                        </div>

                                        <!-- Sevkiyat İptal Alanı (Loader İptali) -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px; grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; border: 1px solid #ffccc7; margin-top: 10px;">
                                            <div>
                                                <h5 style="margin-bottom: 5px; font-size: 0.85rem; color: #ff4d4f; display: flex; align-items: center; gap: 8px;"><i data-lucide="x-octagon" style="width: 16px; height: 16px;"></i> Sevkiyatı İptal Etmek mi İstiyorsunuz?</h5>
                                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Tek taraflı iptal etmek taşıyıcıyı mağdur eder ve profilinizden -0.3 puan düşülmesine sebep olur.</div>
                                            </div>
                                            <button class="btn-primary" style="padding: 8px 15px; font-size: 0.8rem; background: #ff4d4f; border: none; white-space: nowrap;" onclick="event.stopPropagation(); window.loaderManager.cancelAcceptedShipment('${ad.id}')">Sevkiyatı İptal Et</button>
                                        </div>
                                        
                                        ${isArchivable ? `
                                        <!-- Arşive Kaldır Alanı -->
                                        <div style="background: var(--bg-page); border-radius: 12px; padding: 15px; grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; border: 1px solid #95a5a6; margin-top: 10px;">
                                            <div>
                                                <h5 style="margin-bottom: 5px; font-size: 0.85rem; color: #7f8c8d; display: flex; align-items: center; gap: 8px;"><i data-lucide="archive" style="width: 16px; height: 16px;"></i> İşlem Tamamlandı mı?</h5>
                                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Teslim tarihinin üzerinden çok zaman geçti. İlanı aktif ekranınızdan kaldırabilirsiniz.</div>
                                            </div>
                                            <button class="btn-primary" style="padding: 8px 15px; font-size: 0.8rem; background: #95a5a6; border: none; white-space: nowrap;" onclick="event.stopPropagation(); window.loaderManager.archiveShipment('${ad.id}')">Süreci Kapat / Arşive Kaldır</button>
                                        </div>
                                        ` : ''}
                                        
                                        <!-- Free Time & Demurrage Tracking Widget -->
                                        ${window.utils.renderFreeTimeWidget(ad)}
                                    </div>
                                    
                                    <!-- Zaman Tüneli (Timeline) -->
                                    <div class="timeline-container">
                                        <h5 style="margin-bottom: 15px; font-size: 0.9rem; color: var(--primary); display: flex; align-items: center; gap: 8px;"><i data-lucide="history" style="width: 18px; height: 18px;"></i> Operasyon Geçmişi</h5>
                                        <div class="timeline-list">
                                            ${(ad.operationTimeline || []).map((t, idx) => {
                                                const isLast = idx === 0;
                                                let icon = 'info';
                                                let color = '#ccc';
                                                if (t.text.includes('Yüklendi')) { icon = 'package'; color = '#3498db'; }
                                                if (t.text.includes('Gümrük')) { icon = 'shield'; color = '#f39c12'; }
                                                if (t.text.includes('Yolda')) { icon = 'truck'; color = '#9b59b6'; }
                                                if (t.text.includes('Teslim')) { icon = 'check-circle'; color = '#27ae60'; }
                                                
                                                return `
                                                    <div class="timeline-item ${isLast ? 'active' : ''}">
                                                        <div class="timeline-point" style="background: ${isLast ? color : ''}">
                                                            <i data-lucide="${icon}" style="width: 14px; height: 14px; color: white;"></i>
                                                        </div>
                                                        <div style="padding-top: 5px;">
                                                            <div style="font-size: 0.85rem; font-weight: ${isLast ? '700' : '600'}; color: ${isLast ? 'var(--text-primary)' : 'var(--text-secondary)'};">${t.text}</div>
                                                            <div style="font-size: 0.7rem; color: #999; margin-top: 2px;">${t.date}</div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                    
                                    ${(ad.operationTimeline && ad.operationTimeline.length > 0 && ad.operationTimeline[0].text === 'Teslim Edildi') ? `
                                        <div style="margin-top: 15px; text-align: center; background: #fff9e6; border: 1px solid #f39c12; border-radius: 8px; padding: 15px;">
                                            <div style="font-size: 0.9rem; color: #f39c12; font-weight: 600; margin-bottom: 10px;">Lojistik operasyonu tamamlandı. Deneyiminizi nasıl değerlendirirsiniz?</div>
                                            <button class="btn-primary" style="background: #f39c12; padding: 8px 20px; font-size: 0.85rem;" onclick="event.stopPropagation(); window.reviewModal.show('${ad.id}', '${ad.acceptedBid?.company || 'Bilinmeyen Taşıyıcı'}')">⭐ Taşıyıcıyı Değerlendir</button>
                                        </div>
                                    ` : ''}

                                </div>
                            ` : ''}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `,
        'completed-shipments': () => {
            const completedShipments = myAds.filter(ad => ad.status === 'completed');
            return `
                <div style="animation: fadeIn 0.4s ease;">
                    <h3 class="dash-ad-title" style="color: #27ae60; margin-bottom: 25px;">Completed Orders</h3>
                    <div class="dash-ad-list">
                        ${completedShipments.length === 0 ? window.utils.emptyState('check-circle', 'Henüz tamamlanmış bir sevkiyatınız bulunmuyor.') : completedShipments.map(ad => `
                            <div class="card" style="padding: 20px; border-left: 5px solid #27ae60;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 45px; height: 45px; background: #e6ffec; color: #27ae60; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                            <i data-lucide="package"></i>
                                        </div>
                                        <div>
                                            <h4 class="dash-ad-title" style="margin: 0;">
                                                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${window.utils.formatAdNumber(ad.id)}</span>
                                                ${ad.origin} ➔ ${ad.destination}
                                            </h4>
                                            <div class="dash-ad-meta">Taşıyıcı: ${ad.acceptedBid?.company}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        ${(ad.reviews && ad.reviews[state.currentUser]) ? `
                                            <span style="color: #27ae60; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">Puanlandı <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i></span>
                                        ` : `
                                            <button class="btn-primary" style="padding: 6px 12px; font-size: 0.75rem; background: var(--secondary); display: flex; align-items: center; gap: 4px;" onclick="window.reviewModal.show('${ad.id}', '${ad.acceptedBid?.company}', 'carrier')"><i data-lucide="star" style="width: 12px; height: 12px;"></i> Değerlendir</button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    };

    const tabContent = TAB_RENDERERS[activeTab] ? TAB_RENDERERS[activeTab]() : '';

    // Blocking Confirmation Overlay Logic
    const pendingConfirmationAds = myAds.filter(ad => ad.status === 'delivered');
    let overlayHTML = '';
    
    if (pendingConfirmationAds.length > 0) {
        const ad = pendingConfirmationAds[0];
        overlayHTML = `
            <div id="delivery-confirmation-overlay" class="dash-overlay">
                <div class="dash-overlay-card">
                    <div style="font-size: 4.5rem; margin-bottom: 25px;"><i data-lucide="truck" style="width: 80px; height: 80px; margin: 0 auto; color: var(--secondary);"></i></div>
                    <h2 style="color: var(--primary); margin-bottom: 15px; font-size: 1.8rem; font-weight: 800; letter-spacing: -1px;">Teslimat Onayı Bekleniyor</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 35px; line-height: 1.7; font-size: 1rem;">
                        <strong style="color:var(--secondary);">${ad.origin} ➔ ${ad.destination}</strong> parkuru için taşıyıcı teslimatın tamamlandığını bildirdi. 
                        İşlemi bitirmek ve değerlendirme yapmak için lütfen onay verin.
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        <button class="btn-primary" style="padding: 18px; font-size: 1.05rem; background: #27ae60; font-weight: 700; border-radius: 14px; box-shadow: 0 10px 20px rgba(39,174,96,0.2); display: flex; align-items: center; justify-content: center; gap: 10px;" onclick="window.loaderManager.confirmDelivery('${ad.id}')"><i data-lucide="check-circle" style="width: 24px; height: 24px;"></i> Teslimatı Onayla ve Bitir</button>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button class="btn-outline" style="padding: 12px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.chatManager.toggleChat(true, '${ad.id}', '${ad.acceptedBid?.company || ''}')"><i data-lucide="message-square" style="width: 18px; height: 18px;"></i> Taşıyıcıyla Konuş</button>
                            <button class="btn-outline" style="padding: 12px; font-size: 0.9rem; border-radius: 12px; color: #e74c3c; border-color: #ffdce0; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.loaderManager.reportIssue('${ad.id}')"><i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i> Sorun Bildir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const mainContent = `
    <div class="container dashboard-wrapper">
        <!-- Header -->
        <div class="dashboard-header">
            <div class="dashboard-title">
                <h1>Customer Dashboard</h1>
                <p>Sevkiyatlarınızı izleyin, teklifleri yönetin ve operasyonunuzu hızlandırın.</p>
            </div>
            <div class="dashboard-user-info">
                <div class="dashboard-user-label">Hoş Geldiniz</div>
                <div class="dashboard-user-name">${state.currentUser}</div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="dashboard-stats">
            <div class="stat-card primary">
                <div class="stat-card-icon"><i data-lucide="clipboard-list"></i></div>
                <div>
                    <div class="stat-card-number">${openAds.length}</div>
                    <div class="stat-card-label">Aktif İlan</div>
                </div>
            </div>
            <div class="stat-card accent">
                <div class="stat-card-icon"><i data-lucide="banknote"></i></div>
                <div>
                    <div class="stat-card-number">${totalBids}</div>
                    <div class="stat-card-label">Bekleyen Teklif</div>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-card-icon"><i data-lucide="rocket"></i></div>
                <div>
                    <div class="stat-card-number">${activeShipments.length}</div>
                    <div class="stat-card-label">Yoldaki Yükler</div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="dashboard-tabs">
            <button class="tab-btn ${activeTab === 'open-ads' ? 'active' : ''}" onclick="window.loaderManager.switchTab('open-ads')">
                Active Requests
            </button>
            <button class="tab-btn ${activeTab === 'active-shipments' ? 'active' : ''}" onclick="window.loaderManager.switchTab('active-shipments')">
                Ongoing
            </button>
            <button class="tab-btn ${activeTab === 'completed-shipments' ? 'active' : ''}" onclick="window.loaderManager.switchTab('completed-shipments')">
                History
            </button>
        </div>

        <!-- Tab Content -->
        ${tabContent}
    </div>`;

    return `
        ${overlayHTML}
        ${mainContent}
    `;
};
