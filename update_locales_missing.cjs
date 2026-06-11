const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const files = ['en.json', 'tr.json', 'es.json', 'ru.json', 'zh.json'];

const homeAdditions = {
    tr: {
        campus_badge: "Eğitim Merkezi",
        campus_title: "Pruva Kampüs",
        campus_desc: "Öğretmenlerin ve sektör uzmanlarının kendi yazdıkları kitaplara, makalelere ve videolara ulaşın. Pruva Kampüs ile doğrudan uzmanlardan öğrenin ve kariyerinizi geliştirin.",
        campus_f1: "Yüzlerce Kitap & Makale",
        campus_f2: "Uzman Eğitmenlerden İçerikler",
        campus_f3: "Kendi Dijital Kütüphanen",
        campus_btn: "Kampüsü Keşfet"
    },
    en: {
        campus_badge: "Education Center",
        campus_title: "Pruva Campus",
        campus_desc: "Access books, articles, and videos written by teachers and industry experts. Learn directly from experts and advance your career with Pruva Campus.",
        campus_f1: "Hundreds of Books & Articles",
        campus_f2: "Content from Expert Instructors",
        campus_f3: "Your Digital Library",
        campus_btn: "Explore Campus"
    },
    es: {
        campus_badge: "Centro Educativo",
        campus_title: "Pruva Campus",
        campus_desc: "Accede a libros, artículos y videos de expertos de la industria. Aprende directamente de expertos y mejora tu carrera.",
        campus_f1: "Cientos de Libros y Artículos",
        campus_f2: "Contenido de Instructores Expertos",
        campus_f3: "Tu Biblioteca Digital",
        campus_btn: "Explorar Campus"
    },
    ru: {
        campus_badge: "Образовательный центр",
        campus_title: "Кампус Pruva",
        campus_desc: "Получите доступ к книгам, статьям и видео от отраслевых экспертов. Учитесь напрямую у специалистов и развивайте свою карьеру.",
        campus_f1: "Сотни книг и статей",
        campus_f2: "Контент от экспертов-преподавателей",
        campus_f3: "Ваша цифровая библиотека",
        campus_btn: "Исследовать кампус"
    },
    zh: {
        campus_badge: "教育中心",
        campus_title: "Pruva 校园",
        campus_desc: "访问行业专家撰写的书籍、文章和视频。直接向专家学习并发展您的职业生涯。",
        campus_f1: "数百本书籍和文章",
        campus_f2: "专家讲师的内容",
        campus_f3: "您的数字图书馆",
        campus_btn: "探索校园"
    }
};

const eduAdditions = {
    tr: {
        prod1_title: "Uluslararası Nakliye ve Navlun Yönetimi (E-Kitap)",
        prod2_title: "2026 Gümrük Mevzuatı Değişiklikleri ve Etkileri",
        prod3_title: "A'dan Z'ye Dijital Tedarik Zinciri Masterclass",
        prod4_title: "Konteyner Taşımacılığında Risk Yönetimi"
    },
    en: {
        prod1_title: "International Freight and Freight Management (E-Book)",
        prod2_title: "2026 Customs Regulations Changes and Impacts",
        prod3_title: "Digital Supply Chain Masterclass from A to Z",
        prod4_title: "Risk Management in Container Shipping"
    },
    es: {
        prod1_title: "Gestión de Carga Internacional y Fletes (E-Book)",
        prod2_title: "Cambios en las Regulaciones Aduaneras 2026",
        prod3_title: "Clase Magistral de Cadena de Suministro Digital",
        prod4_title: "Gestión de Riesgos en el Transporte de Contenedores"
    },
    ru: {
        prod1_title: "Международные грузоперевозки и управление фрахтом (Электронная книга)",
        prod2_title: "Изменения таможенного законодательства 2026",
        prod3_title: "Цифровая цепь поставок от А до Я",
        prod4_title: "Управление рисками в контейнерных перевозках"
    },
    zh: {
        prod1_title: "国际货运与运费管理（电子书）",
        prod2_title: "2026年海关法规变更及其影响",
        prod3_title: "从A到Z的数字供应链大师班",
        prod4_title: "集装箱运输中的风险管理"
    }
};

files.forEach(file => {
    const lang = file.replace('.json', '');
    const p = path.join(localesDir, file);
    if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        
        // Add home keys
        if (!data.home) data.home = {};
        Object.assign(data.home, homeAdditions[lang] || homeAdditions['en']);
        
        // Add edu keys
        if (!data.edu) data.edu = {};
        Object.assign(data.edu, eduAdditions[lang] || eduAdditions['en']);
        
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${file}`);
    }
});
