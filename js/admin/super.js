// ─── PRUVA Admin Panel — Süper Admin Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';

export function renderSuper(state) {
    // ─── Backend Çevrimdışı ───
    if (!state.backendOnline) {
        return `
        <div class="tab-content-inner">
            <div class="card">
                <div class="card-header">
                    <h3><i data-lucide="shield"></i> Süper Admin</h3>
                </div>
                <div class="card-body">
                    <div class="offline-state">
                        <i data-lucide="wifi-off"></i>
                        <h4>Backend Sunucusu Çevrimdışı</h4>
                        <p class="text-muted">Süper admin işlemleri için backend sunucusunun çalışıyor olması gerekir.</p>
                        <button class="btn btn-primary" onclick="window.adminActions.refreshData()">
                            <i data-lucide="refresh-cw"></i> Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    const authUsers = state.authUsers || [];
    const firestoreUsers = state.users || [];
    const firestoreIds = new Set(firestoreUsers.map(u => u.id || u.uid));

    if (authUsers.length === 0) {
        return `
        <div class="tab-content-inner">
            <div class="card">
                <div class="card-header">
                    <h3><i data-lucide="shield"></i> Süper Admin</h3>
                </div>
                <div class="card-body">
                    ${utils.emptyState('users', 'Auth kullanıcı verisi bulunamadı.')}
                </div>
            </div>
        </div>`;
    }

    const rows = authUsers.map(u => {
        const isGhost = !firestoreIds.has(u.uid);
        const isAdmin = u.customClaims && u.customClaims.admin;
        const ghostTag = isGhost
            ? `<span class="status-badge expired" title="Firestore kaydı yok">👻 ghost</span>`
            : '';

        return `
        <tr>
            <td>
                <div class="user-cell">
                    <div>
                        <div class="user-name">${utils.esc(u.displayName || '—')} ${ghostTag}</div>
                        <div class="user-email text-muted text-sm">${utils.esc(u.uid)}</div>
                    </div>
                </div>
            </td>
            <td>${utils.esc(u.email || '—')}</td>
            <td>${utils.timeAgo(u.metadata?.lastSignInTime || u.lastSignInTime)}</td>
            <td>
                <button class="btn btn-sm ${isAdmin ? 'btn-primary' : 'btn-outline'}"
                    onclick="window.adminActions.setAdmin('${u.uid}', ${!isAdmin})"
                    title="${isAdmin ? 'Admin yetkisini kaldır' : 'Admin yap'}">
                    <i data-lucide="${isAdmin ? 'shield-check' : 'shield'}"></i>
                    ${isAdmin ? 'Admin' : 'Normal'}
                </button>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-outline" onclick="window.adminActions.syncUser('${u.uid}')" title="Firestore ile senkronize et">
                        <i data-lucide="refresh-cw"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.adminActions.deleteUserFull('${u.uid}')" title="Tamamen sil">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    return `
    <div class="tab-content-inner">
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="shield"></i> Süper Admin — Auth Kullanıcıları</h3>
                <span class="result-count">${authUsers.length} kullanıcı</span>
            </div>
            <div class="card-body table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>E-Posta</th>
                            <th>Son Giriş</th>
                            <th>Yetkiler</th>
                            <th>Kritik İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}
