export class NavbarComponent {
    constructor(app) {
        this.app = app;
        this._lastNavState = null;
        window.navbarComponent = this;
    }

    render(state) {
        const pendingActionsCount = state.pricingActions ? state.pricingActions.filter(a => a.status === 'PENDING').length : 0;
        const pendingConvCount = state.pricingConversations ? state.pricingConversations.filter(c => c.status === 'PENDING' || c.status === 'RATES_REQUESTED' || c.status === 'MISSING_INFO_SENT').length : 0;
        const pendingCount = pendingActionsCount + pendingConvCount;
        const badgeHTML = pendingCount > 0 ? `<span class="pruva-ai-badge" style="background-color: #ef4444; color: white; font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 10px; line-height: 1; margin-left: 6px; display: inline-block; vertical-align: middle;">${pendingCount}</span>` : '';

        // Cache check to prevent unnecessary re-renders and flickering
        const currentState = `${state.isLoggedIn}-${state.userRole}-${state.currentUser}-${state.currentUserUid}-${state.notifications?.length || 0}-${state.subscriptionType || 'none'}-${pendingCount}`;
        if (this._lastNavState === currentState) return;
        this._lastNavState = currentState;

        const navLinks = document.querySelector('.nav-links');
        const navRight = document.querySelector('.nav-right');
        const mobileDrawer = document.getElementById('mobile-nav-drawer');

        // Render Desktop Links
        if (!state.isLoggedIn) {
            if (navLinks) {
                navLinks.innerHTML = `
                    <a href="/">Anasayfa</a>
                    <a href="/marketplace">Pazaryeri</a>
                    <a onclick="alert('Lütfen ilan vermek için giriş yapın!')">İlan Ver</a>
                `;
            }
            if (navRight) {
                navRight.innerHTML = `
                    ${window.ThemeManager.getBtnHTML()}
                    <a class="btn-outline nav-auth-btn" href="/login" style="padding: 8px 20px; font-size: 0.85rem; text-decoration: none; display: inline-block; line-height: 20px;">Giriş Yap</a>
                    <a class="btn-primary nav-auth-btn" href="/register" style="padding: 8px 20px; font-size: 0.85rem; text-decoration: none; display: inline-block; line-height: 20px;">Kayıt Ol</a>
                    <button class="hamburger-btn" id="hamburger-btn" onclick="window.toggleMobileNav()"><span></span><span></span><span></span></button>
                `;
            }
        } else {
            if (navLinks) {
                navLinks.innerHTML = state.userRole === 'loader' ? `
                    <a href="/dashboard">Dashboard</a>
                    <a href="/post-ad">İlan Ver</a>
                    <a href="/marketplace">Pazaryeri</a>
                    <a href="/pruva-ai" style="display: inline-flex; align-items: center;"><img src="/assets/pruva_robot.svg" style="width: 22px; height: 22px; margin-right: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">Pruva AI${badgeHTML}</a>
                ` : state.userRole === 'carrier' ? `
                    <a href="/dashboard">Dashboard</a>
                    <a href="/marketplace">Pazaryeri</a>
                    <a href="/pruva-ai" style="display: inline-flex; align-items: center;"><img src="/assets/pruva_robot.svg" style="width: 22px; height: 22px; margin-right: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">Pruva AI${badgeHTML}</a>
                ` : `
                    <a href="/dashboard">Admin Paneli</a>
                    <a href="/marketplace">Pazaryeri</a>
                    <a href="/pruva-ai" style="display: inline-flex; align-items: center;"><img src="/assets/pruva_robot.svg" style="width: 22px; height: 22px; margin-right: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">Pruva AI${badgeHTML}</a>
                `;
            }
            
            if (navRight) {
                const user = state.users.find(u => u.id === state.currentUserUid)
                    || state.users.find(u => u.name === state.currentUser);
                const avatarHTML = user && user.avatar 
                    ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                    : state.currentUser.charAt(0).toUpperCase();
 
                navRight.innerHTML = `
                    ${window.ThemeManager.getBtnHTML()}
                    
                    <!-- Mesajlar İkonu -->
                    <a href="/inbox" title="Mesajlar" style="color: var(--text-primary); margin-right: 15px; display: flex; align-items: center; text-decoration: none;">
                        <i data-lucide="message-square" style="width: 20px; height: 20px;"></i>
                    </a>

                    <!-- Bildirimler (Zil) İkonu -->
                    <div class="notification-wrapper" style="position: relative; cursor: pointer; margin-right: 15px;" onclick="window.notificationManager.toggle(event)">
                        <i data-lucide="bell" style="width: 20px; height: 20px;"></i>
                        <div id="notification-badge-container">
                            ${window.notificationManager ? window.notificationManager.renderBadge(state.notifications) : ''}
                        </div>
                        <div id="notification-dropdown" class="card" style="display: none; position: absolute; top: 40px; right: 0; width: 380px; z-index: 1000; padding: 0; max-height: 500px; overflow-y: auto; box-shadow: var(--shadow-lg); border-radius: 16px;">
                        </div>
                    </div>
 
                    <!-- Profil Avatarı -->
                    <div id="user-profile-nav" style="display: flex; align-items: center; cursor: pointer; position: relative;" onclick="event.stopPropagation(); window.app.auth.toggleProfileDropdown()">
                        <div class="user-avatar" style="width: 38px; height: 38px; background: var(--primary-gradient); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.95rem; overflow: hidden; border: 2px solid var(--border); box-shadow: var(--shadow-sm); transition: var(--transition);">
                            ${avatarHTML}
                        </div>
                        
                        <!-- Profil Dropdown -->
                        <div id="profile-dropdown" class="card" style="display: none; position: absolute; top: 45px; right: 0; width: 220px; z-index: 1000; padding: 8px; box-shadow: var(--shadow-lg); border-radius: 12px; border: 1px solid var(--border);">
                            <div class="dropdown-header" style="padding: 12px 16px; border-bottom: 1px solid var(--border); margin-bottom: 8px;">
                                <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.currentUser}</div>
                                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
                                    ${state.userRole === 'loader' ? 'Yükleyici' : state.userRole === 'carrier' ? 'Taşıyıcı' : 'Yönetici'} 
                                    ${user && user.subscriptionType === 'premium' ? '<span style="background: linear-gradient(135deg, #f1c40f, #f39c12); color: white; font-size: 0.55rem; font-weight: 800; padding: 1px 4px; border-radius: 3px; margin-left: 4px; vertical-align: middle;">★ PREMIUM</span>' : ''}
                                </div>
                            </div>
                            <a class="dropdown-item" href="/dashboard" style="text-decoration: none; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                                <i data-lucide="user"></i> Profilim
                            </a>
                            <a class="dropdown-item" href="/membership" style="text-decoration: none; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                                <i data-lucide="shield-check"></i> Üyelik Planları
                            </a>
                            <a class="dropdown-item" href="/settings" style="text-decoration: none; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                                <i data-lucide="settings"></i> Ayarlar
                            </a>
                            <div class="dropdown-divider" style="height: 1px; background: var(--border); margin: 8px 0;"></div>
                            <div class="dropdown-item logout" onclick="event.stopPropagation(); window.app.auth.logout()" style="color: #ff4d4f; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="log-out"></i> Çıkış Yap
                            </div>
                        </div>
                    </div>
 
                    <button class="hamburger-btn" id="hamburger-btn" onclick="window.toggleMobileNav()"><span></span><span></span><span></span></button>
                `;
            }
        }
 
        // Render Mobile Drawer (High Fidelity SaaS Side Menu)
        if (mobileDrawer) {
            let drawerHTML = '';
            
            if (state.isLoggedIn) {
                const user = state.users.find(u => u.id === state.currentUserUid)
                    || state.users.find(u => u.name === state.currentUser);
                const avatarContent = user && user.avatar 
                    ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                    : state.currentUser.charAt(0).toUpperCase();
                const roleLabel = state.userRole === 'loader' ? 'Yük Veren (Loader)' : state.userRole === 'carrier' ? 'Taşıyıcı (Carrier)' : 'Yönetici (Admin)';
                const isPremium = user && user.subscriptionType === 'premium';
                
                drawerHTML += `
                    <!-- Premium Profile Summary Widget -->
                    <div class="mobile-profile-card">
                        <div class="mobile-profile-avatar">
                            ${avatarContent}
                        </div>
                        <div class="mobile-profile-info">
                            <div class="mobile-profile-name">
                                ${state.currentUser}
                                ${isPremium ? '<i data-lucide="star" style="width: 14px; height: 14px; fill: #f59e0b; color: #f59e0b; display: inline-block; margin-left: 2px;"></i>' : ''}
                            </div>
                            <div class="mobile-profile-role">${roleLabel}</div>
                        </div>
                    </div>
                `;
            } else {
                drawerHTML += `
                    <div style="padding: 16px 8px; text-align: center; border-bottom: 1px solid var(--border); margin-bottom: 16px;">
                        <h3 style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary); letter-spacing: -0.5px;">PRUVA</h3>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Güvenilir Lojistik Pazaryeri</p>
                    </div>
                `;
            }
 
            // Standard Navigation Links
            drawerHTML += `
                <a href="/">
                    <i data-lucide="home"></i> Anasayfa
                </a>
                <a href="/marketplace">
                    <i data-lucide="shopping-bag"></i> Pazaryeri
                </a>
            `;
 
            if (state.isLoggedIn) {
                drawerHTML += `
                    <a href="/dashboard">
                        <i data-lucide="layout-dashboard"></i> Dashboard
                    </a>
                    <a href="/inbox">
                        <i data-lucide="message-square"></i> Mesajlar
                    </a>
                    <a href="/pruva-ai" style="display: inline-flex; align-items: center;">
                        <img src="/assets/pruva_robot.svg" style="width: 20px; height: 20px; margin-right: 8px;"> Pruva AI
                    </a>
                    <a href="/pricing-customers">
                        <i data-lucide="users"></i> Müşteriler
                    </a>
                    <a href="/pricing-reports">
                        <i data-lucide="bar-chart-2"></i> Raporlar
                    </a>
                    <a href="/pricing-actions" style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="activity"></i> Aksiyon Merkezi</span>
                        ${pendingCount > 0 ? `<span style="background-color: #f1c40f; color: #0f172a; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; line-height: 1; margin-right: 12px;">${pendingCount}</span>` : ''}
                    </a>
                    <a href="/education">
                        <i data-lucide="graduation-cap"></i> Akademi
                    </a>
                    <a href="/settings">
                        <i data-lucide="settings"></i> Ayarlar
                    </a>
                    <div class="mobile-nav-divider"></div>
                    <a href="/membership">
                        <i data-lucide="star"></i> Üyelik Planları
                    </a>
                    <a onclick="window.app.auth.logout();" style="color: #ff4d4f; cursor: pointer;">
                        <i data-lucide="log-out"></i> Çıkış Yap
                    </a>
                `;
            } else {
                drawerHTML += `
                    <a href="/education">
                        <i data-lucide="graduation-cap"></i> Akademi
                    </a>
                    <div class="mobile-nav-divider"></div>
                    <a href="/login" style="color: var(--secondary);">
                        <i data-lucide="log-in"></i> Giriş Yap
                    </a>
                    <a href="/register" style="color: var(--success);">
                        <i data-lucide="user-plus"></i> Ücretsiz Kayıt Ol
                    </a>
                `;
            }
 
            if (state.isLoggedIn && state.userRole === 'loader') {
                drawerHTML += `
                    <a class="mobile-post-btn" href="/post-ad" style="display: block; text-decoration: none; text-align: center; line-height: 40px; margin-top: 16px;">
                        Yeni İlan Ver
                    </a>
                `;
            }
 
            mobileDrawer.innerHTML = drawerHTML;
        }

        // Initialize Lucide icons if loaded
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

window.NavbarComponent = NavbarComponent;