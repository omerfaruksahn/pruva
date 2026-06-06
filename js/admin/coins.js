// ─── PRUVA Admin Panel — Coin Yönetimi ───
import { utils, paginate, PAGE_SIZE } from './utils.js';

export function renderCoins(state) {
    // PG offline guard
    if (!state.pgOnline) {
        return `
        <div class="card">
            <div class="card-body">
                ${utils.emptyState('database', 'PostgreSQL bağlantısı gerekli. Coin verileri PostgreSQL veritabanında saklanmaktadır.')}
            </div>
        </div>`;
    }

    const subTab = state.activeSubTab || 'bakiyeler';
    const search = utils.norm(state.filters?.search || '');

    let html = `
    <div class="sub-tabs">
        <button class="sub-tab ${subTab === 'bakiyeler' ? 'active' : ''}" onclick="window.adminActions.setSubTab('bakiyeler')">
            <i data-lucide="wallet"></i> Bakiyeler
        </button>
        <button class="sub-tab ${subTab === 'islem-gecmisi' ? 'active' : ''}" onclick="window.adminActions.setSubTab('islem-gecmisi')">
            <i data-lucide="history"></i> İşlem Geçmişi
        </button>
    </div>`;

    if (subTab === 'bakiyeler') {
        html += renderBalances(state, search);
    } else {
        html += renderTransactions(state, search);
    }

    return html;
}

function renderBalances(state, search) {
    let balances = (state.pgData?.coinBalances || []).filter(b => {
        if (!search) return true;
        return utils.norm(b.email || '').includes(search) || utils.norm(b.role || '').includes(search);
    });

    // Sort by coin_balance descending
    balances.sort((a, b) => (b.coin_balance || 0) - (a.coin_balance || 0));

    const pg = paginate(balances, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="wallet"></i> Coin Bakiyeleri</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="E-posta ara..." 
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('coins', 'Coin bakiyesi bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>E-Posta</th>
                            <th>Rol</th>
                            <th>Bakiye</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const b of pg.items) {
            const userId = b.user_id || b.userId || b.id;
            html += `
                        <tr>
                            <td>${utils.esc(b.email || '—')}</td>
                            <td>${utils.roleTag(b.role)}</td>
                            <td><strong class="coin-value">${utils.formatNumber(b.coin_balance || 0)}</strong> <i data-lucide="circle-dollar-sign" style="width:14px;height:14px;color:var(--accent)"></i></td>
                            <td class="action-cell">
                                <button class="btn btn-primary btn-sm" onclick="window.adminActions.grantCoins('${utils.esc(userId)}')">
                                    <i data-lucide="plus-circle"></i> Coin Ver
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="window.adminActions.deductCoins('${utils.esc(userId)}')">
                                    <i data-lucide="minus-circle"></i> Coin Düş
                                </button>
                            </td>
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

function renderTransactions(state, search) {
    let txns = (state.pgData?.coinTransactions || []).filter(t => {
        if (!search) return true;
        return utils.norm(t.email || '').includes(search) || utils.norm(t.description || '').includes(search);
    });

    // Sort by date descending
    txns.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

    const pg = paginate(txns, state.filters?.page || 1);

    const typeLabels = {
        purchase: 'Satın Alma',
        usage: 'Kullanım',
        reward: 'Ödül',
        grant: 'Yönetici',
        deduct: 'Düşürme'
    };

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="history"></i> İşlem Geçmişi</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="E-posta veya açıklama ara..." 
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('history', 'İşlem geçmişi bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>E-Posta</th>
                            <th>Tür</th>
                            <th>Miktar</th>
                            <th>Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const t of pg.items) {
            const amount = t.amount || 0;
            const isPositive = amount >= 0;
            const amountClass = isPositive ? 'text-success' : 'text-danger';
            const amountPrefix = isPositive ? '+' : '';
            const typeLabel = typeLabels[t.type] || utils.esc(t.type || '—');

            html += `
                        <tr>
                            <td>${utils.formatDateTime(t.created_at || t.createdAt)}</td>
                            <td>${utils.esc(t.email || '—')}</td>
                            <td><span class="status-badge pending">${typeLabel}</span></td>
                            <td><strong class="${amountClass}">${amountPrefix}${utils.formatNumber(amount)}</strong></td>
                            <td class="text-muted">${utils.esc(t.description || '—')}</td>
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
