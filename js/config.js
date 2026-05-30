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
