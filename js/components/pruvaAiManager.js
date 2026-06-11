import { io } from 'socket.io-client';

/**
 * PRUVA — Pruva AI Manager
 * 
 * Şablon editörü, değişken analizi, önizleme motoru ve taşıyıcı yönetimini yönetir.
 */

window.PruvaAiManager = class PruvaAiManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.socket = null;
        
        // Varsayılan Değerler
        this.DEFAULT_TEMPLATES = {
            'fcl-request': {
                name: 'FCL Rate Request',
                subject: 'Rate Request – {{POL}} / {{POD}} – {{CONTAINER_TYPE}} x{{QTY}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\n\nPOL: {{POL}}\nPOD: {{POD}}\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{CARGO_TYPE}}\n\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'fcl-offer': {
                name: 'FCL Müşteri Teklifi',
                subject: 'Navlun Teklifi – {{POL}} / {{POD}} – {{CONTAINER_TYPE}} x{{QTY}}',
                body: 'Sayın {{CUSTOMER_NAME}},\n\nTalebiniz doğrultusunda aşağıdaki navlun teklifini sunmaktayız:\n\nGüzergah: {{POL}} → {{POD}}\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nNavlun (All-in): USD {{FREIGHT_PRICE}} / konteyner\nFiyat Geçerliliği: {{VALIDITY}}\n\nSorularınız için her zaman ulaşabilirsiniz.\n\nSaygılarimizla,\n{{SIGNATURE}}'
            },
            'fcl-negotiation': {
                name: 'FCL Pazarlık',
                subject: 'Re: Rate Request – {{POL}} / {{POD}} – Revize Talep',
                body: 'Sayın {{CARRIER_NAME}},\n\nVerdiğiniz fiyat için teşekkür ederiz. Ancak müşterimizin bütçesi doğrultusunda USD {{TARGET_PRICE}} seviyesinde revize talep ediyoruz.\n\nMevcut fiyatınız: USD {{FREIGHT_PRICE}}\nBeklenen fiyat: USD {{TARGET_PRICE}}\nFark: USD {{DIFF}}\n\nBu güzergahta düzenli yük potansiyelimiz bulunmaktadır. Revizenizi bekliyoruz.\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'fcl-followup': {
                name: 'FCL Takip',
                subject: 'Takip – Rate Request – {{POL}} / {{POD}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\n{{DATE}} tarihinde ilettiğimiz rate request\'e henüz dönüş alamadık. Yükleme tarihi yaklaşmaktadır, fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'lcl-request': {
                name: 'LCL Rate Request',
                subject: 'LCL Rate Request – {{POL}} / {{POD}} – {{CBM}} CBM / {{KG}} KG – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\nAşağıdaki parsiyel yük için navlun fiyatı talep ediyoruz:\n\nPOL / CFS: {{POL}} / {{CFS_POL}}\nPOD / CFS: {{POD}} / {{CFS_POD}}\nHacim: {{CBM}} CBM\nAğırlık: {{KG}} KG\nPaket Adedi: {{PKG_QTY}}\nW/M: {{W_M}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{CARGO_TYPE}}\n\nFiyatınızı geçerlilik süresiyle iletirseniz seviniriz.\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'lcl-offer': {
                name: 'LCL Müşteri Teklifi',
                subject: 'LCL Navlun Teklifi – {{POL}} / {{POD}} – {{CBM}} CBM',
                body: 'Sayın {{CUSTOMER_NAME}},\n\nParsiyel yük talebiniz için aşağıdaki teklifi sunmaktayız:\n\nGüzergah: {{POL}} → {{POD}}\nHacim: {{CBM}} CBM / {{KG}} KG\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nNavlun: USD {{FREIGHT_PRICE}} / W/M\nFiyat Geçerliliği: {{VALIDITY}}\n\nSaygılarımızla,\n{{SIGNATURE}}'
            },
            'lcl-negotiation': {
                name: 'LCL Pazarlık',
                subject: 'Re: LCL Rate Request – {{POL}} / {{POD}} – Revize Talep',
                body: 'Sayın {{CARRIER_NAME}},\n\nFiyatınız için teşekkürler. USD {{TARGET_PRICE}}/W/M seviyesinde revize mümkün müdür?\n\nMevcut: USD {{FREIGHT_PRICE}} / W/M\nBeklenen: USD {{TARGET_PRICE}} / W/M\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'lcl-followup': {
                name: 'LCL Takip',
                subject: 'Takip – LCL Rate Request – {{POL}} / {{POD}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\n{{DATE}} tarihinde ilettiğimiz LCL rate request\'e dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'air-request': {
                name: 'Hava Rate Request',
                subject: 'Air Freight Rate Request – {{POL}} / {{POD}} – {{CHARGEABLE_WEIGHT}} KG – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\nAşağıdaki hava yükü için fiyat talep ediyoruz:\n\nGüzergah: {{FLIGHT_ROUTE}}\nGerçek Ağırlık: {{KG}} KG\nHacimsel Ağırlık: {{VOL_WEIGHT}} KG\nChargeable Weight: {{CHARGEABLE_WEIGHT}} KG\nBoyutlar: {{DIMENSIONS}} cm\nPaket Adedi: {{PKG_QTY}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{CARGO_TYPE}}\n\nAll-in fiyat bekliyoruz.\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'air-offer': {
                name: 'Hava Müşteri Teklifi',
                subject: 'Hava Yolu Navlun Teklifi – {{POL}} / {{POD}} – {{CHARGEABLE_WEIGHT}} KG',
                body: 'Sayın {{CUSTOMER_NAME}},\n\nHava yolu talebiniz için teklifimiz:\n\nGüzergah: {{FLIGHT_ROUTE}}\nChargeable Weight: {{CHARGEABLE_WEIGHT}} KG\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nNavlun: USD {{FREIGHT_PRICE}} / KG\nFiyat Geçerliliği: {{VALIDITY}}\n\nSaygılarımızla,\n{{SIGNATURE}}'
            },
            'air-negotiation': {
                name: 'Hava Pazarlık',
                subject: 'Re: Air Freight Rate Request – {{POL}} / {{POD}} – Revize Talep',
                body: 'Sayın {{CARRIER_NAME}},\n\nFiyatınız için teşekkürler. USD {{TARGET_PRICE}}/KG seviyesinde revize mümkün müdür?\n\nMevcut: USD {{FREIGHT_PRICE}} / KG\nBeklenen: USD {{TARGET_PRICE}} / KG\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'air-followup': {
                name: 'Hava Takip',
                subject: 'Takip – Air Freight Rate Request – {{POL}} / {{POD}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\n{{DATE}} tarihinde ilettiğimiz hava yolu rate request\'e dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'road-request': {
                name: 'Kara Rate Request',
                subject: 'Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – {{TRUCK_TYPE}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\nAşağıdaki kara taşıması için fiyat talep ediyoruz:\n\nGüzergah: {{ROUTE}}\nAraç Tipi: {{TRUCK_TYPE}}\nAraç Adedi: {{TRUCK_QTY}}\nAğırlık: {{KG}} KG\nYükleme Metresi: {{LDM}} LDM\nGümrük Noktası: {{CUSTOMS}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{CARGO_TYPE}}\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'road-offer': {
                name: 'Kara Müşteri Teklifi',
                subject: 'Kara Taşıma Teklifi – {{POL}} / {{POD}} – {{TRUCK_TYPE}}',
                body: 'Sayın {{CUSTOMER_NAME}},\n\nKara taşıma talebiniz için teklifimiz:\n\nGüzergah: {{ROUTE}}\nAraç Tipi: {{TRUCK_TYPE}}\nYükleme Tarihi: {{LOAD_DATE}}\nNavlun: USD {{FREIGHT_PRICE}} / araç\nFiyat Geçerliliği: {{VALIDITY}}\n\nSaygılarımızla,\n{{SIGNATURE}}'
            },
            'road-negotiation': {
                name: 'Kara Pazarlık',
                subject: 'Re: Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – Revize Talep',
                body: 'Sayın {{CARRIER_NAME}},\n\nFiyatınız için teşekkürler. USD {{TARGET_PRICE}}/araç seviyesinde revize mümkün müdür?\n\nMevcut: USD {{FREIGHT_PRICE}} / araç\nBeklenen: USD {{TARGET_PRICE}} / araç\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'road-followup': {
                name: 'Kara Takip',
                subject: 'Takip – Kara Taşıma Fiyat Talebi – {{POL}} / {{POD}} – {{LOAD_DATE}}',
                body: 'Sayın {{CARRIER_NAME}},\n\n{{DATE}} tarihinde ilettiğimiz kara taşıma fiyat talebine dönüş alamadık. Fiyatınızı paylaşabilir misiniz?\n\nTeşekkürler,\n{{SIGNATURE}}'
            },
            'common-missing': {
                name: 'Eksik Bilgi Sorgulama',
                subject: 'Navlun Talebi – Ek Bilgi Gerekli',
                body: 'Sayın {{CUSTOMER_NAME}},\n\nNavlun talebinizi aldık, teşekkür ederiz.\n\nFiyatlandırma yapabilmemiz için aşağıdaki bilgilere ihtiyaç duyuyoruz:\n{{MISSING_INFO}}\n\nMevcut bilgileriniz:\n{{AVAILABLE_INFO}}\n\nBu bilgileri ilettiğinizde en kısa sürede fiyat teklifimizi sunacağız.\n\nSaygılarımızla,\n{{SIGNATURE}}'
            }
        };

        this.DEFAULT_CARRIERS = [
            { id: 1, name: 'MSC', email: 'pricing@msc.com', category: 'armator', regions: ['Far East', 'Med'], rating: 5, template: 'fcl-request', active: true },
            { id: 2, name: 'Maersk', email: 'quotes@maersk.com', category: 'armator', regions: ['Far East', 'Kuzey Avrupa', 'Amerika'], rating: 4, template: 'fcl-request', active: true },
            { id: 3, name: 'Hapag-Lloyd', email: 'rates@hlcl.com', category: 'armator', regions: ['Med', 'Karadeniz', 'Orta Doğu'], rating: 4, template: 'fcl-request', active: false },
            { id: 4, name: 'Cargo One', email: 'lcl@cargoone.com', category: 'nvocc', regions: ['Far East', 'Med'], rating: 3, template: 'lcl-request', active: true },
            { id: 5, name: 'Seafreight Hub', email: 'spot@seafreighthub.com', category: 'nvocc', regions: ['Far East', 'Kuzey Avrupa'], rating: 4, template: 'lcl-request', active: true },
            { id: 6, name: 'Turkish Cargo', email: 'cargo@thy.com', category: 'hava', regions: ['Far East', 'Med', 'Karadeniz', 'Kuzey Avrupa', 'Amerika', 'Orta Doğu', 'Afrika'], rating: 5, template: 'air-request', active: true },
            { id: 7, name: 'Lufthansa Cargo', email: 'pricing@lh-cargo.com', category: 'hava', regions: ['Kuzey Avrupa', 'Amerika'], rating: 4, template: 'air-request', active: true },
            { id: 8, name: 'Ekol Lojistik', email: 'road.pricing@ekol.com', category: 'kara', regions: ['Kuzey Avrupa', 'Orta Asya'], rating: 4, template: 'road-request', active: true },
            { id: 9, name: 'Mars Lojistik', email: 'prices@mars.com', category: 'kara', regions: ['Kuzey Avrupa', 'Orta Doğu'], rating: 3, template: 'road-request', active: false }
        ];

        this.CATEGORIES = {
            'armator': 'Armatörler',
            'nvocc': 'NVOCC / Konsolidatörler',
            'acente': 'Yurt Dışı Acenteler',
            'hava': 'Havayolu / Hava Freight',
            'kara': 'Kara Nakliye Firmaları'
        };

        this.VARIABLES_CONFIG = VARIABLES_CONFIG;
        this.MANDATORY_CONFIG = MANDATORY_CONFIG;
        this.MOCK_PREVIEW_VALUES = MOCK_PREVIEW_VALUES;

        // Başlangıç State
        this.currentMode = 'fcl';
        this.activeTemplateKey = 'fcl-request';
        this.previewMode = false;
        this.templates = {};
        this.carriers = [];
        this.activeStarsForm = 5;

        // Dil değiştiğinde şablonları anında yeni dile göre sıfırla
        window.addEventListener('languageChanged', () => {
            if (this.DEFAULT_TEMPLATES) {
                this.templates = JSON.parse(JSON.stringify(this.DEFAULT_TEMPLATES));
                if (typeof this.renderTemplates === 'function') {
                    this.renderTemplates();
                }
                if (this.activeTemplateKey && typeof this.selectTemplate === 'function') {
                    this.selectTemplate(this.activeTemplateKey);
                }
            }
        });

        this.rules = {
            autoInquiry: true,
            maxRounds: 3,
            disabledMandatories: []
        };

        // Faz 5: Margin Kuralları ve Performans Skorları
        this.DEFAULT_MARGINS = [
            { id: 1, region: 'Far East', transport_mode: 'DENIZ_FCL', margin_percent: 12.00, customer_type: 'STANDARD' },
            { id: 2, region: 'Med', transport_mode: 'DENIZ_FCL', margin_percent: 8.00, customer_type: 'STANDARD' },
            { id: 3, region: 'Tüm Bölgeler', transport_mode: 'HAVA', margin_percent: 15.00, customer_type: 'STANDARD' },
            { id: 4, region: 'Ortak', transport_mode: 'ORTAK', margin_percent: -5.00, customer_type: 'VIP' }
        ];
        this.margins = JSON.parse(JSON.stringify(this.DEFAULT_MARGINS));

        this.DEFAULT_PERFORMANCES = [
            { id: 1, carrier_id: 1, response_hours: 2.5, was_cheapest: true, was_selected: true, rfq_id: 1 },
            { id: 2, carrier_id: 2, response_hours: 4.2, was_cheapest: false, was_selected: false, rfq_id: 1 }
        ];
        this.carrierPerformances = JSON.parse(JSON.stringify(this.DEFAULT_PERFORMANCES));
        
        // Faz 1 & Faz 8 Properties
        this.metrics = { rfqCount: 0, offerCount: 0, winRate: 0 };
        this.pollingInterval = null;

        // Initialize details drawer to closed on boot
        this.app.state.detailsDrawerOpen = false;
    }

    // Yardımcı: Firebase Auth Token alma (tekrarlayan kodu ortadan kaldırır)
    async getAuthToken() {
        const firebaseUser = window.fbAuth?.currentUser;
        return firebaseUser ? await firebaseUser.getIdToken() : '';
    }

    // Yardımcı: Standart API header'ları oluştur
    async getAuthHeaders() {
        const token = await this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Authorization': `Bearer ${token}`
        };
    }

    // Arayüz Init tetiklendiğinde
    init() {
        // Prevent infinite rendering loop and redundant API calls during commits
        if (!this.hasLoadedData) {
            this.hasLoadedData = true;
            this.loadState();
        }
        
        this.renderTemplates();
        this.renderCarriers();
        this.renderRules();
        this.selectTemplate(this.activeTemplateKey);

        // Pencereye tıklanınca dropdown kapatma olayı
        window.removeEventListener('click', this._onWindowClick);
        this._onWindowClick = (e) => {
            const dropdown = document.getElementById('variables-dropdown');
            if (dropdown && !e.target.closest('.dropdown-wrapper')) {
                dropdown.classList.remove('show');
            }
        };
        window.addEventListener('click', this._onWindowClick);

        // Scroll to the bottom of the active chat timeline on each initialization/re-render
        if (this.pollingInterval) return;
        this.scrollToBottom();
    }

    scrollToBottom() {
        setTimeout(() => {
            const el = document.getElementById('chat-timeline-area');
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);
    }

    async loadState() {
        this.templates = JSON.parse(JSON.stringify(this.DEFAULT_TEMPLATES));
        this.carriers = JSON.parse(JSON.stringify(this.DEFAULT_CARRIERS));

        // Daha önce yerel olarak kaydedilmiş veriler varsa, default'ların üzerine yükle
        // (API gelene kadar kullanıcının son durumu görünür; API başarısız olsa bile veri kaybolmaz)
        this.loadFromLocalStorage();

        const autoInqEl = document.getElementById('rule-auto-inquiry');
        const maxRoundsEl = document.getElementById('rule-max-rounds');
        if (autoInqEl) autoInqEl.checked = this.rules.autoInquiry;
        if (maxRoundsEl) maxRoundsEl.value = this.rules.maxRounds;

        // Asenkron olarak backend API'den verileri çek ve güncelle
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            // Socket.io Başlat
            this.initSocket();

            // 1. Şablonları çek
            const tplRes = await fetch(CONFIG.API_URL + '/pricing/templates', { headers });
            if (tplRes.ok) {
                const apiTemplates = await tplRes.json();
                this.templates = apiTemplates;
                this.renderTemplates();
                this.selectTemplate(this.activeTemplateKey);
            }

            // 2. Taşıyıcıları çek
            const carrierRes = await fetch(CONFIG.API_URL + '/pricing/carriers', { headers });
            if (carrierRes.ok) {
                const apiCarriers = await carrierRes.json();
                this.carriers = apiCarriers;
                this.renderCarriers();
            }

            // 3. Margin Kurallarını çek (Faz 5)
            try {
                const marginsRes = await fetch(CONFIG.API_URL + '/pricing/margins', { headers });
                if (marginsRes.ok) {
                    this.margins = await marginsRes.json();
                    this.renderMargins();
                }
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Margin kuralları yüklenemedi, varsayılanlar devrede.');
            }

            // 4. Taşıyıcı Performans Skorlarını çek (Faz 5)
            try {
                const perfRes = await fetch(CONFIG.API_URL + '/pricing/carrier_performance', { headers });
                if (perfRes.ok) {
                    this.carrierPerformances = await perfRes.json();
                    this.renderCarriers(); // Performans skorlarıyla tekrar çiz
                }
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Performans skorları yüklenemedi.');
            }

            let needsCommit = false;

            // 5. Konuşmaları (conversations) çek (Faz 3) - Sadece ilk sayfayı yükler
            try {
                await this.loadConversations(1, false);
                needsCommit = true;
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Konuşmalar yüklenemedi.');
            }

            // 6. Metrikleri çek (Faz 1)
            try {
                const metricsRes = await fetch(CONFIG.API_URL + '/pricing/metrics', { headers });
                if (metricsRes.ok) {
                    this.metrics = await metricsRes.json();
                    needsCommit = true;
                }
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Metrikler yüklenemedi.');
            }

            // 7. Outlook bağlantı durumunu sorgula
            try {
                const outlookRes = await fetch(CONFIG.API_URL + '/outlook/status', { headers });
                if (outlookRes.ok) {
                    const status = await outlookRes.json();
                    if (status.isConnected) {
                        this.app.state.outlookConnected = true;
                        this.app.state.outlookEmail = status.email;
                        needsCommit = true;
                    } else {
                        if (this.app.state.outlookConnected) {
                            this.app.state.outlookConnected = false;
                            delete this.app.state.outlookEmail;
                            needsCommit = true;
                        }
                    }
                }
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Outlook durumu yüklenemedi.');
            }

            if (needsCommit) {
                const currentId = this.app.state.activeConversationId;
                this.app.state.activeConversationId = currentId;
                this.app.commit();
            }
            this.scrollToBottom();

        } catch (err) {
            console.warn('[PRUVA AI MANAGER] API\'den veri çekilemedi:', err.message);
        }
    }

    // Kullanıcıya özel localStorage anahtarı (farklı hesaplar karışmasın)
    _storageKey(suffix) {
        const uid = this.app.state.user?.id || window.fbAuth?.currentUser?.uid || 'guest';
        return `pruva_ai_${suffix}_${uid}`;
    }

    saveTemplates() {
        try {
            localStorage.setItem(this._storageKey('templates'), JSON.stringify(this.templates));
        } catch (e) {
            console.warn('[PRUVA AI] Şablonlar yerel olarak kaydedilemedi:', e.message);
        }
    }

    saveCarriers() {
        try {
            localStorage.setItem(this._storageKey('carriers'), JSON.stringify(this.carriers));
        } catch (e) {
            console.warn('[PRUVA AI] Taşıyıcılar yerel olarak kaydedilemedi:', e.message);
        }
    }

    saveRules() {
        try {
            localStorage.setItem(this._storageKey('rules'), JSON.stringify(this.rules));
        } catch (e) {
            console.warn('[PRUVA AI] Kurallar yerel olarak kaydedilemedi:', e.message);
        }
    }

    // localStorage'da kayıtlı veriler varsa yükle (API'den önce fallback olarak)
    loadFromLocalStorage() {
        try {
            const t = localStorage.getItem(this._storageKey('templates'));
            if (t) this.templates = JSON.parse(t);
            const c = localStorage.getItem(this._storageKey('carriers'));
            if (c) this.carriers = JSON.parse(c);
            const r = localStorage.getItem(this._storageKey('rules'));
            if (r) this.rules = JSON.parse(r);
        } catch (e) {
            console.warn('[PRUVA AI] Yerel veriler okunamadı:', e.message);
        }
    }

    getMetrics() {
        return this.metrics;
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.previewMode = false;
        
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-mode') === mode) {
                tab.classList.add('active');
            }
        });

        this.renderTemplates();
        this.renderRules();
        this.initVariablesDropdown();
        this.selectTemplate(`${mode}-request`);
    }

    renderTemplates() {
        const listContainer = document.getElementById('templates-list-container');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        const modeKeys = {
            fcl: ['fcl-request', 'fcl-offer', 'fcl-negotiation', 'fcl-followup'],
            lcl: ['lcl-request', 'lcl-offer', 'lcl-negotiation', 'lcl-followup'],
            air: ['air-request', 'air-offer', 'air-negotiation', 'air-followup'],
            road: ['road-request', 'road-offer', 'road-negotiation', 'road-followup']
        };

        const keys = modeKeys[this.currentMode] || [];
        
        keys.forEach(key => {
            const tpl = this.templates[key];
            if (!tpl) return;

            const card = document.createElement('div');
            card.className = `template-card ${this.activeTemplateKey === key ? 'active' : ''}`;
            card.id = `card-${key}`;
            card.onclick = () => this.selectTemplate(key);
            
            let modeColor = 'var(--color-fcl)';
            if (this.currentMode === 'lcl') modeColor = 'var(--color-lcl)';
            if (this.currentMode === 'air') modeColor = 'var(--color-air)';
            if (this.currentMode === 'road') modeColor = 'var(--color-road)';
            card.style.setProperty('--active-color', modeColor);

            card.innerHTML = `
                <h4>${tpl.name}</h4>
                <p id="desc-${key}">${tpl.body.substring(0, 45).replace(/\n/g, ' ')}...</p>
            `;
            listContainer.appendChild(card);
        });
    }

    selectTemplate(key) {
        this.activeTemplateKey = key;
        this.previewMode = false;

        document.querySelectorAll('.template-card').forEach(card => card.classList.remove('active'));
        
        const activeCard = document.getElementById(`card-${key}`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        const editPanel = document.getElementById('editor-body-panel');
        const previewPanel = document.getElementById('preview-body-panel');
        if (editPanel) editPanel.style.display = 'flex';
        if (previewPanel) previewPanel.classList.remove('show');
        
        const pBtn = document.getElementById('preview-toggle-btn');
        if (pBtn) {
            pBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Önizleme</span>
            `;
        }

        const tpl = this.templates[key];
        if (tpl) {
            const titleEl = document.getElementById('current-template-title');
            const subEl = document.getElementById('current-template-subtitle');
            const subInput = document.getElementById('template-subject');
            const bodyTextarea = document.getElementById('template-body');

            if (titleEl) titleEl.textContent = tpl.name;
            if (subEl) subEl.textContent = `Şablon Kodu: ${key.toUpperCase()}`;
            if (subInput) subInput.value = tpl.subject;
            if (bodyTextarea) bodyTextarea.value = tpl.body;
        }

        this.analyzeVariables();
        this.initVariablesDropdown();
    }

    async saveCurrentTemplate() {
        const key = this.activeTemplateKey;
        const subject = document.getElementById('template-subject').value;
        const body = document.getElementById('template-body').value;

        if (this.templates[key]) {
            this.templates[key].subject = subject;
            this.templates[key].body = body;
            
            const desc = document.getElementById(`desc-${key}`);
            if (desc) {
                desc.textContent = body.substring(0, 45).replace(/\n/g, ' ') + '...';
            }

            // LocalStorage'a kaydet (Fallback)
            this.saveTemplates();

            // API'ye gönder
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                
                const res = await fetch(CONFIG.API_URL + '/pricing/templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ key, subject, body })
                });

                if (res.ok) {
                    this.showToast('Şablon başarıyla kaydedildi!', 'success');
                } else {
                    throw new Error('API Hatası');
                }
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] API\'ye şablon kaydedilemedi:', err.message);
                this.showToast('Şablon kaydedildi (Çevrimdışı mod).', 'success');
            }
        }
    }

    async resetCurrentTemplate() {
        const key = this.activeTemplateKey;
        const defaultTpl = this.DEFAULT_TEMPLATES[key];

        if (defaultTpl) {
            document.getElementById('template-subject').value = defaultTpl.subject;
            document.getElementById('template-body').value = defaultTpl.body;

            this.templates[key] = JSON.parse(JSON.stringify(defaultTpl));
            this.saveTemplates();

            const desc = document.getElementById(`desc-${key}`);
            if (desc) {
                desc.textContent = defaultTpl.body.substring(0, 45).replace(/\n/g, ' ') + '...';
            }

            this.analyzeVariables();
            this.showToast('Şablon varsayılan ayarlara sıfırlandı.', 'info');

            // API'den silerek default fallback'e dönmesini sağla
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                await fetch(CONFIG.API_URL + `/pricing/templates/${key}`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': token,
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] API sıfırlama hatası:', err.message);
            }
        }
    }

    toggleVariablesDropdown(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('variables-dropdown');
        if (dropdown) dropdown.classList.toggle('show');
    }

    initVariablesDropdown() {
        const container = document.getElementById('dropdown-variables-container');
        if (!container) return;
        container.innerHTML = '';

        const commonSection = this.createDropdownSection(this.VARIABLES_CONFIG.common.title, this.VARIABLES_CONFIG.common.items);
        container.appendChild(commonSection);

        const activeModeConfig = this.VARIABLES_CONFIG[this.currentMode];
        if (activeModeConfig) {
            const modeSection = this.createDropdownSection(activeModeConfig.title, activeModeConfig.items);
            container.appendChild(modeSection);
        }
    }

    createDropdownSection(title, items) {
        const sect = document.createElement('div');
        sect.className = 'dropdown-section';
        sect.innerHTML = `
            <div class="dropdown-section-title">${title}</div>
            <div class="dropdown-items"></div>
        `;

        const itemsContainer = sect.querySelector('.dropdown-items');
        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'dropdown-item';
            btn.type = 'button';
            btn.onclick = () => this.insertVariable(`{{${item.key}}}`);
            btn.innerHTML = `
                <span>${item.label}</span>
                <code>{{${item.key}}}</code>
            `;
            itemsContainer.appendChild(btn);
        });

        return sect;
    }

    insertVariable(variableText) {
        const textarea = document.getElementById('template-body');
        if (!textarea) return;

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const originalText = textarea.value;

        textarea.value = originalText.substring(0, startPos) + variableText + originalText.substring(endPos);
        textarea.selectionStart = textarea.selectionEnd = startPos + variableText.length;
        textarea.focus();

        this.analyzeVariables();
        
        const dropdown = document.getElementById('variables-dropdown');
        if (dropdown) dropdown.classList.remove('show');
    }

    analyzeVariables() {
        const bodyTextarea = document.getElementById('template-body');
        const subjectInput = document.getElementById('template-subject');
        if (!bodyTextarea || !subjectInput) return;

        const bodyText = bodyTextarea.value;
        const subjectText = subjectInput.value;
        const combinedText = bodyText + ' ' + subjectText;

        const regex = /\{\{([^}]+)\}\}/g;
        let foundVariables = [];
        let match;
        
        while ((match = regex.exec(combinedText)) !== null) {
            foundVariables.push(match[1].trim().toUpperCase());
        }
        foundVariables = [...new Set(foundVariables)];

        const chipsContainer = document.getElementById('variables-analysis-chips');
        if (!chipsContainer) return;
        chipsContainer.innerHTML = '';

        const activeMandatories = this.MANDATORY_CONFIG[this.currentMode] || [];
        const isMissingInfoTemplate = (this.activeTemplateKey === 'common-missing');
        let missingMandatoriesCount = 0;

        if (!isMissingInfoTemplate) {
            activeMandatories.forEach(key => {
                const isDisabled = this.rules.disabledMandatories.includes(key);
                const isPresent = foundVariables.includes(key);
                const chip = document.createElement('div');
                
                if (isDisabled) {
                    chip.className = `chip optional ${isPresent ? 'valid' : ''}`;
                    chip.innerHTML = `${isPresent ? '✓' : '○'} ${key} (Pasif)`;
                } else {
                    if (isPresent) {
                        chip.className = 'chip valid';
                        chip.innerHTML = `✓ ${key}`;
                    } else {
                        chip.className = 'chip invalid';
                        chip.innerHTML = `✗ ${key}`;
                        missingMandatoriesCount++;
                    }
                }
                chipsContainer.appendChild(chip);
            });
        } else {
            const commonMandatory = ['CUSTOMER_NAME', 'MISSING_INFO', 'AVAILABLE_INFO', 'SIGNATURE'];
            commonMandatory.forEach(key => {
                const isPresent = foundVariables.includes(key);
                const chip = document.createElement('div');
                if (isPresent) {
                    chip.className = 'chip valid';
                    chip.innerHTML = `✓ ${key}`;
                } else {
                    chip.className = 'chip invalid';
                    chip.innerHTML = `✗ ${key}`;
                    missingMandatoriesCount++;
                }
                chipsContainer.appendChild(chip);
            });
        }

        foundVariables.forEach(key => {
            if (!isMissingInfoTemplate && activeMandatories.includes(key)) return;
            if (isMissingInfoTemplate && ['CUSTOMER_NAME', 'MISSING_INFO', 'AVAILABLE_INFO', 'SIGNATURE'].includes(key)) return;

            const chip = document.createElement('div');
            chip.className = 'chip optional valid';
            chip.innerHTML = `✓ ${key}`;
            chipsContainer.appendChild(chip);
        });

        const summarySpan = document.getElementById('analysis-summary');
        if (summarySpan) {
            if (missingMandatoriesCount > 0) {
                summarySpan.textContent = `${missingMandatoriesCount} Zorunlu Alan Eksik`;
                summarySpan.style.color = 'var(--danger)';
            } else {
                summarySpan.textContent = 'Tüm Zorunlu Alanlar Tamam';
                summarySpan.style.color = 'var(--success)';
            }
        }
    }

    togglePreviewMode() {
        this.previewMode = !this.previewMode;

        const editPanel = document.getElementById('editor-body-panel');
        const previewPanel = document.getElementById('preview-body-panel');
        const pBtn = document.getElementById('preview-toggle-btn');

        if (!editPanel || !previewPanel || !pBtn) return;

        if (this.previewMode) {
            editPanel.style.display = 'none';
            previewPanel.classList.add('show');
            
            pBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                <span>Editör</span>
            `;

            this.renderMailPreview();
        } else {
            editPanel.style.display = 'flex';
            previewPanel.classList.remove('show');

            pBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Önizleme</span>
            `;
        }
    }

    renderMailPreview() {
        const subjectTemplate = document.getElementById('template-subject').value;
        const bodyTemplate = document.getElementById('template-body').value;

        let toEmail = 'musteri@sirket.com';
        
        if (this.activeTemplateKey.includes('request') || this.activeTemplateKey.includes('negotiation') || this.activeTemplateKey.includes('followup')) {
            const matchedCarrier = this.carriers.find(c => c.template === this.activeTemplateKey && c.active);
            toEmail = matchedCarrier ? matchedCarrier.email : 'pricing@partner-lines.com';
        } else if (this.activeTemplateKey.includes('offer')) {
            toEmail = 'import@arcelik.com';
        }

        let renderedSubject = subjectTemplate;
        let renderedBody = bodyTemplate;

        for (const [key, value] of Object.entries(this.MOCK_PREVIEW_VALUES)) {
            const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            renderedSubject = renderedSubject.replace(placeholder, value);
            renderedBody = renderedBody.replace(placeholder, value);
        }

        renderedSubject = renderedSubject.replace(/\{\{\s*([A-Za-z0-9_\u00C0-\u024F\u0100-\u017F\u011E\u011F\u0130\u0131\u015E\u015F\u00D6\u00F6\u00DC\u00FC\u00C7\u00E7]+)\s*\}\}/g, '[$1]');
        renderedBody = renderedBody.replace(/\{\{\s*([A-Za-z0-9_\u00C0-\u024F\u0100-\u017F\u011E\u011F\u0130\u0131\u015E\u015F\u00D6\u00F6\u00DC\u00FC\u00C7\u00E7]+)\s*\}\}/g, '[$1]');

        const toEl = document.getElementById('preview-to');
        const subEl = document.getElementById('preview-subject');
        const contEl = document.getElementById('preview-content');

        if (toEl) toEl.textContent = toEmail;
        if (subEl) subEl.textContent = renderedSubject;
        if (contEl) contEl.textContent = renderedBody;
    }

    renderRules() {
        const container = document.getElementById('mandatory-rules-checkboxes');
        if (!container) return;
        container.innerHTML = '';

        const list = this.MANDATORY_CONFIG[this.currentMode] || [];

        list.forEach(key => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            
            const isChecked = !this.rules.disabledMandatories.includes(key);

            label.innerHTML = `
                <input type="checkbox" value="${key}" ${isChecked ? 'checked' : ''} onchange="window.pruvaAiManager.toggleMandatoryRule(this)">
                <span>${key}</span>
            `;
            container.appendChild(label);
        });
    }

    toggleMandatoryRule(checkbox) {
        const key = checkbox.value;
        if (checkbox.checked) {
            this.rules.disabledMandatories = this.rules.disabledMandatories.filter(x => x !== key);
        } else {
            if (!this.rules.disabledMandatories.includes(key)) {
                this.rules.disabledMandatories.push(key);
            }
        }
        this.saveRules();
        this.analyzeVariables();
    }

    saveRuleSettings() {
        const autoInqEl = document.getElementById('rule-auto-inquiry');
        const maxRoundsEl = document.getElementById('rule-max-rounds');

        if (autoInqEl) this.rules.autoInquiry = autoInqEl.checked;
        if (maxRoundsEl) this.rules.maxRounds = parseInt(maxRoundsEl.value) || 3;

        this.saveRules();
    }

    initSocket() {
        if (this.socket) return; // Zaten bağlı
        
        const userId = this.app.state.user?.id;
        if (!userId) return;

        // Socket.io sunucusuna bağlan (backend URL)
        this.socket = io(CONFIG.API_URL.replace('/api', ''));
        
        this.socket.on('connect', () => {
            console.log('[PRUVA AI MANAGER] Socket bağlandı, odaya katılınıyor...');
            this.socket.emit('join', userId);
        });

        // Backend'den gelen olayları dinle
        this.socket.on('NEW_AI_ACTION', (data) => {
            console.log('[PRUVA AI MANAGER] Socket.io Event Alındı:', data);
            
            // Eğer yeni mail tarandıysa, konuşmaları (1. sayfasını) yeniden yükle ve UI'ı güncelle
            if (data.type === 'NEW_EMAILS_SCANNED' || data.type === 'INITIAL_SCAN_COMPLETE') {
                this.showToast(data.message || 'Yeni bildirim alındı', 'info');
                
                // Konuşmaları sessizce yenile (sayfayı 1'e çek ve baştan yükle)
                this.loadConversations(1, false);
            }
            
        });

        // Outlook bağlantısı socket üzerinden gelirse (Cross-origin popup sorununu çözmek için)
        this.socket.on('OUTLOOK_CONNECTED', (data) => {
            console.log('[PRUVA AI MANAGER] OUTLOOK_CONNECTED Event Alındı:', data);
            const email = data.email || (data.data && data.data.email) || '';
            this.showToast(`Outlook başarıyla bağlandı: ${email} 🎉`, 'success');
            
            if (this.activeOutlookPopup && !this.activeOutlookPopup.closed) {
                this.activeOutlookPopup.close();
            }
            
            this.app.state.outlookConnected = true;
            this.app.state.outlookEmail = email;
            if (this.app.store) this.app.store.save();
            this.app.commit();
            
            // Konuşmaları yenile
            this.loadConversations(1, false);
        });

        this.socket.on('disconnect', () => {
            console.warn('[PRUVA AI MANAGER] Socket bağlantısı koptu.');
        });
    }

    async loadConversations(page = 1, append = false) {
        try {
            const token = await this.getAuthToken();
            if (!token) return;

            const res = await fetch(CONFIG.API_URL + `/ai/conversations?page=${page}&limit=20&_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const apiConversations = await res.json();
                
                // P-AI Komut Merkezi (copilot) veritabanında tutulmadığı için lokal kopyasını koru
                const existingCopilot = (this.app.state.pricingConversations || []).find(c => c.id === 'copilot');
                
                if (append) {
                    // Ekstra sayfaları ekle (var olanları kopyalamamak için ID bazlı kontrol yapılabilir)
                    const existingEmails = new Set((this.app.state.pricingConversations || []).map(c => c.email).filter(Boolean));
                    const existingIds = new Set((this.app.state.pricingConversations || []).map(c => c.id));
                    
                    const newConvs = [];
                    for (const c of apiConversations) {
                        if (existingIds.has(c.id)) continue;
                        
                        if (c.email && existingEmails.has(c.email)) {
                            // Merge older messages into existing conversation
                            const existingConv = this.app.state.pricingConversations.find(ex => ex.email === c.email);
                            if (existingConv) {
                                const existingMsgTimestamps = new Set(existingConv.messages.map(m => m.timestamp));
                                const newMessages = c.messages.filter(m => !existingMsgTimestamps.has(m.timestamp));
                                existingConv.messages = [...newMessages, ...existingConv.messages];
                                existingConv.messages.sort((a, b) => new Date(a.timestamp || a.time) - new Date(b.timestamp || b.time));
                            }
                        } else {
                            newConvs.push(c);
                            if (c.email) existingEmails.add(c.email);
                            existingIds.add(c.id);
                        }
                    }
                    this.app.state.pricingConversations = [...(this.app.state.pricingConversations || []), ...newConvs];
                } else {
                    this.app.state.pricingConversations = apiConversations;
                    if (existingCopilot) {
                        this.app.state.pricingConversations.unshift(existingCopilot);
                    }
                }

                // Sayfalama durumu state'te tutulur
                this.app.state.convPage = page;
                this.app.state.convHasMore = apiConversations.length === 20;

                // Mevcut aktif konuşmayı koru
                if (this.app.state.activeConversationId === null) {
                    this.app.state.activeConversationId = 'copilot';
                }
                
                this.app.commit();
            }
        } catch (err) {
            console.warn('[PRUVA AI MANAGER] Konuşmalar sayfa yüklenemedi:', err);
        }
    }

    renderCarriers() {
        const container = document.getElementById('carriers-list-container');
        if (!container) return;
        container.innerHTML = '';

        const groups = {
            armator: [],
            nvocc: [],
            acente: [],
            hava: [],
            kara: []
        };

        this.carriers.forEach(c => {
            if (groups[c.category]) {
                groups[c.category].push(c);
            }
        });

        for (const [key, list] of Object.entries(groups)) {
            if (list.length === 0) continue;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'carrier-group';
            groupDiv.innerHTML = `<div class="carrier-group-title">${this.CATEGORIES[key]}</div>`;

            list.forEach(carrier => {
                const card = document.createElement('div');
                card.className = `carrier-card ${carrier.active ? '' : 'passive'}`;
                card.style.opacity = carrier.active ? '1' : '0.6';

                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    starsHtml += `<span style="color: ${i <= carrier.rating ? 'var(--accent)' : 'var(--text-muted)'}">&#9733;</span>`;
                }

                // Performans skorlarını hesapla (Faz 5)
                const carrierPerfs = this.carrierPerformances ? this.carrierPerformances.filter(p => p.carrier_id === carrier.id) : [];
                
                let perfHtml = '';
                if (carrierPerfs.length > 0) {
                    const avgResponse = (carrierPerfs.reduce((sum, p) => sum + parseFloat(p.response_hours), 0) / carrierPerfs.length).toFixed(1);
                    const winCount = carrierPerfs.filter(p => p.was_selected).length;
                    const winRate = Math.round((winCount / carrierPerfs.length) * 100);
                    
                    perfHtml = `
                        <div class="carrier-performance-stats" style="margin-top: 8px; display: flex; gap: 8px; justify-content: space-between; border-top: 1px dashed var(--border); padding-top: 6px; font-size: 0.72rem;">
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 3px;">
                                ⏱️ Yanıt: <strong style="color: var(--primary); font-weight: 700;">${avgResponse} sa</strong>
                            </span>
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 3px;">
                                🎯 Kazanma: <strong style="color: var(--success); font-weight: 700;">%${winRate}</strong>
                            </span>
                        </div>
                    `;
                } else {
                    perfHtml = `
                        <div class="carrier-performance-stats" style="margin-top: 8px; display: flex; gap: 8px; justify-content: space-between; border-top: 1px dashed var(--border); padding-top: 6px; font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                            Henüz performans verisi yok
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="carrier-top">
                        <div class="carrier-info">
                            <h4>
                                <span>${carrier.name}</span>
                            </h4>
                            <div class="carrier-email">${carrier.email}</div>
                        </div>
                        <div class="carrier-actions">
                            <label class="form-switch" title="Aktif/Pasif">
                                <input type="checkbox" ${carrier.active ? 'checked' : ''} onchange="window.pruvaAiManager.toggleCarrierActive(${carrier.id}, this.checked)">
                                <span class="switch-slider"></span>
                            </label>
                            <button class="delete-btn" onclick="window.pruvaAiManager.deleteCarrier(${carrier.id})" title="Sil">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="carrier-meta">
                        <span class="carrier-routes" title="${carrier.regions.join(', ')}">${carrier.regions.join(', ')}</span>
                        <div class="carrier-stars">${starsHtml}</div>
                    </div>
                    ${perfHtml}
                `;
                groupDiv.appendChild(card);
            });

            container.appendChild(groupDiv);
        }
    }

    async toggleCarrierActive(id, checked) {
        const idx = this.carriers.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.carriers[idx].active = checked;
            this.saveCarriers();
            this.renderCarriers();

            // API güncelle
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                await fetch(CONFIG.API_URL + `/pricing/carriers/${id}/toggle`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ active: checked })
                });
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Taşıyıcı durumu API\'ye kaydedilemedi:', err.message);
            }
        }
    }

    async deleteCarrier(id) {
        if (confirm('Bu taşıyıcıyı listeden silmek istediğinize emin misiniz?')) {
            const carrier = this.carriers.find(c => c.id === id);
            const name = carrier ? carrier.name : '';

            this.carriers = this.carriers.filter(c => c.id !== id);
            this.saveCarriers();
            this.renderCarriers();
            this.showToast('Taşıyıcı silindi.', 'danger');

            // API silme
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                await fetch(CONFIG.API_URL + `/pricing/carriers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': token,
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.warn('[PRUVA AI MANAGER] Taşıyıcı API\'den silinemedi:', err.message);
            }
        }
    }

    openAddCarrierModal() {
        const tplSelect = document.getElementById('carrier-form-template');
        if (!tplSelect) return;
        tplSelect.innerHTML = '';
        
        for (const [key, value] of Object.entries(this.templates)) {
            tplSelect.innerHTML += `<option value="${key}">${value.name} (${key.split('-')[0].toUpperCase()})</option>`;
        }

        const nameInput = document.getElementById('carrier-form-name');
        const emailInput = document.getElementById('carrier-form-email');
        const catSelect = document.getElementById('carrier-form-category');

        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (catSelect) catSelect.selectedIndex = 0;
        
        this.setFormStars(5);
        
        document.querySelectorAll('input[name="carrier-regions"]').forEach(cb => cb.checked = false);

        const modal = document.getElementById('add-carrier-modal');
        if (modal) modal.classList.add('show');
    }

    closeAddCarrierModal() {
        const modal = document.getElementById('add-carrier-modal');
        if (modal) modal.classList.remove('show');
    }

    setFormStars(rating) {
        this.activeStarsForm = rating;
        const stars = document.querySelectorAll('#carrier-form-stars span');
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-star'));
            if (val <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    async saveNewCarrier() {
        const name = document.getElementById('carrier-form-name').value.trim();
        const email = document.getElementById('carrier-form-email').value.trim();
        const category = document.getElementById('carrier-form-category').value;
        const template = document.getElementById('carrier-form-template').value;
        
        const checkedRegions = [];
        document.querySelectorAll('input[name="carrier-regions"]:checked').forEach(cb => {
            checkedRegions.push(cb.value);
        });

        if (!name) {
            alert('Lütfen firma adını girin.');
            return;
        }
        if (!email || !email.includes('@')) {
            alert('Lütfen geçerli bir e-posta adresi girin.');
            return;
        }
        if (checkedRegions.length === 0) {
            alert('Lütfen en az bir etkin güzergah bölgesi seçin.');
            return;
        }

        const newId = this.carriers.length > 0 ? Math.max(...this.carriers.map(c => c.id)) + 1 : 1;

        const carrier = {
            id: newId,
            name: name,
            email: email,
            category: category,
            regions: checkedRegions,
            rating: this.activeStarsForm,
            template: template,
            active: true
        };

        // Local state ve localStorage
        this.carriers.push(carrier);
        this.saveCarriers();
        this.renderCarriers();
        this.closeAddCarrierModal();

        // API'ye gönder
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const res = await fetch(CONFIG.API_URL + '/pricing/carriers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(carrier)
            });

            if (res.ok) {
                const data = await res.json();
                // backend'in atadığı gerçek id'yi alıp local eşitleyelim
                carrier.id = data.id;
                this.saveCarriers();
                this.renderCarriers();
                this.showToast(`${name} başarıyla taşıyıcı listesine eklendi!`, 'success');
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.warn('[PRUVA AI MANAGER] API\'ye taşıyıcı eklenemedi:', err.message);
            this.showToast(`${name} listeye eklendi (Yerel mod).`, 'success');
        }
    }

    switchMainTab(tab) {
        const workspaceEditor = document.getElementById('workspace-editor');
        const workspaceMargins = document.getElementById('workspace-margins');
        const workspaceHistory = document.getElementById('workspace-history');
        const btnTabEditor = document.getElementById('btn-tab-editor');
        const btnTabMargins = document.getElementById('btn-tab-margins');
        const btnTabHistory = document.getElementById('btn-tab-history');

        // Reset all displays
        if (workspaceEditor) workspaceEditor.style.display = 'none';
        if (workspaceMargins) workspaceMargins.style.display = 'none';
        if (workspaceHistory) workspaceHistory.style.display = 'none';

        if (btnTabEditor) {
            btnTabEditor.style.background = 'transparent';
            btnTabEditor.style.color = 'var(--text-secondary)';
        }
        if (btnTabMargins) {
            btnTabMargins.style.background = 'transparent';
            btnTabMargins.style.color = 'var(--text-secondary)';
        }
        if (btnTabHistory) {
            btnTabHistory.style.background = 'transparent';
            btnTabHistory.style.color = 'var(--text-secondary)';
        }

        if (tab === 'editor') {
            if (workspaceEditor) workspaceEditor.style.display = 'grid';
            if (btnTabEditor) {
                btnTabEditor.style.background = 'var(--primary)';
                btnTabEditor.style.color = 'white';
            }
        } else if (tab === 'margins') {
            if (workspaceMargins) workspaceMargins.style.display = 'grid';
            if (btnTabMargins) {
                btnTabMargins.style.background = 'var(--primary)';
                btnTabMargins.style.color = 'white';
            }
            this.renderMargins();
        } else if (tab === 'history') {
            if (workspaceHistory) workspaceHistory.style.display = 'grid';
            if (btnTabHistory) {
                btnTabHistory.style.background = 'var(--primary)';
                btnTabHistory.style.color = 'white';
            }
            this.loadRateHistory();
        }
    }

    async loadRateHistory() {
        const polEl = document.getElementById('history-form-pol');
        const podEl = document.getElementById('history-form-pod');
        const modeEl = document.getElementById('history-form-mode');
        
        const pol = polEl ? polEl.value.trim() : 'Şangay';
        const pod = podEl ? podEl.value.trim() : 'Ambarlı';
        const mode = modeEl ? modeEl.value : 'DENIZ_FCL';

        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <tr style="border-bottom: 1px solid var(--border);">
                <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="width: 16px; height: 16px; border: 2px solid var(--border); border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></span>
                        Sorgulanıyor...
                    </div>
                </td>
            </tr>
        `;

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const res = await fetch(CONFIG.API_URL + `/pricing/rate-history?pol=${encodeURIComponent(pol)}&pod=${encodeURIComponent(pod)}&mode=${encodeURIComponent(mode)}`, {
                headers: {
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                this.renderRateHistoryTable(data);
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.warn('[PRUVA AI MANAGER] API\'den rate geçmişi alınamadı:', err.message);
            const tbody = document.getElementById('history-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td colspan="5" style="padding: 20px; text-align: center; color: var(--danger);">Veriler alınırken bir hata oluştu. Sunucu bağlantısını kontrol edin.</td>
                    </tr>
                `;
            }
        }
    }

    renderRateHistoryTable(data) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">Aradığınız kriterlere uygun geçmiş navlun kaydı bulunamadı.</td>
                </tr>
            `;
            return;
        }

        const prices = data.map(r => parseFloat(r.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        data.forEach(row => {
            const priceVal = parseFloat(row.price);
            let priceStyle = 'font-weight: 700; color: var(--text-primary);';
            let priceBadge = '';
            
            if (priceVal === minPrice && minPrice !== maxPrice) {
                priceStyle = 'font-weight: 800; color: #10b981;';
                priceBadge = '<span style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px;">EN UCUZ</span>';
            } else if (priceVal === maxPrice && minPrice !== maxPrice) {
                priceStyle = 'font-weight: 800; color: #ef4444;';
                priceBadge = '<span style="background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px;">EN YÜKSEK</span>';
            }

            const formattedDate = new Date(row.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            const validDate = row.valid_until ? new Date(row.valid_until).toLocaleDateString('tr-TR') : 'Süresiz';

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid var(--border); transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.01)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 12px 8px; color: var(--text-secondary);">${formattedDate}</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: var(--text-primary);">${row.carrier_name}</td>
                    <td style="padding: 12px 8px; ${priceStyle}">${row.currency} ${priceVal.toFixed(2)}${priceBadge}</td>
                    <td style="padding: 12px 8px; color: var(--text-secondary);">${row.container_type || 'Standart'}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${validDate}</td>
                </tr>
            `;
        });
    }

    renderMargins() {
        const container = document.getElementById('margins-list-container');
        if (!container) return;
        container.innerHTML = '';

        if (!this.margins || this.margins.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <span style="font-size: 3rem; display: block; margin-bottom: 12px;">📊</span>
                    <h4 style="color: var(--text-primary);">Henüz Margin Kuralı Yok</h4>
                    <p style="font-size: 0.8rem;">Sol taraftaki paneli kullanarak ilk marj kuralını oluşturabilirsiniz.</p>
                </div>
            `;
            return;
        }

        this.margins.forEach(margin => {
            const card = document.createElement('div');
            card.className = 'carrier-card';
            card.style.padding = '16px';
            card.style.border = '1px solid var(--border)';
            card.style.borderRadius = 'var(--radius-md)';
            card.style.background = 'rgba(255,255,255,0.02)';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '8px';

            const getModeLabel = (mode) => {
                switch(mode) {
                    case 'DENIZ_FCL': return '🚢 Deniz FCL';
                    case 'DENIZ_LCL': return '📦 Deniz LCL';
                    case 'HAVA': return '✈️ Hava';
                    case 'KARA': return '🚛 Kara';
                    default: return '🌐 Ortak';
                }
            };

            const getCustTypeLabel = (type) => {
                switch(type) {
                    case 'VIP': return '★ VIP';
                    case 'SENSITIVE': return 'Fiyat Duyarlı';
                    default: return 'Standart';
                }
            };

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text-primary); font-size: 0.95rem;">${margin.region}</strong>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem; font-weight: 800; color: ${margin.margin_percent >= 0 ? 'var(--success)' : 'var(--danger)'}">
                            ${margin.margin_percent >= 0 ? '+' : ''}${margin.margin_percent}%
                        </span>
                        <button onclick="window.pruvaAiManager.deleteMarginRule(${margin.id})" title="Kuralı Sil" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 6px; padding: 4px 6px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px; border-top: 1px dashed var(--border); padding-top: 8px;">
                    <div>Mod: <strong style="color: var(--text-primary);">${getModeLabel(margin.transport_mode)}</strong></div>
                    <div>Müşteri: <strong style="color: var(--text-primary);">${getCustTypeLabel(margin.customer_type)}</strong></div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async saveMarginRule() {
        const region = document.getElementById('margin-form-region').value;
        const transport_mode = document.getElementById('margin-form-mode').value;
        const customer_type = document.getElementById('margin-form-custtype').value;
        const margin_percent = parseFloat(document.getElementById('margin-form-percent').value);

        if (isNaN(margin_percent)) {
            alert('Lütfen geçerli bir marj yüzdesi girin.');
            return;
        }

        const newMargin = {
            region,
            transport_mode,
            margin_percent,
            customer_type
        };

        // Fallback: Local save
        const tempId = Date.now() + Math.floor(Math.random() * 1000);
        newMargin.id = tempId;
        if (!this.margins) this.margins = [];
        this.margins.push(newMargin);
        this.renderMargins();
        
        const form = document.getElementById('margin-rule-form');
        if (form) form.reset();

        // API post
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const res = await fetch(CONFIG.API_URL + '/pricing/margins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    region,
                    transport_mode,
                    margin_percent,
                    customer_type
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Update with real ID from backend
                const idx = this.margins.findIndex(m => m.id === tempId);
                if (idx !== -1) {
                    this.margins[idx].id = data.id;
                }
                this.renderMargins();
                this.showToast('Margin kuralı başarıyla eklendi ve eşitlendi!', 'success');
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.warn('[PRUVA AI MANAGER] Margin kuralı API\'ye kaydedilemedi, yerel mod etkin:', err.message);
            this.showToast('Margin kuralı eklendi (Çevrimdışı mod).', 'success');
        }
    }

    async deleteMarginRule(id) {
        if (!confirm('Bu margin kuralını silmek istediğinize emin misiniz?')) return;
        
        this.margins = this.margins.filter(m => m.id !== id);
        this.renderMargins();

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            await fetch(CONFIG.API_URL + `/pricing/margins/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                }
            });
            this.showToast('Margin kuralı silindi.', 'danger');
        } catch (err) {
            console.warn('[PRUVA AI MANAGER] Margin kuralı API\'den silinemedi:', err.message);
            this.showToast('Margin kuralı silindi (Çevrimdışı mod).', 'danger');
        }
    }

    showToast(message, type = 'success') {
        const toastMap = {
            'Şablon başarıyla kaydedildi!': 'comp.pruva_ai.toast_template_saved',
            'Şablon kaydedildi (Çevrimdışı mod).': 'comp.pruva_ai.toast_template_saved_offline',
            'Şablon varsayılan ayarlara sıfırlandı.': 'comp.pruva_ai.toast_template_reset',
            'Yeni bildirim alındı': 'comp.pruva_ai.toast_new_notification',
            'Outlook başarıyla bağlandı': 'comp.pruva_ai.toast_outlook_connected',
            'Taşıyıcı silindi.': 'comp.pruva_ai.toast_carrier_deleted',
            'Margin kuralı başarıyla eklendi ve eşitlendi!': 'comp.pruva_ai.toast_margin_added',
            'Margin kuralı eklendi (Çevrimdışı mod).': 'comp.pruva_ai.toast_margin_added_offline',
            'Margin kuralı silindi.': 'comp.pruva_ai.toast_margin_deleted',
            'Margin kuralı silindi (Çevrimdışı mod).': 'comp.pruva_ai.toast_margin_deleted_offline',
            'Not kaydedildi ✅': 'comp.pruva_ai.toast_note_saved',
            'Mail taraması için Outlook hesabınızı bağlamalısınız.': 'comp.pruva_ai.toast_outlook_required',
            'E-postalar taranıyor... 📥': 'comp.pruva_ai.toast_scanning_emails',
            'Tarama tamamlandı.': 'comp.pruva_ai.toast_scan_complete',
            'E-posta tarama hatası: Sunucu bağlantısı kurulamadı.': 'comp.pruva_ai.toast_scan_error',
            'Outlook bağlantısı başlatılıyor... 🔌': 'comp.pruva_ai.toast_outlook_starting',
            'Lütfen önce giriş yapın.': 'comp.pruva_ai.toast_login_first',
            'Outlook bağlantısı başlatılamadı.': 'comp.pruva_ai.toast_outlook_failed',
            'Bağlantı kesiliyor... 🔌': 'comp.pruva_ai.toast_disconnecting',
            'Outlook bağlantısı başarıyla kesildi.': 'comp.pruva_ai.toast_outlook_disconnected',
            'Bağlantı kesilemedi.': 'comp.pruva_ai.toast_disconnect_failed',
            '⚠️ Yapay zekayı kullanmak için tanımlı bir e-posta (Outlook) ile bağlanmalısınız.': 'comp.pruva_ai.toast_ai_outlook_required',
            'Bu öneri bulunamadı veya daha önce işlenmiş.': 'comp.pruva_ai.toast_suggestion_not_found',
            'AI aksiyonu başarıyla onaylandı ve gönderildi!': 'comp.pruva_ai.toast_ai_approved',
            'AI önerisi reddedildi.': 'comp.pruva_ai.toast_ai_rejected',
            'Copilot konuşması arşivlenemez.': 'comp.pruva_ai.toast_archive_error',
            'Konuşma arşivlendi!': 'comp.pruva_ai.toast_archived',
            'Konuşma arşivden çıkarıldı!': 'comp.pruva_ai.toast_unarchived',
            'Geçmiş kalıcı olarak silindi!': 'comp.pruva_ai.toast_history_deleted',
            'Metin kopyalandı!': 'comp.pruva_ai.toast_copied',
            'Kopyalama başarısız oldu.': 'comp.pruva_ai.toast_copy_fail',
            'PAI Eller Serbest Modu Açıldı. Sizi dinliyorum...': 'comp.pruva_ai.toast_handsfree_on',
            'PAI Eller Serbest Modu Kapatıldı.': 'comp.pruva_ai.toast_handsfree_off',
            '⚠️ Sesli komutları kullanmak için tanımlı bir e-posta (Outlook) ile bağlanmalısınız.': 'comp.pruva_ai.toast_voice_outlook_required',
            'Tarayıcınız sesli komutu desteklemiyor.': 'comp.pruva_ai.toast_voice_not_supported',
            'Mikrofon izni verilmedi veya kapalı.': 'comp.pruva_ai.toast_mic_denied',
            'Ses algılanmadı, eller serbest modu kapatıldı.': 'comp.pruva_ai.toast_no_voice'
        };

        let translatedMessage = message;
        if (window.i18n && typeof window.i18n.t === 'function') {
            const trimmedMessage = String(message).trim();
            if (toastMap[trimmedMessage]) {
                translatedMessage = window.i18n.t(toastMap[trimmedMessage]);
            }
            else if (trimmedMessage.includes('başarıyla taşıyıcı listesine eklendi!')) {
                const name = trimmedMessage.split(' başarıyla taşıyıcı listesine eklendi!')[0];
                translatedMessage = name + ' ' + window.i18n.t('comp.pruva_ai.toast_carrier_added');
            }
            else if (trimmedMessage.includes('listeye eklendi (Yerel mod).')) {
                const name = trimmedMessage.split(' listeye eklendi (Yerel mod).')[0];
                translatedMessage = name + ' ' + window.i18n.t('comp.pruva_ai.toast_carrier_added_offline');
            }
            else if (trimmedMessage.startsWith('Outlook başarıyla bağlandı:')) {
                const suffix = trimmedMessage.slice('Outlook başarıyla bağlandı:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_outlook_connected') + suffix;
            }
            else if (trimmedMessage.startsWith('Dosyalar yüklenemedi:')) {
                const suffix = trimmedMessage.slice('Dosyalar yüklenemedi:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_upload_failed') + suffix;
            }
            else if (trimmedMessage.startsWith('Komut işlenemedi.')) {
                const suffix = trimmedMessage.slice('Komut işlenemedi.'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_command_failed') + suffix;
            }
            else if (trimmedMessage.startsWith('Hata:')) {
                const suffix = trimmedMessage.slice('Hata:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_error') + suffix;
            }
            else if (trimmedMessage.startsWith('Arşivleme hatası:')) {
                const suffix = trimmedMessage.slice('Arşivleme hatası:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_archive_fail') + suffix;
            }
            else if (trimmedMessage.startsWith('Arşivden çıkarma hatası:')) {
                const suffix = trimmedMessage.slice('Arşivden çıkarma hatası:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_unarchive_fail') + suffix;
            }
            else if (trimmedMessage.startsWith('Silme hatası:')) {
                const suffix = trimmedMessage.slice('Silme hatası:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_delete_fail') + suffix;
            }
            else if (trimmedMessage.startsWith('Ses oluşturulamadı:')) {
                const suffix = trimmedMessage.slice('Ses oluşturulamadı:'.length);
                translatedMessage = window.i18n.t('comp.pruva_ai.toast_voice_error') + suffix;
            }
        }

        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '56px';
        toast.style.right = '24px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = 'var(--radius-md)';
        toast.style.backgroundColor = 'var(--bg-surface)';
        toast.style.color = 'var(--text-primary)';
        toast.style.boxShadow = 'var(--shadow-premium)';
        toast.style.border = '1px solid var(--border)';
        toast.style.zIndex = '9999';
        toast.style.fontSize = '0.8rem';
        toast.style.fontWeight = '600';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        
        let icon = '✓';
        let color = 'var(--success)';
        if (type === 'danger') {
            icon = '✗';
            color = 'var(--danger)';
        } else if (type === 'info') {
            icon = 'ℹ';
            color = 'var(--info)';
        } else if (type === 'warning') {
            icon = '⚠';
            color = 'var(--warning, #f59e0b)';
        }

        toast.innerHTML = `<span style="color: ${color}; font-weight: 800; font-size: 1rem;">${icon}</span> ${translatedMessage}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // =========================================================================
    // PRUVA AI CHAT & INTERACTIVE WORKSPACE ENGINE
    // =========================================================================

    initializeDefaultConversations(state) {
        const defaultConversations = [];
        state.pricingConversations = defaultConversations;
        return defaultConversations;
    }

    selectConversation(id) {
        const parsedId = isNaN(id) ? id : Number(id);
        this.app.state.activeConversationId = parsedId;
        this.app.state.detailsDrawerOpen = false; // Close drawer when switching
        this.app.commit();
        this.scrollToBottom();
    }

    searchConversations(query) {
        this.app.state.convSearchQuery = query;
        this.app.commit();
    }

    filterConversations(filter) {
        this.app.state.convFilterMode = filter;
        this.app.commit();
    }

    updateCommandInput(val) {
        this.app.state.chatCommandInputValue = val;
    }



    // Kullanıcı komutları artık sadece backend üzerinden işlenecek.
    // Sahte (Mock) yanıt üreten processCommand tamamen kaldırılmıştır.


    toggleDetailsDrawer() {
        this.app.state.detailsDrawerOpen = !this.app.state.detailsDrawerOpen;
        const drawer = document.getElementById('details-drawer');
        const overlay = document.getElementById('details-overlay');
        
        if (drawer && overlay) {
            drawer.classList.add('animating');
            if (this.app.state.detailsDrawerOpen) {
                drawer.classList.add('active');
                overlay.classList.add('active');
                overlay.style.pointerEvents = 'auto';
                overlay.style.display = 'block';
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
                overlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (!this.app.state.detailsDrawerOpen) {
                        overlay.style.display = 'none';
                    }
                }, 350);
            }
            this.app.store.save(); // Just save state, no re-render
        } else {
            this.app.commit(); // Fallback
        }
    }

    saveConversationNotes() {
        const textarea = document.getElementById('conv-notes');
        if (!textarea) return;
        
        const convId = this.app.state.activeConversationId;
        const convs = this.app.state.pricingConversations || [];
        const conv = convs.find(c => c.id === convId);
        if (conv) {
            conv.notes = textarea.value;
            this.showToast('Not kaydedildi ✅', 'success');
        }
    }

    // Gerçek Zamanlı E-posta Polling'i Başlat (Faz 8)
    startEmailPolling() {
        return; // Polling geçici olarak devre dışı
    }

    // Polling'i Durdur
    stopEmailPolling() {
        this.hasLoadedData = false; // Reset data load guard
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[PRUVA AI] Polling durduruldu.');
        }
    }

    // E-posta tarama isteği tetikleme
    async triggerMailScan(silent = false) {
        if (!this.app.state.outlookConnected) {
            if (!silent) this.showToast('Mail taraması için Outlook hesabınızı bağlamalısınız.', 'warning');
            return;
        }

        if (!silent) this.showToast('E-postalar taranıyor... 📥', 'info');
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const response = await fetch(CONFIG.API_URL + '/outlook/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mockMode: false })
            });

            if (response.ok) {
                const result = await response.json();
                if (!silent) this.showToast(result.message || 'Tarama tamamlandı.', 'success');
                
                // Konuşmaları yeniden yükle
                const headers = { 'Authorization': `Bearer ${token}` };
                const convRes = await fetch(CONFIG.API_URL + `/ai/conversations?_t=${Date.now()}`, { headers });
                if (convRes.ok) {
                    const apiConversations = await convRes.json();
                    this.app.state.pricingConversations = apiConversations;
                    this.app.commit();
                }
            } else {
                throw new Error('Tarama işlemi sunucuda başarısız oldu.');
            }
        } catch (e) {
            console.warn('[PRUVA AI] Tarama başlatılamadı:', e);
            if (!silent) this.showToast('E-posta tarama hatası: Sunucu bağlantısı kurulamadı.', 'danger');
        }
    }

    async connectOutlook() {
        this.showToast('Outlook bağlantısı başlatılıyor... 🔌', 'info');
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            if (!token) {
                this.showToast('Lütfen önce giriş yapın.', 'warning');
                return;
            }
            
            const width = 600, height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            const backendBase = CONFIG.API_URL.replace(/\/api$/, '');
            const loginUrl = `${backendBase}/api/outlook/login?token=${token}`;
            
            // Open OAuth login popup
            const popup = window.open(loginUrl, 'Outlook Bağlantısı', `width=${width},height=${height},left=${left},top=${top}`);
            this.activeOutlookPopup = popup; // Socket.io üzerinden kapatabilmek için kaydet
            
            // Listen for successful callback message from popup (Eğer cross-origin engeline takılmazsa)
            const handleMessage = async (event) => {
                if (event.data && event.data.type === 'OUTLOOK_CONNECTED') {
                    window.removeEventListener('message', handleMessage);
                    
                    if (this.activeOutlookPopup && !this.activeOutlookPopup.closed) {
                        this.activeOutlookPopup.close();
                    }

                    // ─── EMAIL MATCH ENFORCEMENT ───
                    // Kullanıcının kayıtlı emaili ile Outlook hesabı eşleşmeli
                    const connectedEmail = (event.data.email || '').toLowerCase().trim();
                    const registeredEmail = (firebaseUser.email || '').toLowerCase().trim();
                    
                    if (connectedEmail && registeredEmail && connectedEmail !== registeredEmail) {
                        // Eşleşmedi — backend'e de disconnect gönder
                        try {
                            await fetch(CONFIG.API_URL + '/outlook/disconnect', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        } catch(e) { /* ignore */ }
                        
                        this.showToast(
                            `⚠️ Outlook hesabınız (${connectedEmail}) kayıtlı e-postanız (${registeredEmail}) ile eşleşmiyor. Lütfen kayıt olduğunuz e-posta ile bağlanın.`, 
                            'danger', 
                            8000
                        );
                        return;
                    }
                    // ─── END EMAIL MATCH ───

                    this.showToast(`Outlook başarıyla bağlandı: ${event.data.email} 🎉`, 'success');
                    
                    // Update connection state on frontend immediately
                    this.app.state.outlookConnected = true;
                    this.app.state.outlookEmail = event.data.email;
                    if (this.app.store) this.app.store.save();
                    this.app.commit();
                    
                    // Reload state after connection
                    this.loadConversations(1, false);
                }
            };
            window.addEventListener('message', handleMessage);
        } catch (e) {
            console.error('Outlook connection error:', e);
            this.showToast('Outlook bağlantısı başlatılamadı.', 'danger');
        }
    }

    async disconnectOutlook() {
        if (!confirm('Outlook bağlantısını kesmek istediğinize emin misiniz?')) return;
        this.showToast('Bağlantı kesiliyor... 🔌', 'info');
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            if (!token) {
                this.showToast('Lütfen önce giriş yapın.', 'warning');
                return;
            }
            
            try {
                await fetch(CONFIG.API_URL + '/outlook/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch(e) { 
                console.warn('API fail', e); 
            }

            this.app.state.outlookConnected = false;
            delete this.app.state.outlookEmail;
            this.app.store.save();
            this.app.commit();
            this.showToast('Outlook bağlantısı başarıyla kesildi.', 'success');
        } catch (e) {
            console.error('Outlook disconnect error:', e);
            this.showToast('Bağlantı kesilemedi.', 'danger');
        }
    }

    async handleFileSelect(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        if (!this.app.state.pendingAttachments) {
            this.app.state.pendingAttachments = [];
        }
        
        for (let i = 0; i < files.length; i++) {
            this.app.state.pendingAttachments.push(files[i]);
        }
        
        event.target.value = ''; // Reset input
        this.app.commit();
    }

    removePendingAttachment(index) {
        if (!this.app.state.pendingAttachments) return;
        this.app.state.pendingAttachments.splice(index, 1);
        this.app.commit();
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const firebaseUser = window.fbAuth?.currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';
        
        const response = await fetch(CONFIG.API_URL + '/ai/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Dosya yükleme başarısız');
        }
        
        return await response.json();
    }

    async sendInput() {
        if (!this.app.state.outlookConnected) {
            this.showToast('⚠️ Yapay zekayı kullanmak için tanımlı bir e-posta (Outlook) ile bağlanmalısınız.', 'warning');
            return;
        }

        const input = document.getElementById('chat-command-input');
        if (!input) return;
        const text = input.value.trim();
        const pendingFiles = this.app.state.pendingAttachments || [];
        
        if (!text && pendingFiles.length === 0) return;

        input.value = '';
        this.app.state.chatCommandInputValue = '';

        let conversations = this.app.state.pricingConversations;
        if (!conversations || conversations.length === 0) {
            conversations = [];
            this.app.state.pricingConversations = conversations;
        }

        let activeConvId = this.app.state.activeConversationId || 'copilot';
        this.app.state.activeConversationId = activeConvId;
        
        // Eğer aktif konuşma listede yoksa, oluştur (Co-pilot veya diğer durumlar için)
        let convIdx = conversations.findIndex(c => c.id === activeConvId || String(c.id) === String(activeConvId));
        if (convIdx === -1) {
            const isCopilot = activeConvId === 'copilot';
            const newConv = {
                id: activeConvId,
                company: isCopilot ? 'P-AI Komut Merkezi' : 'Canlı Yapay Zeka Asistanı',
                email: isCopilot ? 'copilot@pruva.ai' : '',
                logoLetter: isCopilot ? '🤖' : '⚡',
                logoBg: isCopilot ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                lastMessage: text,
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                status: 'PENDING',
                messages: []
            };
            conversations.push(newConv);
            this.app.state.pricingConversations = conversations;
            convIdx = conversations.length - 1;
        }

        const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        // Kullanıcı komutunu timeline'a anında geçici olarak ekle
        conversations[convIdx].messages.push({
            sender: 'Kullanıcı',
            time: `Bugün ${timeStr}`,
            type: 'outgoing',
            text: text
        });

        conversations[convIdx].lastMessage = text;
        conversations[convIdx].time = 'Şimdi';
        
        // Dosyaları yükle
        let uploadedAttachments = [];
        if (pendingFiles.length > 0) {
            this.app.state.aiLoading = true;
            this.app.commit();
            try {
                for (const file of pendingFiles) {
                    const res = await this.uploadFile(file);
                    if (res.success && res.file) {
                        uploadedAttachments.push(res.file);
                    }
                }
            } catch (err) {
                console.error('Dosya yükleme hatası:', err);
                this.showToast('Dosyalar yüklenemedi: ' + err.message, 'danger');
                this.app.state.aiLoading = false;
                this.app.commit();
                return;
            }
            // Yükleme bitince temizle
            this.app.state.pendingAttachments = [];
        }

        this.app.state.aiLoading = true;
        this.app.commit();
        this.scrollToBottom();

        // PAI Hands-Free Filler Cümleler
        if (this.app.state.isHandsFreeMode && !pendingFiles.length) {
            const fillers = ["Hımm, bakıyorum...", "Bir saniye, hemen kontrol ediyorum...", "Tamam, üzerinde çalışıyorum...", "Anlaşıldı, inceliyorum..."];
            const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
            this.speakText(null, randomFiller, false);
        }

        // Gerçek veya Mock AI Analiz çağrısı
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const payload = {
                message: text || 'Ekli dosyayı incele',
                context: {
                    conversationId: activeConvId,
                    email: conversations[convIdx].email,
                    company: conversations[convIdx].company,
                    status: conversations[convIdx].status
                }
            };
            if (uploadedAttachments.length > 0) {
                payload.attachments = uploadedAttachments;
            }

            const response = await fetch(CONFIG.API_URL + '/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const aiResult = await response.json();
                
                // Copilot conversation is local-only, manually push AI response
                if (activeConvId === 'copilot') {
                    conversations[convIdx].messages.push({
                        sender: 'Pruva AI',
                        time: `Bugün ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
                        type: aiResult.action === 'GENERAL' ? 'incoming' : 'ai_suggestion',
                        text: aiResult.summary,
                        action: aiResult.action
                    });
                    conversations[convIdx].lastMessage = aiResult.summary;
                }

                // Sunucudan güncel mesajları veri tabanından canlı olarak çekelim ve UI'ı tazeleyelim
                await this.loadConversations(1, false);
                
                // Hands-Free Mode Auto-Read
                if (this.app.state.isHandsFreeMode) {
                    let activeConv = this.app.state.pricingConversations.find(c => c.id === activeConvId);
                    if (activeConv && activeConv.messages && activeConv.messages.length > 0) {
                        let lastMsg = activeConv.messages[activeConv.messages.length - 1];
                        if (lastMsg.type === 'incoming') {
                            this.speakText(null, lastMsg.text, true);
                        } else if (lastMsg.type === 'ai_suggestion' || lastMsg.type === 'AI_SUGGESTION') {
                            this.speakText(null, lastMsg.text + " Lütfen ekranda onaylayın veya reddedin.", true);
                        }
                    }
                }
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch(e) {}
                const errorMsg = errorData && errorData.summary ? errorData.summary : 'Bilinmeyen API Hatası';
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.warn('[PRUVA AI] API AI analiz başarısız:', err.message);
            this.showToast('Komut işlenemedi. ' + err.message, 'danger');
            
            // Eğer mesaj hata verirse, son eklenen kullanıcı mesajını UI'da hata olarak işaretle (veya bilgilendir)
            conversations[convIdx].messages.push({
                sender: 'Sistem',
                time: `Bugün ${timeStr}`,
                type: 'incoming',
                text: '❌ Hata: ' + err.message
            });
        } finally {
            this.app.state.aiLoading = false;
            this.app.commit();
            this.scrollToBottom();
        }
    }

    async approveSuggestion(convId, msgIndex, action) {
        let conversations = this.app.state.pricingConversations;
        if (!conversations) return;
        const parsedId = isNaN(convId) ? convId : Number(convId);
        const convIdx = conversations.findIndex(c => c.id === parsedId);
        if (convIdx === -1) return;
        const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        const suggestionMsg = conversations[convIdx].messages[msgIndex];
        if (!suggestionMsg || (suggestionMsg.type !== 'ai_suggestion' && suggestionMsg.type !== 'AI_SUGGESTION')) {
            this.showToast('Bu öneri bulunamadı veya daha önce işlenmiş.', 'warning');
            return;
        }

        const editedBodyEl = document.getElementById(`edit-mail-body-${convId}-${msgIndex}`);
        if (editedBodyEl) {
            if (typeof suggestionMsg.suggestedMail === 'object') {
                suggestionMsg.suggestedMail.body = editedBodyEl.value;
            } else if (typeof suggestionMsg.suggestedMail === 'string') {
                try {
                    let parsed = JSON.parse(suggestionMsg.suggestedMail);
                    parsed.body = editedBodyEl.value;
                    suggestionMsg.suggestedMail = parsed;
                } catch(e) {}
            }
            suggestionMsg.suggestedMessage = editedBodyEl.value;
        }

        const actualIndex = conversations[convIdx].messages.indexOf(suggestionMsg);
        if (actualIndex !== -1) {
            conversations[convIdx].messages.splice(actualIndex, 1);
        }
        let actionMsg = '';
        let newStatus = 'COMPLETED';
        let emailTo = 'pricing@pruvahub.com';
        if (conversations[convIdx].email) {
            emailTo = conversations[convIdx].email;
        }
        if (action === 'SEND_CUSTOM_EMAIL') {
            actionMsg = 'Giden Mail (Pruva AI) - Özel e-posta başarıyla iletildi.';
            newStatus = 'COMPLETED';
        } else if (action === 'SEND_RATE_REQUEST') {
            actionMsg = 'Giden Mail (Pruva AI) - MSC ve Maersk\'e spot navlun talebi iletildi.';
            newStatus = 'RATES_REQUESTED';
            emailTo = 'quotes@maersk.com';
        } else if (action === 'SEND_OFFER') {
            actionMsg = 'Giden Mail (Pruva AI) - Müşteriye özel navlun teklifi iletildi.';
            newStatus = 'OFFER_SENT';
        } else if (action === 'SEND_MISSING_INFO') {
            actionMsg = 'Giden Mail (Pruva AI) - Eksik bilgi talep e-postası müşteriye iletildi.';
            newStatus = 'MISSING_INFO_SENT';
        } else if (action === 'SEND_FOLLOWUP') {
            actionMsg = 'Giden Mail (Pruva AI) - Taşıyıcıya hatırlatma e-postası (takip maili) gönderildi.';
            newStatus = 'RATES_REQUESTED';
        } else {
            actionMsg = 'İşlem onaylandı.';
        }
        conversations[convIdx].messages.push({
            sender: 'Pruva AI (Sistem)',
            time: `Bugün ${timeStr}`,
            type: 'ai_action',
            text: `AI: Aksiyon başarıyla onaylandı ✓`
        });
        conversations[convIdx].messages.push({
            sender: 'Pruva AI (Giden Mail)',
            time: `Bugün ${timeStr}`,
            type: 'outgoing',
            text: suggestionMsg.suggestedMessage || actionMsg
        });
        conversations[convIdx].lastMessage = actionMsg;
        conversations[convIdx].status = newStatus;
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            const suggestedMail = suggestionMsg.suggestedMail || {};
            const finalTo = suggestedMail.to || emailTo;
            const finalSubject = suggestedMail.subject || suggestionMsg.text || 'Pruva AI Navlun Bildirimi';
            const finalBody = suggestedMail.body || suggestionMsg.suggestedMessage || actionMsg;
            const finalAttachments = suggestedMail.attachments || [];
            const response = await fetch(CONFIG.API_URL + '/pricing/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ to: finalTo, subject: finalSubject, body: finalBody, attachments: finalAttachments })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'E-posta gönderimi başarısız oldu.');
            }
            const actionId = suggestionMsg.actionId;
            if (actionId) {
                await fetch(CONFIG.API_URL + `/pricing/actions/${actionId}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ edited_subject: finalSubject, edited_body: finalBody, selected_carriers: [] })
                });
            }
        } catch (e) {
            console.warn('[PRUVA AI] E-posta gönderimi veya DB onayı başarısız:', e.message);
            this.showToast('Hata: ' + e.message, 'danger');
        }
        this.app.commit();
        this.showToast('AI aksiyonu başarıyla onaylandı ve gönderildi!', 'success');
        try {
            await this.loadState();
        } catch (loadErr) {
            console.warn('[PRUVA AI] Güncel konuşma geçmişi yüklenemedi:', loadErr.message);
        }
        this.scrollToBottom();
    }

    async rejectSuggestion(convId, msgIndex) {
        let conversations = this.app.state.pricingConversations;
        if (!conversations) return;

        const parsedId = isNaN(convId) ? convId : Number(convId);
        const convIdx = conversations.findIndex(c => c.id === parsedId);
        if (convIdx === -1) return;

        const suggestionMsg = conversations[convIdx].messages[msgIndex];
        if (!suggestionMsg || (suggestionMsg.type !== 'ai_suggestion' && suggestionMsg.type !== 'AI_SUGGESTION')) {
            this.showToast('Bu öneri bulunamadı veya daha önce işlenmiş.', 'warning');
            return;
        }

        const actualIndex = conversations[convIdx].messages.indexOf(suggestionMsg);
        if (actualIndex !== -1) {
            conversations[convIdx].messages.splice(actualIndex, 1);
        }

        const actionId = suggestionMsg ? suggestionMsg.actionId : null;
        conversations[convIdx].lastMessage = 'Öneri reddedildi.';
        conversations[convIdx].status = 'COMPLETED';

        this.app.commit();
        this.showToast('AI önerisi reddedildi.', 'danger');

        if (actionId) {
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                
                await fetch(CONFIG.API_URL + `/pricing/actions/${actionId}/reject`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Veri tabanından en güncel halini çek
                await this.loadState();
            } catch (err) {
                console.warn('[PRUVA AI] Backend aksiyon reddi başarısız:', err.message);
            }
        }
    }
    
    async archiveConversation(convId) {
        if (convId === 'copilot') {
            this.showToast('Copilot konuşması arşivlenemez.', 'warning');
            return;
        }
        
        try {
            this.app.state.aiLoading = true;
            this.app.commit();
            
            const token = await this.getAuthToken();
            
            const response = await fetch(CONFIG.API_URL + `/ai/conversations/${convId}/archive`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Arşivleme işlemi başarısız oldu.');
            }

            // Normal konuşma: Listeden tamamen kaldır, copilot'a geç
            this.app.state.activeConversationId = 'copilot';
            
            this.showToast('Konuşma arşivlendi!', 'success');
            
            // DB'den güncel listeyi çek
            await this.loadState();
        } catch (err) {
            console.error('Konuşma arşivlenemedi:', err);
            this.showToast('Arşivleme hatası: ' + err.message, 'danger');
        } finally {
            this.app.state.aiLoading = false;
            this.app.commit();
        }
    }

    async unarchiveConversation(convId) {
        try {
            this.app.state.aiLoading = true;
            this.app.commit();
            
            const token = await this.getAuthToken();
            
            const response = await fetch(CONFIG.API_URL + `/ai/conversations/${convId}/unarchive`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Arşivden çıkarma işlemi başarısız oldu.');
            }
            
            this.showToast('Konuşma arşivden çıkarıldı!', 'success');
            
            // DB'den güncel listeyi çek
            await this.loadState();
        } catch (err) {
            console.error('Konuşma arşivden çıkarılamadı:', err);
            this.showToast('Arşivden çıkarma hatası: ' + err.message, 'danger');
        } finally {
            this.app.state.aiLoading = false;
            this.app.commit();
        }
    }

    async clearConversationHistory(convId) {
        const isCopilot = convId === 'copilot';
        const confirmMsg = isCopilot 
            ? 'Co-pilot sohbet geçmişini kalıcı olarak silmek istediğinize emin misiniz?' 
            : 'Bu konuşmayı ve tüm ilişkili verileri (mesajlar, fiyatlar, performans kayıtları) kalıcı olarak silmek istediğinize emin misiniz?';
        
        if (!confirm(confirmMsg)) return;
        
        try {
            this.app.state.aiLoading = true;
            this.app.commit();
            
            const token = await this.getAuthToken();
            
            const response = await fetch(CONFIG.API_URL + `/ai/conversations/${convId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Silme işlemi başarısız oldu.');
            }

            if (isCopilot) {
                // Copilot: Kanal kalır, mesajlar temizlenir
                const conversations = this.app.state.pricingConversations || [];
                const convIdx = conversations.findIndex(c => c.id === 'copilot');
                if (convIdx !== -1) {
                    conversations[convIdx].messages = [];
                    conversations[convIdx].lastMessage = 'Genel Komut & Yapay Zeka Sohbeti';
                }
            } else {
                // Normal konuşma: Listeden tamamen kaldır, copilot'a geç
                this.app.state.pricingConversations = (this.app.state.pricingConversations || []).filter(c => c.id !== convId);
                this.app.state.activeConversationId = 'copilot';
            }
            
            this.showToast('Geçmiş kalıcı olarak silindi!', 'success');
            
            // DB'den güncel listeyi çek
            await this.loadState();
        } catch (err) {
            console.error('Konuşma silinemedi:', err);
            this.showToast('Silme hatası: ' + err.message, 'danger');
        } finally {
            this.app.state.aiLoading = false;
            this.app.commit();
            this.scrollToBottom();
        }
    }

    copyText(btnElement) {
        const text = btnElement.getAttribute('data-text');
        if (text) {
            // HTML entity decode for copy
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            const decodedText = textarea.value;
            
            navigator.clipboard.writeText(decodedText).then(() => {
                this.showToast('Metin kopyalandı!', 'success');
                const originalSvg = btnElement.innerHTML;
                btnElement.innerHTML = '✅';
                setTimeout(() => btnElement.innerHTML = originalSvg, 2000);
            }).catch(err => {
                this.showToast('Kopyalama başarısız oldu.', 'danger');
            });
        }
    }

    toggleHandsFreeMode() {
        this.app.state.isHandsFreeMode = !this.app.state.isHandsFreeMode;
        this.app.commit();
        if (this.app.state.isHandsFreeMode) {
            this.showToast('PAI Eller Serbest Modu Açıldı. Sizi dinliyorum...', 'info');
            this.startVoiceRecognition();
        } else {
            this.showToast('PAI Eller Serbest Modu Kapatıldı.', 'info');
            if (this.isRecognizing && this.recognition) {
                this.recognition.stop();
            }
            this.stopCurrentAudio();
        }
    }

    // Oynayan sesi durdur
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.currentUtteranceText = null;
    }

    // ─── PAI Edge-TTS ile İnsansı Ses Sentezi ───
    async speakText(btnElement, rawText = null, autoListenAfter = false) {
        let text = rawText;
        if (btnElement) {
            text = btnElement.getAttribute('data-text');
        }
        if (!text) return;

        // HTML entity decode
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        const decodedText = textarea.value;

        // Aynı metin oynuyorsa durdur (toggle davranışı)
        if (this.currentAudio && !this.currentAudio.paused && this.currentUtteranceText === decodedText) {
            this.stopCurrentAudio();
            if (btnElement) {
                btnElement.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
                btnElement.style.color = '';
            }
            return;
        }

        // Önceki sesi durdur
        this.stopCurrentAudio();
        this.currentUtteranceText = decodedText;

        // Buton görselini güncelle (oynatılıyor)
        let originalSvg = '';
        if (btnElement) {
            originalSvg = btnElement.innerHTML;
            btnElement.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
            btnElement.style.color = 'var(--secondary)';
        }

        try {
            // Auth token al
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';

            // Backend Edge-TTS endpoint'ine istek gönder
            const response = await fetch(CONFIG.API_URL + '/tts/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: decodedText })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Ses sentezleme başarısız.');
            }

            // MP3 verisini blob olarak al ve çal
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                this.currentUtteranceText = null;

                if (btnElement) {
                    btnElement.innerHTML = originalSvg;
                    btnElement.style.color = '';
                }

                // PAI Jarvis döngüsü: Ses bitti → mikrofonu aç
                if (autoListenAfter && this.app.state.isHandsFreeMode) {
                    setTimeout(() => {
                        this.startVoiceRecognition();
                    }, 500);
                }
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                this.currentUtteranceText = null;
                if (btnElement) {
                    btnElement.innerHTML = originalSvg;
                    btnElement.style.color = '';
                }
                console.error('[PAI TTS] Ses çalma hatası.');
            };

            await audio.play();
        } catch (err) {
            console.error('[PAI TTS] Hata:', err.message);
            this.currentUtteranceText = null;
            if (btnElement) {
                btnElement.innerHTML = originalSvg;
                btnElement.style.color = '';
            }
            // Sessizce hata logla, kullanıcıyı rahatsız etme (özellikle filler cümlelerde)
            if (btnElement) {
                this.showToast('Ses oluşturulamadı: ' + err.message, 'warning');
            }
        }
    }

    startVoiceRecognition() {
        if (!this.app.state.outlookConnected) {
            this.showToast('⚠️ Sesli komutları kullanmak için tanımlı bir e-posta (Outlook) ile bağlanmalısınız.', 'warning');
            if (this.app.state.isHandsFreeMode) {
                this.app.state.isHandsFreeMode = false;
                this.app.commit();
            }
            return;
        }

        if (!('webkitSpeechRecognition' in window)) {
            this.showToast('Tarayıcınız sesli komutu desteklemiyor.', 'warning');
            return;
        }

        if (this.isRecognizing) {
            if (this.recognition) {
                this.recognition.stop();
            }
            return;
        }

        const recognition = new webkitSpeechRecognition();
        this.recognition = recognition;
        recognition.lang = 'tr-TR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        const micBtn = document.querySelector('.chat-mic-btn');
        if (micBtn) {
            micBtn.style.color = 'var(--danger, #ef4444)';
            micBtn.style.animation = 'pulse 1.5s infinite';
        }

        let finalTranscript = '';
        let initialWaitTimeout;
        let silenceTimeout;

        const resetSilenceTimer = () => {
            clearTimeout(silenceTimeout);
            silenceTimeout = setTimeout(() => {
                if (this.isRecognizing) recognition.stop();
            }, 2000); // 2 saniye sessizlik = cümle bitti
        };

        const resetInitialWaitTimer = () => {
            clearTimeout(initialWaitTimeout);
            initialWaitTimeout = setTimeout(() => {
                if (this.isRecognizing) recognition.stop();
            }, 6000); // İlk 6 saniye hiç ses gelmezse kapat
        };

        recognition.onstart = () => {
            this.isRecognizing = true;
            resetInitialWaitTimer(); // Dinleme başladı, 6 saniyelik saati kur
            
            // Eğer daha önceden inputta text varsa, voice ile üstüne eklemek için onu alalım
            const input = document.getElementById('chat-command-input');
            if (input && input.value) {
                finalTranscript = input.value + ' ';
            }
        };

        recognition.onresult = (event) => {
            clearTimeout(initialWaitTimeout); // Ses geldi, başlangıç timer'ını iptal et
            resetSilenceTimer(); // Sessizlik timer'ını sıfırla

            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const input = document.getElementById('chat-command-input');
            if (input) {
                input.value = finalTranscript + interimTranscript;
                this.updateCommandInput(input.value);
            }
        };

        recognition.onspeechend = () => {
            // continuous = true olduğunda onspeechend sadece sessizlikte tetiklenebilir
            // Ama biz zaten silenceTimeout ile stop edeceğiz
        };

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                this.showToast('Mikrofon izni verilmedi veya kapalı.', 'warning');
                this.app.state.isHandsFreeMode = false;
                this.app.commit();
            } else if (event.error === 'aborted') {
                console.log('Ses tanıma durduruldu (aborted).');
            } else if (event.error === 'no-speech') {
                // no-speech geldiğinde bir şey yapmamıza gerek yok, timer'ımız stop edecek
            } else {
                console.warn('Ses tanıma hatası:', event.error);
            }
        };

        recognition.onend = () => {
            clearTimeout(silenceTimeout);
            clearTimeout(initialWaitTimeout);
            this.isRecognizing = false;
            
            if (micBtn) {
                micBtn.style.color = 'var(--text-secondary)';
                micBtn.style.animation = '';
            }

            const input = document.getElementById('chat-command-input');
            const hasText = input && input.value.trim().length > 0;

            if (this.app.state.isHandsFreeMode) {
                if (hasText) {
                    // Cümle bitti, otomatik yolla!
                    this.sendInput();
                } else {
                    // Eller serbest açık ama hiç konuşmadı. (6 sn bitti)
                    this.app.state.isHandsFreeMode = false;
                    this.app.commit();
                    this.showToast('Ses algılanmadı, eller serbest modu kapatıldı.', 'info');
                    // Header'daki butonu tekrar render etmek için router çağrılabilir:
                    if (window.app && window.app.router) window.app.router.render();
                }
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Mikrofon başlatılamadı:', e);
            this.isRecognizing = false;
        }
    }
}

// ─────────────────────────────────────────────────────────────
// DATA CONFIGURATIONS (Helper CONSTs)
// ─────────────────────────────────────────────────────────────
const VARIABLES_CONFIG = {
    common: {
        title: 'Ortak Değişkenler',
        items: [
            { key: 'CARRIER_NAME', label: 'Taşıyıcı Firma Adı' },
            { key: 'CUSTOMER_NAME', label: 'Müşteri Firma Adı' },
            { key: 'CUSTOMER_EMAIL', label: 'Müşteri E-Posta' },
            { key: 'COMPANY_NAME', label: 'Kendi Şirket Adı' },
            { key: 'SIGNATURE', label: 'İmza Satırı' },
            { key: 'DATE', label: 'Bugünün Tarihi' },
            { key: 'REGION', label: 'Güzergah Özeti' },
            { key: 'POL', label: 'Yükleme Limanı (POL)' },
            { key: 'POD', label: 'Varış Limanı (POD)' },
            { key: 'INCOTERM', label: 'Incoterm (FOB, EXW vb.)' },
            { key: 'CARGO_TYPE', label: 'Yükün Cinsi' },
            { key: 'LOAD_DATE', label: 'Yükleme Tarihi' },
            { key: 'VALIDITY', label: 'Teklif Geçerlilik Süresi' },
            { key: 'FREIGHT_PRICE', label: 'Navlun Fiyatı' },
            { key: 'TARGET_PRICE', label: 'Müşteri Hedef Fiyatı' },
            { key: 'DIFF', label: 'Fiyat Farkı' },
            { key: 'MISSING_INFO', label: 'AI Dinamik Eksik Bilgiler' },
            { key: 'AVAILABLE_INFO', label: 'Mevcut Bilgiler Özeti' }
        ]
    },
    fcl: {
        title: 'FCL Özel Değişkenleri',
        items: [
            { key: 'CONTAINER_TYPE', label: 'Konteyner Tipi (40HC, 20GP...)' },
            { key: 'QTY', label: 'Konteyner Adedi' },
            { key: 'SHIPOWNER', label: 'Tercih Edilen Armatör' }
        ]
    },
    lcl: {
        title: 'LCL Özel Değişkenleri',
        items: [
            { key: 'CBM', label: 'Hacim (Metreküp)' },
            { key: 'KG', label: 'Ağırlık (Kilogram)' },
            { key: 'PKG_QTY', label: 'Koli / Palet Adedi' },
            { key: 'W_M', label: 'W/M Katsayısı' },
            { key: 'CFS_POL', label: 'Çıkış CFS Deposu' },
            { key: 'CFS_POD', label: 'Varış CFS Deposu' }
        ]
    },
    air: {
        title: 'Hava Yolu Özel Değişkenleri',
        items: [
            { key: 'KG', label: 'Ağırlık (Brüt)' },
            { key: 'VOL_WEIGHT', label: 'Hacimsel Ağırlık' },
            { key: 'CHARGEABLE_WEIGHT', label: 'Faturalandırılabilir Ağırlık' },
            { key: 'DIMENSIONS', label: 'Koli Boyutları (EnxBoyxYük)' },
            { key: 'PKG_QTY', label: 'Koli Adedi' },
            { key: 'FLIGHT_ROUTE', label: 'Uçuş Parkuru (örn: IST-JFK)' }
        ]
    },
    road: {
        title: 'Kara Yolu Özel Değişkenleri',
        items: [
            { key: 'TRUCK_TYPE', label: 'Araç Tipi (Tır, Mega...)' },
            { key: 'LDM', label: 'Yükleme Metresi (LDM)' },
            { key: 'KG', label: 'Ağırlık (KG)' },
            { key: 'CUSTOMS', label: 'Gümrük Geçiş Kapısı' },
            { key: 'ROUTE', label: 'Kalkış/Varış Şehirleri' },
            { key: 'TRUCK_QTY', label: 'Gerekli Araç Sayısı' }
        ]
    }
};

const MANDATORY_CONFIG = {
    fcl: ['POL', 'POD', 'CONTAINER_TYPE', 'QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
    lcl: ['POL', 'POD', 'CBM', 'KG', 'PKG_QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
    air: ['POL', 'POD', 'KG', 'VOL_WEIGHT', 'DIMENSIONS', 'PKG_QTY', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE'],
    road: ['POL', 'POD', 'TRUCK_TYPE', 'KG', 'LOAD_DATE', 'INCOTERM', 'CARGO_TYPE']
};

const MOCK_PREVIEW_VALUES = {
    'POL': 'Şangay',
    'POD': 'Ambarlı',
    'CARRIER_NAME': 'MSC',
    'CUSTOMER_NAME': 'Arçelik',
    'CUSTOMER_EMAIL': 'info@arcelik.com',
    'CONTAINER_TYPE': '40HC',
    'QTY': '2',
    'LOAD_DATE': '15 Temmuz 2026',
    'INCOTERM': 'FOB',
    'CARGO_TYPE': 'Genel Kargo',
    'FREIGHT_PRICE': '1850',
    'VALIDITY': '30 Haziran 2026',
    'TARGET_PRICE': '1600',
    'DIFF': '250',
    'COMPANY_NAME': 'Pruva Lojistik',
    'SIGNATURE': 'Ahmet Yılmaz / Pricing',
    'CBM': '12',
    'KG': '4500',
    'PKG_QTY': '8',
    'W_M': '12',
    'CFS_POL': 'Şangay CFS Deposu',
    'CFS_POD': 'Ambarlı CFS Deposu',
    'VOL_WEIGHT': '1500',
    'CHARGEABLE_WEIGHT': '4500',
    'DIMENSIONS': '120 x 80 x 160',
    'FLIGHT_ROUTE': 'PVG → IST',
    'TRUCK_TYPE': 'TIR (Tır-Mega)',
    'LDM': '4.2',
    'CUSTOMS': 'Kapıkule Gümrük',
    'ROUTE': 'İstanbul → Münih',
    'TRUCK_QTY': '1',
    'DATE': '27 Mayıs 2026',
    'REGION': 'Uzak Doğu - Türkiye Güzergahı',
    'MISSING_INFO': '• Konteyner Tipi (Örn: 40HC)\n• Yükleme Tarihi (Planlanan)',
    'AVAILABLE_INFO': 'Çıkış: Şangay, Varış: Ambarlı, Incoterm: FOB, Yük Cinsi: Genel Kargo',
    'SHIPOWNER': 'MSC Lojistik'
};
