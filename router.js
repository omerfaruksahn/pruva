import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';

/**
 * PRUVA — SPA Router
 * 
 * Hash-based routing with:
 *   - Deep linking support (#ad-123)
 *   - Skeleton loading transitions
 *   - Declarative view initialization via VIEW_INIT_MAP
 *   - User status checks (blocked, pending)
 * 
 * Yeni bir view'a init logic eklemek için:
 *   VIEW_INIT_MAP[viewName] = (app) => { ... }
 */


// ─────────────────────────────────────────────
// View Initialization Registry
// Yeni bir view'ın post-render init'i için buraya tek satır ekle.
// ─────────────────────────────────────────────
const VIEW_INIT_MAP = {

    'inbox': (app) => {
        if (window.inboxInit) window.inboxInit(app);
    },

    'post-ad': (app) => {
        const destinations = window.logisticsKnowledge.getAutocompleteData();
        window.utils.dom.initAutocomplete('origin-input', 'origin-results', destinations);
        window.utils.dom.initAutocomplete('destination-input', 'destination-results', destinations);
        window.utils.dom.initAutocomplete('gt-initial', 'gr-initial', window.logisticsKnowledge.goodsCategories);
        if (window.postAdManager) window.postAdManager.updateGlobalDetailsVisibility();
    },

    'marketplace': (app) => {












































































































































































































































































































































































































































































































































































































































































































































        // Render icons
        if (window.lucide) window.lucide.createIcons();
    }

    // ── Private Helpers ──

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
        // Publicly accessible pages including the new rich SEO landing pages
        const publicViews = [
            'home', 'login', 'register', 'reset-password', 'marketplace', 'education',
            'lojistik-hizmetleri', 'ithalat-ihracat', 'konteyner-tasimaciligi', 'navlun-hesaplama'
        ];
        if (publicViews.includes(view)) return true;

        // Login mandatory for other views
        if (!this.app.state.isLoggedIn) {
            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('auth.toast_login_required'), 'warning');
            } else {
                alert(window.i18n.t('auth.alert_login_required'));
            }
            return false;
        }

        const role = this.app.state.userRole;

        // Deleted user block
        if (this.app.state.isLoggedIn && this.app.state.currentUser === 'Misafir') {
            return false;
        }

        // Role guards
        const roleGuards = {
            'post-ad': ['loader', 'admin'],
            'loader-dashboard': ['loader', 'admin'],
            'carrier-dashboard': ['carrier', 'admin'],
            'settings': ['loader', 'carrier', 'admin'],
            'membership': ['loader', 'carrier', 'admin'],
            'inbox': ['loader', 'carrier', 'admin']
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
            selectionStart: el?.selectionStart ?? null
        };
    }

    _restoreFocus({ id, selectionStart }) {
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.focus();
        if (selectionStart !== null && ['text', 'search', 'tel', 'url'].includes(el.type)) {
            el.setSelectionRange(selectionStart, selectionStart);
        }
    }

    _updateProfileDisplay() {
        const user = this.app.store.getCurrentUser();
        const profileName = docume



        if (profileAvatar) {
            profileAvatar.innerHTML = user?.avatar 
                ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                : (this.app.state.currentUser || 'M').charAt(0).toUpperCase();
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

        // Logo
        const logoTextEl = document.querySelector('.logo span');
        if (logoTextEl) {
            const logoMap = { premium: 'PREMIUM' };
            logoTextEl.textContent = logoMap[activeSub] || 'PRUVA';
        }

        // Badge
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
};
