const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const langs = ['tr', 'en', 'zh', 'ru', 'es'];

const sidebarTranslations = {
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
    sidebar_security: {
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
    sidebar_notifications: {
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
    sidebar_logout: {
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
};

langs.forEach(lang => {
    const localePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(localePath)) {
        let localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        
        if (!localeData.settings) {
            localeData.settings = {};
        }

        for (const [key, val] of Object.entries(sidebarTranslations)) {
            localeData.settings[key] = val[lang];
        }
        
        fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
    }
});
console.log('Sidebar keys explicitly fixed to avoid collisions.');
