/**
 * Generic Dashboard View — Redirect Shim
 * Bu dosya artık doğrudan kullanılmıyor. Roller bazında ayrılmış dashboard'lar:
 *   - loaderDashboard.js  (Yükleyici)
 *   - carrierDashboard.js (Taşıyıcı)
 *   - adminDashboard.js   (Admin)
 * Eğer bu view yanlışlıkla çağrılırsa, doğru dashboard'a yönlendirir.
 */
window.dashboardView = (state) => {
    // Otomatik yönlendirme: Doğru dashboard'a git
    setTimeout(() => {
        if (window.app && window.app.router) {
            window.app.router.goToDashboard();
        }
    }, 0);

    return `
    <div class="container" style="text-align: center; padding: 80px 20px;">
        <div style="font-size: 2rem; margin-bottom: 15px;"><i data-lucide="loader" style="width: 40px; height: 40px; animation: spin 1s linear infinite;"></i></div>
        <p style="color: var(--text-secondary); font-size: 1rem;">Panele yönlendiriliyorsunuz...</p>
    </div>
    `;
};
