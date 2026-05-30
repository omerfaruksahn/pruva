window.postAdView = () => `
    <div class="container post-ad-container">
        <div class="card post-ad-card">
            <h1 class="post-ad-title">Create New Shipment</h1>
            
            <form onsubmit="window.postAdManager.handlePostAd(event)" id="post-ad-form">
                <!-- 1. TEMEL BİLGİLER -->
                <div class="form-section">
                    <div class="step-header">
                        <span class="step-number primary">1</span>
                        <h3 class="step-title">GENERAL INFORMATION</h3>
                    </div>
                    <div class="form-group">
                        <label>İlan Başlığı <span class="required">*</span></label>
                        <input type="text" name="title" class="form-control" placeholder="Örn: Tekstil Ürünleri İhracatı" required>
                    </div>
                </div>

                <!-- 2. GÜZERGAH -->
                <div class="form-section highlight">
                    <div class="step-header">
                        <span class="step-number secondary">2</span>
                        <h3 class="step-title">ROUTE & INCOTERMS</h3>
                    </div>
                    <div class="form-group">
                        <label>Incoterm <span class="required">*</span></label>
                        <select name="incoterm" class="form-control" onchange="window.utils.updateFormFields('incoterm', this.value)" required>
                            <option value="" disabled selected>Seçiniz...</option>
                            <option>EXW</option><option>FCA</option><option>FOB</option><option>CIF</option><option>CPT</option><option>CIP</option><option>DAP</option><option>DDP</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;" class="grid-2col">
                        <div class="form-group">
                            <label id="lbl-origin">Çıkış Noktası <span class="required">*</span></label>
                            <div class="autocomplete-wrapper">
                                <input type="text" id="origin-input" name="origin" class="form-control" placeholder="Şehir / Liman" autocomplete="off" required>
                                <div id="origin-results" class="autocomplete-results"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label id="lbl-dest">Varış Noktası <span class="required">*</span></label>
                            <div class="autocomplete-wrapper">
                                <input type="text" id="destination-input" name="destination" class="form-control" placeholder="Şehir / Liman" autocomplete="off" required>
                                <div id="destination-results" class="autocomplete-results"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. YÜK DETAYLARI (DİNAMİK) -->
                <div class="form-section" style="background: var(--bg-surface); border: 1px solid var(--border-dim); padding: 30px; border-radius: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <div class="step-header" style="margin-bottom: 0;">
                            <span class="step-number accent">3</span>
                            <h3 class="step-title">CARGO SPECIFICATIONS</h3>
                        </div>
                        <button type="button" class="btn-outline" onclick="window.postAdManager.addCargoRow()" style="padding: 8px 15px; font-size: 0.85rem; border-radius: 10px;">
                            + Yeni Yük Ekle
                        </button>
                    </div>

                    <div id="cargo-rows-container">
                        <!-- İlk satır varsayılan olarak gelir -->
                        <div class="cargo-row-item">
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
                                        <input type="text" id="gt-initial" name="goodsType[]" class="form-control" placeholder="Seçiniz veya yazınız..." autocomplete="off" required>
                                        <div id="gr-initial" class="autocomplete-results"></div>
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
                            <!-- Satır Fotoğraf Alanı -->
                            <div class="row-photo-section" style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed var(--border-dim); display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                                <div class="photo-preview-container" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
                                <div style="display: flex; align-items: center; gap: 8px; position: relative;">
                                    <button type="button" class="btn-outline photo-add-btn" onclick="this.nextElementSibling.click()" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; padding: 0; border-radius: 8px;">+</button>
                                    <input type="file" class="row-photos-input" multiple accept="image/*" style="display: none;" onchange="window.postAdManager.handleRowPhotoUpload(event, this)">
                                    <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">Fotoğraflar <span style="font-size: 0.65rem; font-weight: normal; color: #999;">(Max 4 Foto)</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ek Detaylar -->
                    <div class="photo-upload-section" style="border-top: none; margin-top: 0; padding-top: 0;">
                        <div id="stackable-container" class="stackable-toggle" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked">
                            <input type="checkbox" name="isStackable_global" onclick="event.stopPropagation()">
                            <label class="stackable-label">Yükler İstiflenebilir</label>
                        </div>
                    </div>
                </div>

                <!-- 4. KATEGORİ VE TARİH -->
                <div class="form-section">
                    <div class="step-header">
                        <span class="step-number success">4</span>
                        <h3 class="step-title">SCHEDULE & MODE</h3>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;" class="grid-3col">
                        <div class="form-group">
                            <label>Taşıma Modu <span class="required">*</span></label>
                            <select name="transport" class="form-control" required>
                                <option value="sea">Deniz</option><option value="land">Kara</option><option value="air">Hava</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>İlan Süresi <span class="required">*</span></label>
                            <select name="durationHours" class="form-control" required>
                                <option value="24">24 Saat (Acil)</option>
                                <option value="48">48 Saat</option>
                                <option value="72" selected>72 Saat (Standart)</option>
                                <option value="168">1 Hafta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Yükleme Tarihi <span class="required">*</span></label>
                            <input type="date" name="deadline" class="form-control" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                </div>

                <!-- 5. EK NOTLAR -->
                <div class="form-section">
                    <div class="step-header">
                        <span class="step-number muted">5</span>
                        <h3 class="step-title">ADDITIONAL DETAILS <span style="color: #95a5a6; font-size: 0.85rem; font-weight: normal;">(Optional)</span></h3>
                    </div>
                    <div class="form-group">
                        <textarea name="additionalNotes" class="form-control" rows="3" placeholder="Taşıma ile ilgili belirtmek istediğiniz diğer detaylar..."></textarea>
                    </div>
                </div>

                <button type="submit" class="btn-primary submit-post-btn">Publish Shipment</button>
            </form>
        </div>
    </div>
`;
