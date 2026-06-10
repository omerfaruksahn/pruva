const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

const translations = {
    post_ad: {
        step1_title: {
            tr: "TEMEL BİLGİLER",
            en: "GENERAL INFORMATION",
            zh: "一般信息",
            ru: "ОСНОВНАЯ ИНФОРМАЦИЯ",
            es: "INFORMACIÓN GENERAL"
        },
        step2_title: {
            tr: "GÜZERGAH VE INCOTERMS",
            en: "ROUTE & INCOTERMS",
            zh: "路线和贸易术语",
            ru: "МАРШРУТ И ИНКОТЕРМС",
            es: "RUTA E INCOTERMS"
        },
        step3_title: {
            tr: "YÜK DETAYLARI",
            en: "CARGO SPECIFICATIONS",
            zh: "货物规格",
            ru: "ХАРАКТЕРИСТИКИ ГРУЗА",
            es: "ESPECIFICACIONES DE CARGA"
        },
        step4_title: {
            tr: "TAŞIMA ŞEKLİ VE ZAMAN",
            en: "SCHEDULE & MODE",
            zh: "时间表和模式",
            ru: "РАСПИСАНИЕ И РЕЖИМ",
            es: "HORARIO Y MODO"
        },
        step5_title: {
            tr: "EK DETAYLAR",
            en: "ADDITIONAL DETAILS",
            zh: "额外细节",
            ru: "ДОПОЛНИТЕЛЬНЫЕ ДЕТАЛИ",
            es: "DETALLES ADICIONALES"
        },
        publish_btn: {
            tr: "İlanı Yayınla",
            en: "Publish Shipment",
            zh: "发布货运",
            ru: "Опубликовать груз",
            es: "Publicar envío"
        },
        optional: {
            tr: "(Opsiyonel)",
            en: "(Optional)",
            zh: "(可选)",
            ru: "(Необязательно)",
            es: "(Opcional)"
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
        
        const toMerge = { post_ad: {} };
        for (const [key, val] of Object.entries(translations.post_ad)) {
            toMerge.post_ad[key] = val[lang];
        }
        
        mergeDeep(localeData, toMerge);
        fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    }
});
console.log('postAd headers injected');
