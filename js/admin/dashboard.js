// ─── PRUVA Admin Panel — Dashboard Modülü ───
import { utils, toast, showConfirm, showModal, closeModal, api, paginate, PAGE_SIZE } from './utils.js';
import { lineChart, doughnutChart } from './charts.js';

export function renderDashboard(state) {
    const s = state.stats || {};
    const trends = state.trends || {};

    // ─── KPI Kartları ───
    const kpiCards = `
    <div class="stats-grid">
        ${utils.statCard('blue', 'package', 'Toplam İlan', s.totalAds, trends.totalAds)}
        ${utils.statCard('green', 'check-circle', 'Aktif İlan', s.activeAds, trends.activeAds)}
        ${utils.statCard('orange', 'building-2', 'Kayıtlı Şirket', s.totalUsers, trends.totalUsers)}
        ${utils.statCard('gold', 'crown', 'Premium Üye', s.premiumUsers, trends.premiumUsers)}
        ${utils.statCard('red', 'user-check', 'Bekleyen Onay', s.pendingUsers, trends.pendingUsers)}
        ${utils.statCard('purple', 'users', 'Auth Kullanıcı', s.authUsers, trends.authUsers)}
        ${utils.statCard('indigo', 'brain', 'Aktif RFQ', s.activeRfqs || 0, trends.activeRfqs)}
        ${utils.statCard('pink', 'coins', 'Toplam Coin', s.totalCoins || 0, trends.totalCoins)}
    </div>`;

    // ─── Aktivite Logu ───
    const log = state.activityLog || [];
    const activityHtml = log.length > 0
        ? log.slice(0, 15).map(a => `
            <div class="activity-item">
                <div class="activity-icon"><i data-lucide="${a.icon || 'activity'}"></i></div>
                <div class="activity-body">
                    <span class="activity-text">${utils.esc(a.message)}</span>
                    <span class="activity-time">${utils.timeAgo(a.time)}</span>
                </div>
            </div>`).join('')
        : utils.emptyState('inbox', 'Henüz kayıtlı işlem yok');

    // ─── Hızlı Erişim Butonları ───
    const quickActions = `
        <div class="quick-actions-grid">
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.switchTab('ads')">
                <i data-lucide="package"></i> İlanlar
            </button>
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.switchTab('companies')">
                <i data-lucide="building-2"></i> Şirketler
            </button>
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.switchTab('users')">
                <i data-lucide="users"></i> Kullanıcılar
            </button>
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.switchTab('reports')">
                <i data-lucide="flag"></i> Raporlar
            </button>
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.switchTab('super')">
                <i data-lucide="shield"></i> Süper Admin
            </button>
            <button class="btn btn-outline quick-btn" onclick="window.adminActions.refreshData()">
                <i data-lucide="refresh-cw"></i> Yenile
            </button>
        </div>`;

    // ─── Chart Alanları ───
    const chartsSection = `
    <div class="grid-2">
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="trending-up"></i> Kullanıcı Büyümesi</h3>
            </div>
            <div class="card-body chart-container">
                <canvas id="chart-user-growth"></canvas>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="pie-chart"></i> İlan Dağılımı</h3>
            </div>
            <div class="card-body chart-container">
                <canvas id="chart-ad-status"></canvas>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="clock"></i> Son İşlemler</h3>
            </div>
            <div class="card-body activity-list">
                ${activityHtml}
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3><i data-lucide="zap"></i> Hızlı Erişim</h3>
            </div>
            <div class="card-body">
                ${quickActions}
            </div>
        </div>
    </div>`;

    return `
    <div class="tab-content-inner">
        ${kpiCards}
        ${chartsSection}
    </div>`;
}

export function initDashboardCharts(state) {
    const trends = state.trends || {};
    const ads = state.ads || [];

    // ── Kullanıcı Büyümesi (Line) ──
    const newUsers = trends.newUsers || {};
    const labels = Object.keys(newUsers);
    const data = Object.values(newUsers);

    if (labels.length > 0) {
        lineChart('chart-user-growth', labels, [
            { label: 'Yeni Kullanıcı', data, color: '#38bdf8' }
        ]);
    }

    // ── İlan Dağılımı (Doughnut) ──
    const activeCount = ads.filter(a => a.status === 'active').length;
    const pendingCount = ads.filter(a => a.status === 'pending').length;
    const expiredCount = ads.filter(a => a.status === 'expired').length;

    doughnutChart(
        'chart-ad-status',
        ['Aktif', 'Bekliyor', 'Süresi Dolmuş'],
        [activeCount, pendingCount, expiredCount],
        ['#10b981', '#f59e0b', '#ef4444']
    );
}
