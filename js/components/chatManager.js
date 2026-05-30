window.ChatManager = class ChatManager {
    constructor(appInstance) {
        this.app = appInstance;
    }

    async toggleChat(show, adId, partnerIdentifier) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        const existing = document.getElementById('chat-modal');
        if (existing) {
            existing.remove();
            if (this._messageUnsubscribe) this._messageUnsubscribe();
        }

        if (show) {
            // Partner çözümü: UID veya isim olabilir
            // state.users artık sadece oturum açan kullanıcıyı içeriyor
            // → state.users'da bulunamazsa identifier'ı olduğu gibi kullan
            let partnerUid  = partnerIdentifier;
            let partnerName = partnerIdentifier;

            const found = this.app.state.users.find(
                u => u.id === partnerIdentifier || u.name === partnerIdentifier
            );
            if (found) {
                partnerUid  = found.id;
                partnerName = found.name;
            }

            try {
                const currentUid = this.app.state.currentUserUid || this.app.state.currentUser;
                const chat = await FirestoreService.getOrCreateChat(adId, [currentUid, partnerUid]);
                container.innerHTML += window.chatModalComponent(this.app.state, adId, partnerName, chat.id);
                document.getElementById('chat-input')?.focus();
                this.startChatListener(chat.id);
            } catch (error) {
                console.error('[ChatManager] Chat oluşturulamadı:', error);
                window.notificationManager?.showToast('Mesajlaşma başlatılamadı.', 'error');
            }
        }
    }

    async sendMessage(chatId) {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const messageData = {
            senderId: this.app.state.currentUserUid || this.app.state.currentUser,
            senderName: this.app.state.currentUser,
            text: text,
            timestamp: new Date().getTime()
        };

        try {
            await FirestoreService.sendMessage(chatId, messageData);
            input.value = '';
            input.focus();
        } catch (error) {
            console.error("Mesaj gönderilemedi:", error);
            if (window.notificationManager) window.notificationManager.showToast('Mesaj gönderilemedi.', 'error');
        }
    }

    startChatListener(chatId) {
        if (this._messageUnsubscribe) this._messageUnsubscribe();
        
        const currentUid = this.app.state.currentUserUid || this.app.state.currentUser;
        
        // Mark as read immediately when active
        FirestoreService.markChatAsRead(chatId, currentUid);

        this._messageUnsubscribe = FirestoreService.subscribeToMessages(chatId, (messages) => {
            const chatContainer = document.getElementById('chat-messages-container');
            if (chatContainer) {
                // Also mark as read on new message if chat modal is still active
                FirestoreService.markChatAsRead(chatId, currentUid);

                chatContainer.innerHTML = '';
                if (messages.length === 0) {
                    chatContainer.innerHTML = `
                        <div style="text-align: center; margin-top: auto; margin-bottom: auto; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; animation: fadeIn 0.5s ease;">
                            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--bg-elevated); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
                                <i data-lucide="message-square-plus" style="width: 28px; height: 28px; color: var(--text-secondary);"></i>
                            </div>
                            <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 1.1rem; font-weight: 700;">Mesaj Kutusu Boş</h4>
                            <p style="margin: 0; font-size: 0.85rem; max-width: 220px; line-height: 1.5; color: var(--text-secondary);">Operasyon detaylarını konuşmak için ilk mesajı siz gönderin.</p>
                        </div>`;
                } else {
                    chatContainer.innerHTML = window.utils.chat.renderMessageList(messages, currentUid, this.app.state.currentUser);
                }
                
                if (window.lucide) window.lucide.createIcons();
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        });
    }

    renderMessage(message) {
        // Obsolete: Handled by window.utils.chat.renderMessageList
    }

    receiveMessage(adId, from, text) {
        const message = {
            id: Date.now(),
            adId: adId,
            from: from,
            text: text,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.app.state.messages.push(message);

        const chatModal = document.getElementById('chat-modal');
        if (chatModal) {
            this.updateChatUI(message);
        }

        if (window.notificationManager) {
            window.notificationManager.add({
                id: Date.now(),
                type: 'chat',
                text: `💬 ${from}: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`,
                date: Date.now(),
                read: false,
                action: 'openChat',
                adId: adId,
                partnerName: from,
                targetUser: this.app.state.currentUser
            });
        }
    }

    updateChatUI(message) {
        const chatContainer = document.getElementById('chat-messages-container');
        if (!chatContainer) return;

        const isMyMessage = message.from === this.app.state.currentUser;
        const msgHtml = `
            <div style="align-self: ${isMyMessage ? 'flex-end' : 'flex-start'}; 
                        background: ${isMyMessage ? 'linear-gradient(135deg, var(--secondary) 0%, #2980b9 100%)' : 'white'}; 
                        color: ${isMyMessage ? 'white' : '#2c3e50'};
                        padding: 12px 16px; 
                        border-radius: 18px; 
                        max-width: 85%; 
                        box-shadow: ${isMyMessage ? '0 4px 15px rgba(52, 152, 219, 0.2)' : '0 4px 15px rgba(0,0,0,0.04)'};
                        border-${isMyMessage ? 'bottom-right' : 'bottom-left'}-radius: 4px;
                        border: ${isMyMessage ? 'none' : '1px solid rgba(0,0,0,0.04)'};
                        margin-bottom: 4px; 
                        animation: fadeIn 0.3s ease;
                        position: relative;">
                <div style="font-size: 0.9rem; line-height: 1.4; word-wrap: break-word;">${message.text}</div>
                <div style="font-size: 0.65rem; margin-top: 6px; opacity: 0.7; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                    ${message.date} 
                    ${isMyMessage ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </div>
            </div>
        `;
        
        if (chatContainer.querySelector('div[style*="text-align: center"]')) {
            chatContainer.innerHTML = '';
        }
        
        chatContainer.innerHTML += msgHtml;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
};
