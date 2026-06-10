const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';

const profileTranslations = {
    tr: {
        "user_profile": {
            "role_carrier": "Taşıyıcı",
            "role_loader": "Yük Veren",
            "cat_comm": "İletişim & Ulaşılabilirlik",
            "cat_delivery": "Zamanında Teslimat",
            "cat_doc": "Evrak Düzeni & Özen",
            "cat_prof": "İletişim & Profesyonellik",
            "cat_pay": "Ödeme Hızı & Güven",
            "cat_proc": "İş Süreçleri Uyumu",
            "elite_carrier": "Elit Taşıyıcı",
            "reliable_carrier": "Güvenilir Taşıyıcı",
            "active_carrier": "Aktif Taşıyıcı",
            "elite_loader": "Elit Yük Veren",
            "reliable_loader": "Güvenilir Yük Veren",
            "active_loader": "Aktif Yük Veren",
            "new_member": "Yeni Üye",
            "hidden_name": "Firma adı teklif kabul edilene kadar gizlidir",
            "references": "{count} Referans",
            "overall_rating": "Genel Puan",
            "no_rating": "Henüz puan yok",
            "completed_jobs": "Tamamlanan İş",
            "via_pruva": "Pruva üzerinden",
            "cat_perf": "Kategori Performansı",
            "recent_reviews": "Son Yorumlar",
            "company": "Firma",
            "no_reviews": "Henüz yorum yapılmamış."
        }
    },
    en: {
        "user_profile": {
            "role_carrier": "Carrier",
            "role_loader": "Shipper",
            "cat_comm": "Communication & Reachability",
            "cat_delivery": "On-Time Delivery",
            "cat_doc": "Documentation & Care",
            "cat_prof": "Communication & Professionalism",
            "cat_pay": "Payment Speed & Trust",
            "cat_proc": "Business Process Compliance",
            "elite_carrier": "Elite Carrier",
            "reliable_carrier": "Reliable Carrier",
            "active_carrier": "Active Carrier",
            "elite_loader": "Elite Shipper",
            "reliable_loader": "Reliable Shipper",
            "active_loader": "Active Shipper",
            "new_member": "New Member",
            "hidden_name": "Company name is hidden until the offer is accepted",
            "references": "{count} Reference(s)",
            "overall_rating": "Overall Rating",
            "no_rating": "No rating yet",
            "completed_jobs": "Completed Jobs",
            "via_pruva": "via Pruva",
            "cat_perf": "Category Performance",
            "recent_reviews": "Recent Reviews",
            "company": "Company",
            "no_reviews": "No reviews yet."
        }
    },
    zh: {
        "user_profile": {
            "role_carrier": "承运人",
            "role_loader": "托运人",
            "cat_comm": "沟通与可达性",
            "cat_delivery": "准时交货",
            "cat_doc": "文件与保管",
            "cat_prof": "沟通与专业",
            "cat_pay": "付款速度与信任",
            "cat_proc": "业务流程合规",
            "elite_carrier": "精英承运人",
            "reliable_carrier": "可靠承运人",
            "active_carrier": "活跃承运人",
            "elite_loader": "精英托运人",
            "reliable_loader": "可靠托运人",
            "active_loader": "活跃托运人",
            "new_member": "新会员",
            "hidden_name": "在接受报价之前隐藏公司名称",
            "references": "{count} 参考",
            "overall_rating": "总体评分",
            "no_rating": "暂无评分",
            "completed_jobs": "完成的工作",
            "via_pruva": "通过 Pruva",
            "cat_perf": "类别表现",
            "recent_reviews": "最近评论",
            "company": "公司",
            "no_reviews": "暂无评论。"
        }
    },
    ru: {
        "user_profile": {
            "role_carrier": "Перевозчик",
            "role_loader": "Грузоотправитель",
            "cat_comm": "Связь и доступность",
            "cat_delivery": "Своевременная доставка",
            "cat_doc": "Документация и уход",
            "cat_prof": "Связь и профессионализм",
            "cat_pay": "Скорость оплаты и доверие",
            "cat_proc": "Соблюдение бизнес-процессов",
            "elite_carrier": "Элитный перевозчик",
            "reliable_carrier": "Надежный перевозчик",
            "active_carrier": "Активный перевозчик",
            "elite_loader": "Элитный грузоотправитель",
            "reliable_loader": "Надежный грузоотправитель",
            "active_loader": "Активный грузоотправитель",
            "new_member": "Новый участник",
            "hidden_name": "Название компании скрыто до принятия предложения",
            "references": "{count} Ссылки",
            "overall_rating": "Общий рейтинг",
            "no_rating": "Пока нет рейтинга",
            "completed_jobs": "Выполненные работы",
            "via_pruva": "через Pruva",
            "cat_perf": "Показатели по категориям",
            "recent_reviews": "Последние отзывы",
            "company": "Компания",
            "no_reviews": "Пока нет отзывов."
        }
    },
    es: {
        "user_profile": {
            "role_carrier": "Transportista",
            "role_loader": "Cargador",
            "cat_comm": "Comunicación y Accesibilidad",
            "cat_delivery": "Entrega a tiempo",
            "cat_doc": "Documentación y Cuidado",
            "cat_prof": "Comunicación y Profesionalismo",
            "cat_pay": "Velocidad de pago y confianza",
            "cat_proc": "Cumplimiento de procesos comerciales",
            "elite_carrier": "Transportista de élite",
            "reliable_carrier": "Transportista confiable",
            "active_carrier": "Transportista activo",
            "elite_loader": "Cargador de élite",
            "reliable_loader": "Cargador confiable",
            "active_loader": "Cargador activo",
            "new_member": "Nuevo miembro",
            "hidden_name": "El nombre de la empresa está oculto hasta que se acepte la oferta",
            "references": "{count} Referencia(s)",
            "overall_rating": "Calificación general",
            "no_rating": "Sin calificación aún",
            "completed_jobs": "Trabajos completados",
            "via_pruva": "a través de Pruva",
            "cat_perf": "Desempeño por categoría",
            "recent_reviews": "Reseñas recientes",
            "company": "Empresa",
            "no_reviews": "Aún no hay reseñas."
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
    current.user_profile = profileTranslations[lang].user_profile;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Updated ${lang}.json with user_profile`);
});
