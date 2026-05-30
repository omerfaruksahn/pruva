/**
 * Pruva - Lojistik Hizmetleri SEO Landing Page
 * Keywords: lojistik, nakliyeci, forwarder, armatör, tır nakliyesi, güvenilir lojistik firmaları, denizcilik
 */
window.lojistikHizmetleriView = (state) => {
    const isEn = state.lang === 'en';

    const content = {
        tr: {
            heroTitle: 'Dijital Lojistikte Güvenilir Çözüm Ortağınız',
            heroSubtitle: 'Pruva ile armatör, forwarder ve nakliyeci ağımızı tek bir platformda birleştiriyoruz. Denizcilik ve tır taşımacılığında en hızlı, şeffaf ve ekonomik navlun tekliflerine ulaşın.',
            ctaBtn: 'Hemen Teklif Topla',
            learnMore: 'Pazaryerini Keşfet',
            
            sectionTitle: 'Lojistik Ekosisteminin Aktörleri',
            sectionSubtitle: 'İthalat ve ihracat yükleriniz için en doğru lojistik ortağıyla anında çalışmaya başlayın.',
            
            roles: [
                {
                    title: 'Armatör (Shipowner)',
                    desc: 'Gemi sahibi veya işletmecisi olan, deniz taşımacılığının ana omurgasını oluşturan taşıyıcılar. Ambarlı ve tüm küresel limanlar arasında direkt hat konteyner servisleri sunar.',
                    badge: 'Denizyolu Lideri',
                    icon: 'ship'
                },
                {
                    title: 'Forwarder (Taşıma İşleri Organizatörü)',
                    desc: 'Çoklu taşıma modlarını birleştirerek gümrükleme, depolama ve uçtan uca lojistik planlamayı üstlenen profesyonel organizatörler. Esnek ve parsiyel (LCL) yükleme çözümleri sunarlar.',
                    badge: 'Süreç Yöneticisi',
                    icon: 'git-merge'
                },
                {
                    title: 'Nakliyeci (Road Carrier / Truck)',
                    desc: 'Liman-fabrika veya şehirler arası kara nakliyesini üstlenen, özmal tır filoları ile hızlı ve adrese teslim güvenilir kara yolu lojistik hizmeti sağlayan taşıyıcılar.',
                    badge: 'Esnek Kara Gücü',
                    icon: 'truck'
                }
            ],

            benefitsTitle: 'Neden Pruva Lojistik Ağını Seçmelisiniz?',
            benefits: [
                { title: 'Güvenilirlik', text: 'Tüm iş ortaklarımız VKN ve yetki belgesi onaylı, ticaret odasına kayıtlı saygın firmalardır.' },
                { title: 'Anlık Navlun', text: 'Zaman kaybettiren e-posta trafiğine son verin. Taleplerinize dakikalar içinde en uygun fiyatları toplayın.' },
                { title: 'Çoklu Taşıma Modu', text: 'Deniz konteyner (FCL/LCL) ve tır nakliye operasyonlarınızı tek bir ekrandan yönetin.' }
            ]
        },
        en: {
            heroTitle: 'Your Reliable Partner in Digital Logistics',
            heroSubtitle: 'We unite shipowners, freight forwarders, and road carriers in a single platform. Get the fastest, most transparent, and economical ocean and road freight rates.',
            ctaBtn: 'Collect Bids Now',
            learnMore: 'Explore Marketplace',

            sectionTitle: 'Key Actors in the Logistics Ecosystem',
            sectionSubtitle: 'Connect instantly with the right partner for your import and export cargo.',

            roles: [
                {
                    title: 'Shipowner (Armateur)',
                    desc: 'Vessel operators forming the backbone of maritime transport. Offering direct container lines between Ambarli and global ports.',
                    badge: 'Ocean Leader',
                    icon: 'ship'
                },
                {
                    title: 'Freight Forwarder',
                    desc: 'Professional organizers managing customs, warehousing, and end-to-end multi-modal routing. Expert in both FCL and flexible LCL consol solutions.',
                    badge: 'Process Planner',
                    icon: 'git-merge'
                },
                {
                    title: 'Carrier (Road Transport / Truck)',
                    desc: 'Providers of port-to-factory or domestic road shipping using robust truck fleets. Fast, reliable, and secure door-to-door deliveries.',
                    badge: 'Road Power',
                    icon: 'truck'
                }
            ],

            benefitsTitle: 'Why Choose Pruva\'s Logistics Network?',
            benefits: [
                { title: 'Trust & Verification', text: 'All partners undergo thorough company and transport license checks.' },
                { title: 'Instant Freight Rates', text: 'Eliminate tedious email back-and-forth. Collect competitive rates in minutes.' },
                { title: 'Multi-Modal Flexibility', text: 'Seamlessly coordinate ocean FCL/LCL and road transport from one dashboard.' }
            ]
        }
    };

    const t = isEn ? content.en : content.tr;

    return `
    <div class="seo-landing-container" style="background: var(--bg-main); color: var(--text-primary); font-family: 'Inter', sans-serif;">
        
        <!-- Hero Section -->
        <section class="seo-hero" style="position: relative; padding: 120px 20px 80px; text-align: center; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <span class="badge" style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(99, 102, 241, 0.1); color: var(--primary); font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    ${isEn ? 'LOGISTICS 4.0' : 'LOJİSTİK 4.0'}
                </span>
                <h1 style="font-size: 3.2rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 24px; background: var(--text-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${t.heroTitle}
                </h1>
                <p style="font-size: 1.2rem; line-height: 1.6; color: var(--text-secondary); max-width: 750px; margin: 0 auto 35px;">
                    ${t.heroSubtitle}
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="/post-ad" class="btn-primary" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${t.ctaBtn}
                    </a>
                    <a href="/marketplace" class="btn-outline" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${t.learnMore}
                    </a>
                </div>
            </div>
        </section>

        <!-- Ecosystem Section -->
        <section style="padding: 80px 20px; background: var(--bg-card);">
            <div class="container" style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 60px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 15px;">${t.sectionTitle}</h2>
                    <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">${t.sectionSubtitle}</p>
                </div>

                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
                    ${t.roles.map(role => `
                        <div class="card glassmorphism-card" style="padding: 30px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); transition: transform 0.3s ease, box-shadow 0.3s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                                        <i data-lucide="${role.icon}" style="width: 24px; height: 24px;"></i>
                                    </div>
                                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--primary); background: rgba(99, 102, 241, 0.1); padding: 4px 10px; border-radius: 10px;">${role.badge}</span>
                                </div>
                                <h3 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">${role.title}</h3>
                                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px;">${role.desc}</p>
                            </div>
                            <a href="/post-ad" style="color: var(--primary); font-weight: 600; font-size: 0.9rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                                ${isEn ? 'Get Quotes' : 'Teklif Al'} <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Benefits Section -->
        <section style="padding: 80px 20px; background: var(--bg-main);">
            <div class="container" style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 60px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em;">${t.benefitsTitle}</h2>
                </div>

                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
                    ${t.benefits.map((b, idx) => `
                        <div style="display: flex; gap: 15px;">
                            <div style="font-size: 2rem; font-weight: 800; color: var(--primary); opacity: 0.4; line-height: 1;">0${idx+1}</div>
                            <div>
                                <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">${b.title}</h4>
                                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${b.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        
    </div>
    `;
};
