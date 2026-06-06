// ─── PRUVA Admin Panel — Kullanıcı Profilleri Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';

function renderStars(rating) {
    const r = Number(rating) || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i data-lucide="star" class="star-full"></i>';
    if (half) html += '<i data-lucide="star-half" class="star-half"></i>';
    for (let i = 0; i < empty; i++) html += '<i data-lucide="star" class="star-empty"></i>';
    return `<span class="stars" title="${r.toFixed(1)}">${html} <small>${r.toFixed(1)}</small></span>`;
}

export function renderUsers(state) {
    const filters = state.filters || {};
    const search = utils.norm(filters.search || '');
    const roleFilter = filters.status || 'all';   // reusing status filter for role
    const page = filters.page || 1;
    const allUsers = state.users || [];

    // ─── Filtreleme ───
    let filtered = allUsers;

    if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (search) {
        filtered = filtered.filter(u =>
            utils.norm(u.displayName || u.companyName).includes(search) ||
            utils.norm(u.email).includes(search)
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
                <input type="text" placeholder="İsim veya e-posta ara..."
                    value="${utils.esc(filters.search || '')}"
                    oninput="window.adminActions.setFilter('search', this.value)" />
            </div>
            <select class="filter-select" onchange="window.adminActions.setFilter('status', this.value)">
                <option value="all" ${roleFilter === 'all' ? 'selected' : ''}>Tüm Roller</option>
                <option value="loader" ${roleFilter === 'loader' ? 'selected' : ''}>Yük Veren</option>
                <option value="carrier" ${roleFilter === 'carrier' ? 'selected' : ''}>Taşıyıcı</option>
                <option value="admin" ${roleFilter === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
        </div>
        <div class="toolbar-right">
            <span class="result-count"><i data-lucide="users"></i> ${filtered.length} kullanıcı</span>
        </div>
    </div>`;

    // ─── Tablo ───
    if (items.length === 0) {
        return `
        <div class="tab-content-inner">
            ${toolbar}
            <div class="card">
                <div class="card-body">
                    ${utils.emptyState('users', 'Filtreye uygun kullanıcı bulunamadı.')}
                </div>
            </div>
        </div>`;
    }

    const rows = items.map(u => {
        const uid = u.id || u.uid;
        return `
        <tr>
            <td>
                <div class="user-cell">
                    <div>
                        <div class="user-name">${utils.esc(u.displayName || u.companyName || '—')}</div>
                        <div class="user-email">${utils.esc(u.email || '—')}</div>
                    </div>
                </div>
            </td>
            <td>${utils.roleTag(u.role)}</td>
            <td>${renderStars(u.overallRating)}</td>
            <td>
                <span class="badge-count">${u.completedJobs || 0}</span>
            </td>
            <td>${utils.formatDate(u.createdAt)}</td>
            <td>${utils.statusBadge(u.status)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="window.adminActions.viewUserDetail('${uid}')" title="Detayları Gör">
                    <i data-lucide="eye"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    return `
    <div class="tab-content-inner">
        ${toolbar}
        <div class="card">
            <div class="card-body table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Rol</th>
                            <th>Performans</th>
                            <th>Tamamlanan İş</th>
                            <th>Kayıt Tarihi</th>
                            <th>Durum</th>
                            <th>Detay</th>
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
