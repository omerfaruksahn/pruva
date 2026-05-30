/**
 * PRUVA — Application Entry Point
 * 
 * Manager'lar MANAGER_REGISTRY üzerinden otomatik kayıt edilir.
 * Yeni bir manager eklemek için:
 *   1. Manager class'ını oluştur (window.XxxManager)
 *   2. MANAGER_REGISTRY'ye ekle: { key: 'xxx', class: 'XxxManager', global: 'xxxManager' }
 *   3. Bitti! Hem app.managers.xxx hem window.xxxManager otomatik oluşur.
 */


// ─────────────────────────────────────────────
// Manager Registry
// key:    app.managers[key] olarak erişilir
// class:  window[class] olarak constructor çağrılır
// global: window[global] olarak expose edilir (inline onclick uyumluluğu için)
// ─────────────────────────────────────────────
const MANAGER_REGISTRY = [
    { key: 'loader',       class: 'LoaderManager',       global: 'loaderManager' },
    { key: 'carrier',      class: 'CarrierManager',      global: 'carrierManager' },
    { key: 'reference',    class: 'ReferenceManager',    global: 'referenceManager' },
    { key: 'marketplace',  class: 'MarketplaceManager',  global: 'marketplaceManager' },
    { key: 'postAd',       class: 'PostAdManager',       global: 'postAdManager' },
    { key: 'chat',         class: 'ChatManager',         global: 'chatManager' },
    { key: 'notification', class: 'NotificationManager', global: 'notificationManager' },
    { key: 'settings',     class: 'SettingsManager',     global: 'settingsManager' },
    { key: 'membership',   class: 'MembershipManager',   global: 'membershipManager' },
    { key: 'navbarComponent', class: 'NavbarComponent',   global: 'navbarComponent' },
    { key: 'pruvaAi',      class: 'PruvaAiManager',      global: 'pruvaAiManager' },
];


// ─────────────────────────────────────────────
// View Registry
// ─────────────────────────────────────────────
const VIEW_REGISTRY = {
    home:               'homeView',
    marketplace:        'marketplaceView',
    'post-ad':          'postAdView',
    'loader-dashboard': 'loaderDashboardView',
    'carrier-dashboard':'carrierDashboardView',
    login:              'loginView',
    register:           'registerView',
    'reset-password':   'resetPasswordView',
    settings:           'settingsView',
    education:          'educationView',
    membership:         'membershipView',
    dashboard:          'dashboardView',
    inbox:              'inboxView',
    'lojistik-hizmetleri': 'lojistikHizmetleriView',
    'ithalat-ihracat':  'ithalatIhracatView',
    'konteyner-tasimaciligi': 'konteynerTasimaciligiView',
    'navlun-hesaplama': 'navlunHesaplamaView',
    'pruva-ai':         'pruvaAiView',
    'pricing-settings': 'pricingSettingsView',
    'pricing-reports':  'pricingReportsView',
};


// ─────────────────────────────────────────────
// App Class
// ─────────────────────────────────────────────
class App {
    constructor() {
        console.log(`[APP] Initializing ${window.CONFIG.APP_NAME} v${window.CONFIG.APP_VERSION} (${window.CONFIG.ENV})`);

        // 1. State
        this.store = new window.StateManager();
        this.state = this.store.state;

        // 2. Views (resolve from registry)
        this.views = {};
        for (const [route, viewName] of Object.entries(VIEW_REGISTRY)) {
            this.views[route] = window[viewName];
        }

        // 3. Core Systems
        this.router = new window.Router(this);
        this.auth = new window.Auth(this);

        // 4. Managers (auto-register from registry)
        this.managers = {};
        for (const entry of MANAGER_REGISTRY) {
            const ManagerClass = window[entry.class];
            if (!ManagerClass) {
                console.warn(`[APP] Manager class "${entry.class}" not found, skipping.`);
                continue;
            }
            const instance = new ManagerClass(this);
            this.managers[entry.key] = instance;
            window[entry.global] = instance; // Global exposure for onclick compatibility
        }

        // 5. Standalone globals
        window.legalModal = new window.LegalModal();
        window.ThemeManager.init();

        // 6. Shared state
        this.uploadedPhotos = [];

        // 7. Boot
        this.init();
    }

    async init() {
        // Yükleniyor Ekranı
        const root = document.getElementById('app-content');
        if (root) {
            root.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg-body);">
                    <div style="width: 40px; height: 40px; border: 4px solid var(--border); border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 20px; font-weight: 500; color: var(--text-secondary);">Veritabanına bağlanılıyor...</p>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
        }

        // Firebase Auth oturum durumunu bekle
        await this.auth.init();

        // Firestore'dan verileri bekle
        await this.store.loadFromFirestore();

        // Initialize messages dropdown listener on boot if logged in
        if (this.state.isLoggedIn && window.inboxDropdown && typeof window.inboxDropdown.initListener === 'function') {
            window.inboxDropdown.initListener(this);
        }

        // Resolve initial view, language, and programmatic parameters from URL pathname on launch
        const { view, lang, routeParams } = window.parseUrl(window.location.pathname);
        this.state.lang = lang;
        if (routeParams) {
            this.state.activeRouteParams = routeParams;
        }

        // Deep linking support (#ad-123)
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('ad-')) {
            const adId = parseInt(hash.replace('ad-', ''));
            if (!isNaN(adId)) {
                setTimeout(() => this.managers.marketplace.focusOnAd(adId), 100);
                return;
            }
        }

        // Hash-based backward compatibility redirects
        if (hash && !hash.startsWith('ad-')) {
            const targetView = this.views[hash] ? hash : 'home';
            this.state.currentView = targetView;
        } else {
            this.state.currentView = view;
        }

        // Overdue check
        await this.checkOverdueShipments();

        this.router.render();
        this.router.updateNav();
    }

    async checkOverdueShipments() {
        const now = Date.now();
        const ads = this.state.ads || [];
        let needsSave = false;

        for (const ad of ads) {
            if (['accepted', 'in_transit'].includes(ad.status) && ad.estimatedDeliveryDate) {
                const carrierName = ad.acceptedBid?.company;
                if (!carrierName) continue;

                // delayCount 999 is our flag for "already penalized"
                if (ad.delayCount === 999) continue;

                const daysOverdue = Math.floor((now - ad.estimatedDeliveryDate) / (1000 * 60 * 60 * 24));
                
                if (daysOverdue >= 1) {
                    const carrier = this.state.users.find(u => u.name === carrierName);
                    if (carrier) {
                        if (daysOverdue >= 7) {
                            // Penalty logic
                            carrier.bannedUntil = now + (24 * 60 * 60 * 1000); // 1 day ban
                            if (carrier.performance && carrier.performance.overallRating > 0.3) {
                                carrier.performance.overallRating = parseFloat((carrier.performance.overallRating - 0.3).toFixed(1));
                                // Add a system review
                                if (!carrier.performance.lastReviews) carrier.performance.lastReviews = [];
                                carrier.performance.lastReviews.unshift({
                                    reviewerRole: 'system',
                                    date: now,
                                    origin: ad.origin,
                                    destination: ad.destination,
                                    scores: { cat1: 0, cat2: 0, cat3: 0 },
                                    comment: 'Sistem Notu: Zamanında teslimat bildirimi yapılmadığı için ceza uygulandı.'
                                });
                            }
                            
                            ad.delayCount = 999;
                            needsSave = true;

                            if (window.notificationManager) {
                                window.notificationManager.add({
                                    id: Date.now() + Math.random(),
                                    type: 'error',
                                    text: `🚨 Ceza Uygulandı: Teslimat bildirimi yapılmadığı için teklif verme hakkınız 1 gün askıya alındı.`,
                                    subtext: `İlan: ${ad.origin} → ${ad.destination}`,
                                    date: now,
                                    read: false,
                                    targetUser: carrierName,
                                    view: 'carrier-dashboard'
                                });
                            }
                        } else if (daysOverdue >= 1 && daysOverdue < 7 && !ad.notifiedOverdue) {
                            // First reminder
                            ad.notifiedOverdue = true;
                            needsSave = true;
                            if (window.notificationManager) {
                                window.notificationManager.add({
                                    id: Date.now() + Math.random(),
                                    type: 'warning',
                                    text: `⚠️ Teslimat tarihiniz geçti. Teslimatı tamamladınız mı?`,
                                    subtext: `Lütfen durumu güncelleyin: ${ad.origin} → ${ad.destination}`,
                                    date: now,
                                    read: false,
                                    targetUser: carrierName,
                                    view: 'carrier-dashboard'
                                });
                            }
                        }
                    }
                }
            }
        }

        // Free Time Alarms Check
        for (const ad of ads) {
            if (['accepted', 'in_transit', 'delivered'].includes(ad.status) && ad.portArrivalDate) {
                // Free time days (from ad.acceptedBid.freeTime or default 7)
                let freeTimeDays = 7;
                if (ad.acceptedBid && ad.acceptedBid.freeTime) {
                    const match = ad.acceptedBid.freeTime.match(/\d+/);
                    if (match) freeTimeDays = parseInt(match[0]);
                }

                const elapsedMs = now - ad.portArrivalDate;
                const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
                const remainingDays = freeTimeDays - elapsedDays;

                if (remainingDays <= 2 && remainingDays >= 0 && !ad.notifiedFreeTimeUrgent) {
                    // Urgent notification (Kalan süre <= 2 Gün)
                    ad.notifiedFreeTimeUrgent = true;
                    needsSave = true;
                    if (window.notificationManager) {
                        window.notificationManager.add({
                            id: Date.now() + Math.random(),
                            type: 'warning',
                            text: `⚠️ Freetime Bitiyor: PRV-${String(ad.id).slice(-6)} Konteyner serbest süresi son 2 gün!`,
                            subtext: `Liman Girişi: ${new Date(ad.portArrivalDate).toLocaleDateString('tr-TR')} | Free Time: ${freeTimeDays} Gün`,
                            date: now,
                            read: false,
                            targetUser: ad.owner,
                            view: 'loader-dashboard'
                        });
                        // Also notify carrier so they can follow up
                        if (ad.acceptedBid && ad.acceptedBid.company) {
                            window.notificationManager.add({
                                id: Date.now() + Math.random(),
                                type: 'warning',
                                text: `⚠️ Freetime Uyarı: Taşıdığınız yükün liman serbest süresi bitmek üzere! Son 2 gün.`,
                                subtext: `İlan: ${ad.origin} → ${ad.destination}`,
                                date: now,
                                read: false,
                                targetUser: ad.acceptedBid.company,
                                view: 'carrier-dashboard'
                            });
                        }
                    }
                } else if (remainingDays < 0 && !ad.notifiedFreeTimeExpired) {
                    // Expired notification (Demoraja girdi!)
                    ad.notifiedFreeTimeExpired = true;
                    needsSave = true;
                    if (window.notificationManager) {
                        window.notificationManager.add({
                            id: Date.now() + Math.random(),
                            type: 'error',
                            text: `🚨 DEMORAJ ALARMI: PRV-${String(ad.id).slice(-6)} serbest süresi doldu! Günlük ceza başladı.`,
                            subtext: `Konteyner demoraja girdi. Günlük ceza: $150. Biriken Ceza: $${Math.abs(remainingDays) * 150}`,
                            date: now,
                            read: false,
                            targetUser: ad.owner,
                            view: 'loader-dashboard'
                        });
                        if (ad.acceptedBid && ad.acceptedBid.company) {
                            window.notificationManager.add({
                                id: Date.now() + Math.random(),
                                type: 'error',
                                text: `🚨 Demoraj Alarmı: Taşıdığınız yükün serbest süresi doldu ve demoraja girdi!`,
                                subtext: `Müşteri günlük $150 ceza ödüyor. Hızlı teslimat sağlayın: ${ad.origin} → ${ad.destination}`,
                                date: now,
                                read: false,
                                targetUser: ad.acceptedBid.company,
                                view: 'carrier-dashboard'
                            });
                        }
                    }
                }
            }
        }
        
        if (needsSave) {
            this.store.save();
        }
    }

    commit() {
        this.store.save();
        this.router.render();
    }

    commitAndNav(view) {
        this.store.save();
        this.router.navigate(view);
    }
}


// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
window.onerror = function(msg, url, lineNo, columnNo, error) {
    const isScriptError = msg.toLowerCase().includes('script error');
    document.body.innerHTML = `
        <div style="padding: 40px; color: #e74c3c; font-family: 'Inter', monospace; line-height: 1.6; max-width: 800px; margin: 0 auto;">
            <div style="font-size: 4rem; margin-bottom: 20px;">🚨</div>
            <h2 style="font-size: 1.8rem; margin-bottom: 15px; color: #c0392b;">Uygulama Çalışırken Bir Hata Oluştu</h2>
            
            <div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p><strong>Hata Mesajı:</strong> <code style="background: #fee2e2; padding: 2px 6px; border-radius: 4px;">${msg}</code></p>
                <p><strong>Dosya:</strong> ${url || 'Bilinmiyor'}</p>
                <p><strong>Konum:</strong> Satır ${lineNo}, Sütun ${columnNo}</p>
            </div>

            ${isScriptError ? `
                <div style="background: #f0f7ff; border-left: 5px solid #3498db; padding: 20px; border-radius: 8px; margin-bottom: 25px; color: #2c3e50;">
                    <h4 style="margin-top: 0; color: #2980b9;">💡 "Script error" Nedir?</h4>
                    <p style="font-size: 0.9rem;">
                        Bu hata genellikle tarayıcının güvenlik kısıtlamalarından (CORS) kaynaklanır. 
                        Projeyi doğrudan <code>file://</code> üzerinden açtığınızda, bir dosyadaki yazım hatası (syntax error) 
                        tarayıcı tarafından gizlilik nedeniyle bu şekilde gösterilir.
                    </p>
                    <p style="font-size: 0.9rem; font-weight: bold;">
                        Çözüm için: Tarayıcıda <strong>F12</strong> tuşuna basıp "Console" sekmesine bakarsanız gerçek hatayı görebilirsiniz.
                    </p>
                </div>
            ` : ''}

            <p style="color: #666;">Lütfen bu ekranın görüntüsünü veya hata bilgilerini bana iletin, hemen düzelteyim.</p>
            <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 10px;">Sayfayı Yenile</button>
        </div>
    `;
    return false;
};


// ─────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────
try {
    window.app = new App();
} catch (e) {
    window.onerror(e.message, 'app.js (veya init süreci)', 0, 0, e);
}
