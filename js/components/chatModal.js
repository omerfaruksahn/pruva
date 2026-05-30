window.chatModalComponent = (state, adId, partnerName, chatId) => {
    const ad = state.ads.find(a => String(a.id) === String(adId));
    const isSystemChat = adId === 'system';

    return `
    <div id="chat-modal" class="modal-overlay" style="display: flex; animation: fadeIn 0.3s ease; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;" onclick="window.chatManager.toggleChat(false)">
        <div class="modal-content" style="max-width: 480px; width: 95%; height: 85vh; max-height: 700px; display: flex; flex-direction: column; padding: 0; overflow: hidden; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); background: var(--bg-surface); border: 1px solid var(--border);" onclick="event.stopPropagation()">
            
            <!-- Premium Header -->
            <div style="padding: 20px 24px; background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%); color: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); position: relative; overflow: hidden;">
                <!-- Decorative background shapes -->
                <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
                
                <div style="display: flex; align-items: center; gap: 15px; position: relative; z-index: 1;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: white; box-shadow: var(--shadow-sm); border: 2px solid rgba(255,255,255,0.2);">
                        ${isSystemChat ? '<i data-lucide="handshake" style="width: 20px; height: 20px;"></i>' : partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.3px; color: white;">${partnerName}</h3>
                        <div style="display: flex; align-items: center; gap: 6px; opacity: 0.85; font-size: 0.75rem; color: rgba(255, 255, 255, 0.9);">
                            <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--success); box-shadow: 0 0 5px var(--success);"></div>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                                ${isSystemChat ? 'Doğrulanmış Hesap' : (ad ? `İlan: ${ad.origin} ➔ ${ad.destination}` : 'Yük Detayı')}
                            </span>
                        </div>
                    </div>
                </div>
                <button onclick="window.chatManager.toggleChat(false)" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); position: relative; z-index: 1;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
 
            <!-- Sleek Privacy Badge -->
            <div style="background: rgba(245, 158, 11, 0.06); border-bottom: 1px solid rgba(245, 158, 11, 0.12); padding: 10px 20px; display: flex; align-items: center; gap: 10px;">
                <i data-lucide="shield-alert" style="width: 16px; height: 16px; color: var(--warning); flex-shrink: 0;"></i>
                <p style="margin: 0; font-size: 0.75rem; color: var(--warning); line-height: 1.4; font-weight: 500; opacity: 0.95;">
                    Pruva güvenliği için iletişim bilgilerini paylaşmak yasaktır. Platform üzerinden anlaşma sağlandığında iletişim bilgileri otomatik iletilir.
                </p>
            </div>
 
            <!-- Messages Area with Background Pattern -->
            <div id="chat-messages-container" style="flex: 1; padding: 24px 20px; overflow-y: auto; background-color: var(--bg-page); background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 20px 20px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth;">
                <div style="text-align: center; margin-top: auto; margin-bottom: auto; color: var(--text-muted); display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--bg-elevated); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; animation: pulse 2s infinite;">
                        <i data-lucide="message-square" style="width: 22px; height: 22px; color: var(--text-secondary);"></i>
                    </div>
                    <p style="font-size: 0.85rem; font-weight: 500; margin: 0; color: var(--text-secondary);">Bağlantı kuruluyor...</p>
                </div>
            </div>
 
            <!-- Premium Input Area -->
            <div style="padding: 16px 20px 24px; background: var(--bg-surface); border-top: 1px solid var(--border); box-shadow: 0 -4px 20px rgba(0,0,0,0.02);">
                <div style="display: flex; gap: 12px; align-items: flex-end; background: var(--bg-page); border-radius: 20px; padding: 6px 6px 6px 16px; border: 1px solid var(--border); transition: border-color 0.2s ease, box-shadow 0.2s ease;" id="chat-input-wrapper">
                    <textarea id="chat-input" placeholder="Mesajınızı yazın..." style="flex: 1; border: none; background: transparent; padding: 10px 0; font-family: inherit; font-size: 0.9rem; color: var(--text-primary); resize: none; min-height: 24px; max-height: 100px; outline: none; line-height: 1.4;" onfocus="document.getElementById('chat-input-wrapper').style.borderColor='var(--secondary)'; document.getElementById('chat-input-wrapper').style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'" onblur="document.getElementById('chat-input-wrapper').style.borderColor='var(--border)'; document.getElementById('chat-input-wrapper').style.boxShadow='none'" oninput="this.style.height = ''; this.style.height = Math.min(this.scrollHeight, 100) + 'px';" onkeypress="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.chatManager.sendMessage('${chatId}'); }"></textarea>
                    
                    <button style="background: var(--primary-gradient); border: none; color: white; width: 40px; height: 40px; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; flex-shrink: 0;" onclick="window.chatManager.sendMessage('${chatId}')" onmouseover="this.style.transform='scale(1.04)'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                        <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
                <div style="text-align: center; margin-top: 8px;">
                    <span style="font-size: 0.65rem; color: var(--text-muted);">Enter ile gönderin, Shift + Enter ile alt satıra geçin</span>
                </div>
            </div>
        </div>
    </div>
    `;
};
