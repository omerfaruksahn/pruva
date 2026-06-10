const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

const translations = {
    loader_dash: {
        active_requests_title: {
            tr: "Aktif Talepler",
            en: "Active Requests",
            zh: "活跃请求",
            ru: "Активные запросы",
            es: "Solicitudes activas"
        },
        ongoing_shipments_title: {
            tr: "Devam Eden Sevkiyatlar",
            en: "Ongoing Shipments",
            zh: "进行中的货运",
            ru: "Текущие отправки",
            es: "Envíos en curso"
        },
        completed_orders_title: {
            tr: "Tamamlanan Siparişler",
            en: "Completed Orders",
            zh: "已完成订单",
            ru: "Завершенные заказы",
            es: "Pedidos completados"
        },
        customer_dashboard: {
            tr: "Müşteri Paneli",
            en: "Customer Dashboard",
            zh: "客户仪表板",
            ru: "Панель клиента",
            es: "Panel del cliente"
        },
        tab_active_requests: {
            tr: "Açık İlanlar",
            en: "Active Requests",
            zh: "活跃请求",
            ru: "Активные запросы",
            es: "Solicitudes activas"
        },
        tab_ongoing: {
            tr: "Devam Eden",
            en: "Ongoing",
            zh: "进行中",
            ru: "Текущие",
            es: "En curso"
        },
        tab_history: {
            tr: "Geçmiş",
            en: "History",
            zh: "历史记录",
            ru: "История",
            es: "Historial"
        }
    }
};

const mergeDeep = (target, source) => {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
};

langs.forEach(lang => {
    const localePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(localePath)) {
        let localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        
        const toMerge = { loader_dash: {} };
        
        for (const [key, val] of Object.entries(translations.loader_dash)) {
            toMerge.loader_dash[key] = val[lang];
        }
        
        mergeDeep(localeData, toMerge);
        fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    }
});
console.log('Loader dash translations injected successfully.');
