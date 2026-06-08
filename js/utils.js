/**
 * PRUVA — Utility Functions
 * 
 * Alt namespace'ler ile organize edilmiştir:
 *   - utils.escapeHTML()       → Güvenlik
 *   - utils.format.*           → Veri formatlama
 *   - utils.dom.*              → DOM işlemleri
 *   - utils.edu.*              → Eğitim modülü
 *   - utils.seedMarketplace()  → Demo veri üretimi
 * 
 * Eski erişim yolları (utils.timeAgo, utils.getTransportIcon vb.) 
 * geriye dönük uyumluluk için korunmuştur.
 */

window.utils = {

    // ─────────────────────────────────────────
    // Security
    // ─────────────────────────────────────────

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        let escaped = div.innerHTML;
        return escaped.replace(/[()]/g, m => m === '(' ? '&#40;' : '&#41;');
    },

    normalizeText(text) {
        if (!text) return "";
        return text.toString()
            .replace(/İ/g, "i")
            .replace(/I/g, "ı")
            .toLowerCase()
            .trim();
    },


    // ─────────────────────────────────────────
    // Format — Veri Formatlama
    // ─────────────────────────────────────────

    format: {
        adNumber(id) {
            if (!id) return 'N/A';
            const idStr = id.toString();
            const suffix = idStr.length > 6 ? idStr.slice(-6) : idStr.padStart(6, '0');
            return `PRV-${suffix}`;
        },

        timeAgo(timestamp) {
            if (!timestamp || timestamp === window.i18n.t('utils.time.now') || timestamp === 'Şimdi') return window.i18n.t('utils.time.now');
            const diff = Date.now() - timestamp;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (seconds < 30) return window.i18n.t('utils.time.now');
            if (seconds < 60) return window.i18n.t('utils.time.seconds_ago').replace('${seconds}', seconds);
            if (minutes < 60) return window.i18n.t('utils.time.minutes_ago').replace('${minutes}', minutes);
            if (hours < 24) return window.i18n.t('utils.time.hours_ago').replace('${hours}', hours);
            if (days < 7) return window.i18n.t('utils.time.days_ago').replace('${days}', days);
            return new Date(timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        },

        timeRemaining(expiryDate) {
            if (!expiryDate) return window.i18n.t('utils.time.indefinite');
            const diff = expiryDate - Date.now();
            if (diff <= 0) return window.i18n.t('utils.time.expired');

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours >= 24) {
                const days = Math.floor(hours / 24);
                return window.i18n.t('utils.time.days_hours_left').replace('${days}', days).replace('${hours}', hours % 24);
            }
            return window.i18n.t('utils.time.hours_minutes_left').replace('${hours}', hours).replace('${minutes}', minutes);
        },

        cbm(w, l, h, q) {
            return ((w * l * h * q) / 1000000).toFixed(2);
        },

        subscriptionStatus(state) {
            const type = state.subscriptionType || 'none';
            const expiresAt = state.subscriptionExpiresAt;
            if (type === 'none' || !expiresAt) return 'none';
            const diff = new Date(expiresAt) - new Date();
            return diff <= 0 ? 'none' : type;
        },
    },

    // Backward compatibility aliases (plain proxies, not getters)
    formatAdNumber(...args)       { return this.format.adNumber(...args); },
    timeAgo(...args)              { return this.format.timeAgo(...args); },
    formatTimeRemaining(...args)  { return this.format.timeRemaining(...args); },
    calculateCBM(...args)         { return this.format.cbm(...args); },
    getSubscriptionStatus(...args){ return this.format.subscriptionStatus(...args); },


    // ─────────────────────────────────────────
    // Icons
    // ─────────────────────────────────────────

    getTransportIcon(type) {
        const icons = {
            sea: '<i data-lucide="ship"></i>',
            land: '<i data-lucide="truck"></i>',
            air: '<i data-lucide="plane"></i>'
        };
        return icons[type] || '<i data-lucide="package"></i>';
    },


    // ─────────────────────────────────────────
    // DOM — DOM İşlemleri
    // ─────────────────────────────────────────

    dom: {
        initAutocomplete(inputId, resultsId, data) {
            const input = document.getElementById(inputId);
            const results = document.getElementById(resultsId);
            if (!input || !results) return;

            input.addEventListener('input', (e) => {
                const val = e.target.value;
                results.innerHTML = '';
                if (!val.trim()) {
                    results.style.display = 'none';
                    return;
                }

                const valNorm = window.utils.normalizeText(val);
                const matches = data.filter(item => window.utils.normalizeText(item).includes(valNorm)).slice(0, 10);
                if (matches.length > 0) {
                    matches.forEach(match => {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.innerText = match;
                        div.onclick = () => {
                            input.value = match;
                            results.style.display = 'none';
                            if (input.name === 'origin' || input.name === 'destination') {
                                window.utils.dom.updateFormFields(input.name, match);
                            }
                        };
                        results.appendChild(div);
                    });
                    results.style.display = 'block';
                } else {
                    results.style.display = 'none';
                }
            });

            document.addEventListener('click', (e) => {
                if (e.target !== input && results) results.style.display = 'none';
            });
        },

        updateFormFields(fieldName, value) {
            if (fieldName !== 'incoterm') return;

            const originLabel = document.getElementById('lbl-origin');
            const destLabel = document.getElementById('lbl-dest');
            if (!originLabel) return;

            const logic = {
                port: { list: ['FOB', 'CIF', 'CFR', 'FAS'], labels: [window.i18n.t('utils.incoterm.port_loading'), window.i18n.t('utils.incoterm.port_discharge')] },
                door: { list: ['EXW', 'FCA'], labels: [window.i18n.t('utils.incoterm.place_loading'), window.i18n.t('utils.incoterm.port_destination')] },
                full: { list: ['DAP', 'DDP', 'DPU'], labels: [window.i18n.t('utils.incoterm.point_origin'), window.i18n.t('utils.incoterm.delivery_door')] }
            };

            const category = Object.values(logic).find(l => l.list.includes(value)) || logic.full;
            originLabel.innerText = category.labels[0];
            destLabel.innerText = category.labels[1];
        },

        showImageModal(fileUrl, title = window.i18n.t('utils.file.preview')) {
            const isPDF = fileUrl.startsWith('data:application/pdf') || fileUrl.toLowerCase().endsWith('.pdf');
            const modal = document.createElement('div');
            modal.id = 'image-preview-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.95); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                animation: fadeIn 0.2s ease; backdrop-filter: blur(8px);
            `;

            const getBlobUrl = (dataUrl) => {
                if (!dataUrl.startsWith('data:')) return dataUrl;
                try {
                    const parts = dataUrl.split(';base64,');
                    const contentType = parts[0].split(':')[1];
                    const raw = window.atob(parts[1]);
                    const uInt8Array = new Uint8Array(raw.length);
                    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
                    const blob = new Blob([uInt8Array], { type: contentType });
                    return URL.createObjectURL(blob);
                } catch (e) {
                    console.error('Blob conversion failed', e);
                    return dataUrl;
                }
            };

            const activeUrl = getBlobUrl(fileUrl);
            
            modal.innerHTML = `
                <div style="width: 100%; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; color: white; background: #1a1a1a; border-bottom: 1px solid #333;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.5rem;">${isPDF ? '📄' : '🖼️'}</span>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; letter-spacing: -0.5px;">${title}</h3>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <a href="${activeUrl}" target="_blank" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; text-decoration: none;">${window.i18n.t('utils.file.fullscreen')}</a>
                        <a href="${activeUrl}" download="${title.replace(/\s+/g, '_')}${isPDF ? '.pdf' : '.png'}" style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; text-decoration: none;">${window.i18n.t('utils.file.download')}</a>
                        <button id="close-modal-btn" style="background: #444; border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin-left: 10px;">&times;</button>
                    </div>
                </div>
                <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; position: relative;">
                    ${isPDF ? `
                        <iframe src="${activeUrl}" width="100%" height="100%" style="border: none;"></iframe>
                    ` : `
                        <img src="${activeUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    `}
                </div>
            `;
            
            const closeModal = () => {
                if (activeUrl.startsWith('blob:')) URL.revokeObjectURL(activeUrl);
                modal.remove();
            };

            modal.querySelector('#close-modal-btn').onclick = closeModal;
            modal.onclick = (e) => {
                if (e.target.style.width === '100%' && e.target.style.height === '100%') return;
                if (e.target.tagName === 'DIV' && e.target.style.flex === '1') closeModal();
            };

            const escListener = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escListener);
                }
            };
            document.addEventListener('keydown', escListener);
            document.body.appendChild(modal);
        },

        scrollToSection(id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            const links = document.querySelectorAll('.edu-nav-link');
            links.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('href') === `#${id}`) l.classList.add('active');
            });
        },
    },

    // Backward compatibility aliases (plain proxies)
    initAutocomplete(...args)   { return this.dom.initAutocomplete(...args); },
    updateFormFields(...args)   { return this.dom.updateFormFields(...args); },
    showImageModal(...args)     { return this.dom.showImageModal(...args); },
    scrollToSection(...args)    { return this.dom.scrollToSection(...args); },

    // ─────────────────────────────────────────
    // Chat — Mesajlaşma UI
    // ─────────────────────────────────────────

    chat: {
        renderMessageList(messages, currentUid, currentUserName, chatId) {
            let htmlBuffer = '';
            let lastDateStr = null;

            // Build a map of message IDs for quick reply-to lookup
            const msgMap = {};
            messages.forEach(m => { msgMap[m.id] = m; });

            messages.forEach((msg, index) => {
                const isMe = msg.senderId === currentUid || msg.senderName === currentUserName;
                const dateObj = new Date(msg.timestamp);
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Custom Premium Welcoming Card for System Account
                if (msg.senderId === 'system') {
                    const systemContent = `
                        <div class="pruva-system-welcome-card" style="
                            background: var(--bg-surface);
                            border: 1px solid var(--border);
                            border-left: 4px solid var(--secondary);
                            border-radius: 16px;
                            padding: 24px;
                            color: var(--text-primary);
                            font-size: 0.88rem;
                            line-height: 1.6;
                            max-width: 620px;
                            box-shadow: var(--shadow-md);
                            margin: 15px auto;
                            font-family: 'Inter', sans-serif;
                            text-align: left;
                        ">
                            <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 18px;">
                                <div style="width: 42px; height: 42px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(15,23,42,0.15); flex-shrink: 0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-handshake"><path d="m11 17 2 2a1 1 0 0 0 1.4 0l4-4a1 1 0 0 0 0-1.4l-11.4-11.4a2.24 2.24 0 0 0-3.2 0l-1.4 1.4a2.24 2.24 0 0 0 0 3.2z"/><path d="m18 10.1 2.9-2.9a2.24 2.24 0 0 0 0-3.2l-1.4-1.4a2.24 2.24 0 0 0-3.2 0L13.9 5.5"/><path d="m21.3 12.1-4-4"/><path d="m14 16-5.5-5.5"/><path d="m19 17 2 2a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4 0l-2-2"/></svg>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <h4 style="margin: 0; font-size: 1rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.2px;">${window.i18n.t('utils.chat.system.title')}</h4>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 0.62rem; color: #2ecc71; font-weight: 700; background: rgba(46, 204, 113, 0.1); padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                                            <span style="width: 5px; height: 5px; border-radius: 50%; background: #2ecc71; display: inline-block;"></span>
                                            ${window.i18n.t('utils.chat.system.badge')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="welcome-content" style="color: var(--text-secondary); display: flex; flex-direction: column; gap: 14px;">
                                <p style="margin: 0; font-weight: 700; font-size: 1.05rem; color: var(--text-primary); letter-spacing: -0.3px;">${window.i18n.t('utils.chat.system.welcome_title')}</p>
                                <p style="margin: 0;">${window.i18n.t('utils.chat.system.hello')}</p>
                                <p style="margin: 0;">${window.i18n.t('utils.chat.system.welcome_text')}</p>
                                
                                <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin: 5px 0; display: flex; flex-direction: column; gap: 12px;">
                                    <h5 style="margin: 0; color: var(--text-primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                                        ${window.i18n.t('utils.chat.system.what_can_do')}
                                    </h5>
                                    <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem;">
                                        <li style="line-height: 1.5;"><strong style="color: var(--text-primary);">${window.i18n.t('utils.chat.system.for_shippers')}</strong> ${window.i18n.t('utils.chat.system.shippers_text')}</li>
                                        <li style="line-height: 1.5;"><strong style="color: var(--text-primary);">${window.i18n.t('utils.chat.system.for_carriers')}</strong> ${window.i18n.t('utils.chat.system.carriers_text')}</li>
                                    </ul>
                                </div>

                                <div style="background: rgba(243, 156, 18, 0.04); border: 1px solid rgba(243, 156, 18, 0.15); border-radius: 12px; padding: 14px 16px; margin: 5px 0; display: flex; gap: 12px; align-items: flex-start;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        <h5 style="margin: 0; color: #e67e22; font-weight: 700; font-size: 0.85rem;">${window.i18n.t('utils.chat.system.secure_trade')}</h5>
                                        <p style="margin: 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-secondary);">${window.i18n.t('utils.chat.system.secure_trade_text')}</p>
                                    </div>
                                </div>

                                <p style="font-size: 0.78rem; line-height: 1.5; font-style: italic; opacity: 0.85; margin: 5px 0 0 0; border-top: 1px solid var(--border); padding-top: 14px;">
                                    ${window.i18n.t('utils.chat.system.note')}
                                </p>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                    <span style="font-size: 0.72rem; color: var(--text-muted);">${time}</span>
                                    <p style="margin: 0; font-weight: 700; color: var(--text-primary);">${window.i18n.t('utils.chat.system.team')}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    htmlBuffer += `
                        <div class="inbox-message-wrapper is-system-card" style="width: 100%; display: flex; justify-content: center; margin: 15px 0; animation: fadeIn 0.4s ease;">
                            ${systemContent}
                        </div>
                    `;
                    return;
                }

                // System messages (type='system' like status updates)
                if (msg.type === 'system') {
                    htmlBuffer += `
                        <div class="inbox-system-msg">
                            ${window.utils.escapeHTML(msg.text)}
                        </div>
                    `;
                    return;
                }

                // Date Separator
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                let dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
                if (dateObj.getFullYear() !== today.getFullYear()) {
                    dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                }
                if (dateObj.toDateString() === today.toDateString()) {
                    dateStr = window.i18n.t('utils.chat.today');
                } else if (dateObj.toDateString() === yesterday.toDateString()) {
                    dateStr = window.i18n.t('utils.chat.yesterday');
                }

                if (dateStr !== lastDateStr) {
                    htmlBuffer += `
                        <div class="inbox-date-separator">
                            <span>${dateStr}</span>
                        </div>
                    `;
                    lastDateStr = dateStr;
                }

                // Grouping Logic
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                
                const prevDateObj = prevMsg ? new Date(prevMsg.timestamp) : null;
                const nextDateObj = nextMsg ? new Date(nextMsg.timestamp) : null;
                
                const isSameDateAsPrev = prevDateObj && prevDateObj.toDateString() === dateObj.toDateString();
                const isSameDateAsNext = nextDateObj && nextDateObj.toDateString() === dateObj.toDateString();

                const isPrevSameSender = prevMsg && isSameDateAsPrev && ((prevMsg.senderId === msg.senderId) || (prevMsg.senderName === msg.senderName));
                const isNextSameSender = nextMsg && isSameDateAsNext && ((nextMsg.senderId === msg.senderId) || (nextMsg.senderName === msg.senderName));

                let groupClass = '';
                if (!isPrevSameSender && isNextSameSender) groupClass = 'group-start';
                else if (isPrevSameSender && isNextSameSender) groupClass = 'group-middle';
                else if (isPrevSameSender && !isNextSameSender) groupClass = 'group-end';
                else groupClass = 'group-standalone';

                // ── Deleted Message ──
                if (msg.deleted) {
                    htmlBuffer += `
                        <div class="inbox-message-wrapper ${isMe ? 'is-me' : 'is-them'} ${groupClass}">
                            <div class="inbox-message-bubble msg-deleted">
                                <div class="msg-deleted-placeholder">
                                    <i data-lucide="ban" style="width: 14px; height: 14px;"></i>
                                    <span>${window.i18n.t('utils.chat.deleted_msg')}</span>
                                </div>
                                <div class="msg-time-row">
                                    ${time}
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }

                // ── Reply Preview (if this message is a reply to another) ──
                let replyHtml = '';
                if (msg.replyTo && msgMap[msg.replyTo]) {
                    const repliedMsg = msgMap[msg.replyTo];
                    const repliedName = repliedMsg.senderId === currentUid ? window.i18n.t('utils.chat.you') : (repliedMsg.senderName || window.i18n.t('utils.chat.user'));
                    const repliedText = repliedMsg.deleted ? window.i18n.t('utils.chat.deleted_msg') : (repliedMsg.text || window.i18n.t('utils.chat.file'));
                    const truncatedReply = repliedText.length > 80 ? repliedText.substring(0, 80) + '...' : repliedText;
                    replyHtml = `
                        <div class="msg-reply-preview" onclick="window.inboxScrollToMessage && window.inboxScrollToMessage('${msg.replyTo}')">
                            <div class="msg-reply-name">${window.utils.escapeHTML(repliedName)}</div>
                            <div class="msg-reply-text">${window.utils.escapeHTML(truncatedReply)}</div>
                        </div>
                    `;
                }

                // ── Content ──
                let content = `<div class="msg-text-content">${window.utils.escapeHTML(msg.text)}</div>`;
                if (msg.type === 'file') {
                    if (msg.fileType && msg.fileType.startsWith('image/')) {
                        content = `
                            <div class="msg-image-wrapper" onclick="window.utils.showImageModal('${msg.fileUrl}', '${window.utils.escapeHTML(msg.fileName || window.i18n.t('utils.chat.image'))}')">
                                <img src="${msg.fileUrl}" alt="${window.i18n.t('utils.chat.image')}" class="msg-image" loading="lazy" />
                                <span class="msg-image-name">${window.utils.escapeHTML(msg.fileName)}</span>
                            </div>
                        `;
                    } else {
                        content = `
                            <a href="${msg.fileUrl}" target="_blank" class="msg-file-link">
                                <i data-lucide="file-text" style="width: 20px; height: 20px;"></i>
                                <div class="msg-file-info">
                                    <span class="msg-file-name">${window.utils.escapeHTML(msg.fileName)}</span>
                                    <span class="msg-file-type">${msg.fileType || window.i18n.t('utils.chat.file')}</span>
                                </div>
                                <i data-lucide="download" style="width: 16px; height: 16px; opacity: 0.6;"></i>
                            </a>
                        `;
                    }
                }

                // ── Reactions Bar ──
                let reactionsHtml = '';
                if (msg.reactions && Object.keys(msg.reactions).length > 0) {
                    const emojiCounts = {};
                    let myReaction = null;
                    for (const [uid, emoji] of Object.entries(msg.reactions)) {
                        if (!emojiCounts[emoji]) emojiCounts[emoji] = { count: 0, isMine: false };
                        emojiCounts[emoji].count++;
                        if (uid === currentUid) {
                            emojiCounts[emoji].isMine = true;
                            myReaction = emoji;
                        }
                    }
                    
                    let chips = '';
                    for (const [emoji, data] of Object.entries(emojiCounts)) {
                        chips += `
                            <button class="msg-reaction-chip ${data.isMine ? 'is-mine' : ''}" 
                                    onclick="window.inboxToggleReaction('${chatId}', '${msg.id}', '${emoji}')"
                                    title="${data.count} ${window.i18n.t('utils.chat.reacted')}">
                                <span>${emoji}</span>
                                ${data.count > 1 ? `<span class="reaction-count">${data.count}</span>` : ''}
                            </button>
                        `;
                    }
                    reactionsHtml = `<div class="msg-reactions-bar">${chips}</div>`;
                }

                // ── Read Receipt (only for own messages) ──
                let readReceiptHtml = '';
                if (isMe) {
                    const isRead = msg.isRead;
                    // Double checkmark SVG
                    if (isRead) {
                        readReceiptHtml = `
                            <span class="msg-read-receipt is-read" title="${window.i18n.t('utils.chat.read')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 6 7 17 2 12"></polyline><polyline points="23 6 12 17" style="opacity:1"></polyline></svg>
                            </span>
                        `;
                    } else {
                        readReceiptHtml = `
                            <span class="msg-read-receipt" title="${window.i18n.t('utils.chat.sent')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </span>
                        `;
                    }
                }

                // ── Edited Badge ──
                const editedBadge = msg.edited ? `<span class="msg-edited-badge">${window.i18n.t('utils.chat.edited')}</span>` : '';

                // ── Hover Action Bar ──
                const safeMsgId = msg.id;
                const safeText = msg.text ? msg.text.replace(/'/g, "\\'").replace(/\n/g, "\\n") : '';
                
                const actionHtml = `
                    <div class="inbox-message-actions" data-msg-id="${safeMsgId}">
                        <button class="inbox-action-btn" onclick="window.inboxSetReplyTo('${safeMsgId}', '${window.utils.escapeHTML(msg.senderName || '')}', '${safeText.substring(0, 50)}')" title="${window.i18n.t('utils.chat.reply')}">
                            <i data-lucide="reply" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="inbox-action-btn" onclick="window.inboxShowReactionPicker(event, '${chatId}', '${safeMsgId}')" title="${window.i18n.t('utils.chat.react')}">
                            <i data-lucide="smile-plus" style="width: 14px; height: 14px;"></i>
                        </button>
                        ${msg.type === 'text' ? `
                        <button class="inbox-action-btn" onclick="navigator.clipboard.writeText(\`${safeText}\`); window.notificationManager?.showToast(window.i18n.t('utils.chat.msg_copied'), 'success');" title="${window.i18n.t('utils.chat.copy')}">
                            <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                        </button>
                        ` : ''}
                        ${isMe && msg.type === 'text' ? `
                        <button class="inbox-action-btn" onclick="window.inboxStartEditMessage('${chatId}', '${safeMsgId}', this)" title="${window.i18n.t('utils.chat.edit')}">
                            <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
                        </button>
                        ` : ''}
                        ${isMe ? `
                        <button class="inbox-action-btn danger" onclick="window.inboxDeleteMessage('${chatId}', '${safeMsgId}')" title="${window.i18n.t('utils.chat.delete')}">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                        ` : ''}
                    </div>
                `;

                // ── Wrapper ──
                const wrapperClass = isMe ? 'is-me' : 'is-them';
                
                htmlBuffer += `
                    <div class="inbox-message-wrapper ${wrapperClass} ${groupClass}" data-msg-id="${safeMsgId}" id="msg-${safeMsgId}">
                        ${!isMe ? actionHtml : ''}
                        
                        <div class="inbox-message-bubble">
                            ${replyHtml}
                            ${content}
                            <div class="msg-time-row">
                                ${editedBadge}
                                ${time}
                                ${readReceiptHtml}
                            </div>
                        </div>

                        ${isMe ? actionHtml : ''}
                    </div>
                    ${reactionsHtml ? `<div class="inbox-message-wrapper ${wrapperClass}" style="margin-top: -4px; margin-bottom: 2px;">${reactionsHtml}</div>` : ''}
                `;
            });
            return htmlBuffer;
        }
    },


    // ─────────────────────────────────────────
    // Campus — Eğitim Merkezi Pazaryeri
    // ─────────────────────────────────────────

    campus: {
        setCampusView(mode) {
            if (!window.app?.state) return;
            window.app.state.campusViewMode = mode;
            if (window.app.store) window.app.store.save();
            window.app.router.render();
            window.scrollTo(0, 0);
        },

        setCampusCategory(catId) {
            if (!window.app?.state) return;
            window.app.state.campusCategory = catId;
            if (window.app.store) window.app.store.save();
            window.app.router.render();
        },

        viewCampusProduct(productId) {
            if (!window.app?.state) return;
            window.app.state.campusSelectedProduct = productId;
            this.setCampusView('product_detail');
        },

        addToLibrary(productId) {
            if (!window.app?.state) return;
            const state = window.app.state;
            if (!state.campusLibrary) state.campusLibrary = [];
            
            if (!state.campusLibrary.includes(productId)) {
                state.campusLibrary.push(productId);
                if (window.notificationManager) {
                    window.notificationManager.showToast('Kütüphanenize eklendi!', 'success');
                }
                if (window.app.store) window.app.store.save();
                window.app.router.render();
            }
        }
    },

    // Backward compatibility & global access aliases
    setCampusView(...args)   { return this.campus.setCampusView(...args); },
    setCampusCategory(...args) { return this.campus.setCampusCategory(...args); },
    viewCampusProduct(...args) { return this.campus.viewCampusProduct(...args); },
    addToLibrary(...args)    { return this.campus.addToLibrary(...args); },


    // ─────────────────────────────────────────
    // Marketplace Seeding
    // ─────────────────────────────────────────

    seedMarketplace(app, count = 100) {
        if (!app?.state || !app.store) return;
        const ports = window.logisticsKnowledge.getAllPorts();
        const incoterms = ["EXW", "FCA", "FOB", "CIF", "CPT", "CIP", "DAP", "DDP"];
        const transports = ["sea", "land", "air"];
        const goods = window.logisticsKnowledge.goodsCategories;
        const cargoTypes = ["Parsiyel", "Konteyner", "Komple"];
        const durations = [24, 48, 72, 168];

        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        
        for (let i = 0; i < count; i++) {
            const origin = pick(ports);
            let destination = pick(ports);
            while (destination === origin) destination = pick(ports);
            
            const duration = pick(durations);
            const createdAt = Date.now() - (Math.random() * duration * 0.8 * 60 * 60 * 1000);
            const expiryDate = createdAt + (duration * 60 * 60 * 1000);

            app.state.ads.push({
                id: Date.now() + i,
                title: `${pick(goods)} ${window.i18n.t('utils.demo.shipment')}`,
                origin,
                destination,
                transport: pick(transports),
                incoterm: pick(incoterms),
                status: Math.random() > 0.8 ? 'bidded' : 'pending',
                deadline: new Date(Date.now() + (Math.random() * 30 + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                cargoType: pick(cargoTypes),
                goodsType: pick(goods),
                weight: Math.floor(Math.random() * 5000) + 100 + " kg",
                totalCBM: (Math.random() * 20).toFixed(2),
                bids: [],
                owner: window.i18n.t('utils.demo.user'),
                isStackable: Math.random() > 0.5,
                createdAt,
                durationHours: duration,
                expiryDate,
            });
        }
        app.store.save();
    },

    emptyState(icon, message, btnText = '', btnAction = '') {
        return `
            <div class="empty-state-flat" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; text-align:center;">
                <i data-lucide="${icon || 'package'}" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <p style="color: var(--text-secondary); font-size: 0.95rem; text-align: center; max-width: 320px; margin: 0 0 16px;">${message}</p>
                ${btnText ? `<button class="btn-primary btn-sm" onclick="${btnAction}">${btnText}</button>` : ''}
            </div>
        `;
    },

    openModal(html) {
        const modalId = 'modal-' + Math.random().toString(36).substr(2, 9);
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display:flex; align-items:center; justify-content:center; z-index:9999;';
        modal.innerHTML = `
            <div class="modal-content" style="border-radius:16px; padding:30px; animation:modalFadeIn 0.3s ease; position:relative;">
                ${html}
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) window.lucide.createIcons();
        return modalId;
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    },

    toast(message, type = 'info') {
        if (window.notificationManager?.showToast) {
            window.notificationManager.showToast(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    },

    toggleButtonLoading(button, isLoading, originalText, loadingText = window.i18n.t('utils.button.loading')) {
        if (!button) return;
        button.disabled = isLoading;
        button.innerHTML = isLoading 
            ? `<div style="display:inline-flex; align-items:center; gap:8px;">
                <div class="spinner-sm" style="width:14px; height:14px; border:2px solid var(--border); border-top:2px solid currentColor; border-radius:50%; animation:spin 1s linear infinite;"></div>
                <span>${loadingText}</span>
               </div>` 
            : originalText;
    },

    renderAdCard(ad, options = {}) {
        const bidCount = (ad.bids || []).filter(b => !b.isGhost).length;
        const timeRemaining = window.utils.formatTimeRemaining(ad.expiryDate);
        const transportIcon = window.utils.getTransportIcon(ad.transport);
        const adNumber = window.utils.formatAdNumber(ad.id);
        const cargoType = ad.cargoType || 'Komple';
        const incoterm = ad.incoterm || 'FOB';

        const hasBidsClass = bidCount > 0 ? 'has-bids' : '';
        const customStyle = options.customStyle || '';
        const customClass = options.customClass || '';
        const onclick = options.onclick || `window.marketplaceManager.toggleAd('${ad.id}')`;
        const rightStatusHTML = options.rightStatusHTML || `
            <div class="dash-ad-status-box">
                <div class="dash-ad-label">${window.i18n.t('utils.ad.time_left')}</div>
                <div class="dash-ad-value" style="color: ${ad.expiryDate && ad.expiryDate < Date.now() ? '#ff4d4f' : '#e67e22'}; font-weight: 700;">
                    ${timeRemaining}
                </div>
            </div>
        `;
        const footerHTML = options.footerHTML || '';

        return `
            <div class="card dash-ad-card ${hasBidsClass} ${customClass}" style="${customStyle}">
                <div class="dash-ad-main" onclick="${onclick}">
                    <div class="dash-ad-info">
                        <div class="dash-ad-icon">
                            ${transportIcon}
                        </div>
                        <div>
                            <h4 class="dash-ad-title">
                                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 400; margin-right: 8px;">${adNumber}</span>
                                ${ad.origin} ➔ ${ad.destination}
                            </h4>
                            <div class="dash-ad-meta">
                                ${cargoType} • ${incoterm} • <span style="color: var(--secondary); font-weight: 600;">${bidCount} ${window.i18n.t('utils.ad.bids')}</span>
                            </div>
                        </div>
                    </div>
                    ${rightStatusHTML}
                </div>
                ${footerHTML}
            </div>
        `;
    },

    renderFreeTimeWidget(ad) {
        if (!ad || !ad.portArrivalDate) return '';

        // Free time days (from ad.acceptedBid.freeTime or default 7)
        let freeTimeDays = 7;
        if (ad.acceptedBid && ad.acceptedBid.freeTime) {
            const match = ad.acceptedBid.freeTime.match(/\d+/);
            if (match) freeTimeDays = parseInt(match[0]);
        }

        const elapsedMs = Date.now() - ad.portArrivalDate;
        const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        const remainingDays = freeTimeDays - elapsedDays;
        const isExpired = remainingDays < 0;

        let widgetHtml = '';
        
        if (!isExpired) {
            // Active Free Time (Green / Yellow)
            const pct = Math.max(0, Math.min(100, (remainingDays / freeTimeDays) * 100));
            const color = remainingDays <= 2 ? '#f1c40f' : '#2ecc71';
            widgetHtml = `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-dim); border-radius: 12px; padding: 15px; grid-column: 1 / -1; margin-top: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.01);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                            <i data-lucide="clock" style="width: 16px; height: 16px; color: ${color};"></i> Liman/Gümrük Serbest Süresi (Free Time)
                        </span>
                        <span style="font-size: 0.85rem; font-weight: 800; color: ${color};">${remainingDays} Gün Kalan (Cezasız)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border-dim); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                        <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                        <span>Giriş Tarihi: ${new Date(ad.portArrivalDate).toLocaleDateString('tr-TR')}</span>
                        <span>Toplam Serbest Süre: ${freeTimeDays} Gün</span>
                    </div>
                </div>
            `;
        } else {
            // Expired (Red / Demurrage active!)
            const overdueDays = Math.abs(remainingDays);
            const demurrageFee = overdueDays * 150;
            widgetHtml = `
                <div style="background: #fff5f5; border: 1px solid #ffccc7; border-radius: 12px; padding: 15px; grid-column: 1 / -1; margin-top: 12px; box-shadow: 0 4px 10px rgba(255, 77, 79, 0.05); animation: pulseRed 2s infinite;">
                    <style>
                        @keyframes pulseRed {
                            0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.2); }
                            70% { box-shadow: 0 0 0 6px rgba(255, 77, 79, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
                        }
                    </style>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: #ff4d4f; display: flex; align-items: center; gap: 6px;">
                            <i data-lucide="alert-triangle" style="width: 18px; height: 18px; color: #ff4d4f; fill: #ff4d4f15;"></i> 🚨 DEMORAJ UYARISI: Serbest Süre Doldu!
                        </span>
                        <span style="font-size: 0.85rem; font-weight: 800; color: #ff4d4f;">${overdueDays} Gün Gecikme</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #ffccc7; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                        <div style="width: 100%; height: 100%; background: #ff4d4f; border-radius: 4px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.72rem; color: #ff4d4f; font-weight: 600;">
                            Günlük Ceza: $150 | Toplam Serbest Süre: ${freeTimeDays} Gün
                        </div>
                        <div style="font-size: 0.95rem; font-weight: 800; color: #ff4d4f; background: rgba(255, 77, 79, 0.1); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255, 77, 79, 0.2);">
                            Biriken Ceza: $${demurrageFee}
                        </div>
                    </div>
                </div>
            `;
        }
        return widgetHtml;
    }
};


// ─────────────────────────────────────────
// Mobile Navigation Toggle
// ─────────────────────────────────────────
window.toggleMobileNav = function() {
    const btn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');
    
    if (!btn || !overlay || !drawer) return;

    const isOpen = drawer.classList.contains('active');

    if (isOpen) {
        btn.classList.remove('active');
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
        // Allow overlay to fade then hide
        setTimeout(() => {
            if (!drawer.classList.contains('active')) {
                overlay.style.display = '';
            }
        }, 350);
    } else {
        overlay.style.display = 'block';
        btn.classList.add('active');
        // Small delay for CSS transition
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            drawer.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
    }

    // Re-render Lucide icons in drawer
    if (window.lucide?.createIcons) {
        setTimeout(() => window.lucide.createIcons(), 50);
    }
};

