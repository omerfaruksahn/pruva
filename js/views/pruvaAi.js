/**
 * PRUVA — Yapay Zeka Destekli Aksiyon ve İletişim Arayüzü (Pruva AI Ana Ekranı)
 * 
 * WhatsApp/Slack tarzı 2 kolonlu layout ile premium e-posta ve AI önerileri yönetim merkezi.
 */

// XSS Koruması için escape HTML fonksiyonu
const escapeHTML = (str) => {
    if (typeof str !== 'string') return str || '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};

window.pruvaAiView = (state) => {
    // 1. Durum / Konuşmalar State Yükle
    let conversations = state.pricingConversations || [];

    const activeConvId = state.activeConversationId || null;
    const activeConv = conversations.find(c => c.id === activeConvId) || null;

    // Arama & Filtreleme Terimleri
    const searchQuery = (state.convSearchQuery || '').toLowerCase().trim();
    const filterMode = state.convFilterMode || 'ALL'; // ALL, CUSTOMERS, CARRIERS, PENDING

    // Taşıyıcı e-postalarını toplayalım
    const mgr = window.app?.managers?.pruvaAi;
    const carrierEmails = new Set((mgr?.carriers || []).map(c => (c.email || '').toLowerCase()));

    // Konuşmaları Filtrele
    const filteredConversations = conversations.filter(c => {
        // Arama Terimi Eşleşmesi
        const matchesSearch = c.company.toLowerCase().includes(searchQuery) || 
                              c.lastMessage.toLowerCase().includes(searchQuery);
        
        if (!matchesSearch) return false;

        // Sekme Filtre Eşleşmesi
        if (filterMode === 'CUSTOMERS') {
            return c.id !== 'copilot' && !carrierEmails.has((c.email || '').toLowerCase());
        } else if (filterMode === 'CARRIERS') {
            return c.id !== 'copilot' && carrierEmails.has((c.email || '').toLowerCase());
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

    // Metrik Sayılarını Hesapla (Gerçek Veri)
    const rfqCount = state.pricingRFQs ? state.pricingRFQs.length : 0;
    const offerCount = conversations.filter(c => c.status === 'OFFER_SENT' || c.status === 'COMPLETED').length;

    return `
    <div class="pruva-ai-page-container pruva-saas-layout">
        
        <!-- ÜST KISIM / SAYFA BAŞLIĞI VE AYARLAR BUTONU -->
        <div class="saas-header-wrapper">
            <div class="saas-header-left">
                <img src="/assets/pruva_robot.svg" style="width: 42px; height: 42px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" alt="Pruva AI Robot">
                <h2 class="saas-header-title">Pruva AI — Pricing Asistanı</h2>
            </div>
            
            <div class="saas-header-actions">
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
                    📥 Mail Tara
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
                    Durum: ${rfqCount} RFQ | ${offerCount} Teklif
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
                    <!-- PRUVA AI CO-PILOT PINNED CHANNEL -->
                    <div class="chat-list-item ${activeConvId === 'copilot' ? 'active' : ''}" onclick="window.pruvaAiManager.selectConversation('copilot')" style="background: ${activeConvId === 'copilot' ? 'rgba(37,99,235,0.08)' : 'transparent'}; border-left: 3px solid #2563eb; margin-bottom: 8px; border-radius: var(--radius-md);">
                        <div class="chat-avatar" style="background: transparent; display: flex; align-items: center; justify-content: center; overflow: visible;">
                            <img src="/assets/pruva_robot.svg" style="width: 110%; height: 110%; object-fit: contain;">
                        </div>
                        <div class="chat-item-details">
                            <div class="chat-item-row1">
                                <span class="chat-item-name" style="font-weight: 800; color: var(--primary);">Pruva AI Co-pilot</span>
                                <span class="chat-item-time" style="font-size: 0.7rem; color: #2563eb; font-weight: 700; background: rgba(37,99,235,0.1); padding: 1px 5px; border-radius: 4px;">Pinned</span>
                            </div>
                            <div class="chat-item-row2">
                                <span class="chat-item-snippet" style="color: var(--text-secondary); font-weight: 600;">Genel Komut & AI Sohbeti</span>
                                <span class="chat-status-dot" style="background-color: #2563eb;" title="Co-pilot"></span>
                            </div>
                        </div>
                    </div>

                    ${filteredConversations.filter(c => c.id !== 'copilot').map(conv => `
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
                    ${filteredConversations.filter(c => c.id !== 'copilot').length === 0 ? `
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
                        <div class="welcome-robot-wrapper">
                            <img src="/assets/pruva_robot.svg" style="width: 140px; height: 140px; filter: drop-shadow(0 12px 20px rgba(0,0,0,0.15));" alt="Pruva AI Robot">
                        </div>
                        <h3 style="color: var(--text-primary); font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;">Pruva AI — Pricing Asistanı</h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 320px; line-height: 1.5; margin: 0 auto 20px;">Bir konuşma seçerek timeline akışını görüntüleyin veya yeni bir yapay zeka komutu gönderin.</p>
                    </div>
                ` : `
                    <!-- 2. KONUŞMA SEÇİLİNCE -->
                    <div class="chat-active-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar" style="background-color: ${activeConv.logoLetter === '🤖' ? 'transparent' : (activeConv.logoBg || '#3b82f6')}; width: 34px; height: 34px; font-size: 0.85rem; padding: 0; overflow: visible; border: none;">
                                ${activeConv.logoLetter === '🤖' ? '<img src="/assets/pruva_robot.svg" style="width: 110%; height: 110%; object-fit: contain;">' : (activeConv.logoLetter || activeConv.company.charAt(0).toUpperCase())}
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${activeConv.company}</h4>
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                    ${getStatusBadge(activeConv.status)}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.toggleHandsFreeMode()" style="padding: 6px 12px; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-md); ${window.app.state.isHandsFreeMode ? 'background: rgba(37,99,235,0.1); color: #2563eb; border: 1px solid rgba(37,99,235,0.3);' : ''}">
                                ${window.app.state.isHandsFreeMode ? '🎙️ Eller Serbest: AÇIK' : '🎧 Sesli Mod'}
                            </button>
                            <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.clearConversationHistory('${activeConv.id}')" style="padding: 6px 12px; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-md); background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);">
                                🗑️ Geçmişi Temizle
                            </button>
                            <button class="btn btn-secondary" onclick="window.app.managers.pruvaAi.toggleDetailsDrawer()" style="padding: 6px 12px; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-md);">
                                📋 Detaylar
                            </button>
                        </div>
                    </div>

                    <div class="chat-timeline-area" id="chat-timeline-area">
                        ${(activeConv.messages || []).map((msg, index) => {
                            if (msg.type === 'incoming') {
                                return `
                                    <div class="chat-bubble-row incoming">
                                        <div class="chat-bubble" style="position: relative; padding-right: 56px;">
                                            <strong style="font-size: 0.75rem; color: var(--primary); display: block; margin-bottom: 4px;">${escapeHTML(msg.sender)}</strong>
                                            ${escapeHTML(msg.text)}
                                            <span class="chat-bubble-meta">${msg.time}</span>
                                            
                                            <!-- Speak Button -->
                                            <button onclick="window.app.managers.pruvaAi.speakText(this)" data-text="${escapeHTML(msg.text)}" style="position: absolute; top: 6px; right: 28px; background: transparent; border: none; cursor: pointer; opacity: 0.5; font-size: 1rem; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5" title="Sesli Oku">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                            </button>
                                            
                                            <!-- Copy Button -->
                                            <button onclick="window.app.managers.pruvaAi.copyText(this)" data-text="${escapeHTML(msg.text)}" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; cursor: pointer; opacity: 0.5; font-size: 1rem; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5" title="Kopyala">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            } else if (msg.type === 'outgoing') {
                                return `
                                    <div class="chat-bubble-row outgoing">
                                        <div class="chat-bubble" style="position: relative; padding-right: 32px;">
                                            ${escapeHTML(msg.text)}
                                            <span class="chat-bubble-meta">${msg.time}</span>
                                            <button onclick="window.app.managers.pruvaAi.copyText(this)" data-text="${escapeHTML(msg.text)}" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; cursor: pointer; color: white; opacity: 0.6; font-size: 1rem; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6" title="Kopyala">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
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
                                const suggestedMail = typeof msg.suggestedMail === 'string' ? JSON.parse(msg.suggestedMail) : (msg.suggestedMail || {});
                                const hasMail = suggestedMail.body || msg.suggestedMessage;
                                
                                return `
                                    <div class="chat-bubble-row center">
                                        <div class="ai-suggestion-card" id="suggestion-card-${activeConv.id}-${index}" style="width: 100%; max-width: 500px;">
                                            <div class="ai-suggestion-title">
                                                <img src="/assets/pruva_robot.svg" style="width: 18px; height: 18px; vertical-align: text-bottom; margin-right: 4px;"> Yapay Zeka Önerisi
                                            </div>
                                            <div class="ai-suggestion-text">
                                                ${escapeHTML(msg.text)}
                                            </div>
                                            ${hasMail ? `
                                                <div class="mail-preview-box" style="margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 12px; text-align: left; width: 100%;">
                                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; display: flex; gap: 4px;">
                                                        <strong style="color: var(--text-primary); min-width: 45px;">Alıcı:</strong> 
                                                        <span>${escapeHTML(suggestedMail.to || activeConv.email || 'Alıcı Belirtilmedi')}</span>
                                                    </div>
                                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px; display: flex; gap: 4px;">
                                                        <strong style="color: var(--text-primary); min-width: 45px;">Konu:</strong> 
                                                        <span>${escapeHTML(suggestedMail.subject || 'Konu Yok')}</span>
                                                    </div>
                                                    <div class="chat-bubble-text" style="${msg.action === 'SEND_CUSTOM_EMAIL' ? 'font-family: monospace; white-space: pre-wrap; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 4px; border: 1px dashed var(--border); margin-top: 6px;' : ''}">${escapeHTML(msg.text)}</div>
                                                    ${msg.attachments && msg.attachments.length > 0 ? `
                                                        <div class="chat-attachments-list" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                                            ${msg.attachments.map(att => `
                                                                <a href="${att.signedUrl || '#'}" target="_blank" class="chat-attachment-chip" style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                                                                    <span style="font-size: 1rem;">📎</span>
                                                                    <span style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${att.name || 'Ekli Dosya'}</span>
                                                                </a>
                                                            `).join('')}
                                                        </div>
                                                    ` : ''}
                                                    <textarea id="edit-mail-body-${activeConv.id}-${index}" class="mail-body-preview" style="width: 100%; min-height: 100px; resize: vertical; font-size: 0.78rem; background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: var(--radius-sm); font-family: monospace; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.2); line-height: 1.4;">${escapeHTML(suggestedMail.body || msg.suggestedMessage || '')}</textarea>
                                                </div>
                                            ` : ''}
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
                        ${state.aiLoading ? `
                            <div class="chat-bubble-row incoming">
                                <div class="chat-avatar" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: white; width: 34px; height: 34px;">
                                    🤖
                                </div>
                                <div class="chat-bubble" style="padding: 12px 16px; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;">
                                    <strong style="font-size: 0.75rem; color: var(--primary); display: block;">Pruva AI</strong>
                                    <div class="typing-indicator" style="display: flex; gap: 4px; align-items: center; padding: 4px 0;">
                                        <span style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; display: inline-block; animation: typingBlink 1.4s infinite both;"></span>
                                        <span style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; display: inline-block; animation: typingBlink 1.4s infinite both 0.2s;"></span>
                                        <span style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; display: inline-block; animation: typingBlink 1.4s infinite both 0.4s;"></span>
                                    </div>
                                </div>
                            </div>
                            <style>
                                @keyframes typingBlink {
                                    0% { opacity: .2; }
                                    20% { opacity: 1; }
                                    100% { opacity: .2; }
                                }
                            </style>
                        ` : ''}
                    </div>
                `}

                <!-- HER ZAMAN ALTA SABİT KOMUT INPUT KUTUSU -->
                <div style="position: sticky; bottom: 0; background: linear-gradient(to top, var(--bg-default) 80%, transparent); padding-top: 10px; z-index: 10;">
                    <div id="chat-attachment-preview" style="display: ${state.pendingAttachments && state.pendingAttachments.length > 0 ? 'flex' : 'none'}; flex-wrap: wrap; gap: 8px; margin: 0 24px -12px 24px; position: relative; z-index: 2;">
                        ${(state.pendingAttachments || []).map((att, i) => `
                            <div class="pending-attachment-chip" style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #e0e7ff; border: 1px solid #c7d2fe; border-radius: var(--radius-sm); font-size: 0.75rem; color: #4338ca; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <span>📎</span>
                                <span style="max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${att.name}</span>
                                <button onclick="window.pruvaAiManager.removePendingAttachment(${i})" style="background: none; border: none; cursor: pointer; color: #ef4444; font-weight: bold;">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="chat-input-wrapper saas-input-wrapper">
                        <input type="file" id="chat-file-input" style="display: none;" multiple onchange="window.pruvaAiManager.handleFileSelect(event)">
                        <button class="chat-attach-btn" title="Dosya Ekle" onclick="document.getElementById('chat-file-input').click()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        </button>
                        <input type="text" class="chat-input-field saas-input-field" id="chat-command-input" placeholder="Bir komut girin... (örn: 'Arçelik'ten RFQ geldi, FOB Temmuz')" value="${state.chatCommandInputValue || ''}" oninput="window.pruvaAiManager.updateCommandInput(this.value)" onkeydown="if(event.key === 'Enter') window.pruvaAiManager.sendInput()">
                        <button class="chat-mic-btn" onclick="window.pruvaAiManager.startVoiceRecognition()" title="Sesle Yaz" style="background: transparent; border: none; cursor: pointer; color: var(--text-secondary); padding: 0 8px; transition: color 0.2s; display: flex; align-items: center;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-secondary)'">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        <button class="chat-send-btn saas-send-btn" onclick="window.pruvaAiManager.sendInput()" title="Komut Gönder">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
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
