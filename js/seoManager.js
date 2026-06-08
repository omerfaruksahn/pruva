// ─────────────────────────────────────────────
// Dynamic SEO Manager & Metadata Configuration
// ─────────────────────────────────────────────

const SEO_CONFIG = {
  tr: {
    'home': {
      title: 'Pruva | Güvenilir Dijital Lojistik Pazaryeri - Yük, Tır & Konteyner Navlun',
      description: 'Türkiye\'nin lider dijital lojistik platformu. İthalat, ihracat yükleriniz ve tır nakliyeleri için Ambarlı ve tüm limanlarda en uygun konteyner navlun tekliflerini alın, nakliyeci, armatör ve forwarder firmalarıyla anında eşleşin.',
      keywords: 'navlun, yük, ithalat, ihracat, armatör, forwarder, nakliyeci, lojistik, konteyner, ambarlı, konşimento, denizcilik, tır',
      schema: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Pruva Lojistik Platformu",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1480"
        },
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "TRY"
        }
      }
    },
    'marketplace': {
      title: 'Lojistik Pazaryeri & Canlı Yük İlanları - Pruva',
      description: 'Pruva canlı lojistik pazaryeri. Güncel taşıma ilanlarını inceleyin, Ambarlı limanı ve Türkiye geneli konteyner ve tır yükleri için en rekabetçi navlun tekliflerini verin.',
      keywords: 'yük ilanları, nakliyeci bul, tır yükü, konteyner navlun teklifleri, ambarlı nakliye, lojistik pazarı'
    },
    'education': {
      title: 'Pruva Akademi | Dijital Lojistik & Dış Ticaret Eğitimi',
      description: 'Lojistik profesyonelleri için ücretsiz dış ticaret ve lojistik eğitimleri. Konşimento, FCL/LCL yükleme, navlun hesaplama ve liman operasyonları hakkında uzmanlaşın.',
      keywords: 'lojistik eğitimi, dış ticaret akademisi, konşimento eğitimi, lojistik dersleri'
    },
    'lojistik-hizmetleri': {
      title: 'Güvenilir Lojistik Firmaları & Dijital Nakliyeci Çözümleri - Pruva',
      description: 'Pruva ile en güvenilir nakliyeci, forwarder ve armatör firmalarını bulun. Kara tır taşımacılığı, denizcilik lojistiği ve liman entegrasyonu ile lojistik süreçlerinizi dijitalleştirin.',
      keywords: 'lojistik, nakliyeci, forwarder, armatör, tır nakliyesi, güvenilir lojistik firmaları, denizcilik taşımacılığı, ambarlı lojistik',
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Pruva Dijital Lojistik Entegrasyonu",
        "provider": {
          "@type": "Organization",
          "name": "Pruva",
          "url": "https://pruvahub.com"
        },
        "serviceType": "Logistics and Freight Management"
      }
    },
    'ithalat-ihracat': {
      title: 'İthalat & İhracat Lojistik Rehberi | Konşimento Belgesi Nedir? - Pruva',
      description: 'İthalat ve ihracat yükleriniz için komple kılavuz. Yükleyici, alıcı ve satıcı sorumlulukları, konşimento (Bill of Lading - B/L) belgesi türleri ve Ambarlı liman teslim süreçleri.',
      keywords: 'ithalat, ihracat, dış ticaret, yükleyici, alıcı, satıcı, gümrükleme, konşimento nedir, konşimento sorgulama, ambarlı liman teslim',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
          "@type": "Question",
          "name": "Konşimento (Bill of Lading) belgesi nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Konşimento, taşınmak üzere teslim alınan yüke karşılık armatör veya forwarder tarafından düzenlenen, yükün mülkiyetini temsil eden ve taşıma sözleşmesi niteliğinde olan en kritik dış ticaret belgesidir."
          }
        }, {
          "@type": "Question",
          "name": "Yükleyici (Shipper) ve Alıcı (Consignee) arasındaki fark nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yükleyici (Shipper), malı sevk eden ihracatçı veya satıcı firmadır. Alıcı (Consignee) ise konşimentoda belirtilen, yükün limanda teslim edileceği ithalatçı veya nihai alıcı firmadır."
          }
        }]
      }
    },
    'konteyner-tasimaciligi': {
      title: 'Konteyner Taşımacılığı | FCL & LCL Parsiyel Yükleme Ölçüleri - Pruva',
      description: 'Deniz yolu konteyner taşımacılığı kılavuzu. 20\', 40\' ve HC konteyner ölçüleri, FCL (komple) ve LCL (parsiyel/konsol) navlun avantajları ve Ambarlı konteyner operasyonları.',
      keywords: 'konteyner, konteyner taşımacılığı, ambarlı konteyner, FCL, LCL, parsiyel yükleme, konteyner ölçüleri, denizcilik',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
          "@type": "Question",
          "name": "FCL ve LCL konteyner taşımacılığı arasındaki fark nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FCL (Full Container Load), konteynerin tamamının tek bir yükleyiciye ait olmasıdır. LCL (Less than Container Load) ise aynı konteynerin birden fazla farklı yükleyicinin parsiyel yükleriyle paylaşımlı olarak doldurulmasıdır."
          }
        }]
      }
    },
    'navlun-hesaplama': {
      title: 'Online Navlun Hesaplama | Konteyner & Tır Fiyat Sorgulama - Pruva',
      description: 'Lojistik yükleriniz için canlı interaktif navlun hesaplama aracı. Deniz konteyner navlunu ve kara tır navlun fiyatlarını karşılaştırın, anında CBM hacim hesabı yapın.',
      keywords: 'navlun, navlun hesaplama, yük, konteyner fiyatları, ambarlı navlun ücretleri, tır navlun, hacim hesaplama, cbm',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
          "@type": "Question",
          "name": "Navlun fiyatları nasıl hesaplanır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Navlun fiyatları; çıkış ve varış limanları, tır/deniz yolu tercihi, konteyner hacmi (CBM) ve güncel yakıt (BAF) oranlarına göre anlık olarak hesaplanır. Pruva aracı size tahmini referans fiyat sunar."
          }
        }]
      }
    },
    'membership': {
      title: 'Pruva Premium | Lojistikte Ayrıcalıklı Taşıma & Teklif Verme Üyeliği',
      description: 'Pruva Premium planları ile acil ilan etiketleri, doğrulanmış nakliyeci rozeti ve sınırsız navlun teklif verme özelliklerine sahip olun, lojistikte rakiplerinizin önüne geçin.',
      keywords: 'pruva premium, lojistik üyelik, nakliyeci abonelik, premium navlun'
    },
    'settings': {
      title: 'Profil & Sistem Ayarları - Pruva',
      description: 'Firma profili, yetkilendirmeler, lojistik lisansları, VKN ve iletişim ayarlarınızı güncelleyin.',
      keywords: 'ayarlar, profil güncelleme, şirket ayarları, pruva profil'
    },
    'login': {
      title: 'Giriş Yap | Pruva Dijital Lojistik Platformu',
      description: 'Pruva dijital lojistik pazaryerine giriş yapın. Canlı navlun tekliflerinizi, tır ve konteyner yük ilanlarınızı anında yönetin.',
      keywords: 'giriş yap, pruva login, lojistik panel giriş'
    },
    'register': {
      title: 'Kayıt Ol | Güvenilir Nakliyeci ve Yükleyici Ağına Katılın',
      description: 'Pruva\'ya ücretsiz kayıt olun. Nakliyeci, forwarder veya yükleyici olarak dijital lojistik ekosistemindeki yerinizi alın.',
      keywords: 'kayıt ol, lojistik üyelik, nakliyeci kayıt, yükleyici başvuru'
    },
    'post-ad': {
      title: 'Yeni Yük İlanı Ver | Tır & Konteyner Yükü Yayınlama - Pruva',
      description: 'Lojistik yükleriniz için saniyeler içinde ilan oluşturun. Ambarlı ve tüm Türkiye çıkışlı yükleriniz için güvenilir forwarder ve nakliyecilerden anında teklif toplayın.',
      keywords: 'yük ilanı ver, ilan yayınla, konteyner nakliye ilanı, tır yükü ekle'
    }
  },
  en: {
    'home': {
      title: 'Pruva | Reliable Digital Logistics Marketplace - Cargo, Truck & Container Freight',
      description: 'Turkey\'s premium digital logistics platform. Get competitive container freight rates and truck transport pricing for your import/export cargo at Ambarli and global ports. Connect with top carriers, shipowners, and forwarders.',
      keywords: 'freight, cargo, import, export, shipowner, forwarder, carrier, logistics, container, ambarli, reliable, bill of lading, maritime, truck',
      schema: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Pruva Logistics Platform",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication"
      }
    },
    'marketplace': {
      title: 'Logistics Marketplace & Live Cargo Ads - Pruva',
      description: 'Explore active cargo ads on Pruva. Submit competitive ocean container freight rates and road truck quotes for global and local routes.',
      keywords: 'cargo ads, find carrier, truck cargo, container freight quotes, ambarli shipping, logistics marketplace'
    },
    'education': {
      title: 'Pruva Academy | Digital Logistics & Foreign Trade Academy',
      description: 'Free trade and logistics courses for cargo professionals. Master bill of lading documents, FCL/LCL container shipping, and port operations.',
      keywords: 'logistics education, foreign trade academy, bill of lading training, container shipping course'
    },
    'lojistik-hizmetleri': {
      title: 'Reliable Logistics Companies & Digital Carrier Solutions - Pruva',
      description: 'Find trusted carriers, freight forwarders, and shipowners on Pruva. Digitalize your global logistics workflow with road trucking and maritime shipping integrations.',
      keywords: 'logistics, carrier, freight forwarder, shipowner, truck transport, reliable logistics company, maritime shipping, ambarli port logistics'
    },
    'ithalat-ihracat': {
      title: 'Import & Export Logistics Guide | What is a Bill of Lading? - Pruva',
      description: 'A complete foreign trade logistics handbook. Shipper, consignee, and seller roles, ocean Bill of Lading (B/L) types, and port operations.',
      keywords: 'import, export, foreign trade, shipper, consignee, seller, customs clearance, bill of lading, ocean freight, ambarli port shipping'
    },
    'konteyner-tasimaciligi': {
      title: 'Container Shipping | FCL & LCL Dimension Guide - Pruva',
      description: 'Ocean freight container shipping bible. 20ft, 40ft, and High Cube dimensions, FCL (Full Container) vs LCL (Less than Container) parcel volumes.',
      keywords: 'container, container transport, FCL, LCL, consol cargo, container size, maritime freight, ocean shipping'
    },
    'navlun-hesaplama': {
      title: 'Online Freight Calculator | Container & Truck Pricing Tool - Pruva',
      description: 'Live interactive freight rate estimator for import/export shipping. Compare ocean container pricing and truck shipping rates. Instant CBM calculation.',
      keywords: 'freight, freight calculator, cargo pricing, container rate, Ambarli shipping cost, truck freight, CBM calculator'
    },
    'membership': {
      title: 'Pruva Premium | Exclusive Carrier & Load Posting Membership',
      description: 'Upgrade to Pruva Premium to secure urgent load badges, verified carrier flags, and unlimited freight bids to outpace logistics competitors.',
      keywords: 'pruva premium, logistics membership, carrier subscription, premium freight'
    }
  }
,

  zh: {
    'home': { title: 'Pruva | 可靠的数字物流市场' },
    'marketplace': { title: '物流市场与实时货物广告 - Pruva' },
    'education': { title: 'Pruva 学院 | 数字物流与外贸学院' },
    'lojistik-hizmetleri': { title: '可靠的物流公司 - Pruva' },
    'ithalat-ihracat': { title: '进出口物流指南 - Pruva' },
    'konteyner-tasimaciligi': { title: '集装箱运输 - Pruva' },
    'navlun-hesaplama': { title: '在线运费计算器 - Pruva' },
    'membership': { title: 'Pruva Premium | 专属承运人会员' },
    'settings': { title: '配置文件和系统设置 - Pruva' },
    'login': { title: '登录 | Pruva 数字物流平台' },
    'register': { title: '注册 | 加入可靠网络' },
    'post-ad': { title: '发布新货运 | 卡车和集装箱发布 - Pruva' }
  },
  ru: {
    'home': { title: 'Pruva | Надежная цифровая логистическая платформа' },
    'marketplace': { title: 'Рынок логистики и объявления о грузах - Pruva' },
    'education': { title: 'Академия Pruva | Цифровая логистика' },
    'lojistik-hizmetleri': { title: 'Надежные логистические компании - Pruva' },
    'ithalat-ihracat': { title: 'Руководство по импорту и экспорту - Pruva' },
    'konteyner-tasimaciligi': { title: 'Контейнерные перевозки - Pruva' },
    'navlun-hesaplama': { title: 'Калькулятор фрахта онлайн - Pruva' },
    'membership': { title: 'Pruva Premium | Эксклюзивное членство' },
    'settings': { title: 'Профиль и настройки системы - Pruva' },
    'login': { title: 'Войти | Pruva Логистика' },
    'register': { title: 'Регистрация | Присоединяйтесь к сети' },
    'post-ad': { title: 'Опубликовать новый груз | Грузовики и контейнеры - Pruva' }
  },
  es: {
    'home': { title: 'Pruva | Plataforma Logística Digital Confiable' },
    'marketplace': { title: 'Mercado logístico y anuncios de carga - Pruva' },
    'education': { title: 'Academia Pruva | Logística Digital' },
    'lojistik-hizmetleri': { title: 'Empresas de logística confiables - Pruva' },
    'ithalat-ihracat': { title: 'Guía de logística de importación y exportación - Pruva' },
    'konteyner-tasimaciligi': { title: 'Transporte de contenedores - Pruva' },
    'navlun-hesaplama': { title: 'Calculadora de fletes en línea - Pruva' },
    'membership': { title: 'Pruva Premium | Membresía exclusiva' },
    'settings': { title: 'Perfil y configuración del sistema - Pruva' },
    'login': { title: 'Iniciar sesión | Pruva Logística' },
    'register': { title: 'Registrarse | Únete a la red' },
    'post-ad': { title: 'Publicar nueva carga | Camiones y contenedores - Pruva' }
  }

};

window.updateSEO = (view, lang) => {
    const config = SEO_CONFIG[lang]?.[view] || SEO_CONFIG[lang]?.home;
    if (!config) return;

    // 1. Update Title
    document.title = config.title;

    // 2. Update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);

    // 3. Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', config.keywords);

    // 4. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    const path = window.getViewUrl(view, lang);
    canonical.setAttribute('href', `https://pruvahub.com${path}`);

    // 5. Update OpenGraph Metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://pruvahub.com${path}`);

    // 6. Update Twitter Card Metadata
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', config.title);

    const twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', config.description);

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', `https://pruvahub.com${path}`);

    // 7. Inject JSON-LD Schema
    // Remove previous dynamic schemas
    const oldSchemas = document.querySelectorAll('script[type="application/ld+json"].dynamic-schema');
    oldSchemas.forEach(el => el.remove());

    if (config.schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.className = 'dynamic-schema';
        script.text = JSON.stringify(config.schema, null, 2);
        document.head.appendChild(script);
    }
};
