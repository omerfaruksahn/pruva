/**
 * PRUVA — Pricing AI Aksiyon Merkezi View & Controller
 * 
 * Bekleyen AI aksiyonlarının incelendiği, onaylandığı veya reddedildiği,
 * son gelen RFQ'ların izlendiği premium arayüz modülü.
 */

// Mock veriler tamamen kaldırılmıştır. Artık boş state kullanılacak.

// View Helper Fonksiyonları
function getTransportModeIcon(mode) {
    switch (mode) {
        case 'DENIZ_FCL': return '🚢';
        case 'DENIZ_LCL': return '📦';
        case 'HAVA': return '✈️';
        case 'KARA': return '🚛';
        default: return '✉️';
    }
}

function getTransportModeText(mode) {
    switch (mode) {
        case 'DENIZ_FCL': return 'Deniz FCL';
        case 'DENIZ_LCL': return 'Deniz LCL';
        case 'HAVA': return 'Hava';
        case 'KARA': return 'Kara';
        default: return 'Diğer';
    }
}

function getActionTypeText(type) {
    switch (type) {
        case 'SEND_RATE_REQUEST': return 'Fiyat Talep Et';
        case 'SEND_MISSING_INFO': return 'Eksik Bilgi İste';
        case 'SEND_OFFER': return 'Teklif Gönder';
        default: return 'İşlem Yap';
    }
}

function getActionTypeClass(type) {
    switch (type) {
        case 'SEND_RATE_REQUEST': return 'rate-request';
        case 'SEND_MISSING_INFO': return 'missing-info';
        case 'SEND_OFFER': return 'send-offer';
        default: return '';
    }
}

function getStatusBadgeText(status) {
    switch (status) {
        case 'PENDING': return 'Beklemede';
        case 'MISSING_INFO_SENT': return 'Eksik Bilgi İstendi';
        case 'RATES_REQUESTED': return 'Sorgulandı';
        case 'OFFER_SENT': return 'Teklif Gönderildi';
        case 'COMPLETED': return 'Tamamlandı';
        case 'CANCELLED': return 'Reddedildi';
        default: return status;
    }
}

function getStatusBadgeClass(status) {
    return status ? status.toLowerCase() : '';
}

// ─────────────────────────────────────────────
// VIEW FUNCTION
// ─────────────────────────────────────────────
window.pricingActionsView = (state) => {
    if (!state.pricingActions) {
        state.pricingActions = [];
    }
    if (!state.pricingRFQs) {
        state.pricingRFQs = [];
    }

    const pendingActions = state.pricingActions.filter(a => a.status === 'PENDING');
    const missingInfoRFQs = state.pricingRFQs.filter(r => r.status === 'MISSING_INFO_SENT');

    // Özet Sayıları hesapla
    const pendingCount = pendingActions.length;
    const missingCount = missingInfoRFQs.length;
    const weeklyIncomingCount = state.pricingRFQs.length;
    const weeklySentOffers = state.pricingRFQs.filter(r => r.status === 'OFFER_SENT' || r.status === 'COMPLETED').length;

    return `
    <div class="pricing-actions-page-container">
        
        <!-- ÜST AÇIKLAMA / HERO KARTI -->
        <div class="pruva-ai-hero-header">
            <div class="hero-left-meta">
                <div class="hero-badge">
                    <span class="pulse-green-dot"></span>
                    Pricing AI Aksiyon Merkezi
                </div>
                <h2>Yapay Zeka Destekli Aksiyon Merkezi</h2>
                <p>Outlook üzerinden taranan ve Claude AI ile analiz edilen e-postaların önerilen aksiyonlarını inceleyin, onaylayın ve yönetin.</p>
            </div>
            <div class="hero-right-visual">
                <div class="ai-bot-avatar">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>
                </div>
            </div>
        </div>

        <!-- ÜST ÖZET KARTLARI -->
        <div class="actions-summary-grid">
            <div class="summary-card yellow">
                <div class="summary-card-icon">⚡</div>
                <div class="summary-card-details">
                    <span class="summary-card-value" id="badge-pending-count">${pendingCount}</span>
                    <span class="summary-card-label">Bekleyen Aksiyon</span>
                </div>
            </div>
            <div class="summary-card red">
                <div class="summary-card-icon">⚠️</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${missingCount}</span>
                    <span class="summary-card-label">Eksik Bilgi Bekleyen</span>
                </div>
            </div>
            <div class="summary-card blue">
                <div class="summary-card-icon">📥</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${weeklyIncomingCount}</span>
                    <span class="summary-card-label">Bu Hafta Gelen RFQ</span>
                </div>
            </div>
            <div class="summary-card green">
                <div class="summary-card-icon">✉️</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${weeklySentOffers}</span>
                    <span class="summary-card-label">Gönderilen Teklif</span>
                </div>
            </div>
        </div>

        <!-- ORTA KISIM: BEKLEYEN AKSİYONLAR LİSTESİ -->
        <div class="pending-actions-section">
            <div class="section-header-actions">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                    Önerilen Yapay Zeka Aksiyonları
                </h3>
                <span class="badge" style="background-color: var(--primary); color: white; font-weight: 700; font-size: 0.72rem; padding: 4px 10px; border-radius: var(--radius-full);">${pendingCount} Bekleyen</span>
            </div>

            <div class="pending-actions-list" style="margin-top: 14px;">
                ${pendingCount === 0 ? `
                    <div class="actions-empty-state">
                        <div class="actions-empty-state-icon">🎉</div>
                        <h4>Tebrikler, Bekleyen Aksiyon Yok!</h4>
                        <p>Yapay zeka tüm e-postaları başarıyla işledi ve önerilecek yeni bir aksiyon bulunmuyor.</p>
                    </div>
                ` : pendingActions.map(action => `
                    <div class="action-item-card" data-action-id="${action.id}">
                        <div class="action-mode-badge" title="${getTransportModeText(action.transport_mode)}">
                            ${getTransportModeIcon(action.transport_mode)}
                        </div>
                        <div class="action-meta-content">
                            <div class="action-top-row">
                                <span class="action-company-name">${action.from}</span>
                                <span class="action-route-badge">${action.route}</span>
                                <span class="action-type-badge ${getActionTypeClass(action.type)}">${getActionTypeText(action.type)}</span>
                            </div>
                            <div class="action-subject-preview">${action.subject}</div>
                            <div class="action-body-snippet">${action.preview}</div>
                        </div>
                        <div class="action-card-buttons">
                            <button class="btn btn-action-red" onclick="window.pricingActionsViewInit.rejectAction(${action.id})">Reddet</button>
                            <button class="btn btn-action-green" onclick="window.pricingActionsViewInit.openReviewModal(${action.id})">İncele ve Onayla</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- ALT KISIM: SON RFQ'LAR TABLOSU -->
        <div class="rfqs-table-card">
            <div class="section-header-actions" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 8px;">
                <h3 style="font-size: 1rem;">Son Talepler ve Fiyatlandırma Durumu</h3>
            </div>
            <div class="rfqs-table-wrapper">
                <table class="rfqs-custom-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Gönderen Firma</th>
                            <th>Güzergah</th>
                            <th>Mod</th>
                            <th>Durum</th>
                            <th>Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.pricingRFQs.slice().reverse().map(rfq => `
                            <tr>
                                <td>${rfq.date || new Date().toLocaleDateString('tr-TR')}</td>
                                <td style="font-weight: 700;">${rfq.company || rfq.sender_name}</td>
                                <td>${rfq.route || (rfq.pol + ' → ' + rfq.pod)}</td>
                                <td>${rfq.mode || getTransportModeText(rfq.transport_mode)}</td>
                                <td>
                                    <span class="status-badge ${getStatusBadgeClass(rfq.status)}">
                                        ${getStatusBadgeText(rfq.status)}
                                    </span>
                                </td>
                                <td>
                                    ${(rfq.status === 'COMPLETED' || rfq.status === 'CANCELLED' || rfq.status === 'REJECTED') ? `
                                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.72rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: rgba(255,255,255,0.02); cursor: pointer;" onclick="window.pricingActionsViewInit.openLostModal('${rfq.id}')">Neden Kaybettik?</button>
                                    ` : `
                                        <span style="color: var(--text-muted); font-size: 0.7rem;">Gerekli değil</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- AKSİYON İNCELEME & ONAYLAMA MODALI -->
        <div class="actions-modal-overlay" id="review-action-modal">
            <div class="actions-modal-box">
                <div class="actions-modal-header">
                    <h3 id="modal-action-title">Aksiyon İncele</h3>
                    <button class="actions-modal-close-btn" onclick="window.pricingActionsViewInit.closeModal()">&times;</button>
                </div>
                <div class="actions-modal-body">
                    
                    <input type="hidden" id="modal-action-id">

                    <!-- Kime Gönderilecek (Sadece SEND_RATE_REQUEST ise gösterilir) -->
                    <div id="modal-carriers-container" class="input-group">
                        <span class="actions-modal-label">İletişime Geçilecek Taşıyıcılar / Acenteler</span>
                        <div class="carriers-checkbox-list" id="modal-carriers-list">
                            <!-- Dinamik olarak dolacak -->
                        </div>
                    </div>

                    <!-- Konu Satırı -->
                    <div class="input-group">
                        <label class="actions-modal-label" for="modal-mail-subject">E-posta Konu Satırı</label>
                        <input type="text" class="actions-modal-input" id="modal-mail-subject">
                    </div>

                    <!-- Mail İçeriği -->
                    <div class="input-group">
                        <label class="actions-modal-label" for="modal-mail-body">E-posta İçeriği</label>
                        <textarea class="actions-modal-textarea" id="modal-mail-body"></textarea>
                    </div>

                </div>
                <div class="actions-modal-footer">
                    <button class="btn btn-secondary" onclick="window.pricingActionsViewInit.closeModal()">İptal</button>
                    <button class="btn btn-primary" style="background-color: #10b981; border-color: #10b981;" onclick="window.pricingActionsViewInit.approveAction()">Onayla ve Gönder</button>
                </div>
            </div>
        </div>

        <!-- KAYBEDİLEN TEKLİF ANALİZ MODALI -->
        <div class="actions-modal-overlay" id="lost-deal-modal">
            <div class="actions-modal-box" style="max-width: 520px;">
                <div class="actions-modal-header">
                    <h3>💔 Kaybedilen Teklif Analizi</h3>
                    <button class="actions-modal-close-btn" onclick="window.pricingActionsViewInit.closeLostModal()">&times;</button>
                </div>
                <div class="actions-modal-body">
                    <input type="hidden" id="modal-lost-rfq-id">
                    
                    <div class="input-group">
                        <label class="actions-modal-label" for="modal-lost-price">Rakip Fiyatı (USD)</label>
                        <input type="number" class="actions-modal-input" id="modal-lost-price" placeholder="Örn: 1750" step="0.01">
                    </div>

                    <div class="input-group">
                        <label class="actions-modal-label" for="modal-lost-reason">Kaybetme Nedeni</label>
                        <textarea class="actions-modal-textarea" id="modal-lost-reason" placeholder="Neden bu teklifi kaybettik? Rakip avantajı, fiyat farkı, transit süre vb." rows="4"></textarea>
                    </div>
                </div>
                <div class="actions-modal-footer">
                    <button class="btn btn-secondary" onclick="window.pricingActionsViewInit.closeLostModal()">İptal</button>
                    <button class="btn btn-primary" style="background-color: #ef4444; border-color: #ef4444;" onclick="window.pricingActionsViewInit.submitLostDeal()">Analizi Kaydet</button>
                </div>
            </div>
        </div>

    </div>
    `;
};

// ─────────────────────────────────────────────
// VIEW CONTROLLER & EVENT LISTENERS
// ─────────────────────────────────────────────
window.pricingActionsViewInit = async (app) => {
    console.log('[VIEW INIT] Pricing Actions Center Loaded.');

    // Helper: Toast uyarısı göster
    const showToast = (message, type = 'success') => {
        if (window.notificationManager && typeof window.notificationManager.showToast === 'function') {
            window.notificationManager.showToast(message, type);
        } else {
            alert(message);
        }
    };

    // 1. Sayfa açılınca API'den bekleyen aksiyonları ve RFQ'ları çek
    const now = Date.now();
    const lastFetch = app.state._pricingActionsLastFetched || 0;
    
    // Eğer son 3 saniye içinde çekildiyse tekrar çekme (sonsuz döngüyü önler)
    if (now - lastFetch >= 3000) {
        app.state._pricingActionsLastFetched = now;
        
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            console.log('[PRICING ACTIONS] Fetching actions and RFQs from API...');
            
            const [actionsRes, rfqsRes] = await Promise.all([
                fetch('/api/pricing/actions', { headers }),
                fetch('/api/pricing/rfqs', { headers })
            ]);

            let dataUpdated = false;

            if (actionsRes.ok) {
                const apiActions = await actionsRes.json();
                app.state.pricingActions = apiActions;
                dataUpdated = true;
            }

            if (rfqsRes.ok) {
                const apiRFQs = await rfqsRes.json();
                app.state.pricingRFQs = apiRFQs;
                dataUpdated = true;
            }

            if (dataUpdated) {
                console.log('[PRICING ACTIONS] Actions and RFQs successfully updated from backend API.');
                app.commit();
            }
        } catch (err) {
            console.warn('[PRICING ACTIONS] API\'den veriler çekilemedi, local/mock veri devrede:', err.message);
        }
    } else {
        console.log('[PRICING ACTIONS] Skip fetching to avoid render loop.');
    }

    // Controller metodlarını globale ekle
    window.pricingActionsViewInit.rejectAction = async (actionId) => {
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`/api/pricing/actions/${actionId}/reject`, {
                method: 'POST',
                headers
            });

            if (res.ok) {
                // Local state güncelle
                const actionIdx = app.state.pricingActions.findIndex(a => a.id === actionId);
                if (actionIdx !== -1) {
                    const action = app.state.pricingActions[actionIdx];
                    action.status = 'CANCELLED';

                    const rfqIdx = app.state.pricingRFQs.findIndex(r => r.id === action.rfq_id);
                    if (rfqIdx !== -1) {
                        app.state.pricingRFQs[rfqIdx].status = 'CANCELLED';
                    }
                }
                showToast('Aksiyon reddedildi ve arşivlendi.', 'warning');
                
                // Yeniden yüklemeyi tetiklemek için son çekim zamanını sıfırla
                app.state._pricingActionsLastFetched = 0;
                app.commit();
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.error('[PRICING ACTIONS] API Error:', err);
            showToast('Aksiyon reddedilemedi, sunucu hatası.', 'danger');
        }
    };

    window.pricingActionsViewInit.openReviewModal = (actionId) => {
        const action = app.state.pricingActions.find(a => a.id === actionId);
        if (!action) return;

        const modal = document.getElementById('review-action-modal');
        const modalIdInput = document.getElementById('modal-action-id');
        const modalTitle = document.getElementById('modal-action-title');
        const modalSubject = document.getElementById('modal-mail-subject');
        const modalBody = document.getElementById('modal-mail-body');
        const carriersContainer = document.getElementById('modal-carriers-container');
        const carriersList = document.getElementById('modal-carriers-list');

        if (!modal) return;

        // Modal alanlarını doldur
        modalIdInput.value = action.id;
        modalTitle.textContent = getActionTypeText(action.type);
        modalSubject.value = action.subject;
        modalBody.value = action.body;

        // Taşıyıcı listesini göster/gizle
        if (action.type === 'SEND_RATE_REQUEST' && action.carriers && action.carriers.length > 0) {
            carriersContainer.style.display = 'block';
            carriersList.innerHTML = action.carriers.map(carrier => `
                <label class="carrier-check-item">
                    <input type="checkbox" name="modal-carrier-checkbox" value="${carrier}" checked>
                    <span>${carrier}</span>
                </label>
            `).join('');
        } else {
            carriersContainer.style.display = 'none';
            carriersList.innerHTML = '';
        }

        // Modalı göster
        modal.classList.add('show');
    };

    window.pricingActionsViewInit.closeModal = () => {
        const modal = document.getElementById('review-action-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    };

    window.pricingActionsViewInit.approveAction = async () => {
        const actionId = parseInt(document.getElementById('modal-action-id').value);
        const subject = document.getElementById('modal-mail-subject').value;
        const body = document.getElementById('modal-mail-body').value;
        const actionIdx = app.state.pricingActions.findIndex(a => a.id === actionId);

        if (actionIdx === -1) return;

        const action = app.state.pricingActions[actionIdx];

        // Seçilen taşıyıcıları al
        const selectedCarriers = [];
        if (action.type === 'SEND_RATE_REQUEST') {
            const checkboxes = document.querySelectorAll('input[name="modal-carrier-checkbox"]:checked');
            checkboxes.forEach(cb => selectedCarriers.push(cb.value));
        }

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`/api/pricing/actions/${actionId}/approve`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    edited_subject: subject,
                    edited_body: body,
                    selected_carriers: selectedCarriers
                })
            });

            if (res.ok) {
                window.pricingActionsViewInit.closeModal();
                showToast('E-posta başarıyla gönderildi ve aksiyon onaylandı!');
                
                // Yeniden yüklemeyi tetiklemek için son çekim zamanını sıfırla
                app.state._pricingActionsLastFetched = 0;
                
                // Yerel state durumunu da güncelle
                action.status = 'COMPLETED';
                const rfqIdx = app.state.pricingRFQs.findIndex(r => r.id === action.rfq_id);
                if (rfqIdx !== -1) {
                    const rfq = app.state.pricingRFQs[rfqIdx];
                    if (action.type === 'SEND_RATE_REQUEST') {
                        rfq.status = 'RATES_REQUESTED';
                    } else if (action.type === 'SEND_MISSING_INFO') {
                        rfq.status = 'MISSING_INFO_SENT';
                    } else if (action.type === 'SEND_OFFER') {
                        rfq.status = 'OFFER_SENT';
                    }
                }
                
                app.commit();
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.error('[PRICING ACTIONS] Approve API Error:', err);
            window.pricingActionsViewInit.closeModal();
            showToast('E-posta onaylanamadı, sunucu hatası.', 'danger');
        }
    };
 
    window.pricingActionsViewInit.openLostModal = (rfqId) => {
        const modal = document.getElementById('lost-deal-modal');
        const idInput = document.getElementById('modal-lost-rfq-id');
        const priceInput = document.getElementById('modal-lost-price');
        const reasonInput = document.getElementById('modal-lost-reason');
 
        if (!modal || !idInput) return;
        
        idInput.value = rfqId;
        if (priceInput) priceInput.value = '';
        if (reasonInput) reasonInput.value = '';
 
        const rfq = app.state.pricingRFQs.find(r => r.id === rfqId);
        if (rfq) {
            if (priceInput && rfq.competitor_price) priceInput.value = rfq.competitor_price;
            if (reasonInput && rfq.lost_reason) reasonInput.value = rfq.lost_reason;
        }
 
        modal.classList.add('show');
    };
 
    window.pricingActionsViewInit.closeLostModal = () => {
        const modal = document.getElementById('lost-deal-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    };
 
    window.pricingActionsViewInit.submitLostDeal = async () => {
        const rfqId = parseInt(document.getElementById('modal-lost-rfq-id').value);
        const competitorPrice = parseFloat(document.getElementById('modal-lost-price').value) || 0;
        const lostReason = document.getElementById('modal-lost-reason').value.trim();
 
        if (!lostReason) {
            showToast('Lütfen kaybetme nedenini belirtin.', 'warning');
            return;
        }
 
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const res = await fetch(`/api/pricing/rfqs/${rfqId}/lost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lost_reason: lostReason,
                    competitor_price: competitorPrice
                })
            });
 
            if (res.ok) {
                const rfqIdx = app.state.pricingRFQs.findIndex(r => r.id === rfqId);
                if (rfqIdx !== -1) {
                    app.state.pricingRFQs[rfqIdx].lost_reason = lostReason;
                    app.state.pricingRFQs[rfqIdx].competitor_price = competitorPrice;
                    app.state.pricingRFQs[rfqIdx].status = 'CANCELLED';
                }
                
                window.pricingActionsViewInit.closeLostModal();
                showToast('Kaybedilen teklif analizi başarıyla kaydedildi!', 'success');
                app.commit();
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.error('[PRICING ACTIONS] Lost deal save API Error:', err);
            window.pricingActionsViewInit.closeLostModal();
            showToast('Analiz kaydedilemedi, sunucu hatası.', 'danger');
        }
    };
};
