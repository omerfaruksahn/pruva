// ─── PRUVA Admin Panel — Şirket Yönetimi Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';

export function renderCompanies(state) {
    const filters = state.filters || {};
    const search = utils.norm(filters.search || '');
    const statusFilter = filters.status || 'all';
    const page = filters.page || 1;
    const allUsers = state.users || [];

    // ─── Filtreleme ───
    let filtered = allUsers;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(u => u.status === statusFilter);
    }

    if (search) {
        filtered = filtered.filter(u =>
            utils.norm(u.companyName || u.displayName).includes(search) ||
            utils.norm(u.email).includes(search) ||
            utils.norm(u.phone).includes(search)
        );
    }

    // ─── Pagination ───
    const pg = paginate(filtered, page);
    const items = pg.items;

    // ─── Toolbar ───
    const toolbar = `
    <div class="toolbar">
        <div class="toolbar-left">
            <div class="search-box">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Şirket, e-posta veya telefon ara..."
                    value="${utils.esc(filters.search || '')}"
                    oninput="window.adminActions.setFilter('search', this.value)" />
            </div>
            <select class="filter-select" onchange="window.adminActions.setFilter('status', this.value)">
                <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Tüm Durumlar</option>
                <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>Aktif</option>
                <option value="pending_approval" ${statusFilter === 'pending_approval' ? 'selected' : ''}>Onay Bekliyor</option>
                <option value="blocked" ${statusFilter === 'blocked' ? 'selected' : ''}>Engelli</option>
            </select>
        </div>
        <div class="toolbar-right">
            <span class="result-count"><i data-lucide="building-2"></i> ${filtered.length} şirket</span>
        </div>
    </div>`;

    // ─── Tablo ───
    if (items.length === 0) {
        return `
        <div class="tab-content-inner">
            ${toolbar}
            <div class="card">
                <div class="card-body">
                    ${utils.emptyState('building-2', 'Filtreye uygun şirket bulunamadı.')}
                </div>
            </div>
        </div>`;
    }

    const rows = items.map(u => {
        const expanded = u._expanded;
        const membershipOptions = ['free', 'premium', 'enterprise'].map(m =>
            `<option value="${m}" ${(u.membership || 'free') === m ? 'selected' : ''}>${m.charAt(0).toUpperCase() + m.slice(1)}</option>`
        ).join('');

        const detailRow = expanded ? `
        <tr class="detail-row">
            <td colspan="6">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">ID</span>
                        <span class="detail-value">${utils.esc(u.id || u.uid)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Telefon</span>
                        <span class="detail-value">${utils.esc(u.phone || '—')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Şirket Adı</span>
                        <span class="detail-value">${utils.esc(u.companyName || '—')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Vergi Dairesi</span>
                        <span class="detail-value">${utils.esc(u.taxOffice || '—')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">VKN</span>
                        <span class="detail-value">${utils.esc(u.vkn || '—')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Adres</span>
                        <span class="detail-value">${utils.esc(u.address || '—')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Kayıt Tarihi</span>
                        <span class="detail-value">${utils.formatDateTime(u.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sektör</span>
                        <span class="detail-value">${utils.esc(u.sector || '—')}</span>
                    </div>
                </div>
            </td>
        </tr>` : '';

        return `
        <tr class="clickable-row ${expanded ? 'expanded' : ''}" onclick="window.adminActions.toggleUserDetails('${u.id || u.uid}')">
            <td>
                <div class="user-cell">
                    <i data-lucide="${expanded ? 'chevron-down' : 'chevron-right'}" class="expand-icon"></i>
                    <div>
                        <div class="user-name">${utils.esc(u.companyName || u.displayName || '—')}</div>
                        <div class="user-email">${utils.esc(u.email || '—')}</div>
                    </div>
                </div>
            </td>
            <td>${utils.roleTag(u.role)}</td>
            <td>${utils.statusBadge(u.status)}</td>
            <td onclick="event.stopPropagation()">
                <select class="membership-select" onchange="window.adminActions.updateMembership('${u.id || u.uid}', this.value)">
                    ${membershipOptions}
                </select>
            </td>
            <td onclick="event.stopPropagation()">
                <div class="action-btns">
                    ${u.status === 'pending_approval' ? `
                    <button class="btn btn-sm btn-primary" onclick="window.adminActions.approveUser('${u.id || u.uid}')" title="Onayla">
                        <i data-lucide="check"></i>
                    </button>` : ''}
                    ${u.status !== 'blocked' ? `
                    <button class="btn btn-sm btn-danger" onclick="window.adminActions.updateUserStatus('${u.id || u.uid}', 'blocked')" title="Engelle">
                        <i data-lucide="ban"></i>
                    </button>` : `
                    <button class="btn btn-sm btn-primary" onclick="window.adminActions.updateUserStatus('${u.id || u.uid}', 'active')" title="Aktifleştir">
                        <i data-lucide="check-circle"></i>
                    </button>`}
                </div>
            </td>
        </tr>
        ${detailRow}`;
    }).join('');

    return `
    <div class="tab-content-inner">
        ${toolbar}
        <div class="card">
            <div class="card-body table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Şirket</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th>Üyelik</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        ${utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage')}
    </div>`;
}
