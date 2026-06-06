// ─────────────────────────────────────────────────────────────
// PRUVA ADMIN PANEL V3.0 — Ana Koordinatör
// Sidebar navigasyon, state yönetimi, modül router, veri yükleme
// ─────────────────────────────────────────────────────────────

import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './admin/utils.js';
import { renderDashboard, initDashboardCharts } from './admin/dashboard.js';
import { renderAds } from './admin/ads.js';
import { renderCompanies } from './admin/companies.js';
import { renderUsers } from './admin/users.js';
import { renderChats } from './admin/chats.js';
import { renderCoins } from './admin/coins.js';
import { renderPricing } from './admin/pricing.js';
import { renderCourses } from './admin/courses.js';
import { renderReports } from './admin/reports.js';
import { renderNotifications } from './admin/notifications.js';
import { renderAudit } from './admin/audit.js';
import { renderSuper } from './admin/super.js';
import { destroyAll as destroyCharts } from './admin/charts.js';

// ─── GLOBAL STATE ───
const state = {
    // Firestore verileri
    ads: [],
    users: [],
    authUsers: [],
    stats: {},
    chats: [],
    courses: [],

    // PostgreSQL verileri
    pgData: {
        coinBalances: [],
        coinTransactions: [],
        rfqs: [],
        pricingActions: [],
        pricingRates: [],
        pricingCustomers: [],
        pricingCarriers: [],
        auditLogs: []
    },
    trends: { newUsers: [], newAds: [] },

    // UI state
    activeTab: 'dashboard',
    activeSubTab: '',
    filters: { status: 'all', search: '', page: 1 },
    loading: true,
    backendOnline: false,
    pgOnline: false,
    editingAd: null,
    activityLog: [],
    sidebarCollapsed: false
};

// ─── SIDEBAR NAVIGATION CONFIG ───
const NAV_ITEMS = [
    { section: 'Ana Menü' },
    { key: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', subtitle: 'Genel platform durumu' },
    { key: 'ads', icon: 'package', label: 'İlanlar', subtitle: 'İlan yönetimi', countKey: 'pendingAds' },
    { key: 'companies', icon: 'building-2', label: 'Şirketler', subtitle: 'Şirket yönetimi', countKey: 'pendingUsers' },
    { key: 'users', icon: 'users', label: 'Kullanıcılar', subtitle: 'Kullanıcı profilleri' },

    { section: 'İletişim' },
    { key: 'chats', icon: 'message-square', label: 'Mesajlar', subtitle: 'Sohbet moderasyonu' },
    { key: 'notifications', icon: 'bell', label: 'Bildirimler', subtitle: 'Bildirim yönetimi' },

    { section: 'Finans & AI' },
    { key: 'coins', icon: 'coins', label: 'Coin Sistemi', subtitle: 'Sanal para yönetimi' },
    { key: 'pricing', icon: 'brain', label: 'Fiyatlama AI', subtitle: 'AI süreç gözetimi' },

    { section: 'İçerik' },
    { key: 'courses', icon: 'graduation-cap', label: 'Kurslar', subtitle: 'Eğitim içeriği' },
    { key: 'reports', icon: 'alert-triangle', label: 'Şikayetler', subtitle: 'Şikayet bildirimleri' },

    { section: 'Sistem' },
    { key: 'audit', icon: 'scroll-text', label: 'Denetim Logları', subtitle: 'İşlem geçmişi' },
    { key: 'super', icon: 'shield-alert', label: 'Super Admin', subtitle: 'Kritik sistem işlemleri', superTab: true }
];

// ─── ACTIVITY LOG ───
function log(action, detail) {
    state.activityLog.unshift({ action, detail, time: new Date().toISOString() });
    if (state.activityLog.length > 30) state.activityLog.pop();
}

// ─── DATA LOADING ───
async function loadAllData() {
    try {
        // Ana veri (Firestore)
        const data = await api('/all-data');
        if (data.error) throw new Error(data.error);
        state.ads = data.ads || [];
        state.users = data.users || [];
        state.authUsers = data.authUsers || [];
        state.stats = data.stats || {};

        // Premium üye sayısı
        state.stats.premiumUsers = state.users.filter(u => u.subscriptionType === 'premium').length;

        state.loading = false;
        state.backendOnline = true;
    } catch (e) {
        console.error('loadAllData failed:', e);
        state.backendOnline = false;
        state.loading = false;
    }

    // PostgreSQL durumu kontrol et
    try {
        const pgStatus = await api('/pg-status');
        state.pgOnline = pgStatus && pgStatus.status === 'online';
    } catch (e) {
        state.pgOnline = false;
    }

    // Dashboard verileri
    if (state.backendOnline) {
        try {
            const dashStats = await api('/dashboard-stats');
            if (!dashStats.error) {
                Object.assign(state.stats, dashStats);
            }
        } catch (e) { /* silent */ }

        try {
            const trends = await api('/dashboard-trends');
            if (!trends.error) {
                state.trends = trends;
            }
        } catch (e) { /* silent */ }
    }

    updateStatusUI();
    render();
}

// Lazy-load: Sekme değiştiğinde ilgili verileri yükle
async function loadTabData(tab) {
    if (tab === 'chats' && state.chats.length === 0) {
        try {
            const data = await api('/chats');
            if (!data.error) state.chats = data.chats || data || [];
        } catch (e) { /* silent */ }
    }

    if (tab === 'courses' && state.courses.length === 0) {
        try {
            const data = await api('/courses');
            if (!data.error) state.courses = data.courses || data || [];
        } catch (e) { /* silent */ }
    }

    if ((tab === 'coins' || tab === 'pricing' || tab === 'audit') && state.pgOnline) {
        await loadPgData(tab);
    }
}

async function loadPgData(tab) {
    try {
        if (tab === 'coins') {
            const [balances, transactions] = await Promise.all([
                api('/coins/balances'),
                api('/coins/transactions')
            ]);
            if (!balances.error) state.pgData.coinBalances = balances.balances || balances || [];
            if (!transactions.error) state.pgData.coinTransactions = transactions.transactions || transactions || [];
        }

        if (tab === 'pricing') {
            const [rfqs, actions, rates, customers, carriers] = await Promise.all([
                api('/pricing/rfqs'),
                api('/pricing/actions'),
                api('/pricing/rates'),
                api('/pricing/customers'),
                api('/pricing/carriers')
            ]);
            if (!rfqs.error) state.pgData.rfqs = rfqs.rfqs || rfqs || [];
            if (!actions.error) state.pgData.pricingActions = actions.actions || actions || [];
            if (!rates.error) state.pgData.pricingRates = rates.rates || rates || [];
            if (!customers.error) state.pgData.pricingCustomers = customers.customers || customers || [];
            if (!carriers.error) state.pgData.pricingCarriers = carriers.carriers || carriers || [];
        }

        if (tab === 'audit') {
            const logs = await api('/audit-logs');
            if (!logs.error) state.pgData.auditLogs = logs.logs || logs || [];
        }
    } catch (e) {
        console.error('PG data load failed:', e);
    }
}

// ─── STATUS UI ───
function updateStatusUI() {
    const backendEl = document.getElementById('backend-status');
    const pgEl = document.getElementById('pg-status');

    if (backendEl) {
        if (state.backendOnline) {
            backendEl.innerHTML = '<div class="status-dot online"></div> Backend: Online';
        } else {
            backendEl.innerHTML = '<div class="status-dot offline"></div> Backend: Off';
        }
    }

    if (pgEl) {
        pgEl.style.display = state.backendOnline ? 'flex' : 'none';
        if (state.pgOnline) {
            pgEl.innerHTML = '<div class="status-dot online"></div> PG: Online';
        } else {
            pgEl.innerHTML = '<div class="status-dot offline"></div> PG: Off';
        }
    }
}

// ─── SIDEBAR RENDER ───
function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    let html = '';
    NAV_ITEMS.forEach(item => {
        if (item.section) {
            html += `<div class="sidebar-section-title">${item.section}</div>`;
            return;
        }
        const isActive = state.activeTab === item.key;
        const superCls = item.superTab && isActive ? ' super-tab' : '';
        const countHtml = item.countKey && state.stats[item.countKey] > 0
            ? `<span class="nav-count">${state.stats[item.countKey]}</span>` : '';

        html += `<button class="sidebar-nav-item${isActive ? ' active' : ''}${superCls}"
            onclick="window.adminActions.switchTab('${item.key}')">
            <i data-lucide="${item.icon}"></i>
            <span class="sidebar-label">${item.label}</span>
            ${countHtml}
        </button>`;
    });
    nav.innerHTML = html;
}

// ─── PAGE TITLE UPDATE ───
function updatePageTitle(tab) {
    const item = NAV_ITEMS.find(n => n.key === tab);
    const titleEl = document.getElementById('page-title');
    const subEl = document.getElementById('page-subtitle');
    if (titleEl && item) titleEl.textContent = item.label;
    if (subEl && item) subEl.textContent = item.subtitle || '';
}

// ─── MAIN RENDER ───
function render() {
    const container = document.getElementById('admin-main');
    if (!container) return;

    if (!state.backendOnline && state.loading) {
        container.innerHTML = `<div class="offline-state">
            <i data-lucide="wifi-off"></i>
            <h2>Backend Bağlantısı Bekleniyor</h2>
            <p>Admin sunucusunu başlatın:</p>
            <code>node admin-server.js</code>
            <br><br>
            <button class="btn btn-primary" onclick="location.reload()">Yeniden Dene</button>
        </div>`;
        renderSidebar();
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // Grafikleri temizle (tab değiştiğinde)
    destroyCharts();

    // Aktif sekmeye göre içerik render et
    let content = '';
    switch (state.activeTab) {
        case 'dashboard': content = renderDashboard(state); break;
        case 'ads': content = renderAds(state); break;
        case 'companies': content = renderCompanies(state); break;
        case 'users': content = renderUsers(state); break;
        case 'chats': content = renderChats(state); break;
        case 'coins': content = renderCoins(state); break;
        case 'pricing': content = renderPricing(state); break;
        case 'courses': content = renderCourses(state); break;
        case 'reports': content = renderReports(state); break;
        case 'notifications': content = renderNotifications(state); break;
        case 'audit': content = renderAudit(state); break;
        case 'super': content = renderSuper(state); break;
        default: content = renderDashboard(state);
    }

    container.innerHTML = content;
    renderSidebar();
    updatePageTitle(state.activeTab);

    // Lucide ikonlarını init et
    if (window.lucide) window.lucide.createIcons();

    // Dashboard grafiklerini init et (DOM hazır olduktan sonra)
    if (state.activeTab === 'dashboard') {
        requestAnimationFrame(() => initDashboardCharts(state));
    }
}

// ─── EDIT MODAL ───
function showEditModal() {
    const ad = state.editingAd;
    if (!ad) return;

    const body = `<div class="form-grid">
        <div class="form-group"><label>Çıkış</label><input id="edit-origin" value="${utils.esc(ad.origin)}"></div>
        <div class="form-group"><label>Varış</label><input id="edit-destination" value="${utils.esc(ad.destination)}"></div>
        <div class="form-group"><label>Yük Tipi</label><input id="edit-cargo" value="${utils.esc(ad.cargoType)}"></div>
        <div class="form-group"><label>Durum</label><select id="edit-status">
            <option value="pending" ${ad.status === 'pending' ? 'selected' : ''}>Bekliyor</option>
            <option value="active" ${ad.status === 'active' ? 'selected' : ''}>Aktif</option>
        </select></div>
    </div>`;

    const footer = `<button class="btn btn-outline" onclick="window.closeModal()">İptal</button>
        <button class="btn btn-primary" id="modal-save">Kaydet</button>`;

    showModal('İlan Düzenle', 'edit-3', body, footer);

    document.getElementById('modal-save').addEventListener('click', async () => {
        const updates = {
            origin: document.getElementById('edit-origin').value,
            destination: document.getElementById('edit-destination').value,
            cargoType: document.getElementById('edit-cargo').value,
            status: document.getElementById('edit-status').value,
        };
        const d = await api('/update-ad', { adId: String(ad.id), updates });
        if (d.success) {
            toast(d.message || 'İlan güncellendi.', 'success');
            log('İlan Düzenlendi', updates.origin + ' → ' + updates.destination);
            closeModal();
            loadAllData();
        } else {
            toast(d.error || 'Hata', 'error');
        }
    });
}

// ─── BIDS MODAL ───
function showBidsModal(adId) {
    const ad = state.ads.find(a => String(a.id) === String(adId));
    if (!ad) return;

    let bidsHtml = '';
    if (ad.bids && ad.bids.length > 0) {
        const rows = ad.bids.map((b, idx) => `<tr>
            <td><strong>${utils.esc(b.company)}</strong>${b.isGhost ? ' <span class="ghost-tag" style="display:inline-block;margin-left:5px;">Riskli</span>' : ''}</td>
            <td>${utils.esc(b.price)}</td>
            <td>${utils.esc(b.line || '—')}</td>
            <td>${utils.esc(b.time || '—')}</td>
            <td>${utils.esc(b.date || '—')}</td>
            <td class="actions-cell"><button class="btn btn-sm btn-danger" onclick="window.adminActions.deleteBid('${ad.id}', ${idx})" title="Teklifi Sil"><i data-lucide="trash-2"></i></button></td>
        </tr>`).join('');
        bidsHtml = `<div class="table-container" style="max-height:400px;overflow-y:auto"><table>
            <thead><tr><th>Taşıyıcı</th><th>Fiyat</th><th>Hat</th><th>Süre</th><th>Tarih</th><th style="text-align:right">İşlem</th></tr></thead>
            <tbody>${rows}</tbody></table></div>`;
    } else {
        bidsHtml = utils.emptyState('inbox', 'Bu ilana henüz teklif verilmemiş.');
    }

    showModal(`Gelen Teklifler (${utils.esc(ad.origin)} → ${utils.esc(ad.destination)})`, 'banknote', bidsHtml,
        '<button class="btn btn-outline" onclick="window.closeModal()">Kapat</button>', { maxWidth: '700px' });
}

// ─── CHAT MESSAGES MODAL ───
async function showChatMessages(chatId) {
    const data = await api(`/chats/${chatId}/messages`);
    const messages = data.messages || data || [];

    let msgHtml = '';
    if (messages.length > 0) {
        msgHtml = messages.map(m => `<div style="padding:8px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="font-size:0.82rem;">${utils.esc(m.senderName || m.senderId || '?')}</strong>
                <time style="font-size:0.7rem;color:var(--text-secondary)">${utils.formatDateTime(m.timestamp || m.createdAt)}</time>
            </div>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px;">${utils.esc(m.text || m.content || '')}</p>
            <button class="btn btn-sm btn-danger" style="margin-top:4px;" onclick="window.adminActions.deleteMessage('${chatId}','${m.id}')"><i data-lucide="trash-2"></i> Sil</button>
        </div>`).join('');
    } else {
        msgHtml = utils.emptyState('message-square', 'Bu sohbette mesaj bulunmuyor.');
    }

    showModal('Sohbet Mesajları', 'message-square', `<div style="max-height:450px;overflow-y:auto">${msgHtml}</div>`,
        '<button class="btn btn-outline" onclick="window.closeModal()">Kapat</button>', { maxWidth: '650px' });
}

// ─── COURSE MODAL ───
function showCourseModal(course = null) {
    const isEdit = !!course;
    const title = isEdit ? 'Kurs Düzenle' : 'Yeni Kurs Oluştur';
    const body = `<div class="form-grid">
        <div class="form-group full"><label>Başlık</label><input id="course-title" value="${utils.esc(course?.title || '')}"></div>
        <div class="form-group full"><label>Açıklama</label><textarea id="course-desc">${utils.esc(course?.description || '')}</textarea></div>
    </div>`;
    const footer = `<button class="btn btn-outline" onclick="window.closeModal()">İptal</button>
        <button class="btn btn-primary" id="course-save">${isEdit ? 'Güncelle' : 'Oluştur'}</button>`;

    showModal(title, 'graduation-cap', body, footer);

    document.getElementById('course-save').addEventListener('click', async () => {
        const payload = {
            title: document.getElementById('course-title').value,
            description: document.getElementById('course-desc').value,
        };
        let d;
        if (isEdit) {
            d = await api(`/courses/${course.id}`, { ...payload, _method: 'PUT' });
        } else {
            d = await api('/courses', payload);
        }
        if (d.success || d.id) {
            toast(isEdit ? 'Kurs güncellendi.' : 'Kurs oluşturuldu.', 'success');
            log(isEdit ? 'Kurs Güncellendi' : 'Kurs Oluşturuldu', payload.title);
            closeModal();
            state.courses = [];
            await loadTabData('courses');
            render();
        } else {
            toast(d.error || 'Hata', 'error');
        }
    });
}

// ─── COIN MODAL ───
function showCoinModal(userId, type = 'grant') {
    const isGrant = type === 'grant';
    const body = `<div class="form-grid">
        <div class="form-group full"><label>Miktar</label><input id="coin-amount" type="number" min="1" placeholder="Coin miktarı"></div>
        <div class="form-group full"><label>Açıklama</label><input id="coin-desc" placeholder="${isGrant ? 'Ödül, kampanya vb.' : 'Ceza, düzeltme vb.'}"></div>
    </div>`;
    const footer = `<button class="btn btn-outline" onclick="window.closeModal()">İptal</button>
        <button class="btn ${isGrant ? 'btn-success' : 'btn-danger'}" id="coin-save">${isGrant ? 'Coin Ver' : 'Coin Düş'}</button>`;

    showModal(isGrant ? 'Coin Ver' : 'Coin Düş', 'coins', body, footer);

    document.getElementById('coin-save').addEventListener('click', async () => {
        const amount = parseInt(document.getElementById('coin-amount').value);
        const description = document.getElementById('coin-desc').value;
        if (!amount || amount <= 0) return toast('Geçerli bir miktar girin.', 'warning');

        const endpoint = isGrant ? '/coins/grant' : '/coins/deduct';
        const d = await api(endpoint, { userId, amount, description });
        if (d.success) {
            toast(d.message || `${amount} coin ${isGrant ? 'verildi' : 'düşüldü'}.`, 'success');
            log(isGrant ? 'Coin Verildi' : 'Coin Düşüldü', `${userId} → ${amount}`);
            closeModal();
            await loadPgData('coins');
            render();
        } else {
            toast(d.error || 'Hata', 'error');
        }
    });
}

// ─── GLOBAL ACTIONS ───
window.adminActions = {
    // Sidebar
    switchTab: async (tab) => {
        state.activeTab = tab;
        state.activeSubTab = '';
        state.filters = { status: 'all', search: '', page: 1 };
        await loadTabData(tab);
        render();
    },
    switchSubTab: (subTab) => {
        state.activeSubTab = subTab;
        state.filters = { status: 'all', search: '', page: 1 };
        render();
    },
    toggleSidebar: () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    },

    // Filters
    updateFilter: (key, val) => { state.filters[key] = val; if (key !== 'page') state.filters.page = 1; render(); },
    setPage: (page) => { state.filters.page = page; render(); },

    // Ad management
    updateAdStatus: async (adId, status) => {
        const d = await api('/update-ad-status', { adId, status });
        if (d.success) { toast(d.message, 'success'); log('İlan Durumu', adId.substring(0, 6) + '→' + status); loadAllData(); }
        else toast(d.error || 'Hata', 'error');
    },
    editAd: (adId) => {
        state.editingAd = state.ads.find(a => String(a.id) === String(adId));
        if (state.editingAd) showEditModal();
        else toast('İlan bulunamadı', 'error');
    },
    deleteAd: (adId) => {
        showConfirm('Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?', async () => {
            const d = await api('/delete-ad', { adId: String(adId) });
            if (d.success) {
                toast(d.message, 'success');
                log('İlan Silindi', adId.substring(0, 8));
                state.ads = state.ads.filter(a => String(a.id) !== String(adId));
                render();
                setTimeout(loadAllData, 1000);
            } else toast(d.error || 'Silme başarısız', 'error');
        });
    },
    viewBids: (adId) => showBidsModal(adId),
    deleteBid: (adId, bidIndex) => {
        showConfirm('Bu teklifi silmek istediğinize emin misiniz?', async () => {
            const ad = state.ads.find(a => String(a.id) === String(adId));
            if (!ad || !ad.bids) return;
            ad.bids.splice(bidIndex, 1);
            const d = await api('/update-ad', { adId: String(adId), updates: { bids: ad.bids } });
            if (d.success) { toast('Teklif silindi.', 'success'); log('Teklif Silindi', adId.substring(0, 6)); closeModal(); showBidsModal(adId); loadAllData(); }
            else toast(d.error || 'Hata', 'error');
        });
    },

    // User management
    approveUser: async (uid) => {
        const d = await api('/approve-user', { uid });
        if (d.success) { toast(d.message, 'success'); log('Kullanıcı Onaylandı', uid.substring(0, 8)); loadAllData(); }
        else toast(d.error || 'Hata', 'error');
    },
    updateUserStatus: (uid, status) => {
        const label = status === 'blocked' ? 'engellemek' : 'aktif yapmak';
        showConfirm(`Bu kullanıcıyı ${label} istediğinize emin misiniz?`, async () => {
            const d = await api('/update-user-status', { uid, status });
            if (d.success) { toast(d.message, 'success'); log('Durum', uid.substring(0, 8) + '→' + status); loadAllData(); }
            else toast(d.error || 'Hata', 'error');
        });
    },
    updateMembership: async (uid, membership) => {
        const d = await api('/update-user-membership', { uid, membership });
        if (d.success) { toast(d.message, 'success'); log('Üyelik', uid.substring(0, 8) + '→' + membership); loadAllData(); }
        else toast(d.error || 'Hata', 'error');
    },
    toggleUserDetails: (uid) => {
        const el = document.getElementById('user-details-' + uid);
        if (el) el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
    },

    // Super admin
    setAdmin: async (uid, isAdmin) => {
        const d = await api('/set-admin', { uid, isAdmin });
        if (d.success) { toast(isAdmin ? 'Admin yetkisi verildi.' : 'Admin yetkisi kaldırıldı.', 'success'); log('Admin', uid.substring(0, 8) + '→' + isAdmin); loadAllData(); }
        else toast(d.error || 'Hata', 'error');
    },
    deleteUserFull: (uid) => {
        showConfirm('DİKKAT: Bu kullanıcı AUTH+FIRESTORE\'dan kalıcı silinecek!', async () => {
            const d = await api('/delete-user', { uid });
            if (d.success) { toast('Kullanıcı silindi.', 'success'); log('Kullanıcı Silindi', uid.substring(0, 8)); loadAllData(); }
            else toast(d.error || 'Hata', 'error');
        });
    },
    syncUser: async (uid) => {
        const d = await api('/sync-user', { uid });
        if (d.success) { toast('Senkronize edildi.', 'success'); loadAllData(); }
        else toast(d.error || 'Hata', 'error');
    },

    // Reports
    punishMaliciousReporter: (carrierName, adId) => {
        const carrier = state.users.find(u => u.name === carrierName);
        if (!carrier) return toast('Taşıyıcı bulunamadı.', 'error');
        showConfirm(`Taşıyıcı ${carrierName} firmasının bu şikayetinin ASILSIZ olduğunu onaylıyor musunuz? Taşıyıcının puanından -0.2 puan kesilecektir!`, async () => {
            const d = await api('/punish-reporter', { uid: carrier.id, adId, carrierName });
            if (d.success) { toast(d.message, 'success'); log('Asılsız Şikayet Cezası', carrierName); loadAllData(); }
            else toast(d.error || 'Hata', 'error');
        });
    },
    dismissReport: (adId, reportIndex) => {
        showConfirm('Bu şikayeti kapatmak/arşive kaldırmak istediğinize emin misiniz?', async () => {
            const d = await api('/dismiss-report', { adId, reportIndex });
            if (d.success) { toast(d.message, 'success'); log('Şikayet Kapatıldı', 'İlan No: ' + adId); loadAllData(); }
            else toast(d.error || 'Hata', 'error');
        });
    },

    // Chat moderation
    viewChatMessages: (chatId) => showChatMessages(chatId),
    deleteMessage: (chatId, messageId) => {
        showConfirm('Bu mesajı silmek istediğinize emin misiniz?', async () => {
            const d = await api(`/chats/${chatId}/messages/${messageId}`, { _method: 'DELETE' });
            if (d.success) { toast('Mesaj silindi.', 'success'); log('Mesaj Silindi', chatId.substring(0, 6)); showChatMessages(chatId); }
            else toast(d.error || 'Hata', 'error');
        });
    },

    // Coins
    grantCoins: (userId) => showCoinModal(userId, 'grant'),
    deductCoins: (userId) => showCoinModal(userId, 'deduct'),

    // Pricing AI
    approvePricingAction: async (id) => {
        const d = await api(`/pricing/actions/${id}/approve`, {});
        if (d.success) { toast('Aksiyon onaylandı.', 'success'); log('AI Aksiyon Onaylandı', '#' + id); await loadPgData('pricing'); render(); }
        else toast(d.error || 'Hata', 'error');
    },
    rejectPricingAction: async (id) => {
        const d = await api(`/pricing/actions/${id}/reject`, {});
        if (d.success) { toast('Aksiyon reddedildi.', 'warning'); log('AI Aksiyon Reddedildi', '#' + id); await loadPgData('pricing'); render(); }
        else toast(d.error || 'Hata', 'error');
    },

    // Courses
    createCourse: () => showCourseModal(null),
    editCourse: (courseId) => {
        const course = state.courses.find(c => c.id === courseId);
        if (course) showCourseModal(course);
        else toast('Kurs bulunamadı', 'error');
    },
    deleteCourse: (courseId) => {
        showConfirm('Bu kursu silmek istediğinize emin misiniz?', async () => {
            const d = await api(`/courses/${courseId}`, { _method: 'DELETE' });
            if (d.success) {
                toast('Kurs silindi.', 'success');
                log('Kurs Silindi', courseId);
                state.courses = state.courses.filter(c => c.id !== courseId);
                render();
            } else toast(d.error || 'Hata', 'error');
        });
    },

    // Notifications
    broadcastNotification: async () => {
        const message = document.getElementById('broadcast-message')?.value;
        const targetRole = document.getElementById('broadcast-target')?.value || 'all';
        if (!message || !message.trim()) return toast('Bildirim mesajı boş olamaz.', 'warning');
        showConfirm(`Bu bildirim ${targetRole === 'all' ? 'TÜM' : targetRole.toUpperCase()} kullanıcılara gönderilecek. Devam edilsin mi?`, async () => {
            const d = await api('/broadcast-notification', { message, targetRole });
            if (d.success) {
                toast(d.message || 'Bildirim gönderildi.', 'success');
                log('Toplu Bildirim', `${targetRole}: ${message.substring(0, 40)}...`);
                const el = document.getElementById('broadcast-message');
                if (el) el.value = '';
            } else toast(d.error || 'Hata', 'error');
        });
    },

    // Audit
    exportAuditLogs: () => {
        const logs = state.pgData.auditLogs;
        if (!logs.length) return toast('Dışa aktarılacak log yok.', 'warning');
        const csv = 'Tarih,Kullanıcı,İşlem,Varlık Tipi,Varlık ID\n' +
            logs.map(l => `${l.created_at},${l.email || ''},${l.action},${l.entity_type},${l.entity_id}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('CSV indirildi.', 'success');
    },

    // Export
    exportUsers: async () => {
        const data = await api('/export/users');
        if (data.error) return toast(data.error, 'error');
        const users = data.users || data || [];
        const csv = 'Ad,E-Posta,Rol,Durum,Kayıt Tarihi\n' +
            users.map(u => `${u.name || ''},${u.email || ''},${u.role || ''},${u.status || ''},${u.createdAt || ''}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('Kullanıcı listesi indirildi.', 'success');
    }
};

window.closeModal = closeModal;
window.loadAllData = loadAllData;

// ─── INIT ───
loadAllData();

// Health check polling (30s)
setInterval(() => {
    api('/status').then(d => {
        const was = !state.backendOnline;
        state.backendOnline = d && d.status === 'online';
        updateStatusUI();
        if (was && state.backendOnline) loadAllData();
    }).catch(() => {
        state.backendOnline = false;
        updateStatusUI();
    });
}, 30000);
