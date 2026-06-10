const fs = require('fs');

const seoFile = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\js\\seoManager.js';
let content = fs.readFileSync(seoFile, 'utf8');

// The SEO_CONFIG object is a global const. We can just append the missing languages to it.
const injection = `
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
`;

// Insert the new languages before the closing brace of SEO_CONFIG
content = content.replace(/  en: \{[\s\S]*?    \}\n  \}\n\};/, (match) => {
  return match.slice(0, -2) + ",\n" + injection + "\n};";
});

fs.writeFileSync(seoFile, content);
console.log('SEO config updated with ru, zh, es');
