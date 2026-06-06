// ─── PRUVA Admin Panel — İlan Yönetimi Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';

export function renderAds(state) {
    const filters = state.filters || {};
    const search = utils.norm(filters.search || '');
    const statusFilter = filters.status || 'all';
    const page = filters.page || 1;
    const allAds = state.ads || [];

    // ─── Filtreleme ───
    let filtered = allAds;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (search) {
        filtered = filtered.filter(a =>
            utils.norm(a.origin).includes(search) ||
            utils.norm(a.destination).includes(search) ||
            utils.norm(a.ownerName || a.owner).includes(search) ||
            utils.norm(a.cargoType).includes(search)
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
                <input type="text" placeholder="İlan, rota veya sahip ara..."
                    value="${utils.esc(filters.search || '')}"
                    oninput="window.adminActions.setFilter('search', this.value)" />
            </div>
            <select class="filter-select" onchange="window.adminActions.setFilter('status', this.value)">
                <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Tüm Durumlar</option>
                <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Bekliyor</option>
                <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>Aktif</option>
                <option value="expired" ${statusFilter === 'expired' ? 'selected' : ''}>Süresi Dolmuş</option>
            </select>
        </div>
        <div class="toolbar-right">
            <span class="result-count"><i data-lucide="list"></i> ${filtered.length} ilan</span>
        </div>
    </div>`;

    // ─── Tablo ───
    if (items.length === 0) {
        return `
        <div class="tab-content-inner">
            ${toolbar}
            <div class="card">
                <div class="card-body">
                    ${utils.emptyState('package', 'Filtreye uygun ilan bulunamadı.')}
                </div>
            </div>
        </div>`;
    }

    const rows = items.map(ad => {
        const bidCount = (ad.bids && ad.bids.length) || ad.bidCount || 0;
        const statusOptions = ['pending', 'active', 'expired'].map(s =>
            `<option value="${s}" ${ad.status === s ? 'selected' : ''}>${utils.statusBadge(s).replace(/<[^>]+>/g, '')}</option>`
        ).join('');

        return `
        <tr>
            <td>
                <div class="route-cell">
                    <i data-lucide="map-pin" class="text-muted"></i>
                    <span>${utils.esc(ad.origin)}</span>
                    <i data-lucide="arrow-right" class="text-muted"></i>
                    <span>${utils.esc(ad.destination)}</span>
                </div>
            </td>
            <td>${utils.esc(ad.ownerName || ad.owner || '—')}</td>
            <td>${utils.esc(ad.cargoType || '—')}</td>
            <td><span class="badge-count">${bidCount}</span></td>
            <td>
                <select class="status-select" onchange="window.adminActions.updateAdStatus('${ad.id}', this.value)">
                    ${statusOptions}
                </select>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-outline" onclick="window.adminActions.editAd('${ad.id}')" title="Düzenle">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="window.adminActions.viewBids('${ad.id}')" title="Teklifleri Gör">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.adminActions.deleteAd('${ad.id}')" title="Sil">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
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
                            <th>Rota</th>
                            <th>Sahip</th>
                            <th>Yük Tipi</th>
                            <th>Teklifler</th>
                            <th>Durum</th>
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
