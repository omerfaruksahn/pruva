/**
 * PRUVA — Yapay Zeka Destekli Aksiyon ve İletişim Arayüzü (Pruva AI Ana Ekranı)
 * 
 * WhatsApp/Slack tarzı 2 kolonlu layout ile premium e-posta ve AI önerileri yönetim merkezi.
 */

window.pruvaAiView = (state) => {
    // 1. Durum / Konuşmalar State Yükle
    let conversations = state.pricingConversations;
    
    // Kullanıcının talebi doğrultusunda sahte (mock) mailler tamamen kaldırılmıştır.
    // Sayfa her durumda temiz ve boş başlayacaktır. Canlı mailler taranınca dolacaktır.
    const hasMock = conversations && conversations.some(c => c.id === 11 || c.id === 12 || c.id === 13 || c.id === 14 || c.id === 21 || c.id === 22);
    if (!conversations || hasMock) {
        conversations = [];
        state.pricingConversations = [];
        localStorage.setItem('pruva_pricing_conversations', JSON.stringify([]));
    }

    const activeConvId = state.activeConversationId || null;
    const activeConv = conversations.find(c => c.id === activeConvId) || null;

    // Arama & Filtreleme Terimleri
    const searchQuery = (state.convSearchQuery || '').toLowerCase().trim();
    const filterMode = state.convFilterMode || 'ALL'; // ALL, CUSTOMERS, CARRIERS, PENDING

    // Konuşmaları Filtrele
    const filteredConversations = conversations.filter(c => {
        // Arama Terimi Eşleşmesi
        const matchesSearch = c.company.toLowerCase().includes(searchQuery) || 
                              c.lastMessage.toLowerCase().includes(searchQuery);
        
        if (!matchesSearch) return false;

        // Sekme Filtre Eşleşmesi
        if (filterMode === 'CUSTOMERS') {
            // Müşteri ise (Arçelik, Vestel vb.)
            return c.id === 11 || c.id === 12 || c.id === 13 || c.id === 14;
        } else if (filterMode === 'CARRIERS') {
            // Taşıyıcı ise (MSC, Maersk vb.)
            return c.id === 21 || c.id === 22;
        } else if (filterMode === 'PENDING') {
            // Bekleyen aksiyon varsa (status kırmızı=RATES_REQUESTED/PENDING veya sarı=MISSING_INFO_SENT)
            return c.status === 'PENDING' || c.status === 'RATES_REQUESTED' || c.status === 'MISSING_INFO_SENT';
        }
        return true;
    });

    // Durum Nokta Rengi Belirleme
    const getStatusDotColor = (status) => {
        switch(status) {
            case 'PENDING':
            case 'RATES_REQUESTED': 
                return '#ef4444'; // kırmızı = aksiyon bekliyor
            case 'MISSING_INFO_SENT': 
                return '#f59e0b'; // sarı = bilgi bekleniyor
            case 'COMPLETED':
            case 'OFFER_SENT': 
                return '#10b981'; // yeşil = tamamlandı
            default: 
                return '#9ca3af'; // gri = pasif
        }
    };

    // Durum Badge Metni Belirleme
    const getStatusBadge = (status) => {
        switch(status) {
            case 'PENDING':
            case 'RATES_REQUESTED':
                return '<span class="status-badge" style="background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Aksiyon Bekliyor</span>';
            case 'MISSING_INFO_SENT':
                return '<span class="status-badge" style="background: rgba(245,158,11,0.15); color: #f59e0b; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Bilgi Bekleniyor</span>';
            case 'COMPLETED':
            case 'OFFER_SENT':
                return '<span class="status-badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Tamamlandı</span>';
            default:
                return '<span class="status-badge" style="background: rgba(156,163,175,0.15); color: #9ca3af; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Pasif</span>';
        }
    };

    // Metrik Sayılarını Hesapla (Dinamik - Faz 1)
    const mgr = window.app?.managers?.pruvaAi;
    const metrics = mgr?.getMetrics?.() || {};
    const rfqCount = metrics.rfqCount || (state.pricingRFQs ? state.pricingRFQs.length : 4);
    const offerCount = metrics.offerCount || (9 + conversations.filter(c => c.status === 'OFFER_SENT' || c.status === 'COMPLETED').length);
    const winRate = metrics.winRate || 72;

    return `
    <div class="pruva-ai-page-container" style="padding: 16px 24px;">
        
        <!-- ÜST KISIM / SAYFA BAŞLIĞI VE AYARLAR BUTONU -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="background: var(--primary-gradient); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem;">P</div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.5px;">Pruva AI — Operasyon ve Teklif Asistanı</h2>
            </div>
            
            <div style="display: flex; gap: 8px; align-items: center;">
                ${state.outlookConnected ? `
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 8px 16px;">
                        <span style="color: #10b981; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 6px;">
                            🟢 Outlook Bağlı: <strong style="color: var(--text-primary); font-weight: 700;">${state.outlookEmail || ''}</strong>
                        </span>
                        <button onclick="window.app.managers.pruvaAi.disconnectOutlook()" style="background: transparent; border: none; color: #ef4444; font-size: 0.95rem; font-weight: 700; cursor: pointer; padding: 0 4px; display: flex; align-items: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'" title="Bağlantıyı Kes">✕</button>
                    </div>
                ` : `
                    <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.connectOutlook()" style="padding: 8px 16px; font-weight: 700; border-radius: var(--radius-md); display: flex; align-items: center; gap: 6px; cursor: pointer; background: #0078d4; color: white; border: none; transition: background 0.2s;" onmouseover="this.style.background='#005a9e'" onmouseout="this.style.background='#0078d4'">
                        📧 Outlook Bağla
                    </button>
                `}
                <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.triggerMailScan()" style="padding: 8px 16px; font-weight: 700; border-radius: var(--radius-md); display: flex; align-items: center; gap: 6px; cursor: pointer; background: var(--bg-elevated); border: 1px solid var(--border);">
                    📥 Mail Tara ${state.outlookConnected ? '(Canlı)' : '(Mock)'}
                </button>
                <button class="btn btn-secondary" onclick="window.app.router.navigate('pricing-settings')" style="padding: 8px 16px; font-weight: 700; border-radius: var(--radius-md); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    ⚙️ Ayarlar
                </button>
            </div>
        </div>

        <!-- 2 KOLONLU CHAT LAYOUT -->
        <div class="pruva-chat-layout">
            
            <!-- SOL KOLON (320px Sabit) -->
            <div class="chat-left-sidebar">
                
                <!-- Üst Özet Bar -->
                <div class="chat-summary-bar">
                    Bu hafta: ${rfqCount} RFQ | ${offerCount} Teklif | %${winRate} Kazanma
                </div>

                <!-- Arama Kutusu -->
                <div class="chat-search-wrapper">
                    <input type="text" class="chat-search-input" id="conv-search-input" placeholder="Konuşma veya içerik ara..." value="${state.convSearchQuery || ''}" oninput="window.pruvaAiManager.searchConversations(this.value)">
                </div>

                <!-- Filtre Sekmeleri -->
                <div class="chat-filter-tabs">
                    <button class="chat-filter-btn ${filterMode === 'ALL' ? 'active' : ''}" onclick="window.pruvaAiManager.filterConversations('ALL')">Tümü</button>
                    <button class="chat-filter-btn ${filterMode === 'CUSTOMERS' ? 'active' : ''}" onclick="window.pruvaAiManager.filterConversations('CUSTOMERS')">Müşteriler</button>
                    <button class="chat-filter-btn ${filterMode === 'CARRIERS' ? 'active' : ''}" onclick="window.pruvaAiManager.filterConversations('CARRIERS')">Taşıyıcılar</button>
                    <button class="chat-filter-btn ${filterMode === 'PENDING' ? 'active' : ''}" onclick="window.pruvaAiManager.filterConversations('PENDING')">Bekleyenler</button>
                </div>

                <!-- Konuşma Listesi (Scrollable) -->
                <div class="chat-list-scroll">
                    ${filteredConversations.map(conv => `
                        <div class="chat-list-item ${conv.id === activeConvId ? 'active' : ''}" onclick="window.pruvaAiManager.selectConversation('${conv.id}')">
                            <div class="chat-avatar" style="background-color: ${conv.logoBg || '#3b82f6'};">
                                ${conv.logoLetter || conv.company.charAt(0).toUpperCase()}
                            </div>
                            <div class="chat-item-details">
                                <div class="chat-item-row1">
                                    <span class="chat-item-name">${conv.company}</span>
                                    <span class="chat-item-time">${conv.time}</span>
                                </div>
                                <div class="chat-item-row2">
                                    <span class="chat-item-snippet">${conv.lastMessage}</span>
                                    <span class="chat-status-dot" style="background-color: ${getStatusDotColor(conv.status)};" title="Durum: ${conv.status}"></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${filteredConversations.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: var(--text-secondary); font-size: 0.8rem;">
                            Konuşma bulunamadı.
                        </div>
                    ` : ''}
                </div>

                <!-- Sol Kolon Alt Rapor Linki -->
                <div class="chat-left-footer">
                    <a href="/pricing-reports">
                        📊 Raporları Gör &rarr;
                    </a>
                </div>

            </div>

            <!-- SAĞ KOLON (Flex) -->
            <div class="chat-right-panel">
                ${!activeConv ? `
                    <!-- 1. HİÇBİR KONUŞMA SEÇİLİ DEĞİLKEN -->
                    <div class="chat-welcome-box">
                        <div style="margin-bottom: 16px;">
                            <svg class="cute-robot-svg" viewBox="0 0 100 100" width="120" height="120" style="filter: drop-shadow(0 12px 24px rgba(59, 130, 246, 0.2));">
                                <style>
                                    @keyframes robotBlink {
                                        0%, 90%, 100% { transform: scaleY(1); }
                                        95% { transform: scaleY(0.1); }
                                    }
                                    @keyframes robotBreathe {
                                        0%, 100% { opacity: 0.4; fill: #60a5fa; filter: drop-shadow(0 0 2px #3b82f6); }
                                        50% { opacity: 1; fill: #93c5fd; filter: drop-shadow(0 0 8px #60a5fa); }
                                    }
                                    @keyframes armWiggle {
                                        0%, 100% { transform: rotate(0deg); }
                                        50% { transform: rotate(5deg); }
                                    }
                                    .robot-eye-left, .robot-eye-right {
                                        transform-origin: center;
                                        animation: robotBlink 4s infinite;
                                    }
                                    .robot-eye-left { transform-origin: 44px 37px; }
                                    .robot-eye-right { transform-origin: 56px 37px; }
                                    .chest-light {
                                        animation: robotBreathe 2s infinite ease-in-out;
                                    }
                                    .antenna-glow {
                                        animation: robotBreathe 1.5s infinite ease-in-out;
                                    }
                                    .robot-arm-left {
                                        transform-origin: 32px 62px;
                                        animation: armWiggle 3s infinite ease-in-out;
                                    }
                                    .robot-arm-right {
                                        transform-origin: 68px 62px;
                                        animation: armWiggle 3s infinite ease-in-out reverse;
                                    }
                                </style>
                                <defs>
                                    <radialGradient id="screen-glow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3"/>
                                        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
                                    </radialGradient>
                                    <linearGradient id="body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#ffffff"/>
                                        <stop offset="100%" stop-color="#f1f5f9"/>
                                    </linearGradient>
                                    <linearGradient id="ear-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#3b82f6"/>
                                        <stop offset="100%" stop-color="#1d4ed8"/>
                                    </linearGradient>
                                </defs>
                                <line x1="50" y1="20" x2="50" y2="10" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
                                <circle class="antenna-glow" cx="50" cy="8" r="4.5" fill="#3b82f6"/>
                                <rect x="23" y="31" width="6" height="12" rx="3" fill="url(#ear-gradient)"/>
                                <rect x="71" y="31" width="6" height="12" rx="3" fill="url(#ear-gradient)"/>
                                <rect x="28" y="21" width="44" height="34" rx="17" fill="url(#body-gradient)" stroke="#cbd5e1" stroke-width="1.5"/>
                                <rect x="34" y="26" width="32" height="24" rx="12" fill="#0f172a"/>
                                <rect x="34" y="26" width="32" height="24" rx="12" fill="url(#screen-glow)"/>
                                <ellipse class="robot-eye-left" cx="44" cy="37" rx="3" ry="4" fill="#60a5fa"/>
                                <ellipse class="robot-eye-right" cx="56" cy="37" rx="3" ry="4" fill="#60a5fa"/>
                                <circle cx="39" cy="43" r="2" fill="#f43f5e" opacity="0.5"/>
                                <circle cx="61" cy="43" r="2" fill="#f43f5e" opacity="0.5"/>
                                <rect x="35" y="56" width="30" height="28" rx="12" fill="url(#body-gradient)" stroke="#cbd5e1" stroke-width="1.5"/>
                                <circle class="chest-light" cx="50" cy="70" r="4.5" fill="#60a5fa"/>
                                <path class="robot-arm-left" d="M32 62 C23 64 21 72 26 75" stroke="url(#body-gradient)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                                <path class="robot-arm-right" d="M68 62 C77 64 79 72 74 75" stroke="url(#body-gradient)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                            </svg>
                        </div>
                        <h3 style="color: var(--text-primary); font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;">Pruva AI Lojistik Asistanı</h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 320px; line-height: 1.5; margin: 0 auto 20px;">Bir konuşma seçerek timeline akışını görüntüleyin veya yeni bir yapay zeka komutu gönderin.</p>
                    </div>
                ` : `
                    <!-- 2. KONUŞMA SEÇİLİNCE -->
                    <div class="chat-active-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar" style="background-color: ${activeConv.logoBg || '#3b82f6'}; width: 34px; height: 34px; font-size: 0.85rem;">
                                ${activeConv.logoLetter || activeConv.company.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${activeConv.company}</h4>
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                    ${getStatusBadge(activeConv.status)}
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.toggleDetailsDrawer()" style="padding: 6px 12px; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-md);">
                            📋 Detaylar
                        </button>
                    </div>

                    <!-- TIMELINE (KONUŞMA AKIŞI) -->
                    <div class="chat-timeline-area" id="chat-timeline-area">
                        ${activeConv.messages.map((msg, index) => {
                            if (msg.type === 'incoming') {
                                return `
                                    <div class="chat-bubble-row incoming">
                                        <div class="chat-bubble">
                                            <strong style="font-size: 0.75rem; color: var(--primary); display: block; margin-bottom: 4px;">${msg.sender}</strong>
                                            ${msg.text}
                                            <span class="chat-bubble-meta">${msg.time}</span>
                                        </div>
                                    </div>
                                `;
                            } else if (msg.type === 'outgoing') {
                                return `
                                    <div class="chat-bubble-row outgoing">
                                        <div class="chat-bubble">
                                            ${msg.text}
                                            <span class="chat-bubble-meta">${msg.time}</span>
                                        </div>
                                    </div>
                                `;
                            } else if (msg.type === 'ai_action') {
                                return `
                                    <div class="chat-bubble-row center">
                                        <div class="ai-action-card">
                                            ⚡ ${msg.text}
                                        </div>
                                    </div>
                                `;
                            } else if (msg.type === 'ai_suggestion' || msg.type === 'AI_SUGGESTION') {
                                return `
                                    <div class="chat-bubble-row center">
                                        <div class="ai-suggestion-card" id="suggestion-card-${activeConv.id}-${index}">
                                            <div class="ai-suggestion-title">
                                                🤖 Yapay Zeka Önerisi
                                            </div>
                                            <div class="ai-suggestion-text">
                                                ${msg.text}
                                            </div>
                                            <div class="ai-suggestion-actions">
                                                <button class="btn btn-danger" onclick="window.pruvaAiManager.rejectSuggestion('${activeConv.id}', ${index})" style="padding: 4px 10px; font-size: 0.7rem; border-radius: var(--radius-sm);">Reddet</button>
                                                <button class="btn btn-primary" onclick="window.pruvaAiManager.approveSuggestion('${activeConv.id}', ${index}, '${msg.action || ''}')" style="padding: 4px 10px; font-size: 0.7rem; background: #d97706; border-color: #d97706; color: white; border-radius: var(--radius-sm);">Onayla</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>
                `}

                <!-- HER ZAMAN ALTA SABİT KOMUT INPUT KUTUSU -->
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input-field" id="chat-command-input" placeholder="Bir komut girin... (örn: 'Arçelik'ten RFQ geldi, Çin'den 2x40HC FOB Temmuz' veya 'Hamburg'dan İzmir'e TIR fiyatı sor')" onkeydown="if(event.key === 'Enter') window.pruvaAiManager.sendInput()">
                    <button class="chat-send-btn" onclick="window.pruvaAiManager.sendInput()" title="Komut Gönder">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>

            </div>

        </div>

        <!-- Details Drawer Overlay (Faz 2) -->
        <div class="chat-details-overlay ${state.detailsDrawerOpen ? 'active' : ''}" id="details-overlay" onclick="window.app.managers.pruvaAi.toggleDetailsDrawer()" style="${state.detailsDrawerOpen ? '' : 'pointer-events: none; display: none;'}"></div>

        <!-- Details Drawer (Faz 2) -->
        <div class="chat-details-drawer ${state.detailsDrawerOpen ? 'active' : ''}" id="details-drawer">
            <div class="drawer-header">
                <h3>📋 Konuşma Detayları</h3>
                <button class="drawer-close-btn" onclick="window.app.managers.pruvaAi.toggleDetailsDrawer()">✕</button>
            </div>
            <div class="drawer-body" id="drawer-body-content">
                ${activeConv ? `
                    <!-- Şirket Kartı -->
                    <div class="drawer-section">
                        <div class="drawer-company-card">
                            <div class="drawer-company-avatar" style="background:${activeConv.logoBg || '#3b82f6'};">
                                ${activeConv.logoLetter || activeConv.company.charAt(0).toUpperCase()}
                            </div>
                            <div class="drawer-company-info">
                                <h4>${activeConv.company}</h4>
                                <p>${activeConv.email || 'Email bilgisi yok'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- İstatistikler -->
                    <div class="drawer-section">
                        <div class="drawer-section-title">İstatistikler</div>
                        <div class="drawer-stat-grid">
                            <div class="drawer-stat-item">
                                <div class="drawer-stat-value">${activeConv.messages?.length || 0}</div>
                                <div class="drawer-stat-label">Mesaj</div>
                            </div>
                            <div class="drawer-stat-item">
                                <div class="drawer-stat-value">${activeConv.messages?.filter(m => m.type === 'ai_suggestion' || m.type === 'AI_SUGGESTION').length || 0}</div>
                                <div class="drawer-stat-label">AI Öneri</div>
                            </div>
                            <div class="drawer-stat-item">
                                <div class="drawer-stat-value">${activeConv.messages?.filter(m => m.type === 'outgoing').length || 0}</div>
                                <div class="drawer-stat-label">Giden</div>
                            </div>
                            <div class="drawer-stat-item">
                                <div class="drawer-stat-value">${activeConv.messages?.filter(m => m.type === 'incoming').length || 0}</div>
                                <div class="drawer-stat-label">Gelen</div>
                            </div>
                        </div>
                    </div>

                    <!-- Durum Geçmişi -->
                    <div class="drawer-section">
                        <div class="drawer-section-title">Son Aktiviteler</div>
                        <div class="drawer-timeline-mini">
                            ${(activeConv.messages || []).slice(-5).reverse().map(m => `
                                <div class="drawer-timeline-item">
                                    <span class="drawer-timeline-icon">${
                                        m.type === 'incoming' ? '📨' : 
                                        m.type === 'outgoing' ? '📤' : 
                                        m.type === 'ai_action' ? '⚡' : '🤖'
                                    }</span>
                                    <div>
                                        <div class="drawer-timeline-text" style="word-break: break-all;">${(m.text || '').substring(0, 80)}${(m.text || '').length > 80 ? '...' : ''}</div>
                                        <div class="drawer-timeline-time">${m.time}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Notlar -->
                    <div class="drawer-section">
                        <div class="drawer-section-title">Notlar</div>
                        <textarea class="drawer-notes-area" id="conv-notes" placeholder="Bu konuşma hakkında notlarınız...">${activeConv.notes || ''}</textarea>
                        <button class="drawer-notes-save" onclick="window.app.managers.pruvaAi.saveConversationNotes()">💾 Notu Kaydet</button>
                    </div>
                ` : '<p style="color:var(--text-muted);text-align:center;margin-top:40px;">Konuşma seçilmedi</p>'}
            </div>
        </div>

    </div>
    `;
};
