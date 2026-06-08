/**
 * PRUVA — Pricing AI Müşteri Profilleri View
 * 
 * Lojistik teklif fiyatlamalarını doğrudan etkileyen tescilli
 * müşteri portföyünün ve hassasiyet düzeylerinin yönetildiği premium ekran.
 */

window.pricingCustomersView = (state) => {
    const customers = state.pricingCustomers || [];

    // Metrikleri hesapla
    const totalCustomers = customers.length;
    const avgVolume = totalCustomers > 0 
        ? Math.round(customers.reduce((acc, c) => acc + (c.monthly_volume || 0), 0) / totalCustomers) 
        : 0;
    const highSensitivityCount = customers.filter(c => c.price_sensitivity === 'HIGH').length;
    const vipCount = customers.filter(c => c.customer_type === 'VIP').length;

    const getSensitivityBadge = (sens) => {
        switch(sens) {
            case 'HIGH': return '<span class="sens-badge high" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 700;" data-i18n="pricing_customers.sens_high">Aşırı Duyarlı</span>';
            case 'LOW': return '<span class="sens-badge low" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 700;" data-i18n="pricing_customers.sens_low">Düşük Duyarlılık</span>';
            default: return '<span class="sens-badge normal" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 700;" data-i18n="pricing_customers.sens_normal">Normal Duyarlılık</span>';
        }
    };

    const getTypeBadge = (type) => {
        if (type === 'VIP') {
            return '<span class="type-badge vip" style="background: linear-gradient(135deg, #f1c40f, #f39c12); color: white; font-size: 0.7rem; padding: 3px 8px; border-radius: 99px; font-weight: 800; box-shadow: 0 2px 6px rgba(241,196,15,0.3);" data-i18n="pricing_customers.type_vip">★ VIP ALICI</span>';
        }
        if (type === 'SENSITIVE') {
            return '<span class="type-badge sensitive" style="background: #e67e22; color: white; font-size: 0.7rem; padding: 3px 8px; border-radius: 99px; font-weight: 800;" data-i18n="pricing_customers.type_sensitive">FIRSATÇI</span>';
        }
        return '<span class="type-badge standard" style="background: #34495e; color: white; font-size: 0.7rem; padding: 3px 8px; border-radius: 99px; font-weight: 800;" data-i18n="pricing_customers.type_standard">STANDART</span>';
    };

    return `
    <div class="pricing-actions-page-container">
        
        <!-- ÜST AÇIKLAMA / HERO KARTI -->
        <div class="pruva-ai-hero-header">
            <div class="hero-left-meta">
                <div class="hero-badge">
                    <span class="pulse-green-dot"></span>
                    <span data-i18n="pricing_customers.hero_badge">Müşteri Profilleri & CRM</span>
                </div>
                <h2 data-i18n="pricing_customers.hero_title">Müşteri Portföyü ve Navlun Hassasiyet Paneli</h2>
                <p data-i18n="pricing_customers.hero_desc">Teklif fiyatlandırmalarında Pricing AI tarafından otomatik olarak VIP indirim veya fırsatçı marjların uygulanması için müşteri hassasiyet düzeylerini yönetin.</p>
            </div>
            <div class="hero-right-visual">
                <div class="ai-bot-avatar" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
            </div>
        </div>

        <!-- ÜST ÖZET KARTLARI -->
        <div class="actions-summary-grid" style="margin-bottom: 20px;">
            <div class="summary-card blue">
                <div class="summary-card-icon">👥</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${totalCustomers}</span>
                    <span class="summary-card-label" data-i18n="pricing_customers.stat_registered">Kayıtlı Müşteri</span>
                </div>
            </div>
            <div class="summary-card green">
                <div class="summary-card-icon">📊</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${avgVolume} <span data-i18n="pricing_customers.lbl_monthly_vol_unit">FCL / Ay</span></span>
                    <span class="summary-card-label" data-i18n="pricing_customers.stat_avg_volume">Ort. Aylık Hacim</span>
                </div>
            </div>
            <div class="summary-card yellow">
                <div class="summary-card-icon">⚠️</div>
                <div class="summary-card-details">
                    <span class="summary-card-value">${highSensitivityCount}</span>
                    <span class="summary-card-label" data-i18n="pricing_customers.stat_high_sens">Yüksek Fiyat Hassasiyeti</span>
                </div>
            </div>
            <div class="summary-card purple" style="background: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2);">
                <div class="summary-card-icon" style="color: #8b5cf6;">👑</div>
                <div class="summary-card-details">
                    <span class="summary-card-value" style="color: #8b5cf6;">${vipCount}</span>
                    <span class="summary-card-label" data-i18n="pricing_customers.stat_vip_count">VIP Profil Sayısı</span>
                </div>
            </div>
        </div>

        <!-- ANA WORKSPACE GRID -->
        <div class="pricing-ai-workspace" style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
            
            <!-- SOL PANEL: Form -->
            <aside class="ai-side-panel left-side" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: fit-content;">
                <div class="template-section-title" style="margin-bottom: 16px; font-weight: 700; color: var(--text-primary);" data-i18n="pricing_customers.form_title">Müşteri Profili Ekle</div>
                <form id="customer-profile-form" onsubmit="event.preventDefault(); window.pricingCustomersViewInit.saveCustomer();" style="display: flex; flex-direction: column; gap: 12px;">
                    
                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_name_lbl">FİRMA ADI</label>
                        <input type="text" class="text-input" id="cust-form-name" placeholder="${window.i18n?.t ? window.i18n.t('pricing_customers.form_name_ph') : 'Örn: Arçelik A.Ş.'}" required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary);">
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_email_lbl">E-POSTA ADRESİ</label>
                        <input type="email" class="text-input" id="cust-form-email" placeholder="${window.i18n?.t ? window.i18n.t('pricing_customers.form_email_ph') : 'import@sirket.com'}" required style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary);">
                    </div>

                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_vol_lbl">AYLIK LOJİSTİK HACİM (FCL/CBM)</label>
                        <input type="number" class="text-input" id="cust-form-volume" placeholder="${window.i18n?.t ? window.i18n.t('pricing_customers.form_vol_ph') : 'Örn: 85'}" style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary);">
                    </div>

                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_sens_lbl">FİYAT HASSASİYETİ</label>
                        <select class="text-input" id="cust-form-sens" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary);">
                            <option value="NORMAL" data-i18n="pricing_customers.form_sens_opt_normal">Normal Duyarlılık</option>
                            <option value="HIGH" data-i18n="pricing_customers.form_sens_opt_high">Aşırı (Fiyata Duyarlı)</option>
                            <option value="LOW" data-i18n="pricing_customers.form_sens_opt_low">Düşük (Hizmet Odaklı)</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_type_lbl">MÜŞTERİ TİPİ</label>
                        <select class="text-input" id="cust-form-type" style="padding: 8px 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary);">
                            <option value="STANDARD" data-i18n="pricing_customers.form_type_opt_std">Standart Profil</option>
                            <option value="VIP" data-i18n="pricing_customers.form_type_opt_vip">VIP Müşteri (Özel İndirim)</option>
                            <option value="SENSITIVE" data-i18n="pricing_customers.form_type_opt_sens">Fırsatçı Alıcı</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_regions_lbl">GÜZERGAH BÖLGELERİ</label>
                        <div class="rule-checkbox-grid" style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-md);">
                            <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Far East"> Far East</label>
                            <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Med"> Med</label>
                            <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Karadeniz"> Karadeniz</label>
                            <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Kuzey Avrupa"> Kuzey Avrupa</label>
                            <label class="checkbox-label"><input type="checkbox" name="cust-regions" value="Amerika"> Amerika</label>
                        </div>
                    </div>

                    <div class="input-group">
                        <label class="input-label" style="font-size: 0.7rem;" data-i18n="pricing_customers.form_notes_lbl">ÖZEL NOTLAR</label>
                        <textarea class="text-input" id="cust-form-notes" placeholder="${window.i18n?.t ? window.i18n.t('pricing_customers.form_notes_ph') : 'Müşteri özel talepleri veya operasyonel notları...'}" style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); min-height: 60px; font-family: inherit; font-size: 0.8rem; resize: vertical;"></textarea>
                    </div>

                    <button class="btn btn-primary" type="submit" style="margin-top: 8px; width: 100%; font-weight: 700; padding: 10px; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;" data-i18n="pricing_customers.form_submit">Kaydet ve Eşitle</button>
                </form>
            </aside>

            <!-- SAĞ PANEL: Liste -->
            <main class="ai-editor-panel" style="padding: 0;">
                <div class="editor-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); height: 100%;">
                    <div class="editor-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
                        <div class="editor-title-area">
                            <h3 style="font-size: 1.1rem; color: var(--text-primary);" data-i18n="pricing_customers.list_title">Müşteri Listesi & Profil Kartları</h3>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);" data-i18n="pricing_customers.list_desc">Sistemde aktif tanımlı lojistik alıcıları ve fiyat parametreleri</span>
                        </div>
                    </div>

                    <div id="customers-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                        ${totalCustomers === 0 ? `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                                <span style="font-size: 3rem; display: block; margin-bottom: 12px;">👥</span>
                                <h4 style="color: var(--text-primary);" data-i18n="pricing_customers.empty_title">Henüz Kayıtlı Müşteri Yok</h4>
                                <p style="font-size: 0.8rem;" data-i18n="pricing_customers.empty_desc">Sol taraftaki paneli kullanarak ilk müşteri profilini oluşturabilirsiniz.</p>
                            </div>
                        ` : customers.map(cust => `
                            <div class="carrier-card" style="padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: all 0.3s ease;">
                                <div class="carrier-top" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                    <div class="carrier-info">
                                        <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary); font-weight: 700; display: flex; align-items: center; gap: 6px;">
                                            <span>${cust.company_name}</span>
                                        </h4>
                                        <div class="carrier-email" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${cust.email}</div>
                                    </div>
                                    <button class="delete-btn" onclick="window.pricingCustomersViewInit.deleteCustomer(${cust.id})" style="border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'" title="${window.i18n?.t ? window.i18n.t('pricing_customers.delete_btn_title') : 'Müşteriyi Sil'}">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>

                                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
                                    ${getTypeBadge(cust.customer_type)}
                                    ${getSensitivityBadge(cust.price_sensitivity)}
                                </div>

                                <div style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 8px; border-radius: var(--radius-sm);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <strong data-i18n="pricing_customers.lbl_monthly_vol">Aylık Hacim:</strong>
                                        <span style="color: var(--text-primary); font-weight: 700;">${cust.monthly_volume || 0} <span data-i18n="pricing_customers.lbl_monthly_vol_unit">FCL / Ay</span></span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <strong data-i18n="pricing_customers.lbl_regions">Bölgeler:</strong>
                                        <span style="color: var(--text-primary); font-weight: 600; text-align: right; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cust.active_regions ? cust.active_regions.join(', ') : ''}">${cust.active_regions && cust.active_regions.length > 0 ? cust.active_regions.join(', ') : (window.i18n?.t ? window.i18n.t('pricing_customers.lbl_regions_common') : 'Ortak')}</span>
                                    </div>
                                </div>

                                ${cust.notes ? `
                                    <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; line-height: 1.4; border-top: 1px dashed var(--border); padding-top: 8px;">
                                        ${cust.notes}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>
        </div>
    </div>
    `;
};

// ─────────────────────────────────────────────
// VIEW CONTROLLER & CRUD EVENT LISTENERS
// ─────────────────────────────────────────────
window.pricingCustomersViewInit = async (app) => {
    console.log('[VIEW INIT] Pricing Customers Loaded.');

    const showToast = (message, type = 'success') => {
        if (window.notificationManager && typeof window.notificationManager.showToast === 'function') {
            window.notificationManager.showToast(message, type);
        } else {
            alert(message);
        }
    };

    // 1. Sayfa açılınca API'den verileri çek ve güncelle
    const now = Date.now();
    const lastFetch = app.state._pricingCustomersLastFetched || 0;

    if (now - lastFetch >= 3000) {
        app.state._pricingCustomersLastFetched = now;
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            console.log('[PRICING CUSTOMERS] Fetching customers from API...');
            const res = await fetch('/api/pricing/customers', { headers });
            
            if (res.ok) {
                const data = await res.json();
                app.state.pricingCustomers = data;
                app.commit();
                console.log('[PRICING CUSTOMERS] Customers list loaded from API.');
            }
        } catch (err) {
            console.warn('[PRICING CUSTOMERS] API\'den veriler çekilemedi, local mod devrede:', err.message);
        }
    }

    // 2. Müşteri Kaydetme İşlemi
    window.pricingCustomersViewInit.saveCustomer = async () => {
        const name = document.getElementById('cust-form-name').value.trim();
        const email = document.getElementById('cust-form-email').value.trim();
        const volume = parseInt(document.getElementById('cust-form-volume').value) || 0;
        const priceSensitivity = document.getElementById('cust-form-sens').value;
        const customerType = document.getElementById('cust-form-type').value;
        const notes = document.getElementById('cust-form-notes').value.trim();

        const checkedRegions = [];
        document.querySelectorAll('input[name="cust-regions"]:checked').forEach(cb => {
            checkedRegions.push(cb.value);
        });

        if (!name || !email) {
            showToast(window.i18n?.t ? window.i18n.t('pricing_customers.msg_fill_fields') : 'Lütfen firma adı ve e-posta alanlarını doldurun.', 'warning');
            return;
        }

        const newCustomer = {
            company_name: name,
            email: email,
            active_regions: checkedRegions,
            monthly_volume: volume,
            price_sensitivity: priceSensitivity,
            customer_type: customerType,
            notes: notes
        };

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch('/api/pricing/customers', {
                method: 'POST',
                headers,
                body: JSON.stringify(newCustomer)
            });

            if (res.ok) {
                const data = await res.json();
                newCustomer.id = data.id;

                if (!app.state.pricingCustomers) app.state.pricingCustomers = [];
                app.state.pricingCustomers.push(newCustomer);
                
                // re-render loops bypass
                app.state._pricingCustomersLastFetched = Date.now();
                app.commit();

                showToast(window.i18n?.t ? window.i18n.t('pricing_customers.msg_created') : 'Müşteri profili başarıyla oluşturuldu ve eşitlendi!', 'success');
                document.getElementById('customer-profile-form').reset();
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.error('[PRICING CUSTOMERS] Save error, falling back to local:', err);
            
            // Fallback: Local
            newCustomer.id = Date.now() + Math.floor(Math.random() * 1000);
            if (!app.state.pricingCustomers) app.state.pricingCustomers = [];
            app.state.pricingCustomers.push(newCustomer);
            app.commit();

            showToast(window.i18n?.t ? window.i18n.t('pricing_customers.msg_created_local') : 'Müşteri profili oluşturuldu (Yerel mod).', 'success');
            document.getElementById('customer-profile-form').reset();
        }
    };

    // 3. Müşteri Silme İşlemi
    window.pricingCustomersViewInit.deleteCustomer = async (id) => {
        if (!confirm(window.i18n?.t ? window.i18n.t('pricing_customers.msg_confirm_delete') : 'Bu müşteri profilini silmek istediğinize emin misiniz?')) return;

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`/api/pricing/customers/${id}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                app.state.pricingCustomers = app.state.pricingCustomers.filter(c => c.id !== id);
                app.state._pricingCustomersLastFetched = Date.now();
                app.commit();
                showToast(window.i18n?.t ? window.i18n.t('pricing_customers.msg_deleted') : 'Müşteri profili silindi.', 'danger');
            } else {
                throw new Error('API Hatası');
            }
        } catch (err) {
            console.error('[PRICING CUSTOMERS] Delete error, falling back to local:', err);
            
            app.state.pricingCustomers = app.state.pricingCustomers.filter(c => c.id !== id);
            app.commit();
            showToast(window.i18n?.t ? window.i18n.t('pricing_customers.msg_deleted_local') : 'Müşteri profili silindi (Yerel mod).', 'danger');
        }
    };
};
