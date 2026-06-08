window.ReferenceManager = class ReferenceManager {
    constructor(appInstance) {
        this.app = appInstance;
        this._pendingRefDoc = null;
    }

    handleDocUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert(window.i18n.t('comp.reference.file_size_error'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this._pendingRefDoc = e.target.result;
            const preview = document.getElementById('ref-doc-preview');
            const placeholder = document.getElementById('ref-doc-placeholder');
            const uploadArea = document.getElementById('ref-doc-upload');
            
            if (preview && placeholder) {
                placeholder.style.display = 'none';
                preview.style.display = 'block';
                
                if (file.type.startsWith('image/')) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" style="max-height: 120px; border-radius: 8px; margin-bottom: 8px;">
                        <p style="font-size: 0.75rem; color: var(--success); margin: 0;">✅ ${file.name} ${window.i18n.t('comp.reference.file_uploaded')}</p>
                    `;
                } else {
                    preview.innerHTML = `
                        <div style="font-size: 2rem; margin-bottom: 8px;">📄</div>
                        <p style="font-size: 0.75rem; color: var(--success); margin: 0;">✅ ${file.name} ${window.i18n.t('comp.reference.file_uploaded')}</p>
                    `;
                }
                
                if (uploadArea) {
                    uploadArea.style.borderColor = 'var(--success)';
                    uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
                }
            }
        };
        reader.readAsDataURL(file);
    }

    submitReference() {
        const company   = document.getElementById('ref-company')?.value?.trim();
        const sector    = document.getElementById('ref-sector')?.value;
        const duration  = document.getElementById('ref-duration')?.value;
        const transport = document.getElementById('ref-transport')?.value;

        if (!company || !sector || !duration || !transport || !this._pendingRefDoc) {
            window.notificationManager?.showToast(window.i18n.t('comp.reference.fill_all_fields'), 'warning');
            return;
        }

        const user = window.app.store.getCurrentUser();
        if (!user) return;
        if (!user.references) user.references = [];

        if (user.references.find(r => r.companyName.toLowerCase() === company.toLowerCase() && r.status !== 'rejected')) {
            window.notificationManager?.showToast(`${company} ${window.i18n.t('comp.reference.reference_exists')}`, 'warning');
            return;
        }

        const newRef = {
            id: Date.now(),
            companyName: company,
            sector, duration,
            transportType: transport,
            documentUrl: this._pendingRefDoc,
            status: 'pending',
            submittedAt: new Date().toISOString().split('T')[0]
        };

        user.references.push(newRef);
        this._pendingRefDoc = null;

        // Firestore'a yaz
        const uid = window.app.state.currentUserUid;
        if (uid) {
            import('../services/firestoreService.js').then(({ FirestoreService }) => {
                FirestoreService.updateUser(uid, { references: user.references }).catch(console.warn);
            });
        }

        this.app.store.save();
        this.app.router.render();
        window.notificationManager?.showToast(window.i18n.t('comp.reference.sent_for_approval'), 'match');
        window.notificationManager?.add({
            id: Date.now(), type: 'info',
            text: `${this.app.state.currentUser} ${window.i18n.t('comp.reference.new_reference_added')} ${company}.`,
            date: Date.now(), read: false, targetRole: 'admin', view: 'admin-dashboard'
        });
    }

    removeReference(refId) {
        if (!confirm(window.i18n.t('comp.reference.confirm_remove'))) return;
        const user = window.app.store.getCurrentUser();
        if (!user?.references) return;
        user.references = user.references.filter(r => r.id != refId);
        const uid = window.app.state.currentUserUid;
        if (uid) {
            import('../services/firestoreService.js').then(({ FirestoreService }) => {
                FirestoreService.updateUser(uid, { references: user.references }).catch(console.warn);
            });
        }
        this.app.store.save();
        this.app.router.render();
        window.notificationManager?.showToast(window.i18n.t('comp.reference.reference_removed'), 'info');
    }

    approveReference(userId, refId) {
        const user = this.app.state.users.find(u => u.id == userId);
        const ref = user?.references?.find(r => r.id == refId);
        if (ref) {
            ref.status = 'verified';
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast(`✅ ${ref.companyName} ${window.i18n.t('comp.reference.approved')}`, 'success');
                window.notificationManager.add({
                    id: Date.now(), type: 'success', text: `✅ ${window.i18n.t('comp.reference.reference_approved')} ${ref.companyName}`,
                    date: Date.now(), read: false, targetUser: user.name, view: 'carrier-dashboard'
                });
            }
        }
    }

    rejectReference(userId, refId) {
        const user = this.app.state.users.find(u => u.id == userId);
        const ref = user?.references?.find(r => r.id == refId);
        if (ref) {
            ref.status = 'rejected';
            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast(`❌ ${ref.companyName} ${window.i18n.t('comp.reference.rejected')}`, 'info');
            }
        }
    }

    previewRefDoc(userId, refId) {
        if (this.app.state.userRole !== 'admin') {
            alert(window.i18n.t('comp.reference.privacy_policy_admin_only'));
            return;
        }
        const user = this.app.state.users.find(u => u.id == userId);
        const ref = user?.references?.find(r => r.id == refId);
        if (ref?.documentUrl) {
            window.utils.showImageModal(ref.documentUrl, `${ref.companyName} ${window.i18n.t('comp.reference.document')}`);
        }
    }

    showAllReferences(companyName) {
        const carrier = this.app.state.users.find(u => u.name === companyName);
        if (!carrier || !carrier.references) return;

        const verifiedRefs = carrier.references.filter(r => r.status === 'verified');
        
        const modalHtml = `
            <div id="references-modal" class="modal-overlay" style="display: flex;">
                <div class="modal-content" style="max-width: 500px; text-align: left; padding: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px;">${companyName} <span data-i18n="comp.reference.references">Referansları</span></h2>
                        <button onclick="document.getElementById('references-modal').remove()" style="background: var(--bg-page); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); transition: all 0.2s;">&times;</button>
                    </div>
                    
                    <div style="max-height: 450px; overflow-y: auto; padding-right: 5px; margin-right: -5px;" class="custom-scrollbar">
                        ${verifiedRefs.map(ref => `
                            <div style="background: var(--bg-page); padding: 18px; border-radius: 16px; margin-bottom: 15px; border: 1px solid var(--border-dim); transition: all 0.3s ease;" onmouseover="this.style.borderColor='var(--secondary)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border-dim)'; this.style.transform='translateY(0)'">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <div style="font-weight: 800; color: var(--primary); font-size: 1rem; margin-bottom: 4px; letter-spacing: -0.3px;">${ref.companyName}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                                            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${ref.sector}</span>
                                            <span style="color: #cbd5e1;">•</span>
                                            <span>${ref.transportType === 'sea' ? window.i18n.t('comp.reference.sea') : ref.transportType === 'land' ? window.i18n.t('comp.reference.land') : window.i18n.t('comp.reference.air')}</span>
                                        </div>
                                    </div>
                                    <div style="font-size: 0.65rem; color: #27ae60; font-weight: 700; display: flex; align-items: center; gap: 4px; background: #e6ffec; padding: 4px 10px; border-radius: 20px; border: 1px solid #b7eb8f;">
                                        <i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> <span data-i18n="comp.reference.verified">DOĞRULANDI</span>
                                    </div>
                                </div>
                                <div style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed var(--border-dim); display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted);">
                                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                        <span data-i18n="comp.reference.duration">Süre:</span> <strong>${ref.duration}</strong>
                                    </div>
                                    ${this.app.state.userRole === 'admin' ? `
                                        <button onclick="window.referenceManager.previewRefDoc('${carrier.id}', '${ref.id}')" class="btn-outline" style="padding: 5px 12px; font-size: 0.7rem; border-radius: 8px; background: white;" data-i18n="comp.reference.review_doc_admin">
                                            Belgeyi İncele (Admin)
                                        </button>
                                    ` : `
                                        <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; opacity: 0.8;">
                                            <i data-lucide="lock" style="width: 12px; height: 12px;"></i>
                                            <span data-i18n="comp.reference.privacy_protected">Gizlilik Korumalı</span>
                                        </div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        if (container) {
            container.innerHTML = modalHtml;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    async submitReview(adId, targetName, scores, comment) {
        const ad = this.app.state.ads.find(a => String(a.id) === String(adId));
        if (ad) {
            // Review'ı ad.reviews objesine kaydet (kullanıcı bazlı)
            if (!ad.reviews) ad.reviews = {};
            ad.reviews[this.app.state.currentUser] = {
                target: targetName,
                scores: scores,
                comment: comment || '',
                date: new Date().toISOString(),
                reviewerRole: this.app.state.userRole
            };

            // Eğer her iki taraf da değerlendirdiyse 'reviewed' yap
            const reviewCount = Object.keys(ad.reviews).length;
            const newStatus = reviewCount >= 2 ? 'reviewed' : ad.status;

            try {
                await this.app.store.updateAd(adId, {
                    reviews: ad.reviews,
                    status: newStatus
                });
            } catch (error) {
                console.error('[ReferenceManager] submitReview failed:', error);
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('comp.reference.review_save_error'), 'error');
                }
                return;
            }

            this.app.store.save();
            this.app.router.render();
            if (window.notificationManager) {
                window.notificationManager.showToast(`⭐ ${window.i18n.t('comp.reference.review_saved')}`, 'success');
                // Karşı tarafa bildirim gönder
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'info',
                    text: `⭐ ${this.app.state.currentUser} ${window.i18n.t('comp.reference.you_were_reviewed')} ${ad.origin} → ${ad.destination}`,
                    date: Date.now(),
                    read: false,
                    targetUser: targetName
                });
            }
        }
    }
};
