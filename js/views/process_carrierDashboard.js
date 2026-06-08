const fs = require('fs');
const path = require('path');

const trTranslations = {};
const enTranslations = {};
const zhTranslations = {};
const ruTranslations = {};
const esTranslations = {};

function addTranslation(prefix, key, tr, en, zh, ru, es) {
  if (!trTranslations[prefix]) trTranslations[prefix] = {};
  if (!enTranslations[prefix]) enTranslations[prefix] = {};
  if (!zhTranslations[prefix]) zhTranslations[prefix] = {};
  if (!ruTranslations[prefix]) ruTranslations[prefix] = {};
  if (!esTranslations[prefix]) esTranslations[prefix] = {};

  trTranslations[prefix][key] = tr;
  enTranslations[prefix][key] = en;
  zhTranslations[prefix][key] = zh;
  ruTranslations[prefix][key] = ru;
  esTranslations[prefix][key] = es;
  return key;
}

let content = fs.readFileSync('carrierDashboard.js', 'utf8');

const reps = [
  ['Yeni İlanlar Bul', 'find_new_ads', 'Yeni İlanlar Bul', 'Find New Ads', '查找新广告', 'Найти новые объявления', 'Buscar Nuevos Anuncios'],
  ['Henüz bir teklif vermediniz.', 'no_bids_yet', 'Henüz bir teklif vermediniz.', 'You haven\'t placed any bids yet.', '您还没有出价。', 'Вы еще не делали ставок.', 'Aún no ha hecho ninguna oferta.'],
  ['Pazara Göz At', 'browse_market', 'Pazara Göz At', 'Browse Marketplace', '浏览市场', 'Просмотреть рынок', 'Navegar por el Mercado'],
  ['Teklifiniz:', 'your_offer', 'Teklifiniz:', 'Your Offer:', '您的报价：', 'Ваше предложение:', 'Su Oferta:'],
  ['Kazandınız', 'you_won', 'Kazandınız', 'You Won', '您赢了', 'Вы выиграли', 'Ganaste'],
  ['Değerlendirmede', 'under_review', 'Değerlendirmede', 'Under Review', '审核中', 'На рассмотрении', 'En Revisión'],
  ['İlan No:', 'ad_no', 'İlan No:', 'Ad No:', '广告编号：', 'Номер объявления:', 'Nº de Anuncio:'],
  ['Mesaj Gönder', 'send_message', 'Mesaj Gönder', 'Send Message', '发送消息', 'Отправить сообщение', 'Enviar Mensaje'],
  ['Geri Çek', 'withdraw_btn', 'Geri Çek', 'Withdraw', '撤回', 'Отозвать', 'Retirar'],
  ['ilan kaydedildi', 'ads_saved', 'ilan kaydedildi', 'ads saved', '个广告已保存', 'объявлений сохранено', 'anuncios guardados'],
  ['Henüz kaydettiğiniz bir ilan bulunmuyor.', 'no_saved_ads', 'Henüz kaydettiğiniz bir ilan bulunmuyor.', 'You haven\'t saved any ads yet.', '您还没有保存任何广告。', 'Вы еще не сохранили ни одного объявления.', 'Aún no ha guardado ningún anuncio.'],
  ['PREMIUM İNCELEME', 'premium_review', 'PREMIUM İNCELEME', 'PREMIUM REVIEW', '高级审核', 'ПРЕМИУМ ОБЗОР', 'REVISIÓN PREMIUM'],
  ['Yük Kalemleri ve Fotoğrafları:', 'cargo_items_photos', 'Yük Kalemleri ve Fotoğrafları:', 'Cargo Items and Photos:', '货物项目和照片：', 'Грузовые позиции и фото:', 'Artículos de Carga y Fotos:'],
  ['Premium Üye: Bu ilana buradan doğrudan teklif verebilirsiniz.', 'premium_member_direct_offer', 'Premium Üye: Bu ilana buradan doğrudan teklif verebilirsiniz.', 'Premium Member: You can bid directly on this ad from here.', '高级会员：您可以直接从这里对此广告进行报价。', 'Премиум участник: Вы можете сделать ставку на это объявление прямо отсюда.', 'Miembro Premium: Puede ofertar directamente en este anuncio desde aquí.'],
  ['Henüz kazanılmış bir işiniz bulunmuyor. Teklif vermeye devam edin!', 'no_won_jobs', 'Henüz kazanılmış bir işiniz bulunmuyor. Teklif vermeye devam edin!', 'You haven\'t won any jobs yet. Keep bidding!', '您还没有赢得任何工作。继续出价！', 'У вас еще нет выигранных работ. Продолжайте делать ставки!', 'Aún no ha ganado ningún trabajo. ¡Siga ofertando!'],
  ['Yük Sahibi:', 'loader_label', 'Yük Sahibi:', 'Shipper:', '发货人：', 'Отправитель:', 'Remitente:'],
  ['Fiyat:', 'price_label', 'Fiyat:', 'Price:', '价格：', 'Цена:', 'Precio:'],
  ['Durum', 'status_label', 'Durum', 'Status', '状态', 'Статус', 'Estado'],
  ['YÜKLEMEYE HAZIR', 'ready_to_load', 'YÜKLEMEYE HAZIR', 'READY TO LOAD', '准备装载', 'ГОТОВ К ПОГРУЗКЕ', 'LISTO PARA CARGAR'],
  ['Yük Sahibi İletişim', 'loader_contact', 'Yük Sahibi İletişim', 'Shipper Contact', '发货人联系', 'Контакт отправителя', 'Contacto del Remitente'],
  ['Operasyonel Adımlar', 'operational_steps', 'Operasyonel Adımlar', 'Operational Steps', '操作步骤', 'Операционные шаги', 'Pasos Operativos'],
  ['Liman/Gümrük', 'port_customs', 'Liman/Gümrük', 'Port/Customs', '港口/海关', 'Порт/Таможня', 'Puerto/Aduana'],
  ['Teslim', 'delivery', 'Teslim', 'Delivery', '交付', 'Доставка', 'Entrega'],
  ['Liman Girişi Simüle Et (Test)', 'simulate_port_test', 'Liman Girişi Simüle Et (Test)', 'Simulate Port Entry (Test)', '模拟港口进入 (测试)', 'Имитация входа в порт (тест)', 'Simular Entrada a Puerto (Prueba)'],
  ['Teslimat Takibi', 'delivery_tracking', 'Teslimat Takibi', 'Delivery Tracking', '交付跟踪', 'Отслеживание доставки', 'Seguimiento de Entrega'],
  ['Planlanan:', 'planned', 'Planlanan:', 'Planned:', '计划：', 'Запланировано:', 'Planificado:'],
  ['Gecikme Bildir (1 Hakkınız Var)', 'report_delay', 'Gecikme Bildir (1 Hakkınız Var)', 'Report Delay (1 Attempt Left)', '报告延迟 (剩 1 次机会)', 'Сообщить о задержке (осталась 1 попытка)', 'Reportar Retraso (1 Intento Restante)'],
  ['Erteleme hakkı kullanıldı. Ek gecikme için support@pruvahub.com.', 'delay_used_info', 'Erteleme hakkı kullanıldı. Ek gecikme için support@pruvahub.com.', 'Delay allowed used. For extra delay, contact support@pruvahub.com.', '延迟权限已使用。如需额外延迟，请联系 support@pruvahub.com。', 'Использовано право на задержку. Для дополнительной задержки свяжитесь с support@pruvahub.com.', 'Permiso de retraso utilizado. Para retraso adicional, contacte a support@pruvahub.com.'],
  ['Seferden Çekil', 'withdraw_shipment', 'Seferden Çekil', 'Withdraw from Shipment', '退出运输', 'Отозвать из отправления', 'Retirarse del Envío'],
  ['Henüz tamamlanmış bir işiniz bulunmuyor.', 'no_completed_jobs', 'Henüz tamamlanmış bir işiniz bulunmuyor.', 'You have no completed jobs yet.', '您还没有完成的工作。', 'У вас еще нет завершенных работ.', 'Aún no tiene trabajos completados.'],
  ['Yük Sahibini Değerlendir', 'rate_loader', 'Yük Sahibini Değerlendir', 'Rate Shipper', '评价发货人', 'Оценить отправителя', 'Calificar Remitente'],
  ['Referans Ekle', 'add_reference', 'Referans Ekle', 'Add Reference', '添加参考', 'Добавить рекомендацию', 'Añadir Referencia'],
  ['Yeni Referans Ekle', 'add_new_reference', 'Yeni Referans Ekle', 'Add New Reference', '添加新参考', 'Добавить новую рекомендацию', 'Añadir Nueva Referencia'],
  ['son 3 ay içinde', 'within_last_3_months', 'son 3 ay içinde', 'within the last 3 months', '在过去3个月内', 'за последние 3 месяца', 'en los últimos 3 meses'],
  ['yaptığınız iş belgesi (irsaliye, sözleşme veya referans mektubu) yüklemeniz gerekmektedir.', 'upload_doc_required', 'yaptığınız iş belgesi (irsaliye, sözleşme veya referans mektubu) yüklemeniz gerekmektedir.', 'you must upload a business document (waybill, contract, or reference letter).', '您必须上传业务文件（运单、合同或参考信）。', 'вы должны загрузить бизнес-документ (накладную, контракт или рекомендательное письмо).', 'debe subir un documento comercial (hoja de ruta, contrato o carta de referencia).'],
  ['Firma Adı *', 'company_name', 'Firma Adı *', 'Company Name *', '公司名称 *', 'Название компании *', 'Nombre de la Compañía *'],
  ['Örn: Migros A.Ş.', 'company_example', 'Örn: Migros A.Ş.', 'e.g., Walmart Inc.', '例如：沃尔玛公司', 'Например: ООО Ромашка', 'Ej: Mercadona S.A.', true],
  ['Sektör *', 'sector_label', 'Sektör *', 'Sector *', '行业 *', 'Сектор *', 'Sector *'],
  ['Tekstil / Hazır Giyim', 'sector_textile', 'Tekstil / Hazır Giyim', 'Textile / Apparel', '纺织 / 服装', 'Текстиль / Одежда', 'Textil / Ropa'],
  ['Beyaz Eşya / Elektronik', 'sector_electronics', 'Beyaz Eşya / Elektronik', 'Electronics / Appliances', '电子 / 电器', 'Электроника / Бытовая техника', 'Electrónica / Electrodomésticos'],
  ['İnşaat / Yapı Malzemeleri', 'sector_construction', 'İnşaat / Yapı Malzemeleri', 'Construction / Building Materials', '建筑 / 建材', 'Строительство / Стройматериалы', 'Construcción / Materiales de Construcción'],
  ['Kimya / İlaç', 'sector_chemical', 'Kimya / İlaç', 'Chemical / Pharmaceutical', '化工 / 制药', 'Химия / Фармацевтика', 'Química / Farmacéutica'],
  ['Gıda / Tarım', 'sector_food', 'Gıda / Tarım', 'Food / Agriculture', '食品 / 农业', 'Продукты / Сельское хозяйство', 'Alimentación / Agricultura'],
  ['Diğer', 'sector_other', 'Diğer', 'Other', '其他', 'Другое', 'Otro'],
  ['İlişki Süresi *', 'relationship_duration', 'İlişki Süresi *', 'Relationship Duration *', '关系持续时间 *', 'Длительность отношений *', 'Duración de la Relación *'],
  ['Taşıma Türü *', 'transport_type_label', 'Taşıma Türü *', 'Transport Type *', '运输类型 *', 'Тип транспорта *', 'Tipo de Transporte *'],
  ['Soğuk Zincir Karayolu', 'transport_cold_chain', 'Soğuk Zincir Karayolu', 'Cold Chain Road', '冷链公路', 'Холодная цепь дорога', 'Carretera Cadena de Frío'],
  ['Belge yüklemek için tıklayın', 'click_to_upload', 'Belge yüklemek için tıklayın', 'Click to upload document', '点击上传文件', 'Нажмите, чтобы загрузить документ', 'Haga clic para subir documento'],
  ['Vazgeç', 'cancel_btn', 'Vazgeç', 'Cancel', '取消', 'Отмена', 'Cancelar'],
  ['Referansı Gönder', 'submit_reference', 'Referansı Gönder', 'Submit Reference', '提交参考', 'Отправить рекомендацию', 'Enviar Referencia'],
  ['Doğrulanmış Referanslar', 'verified_references', 'Doğrulanmış Referanslar', 'Verified References', '已验证参考', 'Проверенные рекомендации', 'Referencias Verificadas'],
  ['DOĞRULANDI', 'verified', 'DOĞRULANDI', 'VERIFIED', '已验证', 'ПРОВЕРЕНО', 'VERIFICADO'],
  ['Kaldır', 'remove_btn', 'Kaldır', 'Remove', '移除', 'Удалить', 'Eliminar'],
  ['Admin onayı bekleniyor', 'waiting_admin_approval', 'Admin onayı bekleniyor', 'Waiting for Admin Approval', '等待管理员批准', 'Ожидает одобрения администратора', 'Esperando Aprobación del Admin'],
  ['İnceleniyor', 'under_review_status', 'İnceleniyor', 'Under Review', '审核中', 'На рассмотрении', 'En Revisión'],
  ['Onay Bekleyen Referanslar', 'pending_references', 'Onay Bekleyen Referanslar', 'Pending References', '待批参考', 'Ожидающие рекомендации', 'Referencias Pendientes'],
  ['Reddedilen Referanslar', 'rejected_references', 'Reddedilen Referanslar', 'Rejected References', '拒绝的参考', 'Отклоненные рекомендации', 'Referencias Rechazadas'],
  ['Belge yetersiz veya geçersiz', 'doc_invalid', 'Belge yetersiz veya geçersiz', 'Document insufficient or invalid', '文件不足或无效', 'Документ недостаточен или недействителен', 'Documento insuficiente o inválido'],
  ['Sil', 'delete_btn', 'Sil', 'Delete', '删除', 'Удалить', 'Eliminar'],
  ['Henüz referans eklenmemiş.', 'no_references_yet', 'Henüz referans eklenmemiş.', 'No references added yet.', '尚未添加参考。', 'Рекомендации еще не добавлены.', 'Aún no se han añadido referencias.'],
  ['Referans ekleyerek tekliflerinizi güçlendirin. Doğrulanmış referanslar yükleyicilere güven verir.', 'add_ref_desc', 'Referans ekleyerek tekliflerinizi güçlendirin. Doğrulanmış referanslar yükleyicilere güven verir.', 'Strengthen your offers by adding references. Verified references give confidence to shippers.', '通过添加参考来加强您的报价。经验证的参考给发货人带来信心。', 'Усильте свои предложения, добавив рекомендации. Проверенные рекомендации внушают доверие отправителям.', 'Fortalezca sus ofertas añadiendo referencias. Las referencias verificadas dan confianza a los remitentes.'],
  ['Mevcut Üyelik:', 'current_membership', 'Mevcut Üyelik:', 'Current Membership:', '当前会员资格：', 'Текущая подписка:', 'Membresía Actual:'],
  ['Planı Değiştir (Premium ⇄ Standart)', 'change_plan_btn', 'Planı Değiştir (Premium ⇄ Standart)', 'Change Plan (Premium ⇄ Standard)', '更改计划 (高级 ⇄ 标准)', 'Изменить план (Премиум ⇄ Стандарт)', 'Cambiar Plan (Premium ⇄ Estándar)'],
  ['Tekliflerinizi yönetin, yeni yükler bulun ve kazancınızı artırın.', 'carrier_dash_subtitle', 'Tekliflerinizi yönetin, yeni yükler bulun ve kazancınızı artırın.', 'Manage your offers, find new freight, and increase your earnings.', '管理您的报价，寻找新货物，增加您的收入。', 'Управляйте предложениями, находите новые грузы и увеличивайте свои доходы.', 'Gestione sus ofertas, encuentre nueva carga y aumente sus ganancias.'],
  ['Aktif Şirket', 'active_company', 'Aktif Şirket', 'Active Company', '活跃公司', 'Активная компания', 'Compañía Activa'],
  ['Kazanılan İş', 'won_jobs', 'Kazanılan İş', 'Won Jobs', '赢得的工作', 'Выигранные работы', 'Trabajos Ganados'],
  ['Süper Taşıyıcı', 'super_carrier', 'Süper Taşıyıcı', 'Super Carrier', '超级承运人', 'Супер-перевозчик', 'Súper Transportista'],
  ['Statü Başarısı', 'status_success', 'Statü Başarısı', 'Status Success', '状态成功', 'Успех статуса', 'Éxito de Estado']
];

reps.forEach(rep => {
  const [trText, key, trTrans, enTrans, zhTrans, ruTrans, esTrans, isAttr, attrName] = rep;
  addTranslation('carrier_dash', key, trTrans, enTrans, zhTrans, ruTrans, esTrans);
  
  if (isAttr && attrName === 'title') {
    content = content.replaceAll(`title="${trText}"`, `data-i18n="[title]carrier_dash.${key}" title="${trText}"`);
  } else if (isAttr) {
    content = content.replaceAll(`placeholder="${trText}"`, `data-i18n="[placeholder]carrier_dash.${key}" placeholder="${trText}"`);
  } else {
    content = content.replaceAll(`>${trText}<`, ` data-i18n="carrier_dash.${key}">${trText}<`);
    content = content.replaceAll(`> ${trText} <`, ` data-i18n="carrier_dash.${key}"> ${trText} <`);
    content = content.replaceAll(`'${trText}'`, `'${trText}' /* i18n */`);
    
    if (!content.includes(`carrier_dash.${key}`)) {
        content = content.replaceAll(trText, `<span data-i18n="carrier_dash.${key}">${trText}</span>`);
    }
  }
});

// A few custom replaces
content = content.replace(
  /⚠️ Referans olarak göstereceğiniz firma ile <strong data-i18n="carrier_dash\.within_last_3_months">son 3 ay içinde<\/strong> <span data-i18n="carrier_dash\.upload_doc_required">yaptığınız iş belgesi \(irsaliye, sözleşme veya referans mektubu\) yüklemeniz gerekmektedir\.<\/span>/g,
  `⚠️ <span data-i18n="carrier_dash.ref_warning_prefix">Referans olarak göstereceğiniz firma ile</span> <strong data-i18n="carrier_dash.within_last_3_months">son 3 ay içinde</strong> <span data-i18n="carrier_dash.upload_doc_required">yaptığınız iş belgesi (irsaliye, sözleşme veya referans mektubu) yüklemeniz gerekmektedir.</span>`
);
addTranslation('carrier_dash', 'ref_warning_prefix', 'Referans olarak göstereceğiniz firma ile', 'With the company you will show as a reference,', '与您将作为参考的公司，', 'С компанией, которую вы укажете в качестве рекомендации,', 'Con la empresa que mostrará como referencia,');

content = content.replace(
  /📎 Belge Yükle \(Son 3 Ay İçi İrsaliye \/ Sözleşme \/ Referans Mektubu\) \*/g,
  `<span data-i18n="carrier_dash.upload_doc_label">📎 Belge Yükle (Son 3 Ay İçi İrsaliye / Sözleşme / Referans Mektubu) *</span>`
);
addTranslation('carrier_dash', 'upload_doc_label', '📎 Belge Yükle (Son 3 Ay İçi İrsaliye / Sözleşme / Referans Mektubu) *', '📎 Upload Document (Waybill / Contract / Reference Letter from last 3 months) *', '📎 上传文件 (过去 3 个月内的运单 / 合同 / 推荐信) *', '📎 Загрузить документ (Накладная / Договор / Рекомендательное письмо за последние 3 месяца) *', '📎 Subir Documento (Hoja de ruta / Contrato / Carta de referencia de los últimos 3 meses) *');

content = content.replace(
  /\$\{favoriteAds\.length\} ilan kaydedildi/g,
  `<span data-i18n="carrier_dash.ads_saved_count" data-i18n-options='{"count": \${favoriteAds.length}}'>\${favoriteAds.length} ilan kaydedildi</span>`
);
addTranslation('carrier_dash', 'ads_saved_count', '{{count}} ilan kaydedildi', '{{count}} ads saved', '已保存 {{count}} 个广告', 'Сохранено {{count}} объявлений', '{{count}} anuncios guardados');

fs.writeFileSync('carrierDashboard.js', content, 'utf8');

const outputDir = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain\\6b769998-3ef4-49ee-9fef-bcb683c78d24\\scratch';
fs.writeFileSync(path.join(outputDir, 'translations_carrierDashboard.json'), JSON.stringify({
  tr: trTranslations,
  en: enTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  es: esTranslations
}, null, 2), 'utf8');

console.log("carrierDashboard processed");
