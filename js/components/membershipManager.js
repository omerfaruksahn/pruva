export class MembershipManager {
    constructor(app) {
        this.app = app;
        window.membershipManager = this;
    }

    init() {
        this.fetchHistory();
        if (window.lucide) window.lucide.createIcons();
    }

    async subscribe(type, price) {
        const displayType = 'PREMIUM';
        if (!confirm(window.i18n.t('comp.membership.confirm_start').replace('{plan}', displayType).replace('{price}', price))) return;

        window.notificationManager?.showToast(window.i18n.t('comp.membership.processing'), 'info');

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        const expiresAt = expiryDate.toISOString();

        try {
            const uid = this.app.state.currentUserUid;
            if (uid) {
                const { FirestoreService } = await import('../services/firestoreService.js');
                await FirestoreService.updateUser(uid, {
                    subscriptionType: type,
                    subscriptionExpiresAt: expiresAt
                });
            }
            this.app.state.subscriptionType = type;
            this.app.state.subscriptionExpiresAt = expiresAt;
            
            // Refactored to use the new commit wrapper
            this.app.commit();
            
            window.notificationManager?.showToast(window.i18n.t('comp.membership.activated').replace('{plan}', displayType), 'success');
        } catch (err) {
            console.error('Abonelik hatası:', err);
            window.notificationManager?.showToast(window.i18n.t('comp.membership.activate_failed') + ': ' + err.message, 'error');
        }
    }

    async fetchHistory() {
        const historyEl = document.getElementById('membership-history-table');
        if (!historyEl) return;

        try {
            const data = this.app.state.subscriptionType !== 'none' && this.app.state.subscriptionExpiresAt 
                ? [{ created_at: new Date().toISOString(), description: window.i18n.t('comp.membership.premium_sub') }]
                : [];

            if (data.length === 0) {
                historyEl.innerHTML = `<div style="text-align: center; padding: 2rem;">${window.i18n.t('comp.membership.no_records')}</div>`;
                return;
            }

            let html = `
                <table class="pruva-table">
                    <thead>
                        <tr>
                            <th>${window.i18n.t('comp.membership.col_date')}</th>
                            <th>${window.i18n.t('comp.membership.col_plan')}</th>
                            <th>${window.i18n.t('comp.membership.col_payment')}</th>
                            <th>${window.i18n.t('comp.membership.col_status')}</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(tx => {
                const date = new Date(tx.created_at);
                const formattedDate = date.toLocaleDateString('tr-TR');
                
                html += `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>
                            <div style="font-weight: 600;">PREMIUM</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${window.i18n.t('comp.membership.monthly_sub')}</div>
                        </td>
                        <td>
                            <div class="price-cell" style="font-weight: 600;">
                                ₺1250
                            </div>
                        </td>
                        <td><span class="status-badge success">${window.i18n.t('comp.membership.status_success')}</span></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            historyEl.innerHTML = html;
            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            historyEl.innerHTML = `<p class="error-text">${window.i18n.t('comp.membership.history_error')}</p>`;
        }
    }
}

window.MembershipManager = MembershipManager;