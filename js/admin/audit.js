// ─── PRUVA Admin Panel — Denetim Günlüğü ───
import { utils, paginate, PAGE_SIZE } from './utils.js';

export function renderAudit(state) {
    // PG offline guard
    if (!state.pgOnline) {
        return `
        <div class="card">
            <div class="card-body">
                ${utils.emptyState('database', 'PostgreSQL bağlantısı gerekli. Denetim günlükleri PostgreSQL veritabanında saklanmaktadır.')}
            </div>
        </div>`;
    }

    const search = utils.norm(state.filters?.search || '');
    const statusFilter = state.filters?.status || 'all';

    let logs = (state.pgData?.auditLogs || []).filter(l => {
        // Filter by action type
        if (statusFilter !== 'all') {
            if ((l.action || '').toUpperCase() !== statusFilter.toUpperCase()) return false;
        }
        // Filter by search text
        if (search) {
            return utils.norm(l.action || '').includes(search)
                || utils.norm(l.entity_type || '').includes(search)
                || utils.norm(l.email || l.user_email || '').includes(search)
                || utils.norm(l.entity_id || '').includes(search);
        }
        return true;
    });

    // Sort by date descending
    logs.sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));

    const pg = paginate(logs, state.filters?.page || 1);

    const actionTypes = ['all', 'CREATE', 'UPDATE', 'DELETE', 'ACCEPT'];
    const actionLabels = { all: 'Tümü', CREATE: 'Oluşturma', UPDATE: 'Güncelleme', DELETE: 'Silme', ACCEPT: 'Onay' };

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="shield-check"></i> Denetim Günlüğü</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="İşlem, varlık tipi veya kullanıcı ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
                <select class="form-control filter-select"
                        onchange="window.adminActions.setFilter('status', this.value)">
                    ${actionTypes.map(t => `<option value="${t}" ${statusFilter === t ? 'selected' : ''}>${actionLabels[t] || t}</option>`).join('')}
                </select>
                <button class="btn btn-outline" onclick="window.adminActions.exportAuditLogs()">
                    <i data-lucide="download"></i> Dışa Aktar
                </button>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('shield-check', 'Denetim kaydı bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Kullanıcı</th>
                            <th>İşlem</th>
                            <th>Varlık Tipi</th>
                            <th>Varlık ID</th>
                            <th>Detaylar</th>
                        </tr>
                    </thead>
                    <tbody>`;

        const actionBadgeMap = {
            CREATE: 'active',
            UPDATE: 'pending',
            DELETE: 'blocked',
            ACCEPT: 'completed'
        };

        for (const l of pg.items) {
            const action = (l.action || '').toUpperCase();
            const badgeCls = actionBadgeMap[action] || 'expired';
            const details = l.details || l.changes || '';
            const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
            const truncDetails = detailStr.length > 60
                ? utils.esc(detailStr.substring(0, 60)) + '…'
                : utils.esc(detailStr);

            html += `
                        <tr>
                            <td>${utils.formatDateTime(l.created_at || l.timestamp)}</td>
                            <td>${utils.esc(l.email || l.user_email || '—')}</td>
                            <td><span class="status-badge ${badgeCls}">${utils.esc(l.action || '—')}</span></td>
                            <td><code>${utils.esc(l.entity_type || '—')}</code></td>
                            <td><code>${utils.shortId(l.entity_id)}</code></td>
                            <td class="text-muted" title="${utils.esc(detailStr)}">${truncDetails || '—'}</td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;

        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `
        </div>
    </div>`;

    return html;
}
