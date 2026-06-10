export const StatusPages = {
    blocked(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--danger">
                <div class="status-icon">🚫</div>
                <h1>${window.i18n.t('auth.status_blocked_title')}</h1>
                <p>
                    ${window.i18n.t('auth.status_blocked_desc').replace('{name}', user.name)}
                </p>
                <div class="status-reason">
                    <strong>${window.i18n.t('auth.status_reason_label')}</strong> ${window.i18n.t('auth.status_blocked_reason')}
                </div>
                <button class="btn-outline" onclick="window.app.auth.logout()">${window.i18n.t('auth.status_logout_btn')}</button>
            </div>
        </div>`;
    },

    pending(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--warning">
                <div class="status-icon">⏳</div>
                <h1>${window.i18n.t('auth.status_pending_title')}</h1>
                <p>
                    ${window.i18n.t('auth.status_pending_desc').replace('{name}', user.name)}
                </p>
                <div class="status-reason status-reason--info">
                    <strong>${window.i18n.t('auth.status_label')}</strong> ${window.i18n.t('auth.status_pending_val')}
                </div>
                <p class="status-note">
                    ${window.i18n.t('auth.status_pending_note')}
                </p>
                <button class="btn-outline" onclick="window.app.auth.logout()">${window.i18n.t('auth.status_logout_btn')}</button>
            </div>
        </div>`;
    },

    rejected(user) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--danger">
                <div class="status-icon">❌</div>
                <h1>${window.i18n.t('auth.status_rejected_title')}</h1>
                <p>
                    ${window.i18n.t('auth.status_rejected_desc').replace('{name}', user.name)}
                </p>
                <div class="status-reason">
                    <strong>${window.i18n.t('auth.status_reason_label')}</strong> ${window.i18n.t('auth.status_rejected_reason')}
                </div>
                <p class="status-note">
                    ${window.i18n.t('auth.status_rejected_note')}
                </p>
                <button class="btn-outline" onclick="window.app.auth.logout()">${window.i18n.t('auth.status_logout_btn')}</button>
            </div>
        </div>`;
    },

    viewError(errorMessage) {
        return `
        <div class="status-page">
            <div class="card status-card status-card--warning">
                <div class="status-icon">⚠️</div>
                <h2>${window.i18n.t('auth.status_error_title')}</h2>
                <p>${window.i18n.t('auth.status_error_desc')}</p>
                <code class="status-error-code">${window.utils.escapeHTML(errorMessage)}</code>
                <div class="status-actions">
                    <button class="btn-primary" onclick="window.app.router.navigate('home')">${window.i18n.t('auth.status_home_btn')}</button>
                    <button class="btn-outline" onclick="location.reload()">${window.i18n.t('auth.status_reload_btn')}</button>
                </div>
            </div>
        </div>`;
    },

    skeleton() {
        return `
        <div class="loading-skeleton" style="padding: 40px; max-width: 1200px; margin: 0 auto;">
            <div class="skeleton-line" style="width: 40%; height: 28px; margin-bottom: 20px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 120px; margin-bottom: 15px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 80px; margin-bottom: 15px;"></div>
            <div class="skeleton-line" style="width: 70%; height: 80px;"></div>
        </div>`;
    }
};