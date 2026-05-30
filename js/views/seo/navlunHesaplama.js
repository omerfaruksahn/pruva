/**
 * Pruva - Online Navlun Hesaplama & CBM Hacim Ölçme Aracı
 * Keywords: navlun, navlun hesaplama, yük, konteyner fiyatları, ambarlı navlun ücretleri, tır navlun, hacim hesaplama, cbm
 */
window.navlunHesaplamaView = (state) => {
    const isEn = state.lang === 'en';

    const content = {
        tr: {
            heroTitle: 'Anlık Navlun Hesaplama & CBM Hacim Ölçer',
            heroSubtitle: 'Lojistik yükleriniz için hacim ve navlun maliyetlerini saniyeler içinde hesaplayın. Deniz konteyner ve tır navlun referans fiyatlarına canlı ulaşın.',
            
            calcTitle: 'Hacim Hesaplama Aracı (CBM & Desi)',
            calcSubtitle: 'Koli veya palet boyutlarınızı girerek toplam metreküp (CBM) ve lojistik desi değerinizi anında öğrenin.',
            
            lblLength: 'Boy (cm)',
            lblWidth: 'En (cm)',
            lblHeight: 'Yükseklik (cm)',
            lblQty: 'Miktar (Adet)',
            btnCalc: 'Hacim Hesapla',
            
            resCbm: 'Toplam Hacim (CBM)',
            resDesi: 'Lojistik Desi (Kara Yolu)',
            
            rateTitle: 'Konteyner Navlun Tahmin Aracı',
            rateSubtitle: 'Çıkış limanı ve varış bölgesini seçerek tahmini güncel deniz yolu navlun maliyetlerini görün.',
            
            lblOrigin: 'Çıkış Limanı (Türkiye)',
            lblDest: 'Varış Bölgesi',
            lblType: 'Konteyner Tipi',
            btnEstimate: 'Navlun Hesapla',
            resRate: 'Tahmini Navlun Aralığı',
            resNotice: 'Verilen fiyatlar güncel piyasa koşullarına göre tahmini referans değerleridir. Canlı ve kesin fiyatlar için ilan verip firmalardan teklif almalısınız.'
        },
        en: {
            heroTitle: 'Instant Freight Estimator & CBM Calculator',
            heroSubtitle: 'Calculate shipping volumes and reference freight rates in seconds. Get immediate access to estimated ocean container and road freight rates.',
            
            calcTitle: 'Volume Calculator (CBM & Dim Weight)',
            calcSubtitle: 'Enter parcel or pallet dimensions to compute total Cubic Meters (CBM) and volumetric weight instantly.',
            
            lblLength: 'Length (cm)',
            lblWidth: 'Width (cm)',
            lblHeight: 'Height (cm)',
            lblQty: 'Quantity (Pcs)',
            btnCalc: 'Calculate Volume',
            
            resCbm: 'Total Volume (CBM)',
            resDesi: 'Volumetric Weight (Desi)',
            
            rateTitle: 'Container Freight Rate Estimator',
            rateSubtitle: 'Select origin port and destination region to estimate marine container freight rates.',
            
            lblOrigin: 'Origin Port (Turkey)',
            lblDest: 'Destination Region',
            lblType: 'Container Type',
            btnEstimate: 'Estimate Freight',
            resRate: 'Estimated Freight Range',
            resNotice: 'Rates shown are estimated market reference values. To secure binding, exact carrier bids, please post a live load on the marketplace.'
        }
    };

    const t = isEn ? content.en : content.tr;

    return `
    <div class="seo-landing-container" style="background: var(--bg-main); color: var(--text-primary); font-family: 'Inter', sans-serif;">
        
        <!-- Hero Section -->
        <section class="seo-hero" style="position: relative; padding: 120px 20px 80px; text-align: center; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <span class="badge" style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(99, 102, 241, 0.1); color: var(--primary); font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    ${isEn ? 'FREIGHT CALCULATORS' : 'NAVLUN HESAPLAYICILAR'}
                </span>
                <h1 style="font-size: 3.2rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 24px; background: var(--text-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${t.heroTitle}
                </h1>
                <p style="font-size: 1.2rem; line-height: 1.6; color: var(--text-secondary); max-width: 750px; margin: 0 auto 35px;">
                    ${t.heroSubtitle}
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="#cbm-aracı" class="btn-primary" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${isEn ? 'CBM Volume Calculator' : 'CBM Hacim Hesapla'}
                    </a>
                    <a href="#navlun-aracı" class="btn-outline" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${isEn ? 'Freight Estimator' : 'Navlun Hesaplayıcı'}
                    </a>
                </div>
            </div>
        </section>

        <!-- CBM Tool Section -->
        <section id="cbm-aracı" style="padding: 80px 20px; background: var(--bg-card);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 45px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px;">${t.calcTitle}</h2>
                    <p style="color: var(--text-secondary); font-size: 1.05rem;">${t.calcSubtitle}</p>
                </div>

                <div class="card glassmorphism-card" style="padding: 40px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: var(--shadow-md);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblLength}</label>
                            <input type="number" id="cbm-length" value="120" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblWidth}</label>
                            <input type="number" id="cbm-width" value="80" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblHeight}</label>
                            <input type="number" id="cbm-height" value="160" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblQty}</label>
                            <input type="number" id="cbm-qty" value="1" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary);">
                        </div>
                    </div>

                    <button onclick="window.calculateCbmTool()" class="btn-primary" style="width: 100%; padding: 14px; font-weight: 600;">${t.btnCalc}</button>

                    <div id="cbm-result" style="margin-top: 30px; padding: 20px; border-radius: 12px; background: rgba(99, 102, 241, 0.05); border: 1px dashed rgba(99, 102, 241, 0.2); display: none; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">${t.resCbm}</div>
                            <strong id="cbm-val" style="font-size: 1.8rem; color: var(--primary);">0 CBM</strong>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">${t.resDesi}</div>
                            <strong id="desi-val" style="font-size: 1.8rem; color: var(--primary);">0 Desi</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Rate Estimator Section -->
        <section id="navlun-aracı" style="padding: 80px 20px; background: var(--bg-main);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 45px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px;">${t.rateTitle}</h2>
                    <p style="color: var(--text-secondary); font-size: 1.05rem;">${t.rateSubtitle}</p>
                </div>

                <div class="card glassmorphism-card" style="padding: 40px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: var(--shadow-md);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblOrigin}</label>
                            <select id="rate-origin" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary); cursor: pointer;">
                                <option value="ambarli">Ambarlı Limanı (İstanbul)</option>
                                <option value="izmir">İzmir Limanı (Alsancak)</option>
                                <option value="mersin">Mersin Limanı (MIP)</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblDest}</label>
                            <select id="rate-dest" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary); cursor: pointer;">
                                <option value="europe">Kuzey Avrupa (Rotterdam, Hamburg)</option>
                                <option value="usa">Kuzey Amerika (New York, Houston)</option>
                                <option value="asia">Uzak Doğu (Shanghai, Singapore)</option>
                                <option value="med">Akdeniz (Genova, Alexandria)</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${t.lblType}</label>
                            <select id="rate-type" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-primary); cursor: pointer;">
                                <option value="20gp">20' GP Standart Konteyner</option>
                                <option value="40gp">40' GP Standart Konteyner</option>
                                <option value="40hc">40' HC High Cube Konteyner</option>
                            </select>
                        </div>
                    </div>

                    <button onclick="window.estimateNavlunTool()" class="btn-primary" style="width: 100%; padding: 14px; font-weight: 600;">${t.btnEstimate}</button>

                    <div id="rate-result" style="margin-top: 30px; padding: 25px; border-radius: 12px; background: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.2); display: none; text-align: center;">
                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">${t.resRate}</div>
                        <strong id="rate-val" style="font-size: 2.4rem; color: #10b981; display: block; margin-bottom: 12px;">$1,200 - $1,450</strong>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin: 0 auto; max-width: 600px;">${t.resNotice}</p>
                    </div>
                </div>
            </div>
        </section>
        
    </div>
    `;
};

// ─────────────────────────────────────────────
// Interaktif Tool Mantığı (Global Scope)
// ─────────────────────────────────────────────

window.calculateCbmTool = () => {
    const l = parseFloat(document.getElementById('cbm-length').value) || 0;
    const w = parseFloat(document.getElementById('cbm-width').value) || 0;
    const h = parseFloat(document.getElementById('cbm-height').value) || 0;
    const q = parseInt(document.getElementById('cbm-qty').value) || 1;

    // CBM = L * W * H / 1,000,000 * Q
    const cbmVal = (l * w * h / 1000000) * q;
    
    // Desi = L * W * H / 3000 * Q
    const desiVal = (l * w * h / 3000) * q;

    document.getElementById('cbm-val').textContent = cbmVal.toFixed(3) + ' CBM';
    document.getElementById('desi-val').textContent = Math.round(desiVal) + ' Desi';
    
    document.getElementById('cbm-result').style.display = 'grid';
};

window.estimateNavlunTool = () => {
    const origin = document.getElementById('rate-origin').value;
    const dest = document.getElementById('rate-dest').value;
    const type = document.getElementById('rate-type').value;

    // Basit interaktif navlun matriksi (Simülatif)
    const baseRates = {
        ambarli: { europe: 1200, usa: 2600, asia: 800, med: 650 },
        izmir:   { europe: 1150, usa: 2500, asia: 850, med: 600 },
        mersin:  { europe: 1300, usa: 2700, asia: 750, med: 500 }
    };

    const typeMultipliers = {
        '20gp': 1.0,
        '40gp': 1.45,
        '40hc': 1.55
    };

    const base = baseRates[origin]?.[dest] || 1000;
    const mult = typeMultipliers[type] || 1.0;
    
    const computed = Math.round(base * mult);
    const minVal = Math.round(computed * 0.95);
    const maxVal = Math.round(computed * 1.05);

    document.getElementById('rate-val').textContent = `$${minVal.toLocaleString()} - $${maxVal.toLocaleString()}`;
    document.getElementById('rate-result').style.display = 'block';
};
