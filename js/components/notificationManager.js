window.NotificationManager = class NotificationManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.alertInterval = null;
        
        // Dışarı tıklanınca bildirim çubuğunu kapat
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notification-dropdown');
            const wrapper = e.target.closest('.notification-wrapper');
            if (dropdown && dropdown.style.display === 'block' && !wrapper) {
                dropdown.style.display = 'none';
            }
        });

        // Proaktif taramayı başlat
        this.startProactiveScanning();
    }

    // --- PROAKTİF ZEKA ---
    startProactiveScanning() {
        if (this.alertInterval) clearInterval(this.alertInterval);
        
        // Her 2 dakikada bir state'i tara
        this.alertInterval = setInterval(() => {
            this.checkProactiveAlerts();
        }, 120000);
        
        // İlk açılışta bir kez tara
        setTimeout(() => this.checkProactiveAlerts(), 5000);
    }

    checkProactiveAlerts() {
        if (!this.app || !this.app.state) return;
        const state = this.app.state;
        const now = new Date();

        // 1. Süresi Azalan İlanlar (Loader için)
        if (state.userRole === 'loader') {
            state.ads.filter(ad => ad.owner === state.currentUser && ad.status === 'pending').forEach(ad => {
                const deadline = new Date(ad.deadline);
                const diffHours = (deadline - now) / (1000 * 60 * 60);
                
                if (diffHours > 0 && diffHours < 24) {
                    this.addUnique({
                        id: `deadline-${ad.id}`,
                        type: 'alert',
                        text: `⚠️ ${window.i18n.t('comp.notification.critical_prefix')}: "${ad.origin} - ${ad.destination}" ${window.i18n.t('comp.notification.ad_expiring')}`,
                        subtext: window.i18n.t('comp.notification.select_bid_now'),
                        action: 'viewBids',
                        adId: ad.id,
                        view: 'loader-dashboard',
                        priority: 'high'
                    });
                }
            });

            // Teklif bekleyen ilanlar
            state.ads.filter(ad => ad.owner === state.currentUser && ad.status === 'pending' && (!ad.bids || ad.bids.length === 0)).forEach(ad => {
                const created = new Date(ad.id); // id = Date.now() at creation
                const hoursSinceCreated = (now - created) / (1000 * 60 * 60);
                if (hoursSinceCreated > 48) {
                    this.addUnique({
                        id: `nobid-${ad.id}`,
                        type: 'info',
                        text: `📭 "${ad.origin} → ${ad.destination}" ${window.i18n.t('comp.notification.no_bids_yet')}`,
                        subtext: window.i18n.t('comp.notification.review_price_route'),
                        view: 'loader-dashboard',
                        priority: 'low'
                    });
                }
            });
        }

        // 2. Güncellenmeyen Statüler (Active Shipments)
        state.ads.filter(ad => ad.status === 'accepted').forEach(ad => {
            const isMyJob = (state.userRole === 'carrier' && ad.acceptedBid?.company === state.currentUser) ||
                            (state.userRole === 'loader' && ad.owner === state.currentUser);
            
            if (isMyJob && ad.operationTimeline && ad.operationTimeline.length > 0) {
                const lastUpdate = ad.operationTimeline[0];
                // "Şimdi" dışındaki güncellemelerin ID bazlı kontrolü
                if (lastUpdate.text !== 'Teslim Edildi' && lastUpdate.text !== 'Teslimat Alıcı Tarafından Onaylandı') {
                    this.addUnique({
                        id: `stale-${ad.id}`,
                        type: 'info',
                        text: `📦 "${ad.origin} → ${ad.destination}" ${window.i18n.t('comp.notification.status_update_expected')}`,
                        subtext: `${window.i18n.t('comp.notification.last_status')}: ${lastUpdate.text}`,
                        view: state.userRole === 'carrier' ? 'carrier-dashboard' : 'loader-dashboard',
                        priority: 'medium'
                    });
                }
            }
        });

        // 3. Teslim edilmiş ama onaylanmamış yükler (Loader için)
        if (state.userRole === 'loader') {
            state.ads.filter(ad => ad.status === 'delivered' && ad.owner === state.currentUser).forEach(ad => {
                this.addUnique({
                    id: `confirm-${ad.id}`,
                    type: 'success',
                    text: `✅ "${ad.origin} → ${ad.destination}" ${window.i18n.t('comp.notification.delivery_awaiting_approval')}!`,
                    subtext: window.i18n.t('comp.notification.approve_delivery'),
                    action: 'viewBids',
                    adId: ad.id,
                    view: 'loader-dashboard',
                    priority: 'high'
                });
            });
        }
    }

    // --- GÖRÜNÜM (UI) ---
    renderBadge(notifications) {
        const currentUser = this.app?.state?.currentUser;
        const currentRole = this.app?.state?.userRole;
        const unreadCount = notifications.filter(n => 
            !n.read && (
                (n.targetUser && n.targetUser === currentUser) ||
                (n.targetRole && (n.targetRole === currentRole || n.targetRole === 'all')) ||
                (!n.targetUser && !n.targetRole)
            )
        ).length;
        
        if (unreadCount === 0) return '';
        const displayCount = unreadCount > 9 ? '9+' : unreadCount;
        return `<span class="badge pulse" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; padding: 0 4px; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 0 0 2px var(--bg-surface);">${displayCount}</span>`;
    }

    renderDropdown(notifications) {
        const currentUser = this.app?.state?.currentUser;
        const currentRole = this.app?.state?.userRole;
        const myNotifs = notifications.filter(n => 
            (n.targetUser && n.targetUser === currentUser) ||
            (n.targetRole && (n.targetRole === currentRole || n.targetRole === 'all')) ||
            (!n.targetUser && !n.targetRole)
        );

        const unreadCount = myNotifs.filter(n => !n.read).length;
        const displayNotifs = myNotifs.slice(0, 15);

        // Dropdown Header
        let html = `
            <div class="notif-header">
                <div>
                    <strong data-i18n="comp.notification.notifications">Bildirimler</strong>
                    ${unreadCount > 0 ? `<span class="notif-unread-badge">${unreadCount} <span data-i18n="comp.notification.new">yeni</span></span>` : ''}
                </div>
                <div class="notif-actions">
                    ${unreadCount > 0 ? `<span class="notif-action-btn read" onclick="event.stopPropagation(); window.notificationManager.markAllAsRead()">✓ <span data-i18n="comp.notification.read_all">Tümünü Oku</span></span>` : ''}
                    ${myNotifs.length > 0 ? `<span class="notif-action-btn clear" onclick="event.stopPropagation(); window.notificationManager.clearAll()">🗑 <span data-i18n="comp.notification.clear">Temizle</span></span>` : ''}
                </div>
            </div>
        `;

        if (displayNotifs.length === 0) {
            html += `<div class="notif-empty">
                        <div class="notif-empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.5;"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        </div>
                        <div class="notif-empty-title" data-i18n="comp.notification.no_notifications">Bildiriminiz Yok</div>
                        <div class="notif-empty-text" data-i18n="comp.notification.new_activities_here">Yeni aktiviteler burada görünecek.</div>
                    </div>`;
            return html;
        }

        // Bildirim grupları: Bugün / Daha Önce
        const now = Date.now();
        const todayNotifs = displayNotifs.filter(n => typeof n.date === 'number' && (now - n.date) < 86400000);
        const olderNotifs = displayNotifs.filter(n => typeof n.date !== 'number' || (now - n.date) >= 86400000);

        if (todayNotifs.length > 0) {
            html += `<div class="notif-group-title" data-i18n="comp.notification.today">Bugün</div>`;
            html += todayNotifs.map(n => this._renderNotifItem(n)).join('');
        }

        if (olderNotifs.length > 0) {
            html += `<div class="notif-group-title" data-i18n="comp.notification.earlier">Daha Önce</div>`;
            html += olderNotifs.map(n => this._renderNotifItem(n)).join('');
        }

        if (myNotifs.length > 15) {
            html += `<div class="notif-footer-link"><span data-i18n="comp.notification.see_all">Tüm Bildirimleri Gör</span> (${myNotifs.length})</div>`;
        }

        return html;
    }

    _renderNotifItem(n) {
        const typeConfig = {
            match:   { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', color: 'var(--success)', label: window.i18n.t('comp.notification.type_match') },
            chat:    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', color: 'var(--secondary)', label: window.i18n.t('comp.notification.type_chat') },
            alert:   { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>', color: 'var(--warning)', label: window.i18n.t('comp.notification.type_alert') },
            success: { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>', color: 'var(--success)', label: window.i18n.t('comp.notification.type_success') },
            info:    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', color: 'var(--accent)', label: window.i18n.t('comp.notification.type_info') }
        };

        const config = typeConfig[n.type] || { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>', color: 'var(--secondary)', label: window.i18n.t('comp.notification.type_notification') };
        const timeText = typeof n.date === 'number' ? window.utils.timeAgo(n.date) : (n.date || window.i18n.t('comp.notification.now'));

        return `
        <div class="notif-item ${n.read ? '' : 'unread'}" 
             onclick="event.stopPropagation(); window.notificationManager.handleInteraction('${n.id}')">
            
            ${!n.read ? `<div class="notif-item-indicator" style="background: ${config.color}"></div>` : ''}
            
            <div class="notif-item-icon-wrapper" style="background: ${n.read ? '#f4f5f7' : config.color + '15'}">
                ${config.icon}
            </div>
            <div class="notif-item-content">
                <div class="notif-item-text">${n.text}</div>
                ${n.subtext ? `<div class="notif-item-subtext">${n.subtext}</div>` : ''}
                <div class="notif-item-footer">
                    <div class="notif-item-time">${timeText}</div>
                    ${!n.read ? `<div class="notif-item-type-badge" style="color: ${config.color}; background: ${config.color}10;">${config.label}</div>` : ''}
                </div>
                
                ${!n.read && n.action ? `
                    <div class="notif-item-buttons">
                        <button class="btn-primary" style="background: ${config.color}; padding: 5px 14px; font-size: 0.7rem;" data-i18n="comp.notification.review_now">Hemen İncele</button>
                        <button class="btn-outline" style="padding: 5px 14px; font-size: 0.7rem; color: #718096; border-color: #e2e8f0;" onclick="event.stopPropagation(); window.notificationManager.markAsRead('${n.id}')" data-i18n="comp.notification.close">Kapat</button>
                    </div>
                ` : ''}
            </div>
        </div>
        `;
    }

    showToast(text, type = 'match') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Tip bazlı renk ve ikon
        const toastConfig = {
            match:   { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', color: 'var(--success)', label: window.i18n.t('comp.notification.label_match') },
            chat:    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', color: 'var(--secondary)', label: window.i18n.t('comp.notification.label_chat') },
            alert:   { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>', color: 'var(--warning)', label: window.i18n.t('comp.notification.label_alert') },
            success: { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>', color: 'var(--success)', label: window.i18n.t('comp.notification.label_success') },
            info:    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', color: 'var(--accent)', label: window.i18n.t('comp.notification.label_info') }
        };
        const config = toastConfig[type] || { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>', color: 'var(--secondary)', label: window.i18n.t('comp.notification.label_notification') };

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeftColor = config.color;
        
        toast.innerHTML = `
            <div class="toast-icon">${config.icon}</div>
            <div class="toast-content">
                <div class="toast-label" style="color: ${config.color}">${config.label}</div>
                <div class="toast-message">${text}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateX(50px)'; setTimeout(() => this.parentElement.remove(), 300)">✕</div>
        `;

        container.appendChild(toast);
        this.playSound(type);

        // Uyarılar 7 saniye, diğerleri 5 saniye
        const duration = type === 'alert' ? 7000 : 5000;
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 500);
            }
        }, duration);
    }

    playSound(type = 'match') {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            // Tip bazlı ses tonu
            if (type === 'alert') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
                oscillator.frequency.setValueAtTime(400, audioCtx.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
            } else if (type === 'chat') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
            } else {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
            }
            
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.12);
        } catch (e) {
            // Ses çalınamazsa sessizce devam et
        }
    }

    // --- MANTIK (LOGIC) ---
    toggle() {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;

        const isVisible = dropdown.style.display === 'block';
        if (!isVisible) {
            this.refreshDropdown();
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    refreshDropdown() {
        const container = document.getElementById('notification-dropdown');
        if (container && this.app) {
            // Header artık renderDropdown içinde oluşturuluyor
            container.innerHTML = this.renderDropdown(this.app.state.notifications);
        }
    }

    markAsRead(id) {
        if (!this.app) return;
        const notification = this.app.state.notifications.find(n => String(n.id) === String(id));
        if (notification) {
            notification.read = true;
            this.app.store.save();
            this.app.router.updateNav();
            this.refreshDropdown();
        }
    }

    markAllAsRead() {
        if (!this.app) return;
        this.app.state.notifications.forEach(n => n.read = true);
        this.app.store.save();
        this.app.router.updateNav();
        this.refreshDropdown();
    }

    clearAll() {
        if (!this.app) return;
        if (!confirm(window.i18n.t('comp.notification.confirm_clear_all'))) return;
        this.app.state.notifications = [];
        this.app.store.save();
        this.app.router.updateNav();
        this.refreshDropdown();
    }

    handleInteraction(id) {
        if (!this.app) return;
        const n = this.app.state.notifications.find(item => String(item.id) === String(id));
        if (!n) return;

        n.read = true;
        this.app.store.save();
        this.app.router.updateNav();
        this.refreshDropdown();

        // Dropdown'u kapat
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // Önce doğru sayfaya git
        if (n.view) {
            this.app.router.navigate(n.view);
        }

        // Action'a göre ek işlem yap
        if (n.action === 'openChat' && n.adId) {
            const ad = this.app.state.ads.find(a => String(a.id) === String(n.adId));
            const partnerName = n.partnerName || (ad ? ad.owner : window.i18n.t('comp.notification.ad_owner'));
            if (window.chatManager) {
                setTimeout(() => {
                    window.chatManager.toggleChat(true, n.adId, partnerName);
                }, 100);
            }

        } else if (n.action === 'viewAd' && n.adId) {
            // Taşıyıcı: Marketplace'e git ve ilanı aç
            this.app.state.currentView = 'marketplace';
            this.app.state.expandedAdId = n.adId;
            this.app.router.navigate('marketplace');
            // Render sonrası ilanı scroll'a al
            setTimeout(() => {
                const card = document.querySelector(`.ticket-card.expanded`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);

        } else if (n.action === 'viewBids' && n.adId) {
            // Loader: Açık ilanlar tabına git ve ilanı aç
            this.app.state.loaderActiveTab = 'open-ads';
            this.app.state.expandedAdId = n.adId;
            this.app.router.render();

        } else if (n.view === 'carrier-dashboard' && n.adId) {
            // Taşıyıcı dashboard: İlgili tab'a ve ilana git
            const ad = this.app.state.ads.find(a => String(a.id) === String(n.adId));
            if (ad) {
                if (ad.status === 'completed') {
                    this.app.state.carrierActiveTab = 'completed';
                } else if (ad.status === 'accepted' || ad.status === 'delivered') {
                    this.app.state.carrierActiveTab = 'won-shipments';
                } else {
                    this.app.state.carrierActiveTab = 'my-bids';
                }
                this.app.state.expandedAdId = n.adId;
                this.app.router.render();
            }

        } else if (n.view === 'loader-dashboard' && n.adId && !n.action) {
            // Loader dashboard: İlgili tab'a git
            const ad = this.app.state.ads.find(a => String(a.id) === String(n.adId));
            if (ad) {
                if (ad.status === 'completed') {
                    this.app.state.loaderActiveTab = 'completed';
                } else if (ad.status === 'accepted' || ad.status === 'delivered') {
                    this.app.state.loaderActiveTab = 'active-shipments';
                } else {
                    this.app.state.loaderActiveTab = 'open-ads';
                }
                this.app.state.expandedAdId = n.adId;
                this.app.router.render();
            }
        }
    }

    add(notif) {
        if (!this.app || !this.app.state) return;
        if (!notif.targetUser && !notif.targetRole) {
            notif.targetUser = this.app.state.currentUser;
        }
        notif.id = notif.id || Date.now();
        notif.date = typeof notif.date === 'number' ? notif.date : Date.now();
        notif.read = false;

        // Bildirim gruplaması: Aynı ilan için aynı tipte bildirim varsa güncelle
        if (notif.adId && notif.type === 'match') {
            const existingIdx = this.app.state.notifications.findIndex(
                n => n.adId === notif.adId && n.type === notif.type && !n.read && n.targetUser === notif.targetUser
            );
            if (existingIdx !== -1) {
                // Mevcut bildirimi güncelle, en üste taşı
                const existing = this.app.state.notifications.splice(existingIdx, 1)[0];
                existing.text = notif.text;
                existing.date = notif.date;
                existing.count = (existing.count || 1) + 1;
                existing.text = `💰 ${window.i18n.t('comp.notification.new_bids_prefix')} ${existing.count} ${window.i18n.t('comp.notification.new_bids_suffix')}`;
                this.app.state.notifications.unshift(existing);
                this.app.store.save();
                
                const isForMe = this._isForMe(existing);
                if (isForMe) this.showToast(existing.text, existing.type);
                this.app.router.updateNav();
                this.refreshDropdown();
                return;
            }
        }

        this.app.state.notifications.unshift(notif);

        // Bildirim sayısını sınırla (max 50)
        if (this.app.state.notifications.length > 50) {
            this.app.state.notifications = this.app.state.notifications.slice(0, 50);
        }
        
        this.app.store.save();

        const isForMe = this._isForMe(notif);
        if (isForMe) {
            this.showToast(notif.text, notif.type);
        }

        this.app.router.updateNav();
        this.refreshDropdown();
    }

    _isForMe(notif) {
        // 1. Plan Kontrolü (Premium vs Standart Ayrımı)
        if (notif.targetPlan && this.app.state.subscriptionType !== notif.targetPlan) {
            return false;
        }

        // 2. Kullanıcı veya Rol Kontrolü
        return (notif.targetUser === this.app.state.currentUser) || 
               (notif.targetRole === this.app.state.userRole) || 
               (notif.targetRole === 'all') ||
               (!notif.targetUser && !notif.targetRole);
    }

    addUnique(notif) {
        if (this.app.state.notifications.some(n => n.id === notif.id)) return;
        this.add(notif);
    }
};
