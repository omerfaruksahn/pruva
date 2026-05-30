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
        if (!confirm(`${displayType} planı başlatmak istiyor musunuz? (₺${price}/Ay)`)) return;

        window.notificationManager?.showToast('Ödeme işleniyor...', 'info');

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
            
            window.notificationManager?.showToast(`${displayType} aboneliğiniz aktif edildi!`, 'success');
        } catch (err) {
            console.error('Abonelik hatası:', err);
            window.notificationManager?.showToast('Abonelik başlatılamadı: ' + err.message, 'error');
        }
    }

    async fetchHistory() {
        const historyEl = document.getElementById('membership-history-table');
        if (!historyEl) return;

        try {
            const data = this.app.state.subscriptionType !== 'none' && this.app.state.subscriptionExpiresAt 
                ? [{ created_at: new Date().toISOString(), description: 'PREMIUM Abonelik' }]
                : [];

            if (data.length === 0) {
                historyEl.innerHTML = '<div style="text-align: center; padding: 2rem;">Henüz bir ödeme kaydı bulunmuyor.</div>';
                return;
            }

            let html = `
                <table class="pruva-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Plan</th>
                            <th>Ödeme</th>
                            <th>Durum</th>
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
                            <div style="font-size: 0.75rem; color: var(--text-muted);">Aylık Abonelik</div>
                        </td>
                        <td>
                            <div class="price-cell" style="font-weight: 600;">
                                ₺1250
                            </div>
                        </td>
                        <td><span class="status-badge success">Başarılı</span></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            historyEl.innerHTML = html;
            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            historyEl.innerHTML = '<p class="error-text">Geçmiş yüklenirken bir hata oluştu.</p>';
        }
    }
}

window.MembershipManager = MembershipManager;