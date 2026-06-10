window.ThemeManager = {
    isDark: false,

    init() {
        const saved = localStorage.getItem('pruva_dark_mode');
        this.isDark = saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.apply();
        
        // Listen for system changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('pruva_dark_mode') === null) {
                this.isDark = e.matches;
                this.apply();
            }
        });
    },

    toggle() {
        const now = Date.now();
        if (this._lastToggle && (now - this._lastToggle) < 400) {
            return;
        }
        this._lastToggle = now;

        this.isDark = !this.isDark;
        localStorage.setItem('pruva_dark_mode', this.isDark);
        this.apply();
        
        if (window.notificationManager) {
            window.notificationManager.showToast(this.isDark ? window.i18n.t('comp.theme.night_mode') : window.i18n.t('comp.theme.day_mode'), 'info');
        }
        
        // UI'daki tüm ikonları güncelle (SVG yerine temiz <i> koyup Lucide ile oluşturuyoruz)
        const wrappers = document.querySelectorAll('.theme-toggle-wrapper');
        wrappers.forEach(wrapper => {
            wrapper.innerHTML = `<i data-lucide="${this.isDark ? 'sun' : 'moon'}" class="theme-toggle-icon" style="width: 18px; height: 18px;"></i>`;
        });
        
        // Lucide ikonlarını yeniden oluştur
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    apply() {
        document.body.classList.toggle('dark-mode', this.isDark);
    },

    getBtnHTML() {
        return `
            <div class="theme-toggle-wrapper" onclick="window.ThemeManager.toggle()" style="cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; border: 1px solid var(--border); background: var(--bg-surface); width: 35px; height: 35px; margin-right: 10px;">
                <i data-lucide="${this.isDark ? 'sun' : 'moon'}" class="theme-toggle-icon" style="width: 18px; height: 18px;"></i>
            </div>
        `;
    }
};
