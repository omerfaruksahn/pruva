/**
 * Pruva - Konteyner Taşımacılığı Kılavuzu
 * Keywords: konteyner, konteyner taşımacılığı, ambarlı konteyner, FCL, LCL, parsiyel yükleme, konteyner ölçüleri, denizcilik
 */
window.konteynerTasimaciligiView = (state) => {
    const isEn = state.lang === 'en';

    const content = {
        tr: {
            heroTitle: 'Deniz Konteyner Taşımacılığı & Yükleme Standartları',
            heroSubtitle: 'FCL komple konteyner ve LCL parsiyel deniz yolu yükleme çözümleri. 20\', 40\' ve HC konteyner ölçüleri ile lojistik planlamanızı optimize edin.',
            ctaBtn: 'Navlun Fiyatı Al',
            learnMore: 'Konteyner Ölçüleri',
            
            typesTitle: 'Konteyner Tipleri ve Teknik Ölçüleri',
            typesSubtitle: 'Uluslararası taşımacılıkta kullanılan standart ISO deniz yolu konteyner boyutları.',
            
            containers: [
                {
                    name: '20\' Standart Konteyner (20\' GP)',
                    dims: '5.90m x 2.35m x 2.39m',
                    vol: '33.2 CBM',
                    weight: '21,800 KG',
                    desc: 'Küçük ve ağır yükler için ideal standart deniz konteyneri. Mermer, maden, makine parçaları gibi yoğunluğu yüksek kargolar için tercih edilir.',
                    icon: 'box'
                },
                {
                    name: '40\' Standart Konteyner (40\' GP)',
                    dims: '12.03m x 2.35m x 2.39m',
                    vol: '67.7 CBM',
                    weight: '26,780 KG',
                    desc: 'Hacimli ama hafif kargolar için en çok tercih edilen konteyner tipi. Tekstil, ambalajlı tüketim ürünleri ve otomotiv parçaları için kullanılır.',
                    icon: 'boxes'
                },
                {
                    name: '40\' High Cube Konteyner (40\' HC)',
                    dims: '12.03m x 2.35m x 2.69m',
                    vol: '76.4 CBM',
                    weight: '26,500 KG',
                    desc: 'Standart 40\' konteynerden 30cm daha yüksek yapısı ile maksimum hacim ve yükleme kolaylığı sağlar. Hacmi büyük, dikey yerleşime uygun yükler için idealdir.',
                    icon: 'archive'
                }
            ],

            loadTypesTitle: 'Yükleme Modelleri: FCL vs LCL',
            fclTitle: 'FCL (Komple Konteyner Yükleme)',
            fclDesc: 'Konteynerin tamamı tek bir yükleyiciye aittir. Güvenli, hızlı ve elleçleme riski en az olan denizyolu taşıma modelidir.',
            lclTitle: 'LCL (Parsiyel / Konsol Konteyner)',
            lclDesc: 'Birden fazla firmanın parsiyel yükleri tek bir konteynerde konsolide edilir. Küçük hacimli ithalat ve ihracat yükleri için maliyet avantajı sağlar.'
        },
        en: {
            heroTitle: 'Ocean Container Shipping & Loading Standards',
            heroSubtitle: 'FCL Full Container and LCL Consol cargo solutions. Optimize your maritime shipping with 20ft, 40ft, and High Cube container dimensional configurations.',
            ctaBtn: 'Get Container Quote',
            learnMore: 'Container Specs',

            typesTitle: 'Container Types & Dimensional Specifications',
            typesSubtitle: 'Standard ISO marine container dimensions utilized in global shipping.',

            containers: [
                {
                    name: '20ft Standard Container (20\' GP)',
                    dims: '5.90m x 2.35m x 2.39m',
                    vol: '33.2 CBM',
                    weight: '21,800 KG',
                    desc: 'Perfect for small, heavy cargo. Popular for high-density loads such as marble, minerals, metal parts, and machinery.',
                    icon: 'box'
                },
                {
                    name: '40ft Standard Container (40\' GP)',
                    dims: '12.03m x 2.35m x 2.39m',
                    vol: '67.7 CBM',
                    weight: '26,780 KG',
                    desc: 'Designed for voluminous yet lighter cargo. Commonly used for textiles, consumer goods, furniture, and auto parts.',
                    icon: 'boxes'
                },
                {
                    name: '40ft High Cube Container (40\' HC)',
                    dims: '12.03m x 2.35m x 2.69m',
                    vol: '76.4 CBM',
                    weight: '26,500 KG',
                    desc: 'Offers 30cm of extra vertical clearance compared to standard 40ft units. Maximizes capacity and simplifies vertical loading.',
                    icon: 'archive'
                }
            ],

            loadTypesTitle: 'Loading Frameworks: FCL vs. LCL',
            fclTitle: 'FCL (Full Container Load)',
            fclDesc: 'An entire container dedicated to one single shipper. Fast, highly secure, and minimizes transit handling risks.',
            lclTitle: 'LCL (Less than Container Load / Consol)',
            lclDesc: 'Multiple shippers share space inside a single container. Extremely cost-effective for smaller parcel shipments.'
        }
    };

    const t = isEn ? content.en : content.tr;

    return `
    <div class="seo-landing-container" style="background: var(--bg-main); color: var(--text-primary); font-family: 'Inter', sans-serif;">
        
        <!-- Hero Section -->
        <section class="seo-hero" style="position: relative; padding: 120px 20px 80px; text-align: center; background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 40%);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <span class="badge" style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    ${isEn ? 'MARITIME SHIPPING' : 'DENİZCİLİK TAŞIMA'}
                </span>
                <h1 style="font-size: 3.2rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 24px; background: var(--text-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${t.heroTitle}
                </h1>
                <p style="font-size: 1.2rem; line-height: 1.6; color: var(--text-secondary); max-width: 750px; margin: 0 auto 35px;">
                    ${t.heroSubtitle}
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="/post-ad" class="btn-primary" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block; background: #3b82f6; border-color: #3b82f6;">
                        ${t.ctaBtn}
                    </a>
                    <a href="#olculer" class="btn-outline" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${t.learnMore}
                    </a>
                </div>
            </div>
        </section>

        <!-- Spec Cards Section -->
        <section id="olculer" style="padding: 80px 20px; background: var(--bg-card);">
            <div class="container" style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 60px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 15px;">${t.typesTitle}</h2>
                    <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">${t.typesSubtitle}</p>
                </div>

                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 30px;">
                    ${t.containers.map(c => `
                        <div class="card glassmorphism-card" style="padding: 30px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; border-bottom: 2px solid rgba(59, 130, 246, 0.1); padding-bottom: 10px;">${c.name}</h3>
                                
                                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">${isEn ? 'Internal Dimensions' : 'İç Ölçüler'}:</span><strong>${c.dims}</strong></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">${isEn ? 'Max Volume' : 'Maksimum Hacim'}:</span><strong>${c.vol}</strong></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">${isEn ? 'Max Payload' : 'Maksimum Yük'}:</span><strong>${c.weight}</strong></div>
                                </div>
                                
                                <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">${c.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- FCL vs LCL Section -->
        <section style="padding: 80px 20px; background: var(--bg-main);">
            <div class="container" style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 60px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em;">${t.loadTypesTitle}</h2>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 40px;">
                    <div style="padding: 35px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card);">
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="package-check" style="color: #3b82f6;"></i> ${t.fclTitle}
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6;">${t.fclDesc}</p>
                    </div>

                    <div style="padding: 35px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card);">
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="split" style="color: #10b981;"></i> ${t.lclTitle}
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6;">${t.lclDesc}</p>
                    </div>
                </div>
            </div>
        </section>
        
    </div>
    `;
};
