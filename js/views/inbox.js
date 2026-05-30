import { db } from '../firebase-config.js';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { FirestoreService } from '../services/firestoreService.js';

/**
 * PRUVA - SPA Inbox (Gelen Kutusu) View
 * dual-column chat list & messaging interface
 */
window.inboxView = (state) => {
    return `
    <div class="container" style="padding: 10px 0;">
        <div class="inbox-container" id="inbox-main-container">
            <!-- Sidebar: Sohbet Listesi -->
            <div class="inbox-sidebar">
                <div class="inbox-sidebar-header">
                    <h2>Mesajlarım</h2>
                    <div class="inbox-search-wrapper">
                        <i data-lucide="search"></i>
                        <input type="text" id="inbox-search-bar" class="inbox-search-input" placeholder="Sohbetlerde ara..." oninput="window.inboxFilterThreads()">
                    </div>
                </div>
                <div class="inbox-threads-list" id="inbox-threads-list-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                        <div style="width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--secondary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
                        <p style="margin: 0; font-size: 0.85rem;">Sohbetler yükleniyor...</p>
                        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                    </div>
                </div>
            </div>

            <!-- Sağ Panel: Sohbet Penceresi -->
            <div class="inbox-chat-pane" id="inbox-chat-pane-container">
                <div class="inbox-empty-state">
                    <div class="inbox-empty-icon">
                        <i data-lucide="message-square" style="width: 36px; height: 36px;"></i>
                    </div>
                    <h3 class="inbox-empty-title">Mesaj Kutusu</h3>
                    <p class="inbox-empty-desc">Sohbetleriniz burada listelenir. Konuşmak istediğiniz ilanın sahibine teklif vererek veya soru sorarak mesaj atabilirsiniz.</p>
                </div>
            </div>
        </div>
    </div>
    `;
};

// ─────────────────────────────────────────────
// Real-time Listeners and Dynamic Interaction
// ─────────────────────────────────────────────

window.subscribeToUserChats = (app, callback) => {
    const currentUid = app.state.currentUserUid || app.state.currentUser;
    const currentName = app.state.currentUser;

    if (!currentUid || currentUid === 'Misafir') {
        return () => {};
    }

    const chatsQueryUid = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUid)
    );

    let chatsQueryName = null;
    if (currentName && currentName !== currentUid) {
        chatsQueryName = query(
            collection(db, "chats"),
            where("participants", "array-contains", currentName)
        );
    }

    let unsubUid = null;
    let unsubName = null;
    let uidDocs = [];
    let nameDocs = [];

    const handleMerge = () => {
        const docMap = new Map();
        uidDocs.forEach(doc => docMap.set(doc.id, doc));
        nameDocs.forEach(doc => docMap.set(doc.id, doc));
        const mergedDocs = Array.from(docMap.values());
        callback(mergedDocs);
    };

    unsubUid = onSnapshot(chatsQueryUid, (snapshot) => {
        uidDocs = snapshot.docs;
        handleMerge();
    }, (err) => {
        console.error("subscribeToUserChats (UID) hatası:", err);
    });

    if (chatsQueryName) {
        unsubName = onSnapshot(chatsQueryName, (snapshot) => {
            nameDocs = snapshot.docs;
            handleMerge();
        }, (err) => {
            console.error("subscribeToUserChats (Name) hatası:", err);
        });
    }

    return () => {
        if (unsubUid) unsubUid();
        if (unsubName) unsubName();
    };
};

window.inboxInit = (app) => {
    const currentUid = app.state.currentUserUid || app.state.currentUser;
    if (!currentUid || currentUid === 'Misafir') {
        app.router.navigate('login');
        return;
    }

    if (window.inboxUnsubscribeChats) {
        window.inboxUnsubscribeChats();
        window.inboxUnsubscribeChats = null;
    }

    window.inboxUnsubscribeChats = window.subscribeToUserChats(app, (docs) => {
        const threads = [];
        const unresolvedUids = new Set();
        
        for (const chatDoc of docs) {
            const data = chatDoc.data();
            const chatId = chatDoc.id;
            
            // Partneri belirle
            let partnerUid = data.participants.find(p => p !== currentUid && p !== app.state.currentUser) || "Misafir";
            let partnerName = partnerUid;
            
            if (data.adId === 'system') {
                partnerUid = 'system';
                partnerName = 'Pruva Destek';
            } else {
                // Partner ismini state veya DB'den çöz
                const foundUser = app.state.users.find(u => u.id === partnerUid || u.name === partnerUid);
                if (foundUser) {
                    partnerName = foundUser.name;
                } else if (partnerUid && partnerUid !== 'Misafir') {
                    unresolvedUids.add(partnerUid);
                }
            }

            // [PRIVACY MASKING] Mask ad owner's name for carriers if ad is not fully accepted
            const ad = app.state.ads.find(a => String(a.id) === String(data.adId));
            if (ad && app.state.userRole === 'carrier') {
                const isAccepted = ['accepted', 'delivered', 'completed'].includes(ad.status);
                if (!isAccepted && (partnerName === ad.owner || partnerUid === ad.owner)) {
                    partnerName = 'İlan Sahibi';
                }
            }

            threads.push({
                id: chatId,
                partnerUid,
                partnerName,
                lastMessage: data.lastMessage || "",
                lastTimestamp: data.lastTimestamp || data.createdAt || 0,
                lastSenderId: data.lastSenderId || "",
                lastReadTime: data.lastReadTime || {},
                adId: data.adId,
                presence: data.presence || {},
                typing: data.typing || {},
            });
        }

        // Son mesaja göre sırala (yeniden eskiye)
        threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        
        window.inboxActiveThreads = threads;
        window.inboxRenderThreads(threads);
        
        // Eğer önceden seçili veya dışarıdan yönlendirilen bir chat varsa onu otomatik aç
        if (window.inboxCurrentChatId) {
            const activeItem = document.querySelector(`.inbox-thread-item[data-chat-id="${window.inboxCurrentChatId}"]`);
            if (activeItem) {
                if (!activeItem.classList.contains('active')) {
                    window.inboxSelectThread(window.inboxCurrentChatId);
                } else {
                    activeItem.classList.add('active');
                }
            }
        }

        // Unresolved olanları asenkron ve paralel olarak çek
        if (unresolvedUids.size > 0) {
            const fetchPromises = Array.from(unresolvedUids).map(async (partnerUid) => {
                try {
                    const uDoc = await FirestoreService.getUser(partnerUid);
                    if (uDoc) {
                        // Cache locally
                        const existingIdx = app.state.users.findIndex(u => u.id === partnerUid);
                        if (existingIdx === -1) {
                            app.state.users.push(uDoc);
                        }
                        
                        // Update in-memory threads
                        const thread = threads.find(t => t.partnerUid === partnerUid);
                        if (thread) {
                            thread.partnerName = uDoc.name;
                        }
                    }
                } catch (e) {
                    console.warn("[Inbox] Partner bilgisi paralel alınamadı:", partnerUid, e);
                }
            });

            Promise.all(fetchPromises).then(() => {
                // Her şey yüklenince tekrar çiz
                window.inboxRenderThreads(threads);
                if (window.inboxCurrentChatId) {
                    const activeItem = document.querySelector(`.inbox-thread-item[data-chat-id="${window.inboxCurrentChatId}"]`);
                    if (activeItem) {
                        if (!activeItem.classList.contains('active')) {
                            window.inboxSelectThread(window.inboxCurrentChatId);
                        } else {
                            activeItem.classList.add('active');
                        }
                    }
                }
            });
        }
    });

    if (window.lucide) window.lucide.createIcons();
};

// Sohbetleri HTML Olarak Ekrana Çiz
window.inboxRenderThreads = (threads) => {
    const container = document.getElementById('inbox-threads-list-container');
    if (!container) return;

    if (threads.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <p style="margin: 0; font-size: 0.88rem; font-weight: 500;">Henüz aktif bir sohbetiniz bulunmuyor.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    threads.forEach(thread => {
        const isActive = window.inboxCurrentChatId === thread.id;
        const timeText = new Date(thread.lastTimestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
        const isUnread = thread.lastSenderId !== currentUid && (thread.lastTimestamp > (thread.lastReadTime?.[currentUid] || 0));
        
        const badgeHTML = isUnread ? `<span class="inbox-thread-badge" style="background: var(--danger); margin-left: auto;">1</span>` : '';

        const isSystem = thread.adId === 'system' || thread.partnerUid === 'system' || thread.partnerName === 'Pruva Destek';
        const avatarHTML = isSystem 
            ? `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; border-radius: 50%;"><i data-lucide="handshake" style="width: 18px; height: 18px;"></i></div>`
            : thread.partnerName.charAt(0).toUpperCase();

        container.innerHTML += `
            <div class="inbox-thread-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}" data-chat-id="${thread.id}" onclick="window.inboxSelectThread('${thread.id}')">
                <div class="inbox-thread-avatar" style="${isSystem ? 'padding: 0; background: transparent; display: flex; align-items: center; justify-content: center;' : ''}">
                    ${avatarHTML}
                    ${!isSystem && thread.presence?.[thread.partnerUid] ? '<div class="online-dot pulse"></div>' : ''}
                </div>
                <div class="inbox-thread-info">
                    <div class="inbox-thread-meta">
                        <span class="inbox-thread-name" style="${isUnread ? 'font-weight: 800;' : ''}">${thread.partnerName}</span>
                        <span class="inbox-thread-time" style="${isUnread ? 'color: var(--secondary); font-weight: 600;' : ''}">${timeText}</span>
                    </div>
                    <div class="inbox-thread-details">
                        <span class="inbox-thread-last-msg" style="${isUnread ? 'color: var(--text-primary); font-weight: 500;' : ''}">${window.utils.escapeHTML(thread.lastMessage || 'Fotoğraf / Dosya gönderildi')}</span>
                        ${badgeHTML}
                    </div>
                </div>
            </div>
        `;
    });
    if (window.lucide) window.lucide.createIcons();
};

// Arama Çubuğu ile Filtreleme
window.inboxFilterThreads = () => {
    const queryText = document.getElementById('inbox-search-bar')?.value.toLowerCase().trim();
    if (!window.inboxActiveThreads) return;

    if (!queryText) {
        window.inboxRenderThreads(window.inboxActiveThreads);
        return;
    }

    const filtered = window.inboxActiveThreads.filter(t => 
        t.partnerName.toLowerCase().includes(queryText) || 
        t.lastMessage.toLowerCase().includes(queryText)
    );
    window.inboxRenderThreads(filtered);
};

// Sohbet Seçme ve Sağ Paneli Yükleme
window.inboxSelectThread = (chatId) => {
    // Eski chat presence'ını false yap
    const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
    if (window.inboxCurrentChatId && window.inboxCurrentChatId !== chatId) {
        FirestoreService.setChatPresence(window.inboxCurrentChatId, currentUid, false);
    }

    window.inboxCurrentChatId = chatId;
    const thread = window.inboxActiveThreads.find(t => t.id === chatId);
    if (!thread) return;

    // Mark chat as read
    FirestoreService.markChatAsRead(chatId, currentUid);

    // Mobil responsive kayma efekti için class ekle
    const container = document.getElementById('inbox-main-container');
    if (container) {
        container.classList.add('chat-active');
    }

    // Sidebar'daki öğeleri güncelle
    const items = document.querySelectorAll('.inbox-thread-item');
    items.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-chat-id') === chatId) {
            item.classList.add('active');
        }
    });

    const pane = document.getElementById('inbox-chat-pane-container');
    if (!pane) return;

    const isSystemChat = thread.adId === 'system' || thread.partnerUid === 'system' || thread.partnerName === 'Pruva Destek';

    // İlan detayını state'den bul
    const ad = isSystemChat ? null : window.app.state.ads.find(a => String(a.id) === String(thread.adId));

    // Yük başka biriyle anlaşıldı mı?
    const isAdClosed = ad && ['accepted', 'in_transit', 'delivered', 'completed', 'reviewed'].includes(ad.status);
    
    // Biz bu anlaşmanın tarafı mıyız? (Kabul edilen taşıyıcı mıyız yoksa ilanın sahibi miyiz?)
    const isAcceptedCarrier = ad?.acceptedBid && (
        ad.acceptedBid.company === window.app.state.currentUser || 
        ad.acceptedBid.company === window.app.state.currentUserUid || 
        ad.acceptedBid.company === thread.partnerName || 
        ad.acceptedBid.company === thread.partnerUid
    );
    
    // Eğer ilan başkasıyla anlaşılarak kapandıysa ve biz kazanan taşıyıcı değilsek sohbet kilitlenir!
    // VEYA bu bir sistem sohbeti ise kilitlenir!
    const isChatLocked = (isAdClosed && !isAcceptedCarrier) || isSystemChat;

    const inputPanelHTML = isChatLocked ? `
        <div class="inbox-input-panel" style="background: rgba(0, 0, 0, 0.02); border-top: 1px solid var(--border); padding: 20px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; color: var(--text-muted); background: var(--bg-elevated); padding: 12px 24px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <i data-lucide="lock" style="width: 16px; height: 16px; color: ${isSystemChat ? 'var(--secondary)' : 'var(--danger)'};"></i>
                <span>${isSystemChat ? 'Bu sohbet sistem bilgilendirmesi olup yanıt gönderimine kapalıdır.' : 'Bu ilan için başka bir teklif kabul edilmiştir. İlginiz için teşekkür ederiz.'}</span>
            </div>
        </div>
    ` : `
        <!-- Input Area -->
        <div class="inbox-input-panel">
            <div class="inbox-input-wrapper" id="inbox-input-wrapper-el">
                <button class="inbox-file-btn" onclick="document.getElementById('inbox-file-input-el').click()" title="Dosya Ekle">
                    <i data-lucide="paperclip" style="width: 20px; height: 20px;"></i>
                </button>
                <input type="file" id="inbox-file-input-el" style="display: none;" onchange="window.inboxHandleFileUpload(event, '${chatId}')">
                
                <textarea id="inbox-message-input" placeholder="Mesajınızı yazın..." class="inbox-textarea"
                          onfocus="document.getElementById('inbox-input-wrapper-el').classList.add('focus')" 
                          onblur="document.getElementById('inbox-input-wrapper-el').classList.remove('focus')" 
                          oninput="this.style.height = ''; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; window.inboxHandleTyping('${chatId}')" 
                          onkeypress="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.inboxSendMessage('${chatId}'); }"></textarea>
                
                <button class="inbox-send-btn" onclick="window.inboxSendMessage('${chatId}')">
                    <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            <div style="text-align: center; margin-top: 8px;">
                <span style="font-size: 0.65rem; color: var(--text-muted);">Enter ile gönderin, Shift + Enter ile alt satıra geçin</span>
            </div>
        </div>
    `;

    pane.innerHTML = `
        <!-- Header -->
        <div class="inbox-chat-header">
            <div class="inbox-chat-header-user">
                <button class="inbox-back-btn" onclick="window.inboxBackToThreads()">
                    <i data-lucide="arrow-left" style="width: 20px; height: 20px;"></i>
                </button>
                <div class="inbox-chat-header-avatar" style="${isSystemChat ? 'padding: 0; background: transparent; display: flex; align-items: center; justify-content: center;' : ''}">
                    ${isSystemChat 
                        ? `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; border-radius: 50%;"><i data-lucide="handshake" style="width: 18px; height: 18px;"></i></div>` 
                        : thread.partnerName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="inbox-chat-header-name">${thread.partnerName}</h3>
                    <div id="inbox-header-status-el" class="inbox-chat-header-status ${isSystemChat ? '' : (thread.presence?.[thread.partnerUid] ? '' : 'offline')}">
                        <div style="width: 6px; height: 6px; border-radius: 50%; background: ${isSystemChat ? 'var(--secondary)' : (thread.presence?.[thread.partnerUid] ? '#2ecc71' : 'var(--text-muted)')};"></div>
                        <span>${isSystemChat ? 'Doğrulanmış Hesap' : (thread.presence?.[thread.partnerUid] ? 'Çevrimiçi' : 'Çevrimdışı')}</span>
                    </div>
                </div>
            </div>
            <div class="inbox-chat-header-actions">
                ${ad ? `
                    <a href="/marketplace" class="inbox-header-ad-link" onclick="event.preventDefault(); window.app.router.navigate('marketplace'); setTimeout(() => window.marketplaceManager.focusOnAd('${ad.id}'), 250);">
                        <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
                        <span>İlanı Gör</span>
                    </a>
                ` : ''}
            </div>
        </div>

        <!-- Privacy Banner -->
        <div class="inbox-privacy-banner">
            <i data-lucide="shield-alert" style="width: 16px; height: 16px; color: #f39c12;"></i>
            <p style="margin: 0; font-size: 0.74rem; color: #b97a0b; font-weight: 500; line-height: 1.4;">
                Pruva güvenliği için iletişim bilgilerini paylaşmak yasaktır. Platform üzerinden anlaşma sağlandığında iletişim bilgileri otomatik iletilir.
            </p>
        </div>

        <!-- Messages Area -->
        <div class="inbox-messages-container" id="inbox-messages-scroll-area">
            <div style="text-align: center; margin-top: auto; margin-bottom: auto; color: var(--text-muted);">
                <div style="width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--secondary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 8px;"></div>
                <p style="margin: 0; font-size: 0.85rem;">Mesajlar yükleniyor...</p>
            </div>
        </div>

        <!-- Typing Indicator -->
        <div class="inbox-typing-indicator" id="inbox-typing-indicator-el" style="display: none;">
            <div class="inbox-typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>

        ${inputPanelHTML}
    `;

    if (window.lucide) window.lucide.createIcons();

    // Çevrimiçi bilgisini gönder
    FirestoreService.setChatPresence(chatId, currentUid, true);

    // Karşı tarafın yazma durumu ve varlığını izle
    if (window.inboxChatDocUnsubscribe) window.inboxChatDocUnsubscribe();
    window.inboxChatDocUnsubscribe = FirestoreService.subscribeToChatDoc(chatId, (chatData) => {
        const typingEl = document.getElementById('inbox-typing-indicator-el');
        if (typingEl) {
            if (chatData.typing && chatData.typing[thread.partnerUid]) {
                typingEl.style.display = 'block';
            } else {
                typingEl.style.display = 'none';
            }
        }

        const presenceEl = document.getElementById('inbox-header-status-el');
        if (presenceEl) {
            const isOnline = chatData.presence && chatData.presence[thread.partnerUid];
            presenceEl.className = `inbox-chat-header-status ${isOnline ? '' : 'offline'}`;
            presenceEl.innerHTML = `
                <div style="width: 6px; height: 6px; border-radius: 50%; background: ${isOnline ? '#2ecc71' : 'var(--text-muted)'};"></div>
                <span>${isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
            `;
        }
    });

    // Mesajları canlı dinle
    if (window.inboxMessagesUnsubscribe) window.inboxMessagesUnsubscribe();
    window.inboxMessagesUnsubscribe = FirestoreService.subscribeToMessages(chatId, (messages) => {
        // Mark chat as read when a new message arrives in the active inbox thread
        FirestoreService.markChatAsRead(chatId, currentUid);

        const container = document.getElementById('inbox-messages-scroll-area');
        if (!container) return;

        container.innerHTML = '';
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: auto; margin-bottom: auto; color: var(--text-muted);">
                    <div style="width: 54px; height: 54px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; box-shadow: var(--shadow-sm);">
                        <i data-lucide="message-square-plus" style="width: 24px; height: 24px; color: var(--text-secondary);"></i>
                    </div>
                    <h4 style="margin: 0 0 4px 0; color: var(--text-primary);">Sohbet Başlatın</h4>
                    <p style="margin: 0; font-size: 0.8rem; max-width: 250px; line-height: 1.5; margin: 0 auto;">İlk mesajı göndererek görüşmeye başlayabilirsiniz.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        } else {
            container.innerHTML = window.utils.chat.renderMessageList(messages, currentUid, window.app.state.currentUser);
            if (window.lucide) window.lucide.createIcons();
        }
        container.scrollTop = container.scrollHeight;
    });
};

// Mobil Görünümde Geri Dönüş
window.inboxBackToThreads = () => {
    const container = document.getElementById('inbox-main-container');
    if (container) {
        container.classList.remove('chat-active');
    }
    if (window.inboxChatDocUnsubscribe) window.inboxChatDocUnsubscribe();
    if (window.inboxMessagesUnsubscribe) window.inboxMessagesUnsubscribe();
    
    const items = document.querySelectorAll('.inbox-thread-item');
    items.forEach(item => item.classList.remove('active'));
    
    if (window.inboxCurrentChatId) {
        const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
        FirestoreService.setChatPresence(window.inboxCurrentChatId, currentUid, false);
        window.inboxCurrentChatId = null;
    }

    const pane = document.getElementById('inbox-chat-pane-container');
    if (pane) {
        pane.innerHTML = `
            <div class="inbox-empty-state">
                <div class="inbox-empty-icon">
                    <i data-lucide="message-square" style="width: 36px; height: 36px;"></i>
                </div>
                <h3 class="inbox-empty-title">Mesaj Kutusu</h3>
                <p class="inbox-empty-desc">Sohbetleriniz burada listelenir. Konuşmak istediğiniz ilanın sahibine teklif vererek veya soru sorarak mesaj atabilirsiniz.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
};

// Dosya Yükleme İşlemi
window.inboxHandleFileUpload = async (event, chatId) => {
    const thread = window.inboxActiveThreads ? window.inboxActiveThreads.find(t => t.id === chatId) : null;
    const ad = thread ? window.app.state.ads.find(a => String(a.id) === String(thread.adId)) : null;
    const isAdClosed = ad && ['accepted', 'in_transit', 'delivered', 'completed', 'reviewed'].includes(ad.status);
    const isAcceptedCarrier = ad?.acceptedBid && (
        ad.acceptedBid.company === window.app.state.currentUser || 
        ad.acceptedBid.company === window.app.state.currentUserUid || 
        ad.acceptedBid.company === thread?.partnerName || 
        ad.acceptedBid.company === thread?.partnerUid
    );
    if (isAdClosed && !isAcceptedCarrier) {
        window.notificationManager?.showToast("Bu ilan için başka bir teklif kabul edildiği için sohbet kilitlenmiştir.", 'warning');
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        window.notificationManager?.showToast("Dosya boyutu 5MB'dan küçük olmalıdır.", 'warning');
        return;
    }

    window.notificationManager?.showToast('Dosya yükleniyor...', 'info');

    try {
        const url = await FirestoreService.uploadFile(file, `chat_files/${chatId}`);
        const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
        
        const messageData = {
            senderId: currentUid,
            senderName: window.app.state.currentUser,
            text: "Dosya gönderildi",
            type: 'file',
            fileUrl: url,
            fileName: file.name,
            fileType: file.type,
            timestamp: new Date().getTime()
        };

        await FirestoreService.sendMessage(chatId, messageData);
        window.notificationManager?.showToast('Dosya başarıyla gönderildi', 'success');
    } catch (error) {
        console.error("[Inbox] Dosya yükleme hatası:", error);
        window.notificationManager?.showToast('Dosya yüklenemedi.', 'error');
    }
};

// Yazıyor Durumu Bildirimi
window.inboxHandleTyping = (chatId) => {
    const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
    
    if (!window.inboxTypingTimeout) {
        FirestoreService.updateTypingStatus(chatId, currentUid, true);
    } else {
        clearTimeout(window.inboxTypingTimeout);
    }

    window.inboxTypingTimeout = setTimeout(() => {
        FirestoreService.updateTypingStatus(chatId, currentUid, false);
        window.inboxTypingTimeout = null;
    }, 3000);
};

// Mesaj Gönder
window.inboxSendMessage = async (chatId) => {
    const thread = window.inboxActiveThreads ? window.inboxActiveThreads.find(t => t.id === chatId) : null;
    const ad = thread ? window.app.state.ads.find(a => String(a.id) === String(thread.adId)) : null;
    const isAdClosed = ad && ['accepted', 'in_transit', 'delivered', 'completed', 'reviewed'].includes(ad.status);
    const isAcceptedCarrier = ad?.acceptedBid && (
        ad.acceptedBid.company === window.app.state.currentUser || 
        ad.acceptedBid.company === window.app.state.currentUserUid || 
        ad.acceptedBid.company === thread?.partnerName || 
        ad.acceptedBid.company === thread?.partnerUid
    );
    if (isAdClosed && !isAcceptedCarrier) {
        window.notificationManager?.showToast("Bu ilan için başka bir teklif kabul edildiği için sohbet kilitlenmiştir.", 'warning');
        return;
    }

    const input = document.getElementById('inbox-message-input');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
    
    const messageData = {
        senderId: currentUid,
        senderName: window.app.state.currentUser,
        text: text,
        type: 'text',
        timestamp: new Date().getTime()
    };
    
    // Yanıtlanan mesaj varsa ekle
    if (window.inboxCurrentReplyTo) {
        messageData.replyTo = window.inboxCurrentReplyTo;
    }

    try {
        await FirestoreService.sendMessage(chatId, messageData);
        input.value = '';
        input.style.height = '';
        input.focus();
        
        if (window.inboxTypingTimeout) {
            clearTimeout(window.inboxTypingTimeout);
            window.inboxTypingTimeout = null;
            FirestoreService.updateTypingStatus(chatId, currentUid, false);
        }
        
        // Yanıt modundaysak sıfırla
        window.inboxCancelReply();
        
    } catch (error) {
        console.error("[Inbox] Mesaj gönderilemedi:", error);
        window.notificationManager?.showToast('Mesaj gönderilemedi.', 'error');
    }
};

// ─────────────────────────────────────────────
// Mesaj Aksiyon Handler'ları (React, Reply, Edit, Delete)
// ─────────────────────────────────────────────

window.inboxSetReplyTo = (messageId, senderName, text) => {
    window.inboxCurrentReplyTo = { messageId, text, name: senderName };
    
    // Reply bar'ı göster
    const inputPanel = document.querySelector('.inbox-input-panel') || document.querySelector('.modal-content .inbox-input-panel');
    if (!inputPanel) return;

    let replyBar = document.getElementById('inbox-reply-bar-el');
    if (!replyBar) {
        replyBar = document.createElement('div');
        replyBar.id = 'inbox-reply-bar-el';
        replyBar.className = 'inbox-reply-bar';
        inputPanel.insertBefore(replyBar, inputPanel.firstChild);
    }
    
    replyBar.innerHTML = `
        <div class="inbox-reply-bar-content">
            <div class="inbox-reply-bar-name">Yanıtlanıyor: ${senderName}</div>
            <div class="inbox-reply-bar-text">${window.utils.escapeHTML(text)}</div>
        </div>
        <button class="inbox-reply-bar-close" onclick="window.inboxCancelReply()">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </button>
    `;
    if (window.lucide) window.lucide.createIcons();
    
    const textarea = document.getElementById('inbox-message-input') || document.getElementById('chat-input');
    if (textarea) textarea.focus();
};

window.inboxShowReactionPicker = (event, chatId, messageId) => {
    if (event) event.stopPropagation();
    
    // Mevcut açık picker varsa kapat
    document.querySelectorAll('.reaction-picker').forEach(el => el.remove());
    
    const msgWrapper = document.getElementById(`msg-${messageId}`);
    if (!msgWrapper) return;

    const msgActionsEl = msgWrapper.querySelector('.inbox-message-actions');
    if (msgActionsEl) {
        const picker = document.createElement('div');
        picker.className = 'reaction-picker';
        picker.innerHTML = `
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '👍')">👍</button>
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '❤️')">❤️</button>
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '😂')">😂</button>
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '😮')">😮</button>
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '😢')">😢</button>
            <button class="reaction-picker-emoji" onclick="window.inboxAddReaction('${chatId}', '${messageId}', '🙏')">🙏</button>
        `;
        msgActionsEl.appendChild(picker);
        
        // Dışarı tıklanınca kapat
        setTimeout(() => {
            const closePicker = (e) => {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                } else {
                    document.removeEventListener('click', closePicker);
                }
            };
            document.addEventListener('click', closePicker);
        }, 10);
    }
};

window.inboxStartEditMessage = (chatId, messageId, btnEl) => {
    const msgEl = document.getElementById(`msg-${messageId}`);
    if (msgEl) {
        const textEl = msgEl.querySelector('.msg-text-content');
        if (!textEl) return;
        
        const currentText = textEl.innerText;
        const bubble = msgEl.querySelector('.inbox-message-bubble');
        
        // Zaten edit modunda mı?
        if (bubble.querySelector('.inbox-edit-input')) return;
        
        const originalHTML = bubble.innerHTML;
        
        bubble.innerHTML = `
            <textarea class="inbox-edit-input" id="edit-input-${messageId}">${currentText}</textarea>
            <div class="inbox-edit-actions">
                <button class="cancel-btn" onclick="window.inboxCancelEdit('${messageId}')">İptal</button>
                <button class="save-btn" onclick="window.inboxSaveEdit('${chatId}', '${messageId}')">Kaydet</button>
            </div>
        `;
        
        // Orijinal HTML'i sakla
        msgEl.dataset.originalHtml = originalHTML;
        
        const input = document.getElementById(`edit-input-${messageId}`);
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }
};

window.inboxDeleteMessage = async (chatId, messageId) => {
    if (confirm("Bu mesajı silmek istediğinize emin misiniz? (Karşı tarafta da silinecektir)")) {
        try {
            await FirestoreService.deleteMessage(chatId, messageId);
            window.notificationManager?.showToast('Mesaj silindi.', 'success');
        } catch (e) {
            console.error("Silme hatası:", e);
            window.notificationManager?.showToast('Silinemedi.', 'error');
        }
    }
};

window.inboxAddReaction = async (chatId, messageId, emoji) => {
    const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
    try {
        await FirestoreService.addReaction(chatId, messageId, currentUid, emoji);
        document.querySelectorAll('.reaction-picker').forEach(el => el.remove());
    } catch (e) {
        console.error("Reaction hatası:", e);
    }
};

window.inboxToggleReaction = async (chatId, messageId, emoji) => {
    // If we click an existing reaction, it will remove it if it's ours, or add ours if it's someone else's
    const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
    try {
        const msgDoc = await window.FirestoreService.getMessageDoc(chatId, messageId);
        if (msgDoc && msgDoc.reactions && msgDoc.reactions[currentUid] === emoji) {
            await FirestoreService.removeReaction(chatId, messageId, currentUid);
        } else {
            await FirestoreService.addReaction(chatId, messageId, currentUid, emoji);
        }
    } catch (e) {
        console.error("Reaction toggle hatası:", e);
        // Fallback since getMessageDoc is not implemented, just add it directly
        await FirestoreService.addReaction(chatId, messageId, currentUid, emoji);
    }
};

window.inboxCancelReply = () => {
    window.inboxCurrentReplyTo = null;
    const replyBar = document.getElementById('inbox-reply-bar-el');
    if (replyBar) replyBar.remove();
};

window.inboxCancelEdit = (messageId) => {
    const msgEl = document.getElementById(`msg-${messageId}`);
    if (msgEl && msgEl.dataset.originalHtml) {
        msgEl.querySelector('.inbox-message-bubble').innerHTML = msgEl.dataset.originalHtml;
    }
};

window.inboxSaveEdit = async (chatId, messageId) => {
    const input = document.getElementById(`edit-input-${messageId}`);
    if (input) {
        const newText = input.value.trim();
        if (newText) {
            try {
                await FirestoreService.editMessage(chatId, messageId, newText);
                window.notificationManager?.showToast('Mesaj düzenlendi.', 'success');
            } catch (e) {
                console.error("Düzenleme hatası:", e);
                window.notificationManager?.showToast('Düzenlenemedi.', 'error');
                window.inboxCancelEdit(messageId);
            }
        } else {
            window.inboxCancelEdit(messageId);
        }
    }
};

// Sayfa kapatılırken veya sekmeler değiştirilirken çevrimiçi bilgisini kaldır
window.addEventListener('beforeunload', () => {
    if (window.inboxCurrentChatId) {
        const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
        FirestoreService.setChatPresence(window.inboxCurrentChatId, currentUid, false);
    }
});

// ─────────────────────────────────────────────
// Messages Icon Dropdown Popover Manager
// ─────────────────────────────────────────────
window.inboxDropdown = {
    isOpen: false,
    toggle(event) {
        if (event) event.stopPropagation();
        const dropdown = document.getElementById('messages-dropdown');
        if (!dropdown) return;
        
        // Close other dropdowns
        const notifDropdown = document.getElementById('notification-dropdown');
        if (notifDropdown) notifDropdown.style.display = 'none';
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileDropdown) profileDropdown.style.display = 'none';
        
        this.isOpen = !this.isOpen;
        dropdown.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen && window.lucide) {
            window.lucide.createIcons();
        }
    },
    close() {
        const dropdown = document.getElementById('messages-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        this.isOpen = false;
    },
    handleThreadClick(adId, partnerUid, chatId) {
        this.close();
        window.inboxCurrentChatId = chatId;
        window.app.router.navigate('inbox');
    },
    initListener(app) {
        if (this.unsubscribe) this.unsubscribe();
        const currentUid = app.state.currentUserUid || app.state.currentUser;
        if (!currentUid || currentUid === 'Misafir') return;
        
        this.knownTimestamps = this.knownTimestamps || {};

        this.unsubscribe = window.subscribeToUserChats(app, (docs) => {
            const threads = [];
            const unresolvedUids = new Set();

            for (const chatDoc of docs) {
                const data = chatDoc.data();
                const chatId = chatDoc.id;
                
                let partnerUid = data.participants.find(p => p !== currentUid && p !== app.state.currentUser) || "Misafir";
                let partnerName = partnerUid;
                
                if (data.adId === 'system') {
                    partnerUid = 'system';
                    partnerName = 'Pruva Destek';
                } else {
                    const foundUser = app.state.users.find(u => u.id === partnerUid || u.name === partnerUid);
                    if (foundUser) {
                        partnerName = foundUser.name;
                    } else if (partnerUid && partnerUid !== 'Misafir') {
                        unresolvedUids.add(partnerUid);
                    }
                }

                // [PRIVACY MASKING] Mask ad owner's name for carriers if ad is not fully accepted
                const ad = app.state.ads.find(a => String(a.id) === String(data.adId));
                if (ad && app.state.userRole === 'carrier') {
                    const isAccepted = ['accepted', 'delivered', 'completed'].includes(ad.status);
                    if (!isAccepted && (partnerName === ad.owner || partnerUid === ad.owner)) {
                        partnerName = 'İlan Sahibi';
                    }
                }

                // Detect new messages for notifications
                const isNewTimestamp = data.lastTimestamp && data.lastTimestamp > (this.knownTimestamps[chatId] || 0);
                if (isNewTimestamp) {
                    // Only alert if we already knew about this chat (not first load) and sender is not us
                    if (this.knownTimestamps[chatId] && data.lastSenderId && data.lastSenderId !== currentUid) {
                        const inInboxChat = app.state.currentView === 'inbox' && window.inboxCurrentChatId === chatId;
                        const inModalChat = window.chatManager && window.chatManager.currentChatId === chatId;
                        
                        if (!inInboxChat && !inModalChat && window.notificationManager) {
                            let shortMsg = data.lastMessage || "Fotoğraf / Dosya gönderildi";
                            if (shortMsg.length > 30) shortMsg = shortMsg.substring(0, 30) + "...";
                            window.notificationManager.showToast(`💬 ${partnerName}: ${shortMsg}`, 'chat');
                            
                            // Also add to notification dropdown if desired
                            window.notificationManager.add({
                                id: `chat_${chatId}_${data.lastTimestamp}`,
                                type: 'chat',
                                text: `💬 ${partnerName}: ${shortMsg}`,
                                date: data.lastTimestamp,
                                read: false,
                                action: 'openChat',
                                adId: data.adId,
                                partnerName: partnerName,
                                targetUser: app.state.currentUser
                            });
                        }
                    }
                    this.knownTimestamps[chatId] = data.lastTimestamp;
                }

                threads.push({
                    id: chatId,
                    partnerUid,
                    partnerName,
                    lastMessage: data.lastMessage || "",
                    lastTimestamp: data.lastTimestamp || data.createdAt || 0,
                    lastSenderId: data.lastSenderId || "",
                    lastReadTime: data.lastReadTime || {},
                    adId: data.adId
                });
            }

            threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
            
            this.updateBadge(threads);
            this.render(threads);

            if (unresolvedUids.size > 0) {
                const fetchPromises = Array.from(unresolvedUids).map(async (partnerUid) => {
                    try {
                        const uDoc = await FirestoreService.getUser(partnerUid);
                        if (uDoc) {
                            const existingIdx = app.state.users.findIndex(u => u.id === partnerUid);
                            if (existingIdx === -1) {
                                app.state.users.push(uDoc);
                            }
                            const thread = threads.find(t => t.partnerUid === partnerUid);
                            if (thread) {
                                thread.partnerName = uDoc.name;
                            }
                        }
                    } catch (e) {
                        console.warn("[InboxDropdown] Partner bilgisi paralel alınamadı:", partnerUid, e);
                    }
                });

                Promise.all(fetchPromises).then(() => {
                    this.updateBadge(threads);
                    this.render(threads);
                });
            }
        });
    },
    updateBadge(threads) {
        const container = document.getElementById('messages-badge-container');
        if (!container) return;
        
        const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
        const unreadCount = threads.filter(t => t.lastSenderId !== currentUid && t.lastTimestamp > (t.lastReadTime?.[currentUid] || 0)).length;
        
        if (unreadCount > 0) {
            container.innerHTML = `<span class="badge" style="position: absolute; top: -6px; right: -6px; background: #e74c3c; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid var(--bg-surface);">${unreadCount}</span>`;
        } else {
            container.innerHTML = '';
        }
    },
    render(threads) {
        const dropdown = document.getElementById('messages-dropdown');
        if (!dropdown) return;
        
        if (threads.length === 0) {
            dropdown.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                    <i data-lucide="message-square" style="width: 28px; height: 28px; margin: 0 auto 8px; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 0.85rem;">Henüz aktif bir sohbetiniz bulunmuyor.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        
        let html = `
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">Mesajlar</h4>
                <a href="/inbox" style="font-size: 0.75rem; color: var(--secondary); font-weight: 600; text-decoration: none;" onclick="event.preventDefault(); window.inboxDropdown.close(); window.app.router.navigate('inbox');">Tümünü Gör</a>
            </div>
            <div style="max-height: 380px; overflow-y: auto;">
        `;
        
        threads.forEach(thread => {
            const timeText = new Date(thread.lastTimestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const currentUid = window.app.state.currentUserUid || window.app.state.currentUser;
            const isUnread = thread.lastSenderId !== currentUid && (thread.lastTimestamp > (thread.lastReadTime?.[currentUid] || 0));
            
            const isSystem = thread.adId === 'system' || thread.partnerUid === 'system' || thread.partnerName === 'Pruva Destek';
            
            html += `
                <div class="messages-dropdown-item ${isUnread ? 'unread' : ''}" 
                     onclick="window.inboxDropdown.handleThreadClick('${thread.adId}', '${thread.partnerUid}', '${thread.id}')">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 0.95rem; flex-shrink: 0;">
                        ${isSystem ? '<i data-lucide="handshake" style="width: 18px; height: 18px;"></i>' : thread.partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <span style="font-size: 0.85rem; font-weight: ${isUnread ? '700' : '600'}; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${thread.partnerName}</span>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${timeText}</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span style="font-size: 0.78rem; color: ${isUnread ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight: ${isUnread ? '500' : '400'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${window.utils.escapeHTML(thread.lastMessage || 'Fotoğraf / Dosya gönderildi')}</span>
                            ${isUnread ? `<span style="background: #e74c3c; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;"></span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        dropdown.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }
};

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('messages-dropdown');
    const wrapper = e.target.closest('.messages-dropdown-wrapper');
    if (dropdown && dropdown.style.display === 'block' && !wrapper) {
        dropdown.style.display = 'none';
        window.inboxDropdown.isOpen = false;
    }
});
