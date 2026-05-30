import { FirestoreService } from '../services/firestoreService.js';

window.PostAdManager = class PostAdManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.app.uploadedFiles = [];
    }

    addCargoRow() {
        const container = document.getElementById('cargo-rows-container');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'cargo-row-item';
        div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove(); window.postAdManager.updateGlobalDetailsVisibility();" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 1.2rem;">&times;</button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;" class="grid-2col">
                <div class="form-group">
                    <label style="font-size: 0.75rem;">Yük Tipi <span class="required">*</span></label>
                    <select name="cargoType[]" class="form-control" onchange="window.postAdManager.handleRowTypeChange(this)" required>
                        <option value="Parsiyel">Parsiyel (Koli/Palet)</option>
                        <option value="Konteyner">Konteyner</option>
                        <option value="Komple">Komple Tır</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.75rem;">Malın Cinsi <span class="required">*</span></label>
                    <div class="autocomplete-wrapper">
                        <input type="text" name="goodsType[]" class="form-control goods-type-input" placeholder="Seçiniz veya yazınız..." autocomplete="off" required>
                        <div class="autocomplete-results"></div>
                    </div>
                </div>
            </div>
            <div class="row-dynamic-fields">
                <div class="cargo-dims-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; align-items: end;">
                    <div><label style="font-size: 0.65rem;">En (cm) <span class="required">*</span></label><input type="number" name="width[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Boy (cm) <span class="required">*</span></label><input type="number" name="length[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Yük. (cm) <span class="required">*</span></label><input type="number" name="height[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Adet <span class="required">*</span></label><input type="number" name="qty[]" class="form-control" value="1" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">CBM</label><input type="text" name="cbm_box[]" class="form-control cbm-value" value="0.00" readonly style="background: var(--bg-page); font-weight: bold; text-align: center;"></div>
                </div>
            </div>
            <!-- Satır Fotoğraf Alanı -->
            <div class="row-photo-section" style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed var(--border-dim); display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                <div class="photo-preview-container" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
                <div style="display: flex; align-items: center; gap: 8px; position: relative;">
                    <button type="button" class="btn-outline photo-add-btn" onclick="this.nextElementSibling.click()" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; padding: 0; border-radius: 8px;">+</button>
                    <input type="file" class="row-photos-input" multiple accept="image/*" style="display: none;" onchange="window.postAdManager.handleRowPhotoUpload(event, this)">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">Fotoğraflar <span style="font-size: 0.65rem; font-weight: normal; color: #999;">(Max 4 Foto)</span></span>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        const input = div.querySelector('.goods-type-input');
        const results = div.querySelector('.autocomplete-results');
        const categories = window.logisticsKnowledge.goodsCategories;
        
        const randId = 'gt-' + Math.random().toString(36).substr(2, 9);
        const resId = 'gr-' + Math.random().toString(36).substr(2, 9);
        input.id = randId;
        results.id = resId;
        window.utils.initAutocomplete(randId, resId, categories);
        this.updateGlobalDetailsVisibility();
    }

    handleRowTypeChange(select) {
        const dynamicArea = select.closest('.cargo-row-item').querySelector('.row-dynamic-fields');
        const type = select.value;
        const lk = window.logisticsKnowledge;

        if (type === 'Parsiyel') {
            dynamicArea.innerHTML = `
                <div class="cargo-dims-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; align-items: end;">
                    <div><label style="font-size: 0.65rem;">En (cm) <span class="required">*</span></label><input type="number" name="width[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Boy (cm) <span class="required">*</span></label><input type="number" name="length[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Yük. (cm) <span class="required">*</span></label><input type="number" name="height[]" class="form-control" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">Adet <span class="required">*</span></label><input type="number" name="qty[]" class="form-control" value="1" oninput="window.postAdManager.updateCBM(this)" required min="1"></div>
                    <div><label style="font-size: 0.65rem;">CBM</label><input type="text" name="cbm_box[]" class="form-control cbm-value" value="0.00" readonly style="background: var(--bg-page); font-weight: bold; text-align: center;"></div>
                </div>`;
        } else if (type === 'Konteyner') {
            const containerOptions = lk.cargoTypes.Konteyner.map(c => `<option>${c}</option>`).join('');
            dynamicArea.innerHTML = `
                <div class="cargo-summary-grid" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
                    <select name="containerType[]" class="form-control" required>${containerOptions}</select>
                    <input type="number" name="qty[]" placeholder="Adet *" class="form-control" value="1" required min="1">
                    <input type="number" name="weight[]" placeholder="Kg/Birim *" class="form-control" required min="1">
                </div>`;
        } else {
            dynamicArea.innerHTML = `
                <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="number" name="weight[]" placeholder="Toplam Kg *" class="form-control" required min="1">
                    <textarea name="notes[]" class="form-control" placeholder="Özel notlar... (İsteğe Bağlı)" style="height: 40px; grid-column: span 2;"></textarea>
                </div>`;
        }
        this.updateGlobalDetailsVisibility();
    }

    handleGoodsTypeChange(select) {
        const otherInput = select.parentElement.querySelector('[name="goodsType_other[]"]');
        if (otherInput) {
            otherInput.style.display = select.value === 'Diğer' ? 'block' : 'none';
            if (select.value === 'Diğer') otherInput.focus();
        }
    }

    updateGlobalDetailsVisibility() {
        const selects = document.querySelectorAll('[name="cargoType[]"]');
        const stackContainer = document.getElementById('stackable-container');
        if (!stackContainer) return;

        let hasParsiyel = false;
        selects.forEach(s => {
            if (s.value === 'Parsiyel') hasParsiyel = true;
        });

        stackContainer.style.display = hasParsiyel ? 'flex' : 'none';
        if (!hasParsiyel) {
            const checkbox = stackContainer.querySelector('[name="isStackable_global"]');
            if (checkbox) checkbox.checked = false;
        }
    }

    updateCBM(input) {
        const row = input.closest('.cargo-row-item');
        const w = row.querySelector('[name="width[]"]').value || 0;
        const l = row.querySelector('[name="length[]"]').value || 0;
        const h = row.querySelector('[name="height[]"]').value || 0;
        const q = row.querySelector('[name="qty[]"]').value || 1;
        
        const cbm = window.utils.calculateCBM(w, l, h, q);
        const cbmInput = row.querySelector('.cbm-value');
        if (cbmInput) cbmInput.value = cbm;
    }

    handleRowPhotoUpload(event, input) {
        const files = event.target.files;
        const row = input.closest('.cargo-row-item');
        const container = row.querySelector('.photo-preview-container');
        if (!container) return;

        if (!row.uploadedFiles) row.uploadedFiles = [];
        if (!row.uploadedPhotos) row.uploadedPhotos = [];

        if (row.uploadedPhotos.length + files.length > 4) {
            alert('Bu yük için en fazla 4 fotoğraf yükleyebilirsiniz.');
            return;
        }

        Array.from(files).forEach(file => {
            row.uploadedFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgData = e.target.result;
                row.uploadedPhotos.push(imgData);
                
                const div = document.createElement('div');
                div.style = 'position: relative; width: 40px; height: 40px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-dim);';
                div.innerHTML = `
                    <img src="${imgData}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" onclick="window.postAdManager.removeRowPhoto(this, '${imgData}')" style="position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 12px; height: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 8px; padding:0; border: none; line-height: 1;">&times;</button>
                `;
                container.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    removeRowPhoto(btn, data) {
        const row = btn.closest('.cargo-row-item');
        if (!row) return;

        const index = row.uploadedPhotos.indexOf(data);
        if (index > -1) {
            row.uploadedPhotos.splice(index, 1);
            if (row.uploadedFiles && row.uploadedFiles.length > index) {
                row.uploadedFiles.splice(index, 1);
            }
        }
        btn.parentElement.remove();
    }

    async handlePostAd(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        // Geçmiş tarih kontrolü - İş akışının en başında ("fail-fast") doğrulanır, buton kilitlenmesini önler
        const deadline = formData.get('deadline');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        if (deadlineDate < today) {
            alert('⛔ Yükleme tarihi geçmiş bir tarih olamaz! Lütfen bugün veya ilerisini seçin.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button.btn-primary');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'İlan Ver';

        if (submitBtn) {
            submitBtn.innerHTML = 'Yükleniyor... <div style="display:inline-block; width:12px; height:12px; border:2px solid white; border-top:2px solid transparent; border-radius:50%; animation:spin 1s linear infinite; margin-left:5px;"></div>';
            submitBtn.disabled = true;
        }

        const photoUrls = [];
        const cargoItems = [];
        const rows = document.querySelectorAll('.cargo-row-item');
        let rowTotalCBM = 0;

        if (submitBtn) submitBtn.innerHTML = 'Fotoğraflar Yükleniyor... <div style="display:inline-block; width:12px; height:12px; border:2px solid white; border-top:2px solid transparent; border-radius:50%; animation:spin 1s linear infinite; margin-left:5px;"></div>';

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const type = row.querySelector('[name="cargoType[]"]').value;
            let goods = row.querySelector('[name="goodsType[]"]').value;
            if (goods === 'Diğer') {
                const otherInput = row.querySelector('[name="goodsType_other[]"]');
                goods = otherInput ? otherInput.value || 'Diğer' : 'Diğer';
            }
            
            let detail = "";
            if (type === 'Parsiyel') {
                const w = row.querySelector('[name="width[]"]').value;
                const l = row.querySelector('[name="length[]"]').value;
                const h = row.querySelector('[name="height[]"]').value;
                const q = row.querySelector('[name="qty[]"]').value;
                const cbm = window.utils.calculateCBM(w, l, h, q);
                detail = `${q} Adet (${w}x${l}x${h} cm) - ${cbm} CBM`;
                rowTotalCBM += parseFloat(cbm);
            } else if (type === 'Konteyner') {
                const ct = row.querySelector('[name="containerType[]"]').value;
                const q = row.querySelector('[name="qty[]"]').value;
                detail = `${q} x ${ct}`;
            } else {
                detail = "Komple Tır Sevkiyatı";
            }

            const rowPhotoUrls = [];
            if (row.uploadedFiles && row.uploadedFiles.length > 0) {
                for (const file of row.uploadedFiles) {
                    try {
                        const url = await FirestoreService.uploadFile(file, 'ad_photos');
                        rowPhotoUrls.push(url);
                        photoUrls.push(url); // flat array for compatibility
                    } catch (err) {
                        console.error("Fotoğraf yükleme hatası:", err);
                    }
                }
            }

            cargoItems.push({ type, goods, detail, photos: rowPhotoUrls });
        }

        const hasParsiyel = cargoItems.some(item => item.type === 'Parsiyel');
        const isStackable = hasParsiyel ? (document.querySelector('[name="isStackable_global"]')?.checked || false) : false;
        const additionalNotes = formData.get('additionalNotes') || '';

        const newAd = {
            id: Date.now(),
            title: window.security.maskSensitiveInfo(formData.get('title')),
            origin: formData.get('origin'),
            destination: formData.get('destination'),
            cargoItems: cargoItems.map(item => ({
                ...item,
                goods: window.security.maskSensitiveInfo(item.goods),
                detail: window.security.maskSensitiveInfo(item.detail)
            })),
            cargoType: cargoItems.length > 1 ? `${cargoItems.length} Kalem Yük` : cargoItems[0].type,
            goodsType: cargoItems.length > 1 ? [...new Set(cargoItems.map(i => i.goods))].join(', ') : cargoItems[0].goods,
            incoterm: formData.get('incoterm'),
            transport: formData.get('transport'),
            deadline: formData.get('deadline'),
            durationHours: parseInt(formData.get('durationHours')),
            createdAt: Date.now(),
            expiryDate: Date.now() + (parseInt(formData.get('durationHours')) * 60 * 60 * 1000),
            photos: photoUrls,
            totalCBM: rowTotalCBM.toFixed(2),
            isStackable: isStackable,
            additionalNotes: window.security.maskSensitiveInfo(additionalNotes),
            ownerId: this.app.state.currentUserUid,  // Firestore rules için (zorunlu)
            owner: this.app.state.currentUser,
            status: 'pending',
            bids: []
        };



        try {
            await this.app.store.addAd(newAd);
            this.checkAdMatching(newAd); 
            
            this.app.uploadedPhotos = []; // reset
            this.app.uploadedFiles = []; // reset
            
            if (window.notificationManager) {
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'match',
                    text: `İlanınız başarıyla yayınlandı! İlan No: ${window.utils.formatAdNumber(newAd.id)}`,
                    date: Date.now(),
                    read: false,
                    targetUser: this.app.state.currentUser,
                    view: 'loader-dashboard'
                });
            }
            
            this.app.router.navigate('marketplace');
        } catch (error) {
            console.error("Firestore İlan Ekleme Hatası:", error);
            alert("İlan kaydedilirken bir hata oluştu: " + error.message);
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    }

    checkAdMatching(ad) {
        if (this.app.state.userRole === 'carrier' && this.app.state.subscriptionType === 'premium') {
            const interests = this.app.state.userInterests || [];
            const adText = (ad.origin + ' ' + ad.destination + ' ' + ad.goodsType).toLowerCase();
            const isMatch = interests.some(interest => adText.includes(interest.toLowerCase()));
            
            if (isMatch && window.notificationManager) {
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'match',
                    text: `🎯 İlgi alanınıza uygun yeni fırsat: ${ad.origin} → ${ad.destination}`,
                    date: Date.now(),
                    read: false,
                    targetPlan: 'premium' // Ekstra güvenlik
                });
            }
        } else if (this.app.state.userRole === 'loader') {
            if (window.notificationManager) {
                window.notificationManager.add({
                    id: Date.now(),
                    type: 'info',
                    text: `🚀 İlanınız yayında! Rotadaki ${Math.floor(Math.random() * 10) + 3} taşıyıcıya anlık bildirim gönderildi.`,
                    date: Date.now(),
                    read: false,
                    targetUser: this.app.state.currentUser
                });
                
                // Sistemdeki taşıyıcılara gönderilen simüle edilmiş bildirim
                window.notificationManager.add({
                    id: Date.now() + 1,
                    type: 'match',
                    text: `🎯 Yeni ilan: ${ad.origin} → ${ad.destination} (${ad.goodsType})`,
                    date: Date.now(),
                    read: false,
                    targetRole: 'carrier',
                    targetPlan: 'premium', // Sadece Premium planı olanlara
                    action: 'viewAd',
                    adId: ad.id
                });

                // Admin'e bildirim gönder
                window.notificationManager.add({
                    id: Date.now() + 2,
                    type: 'info',
                    text: `📦 Yeni İlan: ${ad.origin} → ${ad.destination}`,
                    subtext: `Yükleyici: ${ad.owner} | Tip: ${ad.cargoType}`,
                    date: Date.now(),
                    read: false,
                    targetRole: 'admin',
                    view: 'admin-dashboard'
                });
            }
        }
    }
};
