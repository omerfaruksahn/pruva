const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';

const membershipTranslations = {
    tr: {
        "membership": {
            "free_member": "Ücretsiz Üye",
            "premium_member": "Premium Üye",
            "days_left": "Kalan Süre: {days} Gün",
            "title": "Üyelik Planınızı Seçin",
            "subtitle": "Lojistik ağınızı büyütmek için size en uygun planı seçin. İstediğiniz zaman iptal edebilirsiniz.",
            "premium_plan": "Premium Plan",
            "per_month": "/ay",
            "premium_desc": "Profesyonel lojistik yönetimi için tüm özellikleri açan, gelişmiş filtreleme ve analiz içeren tam paket.",
            "f1": "Sınırsız İlan Detayı & Teklif Verme",
            "f2": "Gelişmiş Akıllı Filtreleme",
            "f3": "Bölgesel ve Sektörel Analizler",
            "f4": "Öncelikli Destek Hattı",
            "active_plan": "Aktif Plan",
            "start_premium": "Premium Planı Başlat",
            "history_title": "Ödeme ve Abonelik Geçmişi"
        }
    },
    en: {
        "membership": {
            "free_member": "Free Member",
            "premium_member": "Premium Member",
            "days_left": "Days Left: {days}",
            "title": "Choose Your Membership Plan",
            "subtitle": "Choose the best plan to grow your logistics network. You can cancel anytime.",
            "premium_plan": "Premium Plan",
            "per_month": "/mo",
            "premium_desc": "Full package unlocking all features for professional logistics management, including advanced filtering and analytics.",
            "f1": "Unlimited Ad Details & Bidding",
            "f2": "Advanced Smart Filtering",
            "f3": "Regional and Sectoral Analytics",
            "f4": "Priority Support Line",
            "active_plan": "Active Plan",
            "start_premium": "Start Premium Plan",
            "history_title": "Payment and Subscription History"
        }
    },
    zh: {
        "membership": {
            "free_member": "免费会员",
            "premium_member": "高级会员",
            "days_left": "剩余天数: {days}",
            "title": "选择您的会员计划",
            "subtitle": "选择发展您的物流网络的最佳计划。您可以随时取消。",
            "premium_plan": "高级计划",
            "per_month": "/月",
            "premium_desc": "解锁专业物流管理所有功能的完整包，包括高级过滤和分析。",
            "f1": "无限制的广告详情和竞标",
            "f2": "高级智能过滤",
            "f3": "区域和行业分析",
            "f4": "优先支持热线",
            "active_plan": "活跃计划",
            "start_premium": "开始高级计划",
            "history_title": "付款和订阅历史"
        }
    },
    ru: {
        "membership": {
            "free_member": "Бесплатный участник",
            "premium_member": "Премиум участник",
            "days_left": "Осталось дней: {days}",
            "title": "Выберите свой план членства",
            "subtitle": "Выберите лучший план для развития вашей логистической сети. Вы можете отменить подписку в любое время.",
            "premium_plan": "Премиум план",
            "per_month": "/мес",
            "premium_desc": "Полный пакет, открывающий все функции для профессионального управления логистикой, включая расширенную фильтрацию и аналитику.",
            "f1": "Неограниченная детализация объявлений и ставки",
            "f2": "Расширенная умная фильтрация",
            "f3": "Региональная и отраслевая аналитика",
            "f4": "Приоритетная линия поддержки",
            "active_plan": "Активный план",
            "start_premium": "Начать премиум-план",
            "history_title": "История платежей и подписок"
        }
    },
    es: {
        "membership": {
            "free_member": "Miembro Gratis",
            "premium_member": "Miembro Premium",
            "days_left": "Días restantes: {days}",
            "title": "Elija su plan de membresía",
            "subtitle": "Elija el mejor plan para hacer crecer su red logística. Puede cancelar en cualquier momento.",
            "premium_plan": "Plan Premium",
            "per_month": "/mes",
            "premium_desc": "Paquete completo que desbloquea todas las funciones para la gestión logística profesional, incluido el filtrado avanzado y el análisis.",
            "f1": "Detalles de anuncios y ofertas ilimitados",
            "f2": "Filtrado inteligente avanzado",
            "f3": "Análisis regionales y sectoriales",
            "f4": "Línea de soporte prioritario",
            "active_plan": "Plan activo",
            "start_premium": "Iniciar plan Premium",
            "history_title": "Historial de pagos y suscripciones"
        }
    }
};

const langs = ['tr', 'en', 'zh', 'ru', 'es'];
langs.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    let current = {};
    if (fs.existsSync(filePath)) {
        current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    current.membership = membershipTranslations[lang].membership;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Updated ${lang}.json with membership`);
});
