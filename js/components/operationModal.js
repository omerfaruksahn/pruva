window.operationModal = {
    show: function(adId, statusText) {
        if (document.getElementById('pruva-operation-modal')) return;

        const ad = window.app.state.ads.find(a => String(a.id) === String(adId));
        if (!ad) {
            if (window.notificationManager) window.notificationManager.showToast('İlan bulunamadı.', 'error');
            return;
        }

        const transport = ad.transport || 'land';
        let fieldsHTML = '';
        let icon = 'package';
        let titleColor = 'var(--secondary)';

        if (statusText === 'Araca Yüklendi') {
            icon = '🚚';
            titleColor = '#3498db';
            if (transport === 'land') {
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.plate">Plaka Numarası *</label>
                        <input type="text" id="op-field-plate" class="form-control" placeholder="Örn: 34ABC123" data-i18n="[placeholder]comp.operation.plate_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.driver_name">Şoför Adı Soyadı *</label>
                        <input type="text" id="op-field-driver-name" class="form-control" placeholder="Örn: Ali Yılmaz" data-i18n="[placeholder]comp.operation.driver_name_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.driver_phone">Şoför Telefonu *</label>
                        <input type="tel" id="op-field-driver-phone" class="form-control" placeholder="Örn: 0555 555 5555" data-i18n="[placeholder]comp.operation.driver_phone_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            } else if (transport === 'sea') {
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.container_no">Konteyner Numarası *</label>
                        <input type="text" id="op-field-container" class="form-control" placeholder="Örn: MSKU1234567" data-i18n="[placeholder]comp.operation.container_no_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.carrier_line">Armatör / Taşıma Hattı *</label>
                        <input type="text" id="op-field-carrier" class="form-control" placeholder="Örn: Maersk / MSC" data-i18n="[placeholder]comp.operation.carrier_line_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            } else { // air
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.flight_no">Uçuş Numarası (Flight No) *</label>
                        <input type="text" id="op-field-flight" class="form-control" placeholder="Örn: TK1903" data-i18n="[placeholder]comp.operation.flight_no_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.airline">Hava Yolu Kargo Firması *</label>
                        <input type="text" id="op-field-airline" class="form-control" placeholder="Örn: Turkish Cargo" data-i18n="[placeholder]comp.operation.airline_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            }
        } else if (statusText === 'Sınır Kapısında' || statusText === 'Gümrükte') {
            icon = '🛂';
            titleColor = '#f39c12';
            if (transport === 'land') {
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.customs_land">Sınır Kapısı / Gümrük Noktası *</label>
                        <input type="text" id="op-field-customs-name" class="form-control" placeholder="Örn: Kapıkule Sınır Kapısı" data-i18n="[placeholder]comp.operation.customs_land_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.declaration_land">Tescil / Beyanname No *</label>
                        <input type="text" id="op-field-declaration" class="form-control" placeholder="Örn: 26052026TX001" data-i18n="[placeholder]comp.operation.declaration_land_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            } else if (transport === 'sea') {
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.customs_sea">Gümrük Limanı / Terminali *</label>
                        <input type="text" id="op-field-customs-name" class="form-control" placeholder="Örn: Ambarlı Limanı" data-i18n="[placeholder]comp.operation.customs_sea_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.declaration_sea">Acente / Beyanname No *</label>
                        <input type="text" id="op-field-declaration" class="form-control" placeholder="Örn: DECL-98765" data-i18n="[placeholder]comp.operation.declaration_sea_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            } else { // air
                fieldsHTML = `
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.customs_air">Gümrük Terminali / Depo No *</label>
                        <input type="text" id="op-field-customs-name" class="form-control" placeholder="Örn: İGA Kargo Terminali" data-i18n="[placeholder]comp.operation.customs_air_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.awb">Hava Konşimentosu (AWB) No *</label>
                        <input type="text" id="op-field-declaration" class="form-control" placeholder="Örn: 235-12345678" data-i18n="[placeholder]comp.operation.awb_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                    </div>
                `;
            }
        } else if (statusText === 'Yolda') {
            icon = '📍';
            titleColor = '#9b59b6';
            fieldsHTML = `
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.location">Bulunduğu Şehir / Lokasyon *</label>
                    <input type="text" id="op-field-location" class="form-control" placeholder="Örn: Belgrad, Sırbistan veya Akdeniz Açıkları" data-i18n="[placeholder]comp.operation.location_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.status_note">Durum Açıklaması *</label>
                    <input type="text" id="op-field-note" class="form-control" placeholder="Örn: Seyir normal, gümrük kapısına ilerleniyor." data-i18n="[placeholder]comp.operation.status_note_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                </div>
            `;
        } else if (statusText === 'Teslim Edildi') {
            icon = '🏁';
            titleColor = '#27ae60';
            fieldsHTML = `
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.receiver">Teslim Alan Kişinin Adı Soyadı *</label>
                    <input type="text" id="op-field-receiver" class="form-control" placeholder="Örn: Ahmet Yılmaz (Depo Sorumlusu)" data-i18n="[placeholder]comp.operation.receiver_ph" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary);">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;" data-i18n="comp.operation.delivery_note">Teslimat Notu (İsteğe Bağlı)</label>
                    <textarea id="op-field-delivery-note" class="form-control" rows="3" placeholder="Örn: Hasarsız ve tam adet olarak depoya alınmıştır." data-i18n="[placeholder]comp.operation.delivery_note_ph" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-page); color:var(--text-primary); resize:none; font-family:inherit;"></textarea>
                </div>
            `;
        }

        const modalHTML = `
            <div id="pruva-operation-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease; font-family: 'Inter', sans-serif;">
                <div style="background: var(--bg-surface); border-radius: 20px; width: 90%; max-width: 480px; padding: 30px; border: 1px solid var(--border); box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${icon}</div>
                        <h3 style="font-size: 1.4rem; color: ${titleColor}; margin: 0 0 8px 0; font-weight: 800;">${statusText} <span data-i18n="comp.operation.status_update">Durum Güncellemesi</span></h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5;" data-i18n="comp.operation.modal_desc">Lütfen bu aşamaya dair operasyonel detayları doldurun. Bu detaylar yük verenin panelinde anlık listelenecektir.</p>
                    </div>

                    <!-- Fields -->
                    <div id="op-modal-fields" style="margin-bottom: 25px;">
                        ${fieldsHTML}
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 12px;">
                        <button class="btn-outline" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: 600; background: transparent; border: 1px solid var(--border); color: var(--text-primary);" onclick="window.operationModal.close()" data-i18n="comp.operation.cancel">Vazgeç</button>
                        <button class="btn-primary" style="flex: 2; padding: 12px; border-radius: 10px; font-weight: 600; background: ${titleColor}; border:none; color: white;" onclick="window.operationModal.submit('${adId}', '${statusText}', '${transport}')" data-i18n="comp.operation.submit">Statüyü Güncelle</button>
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    close: function() {
        const modal = document.getElementById('pruva-operation-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.25s ease';
            setTimeout(() => modal.remove(), 250);
        }
    },

    submit: function(adId, statusText, transport) {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        let formData = {};

        if (statusText === 'Araca Yüklendi') {
            if (transport === 'land') {
                formData.plate = getVal('op-field-plate');
                formData.driverName = getVal('op-field-driver-name');
                formData.driverPhone = getVal('op-field-driver-phone');
                if (!formData.plate || !formData.driverName || !formData.driverPhone) {
                    if (window.notificationManager) window.notificationManager.showToast('Lütfen gerekli alanları doldurun.', 'warning');
                    return;
                }
            } else if (transport === 'sea') {
                formData.containerNo = getVal('op-field-container');
                formData.carrierLine = getVal('op-field-carrier');
                if (!formData.containerNo || !formData.carrierLine) {
                    if (window.notificationManager) window.notificationManager.showToast('Lütfen gerekli alanları doldurun.', 'warning');
                    return;
                }
            } else { // air
                formData.flightNo = getVal('op-field-flight');
                formData.airlineCompany = getVal('op-field-airline');
                if (!formData.flightNo || !formData.airlineCompany) {
                    if (window.notificationManager) window.notificationManager.showToast('Lütfen gerekli alanları doldurun.', 'warning');
                    return;
                }
            }
        } else if (statusText === 'Sınır Kapısında' || statusText === 'Gümrükte') {
            formData.customsName = getVal('op-field-customs-name');
            formData.declarationNo = getVal('op-field-declaration');
            if (!formData.customsName || !formData.declarationNo) {
                if (window.notificationManager) window.notificationManager.showToast('Lütfen gerekli alanları doldurun.', 'warning');
                return;
            }
        } else if (statusText === 'Yolda') {
            formData.location = getVal('op-field-location');
            formData.statusNote = getVal('op-field-note');
            if (!formData.location || !formData.statusNote) {
                if (window.notificationManager) window.notificationManager.showToast('Lütfen gerekli alanları doldurun.', 'warning');
                return;
            }
        } else if (statusText === 'Teslim Edildi') {
            formData.receiverName = getVal('op-field-receiver');
            formData.deliveryNote = getVal('op-field-delivery-note');
            if (!formData.receiverName) {
                if (window.notificationManager) window.notificationManager.showToast('Lütfen teslim alan bilgisini girin.', 'warning');
                return;
            }
        }

        // Call CarrierManager
        if (window.carrierManager) {
            window.carrierManager.updateOperationStatus(adId, statusText, formData);
        }

        this.close();
    }
};
