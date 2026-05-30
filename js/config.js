/**
 * PRUVA — Application Configuration
 * 
 * Ortam algılama Vite tarafından otomatik yapılır (import.meta.env).
 * Yeni bir ayar eklemek için:
 *   1. İlgili bölüme (CONFIG veya logisticsKnowledge) ekle
 *   2. Ortam değişkeni gerekliyse `.env` dosyasına `VITE_` prefix'i ile ekle
 *   3. Tüm dosyalardan `window.CONFIG.XXX` veya `window.logisticsKnowledge.XXX` ile eriş
 */


// ─────────────────────────────────────────────
// Application Config (Vite env powered)
// ─────────────────────────────────────────────
window.CONFIG = Object.freeze({
    ENV: import.meta.env.MODE,
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,

    // API
    API_URL: import.meta.env.VITE_API_URL || '/api',

    // App Metadata
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Pruva',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',

    // Marketplace
    ADS_PER_PAGE: 20,
    MIN_AD_COUNT: 100,

    // Durations (ms)
    TOAST_DURATION: 3000,
    SKELETON_DELAY: 0,      // ms before showing skeleton (0 = use rAF)
    DEBOUNCE_DELAY: 300,

    // Membership
    SUBSCRIPTION_TYPES: ['none', 'premium'],

    // Instant views (no skeleton loading)
    INSTANT_VIEWS: ['home', 'membership', 'dashboard'],
});


// ─────────────────────────────────────────────
// Global API Interceptor (Vite to Render Router)
// ─────────────────────────────────────────────
// Intercepts all relative `/api` fetches and redirects them to the live production server.
const originalFetch = window.fetch;
window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api')) {
        const apiUrl = window.CONFIG.API_URL;
        if (apiUrl && apiUrl !== '/api') {
            const targetUrl = input.replace('/api', apiUrl);
            return originalFetch(targetUrl, init);
        }
    }
    return originalFetch(input, init);
};

// Intercepts all `window.open` relative `/api` popups (e.g. Outlook OAuth login)
const originalOpen = window.open;
window.open = function (url, target, features) {
    if (typeof url === 'string' && url.startsWith('/api')) {
        const apiUrl = window.CONFIG.API_URL;
        if (apiUrl && apiUrl !== '/api') {
            url = url.replace('/api', apiUrl);
        }
    }
    return originalOpen(url, target, features);
};
