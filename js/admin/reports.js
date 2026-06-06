// ─── PRUVA Admin Panel — Şikayet / Rapor Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';

export function renderReports(state) {
    const allAds = state.ads || [];

    // ─── Raporlu İlanları Filtrele ───
    const reportedAds = allAds.filter(a => a.reports && a.reports.length > 0);

    // ─── Boş Durum ───
    if (reportedAds.length === 0) {
        return `
        <div class="tab-content-inner">
            <div class="card">
                <div class="card-header">
                    <h3><i data-lucide="flag"></i> Şikayetler</h3>
                </div>
                <div class="card-body">
                    ${utils.emptyState('flag-off', 'Henüz şikayet bulunmuyor. 🎉')}
                </div>
            </div>
        </div>`;
    }

    // ─── Rapor Satırları ───
    const rows = [];
    reportedAds.forEach(ad => {
        ad.reports.forEach((r, idx) => {
            rows.push(`
            <tr>
                <td>
                    <div>
                        <span class="text-muted">#${utils.shortId(ad.id)}</span>
                        <div class="route-cell">
                            <span>${utils.esc(ad.origin)}</span>
                            <i data-lucide="arrow-right" class="text-muted"></i>
                            <span>${utils.esc(ad.destination)}</span>
                        </div>
                    </div>
                </td>
                <td>${utils.esc(ad.ownerName || ad.owner || '—')}</td>
                <td>${utils.esc(r.reporterName || r.reporterId || '—')}</td>
                <td>
                    <div>
                        <strong>${utils.esc(r.reason || '—')}</strong>
                        ${r.description ? `<p class="text-muted text-sm">${utils.esc(r.description)}</p>` : ''}
                    </div>
                </td>
                <td>${utils.timeAgo(r.createdAt || r.date)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-outline" onclick="window.adminActions.dismissReport('${ad.id}', ${idx})" title="Reddet">
                            <i data-lucide="x"></i> Reddet
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.adminActions.punishMaliciousReporter('${ad.id}', ${idx})" title="Cezalandır">
                            <i data-lucide="gavel"></i> Cezalandır
                        </button>
                    </div>
                </td>
            </tr>`);
        });
    });

    return `
    <div class="tab-content-inner">
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="flag"></i> Şikayetler</h3>
                <span class="result-count">${rows.length} şikayet</span>
            </div>
            <div class="card-body table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>İlan No / Rota</th>
                            <th>Yük Sahibi</th>
                            <th>Şikayet Eden</th>
                            <th>Neden & Açıklama</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}
