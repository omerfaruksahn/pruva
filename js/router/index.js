import { VIEW_INIT_MAP } from './viewInit.js';
import { StatusPages } from './statusPages.js';
import { parseUrl, getViewUrl } from './routes.js';

window.Router = class Router {

    constructor(appInstance) {
        this.app = appInstance;
        this._lastRenderedView = null;

        window.addEventListener('popstate', (e) => this._onPopState(e));

        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;

            const href = a.getAttribute('href');
            if (!href) return;

            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#') || href.startsWith('javascript:')) {
                return;
            }

            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

            e.preventDefault();

            if (a.closest('.mobile-nav-drawer') && typeof window.toggleMobileNav === 'function') {
                window.toggleMobileNav();
            }

            this.navigateByPath(href);
        });

        const hash = window.location.hash.slice(1);
        if (hash) {
            if (!hash.startsWith('ad-')) {
                window.location.hash = '';
                const targetView = this.app.views[hash] ? hash : 'home';
                this.navigate(targetView);
            }
        } else {
            const { view, lang, routeParams } = parseUrl(window.location.pathname);
            this.app.state.lang = lang;
            if (routeParams) {
                this.app.state.activeRouteParams = routeParams;
            }
            this.app.state.currentView = view;
        }
    }

    navigate(view) {
        if (!this._canAccessView(view)) {
            if (this.app.state.currentView !== 'home' && view !== 'login') {
                this.navigate('login');
            }
            return;
        }

        this.app.state.currentView = view;
        const lang = this.app.state.lang || 'tr';

        const cleanUrl = getViewUrl(view, lang);
        
        if (window.location.pathname !== cleanUrl) {
            window.history.pushState({ view, lang, routeParams: this.app.state.activeRouteParams }, '', cleanUrl);
        }

        this.render();
        this.updateNav();
        window.scrollTo(0, 0);
    }

    navigateByPath(path) {
        const { view, lang, routeParams } = parseUrl(path);
        
        this.app.state.lang = lang;
        if (routeParams) {
            this.app.state.activeRouteParams = routeParams;
        } else {
            delete this.app.state.activeRouteParams;
        }

        this.navigate(view);
    }

    setLanguage(lang) {
        if (lang !== 'tr' && lang !== 'en') return;
        this.app.state.lang = lang;
        this.navigate(this.app.state.currentView || 'home');
    }

    goToDashboard() {
        const dashMap = {
            loader: 'loader-dashboard',
            carrier: 'carrier-dashboard'
        };
        this.navigate(dashMap[this.app.state.userRole] || 'home');
    }

    render() {
        const root = document.getElementById('app-content');
        if (!root) return;

        const currentUser = this.app.store.getCurrentUser();

        if (this.app.state.isLoggedIn && !currentUser && this.app.state.currentUser !== 'Misafir') {
            console.warn("[ROUTER] User record missing in state for authenticated user.");
            root.innerHTML = `<div style="padding: 40px; text-align: center;">${window.i18n.t('auth.err_user_missing')} <a href="#" onclick="window.app.auth.logout()">${window.i18n.t('auth.logout_relogin')}</a> ${window.i18n.t('auth.try_again')}</div>`;
            return;
        }

        if (currentUser) {
            if (currentUser.status === 'blocked') {
                root.innerHTML = StatusPages.blocked(currentUser);
                return;
            }
            if (currentUser.status === 'pending_approval') {
                root.innerHTML = StatusPages.pending(currentUser);
                return;
            }
            if (currentUser.status === 'rejected') {
                root.innerHTML = StatusPages.rejected(currentUser);
                return;
            }
        }

        const focusState = this._captureFocus();

        const currentView = this.app.state.currentView || 'home';
        
        document.body.className = `view-${currentView}`;
        if (currentView === 'education' && this.app.state.eduViewMode === 'player') {
            document.body.classList.add('view-education-player');
        }
        
        if (window.ThemeManager) {
            window.ThemeManager.apply();
        }

        const viewFn = this.app.views[currentView] || this.app.views.home;
        const isSameView = this._lastRenderedView === currentView;
        
        if (this._lastRenderedView && this._lastRenderedView !== currentView) {
            this._cleanupView(this._lastRenderedView);
        }
        
        this._lastRenderedView = currentView;

        const completeRender = () => {
            try {
                root.innerHTML = viewFn(this.app.state);
            } catch (err) {
                console.error('[VIEW ERROR]', err);
                root.innerHTML = StatusPages.viewError(err.message);
                return;
            }

            this._restoreFocus(focusState);

            const initFn = VIEW_INIT_MAP[currentView];
            if (initFn) initFn(this.app);

            if (window.updateSEO) {
                window.updateSEO(currentView, this.app.state.lang || 'tr');
            }

            if (window.lucide) window.lucide.createIcons();
            if (window.i18n) window.i18n.updateDOM();
        };

        const instantViews = window.CONFIG?.INSTANT_VIEWS || ['home', 'membership', 'lojistik-hizmetleri', 'ithalat-ihracat', 'konteyner-tasimaciligi', 'navlun-hesaplama'];
        if (isSameView || instantViews.includes(currentView)) {
            completeRender();
        } else {
            root.innerHTML = StatusPages.skeleton();
            requestAnimationFrame(() => completeRender());
        }
    }

    updateNav() {
        if (this.app.auth) this.app.auth.updateNavbarUI();

        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            let view = null;
            if (href) {
                const parsed = parseUrl(href);
                view = parsed.view;
            } else {
                const viewMatch = link.getAttribute('onclick')?.match(/'([^']+)'/);
                view = viewMatch ? viewMatch[1] : null;
            }
            if (view === this.app.state.currentView) link.classList.add('active');
        });

        const tabItems = document.querySelectorAll('.mobile-web-tabbar .tab-item');
        tabItems.forEach(tab => {
            tab.classList.remove('active');
            const href = tab.getAttribute('href');
            if (href) {
                const parsed = parseUrl(href);
                if (parsed.view === this.app.state.currentView) {
                    tab.classList.add('active');
                }
            }
        });

        const badgeContainer = document.getElementById('notification-badge-container');
        if (badgeContainer && window.notificationManager) {
            badgeContainer.innerHTML = window.notificationManager.renderBadge(this.app.state.notifications);
        }

        this._updateProfileDisplay();

        const postAdBtn = document.getElementById('nav-post-ad-btn');
        if (postAdBtn) {
            postAdBtn.style.display = this.app.state.userRole === 'carrier' ? 'none' : 'block';
        }

        this._updateMembershipDisplay();

        if (window.lucide) window.lucide.createIcons();
    }

    _onPopState(e) {
        const { view, lang, routeParams } = parseUrl(window.location.pathname);
        this.app.state.lang = lang;
        if (routeParams) {
            this.app.state.activeRouteParams = routeParams;
        } else {
            delete this.app.state.activeRouteParams;
        }

        if (view !== this.app.state.currentView) {
            this.app.state.currentView = view;
            this.render();
            this.updateNav();
        }
    }

    _canAccessView(view) {
        const publicViews = [
            'home', 'login', 'register', 'reset-password', 'marketplace', 'education',
            'lojistik-hizmetleri', 'ithalat-ihracat', 'konteyner-tasimaciligi', 'navlun-hesaplama', 'dashboard'
        ];
        if (publicViews.includes(view)) return true;

        if (!this.app.state.isLoggedIn) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('auth.toast_login_required'), 'warning');
            } else {
                alert(window.i18n.t('auth.alert_login_required'));
            }
            return false;
        }

        const role = this.app.state.userRole;

        if (this.app.state.isLoggedIn && this.app.state.currentUser === 'Misafir') {
            return false;
        }

        const roleGuards = {
            'post-ad': ['loader', 'admin'],
            'loader-dashboard': ['loader', 'admin'],
            'carrier-dashboard': ['carrier', 'admin'],
            'settings': ['loader', 'carrier', 'admin'],
            'membership': ['loader', 'carrier', 'admin'],
            'pruva-ai': ['loader', 'carrier', 'admin'],
            'pricing-settings': ['loader', 'carrier', 'admin'],
            'pricing-reports': ['loader', 'carrier', 'admin']
        };

        if (roleGuards[view] && !roleGuards[view].includes(role)) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('auth.toast_access_denied'), 'error');
            } else {
                alert(window.i18n.t('auth.alert_access_denied'));
            }
            return false;
        }

        return true;
    }

    _captureFocus() {
        const el = document.activeElement;
        return {
            id: el?.id || null,
            selectionStart: el?.selectionStart ?? null,
            value: (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) ? el.value : null
        };
    }

    _restoreFocus({ id, selectionStart, value }) {
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        if (value !== null && ['INPUT', 'TEXTAREA'].includes(el.tagName)) {
            // Restore typed value if the re-rendered element is currently different
            if (el.value !== value) {
                el.value = value;
            }
        }
        el.focus();
        if (selectionStart !== null && ['text', 'search', 'tel', 'url'].includes(el.type || el.tagName.toLowerCase())) {
            try {
                el.setSelectionRange(selectionStart, selectionStart);
            } catch (e) {}
        }
    }

    _updateProfileDisplay() {
        const user = this.app.store.getCurrentUser();
        const profileName = document.querySelector('#user-profile-nav span');
        const profileAvatar = document.querySelector('#user-profile-nav div');

        if (profileName) profileName.textContent = this.app.state.currentUser;
        if (profileAvatar) {
            profileAvatar.innerHTML = user?.avatar 
                ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                : this.app.state.currentUser.charAt(0).toUpperCase();
        }
    }

    _updateMembershipDisplay() {
        const membershipStatusEl = document.getElementById('nav-membership-status');
        const membershipBadgeEl = document.getElementById('membership-nav-badge');
        if (!membershipStatusEl || !membershipBadgeEl) return;

        const subType = this.app.state.subscriptionType || 'none';
        const expiresAt = this.app.state.subscriptionExpiresAt;
        
        let daysLeft = 0;
        if (expiresAt) {
            daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        }

        const activeSub = (subType !== 'none' && daysLeft > 0) ? subType : 'none';
        
        const logoTextEl = document.querySelector('.logo span');
        if (logoTextEl) {
            logoTextEl.textContent = 'PRUVA';
            
            // Check if there is already a premium badge next to the logo
            let badge = document.querySelector('.logo .premium-logo-badge');
            if (activeSub === 'premium') {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'premium-logo-badge';
                    badge.innerHTML = '★ PREMIUM';
                    badge.style.cssText = 'background: linear-gradient(135deg, #f1c40f, #f39c12); color: white; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px; letter-spacing: 0px; box-shadow: 0 2px 5px rgba(241,196,15,0.3); vertical-align: middle; display: inline-block;';
                    logoTextEl.parentNode.appendChild(badge);
                }
            } else {
                if (badge) {
                    badge.remove();
                }
            }
        }

        membershipBadgeEl.classList.remove('premium', 'silver');
        const badgeMap = { premium: ['premium', 'PREMIUM'] };
        const badge = badgeMap[activeSub];
        if (badge) {
            membershipBadgeEl.classList.add(badge[0]);
            membershipStatusEl.textContent = badge[1];
        } else {
            membershipStatusEl.textContent = window.i18n.t('auth.membership_free');
        }
    }

    _cleanupView(view) {
        if (view === 'inbox') {
            console.log('[ROUTER] Cleaning up inbox listeners to prevent memory leaks.');
            if (window.inboxUnsubscribeChats) {
                window.inboxUnsubscribeChats();
                window.inboxUnsubscribeChats = null;
            }
            if (window.inboxMessagesUnsubscribe) {
                window.inboxMessagesUnsubscribe();
                window.inboxMessagesUnsubscribe = null;
            }
            if (window.inboxChatDocUnsubscribe) {
                window.inboxChatDocUnsubscribe();
                window.inboxChatDocUnsubscribe = null;
            }
            if (window.inboxCurrentChatId) {
                const currentUid = this.app.state.currentUserUid || this.app.state.currentUser;
                if (window.FirestoreService && typeof window.FirestoreService.setChatPresence === 'function') {
                    window.FirestoreService.setChatPresence(window.inboxCurrentChatId, currentUid, false);
                }
                window.inboxCurrentChatId = null;
            }
        }
        if (view === 'pruva-ai') {
            if (this.app.managers.pruvaAi) {
                this.app.managers.pruvaAi.stopEmailPolling();
            }
        }
    }
};