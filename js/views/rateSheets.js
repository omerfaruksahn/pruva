/**
 * PRUVA — Rate Sheets (Acente Fiyat Görselleri) View
 * 
 * Light premium SaaS theme matching Pruva's overall UI character.
 * Sürükle-bırak görsel yükleme alanı, Gemini Vision AI yüklenme animasyonu,
 * yüklenen fiyat tabloları listesi ve liman bazlı en iyi spot fiyat sorgulama ekranı.
 */

window.queryRateSheets = function() {
    const pol = document.getElementById('query-pol')?.value?.trim();
    const pod = document.getElementById('query-pod')?.value?.trim();
    if (!pol || !pod) {
        alert('Lütfen POL ve POD girin.');
        return;
    }
    window.app.managers.rateSheets.queryRates(pol, pod).then(r => {
        window.app.state.rateSheetsQueryResults = r;
        window.app.commit();
    });
};

window.rateSheetsView = (state) => {
    const sheets = state.rateSheets || [];
    const queryResults = state.rateSheetsQueryResults || null;
    const isLoading = state.rateSheetsLoading || false;

    // Tarih biçimlendirme yardımcısı
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Geçerlilik Belirtilmedi';
        const d = new Date(dateStr);
        return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // En ucuz fiyatı bulmak için yardımcı (cheapest highlight için)
    let cheapestId = null;
    if (queryResults && queryResults.length > 0) {
        let minPrice = Infinity;
        queryResults.forEach(item => {
            if (item.price < minPrice) {
                minPrice = item.price;
                cheapestId = item.id;
            }
        });
    }

    return `
    <div class="rate-sheets-container">
        
        <!-- ÜST BAŞLIK (HERO) -->
        <div class="rate-sheets-hero">
            <div class="hero-meta">
                <div class="hero-meta-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div class="hero-meta-text">
                    <h2>Acente Rate Sheet Yönetimi</h2>
                    <p>Armatör veya acentelerden aldığınız spot fiyat görsellerini (PNG/JPG) sisteme sürükleyin. Pruva AI Vision fiyat satırlarını otomatik çıkarıp dijitalleştirsin.</p>
                </div>
            </div>
            <button class="hero-action-btn" onclick="document.getElementById('rate-sheet-file-input')?.click()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Görsel Yükle
            </button>
        </div>

        <!-- ANA LAYOUT — 2 KOLON GRID -->
        <div class="rate-sheets-grid">
            
            <!-- SOL KOLON: Yükleme Alanı -->
            <div class="rate-card">
                <h3 class="rate-card-title">Fiyat Tablosu Analizi</h3>
                
                ${isLoading ? `
                    <!-- SCANNER / YÜKLENİYOR -->
                    <div class="ai-loading-indicator">
                        <div class="ai-pulse-scanner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div style="text-align: center;">
                            <h4 style="color: #0f172a; font-weight: 800; font-size: 0.95rem; margin: 0 0 6px 0;">Pruva AI Okuyor...</h4>
                            <p style="color: #64748b; font-size: 0.78rem; margin: 0; line-height: 1.4;">Gemini Vision acente görselindeki navlun tablosunu, ek ücretleri ve geçerlilik tarihlerini dijitalleştiriyor.</p>
                        </div>
                    </div>
                ` : `
                    <!-- SÜRÜKLE BIRAK ALANI -->
                    <div class="drag-drop-zone" id="rate-sheet-drop-zone">
                        <div class="icon-container">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <div>
                            <h3>Fiyat Görselini Sürükle ve Bırak</h3>
                            <p>PNG veya JPG formatındaki ekran görüntülerinizi buraya sürükleyin.</p>
                        </div>
                        <button class="btn-select">Dosya Seçin</button>
                        <input type="file" id="rate-sheet-file-input" accept="image/png, image/jpeg, image/jpg">
                        <div class="upload-note">PNG, JPG • Max 50MB</div>
                    </div>
                `}
            </div>

            <!-- SAĞ KOLON: Fiyat Listeleri Özet Tablosu -->
            <div class="rate-card">
                <h3 class="rate-card-title">
                    <span>Yüklenen Fiyat Listeleri</span>
                    <span class="badge-count">${sheets.length} Adet</span>
                </h3>
                <div class="sheets-list">
                    ${sheets.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: #64748b;">
                            <span style="font-size: 2.2rem; display: block; margin-bottom: 10px;">📁</span>
                            <h4 style="font-size: 0.9rem; margin: 0 0 4px 0; font-weight: 700; color: #0f172a;">Henüz Fiyat Listesi Yok</h4>
                            <p style="font-size: 0.78rem; margin: 0;">Sol taraftaki yükleme panelini kullanarak ilk acente görselinizi sisteme ekleyin.</p>
                        </div>
                    ` : sheets.map(sheet => `
                        <div class="sheet-item">
                            <div class="sheet-info-group">
                                <div class="sheet-icon-box">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                </div>
                                <div class="sheet-meta">
                                    <h4>${sheet.carrier_name || 'Bilinmeyen Taşıyıcı'}</h4>
                                    <p>${sheet.filename || 'navlun_tablosu.png'}</p>
                                    <div class="sheet-validity">Son Geçerlilik: ${formatDate(sheet.valid_until)}</div>
                                </div>
                            </div>
                            <button class="btn-delete-sheet" onclick="window.rateSheetsViewInit.deleteSheet(${sheet.id})" title="Fiyat Listesini Sil">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>

        </div>

        <!-- ALT BÖLÜM — SPOT FİYAT SORGULAMA -->
        <div class="rate-card route-query-card">
            <h3 class="rate-card-title">Liman Rotalarına Göre Spot Fiyat Sorgulama</h3>
            <div class="route-query-form">
                <div class="query-input-group">
                    <label for="query-pol">Yükleme Limanı (POL)</label>
                    <input type="text" id="query-pol" placeholder="Örn: Shanghai" required value="${state.rateSheetsPol || ''}" oninput="window.app.state.rateSheetsPol = this.value">
                </div>
                <div class="query-input-group">
                    <label for="query-pod">Varış Limanı (POD)</label>
                    <input type="text" id="query-pod" placeholder="Örn: Istanbul" required value="${state.rateSheetsPod || ''}" oninput="window.app.state.rateSheetsPod = this.value">
                </div>
                <button class="query-submit-btn" onclick="window.queryRateSheets()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Fiyatları Sorgula
                </button>
            </div>

            <!-- TABLO SONUÇLARI -->
            <div id="query-results-container">
                ${queryResults === null ? `
                    <div style="text-align: center; padding: 30px; color: #64748b; font-size: 0.8rem; border: 1px dashed #e2e8f0; border-radius: 6px; margin-top: 10px;">
                        Liman çiftlerini girip "Fiyatları Sorgula" butonuna tıklayarak en güncel spot verileri listeleyin.
                    </div>
                ` : queryResults.length === 0 ? `
                    <div style="text-align: center; padding: 30px; color: #ef4444; font-size: 0.8rem; border: 1px dashed rgba(239, 68, 68, 0.2); border-radius: 6px; margin-top: 10px; background-color: #fef2f2;">
                        Sorgulanan POL/POD rotası için geçerli bir acente spot fiyat satırı bulunamadı.
                    </div>
                ` : `
                    <div class="query-results-box">
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>Taşıyıcı / Acente</th>
                                    <th>Ekipman</th>
                                    <th>All-In Spot Fiyat</th>
                                    <th>Dahil Ek Ücretler</th>
                                    <th>Transit Süre</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${queryResults.map(item => `
                                    <tr class="${item.id === cheapestId ? 'cheapest-row' : ''}">
                                        <td style="font-weight: 700; color: #0f172a;">${item.carrier_name} ${item.id === cheapestId ? '🌟 <span style="font-size: 0.72rem; color: #059669; font-weight:700;">(En Uygun)</span>' : ''}</td>
                                        <td>${item.container_type}</td>
                                        <td class="price-tag">${item.currency} ${item.price}</td>
                                        <td style="font-size: 0.78rem; color: #64748b;">${item.includes && item.includes.length > 0 ? item.includes.join(', ') : 'All-In Spot'}</td>
                                        <td>${item.transit_days ? `${item.transit_days} Gün` : 'Belirtilmedi'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>

    </div>
    `;
};

// ─────────────────────────────────────────────
// VIEW BINDINGS & CONTROLLER FUNCTIONS
// ─────────────────────────────────────────────
window.rateSheetsViewInit = async (app) => {
    console.log('[VIEW INIT] Rate Sheets View Loaded.');

    // 1. Sayfa yüklenince fiyat listelerini API'den otomatik getir
    await app.managers.rateSheets.loadSheets();

    // Sürükle bırak alanı event bind adımları
    const dropZone = document.getElementById('rate-sheet-drop-zone');
    const fileInput = document.getElementById('rate-sheet-file-input');

    if (dropZone && fileInput) {
        // Drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-active');
            }, false);
        });

        // Drop event
        dropZone.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                await processUpload(files[0]);
            }
        });

        // File input change event
        fileInput.addEventListener('change', async (e) => {
            const files = fileInput.files;
            if (files && files.length > 0) {
                await processUpload(files[0]);
            }
        });
    }

    // Helper: Dosyayı yükleme işlemine gönderir
    async function processUpload(file) {
        if (!file.type.startsWith('image/')) {
            window.notificationManager?.showToast('Lütfen sadece PNG veya JPG formatında fiyat tablosu görselleri yükleyin.', 'warning');
            return;
        }

        // Loading aktif yap
        app.state.rateSheetsLoading = true;
        app.commit();

        try {
            // Upload et
            await app.managers.rateSheets.uploadSheet(file);
        } catch (err) {
            console.error('[RATE SHEET UPLOAD ERR]', err);
        } finally {
            // Loading pasif yap
            app.state.rateSheetsLoading = false;
            app.commit();
        }
    }

    // 2. Acente Fiyat Görselini Sil
    window.rateSheetsViewInit.deleteSheet = async (id) => {
        await app.managers.rateSheets.deleteSheet(id);
    };

    // 3. Fiyat Sorgulama Butonu Event
    window.rateSheetsViewInit.queryRates = async () => {
        const pol = document.getElementById('query-pol')?.value.trim();
        const pod = document.getElementById('query-pod')?.value.trim();

        if (!pol || !pod) {
            window.notificationManager?.showToast('Lütfen liman sorgusu için POL ve POD alanlarını doldurun.', 'warning');
            return;
        }

        // Sonuçları çek
        const results = await app.managers.rateSheets.queryRates(pol, pod);
        
        // State güncelle ve re-render tetikle
        app.state.rateSheetsQueryResults = results;
        app.commit();
    };
};
