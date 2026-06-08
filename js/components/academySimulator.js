/**
 * Pruva Academy — Interactive Logistics Simulator
 * Premium SaaS Console widget for real-time calculations and visual aids.
 */

window.academySimulator = {
    state: {
        activeTab: 'calc', // 'calc', 'incoterms', 'routes'
        length: 120,
        width: 80,
        height: 160,
        quantity: 2,
        weight: 250,
        incoterm: 'FOB',
        pol: 'TRIST', // Istanbul
        pod: 'USNYC'  // New York
    },

    init() {
        // Expose state and methods globally so onclick/oninput handlers can reach them
        window.academySimulator_switchTab = (tabId) => this.switchTab(tabId);
        window.academySimulator_calculate = () => this.calculate();
        window.academySimulator_setIncoterm = (code) => this.setIncoterm(code);
        window.academySimulator_setRoute = (field, val) => this.setRoute(field, val);
        window.academySimulator_toggleMobileDrawer = (isOpen) => this.toggleMobileDrawer(isOpen);
    },

    toggleMobileDrawer(isOpen) {
        const sheet = document.getElementById('mobile-sim-sheet');
        const overlay = document.getElementById('mobile-sim-overlay');
        if (sheet && overlay) {
            if (isOpen) {
                sheet.classList.add('open');
                overlay.classList.add('open');
                this.updateDOM();
                this.bindDragDismiss();
            } else {
                sheet.classList.remove('open');
                overlay.classList.remove('open');
                sheet.style.transform = ''; // Restore default
            }
        }
    },

    bindDragDismiss() {
        const sheet = document.getElementById('mobile-sim-sheet');
        const handle = sheet?.querySelector('.sheet-header');
        if (!sheet || !handle) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            currentY = startY;
            isDragging = true;
            sheet.style.transition = 'none';
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            if (deltaY > 0) {
                sheet.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });

        handle.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            const deltaY = currentY - startY;
            if (deltaY > 120) {
                this.toggleMobileDrawer(false);
            } else {
                sheet.style.transform = 'translateY(0)';
            }
        }, { passive: true });
    },

    switchTab(tabId) {
        this.state.activeTab = tabId;
        this.updateDOM();
    },

    calculate() {
        const length = parseFloat(document.getElementById('sim-length')?.value) || 0;
        const width = parseFloat(document.getElementById('sim-width')?.value) || 0;
        const height = parseFloat(document.getElementById('sim-height')?.value) || 0;
        const qty = parseInt(document.getElementById('sim-qty')?.value) || 1;
        const actualWeight = parseFloat(document.getElementById('sim-weight')?.value) || 0;

        this.state.length = length;
        this.state.width = width;
        this.state.height = height;
        this.state.quantity = qty;
        this.state.weight = actualWeight;

        this.updateDOM();
    },

    setIncoterm(code) {
        this.state.incoterm = code;
        this.updateDOM();
    },

    setRoute(field, val) {
        this.state[field] = val;
        this.updateDOM();
    },

    getCalculations() {
        const { length, width, height, quantity, weight } = this.state;
        const cbm = (length * width * height * quantity) / 1000000;
        
        // Volumetric weights (Air: 1 CBM = 167kg / Road: 1 CBM = 333kg)
        const airVolWeight = cbm * 167;
        const roadVolWeight = cbm * 333;

        const chargeableAir = Math.max(weight, airVolWeight);
        const chargeableRoad = Math.max(weight, roadVolWeight);

        return {
            cbm: cbm.toFixed(3),
            airVolWeight: airVolWeight.toFixed(1),
            roadVolWeight: roadVolWeight.toFixed(1),
            chargeableAir: chargeableAir.toFixed(1),
            chargeableRoad: chargeableRoad.toFixed(1),
            isAirVolumetric: airVolWeight > weight,
            isRoadVolumetric: roadVolWeight > weight
        };
    },

    getIncotermData(code) {
        const list = {
            EXW: { name: 'Ex Works', risk: window.i18n.t('comp.academy.risk_seller_door'), export: window.i18n.t('comp.academy.buyer'), main: window.i18n.t('comp.academy.buyer'), import: window.i18n.t('comp.academy.buyer'), desc: window.i18n.t('comp.academy.exw_desc') },
            FOB: { name: 'Free On Board', risk: window.i18n.t('comp.academy.risk_ship_deck'), export: window.i18n.t('comp.academy.seller'), main: window.i18n.t('comp.academy.buyer'), import: window.i18n.t('comp.academy.buyer'), desc: window.i18n.t('comp.academy.fob_desc') },
            CIF: { name: 'Cost, Insurance & Freight', risk: window.i18n.t('comp.academy.risk_ship_deck'), export: window.i18n.t('comp.academy.seller'), main: window.i18n.t('comp.academy.seller'), import: window.i18n.t('comp.academy.buyer'), desc: window.i18n.t('comp.academy.cif_desc') },
            DDP: { name: 'Delivered Duty Paid', risk: window.i18n.t('comp.academy.risk_buyer_door'), export: window.i18n.t('comp.academy.seller'), main: window.i18n.t('comp.academy.seller'), import: window.i18n.t('comp.academy.seller'), desc: window.i18n.t('comp.academy.ddp_desc') }
        };
        return list[code] || list.FOB;
    },

    getRouteData() {
        const { pol, pod } = this.state;
        const routes = {
            'TRIST-USNYC': { name: window.i18n.t('comp.academy.ist_nyc'), days: 18, distance: '4,900 nm', type: window.i18n.t('comp.academy.direct_line'), desc: window.i18n.t('comp.academy.trist_usnyc_desc') },
            'TRIST-NLRTM': { name: window.i18n.t('comp.academy.ist_rtm'), days: 10, distance: '2,800 nm', type: window.i18n.t('comp.academy.transshipment'), desc: window.i18n.t('comp.academy.trist_nlrtm_desc') },
            'TRIST-CNSHA': { name: window.i18n.t('comp.academy.ist_sha'), days: 28, distance: '8,400 nm', type: window.i18n.t('comp.academy.suez_canal'), desc: window.i18n.t('comp.academy.trist_cnsha_desc') },
            'TRIZM-USNYC': { name: window.i18n.t('comp.academy.izm_nyc'), days: 16, distance: '4,750 nm', type: window.i18n.t('comp.academy.direct_line'), desc: window.i18n.t('comp.academy.trizm_usnyc_desc') },
            'TRIZM-NLRTM': { name: window.i18n.t('comp.academy.izm_rtm'), days: 9, distance: '2,650 nm', type: window.i18n.t('comp.academy.direct_line'), desc: window.i18n.t('comp.academy.trizm_nlrtm_desc') },
            'TRIZM-CNSHA': { name: window.i18n.t('comp.academy.izm_sha'), days: 29, distance: '8,250 nm', type: window.i18n.t('comp.academy.suez_canal'), desc: window.i18n.t('comp.academy.trizm_cnsha_desc') },
            'TRMER-USNYC': { name: window.i18n.t('comp.academy.mer_nyc'), days: 21, distance: '5,100 nm', type: window.i18n.t('comp.academy.transshipment'), desc: window.i18n.t('comp.academy.trmer_usnyc_desc') },
            'TRMER-NLRTM': { name: window.i18n.t('comp.academy.mer_rtm'), days: 12, distance: '3,000 nm', type: window.i18n.t('comp.academy.direct_line'), desc: window.i18n.t('comp.academy.trmer_nlrtm_desc') },
            'TRMER-CNSHA': { name: window.i18n.t('comp.academy.mer_sha'), days: 25, distance: '7,800 nm', type: window.i18n.t('comp.academy.suez_canal'), desc: window.i18n.t('comp.academy.trmer_cnsha_desc') }
        };
        return routes[`${pol}-${pod}`] || { name: window.i18n.t('comp.academy.calculating'), days: '—', distance: '—', type: window.i18n.t('comp.academy.unknown'), desc: window.i18n.t('comp.academy.select_valid_route') };
    },

    render() {
        const { activeTab } = this.state;
        const calcs = this.getCalculations();
        const inco = this.getIncotermData(this.state.incoterm);
        const route = this.getRouteData();

        return `
        <div class="edu-sandbox-card">
            <!-- Sandbox Header -->
            <div class="sandbox-header">
                <div class="title-with-badge">
                    <span class="sandbox-logo-icon"><i data-lucide="terminal"></i></span>
                    <div>
                        <h3 data-i18n="comp.academy.console_title">Lojistik Konsolu</h3>
                        <span class="sandbox-sub" data-i18n="comp.academy.console_subtitle">İnteraktif Simülatör v1.0</span>
                    </div>
                </div>
                <span class="live-indicator"><span class="dot animate-pulse"></span> <span data-i18n="comp.academy.online">ONLINE</span></span>
            </div>

            <!-- Tab Buttons -->
            <div class="sandbox-tabs">
                <button class="sandbox-tab-btn ${activeTab === 'calc' ? 'active' : ''}" onclick="window.academySimulator_switchTab('calc')">
                    <i data-lucide="calculator"></i> <span data-i18n="comp.academy.tab_calc">Hacim & Ağırlık</span>
                </button>
                <button class="sandbox-tab-btn ${activeTab === 'incoterms' ? 'active' : ''}" onclick="window.academySimulator_switchTab('incoterms')">
                    <i data-lucide="shield-alert"></i> Incoterms
                </button>
                <button class="sandbox-tab-btn ${activeTab === 'routes' ? 'active' : ''}" onclick="window.academySimulator_switchTab('routes')">
                    <i data-lucide="map-pin"></i> <span data-i18n="comp.academy.tab_routes">Rota & Transit</span>
                </button>
            </div>

            <!-- Tab Contents -->
            <div class="sandbox-body">
                ${activeTab === 'calc' ? this.renderCalcTab(calcs) : ''}
                ${activeTab === 'incoterms' ? this.renderIncotermsTab(inco) : ''}
                ${activeTab === 'routes' ? this.renderRoutesTab(route) : ''}
            </div>
        </div>
        `;
    },

    renderCalcTab(calcs) {
        return `
        <div class="sandbox-tab-content fade-in-up">
            <p class="tab-intro" data-i18n="comp.academy.calc_intro">Metreküp (CBM) ve havayolu/karayolu faturalandırılabilir ücrete esas ağırlık hesabı:</p>
            
            <div class="calc-inputs-grid">
                <div class="input-item">
                    <label data-i18n="comp.academy.lbl_width">En (cm)</label>
                    <input type="number" id="sim-width" value="${this.state.width}" oninput="window.academySimulator_calculate()">
                </div>
                <div class="input-item">
                    <label data-i18n="comp.academy.lbl_length">Boy (cm)</label>
                    <input type="number" id="sim-length" value="${this.state.length}" oninput="window.academySimulator_calculate()">
                </div>
                <div class="input-item">
                    <label data-i18n="comp.academy.lbl_height">Yükseklik (cm)</label>
                    <input type="number" id="sim-height" value="${this.state.height}" oninput="window.academySimulator_calculate()">
                </div>
                <div class="input-item">
                    <label data-i18n="comp.academy.lbl_qty">Miktar (Adet)</label>
                    <input type="number" id="sim-qty" value="${this.state.quantity}" oninput="window.academySimulator_calculate()">
                </div>
            </div>

            <div class="input-item full-width" style="margin-top: 12px;">
                <label data-i18n="comp.academy.lbl_weight">Gerçek Ağırlık (Toplam kg)</label>
                <input type="number" id="sim-weight" value="${this.state.weight}" oninput="window.academySimulator_calculate()">
            </div>

            <div class="calc-results">
                <div class="result-row primary-result">
                    <span data-i18n="comp.academy.lbl_total_cbm">Toplam Hacim (CBM):</span>
                    <strong class="text-gradient">${calcs.cbm} m³</strong>
                </div>

                <div class="result-breakdown">
                    <div class="breakdown-card ${calcs.isAirVolumetric ? 'vol-active' : ''}">
                        <div class="bc-header">
                            <i data-lucide="plane"></i>
                            <span data-i18n="comp.academy.lbl_air">Havayolu (1:6)</span>
                        </div>
                        <div class="bc-val">${calcs.chargeableAir} kg</div>
                        <span class="bc-lbl">${calcs.isAirVolumetric ? window.i18n.t('comp.academy.vol_active') : window.i18n.t('comp.academy.actual_active')}</span>
                    </div>

                    <div class="breakdown-card ${calcs.isRoadVolumetric ? 'vol-active' : ''}">
                        <div class="bc-header">
                            <i data-lucide="truck"></i>
                            <span data-i18n="comp.academy.lbl_road">Karayolu (1:3)</span>
                        </div>
                        <div class="bc-val">${calcs.chargeableRoad} kg</div>
                        <span class="bc-lbl">${calcs.isRoadVolumetric ? window.i18n.t('comp.academy.vol_active') : window.i18n.t('comp.academy.actual_active')}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    renderIncotermsTab(inco) {
        const incotermCodes = ['EXW', 'FOB', 'CIF', 'DDP'];
        return `
        <div class="sandbox-tab-content fade-in-up">
            <p class="tab-intro" data-i18n="comp.academy.inco_intro">Teslim şekline göre maliyet, risk ve sorumluluk haritası:</p>
            
            <div class="incoterm-selector-grid">
                ${incotermCodes.map(code => `
                    <button class="inco-pill-btn ${this.state.incoterm === code ? 'active' : ''}" onclick="window.academySimulator_setIncoterm('${code}')">
                        ${code}
                    </button>
                `).join('')}
            </div>

            <div class="incoterm-details-card">
                <div class="idc-top">
                    <h4>${inco.name} (${this.state.incoterm})</h4>
                    <span class="idc-risk-badge"><i data-lucide="alert-triangle"></i> <span data-i18n="comp.academy.lbl_risk">Risk:</span> <strong>${inco.risk}</strong></span>
                </div>
                <p class="idc-desc">${inco.desc}</p>

                <div class="idc-matrix">
                    <div class="matrix-row">
                        <span data-i18n="comp.academy.lbl_export_customs">İhracat Gümrükleme:</span>
                        <strong class="${inco.export === window.i18n.t('comp.academy.seller') ? 'vendor' : 'buyer'}">${inco.export}</strong>
                    </div>
                    <div class="matrix-row">
                        <span data-i18n="comp.academy.lbl_main_transport">Ana Taşıma (Navlun):</span>
                        <strong class="${inco.main === window.i18n.t('comp.academy.seller') ? 'vendor' : 'buyer'}">${inco.main}</strong>
                    </div>
                    <div class="matrix-row">
                        <span data-i18n="comp.academy.lbl_import_customs">İthalat Gümrükleme:</span>
                        <strong class="${inco.import === window.i18n.t('comp.academy.seller') ? 'vendor' : 'buyer'}">${inco.import}</strong>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    renderRoutesTab(route) {
        return `
        <div class="sandbox-tab-content fade-in-up">
            <p class="tab-intro" data-i18n="comp.academy.routes_intro">Türkiye çıkışlı küresel liman rotaları ve deniz transit süre analizi:</p>

            <div class="route-selectors">
                <div class="input-item">
                    <label data-i18n="comp.academy.lbl_pol">Çıkış Limanı (POL)</label>
                    <select onchange="window.academySimulator_setRoute('pol', this.value)">
                        <option value="TRIST" ${this.state.pol === 'TRIST' ? 'selected' : ''} data-i18n="comp.academy.ist_ambarli">İstanbul (Ambarlı)</option>
                        <option value="TRIZM" ${this.state.pol === 'TRIZM' ? 'selected' : ''} data-i18n="comp.academy.izm_alsancak">İzmir (Alsancak)</option>
                        <option value="TRMER" ${this.state.pol === 'TRMER' ? 'selected' : ''} data-i18n="comp.academy.mer_port">Mersin Limanı</option>
                    </select>
                </div>
                <div class="input-item" style="margin-top: 10px;">
                    <label data-i18n="comp.academy.lbl_pod">Varış Limanı (POD)</label>
                    <select onchange="window.academySimulator_setRoute('pod', this.value)">
                        <option value="USNYC" ${this.state.pod === 'USNYC' ? 'selected' : ''} data-i18n="comp.academy.nyc_us">New York (US)</option>
                        <option value="NLRTM" ${this.state.pod === 'NLRTM' ? 'selected' : ''} data-i18n="comp.academy.rtm_nl">Rotterdam (NL)</option>
                        <option value="CNSHA" ${this.state.pod === 'CNSHA' ? 'selected' : ''} data-i18n="comp.academy.sha_cn">Şanghay (CN)</option>
                    </select>
                </div>
            </div>

            <div class="route-details-card">
                <div class="rdc-header">
                    <span class="route-path-text">${route.name}</span>
                    <span class="route-type-badge">${route.type}</span>
                </div>

                <div class="rdc-metrics">
                    <div class="metric-block">
                        <span class="mb-lbl" data-i18n="comp.academy.lbl_transit_time">Transit Süre</span>
                        <strong class="text-gradient">${route.days} <span data-i18n="comp.academy.days">Gün</span></strong>
                    </div>
                    <div class="metric-block">
                        <span class="mb-lbl" data-i18n="comp.academy.lbl_sea_distance">Deniz Mesafesi</span>
                        <strong>${route.distance}</strong>
                    </div>
                </div>

                <p class="rdc-desc"><i data-lucide="info" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 4px;"></i> ${route.desc}</p>
            </div>
        </div>
        `;
    },

    updateDOM() {
        const container = document.getElementById('academy-live-simulator');
        if (container) {
            container.innerHTML = this.render();
        }
        const mobileContainer = document.getElementById('academy-live-simulator-mobile');
        if (mobileContainer) {
            mobileContainer.innerHTML = this.render();
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

// Initialize on load
window.academySimulator.init();
