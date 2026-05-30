window.LoaderManager = class LoaderManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.tabKey = 'loaderActiveTab';
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

    async cancelAcceptedShipment(adId) {
        if (!confirm('DİKKAT: Kabul edilmiş bir sevkiyatı iptal etmek, taşıyıcı firma mağdur olacağı için profilinizden -0.3 ceza puanı düşülmesine sebep olacaktır. Devam etmek istiyor musunuz?')) return;
        
        const ad = this.app.store.findAd(adId);
        if (!ad) return;

        const loaderName = ad.owner;
        const loader = this.app.state.users.find(u => u.name === loaderName);

        // 1. Ceza Uygula
        if (loader) {
            loader.performance = loader.performance || {
                overallRating: 5.0,
                completedJobs: 0,
                communication: 5.0,
                delivery: 5.0,
                documentation: 5.0,
                lastReviews: []
            };
            loader.performance.overallRating = parseFloat((Math.max(1.0, loader.performance.overallRating - 0.3)).toFixed(1));
            if (!loader.performance.lastReviews) loader.performance.lastReviews = [];
            loader.performance.lastReviews.unshift({
                reviewerRole: 'system',
                date: Date.now(),
                origin: ad.origin,
                destination: ad.destination,
                scores: { cat1: 0, cat2: 0, cat3: 0 },
                comment: 'Sistem Notu: Kabul edilmiş sevkiyatı tek taraflı iptal ettiği için ceza uygulandı.'
            });
            await this.app.store.updateUser(loaderName, { performance: loader.performance });
        }

        // 2. İlanı İptal Et
        const updates = {
            status: 'cancelled',
            cancelledBy: 'loader',
            cancelledAt: Date.now()
        };

        const newTimeline = [...(ad.operationTimeline || [])];
        newTimeline.unshift({
            type: 'error',
            text: 'Sevkiyat Yükveren tarafından tek taraflı İptal Edildi.',
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast('Sevkiyat iptal edildi ve ceza puanı yansıtıldı.', 'warning');
                
                // Taşıyıcıya bildirim gönder
                if (ad.acceptedBid && ad.acceptedBid.company) {
                    window.notificationManager.add({
                        id: Date.now(),
                        type: 'error',
                        text: `🚨 Sevkiyat İptal Edildi: Yükveren ${loaderName}, sevkiyatı tek taraflı iptal etti!`,
                        subtext: `İlan: ${ad.origin} → ${ad.destination} | Yük sahibine ceza puanı uygulandı.`,
                        date: Date.now(),
                        read: false,
                        targetUser: ad.acceptedBid.company,
                        view: 'carrier-dashboard'
                    });
                }
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İptal işlemi başarısız: ' + error.message, 'error');
        }
    }

    async acceptBid(adId, bidIndex) {
        const ad = this.app.store.findAd(adId);
        if (!ad || !ad.bids) return;

        const visibleBids = ad.bids.filter(b => !b.isGhost);
        const selectedBid = visibleBids[bidIndex];
        
        if (!selectedBid) {
            if (window.notificationManager) window.notificationManager.showToast('Teklif bulunamadı.', 'error');
            return;
        }

        const modalHtml = `
            <div id="accept-bid-modal" class="modal-overlay" style="display: flex;" onclick="if(event.target === this) this.remove()">
                <div class="modal-content" style="max-width: 450px;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 1.3rem; color: var(--primary);">Teklifi Onayla</h2>
                        <button onclick="document.getElementById('accept-bid-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <p style="margin-bottom: 15px; font-size: 0.9rem; color: var(--text-secondary);">
                        <strong>${selectedBid.company}</strong> firmasının teklifini onaylıyorsunuz. Eğer taşıyıcı ile mesajlarda farklı bir fiyatta anlaştıysanız, lütfen aşağıya anlaşılan son tutarı girin. (Örn: $2400)
                    </p>
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Anlaşılan Tutar</label>
                        <input type="text" id="agreed-price-input" class="form-control" value="${selectedBid.price}" style="margin-top: 5px; font-size: 1.1rem; font-weight: 700; color: var(--primary);">
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button class="btn-outline" style="flex: 1; padding: 12px;" onclick="document.getElementById('accept-bid-modal').remove()">Vazgeç</button>
                        <button class="btn-primary" style="flex: 2; padding: 12px;" onclick="window.loaderManager.confirmAcceptBid('${adId}', ${bidIndex})">Teklifi Onayla</button>
                    </div>
                </div>
            </div>
        `;
        const container = document.getElementById('modal-container');
        if (container) {
            container.innerHTML += modalHtml;
        }
    }

    async confirmAcceptBid(adId, bidIndex) {
        const ad = this.app.store.findAd(adId);
        if (!ad || !ad.bids) return;

        const visibleBids = ad.bids.filter(b => !b.isGhost);
        const selectedBid = visibleBids[bidIndex];

        const agreedPriceInput = document.getElementById('agreed-price-input');
        if (agreedPriceInput && agreedPriceInput.value.trim() !== '') {
            selectedBid.price = agreedPriceInput.value.trim();
        }

        const modal = document.getElementById('accept-bid-modal');
        if (modal) modal.remove();

        const transitTimeStr = selectedBid.time || '15';
        const match = transitTimeStr.match(/\\d+/);
        const daysToDeliver = match ? parseInt(match[0]) : 15;
        const edd = new Date();
        edd.setDate(edd.getDate() + daysToDeliver);

        const updates = {
            status: 'accepted',
            acceptedBid: selectedBid,
            estimatedDeliveryDate: edd.getTime(),
            delayCount: 0,
            operationTimeline: [
                { type: 'info', text: 'Operasyon Başladı. Taşıyıcı yola çıkmaya hazır.', date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }
            ]
        };
        
        try {
            await this.app.store.updateAd(adId, updates);
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız: ' + error.message, 'error');
            return;
        }

        this.app.state.loaderActiveTab = 'active-shipments';
        this.app.store.save();
        this.app.router.render();
        if (window.notificationManager) {
            window.notificationManager.showToast('✅ Teklif Onaylandı! Sevkiyat Başladı.', 'success');
            window.notificationManager.add({
                id: Date.now(),
                type: 'success',
                text: `🚚 Sevkiyat Başladı: ${ad.origin} → ${ad.destination}`,
                subtext: `Taşıyıcı: ${selectedBid.company} | Ücret: ${selectedBid.price}`,
                date: Date.now(),
                read: false,
                targetRole: 'admin',
                view: 'admin-dashboard'
            });
            // Taşıyıcıya bildirim
            window.notificationManager.add({
                id: Date.now() + 1,
                type: 'success',
                text: `🎉 Teklifiniz kabul edildi! ${ad.origin} → ${ad.destination}`,
                subtext: `Yükleyici: ${ad.owner} | Ücret: ${selectedBid.price}`,
                date: Date.now(),
                read: false,
                targetUser: selectedBid.company,
                view: 'carrier-dashboard'
            });
        }
    }

    async cancelAd(adId) {
        if (!confirm('Bu ilanı yayından kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        
        try {
            await this.app.store.removeAd(adId);
            this.app.router.render();
            if (window.notificationManager) window.notificationManager.showToast('🗑️ İlan Yayından Kaldırıldı.', 'info');
        } catch (error) {
            console.error('[LoaderManager] cancelAd failed:', error);
            if (window.notificationManager) window.notificationManager.showToast('İlan kaldırılamadı: ' + error.message, 'error');
        }
    }

    async confirmDelivery(adId) {
        const ad = this.app.store.findAd(adId);
        if (ad) {
            const newTimeline = [...(ad.operationTimeline || [])];
            newTimeline.unshift({
                type: 'success',
                text: 'Teslimat Alıcı Tarafından Onaylandı',
                date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            });

            try {
                await this.app.store.updateAd(adId, {
                    status: 'completed',
                    operationTimeline: newTimeline
                });
            } catch (error) {
                if (window.notificationManager) window.notificationManager.showToast('Onay işlemi başarısız.', 'error');
                return;
            }
            
            this.app.store.save();
            this.app.router.render();
            
            if (window.notificationManager) {
                window.notificationManager.showToast('✅ Teslimat onaylandı. İşlem tamamlandı.', 'success');
                
                // Taşıyıcıya bildirim
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'success',
                    text: `✅ Teslimatınız onaylandı! Artık karşı tarafı değerlendirebilirsiniz: ${ad.origin} ➔ ${ad.destination}`,
                    date: Date.now(),
                    read: false,
                    targetUser: ad.acceptedBid.company,
                    view: 'carrier-dashboard'
                });

                // Admin'e bildirim
                window.notificationManager.add({
                    id: Date.now() + 1,
                    type: 'success',
                    text: `🏁 İşlem Tamamlandı: ${ad.origin} → ${ad.destination}`,
                    subtext: `Yükleyici: ${ad.owner} | Taşıyıcı: ${ad.acceptedBid.company}`,
                    date: Date.now(),
                    read: false,
                    targetRole: 'admin',
                    view: 'admin-dashboard'
                });
            }
        }
    }

    async reportIssue(adId) {
        const ad = this.app.store.findAd(adId);
        if (!ad) return;

        // Modal ile sorun bildirme
        const modalHtml = `
            <div id="report-issue-modal" class="modal-overlay" style="display: flex;" onclick="if(event.target === this) this.remove()">
                <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.3rem; color: #e74c3c; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="alert-triangle" style="width: 22px; height: 22px;"></i> Sorun Bildir
                            </h2>
                            <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">${ad.origin} ➔ ${ad.destination}</p>
                        </div>
                        <button onclick="document.getElementById('report-issue-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Sorun Kategorisi</label>
                        <select id="issue-category" class="form-control" style="margin-top: 5px;">
                            <option value="delay">Gecikme / Süre Aşımı</option>
                            <option value="damage">Hasar / Kayıp</option>
                            <option value="communication">İletişim Sorunu</option>
                            <option value="documents">Evrak Eksikliği</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-weight: 600; font-size: 0.85rem;">Detaylı Açıklama</label>
                        <textarea id="issue-description" class="form-control" rows="4" placeholder="Yaşadığınız sorunu detaylı olarak açıklayın..." style="margin-top: 5px;"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button class="btn-outline" style="flex: 1; padding: 12px;" onclick="document.getElementById('report-issue-modal').remove()">Vazgeç</button>
                        <button class="btn-primary" style="flex: 2; padding: 12px; background: #e74c3c;" onclick="window.loaderManager.submitIssueReport(${adId})">Bildirimi Gönder</button>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        if (container) {
            container.innerHTML += modalHtml;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    submitIssueReport(adId) {
        const category = document.getElementById('issue-category')?.value;
        const description = document.getElementById('issue-description')?.value?.trim();
        
        if (!description) {
            if (window.notificationManager) window.notificationManager.showToast('Lütfen sorunu açıklayın.', 'warning');
            return;
        }

        const ad = this.app.store.findAd(adId);
        
        // Admin'e bildirim gönder
        if (window.notificationManager) {
            window.notificationManager.add({
                id: Date.now(),
                type: 'warning',
                text: `⚠️ Sorun Bildirimi: ${ad ? ad.origin + ' → ' + ad.destination : 'İlan #' + adId}`,
                subtext: `Kategori: ${category} | Bildiren: ${this.app.state.currentUser}`,
                date: Date.now(),
                read: false,
                targetRole: 'admin',
                view: 'admin-dashboard'
            });
            window.notificationManager.showToast('✅ Sorun bildiriminiz yönetime iletildi.', 'success');
        }
        
        // Modalı kapat
        const modal = document.getElementById('report-issue-modal');
        if (modal) modal.remove();
    }

    async uploadDocument(adId) {
        const ad = this.app.store.findAd(adId);
        if (!ad) return;

        const modalHtml = `
            <div id="doc-upload-modal" class="modal-overlay" style="display: flex;" onclick="if(event.target === this) this.remove()">
                <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.3rem; color: var(--secondary); display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="file-text" style="width: 22px; height: 22px;"></i> Sevkiyat Evrak Yükleme
                            </h2>
                            <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">${ad.origin} ➔ ${ad.destination}</p>
                        </div>
                        <button onclick="document.getElementById('doc-upload-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Evrak Türü</label>
                        <select id="doc-type-select" class="form-control" style="margin-top: 5px;">
                            <option value="cmr">CMR Belgesi</option>
                            <option value="invoice">Fatura</option>
                            <option value="packing_list">Çeki Listesi</option>
                            <option value="bill_of_lading">Konşimento (B/L)</option>
                            <option value="customs">Gümrük Beyannamesi</option>
                            <option value="insurance">Sigorta Poliçesi</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>
                    
                    <div id="doc-upload-area" style="margin-top: 15px; border: 2px dashed var(--border); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: var(--transition); background: var(--bg-elevated);" onclick="document.getElementById('doc-file-input').click()">
                        <div id="doc-upload-preview" style="display: none;"></div>
                        <div id="doc-upload-placeholder">
                            <div style="font-size: 2rem; margin-bottom: 10px; color: var(--text-muted);"><i data-lucide="file-up" style="width: 48px; height: 48px; margin: 0 auto;"></i></div>
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Dosya yüklemek için tıklayın</p>
                            <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">JPG, PNG veya PDF • Max 10MB</p>
                        </div>
                    </div>
                    <input type="file" id="doc-file-input" accept="image/*,.pdf" style="display: none;" onchange="window.loaderManager.handleDocPreview(event)">
                    
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button class="btn-outline" style="flex: 1; padding: 12px;" onclick="document.getElementById('doc-upload-modal').remove()">Vazgeç</button>
                        <button id="doc-submit-btn" class="btn-primary" style="flex: 2; padding: 12px; background: var(--secondary);" onclick="window.loaderManager.submitDocument(${adId})">Evrakı Yükle</button>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        if (container) {
            container.innerHTML += modalHtml;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    handleDocPreview(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            if (window.notificationManager) window.notificationManager.showToast('Dosya boyutu 10MB\'dan küçük olmalıdır.', 'warning');
            return;
        }

        this._pendingDocFile = file;
        const preview = document.getElementById('doc-upload-preview');
        const placeholder = document.getElementById('doc-upload-placeholder');
        const uploadArea = document.getElementById('doc-upload-area');

        if (preview && placeholder) {
            placeholder.style.display = 'none';
            preview.style.display = 'block';
            preview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                    <div style="font-size: 2rem;">${file.type.startsWith('image/') ? '🖼️' : '📄'}</div>
                    <div style="text-align: left;">
                        <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0;">${file.name}</p>
                        <p style="font-size: 0.7rem; color: #27ae60; margin: 3px 0 0; font-weight: 600;">✅ Dosya hazır</p>
                    </div>
                </div>
            `;
            if (uploadArea) {
                uploadArea.style.borderColor = '#27ae60';
                uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
            }
        }
    }

    async submitDocument(adId) {
        if (!this._pendingDocFile) {
            if (window.notificationManager) window.notificationManager.showToast('Lütfen bir dosya seçin.', 'warning');
            return;
        }

        const docType = document.getElementById('doc-type-select')?.value || 'other';
        const submitBtn = document.getElementById('doc-submit-btn');
        
        if (submitBtn) {
            submitBtn.innerHTML = 'Yükleniyor... <div style="display:inline-block; width:12px; height:12px; border:2px solid white; border-top:2px solid transparent; border-radius:50%; animation:spin 1s linear infinite; margin-left:5px;"></div>';
            submitBtn.disabled = true;
        }

        try {
            const { FirestoreService } = await import('../services/firestoreService.js');
            const url = await FirestoreService.uploadFile(this._pendingDocFile, `shipment_docs/${adId}`);
            
            // İlan'a evrak bilgisini ekle
            const ad = this.app.store.findAd(adId);
            if (ad) {
                const docs = ad.documents || [];
                docs.push({
                    type: docType,
                    url: url,
                    fileName: this._pendingDocFile.name,
                    uploadedAt: Date.now(),
                    uploadedBy: this.app.state.currentUser,
                    uploadedByUid: this.app.state.currentUserUid
                });
                await this.app.store.updateAd(adId, { documents: docs });
            }

            this._pendingDocFile = null;
            const modal = document.getElementById('doc-upload-modal');
            if (modal) modal.remove();

            if (window.notificationManager) {
                window.notificationManager.showToast('✅ Evrak başarıyla yüklendi.', 'success');
            }
        } catch (error) {
            console.error('[LoaderManager] Document upload failed:', error);
            if (window.notificationManager) window.notificationManager.showToast('Evrak yüklenemedi: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Evrakı Yükle';
                submitBtn.disabled = false;
            }
        }
    }

    async reportNoShow(adId) {
        const ad = this.app.store.findAd(adId);
        if (!ad || !ad.acceptedBid) return;

        if (!confirm('Taşıyıcının gelmediğini onaylıyor musunuz? Bu işlem ilanı tekrar tekliflere açacaktır.')) return;

        const updates = {
            acceptedBid: null
        };

        // Mark accepted bid as ghost in bids array
        let remainingBidsCount = 0;
        if (ad.bids) {
            const newBids = [...ad.bids];
            const originalBidIndex = newBids.findIndex(b => b.company === ad.acceptedBid.company && b.price === ad.acceptedBid.price);
            if (originalBidIndex !== -1) {
                newBids[originalBidIndex].isGhost = true;
            }
            updates.bids = newBids;
            remainingBidsCount = newBids.filter(b => !b.isGhost).length;
        }

        updates.status = remainingBidsCount > 0 ? 'bidded' : 'pending';
        
        const newTimeline = [...(ad.operationTimeline || [])];
        newTimeline.unshift({
            type: 'error',
            text: 'Taşıyıcı iptal etti/gelmedi. İlan yeniden tekliflere açıldı.',
            date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
        updates.operationTimeline = newTimeline;

        try {
            await this.app.store.updateAd(adId, updates);
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast('✅ İlan tekrar tekliflere açıldı.', 'success');
            }
        } catch (error) {
            if (window.notificationManager) window.notificationManager.showToast('İşlem başarısız: ' + error.message, 'error');
        }
    }

    switchTab(tabName) {
        this.app.state[this.tabKey] = tabName;
        this.app.commit();
    }
};
