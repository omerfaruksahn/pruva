/**
 * PRUVA — Main Entry Point (Vite)
 * 
 * Tüm CSS ve JS dosyaları buradan import edilir.
 * Vite bunu tek bir bundle'a derler.
 * 
 * Yükleme sırası KRİTİKTİR — bağımlılık grafiğine uygun sıralama.
 */

// ─────────────────────────────────────────
// 1. Styles (sıralama: variables → base → components → views)
// ─────────────────────────────────────────
import '../css/base/variables.css';
import '../css/base/animations.css';
import '../css/base/reset.css';
import '../css/base/dark-mode.css';
import '../css/components/nav.css';
import '../css/components/buttons.css';
import '../css/components/card.css';
import '../css/components/forms.css';
import '../css/components/modal.css';
import '../css/components/footer.css';
import '../css/components/notifications.css';
import '../css/components/toast.css';
import '../css/components/skeleton.css';
import '../css/views/home.css';
import '../css/views/marketplace.css';
import '../css/views/dashboard.css';
import '../css/views/auth.css';
import '../css/views/postAd.css';
import '../css/views/settings.css';
import '../css/views/education.css';
import '../css/views/inbox.css';
import '../css/views/membership.css';
import '../css/views/pruvaAi.css';
import '../css/views/pricingActions.css';
import '../css/views/rateSheets.css';
import '../style.css';
import '../css/base/mobile.css';

// ─────────────────────────────────────────
// 2. Lucide Icons (CDN yerine npm)
// ─────────────────────────────────────────
import { createIcons, icons } from 'lucide';
window.lucide = {
    createIcons: (opts) => createIcons({ icons, ...opts }),
};

// ─────────────────────────────────────────
// 3. Core (sıralama kritik — bağımlılık grafiğine göre)
// ─────────────────────────────────────────
import './config.js';
import './data/logisticsData.js';
import './firebase-config.js';
// import './security-hardened.js'; // Konsol kullanımını zorlaştırdığı için geliştirme aşamasında kapattım
import './state.js';
import './utils/educationContent.js';
import './utils.js';
import './security.js';
import './router/index.js';
import './seoManager.js';
import './auth.js';

// ─────────────────────────────────────────
// 4. Views
// ─────────────────────────────────────────
import './views/home.js';
import './views/login.js';
import './views/register.js';
import './views/resetPassword.js';
import './views/inbox.js';

import './views/marketplace.js';
import './views/postAd.js';
import './views/loaderDashboard.js';
import './views/carrierDashboard.js';
import './views/settings/index.js';
import './views/education.js';
import './views/membership.js';
import './views/pruvaAi.js';
import './views/pricingActions.js';
import './views/pricingSettings.js';
import './views/pricingCustomers.js';
import './views/pricingReports.js';
import './views/rateSheets.js';
import './views/dashboard.js';
import './views/seo/lojistikHizmetleri.js';
import './views/seo/ithalatIhracat.js';
import './views/seo/konteynerTasimaciligi.js';
import './views/seo/navlunHesaplama.js';

// ─────────────────────────────────────────
// 5. Components
// ─────────────────────────────────────────
import './components/bidModal.js';
import './components/notificationManager.js';
import './components/legalModal.js';
import './components/themeManager.js';
import './components/chatModal.js';
import './components/loaderManager.js';
import './components/carrierManager.js';
import './components/referenceManager.js';
import './components/marketplaceManager.js';
import './components/settingsManager.js';
import './components/postAdManager.js';
import './components/reviewModal.js';
import './components/chatManager.js';
import './components/academySimulator.js';
import './components/membershipManager.js';
import './components/navbarComponent.js';
import './components/operationModal.js';
import './components/userProfileModal.js';
import './components/pruvaAiManager.js';
import './components/rateSheetsManager.js';

// ─────────────────────────────────────────
// 6. App Bootstrap (HER ZAMAN EN SON!)
// ─────────────────────────────────────────
import './app.js';

// Vite HMR Support is handled automatically by Vite. 
// Aggressive reload fallback removed to prevent refresh loops.
