window.MarketplaceManager = class MarketplaceManager {
    constructor(appInstance) {
        this.app = appInstance;
    }

    toggleMobileFilterPanel() {
        const filterBar = document.querySelector('.market-filter-bar');
        if (filterBar) {
            filterBar.classList.toggle('active');
        }
    }

    toggleAd(id) {
        this.app.state.expandedAdId = this.app.state.expandedAdId === id ? null : id;
        this.app.router.render();
    }

    focusOnAd(id) {
        // Clear filters first so the ad is definitely in the list
        this.app.state.filters = { origin: '', destination: '', transport: '', cargoType: '', adId: '' };
        
        // Find all ads that would be shown in marketplace (not accepted)
        const allMarketAds = this.app.state.ads.filter(ad => ad.status !== 'accepted');
        const adIndex = allMarketAds.findIndex(ad => String(ad.id) === String(id));
        
        if (adIndex !== -1) {
            const page = Math.floor(adIndex / 20) + 1;
            this.app.state.marketplacePage = page;
            this.app.state.expandedAdId = id;
        } else {
            // If ad is not found in "not accepted" ads, maybe it's already accepted?
            // Still set expandedAdId just in case
            this.app.state.expandedAdId = id;
        }
        
        this.app.router.navigate('marketplace');
        
        // Scroll to the ad after a short delay to allow rendering
        setTimeout(() => {
            const element = document.getElementById(`ad-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: add a temporary highlight effect
                element.style.ring = '2px solid var(--secondary)';
                element.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
                setTimeout(() => {
                    element.style.ring = '';
                    element.style.boxShadow = '';
                }, 2000);
            }
        }, 300);
    }

    showAdDetails(adId) {
        this.app.state.expandedAdId = adId;
        this.app.router.render();
        
        if (this.app.state.userRole === 'carrier') {
            const carrierData = this.app.store.getCurrentUser() || this.app.state.users.find(u => u.name === this.app.state.currentUser);
            if (carrierData && carrierData.bannedUntil && carrierData.bannedUntil > Date.now()) {
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('market.err_banned_bid'), 'error');
                }
                return;
            }

            if (this.app.state.subscriptionType !== 'premium') {
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('market.err_premium_required'), 'warning');
                }
                this.app.router.navigate('membership');
            } else {
                this.toggleBidModal(true, adId);
            }
        }
    }

    toggleBidModal(show, adId = null) {
        const modal = document.getElementById('bid-modal');
        if (show && adId) {
            const container = document.getElementById('modal-container');
            if (container && window.bidModalComponent) {
                container.innerHTML = window.bidModalComponent(this.app.state, adId);
                const newModal = document.getElementById('bid-modal');
                if (newModal) newModal.style.display = 'flex';
            }
        } else if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }

    async handleBid(event) {
        if (event) event.preventDefault();
        
        const adIdInput = document.getElementById('bid-ad-id');
        const priceInput = document.getElementById('bid-price');
        const currencyInput = document.getElementById('bid-currency');
        const lineInput = document.getElementById('bid-line');
        const transitInput = document.getElementById('bid-transit-time');
        const freeTimeInput = document.getElementById('bid-free-time');
        const routeTypeInput = document.getElementById('bid-route-type');
        const validityInput = document.getElementById('bid-validity');

        if (!adIdInput || !priceInput) return;

        const adId = adIdInput.value;
        const price = priceInput.value;
        const currency = currencyInput.value;
        const line = lineInput.value;
        const transitTime = transitInput.value;
        const freeTime = freeTimeInput ? freeTimeInput.value : '7';
        const routeType = routeTypeInput ? routeTypeInput.value : 'Direkt';
        const validity = validityInput ? validityInput.value : '3 Gün';
        
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        
        if (ad) {
            const currentUser = this.app.state.currentUser || "Pruva Test";
            const carrierData = this.app.store.getCurrentUser();
            let isGhost = false;

            if (carrierData && carrierData.performance) {
                const score = (carrierData.performance.overallRating || 0) * 20;
                if (score < 20) {
                    isGhost = true;
                } else if (score < 50) {
                    if (window.notificationManager) {
                        window.notificationManager.showToast(window.i18n.t('market.warn_low_quality'), 'alert');
                    }
                }
            }

            ad.status = 'bidded';
            if (!ad.bids) ad.bids = [];
            
            ad.bids.push({ 
                company: currentUser,
                carrierId: this.app.state.currentUserUid,
                price: `${price}${currency}`, 
                line: line,
                time: `${transitTime} Gün`,
                freeTime: `${freeTime} Gün`,
                routeType: routeType,
                validity: validity,
                date: new Date().toLocaleDateString(),
                isGhost: isGhost
            });
            
            try {
                await this.app.store.updateAd(ad.id, {
                    status: 'bidded',
                    bids: ad.bids
                });
            } catch (error) {
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('market.err_bid_save'), 'error');
                }
                return;
            }
            
            this.toggleBidModal(false);
            this.app.router.render();
            
            if (window.notificationManager) {
                // Taşıyıcı her halükarda başarı mesajı alır (Shadowban dahil)
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'match',
                    text: `✅ ${ad.origin} → ${ad.destination} ${window.i18n.t('market.notif_bid_success')}`,
                    targetUser: currentUser
                });
                
                // Yük verene sadece hayalet olmayan (isGhost: false) tekliflerin bildirimi gider
                if (!isGhost) {
                    window.notificationManager.add({
                        id: Date.now() + 1,
                        type: 'match',
                        text: `💰 ${window.i18n.t('market.notif_new_bid')}: ${price}${currency}`,
                        targetUser: ad.owner,
                        view: 'loader-dashboard',
                        action: 'viewBids',
                        adId: ad.id
                    });

                    // Send email notification secure call
                    try {
                        let token = '';
                        if (window.auth && auth.currentUser) token = await auth.currentUser.getIdToken();
                        else if (window.firebase && firebase.auth().currentUser) token = await firebase.auth().currentUser.getIdToken();
                        
                        fetch('http://localhost:5000/api/user-actions/send-email-on-bid', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token ? 'Bearer ' + token : ''
                            },
                            body: JSON.stringify({
                                adId: ad.id,
                                price: price,
                                carrierName: currentUser
                            })
                        }).then(res => res.json())
                          .then(data => console.log('[EMAIL] Notification response:', data))
                          .catch(err => console.warn('[EMAIL] Notification failed:', err.message));
                    } catch(e) {
                        console.warn('Token alınamadığı için mail gönderilemedi', e);
                    }
                }
            }
        }
    }

    applyMarketFilters() {
        this.app.state.filters.origin = document.getElementById('market-origin-input')?.value || '';
        this.app.state.filters.destination = document.getElementById('market-dest-input')?.value || '';
        this.app.state.filters.adId = document.getElementById('market-id-input')?.value || '';
        this.app.state.marketplacePage = 1;
        this.app.store.save();
        this.app.router.render();
    }

    clearFilters() {
        this.app.state.filters = { origin: '', destination: '', transport: '', cargoType: '', adId: '' };
        this.app.state.marketplacePage = 1;
        this.app.store.save();
        this.app.router.render();
    }

    goToPage(page) {
        const totalAds = this.app.state.ads.filter(ad => ad.status !== 'accepted').length;
        const totalPages = Math.max(1, Math.ceil(totalAds / 20));
        const safePage = Math.max(1, Math.min(page, totalPages));
        this.app.state.marketplacePage = safePage;
        this.app.store.save();
        this.app.router.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleFilter(category, value) {
        if (this.app.state.filters[category] === value) {
            this.app.state.filters[category] = ''; 
        } else {
            this.app.state.filters[category] = value;
        }
        this.app.state.filters.origin = document.getElementById('market-origin-input')?.value || '';
        this.app.state.filters.destination = document.getElementById('market-dest-input')?.value || '';
        this.app.state.filters.adId = document.getElementById('market-id-input')?.value || '';
        this.app.router.render();
    }

    filterMarketplace(criteria) {
        this.app.state.filters = { ...this.app.state.filters, ...criteria };
        if (this.app.state.currentView !== 'marketplace') {
            this.app.router.navigate('marketplace');
        } else {
            this.app.router.render();
        }
    }

    shareAd(id) {
        const adNumber = window.utils.formatAdNumber(id);
        const shareUrl = `${window.location.origin}${window.location.pathname}#ad-${id}`;
        
        const shareData = {
            title: `Pruva Lojistik İlanı: ${adNumber}`,
            text: `Pruva üzerindeki bu lojistik ilanına göz atın: ${adNumber}`,
            url: shareUrl
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData)
                .catch((err) => console.log('Share failed', err));
        } else {
            // Fallback: Copy to clipboard
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                if (window.notificationManager) {
                    window.notificationManager.add({
                        id: Date.now(),
                        type: 'info',
                        text: window.i18n.t('market.notif_link_copied'),
                        targetUser: this.app.state.currentUser
                    });
                }
            } catch (err) {
                console.error('Copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    }

    reportAd(adId) {
        const user = this.app.store.getCurrentUser();
        const perf = user ? user.performance : null;
        const rating = perf ? perf.overallRating : 0;
        const completedJobs = perf ? perf.completedJobs : 0;

        // Carrier Quality Gate check
        if (rating < 4.0 && completedJobs < 3) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('market.err_report_low_score'), 'warning');
            }
            return;
        }

        const ad = this.app.store.findAd(adId);
        if (!ad) return;

        // Check if already reported
        ad.reports = ad.reports || [];
        if (ad.reports.some(r => r.by === this.app.state.currentUser)) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('market.err_already_reported'), 'warning');
            }
            return;
        }

        const modalHtml = `
            <div id="report-ad-modal" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; animation: fadeIn 0.3s ease;" onclick="if(event.target === this) this.remove()">
                <div class="modal-content" style="background: var(--bg-page); border-radius: 20px; width: 90%; max-width: 500px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.3rem; color: #e74c3c; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="alert-triangle" style="width: 22px; height: 22px; color: #e74c3c;"></i> <span data-i18n="comp.marketplace.report_ad">İlanı Şikayet Et</span>
                            </h2>
                            <p style="margin: 5px 0 0; font-size: 0.85rem; color: var(--text-secondary);" data-i18n="comp.marketplace.report_desc">Güvenli lojistik için şikayet nedeninizi seçin</p>
                        </div>
                        <button onclick="document.getElementById('report-ad-modal').remove()" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 8px;" data-i18n="comp.marketplace.report_reason">Şikayet Nedeni *</label>
                        <select id="report-reason" class="form-control" style="width: 100%; padding: 12px; border: 1.5px solid var(--border-dim); border-radius: 8px;" onchange="document.getElementById('report-desc-container').style.display = this.value === 'other' ? 'block' : 'none'">
                            <option value="spam" data-i18n="comp.marketplace.reason_spam">Sahte İlan / Spam</option>
                            <option value="misleading" data-i18n="comp.marketplace.reason_misleading">Yanıltıcı Bilgi (Farklı Yük/Tarih)</option>
                            <option value="price" data-i18n="comp.marketplace.reason_price">Telefonda/Mesajda Fiyat Değiştirme</option>
                            <option value="abuse" data-i18n="comp.marketplace.reason_abuse">Küfür / Uygunsuz İletişim</option>
                            <option value="other" data-i18n="comp.marketplace.reason_other">Diğer (Açıklama Zorunlu)</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="report-desc-container" style="margin-bottom: 15px; display: none;">
                        <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 8px;" data-i18n="comp.marketplace.description">Açıklama *</label>
                        <textarea id="report-description" class="form-control" rows="3" placeholder="Lütfen şikayetinizi detaylandırın..." data-i18n="[placeholder]comp.marketplace.desc_placeholder" style="width: 100%; padding: 12px; border: 1.5px solid var(--border-dim); border-radius: 8px;"></textarea>
                    </div>
                    
                    <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 0.8rem; color: #d46b08; display: flex; align-items: flex-start; gap: 8px;">
                        <i data-lucide="alert-circle" style="width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; color: #d46b08;"></i>
                        <span data-i18n="comp.marketplace.warning_rule"><strong>⚠️ Yalancı Çoban Kuralı:</strong> Asılsız/kötü niyetli raporlama yaptığı tespit edilen taşıyıcılara <strong>-0.2 puan</strong> ceza uygulanır.</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button class="btn-outline" style="padding: 12px; border-radius: 10px; font-weight: 600;" onclick="document.getElementById('report-ad-modal').remove()" data-i18n="comp.marketplace.cancel">Vazgeç</button>
                        <button class="btn-primary" style="padding: 12px; border-radius: 10px; font-weight: 600; background: #e74c3c; border: none; color: white;" onclick="window.marketplaceManager.submitAdReport('${adId}')" data-i18n="comp.marketplace.submit_report">Şikayeti İlet</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();
    }

    async submitAdReport(adId) {
        const ad = this.app.store.findAd(adId);
        if (!ad) return;

        const reasonSelect = document.getElementById('report-reason');
        const descTextarea = document.getElementById('report-description');

        const reason = reasonSelect ? reasonSelect.value : 'spam';
        const description = descTextarea ? descTextarea.value.trim() : '';

        if (reason === 'other' && !description) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('market.err_report_reason_missing'), 'warning');
            }
            return;
        }

        const currentUser = this.app.state.currentUser;
        ad.reports = ad.reports || [];
        ad.reports.push({
            by: currentUser,
            reason: reason,
            desc: description,
            date: Date.now()
        });

        // Check if loader is verified
        const loader = this.app.state.users.find(u => u.name === ad.owner);
        const isLoaderVerified = loader ? loader.is_verified : false;

        document.getElementById('report-ad-modal')?.remove();

        try {
            if (isLoaderVerified) {
                // Verified loaders do not get hidden automatically, just raise admin review warning
                await this.app.store.updateAd(adId, { reports: ad.reports });
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('market.report_success'), 'success');
                    // Notification to admin
                    window.notificationManager.add({
                        id: Date.now(),
                        type: 'warning',
                        text: `⚠️ ${window.i18n.t('market.report_notice')}: ${ad.owner} ${window.i18n.t('market.report_notice_suffix')}`,
                        subtext: `${window.i18n.t('market.ad_no')}: ${window.utils.formatAdNumber(adId)} | ${window.i18n.t('market.reporter')}: ${currentUser} | ${window.i18n.t('market.reason')}: ${reason}`,
                        date: Date.now(),
                        read: false,
                        targetRole: 'admin',
                        view: 'admin-dashboard'
                    });
                }
            } else {
                // Unverified loader
                if (ad.reports.length >= 3) {
                    // Auto-hide ad
                    await this.app.store.updateAd(adId, { reports: ad.reports, status: 'spam_hidden' });
                    if (window.notificationManager) {
                        window.notificationManager.showToast(window.i18n.t('market.report_removed'), 'info');
                        // Notification to admin
                        window.notificationManager.add({
                            id: Date.now(),
                            type: 'error',
                            text: `🚨 ${window.i18n.t('market.ad_removed')}: ${window.i18n.t('market.ad_no')} #${window.utils.formatAdNumber(adId)} ${window.i18n.t('market.ad_hidden')}`,
                            subtext: `${window.i18n.t('market.reason_3_reports')}. ${window.i18n.t('market.last_reporter')}: ${currentUser}`,
                            date: Date.now(),
                            read: false,
                            targetRole: 'admin',
                            view: 'admin-dashboard'
                        });
                    }
                } else {
                    await this.app.store.updateAd(adId, { reports: ad.reports });
                    if (window.notificationManager) {
                        window.notificationManager.showToast(window.i18n.t('market.report_success'), 'success');
                    }
                }
            }

            this.app.store.save();
            this.app.router.render();
        } catch (error) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('market.report_failed') + ': ' + error.message, 'error');
            }
        }
    }
};
