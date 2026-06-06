// ─── PRUVA Admin Panel — Bildirim Yönetimi ───
import { utils } from './utils.js';

export function renderNotifications(state) {
    const activityLog = (state.activityLog || []).filter(a =>
        (a.type || '').toLowerCase().includes('notification')
        || (a.action || '').toLowerCase().includes('notification')
        || (a.action || '').toLowerCase().includes('broadcast')
    );

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="send"></i> Bildirim Gönder</h3>
        </div>
        <div class="card-body">
            <div class="broadcast-form">
                <div class="form-group">
                    <label for="notif-message">
                        <i data-lucide="message-square"></i> Bildirim Mesajı
                    </label>
                    <textarea id="notif-message" class="form-control" rows="4"
                              placeholder="Kullanıcılara gönderilecek mesajı yazın..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="notif-target">
                            <i data-lucide="users"></i> Hedef Kitle
                        </label>
                        <select id="notif-target" class="form-control">
                            <option value="all">Tüm Kullanıcılar</option>
                            <option value="loader">Sadece Yük Verenler</option>
                            <option value="carrier">Sadece Taşıyıcılar</option>
                        </select>
                    </div>
                    <div class="form-group form-actions">
                        <button class="btn btn-primary" onclick="window.adminActions.broadcastNotification()">
                            <i data-lucide="send"></i> Bildirimi Gönder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header">
            <h3><i data-lucide="bell"></i> Son Bildirimler</h3>
        </div>
        <div class="card-body">`;

    if (activityLog.length === 0) {
        html += utils.emptyState('bell-off', 'Henüz bildirim gönderilmemiş');
    } else {
        html += `
            <div class="activity-list">`;

        for (const entry of activityLog.slice(0, 20)) {
            const targetLabels = {
                all: 'Tüm Kullanıcılar',
                loader: 'Yük Verenler',
                carrier: 'Taşıyıcılar'
            };
            const target = targetLabels[entry.target] || utils.esc(entry.target || 'Tüm Kullanıcılar');
            const msg = utils.esc(entry.message || entry.details || '—');
            const time = utils.timeAgo(entry.timestamp || entry.createdAt);
            const user = utils.esc(entry.performedBy || entry.admin || '—');

            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i data-lucide="bell"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${user}</strong> → <span class="status-badge active">${target}</span>
                        </div>
                        <div class="activity-detail text-muted">${msg}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>`;
        }

        html += `
            </div>`;
    }

    html += `
        </div>
    </div>`;

    return html;
}
