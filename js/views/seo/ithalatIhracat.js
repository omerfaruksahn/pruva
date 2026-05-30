/**
 * Pruva - İthalat & İhracat Lojistik Rehberi
 * Keywords: ithalat, ihracat, dış ticaret, yükleyici, alıcı, satıcı, konşimento nedir, konşimento sorgulama, ambarlı
 */
window.ithalatIhracatView = (state) => {
    const isEn = state.lang === 'en';

    const content = {
        tr: {
            heroTitle: 'İthalat & İhracat Operasyonlarında Güvenilir Lojistik',
            heroSubtitle: 'Dış ticarette kusursuz sevkıyat yönetimi. Yükleyici (Shipper), Alıcı (Consignee) ve Satıcı süreçlerini dijitalleştiriyor, konşimento belgelerinizi güvenle arşivliyoruz.',
            ctaBtn: 'İthalat/İhracat İlanı Aç',
            learnMore: 'Lojistik Terimleri Rehberi',
            
            guideTitle: 'Dış Ticaret Lojistik Yapısı',
            guideSubtitle: 'İthalat ve ihracat süreçlerinde rol alan taraflar ve yasal belgeler.',
            
            roles: [
                {
                    title: 'Yükleyici (Shipper / Exporter)',
                    desc: 'Malların sevkıyatını başlatan, genellikle ihracatçı veya satıcı pozisyonundaki taraf. Konşimentoda gönderici olarak tanımlanır.',
                    icon: 'package-open'
                },
                {
                    title: 'Alıcı (Consignee / Importer)',
                    desc: 'Konşimentoda belirtilen ve limana varışta yükü teslim almaya yetkili olan ithalatçı veya alıcı şirket.',
                    icon: 'user-check'
                },
                {
                    title: 'Konşimento (Bill of Lading - B/L)',
                    desc: 'Armatör veya taşıyıcı tarafından düzenlenen, yükün gemiye yüklendiğini kanıtlayan, kıymetli evrak niteliğindeki en kritik uluslararası taşıma sözleşmesidir.',
                    icon: 'file-text'
                }
            ],

            faqTitle: 'Sıkça Sorulan Sorular',
            faqs: [
                {
                    q: 'Konşimento Sorgulama ve Takibi Nasıl Yapılır?',
                    a: 'Pruva platformu üzerinden anlaştığınız taşıyıcının düzenlediği konşimento numarasını yazarak konteynerinizin anlık konumunu ve gemi varış durumunu harita üzerinden canlı takip edebilirsiniz.'
                },
                {
                    q: 'İthalat/İhracat yüklerinde navlun teklifi nasıl alınır?',
                    a: 'Yeni İlan Ver sayfasına giderek yükleme limanı (örn. Ambarlı), varış limanı, konteyner tipi ve tarih detaylarını girerek onlarca lojistik firmasından dakikalar içinde canlı teklifler alabilirsiniz.'
                },
                {
                    q: 'Ordino belgesi nedir ve konşimentodan farkı nedir?',
                    a: 'Konşimento mülkiyeti temsil ederken, ordino (teslim talimat formu) yükün limandan çekilebilmesi için acenteden alınan fiili teslim yetki belgesidir.'
                }
            ]
        },
        en: {
            heroTitle: 'Reliable Logistics for Import & Export Operations',
            heroSubtitle: 'Flawless supply chain management in international trade. Digitalize Shipper, Consignee, and Seller tasks, and manage your Ocean Bill of Lading securely.',
            ctaBtn: 'Post Import/Export Load',
            learnMore: 'Logistics Glossary',

            guideTitle: 'International Trade Logistics Structure',
            guideSubtitle: 'Entities and crucial documents participating in global import-export flows.',

            roles: [
                {
                    title: 'Shipper (Exporter)',
                    desc: 'The party initiating the shipment, usually the exporter or seller. Officially listed as the shipper in the ocean Bill of Lading.',
                    icon: 'package-open'
                },
                {
                    title: 'Consignee (Importer)',
                    desc: 'The buyer or importer officially named in the B/L, authorized to claim and clear the cargo at destination.',
                    icon: 'user-check'
                },
                {
                    title: 'Bill of Lading (B/L)',
                    desc: 'The contract of carriage issued by the carrier or shipowner, proving receipt of cargo on board and acting as document of title.',
                    icon: 'file-text'
                }
            ],

            faqTitle: 'Frequently Asked Questions',
            faqs: [
                {
                    q: 'How to Track and Trace a Bill of Lading?',
                    a: 'Enter your container or B/L booking number on Pruva to track your vessel\'s live status, ETA, and current coordinate updates globally.'
                },
                {
                    q: 'How do I collect freight rates for global imports/exports?',
                    a: 'Simply post a load detailing load port (POL), discharge port (POD), equipment size, and dates. Verified forwarders will bid in real-time.'
                },
                {
                    q: 'What is a Delivery Order (D/O) vs. Bill of Lading?',
                    a: 'A B/L represents title ownership, while a Delivery Order is the operational release note issued by the agent to physically withdraw cargo at the port.'
                }
            ]
        }
    };

    const t = isEn ? content.en : content.tr;

    return `
    <div class="seo-landing-container" style="background: var(--bg-main); color: var(--text-primary); font-family: 'Inter', sans-serif;">
        
        <!-- Hero Section -->
        <section class="seo-hero" style="position: relative; padding: 120px 20px 80px; text-align: center; background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 40%);">
            <div class="container" style="max-width: 900px; margin: 0 auto;">
                <span class="badge" style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
                    ${isEn ? 'GLOBAL TRADE' : 'KÜRESEL TİCARET'}
                </span>
                <h1 style="font-size: 3.2rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 24px; background: var(--text-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${t.heroTitle}
                </h1>
                <p style="font-size: 1.2rem; line-height: 1.6; color: var(--text-secondary); max-width: 750px; margin: 0 auto 35px;">
                    ${t.heroSubtitle}
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="/post-ad" class="btn-primary" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block; background: #10b981; border-color: #10b981;">
                        ${t.ctaBtn}
                    </a>
                    <a href="#dıs-ticaret-rehberi" class="btn-outline" style="padding: 14px 28px; font-weight: 600; text-decoration: none; display: inline-block;">
                        ${t.learnMore}
                    </a>
                </div>
            </div>
        </section>

        <!-- Structure Section -->
        <section id="dıs-ticaret-rehberi" style="padding: 80px 20px; background: var(--bg-card);">
            <div class="container" style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 60px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 15px;">${t.guideTitle}</h2>
                    <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">${t.guideSubtitle}</p>
                </div>

                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
                    ${t.roles.map(role => `
                        <div class="card glassmorphism-card" style="padding: 30px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column; gap: 15px;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="${role.icon}" style="width: 24px; height: 24px;"></i>
                            </div>
                            <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary);">${role.title}</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${role.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section style="padding: 80px 20px; background: var(--bg-main);">
            <div class="container" style="max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em;">${t.faqTitle}</h2>
                </div>

                <div style="display: flex; flex-direction: column; gap: 20px;">
                    ${t.faqs.map((faq, idx) => `
                        <div class="faq-item" style="border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); overflow: hidden; transition: box-shadow 0.3s ease;">
                            <div onclick="const a = this.nextElementSibling; const i = this.querySelector('i'); a.style.display = a.style.display === 'none' ? 'block' : 'none'; i.style.transform = a.style.display === 'block' ? 'rotate(180deg)' : 'none';" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">
                                <span>${faq.q}</span>
                                <i data-lucide="chevron-down" style="width: 18px; height: 18px; color: var(--text-secondary); transition: transform 0.3s ease;"></i>
                            </div>
                            <div style="display: none; padding: 0 20px 20px; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; border-top: 1px solid var(--border); padding-top: 15px;">
                                ${faq.a}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        
    </div>
    `;
};
