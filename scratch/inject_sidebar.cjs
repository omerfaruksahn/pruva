const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

const translations = {
    roles: {
        loader: {
            tr: "Yük Veren",
            en: "Shipper",
            zh: "发货人",
            ru: "Грузоотправитель",
            es: "Expedidor"
        },
        carrier: {
            tr: "Taşıyıcı",
            en: "Carrier",
            zh: "承运人",
            ru: "Перевозчик",
            es: "Transportista"
        },
        admin: {
            tr: "Yönetici",
            en: "Administrator",
            zh: "管理员",
            ru: "Администратор",
            es: "Administrador"
        }
    },
    settings: {
        personal_settings_group: {
            tr: "Kişisel Ayarlar",
            en: "Personal Settings",
            zh: "个人设置",
            ru: "Личные настройки",
            es: "Ajustes personales"
        },
        profile_info: {
            tr: "Profil Bilgileri",
            en: "Profile Information",
            zh: "个人资料信息",
            ru: "Информация о профиле",
            es: "Información del perfil"
        },
        security: {
            tr: "Güvenlik",
            en: "Security",
            zh: "安全",
            ru: "Безопасность",
            es: "Seguridad"
        },
        company_settings_group: {
            tr: "Kurumsal Ayarlar",
            en: "Corporate Settings",
            zh: "企业设置",
            ru: "Корпоративные настройки",
            es: "Configuración corporativa"
        },
        company_details: {
            tr: "Şirket Detayları",
            en: "Company Details",
            zh: "公司详情",
            ru: "Детали компании",
            es: "Detalles de la empresa"
        },
        notifications: {
            tr: "Bildirimler",
            en: "Notifications",
            zh: "通知",
            ru: "Уведомления",
            es: "Notificaciones"
        },
        membership_plans: {
            tr: "Üyelik ve Planlar",
            en: "Membership & Plans",
            zh: "会员与计划",
            ru: "Членство и планы",
            es: "Membresía y planes"
        },
        logout: {
            tr: "Çıkış Yap",
            en: "Logout",
            zh: "登出",
            ru: "Выйти",
            es: "Cerrar sesión"
        },
        avatar_edit_btn: {
            tr: "Fotoğraf Değiştir",
            en: "Change Photo",
            zh: "更换照片",
            ru: "Изменить фото",
            es: "Cambiar foto"
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
        
        // Build the lang specific object
        const toMerge = {
            roles: {},
            settings: {}
        };
        
        for (const [key, val] of Object.entries(translations.roles)) {
            toMerge.roles[key] = val[lang];
        }
        for (const [key, val] of Object.entries(translations.settings)) {
            toMerge.settings[key] = val[lang];
        }

        // Handle collision gracefully if 'settings' is a string by overwriting it
        if (typeof localeData.settings === 'string') {
            localeData.settings = {};
        }
        
        mergeDeep(localeData, toMerge);
        
        fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    }
});
console.log('Sidebar translations injected successfully.');
