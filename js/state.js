import { FirestoreService } from './services/firestoreService.js';

/**
 * PRUVA — State Manager
 * 
 * Data-driven persistence: Yeni bir state alanı eklemek için sadece
 * `PERSISTENCE_MAP`'e bir satır eklemen yeterli. load/save otomatik çalışır.
 * 
 * @example Yeni alan eklemek:
 *   1. `getDefaults()` içine default değeri ekle
 *   2. `PERSISTENCE_MAP`'e kaydet: { key: 'pruva_xxx', path: 'xxx', type: 'json' }
 *   3. Bitti! Constructor load eder, save() yazar.
 */

// ─────────────────────────────────────────────
// Persistence Map — Tek kaynak, otomatik sync
// type: 'json' → JSON.parse/stringify | 'string' → raw | 'int' → parseInt
// ─────────────────────────────────────────────
const PERSISTENCE_MAP = [
    // Core Data (Ads, users, and notifications are now managed by Firestore)
    // LocalStorage'da tutulacak diğer veriler:
    { key: 'pruva_messages',         path: 'messages',         type: 'json' },
    { key: 'pruva_securityLogs',     path: 'securityLogs',     type: 'json' },
    { key: 'pruva_favorites',        path: 'favorites',        type: 'json' },
    { key: 'pruva_eduReadModules',   path: 'eduReadModules',   type: 'json' },

    // Auth & Identity
    { key: 'pruva_isLoggedIn',       path: 'isLoggedIn',       type: 'json' },
    { key: 'pruva_currentUser',      path: 'currentUser',      type: 'string' },
    { key: 'pruva_currentUserUid',   path: 'currentUserUid',   type: 'string' },
    { key: 'pruva_userRole',         path: 'userRole',         type: 'string' },

    // Subscription & Economy
    { key: 'pruva_subscriptionType',    path: 'subscriptionType',    type: 'string' },
    { key: 'pruva_subscriptionExpiresAt', path: 'subscriptionExpiresAt', type: 'string' },

    // UI State Persistence (tabs, pages, progress)
    { key: 'pruva_marketplacePage',      path: 'marketplacePage',      type: 'int' },
    { key: 'pruva_adminActiveTab',       path: 'adminActiveTab',       type: 'string' },
    { key: 'pruva_loaderActiveTab',      path: 'loaderActiveTab',      type: 'string' },
    { key: 'pruva_carrierActiveTab',     path: 'carrierActiveTab',     type: 'string' },
    { key: 'pruva_currentEduModuleIndex', path: 'currentEduModuleIndex', type: 'int' },
    { key: 'pruva_eduViewMode',          path: 'eduViewMode',          type: 'string' },
    { key: 'pruva_eduCategory',          path: 'eduCategory',          type: 'string' },
    
    // Outlook Connection
    { key: 'pruva_outlookConnected',     path: 'outlookConnected',     type: 'json' },
    { key: 'pruva_outlookEmail',         path: 'outlookEmail',         type: 'string' },
];


// ─────────────────────────────────────────────
// Default State Factory
// ─────────────────────────────────────────────
function getDefaults() {
    return {
        // Navigation
        currentView: 'home',

        // PRUVA AI STATE
        aiLoading: false,
        activeConversationId: null,
        convSearchQuery: '',
        convFilterMode: 'all', // all, active, completed
        pricingConversations: [],
        detailsDrawerOpen: false,
        isHandsFreeMode: false,
        isAiThinking: false,

        // Core Data (Başlangıçta boş, Firestore'dan dolacak)
        ads: [],
        users: [],
        notifications: [],
        messages: [],           // { id, adId, from, to, text, date }
        securityLogs: [],       // { id, user, originalText, type, date }
        favorites: [],
        eduReadModules: [],

        // Auth & Identity
        isLoggedIn: false,
        currentUser: 'Misafir',
        currentUserUid: null,
        userRole: 'loader',
        is_verified: false,

        // Subscription & Economy
        subscriptionType: 'none',
        subscriptionExpiresAt: null,

        // Carrier Interests (for notification matching)
        userInterests: ['Çin', 'Hamburg', 'İthalat'],

        // UI State
        expandedAdId: null,
        filters: { origin: '', destination: '', transport: '', cargoType: '' },
        adminActiveTab: 'ads',
        adminFilters: { status: 'all', search: '' },
        loaderActiveTab: 'open-ads',
        carrierActiveTab: 'my-bids',
        marketplacePage: 1,
        currentEduModuleIndex: 0,
        eduViewMode: 'portal',
        eduCategory: 'all',
    };
}


// ─────────────────────────────────────────────
// StateManager Class
// ─────────────────────────────────────────────
window.StateManager = class StateManager {

    constructor() {
        this.state = getDefaults();
        this._loadFromStorage();
    }

    // ── Public: Async Load from Firestore ──
    async loadFromFirestore() {
        console.log('[STATE] Starting Firestore real-time listeners...');
        
        const loadAds = new Promise((resolve) => {
            this._unsubscribeAds = FirestoreService.subscribeToAds((ads) => {
                this.state.ads = ads;
                if (window.app && window.app.router) window.app.router.render();
                resolve();
            }, (err) => {
                resolve();
            });
        });

        // NOT: subscribeToUsers artık server-only (Firestore rules kısıtlaması).
        // Kullanıcı verisi getUser(uid) ile bireysel çekilir, /api/all-data admin için kullanılır.

        // Listen for notifications for the current user
        if (this.state.isLoggedIn && this.state.currentUserUid) {
            this._unsubscribeNotifications = FirestoreService.subscribeToNotifications(this.state.currentUserUid, (notifications) => {
                this.state.notifications = notifications;
                if (window.app && window.app.router) window.app.router.updateNav();
            });
        }

        try {
            await loadAds;
            console.log('[STATE] Initial real-time data loaded.');
        } catch (error) {
            console.error('[STATE] Error starting real-time listeners:', error);
        }
    }

    // ── Private: Auto-load from localStorage ──
    _loadFromStorage() {
        for (const entry of PERSISTENCE_MAP) {
            const raw = localStorage.getItem(entry.key);
            if (raw === null || raw === '') continue;

            try {
                switch (entry.type) {
                    case 'json':
                        this.state[entry.path] = JSON.parse(raw);
                        break;
                    case 'int':
                        this.state[entry.path] = parseInt(raw, 10);
                        break;
                    case 'string':
                    default:
                        this.state[entry.path] = raw;
                        break;
                }
            } catch (e) {
                console.warn(`[STATE] Failed to load "${entry.key}":`, e.message);
            }
        }
    }

    // ── Public: Persist all tracked state to localStorage ──
    save() {
        for (const entry of PERSISTENCE_MAP) {
            const value = this.state[entry.path];
            try {
                switch (entry.type) {
                    case 'json':
                        localStorage.setItem(entry.key, JSON.stringify(value ?? []));
                        break;
                    case 'int':
                        localStorage.setItem(entry.key, String(value ?? 0));
                        break;
                    case 'string':
                    default:
                        localStorage.setItem(entry.key, value ?? '');
                        break;
                }
            } catch (e) {
                console.warn(`[STATE] Failed to save "${entry.key}":`, e.message);
            }
        }
    }

    // ── Public: Domain Actions ──

    async addAd(adData) {
        try {
            const newAd = await FirestoreService.addAd(adData);
            this.state.ads.unshift(newAd);
            window.app.router.render(); // Değişikliği ekrana yansıt
            return newAd;
        } catch (error) {
            console.error('[STATE] addAd failed:', error);
            throw error;
        }
    }

    async updateAd(adId, updates) {
        try {
            await FirestoreService.updateAd(adId, updates);
            const ad = this.findAd(adId);
            if (ad) {
                Object.assign(ad, updates);
                this.save();
                window.app.router.render();
            }
        } catch (error) {
            console.error('[STATE] updateAd failed:', error);
            throw error;
        }
    }

    async removeAd(adId) {
        console.log(`[StateManager] removeAd called for: ${adId}`);
        try {
            await FirestoreService.deleteAd(adId);
            console.log(`[StateManager] Firestore delete success for: ${adId}`);
            const index = this.state.ads.findIndex(a => String(a.id) === String(adId));
            if (index !== -1) {
                this.state.ads.splice(index, 1);
                console.log(`[StateManager] Ad removed from state. New count: ${this.state.ads.length}`);
                window.app.router.render();
            } else {
                console.warn(`[StateManager] Ad ${adId} not found in state.`);
            }
        } catch (error) {
            console.error('[STATE] removeAd failed:', error);
            throw error;
        }
    }

    findAd(adId) {
        return this.state.ads.find(a => String(a.id) === String(adId)) || null;
    }

    toggleFavorite(adId) {
        const index = this.state.favorites.indexOf(adId);
        if (index === -1) {
            this.state.favorites.push(adId);
        } else {
            this.state.favorites.splice(index, 1);
        }
        this.save();
        window.app.router.render();
    }

    async updateUser(name, updates) {
        const user = this.state.users.find(u => u.name.trim() === name.trim());
        if (user) {
            try {
                // Sadece db ID'si varsa Firestore update yap (Misafir vs. hariç)
                if (user.id) {
                    await FirestoreService.updateUser(user.id, updates);
                }
                Object.assign(user, updates);
                // Kullanıcı bilgileri UI'da değiştiyse (örn. rol), render gerekebilir
                window.app.router.render();
            } catch (error) {
                console.error('[STATE] updateUser failed:', error);
                throw error;
            }
        }
        return user;
    }

    findUser(name) {
        return this.state.users.find(u => u.name.trim() === name.trim()) || null;
    }

    getCurrentUser() {
        // BUG FIX: UID ile ara (isimle aramak yanlış kullanıcı dönebilir)
        if (this.state.currentUserUid) {
            const byUid = this.state.users.find(u => u.id === this.state.currentUserUid);
            if (byUid) return byUid;
        }
        return this.findUser(this.state.currentUser);
    }

    // ── Public: Full Reset ──
    reset() {
        // Remove all pruva_ keys
        for (const entry of PERSISTENCE_MAP) {
            localStorage.removeItem(entry.key);
        }
        this.state = getDefaults();
    }
};
