window.CarrierManager = class CarrierManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.tabKey = 'carrierActiveTab';
    }

    async withdrawBid(adId) {
        if (!confirm(window.i18n.t('comp.carrier.confirm_withdraw_bid'))) return;
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (ad) {
            const newBids = ad.bids.filter(b => b.company !== this.app.state.currentUser);
            try {
                await this.app.store.updateAd(adId, { bids: newBids });
            } catch (error) {
                if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
                return;
            }
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.bid_withdrawn'), 'info');
        }
    }

    async withdrawFromShipment(adId) {
        if (!confirm(window.i18n.t('comp.carrier.confirm_withdraw_shipment'))) return;
        
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) return;

        const carrierName = ad.acceptedBid?.company || this.app.state.currentUser;
        const carrier = this.app.state.users.find(u => u.name === carrierName);
        
        // 1. Ceza Uygula
        if (carrier && carrier.performance) {
            carrier.performance.overallRating = parseFloat((Math.max(1, carrier.performance.overallRating - 0.2)).toFixed(1));
            if (!carrier.performance.lastReviews) carrier.performance.lastReviews = [];
            carrier.performance.lastReviews.unshift({
                reviewerRole: 'system',
                date: Date.now(),
                origin: ad.origin,
                destination: ad.destination,
                scores: { cat1: 0, cat2: 0, cat3: 0 },
                comment: window.i18n.t('comp.carrier.system_note_penalty')
            });
        }

        // 2. İlanı Geri Aç
        const newBids = (ad.bids || []).map(b => b.company === carrierName ? { ...b, isGhost: true } : b);
        const updates = {
            status: 'open',
            acceptedBid: null,
            estimatedDeliveryDate: null,
            bids: newBids
        };

        const newTimeline = [...(ad.operationTimeline || [])];
        newTimeline.unshift({
            type: 'error',
            text: window.i18n.t('comp.carrier.timeline_carrier_withdrawn'),
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('comp.carrier.job_cancelled_penalty'), 'warning');
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'error',
                    text: window.i18n.t('comp.carrier.notif_carrier_cancelled').replace('{carrier}', carrierName),
                    subtext: window.i18n.t('comp.carrier.notif_ad_route').replace('{origin}', ad.origin).replace('{dest}', ad.destination),
                    date: Date.now(),
                    read: false,
                    targetUser: ad.owner,
                    view: 'loader-dashboard'
                });
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
        }
    }

    async archiveShipment(adId) {
        if (!confirm(window.i18n.t('comp.carrier.confirm_archive'))) return;
        
        const updates = { status: 'archived' };
        try {
            await this.app.store.updateAd(adId, updates);
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('comp.carrier.ad_archived'), 'success');
            }
            this.app.router.render();
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
        }
    }

    async updateOperationStatus(adId, newStatusText, formData = {}) {
        if (!this.app || !this.app.state) return;
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad || !ad.operationTimeline) return;

        // Penalty Check
        if (newStatusText === 'Teslim Edildi') {
            const hasLoaded = ad.operationTimeline.some(t => t.text.includes('Yüklendi'));
            const hasTransit = ad.operationTimeline.some(t => t.text.includes('Yolda') || t.text.includes('Sınır') || t.text.includes('Gümrük'));
            
            if (!hasLoaded && !hasTransit) {
                if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.warn_skipped_status_penalty'), 'alert');
            } else if (!hasLoaded || !hasTransit) {
                if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.warn_skipped_status'), 'alert');
            }
        }

        const updates = {};
        if (newStatusText === 'Teslim Edildi') {
            updates.status = 'delivered';
        }

        if (newStatusText === 'Liman / Gümrük Bölgesinde' || newStatusText === 'Sınır Kapısında') {
            updates.portArrivalDate = Date.now();
            updates.notifiedFreeTimeUrgent = false;
            updates.notifiedFreeTimeExpired = false;
        }

        const newTimeline = [...ad.operationTimeline];
        const timelineItem = {
            type: newStatusText === 'Teslim Edildi' ? 'success' : 'info',
            text: newStatusText,
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        };

        if (formData && Object.keys(formData).length > 0) {
            timelineItem.details = formData;
            let detailStrings = [];
            if (formData.plate) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_plate')}: ${formData.plate}`);
            if (formData.driverName) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_driver')}: ${formData.driverName}`);
            if (formData.driverPhone) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_phone')}: ${formData.driverPhone}`);
            if (formData.containerNo) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_container')}: ${formData.containerNo}`);
            if (formData.carrierLine) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_carrier_line')}: ${formData.carrierLine}`);
            if (formData.flightNo) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_flight')}: ${formData.flightNo}`);
            if (formData.airlineCompany) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_airline')}: ${formData.airlineCompany}`);
            if (formData.customsName) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_customs')}: ${formData.customsName}`);
            if (formData.declarationNo) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_declaration')}: ${formData.declarationNo}`);
            if (formData.location) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_location')}: ${formData.location}`);
            if (formData.statusNote) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_note')}: ${formData.statusNote}`);
            if (formData.receiverName) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_receiver')}: ${formData.receiverName}`);
            if (formData.deliveryNote) detailStrings.push(`${window.i18n.t('comp.carrier.timeline_delivery_note')}: ${formData.deliveryNote}`);
            
            if (detailStrings.length > 0) {
                timelineItem.text += ` - ${detailStrings.join(' | ')}`;
            }
        }

        newTimeline.unshift(timelineItem);
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
            return;
        }

        if (window.notificationManager) {
            window.notificationManager.showToast(window.i18n.t('comp.carrier.status_updated'), 'success');
            window.notificationManager.add({
                id: Date.now(),
                type: 'info',
                text: window.i18n.t('comp.carrier.notif_status_updated').replace('{status}', newStatusText),
                date: Date.now(),
                read: false,
                targetUser: ad.owner,
                view: 'loader-dashboard'
            });
        }
    }

    async simulatePortArrival(adId) {
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) return;

        // Simulate port arrival 10 days ago so they can immediately see demurrage accumulation!
        const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
        
        const updates = {
            portArrivalDate: tenDaysAgo,
            notifiedFreeTimeUrgent: true,
            notifiedFreeTimeExpired: true
        };

        const newTimeline = [...(ad.operationTimeline || [])];
        // Clean existing test timeline item if exists
        const cleanedTimeline = newTimeline.filter(t => !t.text.includes('TEST:'));
        cleanedTimeline.unshift({
            type: 'warning',
            text: window.i18n.t('comp.carrier.sim_port_arrival'),
            date: new Date(tenDaysAgo).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = cleanedTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('comp.carrier.sim_success'), 'success');
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
        }
    }

    showDelayModal(adId) {
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) return;

        const modalHTML = `
            <div id="delay-modal" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; animation: fadeIn 0.3s ease;">
                <div class="modal-content" style="background: var(--bg-page); border-radius: 20px; width: 90%; max-width: 450px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    <h3 style="margin-top: 0; color: var(--primary); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="alert-triangle" style="color: #e74c3c;"></i> <span data-i18n="comp.carrier.modal_delay_title">Gecikme Bildirimi</span>
                    </h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;" data-i18n="comp.carrier.modal_delay_desc">
                        Planlanan teslimat tarihini ertelemek üzeresiniz. Sadece <strong>1 kez</strong> erteleme hakkınız bulunmaktadır. Maksimum 30 gün uzatabilirsiniz. Daha uzun süreler için support@pruvahub.com ile iletişime geçin.
                    </p>
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; display: block;" data-i18n="comp.carrier.modal_delay_date_lbl">Yeni Tahmini Teslim Tarihi</label>
                        <input type="date" id="delay-date-input" class="form-control" style="width: 100%; padding: 12px; border: 1.5px solid var(--border-dim); border-radius: 8px;" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button type="button" class="btn-outline" style="padding: 12px; border-radius: 10px; font-weight: 600;" onclick="document.getElementById('delay-modal').remove()" data-i18n="comp.carrier.modal_cancel">Vazgeç</button>
                        <button type="button" class="btn-primary" style="padding: 12px; border-radius: 10px; font-weight: 600; background: #e74c3c; color: white; border: none;" onclick="window.carrierManager.submitDelay('${ad.id}')" data-i18n="comp.carrier.modal_update">Tarihi Güncelle</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Set min/max dates
        const dateInput = document.getElementById('delay-date-input');
        if (dateInput) {
            const today = new Date();
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 30);
            
            dateInput.min = today.toISOString().split('T')[0];
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
        
        if (window.lucide) window.lucide.createIcons();
    }

    async submitDelay(adId) {
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) return;

        const dateInput = document.getElementById('delay-date-input');
        if (!dateInput || !dateInput.value) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.select_valid_date'), 'error');
            return;
        }

        const newDate = new Date(dateInput.value);
        const updates = {
            estimatedDeliveryDate: newDate.getTime(),
            delayCount: (ad.delayCount || 0) + 1,
            notifiedOverdue: false // reset notification flag so they can get warned again for the new date
        };

        const newTimeline = [...(ad.operationTimeline || [])];
        newTimeline.unshift({
            type: 'warning',
            text: window.i18n.t('comp.carrier.delivery_date_updated').replace('{date}', newDate.toLocaleDateString('tr-TR')),
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            document.getElementById('delay-modal').remove();
            
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('comp.carrier.delivery_date_success'), 'success');
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'warning',
                    text: window.i18n.t('comp.carrier.notif_delay').replace('{company}', ad.acceptedBid?.company),
                    subtext: window.i18n.t('comp.carrier.notif_delay_sub').replace('{date}', newDate.toLocaleDateString('tr-TR')).replace('{origin}', ad.origin).replace('{dest}', ad.destination),
                    date: Date.now(),
                    read: false,
                    targetUser: ad.owner,
                    view: 'loader-dashboard'
                });
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('comp.carrier.operation_failed'), 'error');
        }
    }

    switchTab(tabName) {
        this.app.state[this.tabKey] = tabName;
        this.app.commit();
    }

    toggleSubscription() {
        console.log('[TEST] toggleSubscription called. Current state:', this.app.state.subscriptionType);
        const current = this.app.state.subscriptionType;
        // Test amaçlı: Premium ve Standart (none) arasında geçiş
        if (current === 'premium') {
            this.app.state.subscriptionType = 'none';
            this.app.state.subscriptionExpiresAt = null;
        } else {
            this.app.state.subscriptionType = 'premium';
            // 30 gün sonrası için bitiş tarihi
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            this.app.state.subscriptionExpiresAt = expiry.toISOString();
        }
        
        this.app.store.save();
        this.app.router.render();
        this.app.router.updateNav(); // Header'daki rozeti de güncelle
        
        if (window.notificationManager) {
            const planName = this.app.state.subscriptionType === 'premium' ? 'Premium' : 'Standart';
            window.notificationManager.showToast(window.i18n.t('comp.carrier.test_plan_switched').replace('{plan}', planName), 'info');
        }
    }
};
