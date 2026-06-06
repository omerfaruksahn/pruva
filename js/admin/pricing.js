// ─── PRUVA Admin Panel — Fiyatlama AI Gözetimi ───
import { utils, paginate, PAGE_SIZE } from './utils.js';

export function renderPricing(state) {
    // PG offline guard
    if (!state.pgOnline) {
        return `
        <div class="card">
            <div class="card-body">
                ${utils.emptyState('database', 'PostgreSQL bağlantısı gerekli. Fiyatlama verileri PostgreSQL veritabanında saklanmaktadır.')}
            </div>
        </div>`;
    }

    const subTab = state.activeSubTab || 'rfqs';

    let html = `
    <div class="sub-tabs">
        <button class="sub-tab ${subTab === 'rfqs' ? 'active' : ''}" onclick="window.adminActions.setSubTab('rfqs')">
            <i data-lucide="file-text"></i> RFQ'lar
        </button>
        <button class="sub-tab ${subTab === 'aksiyonlar' ? 'active' : ''}" onclick="window.adminActions.setSubTab('aksiyonlar')">
            <i data-lucide="zap"></i> Aksiyonlar
        </button>
        <button class="sub-tab ${subTab === 'fiyatlar' ? 'active' : ''}" onclick="window.adminActions.setSubTab('fiyatlar')">
            <i data-lucide="tag"></i> Taşıyıcı Fiyatları
        </button>
        <button class="sub-tab ${subTab === 'tasiyicilar' ? 'active' : ''}" onclick="window.adminActions.setSubTab('tasiyicilar')">
            <i data-lucide="truck"></i> Taşıyıcılar
        </button>
        <button class="sub-tab ${subTab === 'musteriler' ? 'active' : ''}" onclick="window.adminActions.setSubTab('musteriler')">
            <i data-lucide="building-2"></i> Müşteriler
        </button>
    </div>`;

    switch (subTab) {
        case 'rfqs':       html += renderRFQs(state); break;
        case 'aksiyonlar': html += renderActions(state); break;
        case 'fiyatlar':   html += renderRates(state); break;
        case 'tasiyicilar': html += renderCarriers(state); break;
        case 'musteriler': html += renderCustomers(state); break;
        default:           html += renderRFQs(state); break;
    }

    return html;
}

// ─── RFQ'lar ───
function renderRFQs(state) {
    const search = utils.norm(state.filters?.search || '');
    let rfqs = (state.pgData?.rfqs || []).filter(r => {
        if (!search) return true;
        return utils.norm(r.sender_email || '').includes(search)
            || utils.norm(r.subject || '').includes(search)
            || utils.norm(r.status || '').includes(search);
    });

    rfqs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const pg = paginate(rfqs, state.filters?.page || 1);

    const modeLabels = { sea: '🚢 Deniz', air: '✈️ Hava', road: '🚛 Kara', rail: '🚂 Demir' };

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="file-text"></i> RFQ'lar</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Gönderen, konu veya durum ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('file-text', 'RFQ bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Gönderen</th>
                            <th>Konu</th>
                            <th>Mod</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const r of pg.items) {
            const mode = modeLabels[r.transport_mode] || utils.esc(r.transport_mode || '—');
            html += `
                        <tr class="clickable-row" onclick="window.adminActions.viewRFQ && window.adminActions.viewRFQ('${utils.esc(r.id || '')}')">
                            <td><code>${utils.shortId(r.id)}</code></td>
                            <td>${utils.esc(r.sender_email || '—')}</td>
                            <td>${utils.esc(r.subject || '—')}</td>
                            <td>${mode}</td>
                            <td>${utils.statusBadge(r.status)}</td>
                            <td>${utils.formatDateTime(r.created_at)}</td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;
        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `</div></div>`;
    return html;
}

// ─── Aksiyonlar ───
function renderActions(state) {
    const search = utils.norm(state.filters?.search || '');
    let actions = (state.pgData?.pricingActions || []).filter(a => {
        if (!search) return true;
        return utils.norm(a.action_type || '').includes(search)
            || utils.norm(a.title || '').includes(search)
            || utils.norm(a.status || '').includes(search);
    });

    actions.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const pg = paginate(actions, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="zap"></i> AI Aksiyonları</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Aksiyon türü veya başlık ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('zap', 'Aksiyon bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>RFQ</th>
                            <th>Tür</th>
                            <th>Başlık</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const a of pg.items) {
            const isPending = (a.status || '').toUpperCase() === 'PENDING';
            html += `
                        <tr>
                            <td><code>${utils.shortId(a.id)}</code></td>
                            <td><code>${utils.shortId(a.rfq_id)}</code></td>
                            <td>${utils.esc(a.action_type || '—')}</td>
                            <td>${utils.esc(a.title || '—')}</td>
                            <td>${utils.statusBadge(a.status)}</td>
                            <td>${utils.formatDateTime(a.created_at)}</td>
                            <td class="action-cell">
                                ${isPending ? `
                                <button class="btn btn-primary btn-sm" onclick="window.adminActions.approvePricingAction('${utils.esc(a.id || '')}')">
                                    <i data-lucide="check"></i> Onayla
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="window.adminActions.rejectPricingAction('${utils.esc(a.id || '')}')">
                                    <i data-lucide="x"></i> Reddet
                                </button>` : '<span class="text-muted">—</span>'}
                            </td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;
        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `</div></div>`;
    return html;
}

// ─── Taşıyıcı Fiyatları ───
function renderRates(state) {
    const search = utils.norm(state.filters?.search || '');
    let rates = (state.pgData?.pricingRates || []).filter(r => {
        if (!search) return true;
        return utils.norm(r.carrier_name || '').includes(search)
            || utils.norm(r.status || '').includes(search);
    });

    rates.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const pg = paginate(rates, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="tag"></i> Taşıyıcı Fiyatları</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Taşıyıcı adı ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('tag', 'Fiyat verisi bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Taşıyıcı</th>
                            <th>Fiyat</th>
                            <th>Transit Süresi</th>
                            <th>Geçerlilik</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const r of pg.items) {
            const price = r.extracted_price != null
                ? utils.formatCurrency(r.extracted_price, r.currency || 'USD')
                : '—';
            const transit = r.transit_time ? utils.esc(r.transit_time) : '—';
            const validity = r.valid_until ? utils.formatDate(r.valid_until) : '—';

            html += `
                        <tr>
                            <td><strong>${utils.esc(r.carrier_name || '—')}</strong></td>
                            <td>${price}</td>
                            <td>${transit}</td>
                            <td>${validity}</td>
                            <td>${utils.statusBadge(r.status)}</td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;
        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `</div></div>`;
    return html;
}

// ─── Taşıyıcılar ───
function renderCarriers(state) {
    const search = utils.norm(state.filters?.search || '');
    let carriers = (state.pgData?.pricingCarriers || []).filter(c => {
        if (!search) return true;
        return utils.norm(c.name || '').includes(search)
            || utils.norm(c.email || '').includes(search)
            || utils.norm(c.category || '').includes(search);
    });

    carriers.sort((a, b) => (b.preference_score || 0) - (a.preference_score || 0));
    const pg = paginate(carriers, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="truck"></i> Taşıyıcılar</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Ad, e-posta veya kategori ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('truck', 'Taşıyıcı bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Ad</th>
                            <th>E-Posta</th>
                            <th>Kategori</th>
                            <th>Bölgeler</th>
                            <th>Mod</th>
                            <th>Tercih Puanı</th>
                            <th>Aktif?</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const c of pg.items) {
            const regions = Array.isArray(c.regions) ? c.regions.join(', ') : utils.esc(c.regions || '—');
            const modes = Array.isArray(c.transport_modes) ? c.transport_modes.join(', ') : utils.esc(c.transport_mode || c.transport_modes || '—');
            const score = c.preference_score || 0;
            const stars = '★'.repeat(Math.min(Math.round(score), 5)) + '☆'.repeat(Math.max(5 - Math.round(score), 0));
            const activeIcon = c.is_active !== false
                ? '<span class="status-badge active">Aktif</span>'
                : '<span class="status-badge expired">Pasif</span>';

            html += `
                        <tr>
                            <td><strong>${utils.esc(c.name || '—')}</strong></td>
                            <td>${utils.esc(c.email || '—')}</td>
                            <td>${utils.esc(c.category || '—')}</td>
                            <td>${regions}</td>
                            <td>${modes}</td>
                            <td><span class="stars">${stars}</span> <small>(${score})</small></td>
                            <td>${activeIcon}</td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;
        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `</div></div>`;
    return html;
}

// ─── Müşteriler ───
function renderCustomers(state) {
    const search = utils.norm(state.filters?.search || '');
    let customers = (state.pgData?.pricingCustomers || []).filter(c => {
        if (!search) return true;
        return utils.norm(c.company_name || c.name || '').includes(search)
            || utils.norm(c.email || '').includes(search);
    });

    customers.sort((a, b) => (b.monthly_volume || 0) - (a.monthly_volume || 0));
    const pg = paginate(customers, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="building-2"></i> Müşteriler</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Firma veya e-posta ara..."
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('building-2', 'Müşteri bulunamadı');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Firma</th>
                            <th>E-Posta</th>
                            <th>Bölgeler</th>
                            <th>Aylık Hacim</th>
                            <th>Fiyat Hassasiyeti</th>
                            <th>Tür</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const c of pg.items) {
            const regions = Array.isArray(c.regions) ? c.regions.join(', ') : utils.esc(c.regions || '—');
            const sensitivity = c.price_sensitivity != null
                ? `<span class="sensitivity-bar" title="${c.price_sensitivity}/10">${'●'.repeat(Math.min(Math.round(c.price_sensitivity), 10))}${'○'.repeat(Math.max(10 - Math.round(c.price_sensitivity), 0))}</span>`
                : '—';

            html += `
                        <tr>
                            <td><strong>${utils.esc(c.company_name || c.name || '—')}</strong></td>
                            <td>${utils.esc(c.email || '—')}</td>
                            <td>${regions}</td>
                            <td>${utils.formatNumber(c.monthly_volume || 0)}</td>
                            <td>${sensitivity}</td>
                            <td>${utils.esc(c.customer_type || c.type || '—')}</td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;
        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `</div></div>`;
    return html;
}
