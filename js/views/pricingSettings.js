/**
 * PRUVA — Pricing AI & Sistem Ayarları View & Controller
 * 
 * Taşıyıcılar, Şablonlar, Margin Kuralları ve Müşteri Profillerinin tek bir
 * premium çatı altında toplandığı gelişmiş yönetim paneli.
 */

window.pricingSettingsView = (state) => {
    const activeTab = state.activeSettingsTab || 'carriers';

    // Sekmelerin aktif sınıflarını belirle
    const isCarriers = activeTab === 'carriers';
    const isTemplates = activeTab === 'templates';
    const isMargins = activeTab === 'margins';
    const isCustomers = activeTab === 'customers';
    const isHistory = activeTab === 'history';

    // Müşteri İstatistikleri (Sekme 4 için)
    const customers = state.pricingCustomers || [];
    const totalCustomers = customers.length;
    const avgVolume = totalCustomers > 0 
        ? Math.round(customers.reduce((acc, c) => acc + (c.monthly_volume || 0), 0) / totalCustomers) 
        : 0;

    return `
    <div class="pricing-settings-page-container">
        
        <!-- ÜST BİLGİ VE GİRİŞ -->
        <div class="pruva-ai-hero-header" style="background: linear-gradient(135deg, var(--primary), #4f46e5); margin-bottom: 25px;">
            <div class="hero-left-meta">
                <div class="hero-badge" style="background: rgba(255,255,255,0.15); color: white;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span data-i18n="pricing_settings.system_control_panel">Sistem Kontrol Paneli</span>
                </div>
                <h2 data-i18n="pricing_settings.title">Pricing AI & Sistem Ayarları</h2>
                <p data-i18n="pricing_settings.subtitle">Navlun fiyatlandırma motoru parametrelerini, e-posta şablon modellerini, kâr marjı matrislerini ve müşteri portföy duyarlılık limitlerini yönetin.</p>
            </div>
            <div class="hero-right-visual">
                <button class="btn" onclick="window.app.router.navigate('pruva-ai')" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: var(--radius-md); padding: 10px 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    <span data-i18n="pricing_settings.return_pruva_ai">Pruva AI Ekranına Dön</span>
                </button>
            </div>
        </div>

        <!-- YÖNETİM SEKMELERİ -->
        <div class="settings-tabs-wrapper" style="display: flex; gap: 8px; margin-bottom: 25px; border-bottom: 2px solid var(--border); padding-bottom: 12px; overflow-x: auto; white-space: nowrap;">
            <button class="tab-trigger ${isCarriers ? 'active' : ''}" onclick="window.pricingSettingsViewInit.switchTab('carriers')" style="background: ${isCarriers ? 'var(--primary)' : 'transparent'}; color: ${isCarriers ? 'white' : 'var(--text-secondary)'}; font-weight: 700; border: 1px solid ${isCarriers ? 'var(--primary)' : 'var(--border)'}; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="pricing_settings.tab_carriers">🚢 Taşıyıcılar & Acenteler</span>
            </button>
            <button class="tab-trigger ${isTemplates ? 'active' : ''}" onclick="window.pricingSettingsViewInit.switchTab('templates')" style="background: ${isTemplates ? 'var(--primary)' : 'transparent'}; color: ${isTemplates ? 'white' : 'var(--text-secondary)'}; font-weight: 700; border: 1px solid ${isTemplates ? 'var(--primary)' : 'var(--border)'}; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="pricing_settings.tab_templates">📝 E-Posta Şablonları</span>
            </button>
            <button class="tab-trigger ${isMargins ? 'active' : ''}" onclick="window.pricingSettingsViewInit.switchTab('margins')" style="background: ${isMargins ? 'var(--primary)' : 'transparent'}; color: ${isMargins ? 'white' : 'var(--text-secondary)'}; font-weight: 700; border: 1px solid ${isMargins ? 'var(--primary)' : 'var(--border)'}; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="pricing_settings.tab_margins">📊 Margin Kuralları</span>
            </button>
            <button class="tab-trigger ${isCustomers ? 'active' : ''}" onclick="window.pricingSettingsViewInit.switchTab('customers')" style="background: ${isCustomers ? 'var(--primary)' : 'transparent'}; color: ${isCustomers ? 'white' : 'var(--text-secondary)'}; font-weight: 700; border: 1px solid ${isCustomers ? 'var(--primary)' : 'var(--border)'}; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="pricing_settings.tab_customers">👥 Müşteri Portföyü & CRM</span>
            </button>
            <button class="tab-trigger ${isHistory ? 'active' : ''}" onclick="window.pricingSettingsViewInit.switchTab('history')" style="background: ${isHistory ? 'var(--primary)' : 'transparent'}; color: ${isHistory ? 'white' : 'var(--text-secondary)'}; font-weight: 700; border: 1px solid ${isHistory ? 'var(--primary)' : 'var(--border)'}; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="pricing_settings.tab_history">📈 Rate Geçmişi</span>
            </button>
        </div>

        <!-- SEKME İÇERİKLERİ -->
        
        <!-- SEKME 1: TAŞIYICILAR -->
        <div class="tab-content-block" id="tab-carriers" style="display: ${isCarriers ? 'block' : 'none'};">
            <div class="pricing-ai-workspace" style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
                
                <!-- Sol Panel: Taşıyıcı Ekleme Formu -->
                <aside class="ai-side-panel left-side" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: fit-content;">
                    <div class="template-section-title" style="margin-bottom: 16px; font-weight: 700; color: var(--text-primary);" id="carrier-form-title" data-i18n="pricing_settings.add_carrier">Yeni Taşıyıcı Ekle</div>
                    <form id="carrier-settings-form" onsubmit="event.preventDefault(); window.pricingSettingsViewInit.submitCarrierForm();" style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <input type="hidden" id="sett-carrier-id" value="">

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.company_name">FİRMA ADI</label>
                            <input type="text" class="text-input" id="sett-carrier-name" data-i18n="[placeholder]pricing_settings.company_name_placeholder" placeholder="Örn: MSC, Mars Lojistik..." required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary);">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.email_address">E-POSTA ADRESİ</label>
                            <input type="email" class="text-input" id="sett-carrier-email" placeholder="pricing@msc.com" required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary);">
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.category">KATEGORİ</label>
                            <select class="text-input" id="sett-carrier-category" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary);">
                                <option value="armator" data-i18n="pricing_settings.cat_shipowner">Armatör</option>
                                <option value="nvocc" data-i18n="pricing_settings.cat_nvocc">NVOCC / Konsolidatör</option>
                                <option value="acente" data-i18n="pricing_settings.cat_agency">Yurt Dışı Acente</option>
                                <option value="hava" data-i18n="pricing_settings.cat_air">Hava Taşıyıcı</option>
                                <option value="kara" data-i18n="pricing_settings.cat_road">Kara Taşıyıcı</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.star_rating">TERCİH SKORU</label>
                            <div class="stars-select" id="sett-carrier-stars" style="display: flex; gap: 6px; font-size: 1.3rem; color: var(--text-muted); cursor: pointer; margin-top: 4px;">
                                <span onclick="window.pricingSettingsViewInit.setFormStars(1)" data-star="1" style="color: var(--accent);">&#9733;</span>
                                <span onclick="window.pricingSettingsViewInit.setFormStars(2)" data-star="2" style="color: var(--accent);">&#9733;</span>
                                <span onclick="window.pricingSettingsViewInit.setFormStars(3)" data-star="3" style="color: var(--accent);">&#9733;</span>
                                <span onclick="window.pricingSettingsViewInit.setFormStars(4)" data-star="4" style="color: var(--accent);">&#9733;</span>
                                <span onclick="window.pricingSettingsViewInit.setFormStars(5)" data-star="5" style="color: var(--accent);">&#9733;</span>
                            </div>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.service_regions">ETKİN GÜZERGAH BÖLGELERİ</label>
                            <div class="rule-checkbox-grid" style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-md);">
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Far East" checked> <span data-i18n="pricing_settings.region_far_east">Far East</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Med" checked> <span data-i18n="pricing_settings.region_med">Med</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Karadeniz"> <span data-i18n="pricing_settings.region_black_sea">Karadeniz</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Kuzey Avrupa"> <span data-i18n="pricing_settings.region_north_europe">Kuzey Avrupa</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Amerika"> <span data-i18n="pricing_settings.region_america">Amerika</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Orta Doğu"> <span data-i18n="pricing_settings.region_middle_east">Orta Doğu</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="sett-carrier-regions" value="Afrika"> <span data-i18n="pricing_settings.region_africa">Afrika</span></label>
                            </div>
                        </div>

                        <div class="form-btn-row" style="display: flex; gap: 8px; margin-top: 8px;">
                            <button class="btn btn-secondary" type="button" onclick="window.pricingSettingsViewInit.resetCarrierForm()" style="flex: 1; padding: 10px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; border: 1px solid var(--border);" data-i18n="pricing_settings.clear">Temizle</button>
                            <button class="btn btn-primary" type="submit" style="flex: 2; font-weight: 700; padding: 10px; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;" data-i18n="pricing_settings.save_sync">Kaydet ve Eşitle</button>
                        </div>
                    </form>
                </aside>

                <!-- Sağ Panel: Taşıyıcı Listesi -->
                <main class="ai-editor-panel" style="padding: 0;">
                    <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: 100%;">
                        <div class="editor-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
                            <div class="editor-title-area">
                                <h3 style="font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_settings.registered_carriers">Kayıtlı Taşıyıcı ve Acenteler</h3>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="pricing_settings.registered_carriers_desc">Otomatik rate sorgulamaları gönderilecek acente ve hatların listesi</span>
                            </div>
                        </div>
                        <div class="carriers-list" id="sett-carriers-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                            <!-- Dinamik taşıyıcı kartları -->
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- SEKME 2: ŞABLON EDİTÖRÜ -->
        <div class="tab-content-block" id="tab-templates" style="display: ${isTemplates ? 'block' : 'none'};">
            <div class="pricing-ai-workspace" id="workspace-editor" style="display: grid; grid-template-columns: 280px 1fr 280px; gap: 20px;">
                
                <!-- Sol Panel: Taşıma Modu ve Şablonlar -->
                <aside class="ai-side-panel left-side" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px;">
                    <div class="mode-tabs" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                        <button class="mode-tab active" data-mode="fcl" onclick="window.pruvaAiManager.switchMode('fcl')" style="border: none; padding: 6px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); font-size: 0.72rem;">FCL</button>
                        <button class="mode-tab" data-mode="lcl" onclick="window.pruvaAiManager.switchMode('lcl')" style="border: none; padding: 6px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); font-size: 0.72rem;">LCL</button>
                        <button class="mode-tab" data-mode="air" onclick="window.pruvaAiManager.switchMode('air')" style="border: none; padding: 6px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); font-size: 0.72rem;" data-i18n="pricing_settings.mode_air">HAVA</button>
                        <button class="mode-tab" data-mode="road" onclick="window.pruvaAiManager.switchMode('road')" style="border: none; padding: 6px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm); font-size: 0.72rem;" data-i18n="pricing_settings.mode_road">KARA</button>
                    </div>
                    
                    <div class="templates-scroll-area">
                        <div class="template-section-title" style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase;" data-i18n="pricing_settings.template_models">Şablon Modelleri</div>
                        <div id="templates-list-container" style="display: flex; flex-direction: column; gap: 8px;">
                            <!-- Dinamik yüklenecek -->
                        </div>
                    </div>

                    <div class="common-templates-area" style="margin-top: 16px; border-top: 1px dashed var(--border); padding-top: 12px;">
                        <div class="template-section-title" style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase;" data-i18n="pricing_settings.common_template">Ortak Şablon</div>
                        <div class="template-card missing-info-card" id="card-common-missing" onclick="window.pruvaAiManager.selectTemplate('common-missing')" style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                            <h4 style="margin: 0; font-size: 0.85rem; color: var(--text-primary);" data-i18n="pricing_settings.missing_info_inquiry">Eksik Bilgi Sorgulama</h4>
                            <p id="desc-common-missing" style="margin: 4px 0 0 0; font-size: 0.72rem; color: var(--text-secondary);" data-i18n="pricing_settings.missing_info_desc">Müşteriden eksik detayları talep eden mail şablonu</p>
                        </div>
                    </div>
                </aside>

                <!-- Orta Panel: Monospace Editör & Analiz -->
                <main class="ai-editor-panel" style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Editör Kartı -->
                    <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 16px;">
                        <div class="editor-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                            <div class="editor-title-area">
                                <h3 id="current-template-title" style="margin: 0; font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_settings.loading">Yükleniyor...</h3>
                                <span id="current-template-subtitle" style="font-size: 0.75rem; color: var(--text-muted);" data-i18n="pricing_settings.template_editing_area">Şablon düzenleme alanı</span>
                            </div>
                            <div class="editor-actions" style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary" id="preview-toggle-btn" onclick="window.pruvaAiManager.togglePreviewMode()" style="padding: 8px 12px; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary);">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    <span data-i18n="pricing_settings.preview">Önizleme</span>
                                </button>
                                <button class="btn btn-danger btn-icon-only" onclick="window.pruvaAiManager.resetCurrentTemplate()" data-i18n="[title]pricing_settings.reset_default" title="Varsayılana Sıfırla" style="padding: 8px; cursor: pointer; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--danger); display: flex; align-items: center; justify-content: center;">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                </button>
                                <button class="btn btn-primary" onclick="window.pruvaAiManager.saveCurrentTemplate()" style="padding: 8px 16px; background: var(--primary); color: white; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 700; border: none; border-radius: var(--radius-md);">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                    <span data-i18n="pricing_settings.save_template">Şablonu Kaydet</span>
                                </button>
                            </div>
                        </div>

                        <!-- Düzenleme Alanları -->
                        <div class="editor-body" id="editor-body-panel" style="display: flex; flex-direction: column; gap: 12px;">
                            <div class="input-group">
                                <label class="input-label" for="template-subject" style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;" data-i18n="pricing_settings.email_subject">E-POSTA KONU SATIRI</label>
                                <input type="text" class="text-input" id="template-subject" oninput="window.pruvaAiManager.analyzeVariables()" data-i18n="[placeholder]pricing_settings.email_subject_placeholder" placeholder="E-posta konu satırı..." style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 14px; color: var(--text-primary); font-family: monospace; width: 100%;">
                            </div>

                            <div class="input-group textarea-container" style="display: flex; flex-direction: column; gap: 8px;">
                                <label class="input-label" style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;" data-i18n="pricing_settings.email_body">E-POSTA GÖVDESİ</label>
                                <div class="editor-toolbar" style="display: flex; gap: 8px; align-items: center; background: var(--bg-body); padding: 6px 12px; border-radius: var(--radius-md) var(--radius-md) 0 0; border: 1px solid var(--border); border-bottom: none;">
                                    <div class="dropdown-wrapper" style="position: relative;">
                                        <button class="btn btn-secondary" onclick="window.pruvaAiManager.toggleVariablesDropdown(event)" style="padding: 4px 8px; font-size: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                            <span data-i18n="pricing_settings.add_variable">Değişken Ekle</span>
                                        </button>
                                        <div class="dropdown-menu" id="variables-dropdown" style="display: none; position: absolute; top: 28px; left: 0; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); width: 220px; box-shadow: var(--shadow-md); z-index: 100; max-height: 250px; overflow-y: auto; padding: 6px;">
                                            <div class="dropdown-header" style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); padding: 4px 8px; border-bottom: 1px solid var(--border);" data-i18n="pricing_settings.available_variables">Eklenebilir Değişkenler</div>
                                            <div class="dropdown-sections" id="dropdown-variables-container">
                                                <!-- Dinamik yüklenecek -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <textarea class="editor-textarea" id="template-body" oninput="window.pruvaAiManager.analyzeVariables()" data-i18n="[placeholder]pricing_settings.edit_email_content" placeholder="E-posta içeriğini düzenleyin..." style="background: var(--bg-body); border: 1px solid var(--border); border-radius: 0 0 var(--radius-md) var(--radius-md); padding: 14px; color: var(--text-primary); font-family: monospace; font-size: 0.82rem; min-height: 240px; resize: vertical; line-height: 1.5; width: 100%;"></textarea>
                            </div>
                        </div>

                        <!-- Önizleme Alanı -->
                        <div class="preview-container" id="preview-body-panel" style="display: none; flex-direction: column; gap: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; background: rgba(0,0,0,0.01);">
                            <div class="preview-mail-meta" style="display: flex; flex-direction: column; gap: 4px; border-bottom: 1px dashed var(--border); padding-bottom: 12px; font-size: 0.8rem;">
                                <div class="meta-line">
                                    <span class="meta-label" style="font-weight: 700; color: var(--text-secondary);" data-i18n="pricing_settings.to">Kime:</span>
                                    <span class="meta-value" id="preview-to" style="color: var(--text-primary);">pricing@partner-lines.com</span>
                                </div>
                                <div class="meta-line">
                                    <span class="meta-label" style="font-weight: 700; color: var(--text-secondary);" data-i18n="pricing_settings.subject">Konu:</span>
                                    <span class="meta-value" id="preview-subject" style="font-weight: 700; color: var(--text-primary);" data-i18n="pricing_settings.subject_preview">Konu Önizlemesi</span>
                                </div>
                            </div>
                            <div class="preview-mail-body" id="preview-content" style="font-family: monospace; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; color: var(--text-primary); min-height: 200px;" data-i18n="pricing_settings.mail_preview_content">
                                Mail önizleme içeriği...
                            </div>
                        </div>
                    </div>

                    <!-- Şablon Analiz Bölümü -->
                    <div class="analysis-card" style="padding: 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);">
                        <div class="analysis-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 12px;">
                            <h3 style="margin: 0; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                                <span data-i18n="pricing_settings.template_var_analysis">Şablon Değişken Analizi</span>
                            </h3>
                            <span id="analysis-summary" style="font-size: 0.72rem; font-weight: 800;"></span>
                        </div>
                        <div class="chips-container" id="variables-analysis-chips" style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <!-- Değişken analiz çipleri -->
                        </div>
                    </div>
                </main>

                <!-- Sağ Panel: Kurallar -->
                <aside class="ai-side-panel right-side" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; height: fit-content;">
                    <div class="panel-widget">
                        <div class="widget-title" style="font-size: 0.8rem; font-weight: 800; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span data-i18n="pricing_settings.missing_info_rules">Eksik Bilgi Kuralları</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <div class="rules-container" style="display: flex; flex-direction: column; gap: 10px;">
                            <div class="rule-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                                <span style="font-size: 0.75rem; color: var(--text-secondary);" data-i18n="pricing_settings.auto_inquiry">Otomatik Sorgulama</span>
                                <label class="form-switch" style="position: relative; display: inline-block; width: 34px; height: 20px;">
                                    <input type="checkbox" id="rule-auto-inquiry" onchange="window.pruvaAiManager.saveRuleSettings()" style="opacity: 0; width: 0; height: 0;">
                                    <span class="switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); border-radius: 20px; transition: .3s;"></span>
                                </label>
                            </div>
                            <div class="rule-numeric-input" style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.75rem; color: var(--text-secondary);" data-i18n="pricing_settings.max_rounds">Maks. Tur:</span>
                                <input type="number" id="rule-max-rounds" min="1" max="10" value="3" onchange="window.pruvaAiManager.saveRuleSettings()" style="width: 50px; background: var(--bg-body); border: 1px solid var(--border); padding: 4px; border-radius: var(--radius-sm); text-align: center; color: var(--text-primary);">
                            </div>
                            <div class="rule-group-title" style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-top: 10px;" data-i18n="pricing_settings.mandatory_fields">Zorunlu Alanlar</div>
                            <div class="rule-checkbox-grid" id="mandatory-rules-checkboxes" style="display: flex; flex-direction: column; gap: 6px; max-height: 150px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(0,0,0,0.01);">
                                <!-- SEKME 3: MARGİN KURALLARI -->
        <div class="tab-content-block" id="tab-margins" style="display: \${isMargins ? 'block' : 'none'};">
            <div class="pricing-ai-workspace" style="display: grid; grid-template-columns: 280px 1fr; gap: 20px;">
                <!-- Sol Panel: Form -->
                <aside class="ai-side-panel left-side" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: fit-content;">
                    <div class="template-section-title" style="margin-bottom: 16px; font-weight: 700; color: var(--text-primary);" data-i18n="pricing_settings.add_new_margin_rule">Yeni Margin Kuralı Ekle</div>
                    <form id="margin-rule-form" onsubmit="event.preventDefault(); window.pruvaAiManager.saveMarginRule();" style="display: flex; flex-direction: column; gap: 12px;">
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.region_line">Bölge / Hat</label>
                            <select class="text-input" id="margin-form-region" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); width: 100%;">
                                <option value="Far East" data-i18n="pricing_settings.region_far_east">Far East</option>
                                <option value="Med" data-i18n="pricing_settings.region_med">Med</option>
                                <option value="Karadeniz" data-i18n="pricing_settings.region_black_sea">Karadeniz</option>
                                <option value="Kuzey Avrupa" data-i18n="pricing_settings.region_north_europe">Kuzey Avrupa</option>
                                <option value="Amerika" data-i18n="pricing_settings.region_america">Amerika</option>
                                <option value="Orta Doğu" data-i18n="pricing_settings.region_middle_east">Orta Doğu</option>
                                <option value="Tüm Bölgeler" data-i18n="pricing_settings.all_regions">Tüm Bölgeler</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.transport_mode">Taşıma Modu</label>
                            <select class="text-input" id="margin-form-mode" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); width: 100%;">
                                <option value="DENIZ_FCL" data-i18n="pricing_settings.mode_sea_fcl">Deniz FCL (FCL)</option>
                                <option value="DENIZ_LCL" data-i18n="pricing_settings.mode_sea_lcl">Deniz LCL (LCL)</option>
                                <option value="HAVA" data-i18n="pricing_settings.mode_air_full">Hava Yolu (Air)</option>
                                <option value="KARA" data-i18n="pricing_settings.mode_road_full">Kara Yolu (Road)</option>
                                <option value="ORTAK" data-i18n="pricing_settings.mode_common">Ortak / Hepsi</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.customer_type">Müşteri Tipi</label>
                            <select class="text-input" id="margin-form-custtype" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); width: 100%;">
                                <option value="STANDARD" data-i18n="pricing_settings.cust_standard">Standart Müşteri</option>
                                <option value="VIP" data-i18n="pricing_settings.cust_vip">VIP Müşteri</option>
                                <option value="SENSITIVE" data-i18n="pricing_settings.cust_sensitive">Fiyat Duyarlı Müşteri</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.margin_rate">Margin Oranı (%)</label>
                            <input type="number" step="0.5" class="text-input" id="margin-form-percent" data-i18n="[placeholder]pricing_settings.margin_rate_placeholder" placeholder="Örn: 12 veya -5" required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); padding: 8px 12px; width: 100%;">
                        </div>
                        <button class="btn btn-primary" type="submit" style="margin-top: 10px; width: 100%; font-weight: 700; padding: 10px; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;" data-i18n="pricing_settings.save_rule">Kuralı Kaydet</button>
                    </form>
                </aside>

                <!-- Orta Panel: Liste -->
                <main class="ai-editor-panel" style="padding: 0;">
                    <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: 100%;">
                        <div class="editor-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
                            <div class="editor-title-area">
                                <h3 style="font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_settings.active_margin_rules">Aktif Fiyatlandırma Margin Kuralları</h3>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="pricing_settings.active_margin_rules_desc">Lojistik teklifleri hazırlanırken otomatik uygulanacak kar marjı kuralları</span>
                            </div>
                        </div>
                        <div id="margins-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
                            <!-- Margin kuralları kartları dinamik yüklenecek -->
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- SEKME 4: MÜŞTERİLER -->
        <div class="tab-content-block" id="tab-customers" style="display: ${isCustomers ? 'block' : 'none'};">
            
            <!-- METRİK KARTLARI -->
            <div class="actions-summary-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
                <div class="summary-card blue" style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;">
                    <div class="summary-card-icon" style="font-size: 1.8rem;">👥</div>
                    <div>
                        <span class="summary-card-value" style="font-size: 1.4rem; font-weight: 800; display: block; color: var(--text-primary);">\${totalCustomers}</span>
                        <span class="summary-card-label" style="font-size: 0.72rem; color: var(--text-secondary);" data-i18n="pricing_settings.registered_customer">Kayıtlı Müşteri</span>
                    </div>
                </div>
                <div class="summary-card green" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;">
                    <div class="summary-card-icon" style="font-size: 1.8rem;">📊</div>
                    <div>
                        <span class="summary-card-value" style="font-size: 1.4rem; font-weight: 800; display: block; color: var(--text-primary);">\${avgVolume} FCL</span>
                        <span class="summary-card-label" style="font-size: 0.72rem; color: var(--text-secondary);" data-i18n="pricing_settings.avg_monthly_volume">Ort. Aylık Hacim</span>
                    </div>
                </div>
                <div class="summary-card yellow" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;">
                    <div class="summary-card-icon" style="font-size: 1.8rem;">⚠️</div>
                    <div>
                        <span class="summary-card-value" style="font-size: 1.4rem; font-weight: 800; display: block; color: var(--text-primary);">\${customers.filter(c => c.price_sensitivity === 'HIGH').length}</span>
                        <span class="summary-card-label" style="font-size: 0.72rem; color: var(--text-secondary);" data-i18n="pricing_settings.high_price_sensitivity">Yüksek Fiyat Duyarlılığı</span>
                    </div>
                </div>
                <div class="summary-card purple" style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;">
                    <div class="summary-card-icon" style="font-size: 1.8rem;">👑</div>
                    <div>
                        <span class="summary-card-value" style="font-size: 1.4rem; font-weight: 800; display: block; color: var(--text-primary);">\${customers.filter(c => c.customer_type === 'VIP').length}</span>
                        <span class="summary-card-label" style="font-size: 0.72rem; color: var(--text-secondary);" data-i18n="pricing_settings.vip_profile_count">VIP Profil Sayısı</span>
                    </div>
                </div>
            </div>

            <div class="pricing-ai-workspace" style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                
                <!-- Sol Panel: Form -->
                <aside class="ai-side-panel left-side" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: fit-content;">
                    <div class="template-section-title" style="margin-bottom: 16px; font-weight: 700; color: var(--text-primary);" data-i18n="pricing_settings.add_customer_profile">Müşteri Profili Ekle</div>
                    <form id="customer-profile-form" onsubmit="event.preventDefault(); window.pricingCustomersViewInit.saveCustomer();" style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.company_name">FİRMA ADI</label>
                            <input type="text" class="text-input" id="cust-form-name" data-i18n="[placeholder]pricing_settings.customer_name_placeholder" placeholder="Örn: Arçelik A.Ş." required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); width: 100%;">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.email_address">E-POSTA ADRESİ</label>
                            <input type="email" class="text-input" id="cust-form-email" placeholder="import@sirket.com" required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); width: 100%;">
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.monthly_logistics_volume">AYLIK LOJİSTİK HACİM (FCL/CBM)</label>
                            <input type="number" class="text-input" id="cust-form-volume" data-i18n="[placeholder]pricing_settings.volume_placeholder" placeholder="Örn: 85" style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); width: 100%;">
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.price_sensitivity">FİYAT HASSASİYETİ</label>
                            <select class="text-input" id="cust-form-sens" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); width: 100%;">
                                <option value="NORMAL" data-i18n="pricing_settings.sens_normal_badge">Normal Duyarlılık</option>
                                <option value="HIGH" data-i18n="pricing_settings.sens_high">Aşırı (Fiyata Duyarlı)</option>
                                <option value="LOW" data-i18n="pricing_settings.sens_low">Düşük (Hizmet Odaklı)</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.customer_type">MÜŞTERİ TİPİ</label>
                            <select class="text-input" id="cust-form-type" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); width: 100%;">
                                <option value="STANDARD" data-i18n="pricing_settings.type_standard">Standart Profil</option>
                                <option value="VIP" data-i18n="pricing_settings.type_vip">VIP Müşteri (Özel İndirim)</option>
                                <option value="SENSITIVE" data-i18n="pricing_settings.type_opportunity">Fırsatçı Alıcı</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.route_regions">GÜZERGAH BÖLGELERİ</label>
                            <div class="rule-checkbox-grid" style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-md);">
                                <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Far East"> <span data-i18n="pricing_settings.region_far_east">Far East</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Med"> <span data-i18n="pricing_settings.region_med">Med</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Karadeniz"> <span data-i18n="pricing_settings.region_black_sea">Karadeniz</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Kuzey Avrupa"> <span data-i18n="pricing_settings.region_north_europe">Kuzey Avrupa</span></label>
                                <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Amerika"> <span data-i18n="pricing_settings.region_america">Amerika</span></label>
                            </div>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_settings.special_notes">ÖZEL NOTLAR</label>
                            <textarea class="text-input" id="cust-form-notes" data-i18n="[placeholder]pricing_settings.special_notes_placeholder" placeholder="Müşteri özel talepleri veya operasyonel notları..." style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); min-height: 60px; font-family: inherit; font-size: 0.8rem; resize: vertical; width: 100%;"></textarea>
                        </div>

                        <button class="btn btn-primary" type="submit" style="margin-top: 8px; width: 100%; font-weight: 700; padding: 10px; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;" data-i18n="pricing_settings.save_sync">Kaydet ve Eşitle</button>
                    </form>
                </aside>

                <!-- Sağ Panel: Liste -->
                <main class="ai-editor-panel" style="padding: 0;">
                    <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: 100%;">
                        <div class="editor-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
                            <div class="editor-title-area">
                                <h3 style="font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_settings.customer_list_profiles">Müşteri Listesi & Profil Kartları</h3>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="pricing_settings.customer_list_desc">Sistemde aktif tanımlı lojistik alıcıları ve fiyat parametreleri</span>
                            </div>
                        </div>

                        <div id="customers-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                            <!-- Müşteriler dinamik yüklenecek -->
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- SEKME 5: RATE GEÇMİŞİ -->
        <div class="tab-content-block" id="tab-history" style="display: ${activeTab === 'history' ? 'block' : 'none'};">
            <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);">
                <div class="editor-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_settings.history_freight_library">Tarihsel Navlun Fiyatları Kütüphanesi</h3>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="pricing_settings.history_freight_desc">Taşıyıcılardan daha önce toplanan ve yapay zeka tarafından hafızaya kaydedilen geçmiş navlun verileri</span>
                </div>
                <div class="rfqs-table-wrapper">
                    <table class="rfqs-custom-table">
                        <thead>
                            <tr>
                                <th data-i18n="pricing_settings.date">Tarih</th>
                                <th data-i18n="pricing_settings.pol">POL (Yükleme)</th>
                                <th data-i18n="pricing_settings.pod">POD (Alıcı)</th>
                                <th data-i18n="pricing_settings.mode">Mod</th>
                                <th data-i18n="pricing_settings.container_cargo">Konteyner/Yük</th>
                                <th data-i18n="pricing_settings.carrier">Taşıyıcı</th>
                                <th data-i18n="pricing_settings.received_price">Alınan Fiyat</th>
                                <th data-i18n="pricing_settings.validity">Geçerlilik</th>
                            </tr>
                        </thead>
                        <tbody id="sett-history-tbody">
                            <!-- Dinamik rate geçmişi satırları -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
    `;
};

// ─────────────────────────────────────────────
// VIEW CONTROLLER VE INTEGRATED AYARLAR KONTROLÜ
// ─────────────────────────────────────────────
window.pricingSettingsViewInit = async (app) => {
    console.log('[VIEW INIT] Integrated Pricing Settings Loaded.');

    const showToast = (message, type = 'success') => {
        if (window.notificationManager && typeof window.notificationManager.showToast === 'function') {
            window.notificationManager.showToast(message, type);
        } else {
            alert(message);
        }
    };

    // 1. Tab Değiştirme
    window.pricingSettingsViewInit.switchTab = (tabName) => {
        app.state.activeSettingsTab = tabName;
        app.commit();
        
        // Dom render sonrası alt inits çağır
        setTimeout(() => {
            window.pricingSettingsViewInit.initializeActiveTab(tabName);
        }, 50);
    };

    // 2. Aktif Tab Başlatıcı
    window.pricingSettingsViewInit.initializeActiveTab = (tabName) => {
        const active = tabName || app.state.activeSettingsTab || 'carriers';
        console.log(`[SETTINGS] Initializing tab: ${active}`);

        if (active === 'carriers') {
            window.pricingSettingsViewInit.renderCarriersList();
        } else if (active === 'templates') {
            if (app.managers.pruvaAi) {
                app.managers.pruvaAi.init();
            }
        } else if (active === 'margins') {
            if (app.managers.pruvaAi) {
                app.managers.pruvaAi.loadState().then(() => {
                    app.managers.pruvaAi.renderMargins();
                });
            }
        } else if (active === 'customers') {
            if (window.pricingCustomersViewInit) {
                window.pricingCustomersViewInit(app).then(() => {
                    window.pricingSettingsViewInit.renderCustomersList();
                });
            }
        } else if (active === 'history') {
            window.pricingSettingsViewInit.renderHistoryList();
        }
    };

    // 3. Taşıyıcı Yıldız Skoru Belirleme
    window.pricingSettingsViewInit.activeStars = 5;
    window.pricingSettingsViewInit.setFormStars = (rating) => {
        window.pricingSettingsViewInit.activeStars = rating;
        for (let i = 1; i <= 5; i++) {
            const el = document.querySelector(`#sett-carrier-stars span[data-star="${i}"]`);
            if (el) {
                el.style.color = i <= rating ? 'var(--accent)' : 'var(--text-muted)';
            }
        }
    };

    // 4. Taşıyıcı Formu Temizleme
    window.pricingSettingsViewInit.resetCarrierForm = () => {
        document.getElementById('carrier-settings-form').reset();
        document.getElementById('sett-carrier-id').value = '';
        document.getElementById('carrier-form-title').textContent = 'Yeni Taşıyıcı Ekle';
        window.pricingSettingsViewInit.setFormStars(5);
    };

    // 5. Taşıyıcı Ekleme / Güncelleme Submit
    window.pricingSettingsViewInit.submitCarrierForm = async () => {
        const idVal = document.getElementById('sett-carrier-id').value;
        const name = document.getElementById('sett-carrier-name').value.trim();
        const email = document.getElementById('sett-carrier-email').value.trim();
        const category = document.getElementById('sett-carrier-category').value;
        const rating = window.pricingSettingsViewInit.activeStars;
        
        const regions = [];
        document.querySelectorAll('input[name="sett-carrier-regions"]:checked').forEach(cb => {
            regions.push(cb.value);
        });

        if (!name || !email) {
            showToast(window.i18n ? window.i18n.t('pricing_settings.fill_name_email') : 'Lütfen isim ve mail alanlarını doldurun.', 'warning');
            return;
        }

        // Taşıyıcılar listesini al
        let carriers = [];
        if (app.managers.pruvaAi) {
            carriers = app.managers.pruvaAi.carriers;
        } else {
            const stored = localStorage.getItem('pruva_ai_carriers');
            carriers = stored ? JSON.parse(stored) : [];
        }

        if (idVal) {
            // DÜZENLEME
            const id = parseInt(idVal);
            const idx = carriers.findIndex(c => c.id === id);
            if (idx !== -1) {
                carriers[idx].name = name;
                carriers[idx].email = email;
                carriers[idx].category = category;
                carriers[idx].rating = rating;
                carriers[idx].regions = regions;
                showToast(window.i18n ? window.i18n.t('pricing_settings.carrier_updated') : 'Taşıyıcı başarıyla güncellendi.', 'success');
            }
        } else {
            // EKLEME
            const newId = carriers.length > 0 ? Math.max(...carriers.map(c => c.id)) + 1 : 1;
            const newCarrier = {
                id: newId,
                name,
                email,
                category,
                regions,
                rating,
                template: `${category === 'hava' ? 'air' : category === 'kara' ? 'road' : 'fcl'}-request`,
                active: true
            };
            carriers.push(newCarrier);
            showToast(window.i18n ? window.i18n.t('pricing_settings.carrier_added') : 'Yeni taşıyıcı başarıyla eklendi.', 'success');
        }

        // Kaydet ve Raporla
        if (app.managers.pruvaAi) {
            app.managers.pruvaAi.carriers = carriers;
            app.managers.pruvaAi.saveCarriers();
        } else {
            localStorage.setItem('pruva_ai_carriers', JSON.stringify(carriers));
        }

        window.pricingSettingsViewInit.resetCarrierForm();
        window.pricingSettingsViewInit.renderCarriersList();

        // API'ye gönder (asenkron arka planda)
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            await fetch('/api/pricing/carriers', {
                method: 'POST',
                headers,
                body: JSON.stringify({ carriers })
            });
        } catch (err) {
            console.warn('[SETTINGS] Taşıyıcı API senkronizasyon hatası:', err.message);
        }
    };

    // 6. Taşıyıcı Düzenle Tetikleyici
    window.pricingSettingsViewInit.editCarrier = (id) => {
        let carriers = [];
        if (app.managers.pruvaAi) {
            carriers = app.managers.pruvaAi.carriers;
        } else {
            const stored = localStorage.getItem('pruva_ai_carriers');
            carriers = stored ? JSON.parse(stored) : [];
        }

        const c = carriers.find(item => item.id === id);
        if (!c) return;

        document.getElementById('sett-carrier-id').value = c.id;
        document.getElementById('sett-carrier-name').value = c.name;
        document.getElementById('sett-carrier-email').value = c.email;
        document.getElementById('sett-carrier-category').value = c.category;
        window.pricingSettingsViewInit.setFormStars(c.rating);

        // Region checkbox'larını doldur
        document.querySelectorAll('input[name="sett-carrier-regions"]').forEach(cb => {
            cb.checked = c.regions.includes(cb.value);
        });

        document.getElementById('carrier-form-title').textContent = window.i18n ? `${window.i18n.t('pricing_settings.edit')}: ${c.name}` : `Düzenle: ${c.name}`;
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    // 7. Taşıyıcı Silme İşlemi (Modal Onaylı)
    window.pricingSettingsViewInit.deleteCarrier = async (id) => {
        let carriers = [];
        if (app.managers.pruvaAi) {
            carriers = app.managers.pruvaAi.carriers;
        } else {
            const stored = localStorage.getItem('pruva_ai_carriers');
            carriers = stored ? JSON.parse(stored) : [];
        }

        const c = carriers.find(item => item.id === id);
        if (!c) return;

        const confirmMsg = window.i18n ? window.i18n.t('pricing_settings.confirm_delete_carrier', {name: c.name}) : `"${c.name}" adlı taşıyıcıyı sistemden tamamen silmek istediğinize emin misiniz?`;
        if (confirm(confirmMsg)) {
            const updated = carriers.filter(item => item.id !== id);
            if (app.managers.pruvaAi) {
                app.managers.pruvaAi.carriers = updated;
                app.managers.pruvaAi.saveCarriers();
            } else {
                localStorage.setItem('pruva_ai_carriers', JSON.stringify(updated));
            }
            showToast('Taşıyıcı sistemden kaldırıldı.', 'danger');
            window.pricingSettingsViewInit.renderCarriersList();

            // API silme isteği at
            try {
                const firebaseUser = window.fbAuth?.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                fetch(`/api/pricing/carriers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': token,
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.warn('[SETTINGS] Taşıyıcı silme API hatası:', err.message);
            }
        }
    };

    // 8. Taşıyıcı Toggle Aktiflik
    window.pricingSettingsViewInit.toggleCarrierActive = (id, checked) => {
        let carriers = [];
        if (app.managers.pruvaAi) {
            carriers = app.managers.pruvaAi.carriers;
        } else {
            const stored = localStorage.getItem('pruva_ai_carriers');
            carriers = stored ? JSON.parse(stored) : [];
        }

        const idx = carriers.findIndex(c => c.id === id);
        if (idx !== -1) {
            carriers[idx].active = checked;
            if (app.managers.pruvaAi) {
                app.managers.pruvaAi.saveCarriers();
            } else {
                localStorage.setItem('pruva_ai_carriers', JSON.stringify(carriers));
            }
            showToast(checked ? 'Taşıyıcı aktif edildi.' : 'Taşıyıcı pasife alındı.', 'info');
            window.pricingSettingsViewInit.renderCarriersList();
        }
    };

    // 9. Taşıyıcı Listesini HTML Çizdir
    window.pricingSettingsViewInit.renderCarriersList = () => {
        const container = document.getElementById('sett-carriers-list-container');
        if (!container) return;
        container.innerHTML = '';
        if (window.i18n) window.i18n.updateDOM();

        let carriers = [];
        if (app.managers.pruvaAi) {
            carriers = app.managers.pruvaAi.carriers || [];
        } else {
            const stored = localStorage.getItem('pruva_ai_carriers');
            carriers = stored ? JSON.parse(stored) : [];
        }

        if (carriers.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🚢</span>
                    <h4 style="color: var(--text-primary);">${window.i18n ? window.i18n.t('pricing_settings.no_registered_carrier') : 'Henüz Kayıtlı Taşıyıcı Yok'}</h4>
                    <p style="font-size: 0.8rem;">${window.i18n ? window.i18n.t('pricing_settings.add_first_carrier_desc') : 'Sol panelden ilk taşıyıcınızı ekleyerek başlayın.'}</p>
                </div>
            `;
            return;
        }

        const categoriesMap = {
            'armator': window.i18n ? `🚢 ${window.i18n.t('pricing_settings.cat_armator')}` : '🚢 Armatör',
            'nvocc': '📦 NVOCC',
            'acente': window.i18n ? `🤝 ${window.i18n.t('pricing_settings.cat_agency')}` : '🤝 Acente',
            'hava': window.i18n ? `✈️ ${window.i18n.t('pricing_settings.cat_air')}` : '✈️ Hava Nakliye',
            'kara': window.i18n ? `🚛 ${window.i18n.t('pricing_settings.cat_road')}` : '🚛 Kara Nakliye'
        };

        carriers.forEach(c => {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<span style="color: ${i <= c.rating ? 'var(--accent)' : 'var(--text-muted)'}; font-size: 0.85rem;">&#9733;</span>`;
            }

            const card = document.createElement('div');
            card.className = `carrier-card ${c.active ? '' : 'passive'}`;
            card.style.cssText = `padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; justify-content: space-between; gap: 10px; opacity: ${c.active ? 1 : 0.6}; transition: all 0.2s;`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${c.name}</h4>
                        <span style="font-size: 0.7rem; color: var(--text-muted); background: var(--bg-body); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">${categoriesMap[c.category] || c.category}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <label class="form-switch" style="position: relative; display: inline-block; width: 30px; height: 16px;">
                            <input type="checkbox" ${c.active ? 'checked' : ''} onchange="window.pricingSettingsViewInit.toggleCarrierActive(${c.id}, this.checked)" style="opacity: 0; width: 0; height: 0;">
                            <span class="switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); border-radius: 16px; transition: .2s;"></span>
                        </label>
                        <button onclick="window.pricingSettingsViewInit.editCarrier(${c.id})" style="border: none; background: transparent; cursor: pointer; color: var(--text-secondary); padding: 2px; border-radius: 4px;" title="${window.i18n ? window.i18n.t('pricing_settings.edit') : 'Düzenle'}">
                            ✏️
                        </button>
                        <button onclick="window.pricingSettingsViewInit.deleteCarrier(${c.id})" style="border: none; background: transparent; cursor: pointer; color: var(--danger); padding: 2px; border-radius: 4px;" title="${window.i18n ? window.i18n.t('pricing_settings.delete') : 'Sil'}">
                            ❌
                        </button>
                    </div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
                    <div>📧 <strong>${window.i18n ? window.i18n.t('pricing_settings.mail_label') : 'Mail:'}</strong> ${c.email}</div>
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">🌍 <strong>${window.i18n ? window.i18n.t('pricing_settings.regions_label') : 'Bölgeler:'}</strong> ${c.regions ? c.regions.join(', ') : (window.i18n ? window.i18n.t('pricing_settings.not_specified') : 'Belirtilmemiş')}</div>
                    <div style="display: flex; align-items: center; gap: 4px;">⭐️ <strong>${window.i18n ? window.i18n.t('pricing_settings.score_label') : 'Skor:'}</strong> ${starsHtml}</div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // 10. Müşteriler Listesini Çizdir (Sekme 4 için)
    window.pricingSettingsViewInit.renderCustomersList = () => {
        const container = document.getElementById('customers-list-container');
        if (!container) return;
        container.innerHTML = '';
        if (window.i18n) window.i18n.updateDOM();

        const customers = app.state.pricingCustomers || [];

        if (customers.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <span style="font-size: 3rem; display: block; margin-bottom: 12px;">👥</span>
                    <h4 style="color: var(--text-primary);">${window.i18n ? window.i18n.t('pricing_settings.no_registered_customer') : 'Henüz Kayıtlı Müşteri Yok'}</h4>
                    <p style="font-size: 0.8rem;">${window.i18n ? window.i18n.t('pricing_settings.add_first_customer_desc') : 'Sol taraftaki paneli kullanarak ilk müşteri profilini oluşturabilirsiniz.'}</p>
                </div>
            `;
            return;
        }

        const getSensitivityBadge = (sens) => {
            switch(sens) {
                case 'HIGH': return `<span class="sens-badge high" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${window.i18n ? window.i18n.t('pricing_settings.sens_high_badge') : 'Aşırı Duyarlı'}</span>`;
                case 'LOW': return `<span class="sens-badge low" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${window.i18n ? window.i18n.t('pricing_settings.sens_low_badge') : 'Düşük Duyarlılık'}</span>`;
                default: return `<span class="sens-badge normal" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${window.i18n ? window.i18n.t('pricing_settings.sens_normal_badge') : 'Normal Duyarlılık'}</span>`;
            }
        };

        const getTypeBadge = (type) => {
            if (type === 'VIP') {
                return `<span class="type-badge vip" style="background: linear-gradient(135deg, #f1c40f, #f39c12); color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 99px; font-weight: 800;">★ VIP</span>`;
            }
            if (type === 'SENSITIVE') {
                return `<span class="type-badge sensitive" style="background: #e67e22; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 99px; font-weight: 800;">${window.i18n ? window.i18n.t('pricing_settings.type_opportunity_badge') : 'FIRSATÇI'}</span>`;
            }
            return `<span class="type-badge standard" style="background: #34495e; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 99px; font-weight: 800;">${window.i18n ? window.i18n.t('pricing_settings.type_standard_badge') : 'STANDART'}</span>`;
        };

        customers.forEach(cust => {
            const card = document.createElement('div');
            card.className = 'carrier-card';
            card.style.cssText = 'padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; justify-content: space-between; gap: 10px; transition: all 0.2s;';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${cust.company_name}</h4>
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${cust.email}</div>
                    </div>
                    <button class="delete-btn" onclick="window.pricingCustomersViewInit.deleteCustomer(${cust.id})" style="border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;" title="${window.i18n ? window.i18n.t('pricing_settings.delete_customer') : 'Müşteriyi Sil'}">
                        ❌
                    </button>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${getTypeBadge(cust.customer_type)}
                    ${getSensitivityBadge(cust.price_sensitivity)}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(0,0,0,0.02); border: 1px solid var(--border); padding: 8px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${window.i18n ? window.i18n.t('pricing_settings.volume_label') : 'Hacim:'}</strong>
                        <span style="color: var(--text-primary); font-weight: 700;">${cust.monthly_volume || 0} FCL / ${window.i18n ? window.i18n.t('pricing_settings.month') : 'Ay'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${window.i18n ? window.i18n.t('pricing_settings.regions_label') : 'Bölgeler:'}</strong>
                        <span style="color: var(--text-primary); font-weight: 600; text-align: right; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cust.active_regions ? cust.active_regions.join(', ') : (window.i18n ? window.i18n.t('pricing_settings.common') : 'Ortak')}</span>
                    </div>
                </div>
                ${cust.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; line-height: 1.4; border-top: 1px dashed var(--border); padding-top: 6px; margin-top: 2px;">${cust.notes}</div>` : ''}
            `;
            container.appendChild(card);
        });
    };

    // 5. Rate Geçmişi Listesini Çizdir
    window.pricingSettingsViewInit.renderHistoryList = async () => {
        const tbody = document.getElementById('sett-history-tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="width: 16px; height: 16px; border: 2px solid var(--border); border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></span>
                        ${window.i18n ? window.i18n.t('pricing_settings.history_loading') : 'Navlun Geçmişi Yükleniyor...'}
                    </div>
                </td>
            </tr>
        `;

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            // Tüm geçmişi çekmek için pol/pod filtresi göndermiyoruz
            const res = await fetch('/api/pricing/rate-history', {
                headers: {
                    'x-auth-token': token,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                window.pricingSettingsViewInit.drawHistoryTable(data, tbody);
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.warn('[SETTINGS HISTORY] API\'den rate geçmişi alınamadı, local mock devrede:', err.message);
            // Fallback Mock Veri Seti
            const mockHistory = [
                { id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'MSC', price: 2100.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-15T10:00:00Z' },
                { id: 2, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Maersk', price: 2250.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-15T11:00:00Z' },
                { id: 3, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Hapag-Lloyd', price: 2200.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-16T09:30:00Z' },
                { id: 4, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'MSC', price: 1950.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-15T10:00:00Z' },
                { id: 5, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Maersk', price: 2050.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-15T11:00:00Z' },
                { id: 6, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Hapag-Lloyd', price: 2000.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-16T09:30:00Z' },
                { id: 7, pol: 'İzmir', pod: 'Hamburg', transport_mode: 'DENIZ_FCL', container_type: '20DC', carrier_name: 'MSC', price: 1450.00, currency: 'USD', valid_until: '2026-06-30', created_at: '2026-05-29T12:05:00Z' },
                { id: 8, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_LCL', container_type: 'Parsiyel', carrier_name: 'Maersk', price: 45.00, currency: 'USD', valid_until: '2026-06-30', created_at: '2026-05-28T17:30:00Z' }
            ];
            window.pricingSettingsViewInit.drawHistoryTable(mockHistory, tbody);
        }
    };

    // Tablo Çizim Yardımcısı
    window.pricingSettingsViewInit.drawHistoryTable = (data, tbody) => {
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 20px; text-align: center; color: var(--text-secondary);">${window.i18n ? window.i18n.t('pricing_settings.no_history_records') : 'Kayıtlı fiyat geçmişi bulunmuyor.'}</td>
                </tr>
            `;
            return;
        }

        // Tarihe göre yeniden eskiye sırala
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const getTransportModeText = (mode) => {
            if (mode === 'DENIZ_FCL') return '🚢 FCL';
            if (mode === 'DENIZ_LCL') return '📦 LCL';
            if (mode === 'HAVA') return window.i18n ? `✈️ ${window.i18n.t('pricing_settings.mode_air')}` : '✈️ Hava';
            if (mode === 'KARA') return window.i18n ? `🚛 ${window.i18n.t('pricing_settings.mode_road')}` : '🚛 Kara';
            return mode;
        };

        data.forEach(row => {
            const formattedDate = new Date(row.created_at).toLocaleDateString(window.i18n ? window.i18n.language : 'tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
            const validDate = row.valid_until ? new Date(row.valid_until).toLocaleDateString(window.i18n ? window.i18n.language : 'tr-TR') : (window.i18n ? window.i18n.t('pricing_settings.indefinite') : 'Süresiz');
            const priceVal = parseFloat(row.price) || 0;

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid var(--border); transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.01)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 12px 8px; color: var(--text-secondary);">${formattedDate}</td>
                    <td style="padding: 12px 8px; font-weight: 700; color: var(--text-primary);">${row.pol}</td>
                    <td style="padding: 12px 8px; font-weight: 700; color: var(--text-primary);">${row.pod}</td>
                    <td style="padding: 12px 8px; color: var(--text-secondary);">${getTransportModeText(row.transport_mode)}</td>
                    <td style="padding: 12px 8px; color: var(--text-secondary);">${row.container_type || (window.i18n ? window.i18n.t('pricing_settings.standard') : 'Standart')}</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: var(--text-primary);">${row.carrier_name}</td>
                    <td style="padding: 12px 8px; font-weight: 800; color: #10b981;">${row.currency || 'USD'} ${priceVal.toFixed(2)}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${validDate}</td>
                </tr>
            `;
        });
    };

    // İlk sayfa yüklenince aktif tab'ı çizdir
    window.pricingSettingsViewInit.initializeActiveTab(app.state.activeSettingsTab || 'carriers');
};
