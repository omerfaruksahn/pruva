window.CarrierManager = class CarrierManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.tabKey = 'carrierActiveTab';
    }

    async withdrawBid(adId) {
        if (!confirm('Teklifinizi geri çekmek istediğinize emin misiniz?')) return;
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (ad) {
            const newBids = ad.bids.filter(b => b.company !== this.app.state.currentUser);
            try {
                await this.app.store.updateAd(adId, { bids: newBids });
            } catch (error) {
                if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız.', 'error');
                return;
            }
            if (window.notificationManager) window.notificationManager.showToast('Teklif geri çekildi.', 'info');
        }
    }

    async withdrawFromShipment(adId) {
        if (!confirm('DİKKAT: İşi iptal etmek profilinizden -0.2 ceza puanı düşülmesine sebep olacaktır. Devam etmek istiyor musunuz?')) return;
        
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
                comment: 'Sistem Notu: Taşıyıcı seferden çekildiği için ceza uygulandı.'
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
            text: 'Taşıyıcı seferden çekildi. İlan tekrar pazar yerine açıldı.',
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast('İş iptal edildi ve ceza puanı yansıtıldı.', 'warning');
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'error',
                    text: `🚨 Taşıyıcı İptali: ${carrierName} seferden çekildi. İlanınız tekrar pazara açıldı.`,
                    subtext: `İlan: ${ad.origin} → ${ad.destination}`,
                    date: Date.now(),
                    read: false,
                    targetUser: ad.owner,
                    view: 'loader-dashboard'
                });
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız.', 'error');
        }
    }

    async archiveShipment(adId) {
        if (!confirm('Bu ilanı arşive kaldırmak istediğinize emin misiniz?')) return;
        
        const updates = { status: 'archived' };
        try {
            await this.app.store.updateAd(adId, updates);
            if (window.notificationManager) {
                window.notificationManager.showToast('İlan başarıyla arşivlendi.', 'success');
            }
            this.app.router.render();
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız.', 'error');
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
                if (window.notificationManager) window.notificationManager.showToast('UYARI: Ara statüleri atladınız. Ceza puanı yansıtılacaktır!', 'alert');
            } else if (!hasLoaded || !hasTransit) {
                if (window.notificationManager) window.notificationManager.showToast('DİKKAT: Bazı ara statüleri atladınız.', 'alert');
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
            if (formData.plate) detailStrings.push(`Plaka: ${formData.plate}`);
            if (formData.driverName) detailStrings.push(`Şoför: ${formData.driverName}`);
            if (formData.driverPhone) detailStrings.push(`Tel: ${formData.driverPhone}`);
            if (formData.containerNo) detailStrings.push(`Konteyner: ${formData.containerNo}`);
            if (formData.carrierLine) detailStrings.push(`Armatör: ${formData.carrierLine}`);
            if (formData.flightNo) detailStrings.push(`Uçuş No: ${formData.flightNo}`);
            if (formData.airlineCompany) detailStrings.push(`Havayolu: ${formData.airlineCompany}`);
            if (formData.customsName) detailStrings.push(`Gümrük/Sınır: ${formData.customsName}`);
            if (formData.declarationNo) detailStrings.push(`Beyanname/AWB: ${formData.declarationNo}`);
            if (formData.location) detailStrings.push(`Konum: ${formData.location}`);
            if (formData.statusNote) detailStrings.push(`Açıklama: ${formData.statusNote}`);
            if (formData.receiverName) detailStrings.push(`Teslim Alan: ${formData.receiverName}`);
            if (formData.deliveryNote) detailStrings.push(`Teslim Notu: ${formData.deliveryNote}`);
            
            if (detailStrings.length > 0) {
                timelineItem.text += ` - ${detailStrings.join(' | ')}`;
            }
        }

        newTimeline.unshift(timelineItem);
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('Güncelleme başarısız.', 'error');
            return;
        }

        if (window.notificationManager) {
            window.notificationManager.showToast('Statü başarıyla güncellendi.', 'success');
            window.notificationManager.add({
                id: Date.now(),
                type: 'info',
                text: `🚚 Yükünüzün durumu güncellendi: [${newStatusText}]`,
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
            text: 'TEST: Liman / Gümrük Bölgesine Giriş Yapıldı (10 Gün Önceye Simüle Edildi)',
            date: new Date(tenDaysAgo).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = cleanedTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast('✅ Liman girişi 10 gün öncesine başarıyla simüle edildi. Demoraj başladı!', 'success');
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('Simülasyon başarısız.', 'error');
        }
    }

    showDelayModal(adId) {
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) return;

        const modalHTML = `
            <div id="delay-modal" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; animation: fadeIn 0.3s ease;">
                <div class="modal-content" style="background: var(--bg-page); border-radius: 20px; width: 90%; max-width: 450px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    <h3 style="margin-top: 0; color: var(--primary); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="alert-triangle" style="color: #e74c3c;"></i> Gecikme Bildirimi
                    </h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Planlanan teslimat tarihini ertelemek üzeresiniz. Sadece <strong>1 kez</strong> erteleme hakkınız bulunmaktadır. Maksimum 30 gün uzatabilirsiniz. Daha uzun süreler için support@pruvahub.com ile iletişime geçin.
                    </p>
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; display: block;">Yeni Tahmini Teslim Tarihi</label>
                        <input type="date" id="delay-date-input" class="form-control" style="width: 100%; padding: 12px; border: 1.5px solid var(--border-dim); border-radius: 8px;" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button type="button" class="btn-outline" style="padding: 12px; border-radius: 10px; font-weight: 600;" onclick="document.getElementById('delay-modal').remove()">Vazgeç</button>
                        <button type="button" class="btn-primary" style="padding: 12px; border-radius: 10px; font-weight: 600; background: #e74c3c; color: white; border: none;" onclick="window.carrierManager.submitDelay('${ad.id}')">Tarihi Güncelle</button>
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
            if (window.notificationManager) window.notificationManager.showToast('Lütfen geçerli bir tarih seçin.', 'error');
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
            text: `Teslimat tarihi güncellendi: ${newDate.toLocaleDateString('tr-TR')}`,
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            document.getElementById('delay-modal').remove();
            
            if (window.notificationManager) {
                window.notificationManager.showToast('Teslimat tarihi başarıyla güncellendi.', 'success');
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'warning',
                    text: `⚠️ Teslimat Gecikmesi: ${ad.acceptedBid?.company} teslimat tarihini güncelledi.`,
                    subtext: `Yeni Tarih: ${newDate.toLocaleDateString('tr-TR')} • İlan: ${ad.origin} → ${ad.destination}`,
                    date: Date.now(),
                    read: false,
                    targetUser: ad.owner,
                    view: 'loader-dashboard'
                });
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız.', 'error');
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
            window.notificationManager.showToast(`Test Modu: Plan ${planName} olarak değiştirildi.`, 'info');
        }
    }
};
