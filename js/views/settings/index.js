import { renderProfileTab } from './profileTab.js';
import { renderCompanyTab } from './companyTab.js';
import { renderSecurityTab } from './securityTab.js';
import { renderNotificationsTab } from './notificationsTab.js';
import { renderMembershipTab } from './membershipTab.js';

function loadSessionGeoDetails() {
    const geoMetaEl = document.getElementById('current-session-meta');
    if (!geoMetaEl) return;

    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const city = data.city || 'Bilinmeyen Şehir';
            const country = data.country_name || 'Türkiye';
            const ip = data.ip || '127.0.0.1';
            geoMetaEl.textContent = `${city}, ${country} • ${ip}`;
        })
        .catch(err => {
            console.error('Geo IP fetch failed, using fallback:', err);
            geoMetaEl.textContent = 'İstanbul, Türkiye • 127.0.0.1';
        });
}

window.switchSettingsTab = (tabId) => {
    const state = window.app.state;
    const user = window.app.store.getCurrentUser() || {
        name: state.currentUser,
        email: '',
        phone: '',
        role: state.userRole,
        joinDate: new Date().toISOString().split('T')[0],
        taxNumber: '',
        status: 'active'
    };

    // Update menu active state
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.settings-menu-item[data-tab="${tabId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Toggle mobile sub-page active layout
    const layout = document.querySelector('.settings-layout');
    if (layout) layout.classList.add('sub-page-active');

    // Update content
    const contentArea = document.getElementById('settings-dynamic-content');
    if (!contentArea) return;

    // Fade out
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';

    setTimeout(() => {
        let html = '';
        switch (tabId) {
            case 'profile':
                html = renderProfileTab(user);
                break;
            case 'company':
                html = renderCompanyTab(user);
                break;
            case 'security':
                html = renderSecurityTab(user);
                break;
            case 'notifications':
                html = renderNotificationsTab(user);
                break;
            case 'membership':
                html = renderMembershipTab(state);
                break;
            default:
                html = renderProfileTab(user);
        }
        contentArea.innerHTML = html;
        
        // Re-trigger Lucide
        if (window.lucide) window.lucide.createIcons();

        if (tabId === 'security') {
            loadSessionGeoDetails();
        }
        
        // Fade in
        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0)';
    }, 200);
};

window.backToSettingsMenu = () => {
    const layout = document.querySelector('.settings-layout');
    if (layout) layout.classList.remove('sub-page-active');
    
    // Remove active class from menu items on mobile return
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.classList.remove('active');
    });
};

window.settingsView = (state) => {
    const user = window.app.store.getCurrentUser() || {
        name: state.currentUser,
        email: '',
        phone: '',
        role: state.userRole,
        joinDate: new Date().toISOString().split('T')[0],
        taxNumber: '',
        status: 'active'
    };

    const userAvatarHTML = user.avatar 
        ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` 
        : user.name.charAt(0).toUpperCase();

    return `
    <div class="container settings-container">
        <div class="settings-layout">
            <!-- Sidebar -->
            <aside class="settings-sidebar">
                <div class="settings-profile-summary">
                    <div class="avatar-wrapper">
                        <div class="avatar-big">${userAvatarHTML}</div>
                        <div class="avatar-edit-btn" title="Fotoğraf Değiştir" onclick="window.handleAvatarUpload()" data-i18n-title="settings.avatar_edit_btn">
                            <i data-lucide="camera" style="width: 16px; height: 16px;"></i>
                        </div>
                    </div>
                    <div class="profile-summary-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                        <div class="role-badge">
                            <i data-lucide="shield" style="width: 12px; height: 12px; margin-right: 6px;"></i>
                            <span data-i18n="roles.${user.role || 'user'}">${user.role === 'loader' ? 'Yükleyici' : user.role === 'carrier' ? 'Taşıyıcı' : 'Yönetici'}</span>
                        </div>
                    </div>
                </div>

                <div class="settings-menu">
                    <div class="settings-menu-group-header" data-i18n="settings.personal_settings_group">Kişisel Ayarlar</div>
                    <div class="settings-menu-item active" data-tab="profile" onclick="window.switchSettingsTab('profile')">
                        <i data-lucide="user"></i> <span data-i18n="settings.profile_info">Profil Bilgileri</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    <div class="settings-menu-item" data-tab="security" onclick="window.switchSettingsTab('security')">
                        <i data-lucide="lock"></i> <span data-i18n="settings.sidebar_security">Güvenlik</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    
                    <div class="settings-menu-group-header" style="margin-top: 15px;" data-i18n="settings.company_settings_group">Kurumsal Ayarlar</div>
                    <div class="settings-menu-item" data-tab="company" onclick="window.switchSettingsTab('company')">
                        <i data-lucide="building"></i> <span data-i18n="settings.company_details">Şirket Detayları</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    <div class="settings-menu-item" data-tab="notifications" onclick="window.switchSettingsTab('notifications')">
                        <i data-lucide="bell"></i> <span data-i18n="settings.sidebar_notifications">Bildirimler</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    <div class="settings-menu-item" data-tab="membership" onclick="window.switchSettingsTab('membership')">
                        <i data-lucide="credit-card"></i> <span data-i18n="settings.membership_plans">Üyelik ve Planlar</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    
                    <div class="settings-menu-item danger" onclick="window.app.auth.logout()" style="margin-top: 20px; border-top: 1px solid var(--border); border-radius: 0;">
                        <i data-lucide="log-out"></i> <span data-i18n="settings.sidebar_logout">Çıkış Yap</span>
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="settings-main" id="settings-dynamic-content" style="transition: all 0.3s ease;">
                ${renderProfileTab(user)}
            </main>
        </div>
    </div>
    `;
};