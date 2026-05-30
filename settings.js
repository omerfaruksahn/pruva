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

    function getDeviceDetails() {
        const ua = navigator.userAgent;
        let browser = "Tarayıcı";
        let os = "İşletim Sistemi";
        let icon = "monitor";

        if (/windows/i.test(ua)) os = "Windows";
        else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
        else if (/iphone|ipad|ipod/i.test(ua)) { os = "iOS"; icon = "smartphone"; }
        else if (/android/i.test(ua)) { os = "Android"; icon = "smartphone"; }
        else if (/linux/i.test(ua)) os = "Linux";

        if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opera/i.test(ua)) {
            browser = "Chrome";
            if (icon !== 'smartphone') icon = "chrome";
        }
        else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
        else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
        else if (/edge|edg/i.test(ua)) browser = "Edge";
        else if (/opr|opera/i.test(ua)) browser = "Opera";

        return {
            name: `${browser} (${os})`,
            icon: icon
        };
    }

    function loadSessionGeoDetails() {
        const 













































































































































































































































































































































































































































































































































































                    </div>
                    
                    <div class="settings-menu-group-header" style="margin-top: 15px;">Kurumsal Ayarlar</div>
                    <div class="settings-menu-item" data-tab="company" onclick="window.switchSettingsTab('company')">
                        <i data-lucide="building"></i> Şirket Detayları
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    <div class="settings-menu-item" data-tab="notifications" onclick="window.switchSettingsTab('notifications')">
                        <i data-lucide="bell"></i> Bildirimler
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    <div class="settings-menu-item" data-tab="membership" onclick="window.switchSettingsTab('membership')">
                        <i data-lucide="credit-card"></i> Üyelik ve Planlar
                        <i data-lucide="chevron-right" class="menu-chevron"></i>
                    </div>
                    
                    <div class="settings-menu-item danger" onclick="window.app.auth.logout()" style="margin-top: 20px; border-top: 1px solid var(--border); border-radius: 0;">
                        <i data-lucide="log-out"></i> Çıkış Yap
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
