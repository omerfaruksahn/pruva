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

let content = fs.readFileSync('loaderDashboard.js', 'utf8');

const reps = [
  ['+ Yeni İlan Oluştur', 'create_new_ad_btn', '+ Yeni İlan Oluştur', '+ Create New Ad', '+ 创建新广告', '+ Создать новое объявление', '+ Crear Nuevo Anuncio'],
  ['Henüz aktif bir ilanınız bulunmuyor.', 'no_active_ads', 'Henüz aktif bir ilanınız bulunmuyor.', 'You have no active ads yet.', '您还没有活跃的广告。', 'У вас еще нет активных объявлений.', 'Aún no tienes anuncios activos.'],
  ['İlk İlanınızı Verin', 'post_first_ad_btn', 'İlk İlanınızı Verin', 'Post Your First Ad', '发布您的第一个广告', 'Разместите свое первое объявление', 'Publica tu Primer Anuncio'],
  ['Gelen Teklifler', 'incoming_offers', 'Gelen Teklifler', 'Incoming Offers', '收到的报价', 'Входящие предложения', 'Ofertas Entrantes'],
  ['Henüz teklif gelmedi. İlanınız taşıyıcılar tarafından inceleniyor.', 'no_offers_yet', 'Henüz teklif gelmedi. İlanınız taşıyıcılar tarafından inceleniyor.', 'No offers yet. Your ad is being reviewed by carriers.', '暂无报价。您的广告正在被承运人审核。', 'Пока нет предложений. Ваше объявление рассматривается перевозчиками.', 'Aún no hay ofertas. Su anuncio está siendo revisado por los transportistas.'],
  ['Taşıyıcı Firma', 'carrier_company', 'Taşıyıcı Firma', 'Carrier Company', '承运公司', 'Транспортная компания', 'Compañía de Transporte'],
  ['Detaylı profil ve yorumları görmek için tıklayın', 'view_profile_title', 'Detaylı profil ve yorumları görmek için tıklayın', 'Click to view detailed profile and reviews', '点击查看详细资料和评论', 'Нажмите, чтобы просмотреть подробный профиль и отзывы', 'Haga clic para ver el perfil detallado y las reseñas', true, 'title'],
  ['Tüm Referanslar:', 'all_references_title', 'Tüm Referanslar:', 'All References:', '所有参考：', 'Все рекомендации:', 'Todas las Referencias:'],
  ['daha', 'more_refs', 'daha', 'more', '更多', 'еще', 'más'],
  ['Yeni Üye / Belgesiz', 'new_member', 'Yeni Üye / Belgesiz', 'New Member / Undocumented', '新会员 / 无记录', 'Новый участник / Без документов', 'Nuevo Miembro / Indocumentado'],
  ['Teklif Tutarı', 'offer_amount', 'Teklif Tutarı', 'Offer Amount', '报价金额', 'Сумма предложения', 'Monto de la Oferta'],
  ['Sefer Tipi', 'route_type', 'Sefer Tipi', 'Route Type', '路线类型', 'Тип маршрута', 'Tipo de Ruta'],
  ['Direkt', 'direct', 'Direkt', 'Direct', '直达', 'Прямой', 'Directo'],
  ['Transit', 'transit', 'Transit', 'Transit', '中转', 'Транзит', 'Tránsito'],
  ['Geçerlilik', 'validity', 'Geçerlilik', 'Validity', '有效期', 'Действительность', 'Validez'],
  ['Mesaj', 'message_btn', 'Mesaj', 'Message', '消息', 'Сообщение', 'Mensaje'],
  ['Onayla', 'accept_btn', 'Onayla', 'Accept', '接受', 'Принять', 'Aceptar'],
  ['İlanı Yayından Kaldır', 'unpublish_ad_btn', 'İlanı Yayından Kaldır', 'Unpublish Ad', '取消发布广告', 'Снять объявление с публикации', 'Anular publicación del anuncio'],
  ['Henüz devam eden bir sevkiyatınız bulunmuyor.', 'no_ongoing_shipments', 'Henüz devam eden bir sevkiyatınız bulunmuyor.', 'You have no ongoing shipments yet.', '您还没有进行中的运输。', 'У вас еще нет текущих отправлений.', 'Aún no tienes envíos en curso.'],
  ['Taşıyıcı:', 'carrier_label', 'Taşıyıcı:', 'Carrier:', '承运人：', 'Перевозчик:', 'Transportista:'],
  ['Operasyon Başladı', 'operation_started', 'Operasyon Başladı', 'Operation Started', '操作开始', 'Операция началась', 'Operación Iniciada'],
  ['İşlem Tarihi', 'transaction_date', 'İşlem Tarihi', 'Transaction Date', '交易日期', 'Дата транзакции', 'Fecha de Transacción'],
  ['Bugün', 'today', 'Bugün', 'Today', '今天', 'Сегодня', 'Hoy'],
  ['Taşıyıcı İletişim', 'carrier_contact', 'Taşıyıcı İletişim', 'Carrier Contact', '承运人联系', 'Контакты перевозчика', 'Contacto del Transportista'],
  ['E-posta:', 'email_label', 'E-posta:', 'Email:', '电子邮件：', 'Эл. почта:', 'Correo Electrónico:'],
  ['Telefon:', 'phone_label', 'Telefon:', 'Phone:', '电话：', 'Телефон:', 'Teléfono:'],
  ['Mesajlara Git', 'go_to_messages_btn', 'Mesajlara Git', 'Go to Messages', '转到消息', 'Перейти к сообщениям', 'Ir a los Mensajes'],
  ['Sevkiyat Evrakları', 'shipping_docs', 'Sevkiyat Evrakları', 'Shipping Documents', '运输文件', 'Транспортные документы', 'Documentos de Envío'],
  ['CMR Bekleniyor', 'cmr_pending', 'CMR Bekleniyor', 'CMR Pending', 'CMR 待处理', 'Ожидается CMR', 'CMR Pendiente'],
  ['Fatura', 'invoice', 'Fatura', 'Invoice', '发票', 'Счет-фактура', 'Factura'],
  ['Evrak Yükle', 'upload_doc_btn', 'Evrak Yükle', 'Upload Doc', '上传文件', 'Загрузить док.', 'Subir Documento'],
  ['Araç Gelmedi mi?', 'truck_not_arrived', 'Araç Gelmedi mi?', 'Truck Not Arrived?', '卡车没来？', 'Грузовик не прибыл?', '¿El camión no llegó?'],
  ['Taşıyıcı iptal ettiyse ilanı tekrar diğer tekliflere açabilirsiniz.', 'reopen_ad_desc', 'Taşıyıcı iptal ettiyse ilanı tekrar diğer tekliflere açabilirsiniz.', 'If the carrier cancelled, you can reopen the ad to other offers.', '如果承运人取消，您可以向其他报价重新开放广告。', 'Если перевозчик отменил, вы можете снова открыть объявление для других предложений.', 'Si el transportista canceló, puede reabrir el anuncio a otras ofertas.'],
  ['İlanı Tekrar Aç', 'reopen_ad_btn', 'İlanı Tekrar Aç', 'Reopen Ad', '重新开放广告', 'Повторно открыть объявление', 'Reabrir Anuncio'],
  ['Sevkiyatı İptal Etmek mi İstiyorsunuz?', 'cancel_shipment_q', 'Sevkiyatı İptal Etmek mi İstiyorsunuz?', 'Do you want to cancel the shipment?', '您想取消运输吗？', 'Хотите отменить отправку?', '¿Desea cancelar el envío?'],
  ['Tek taraflı iptal etmek taşıyıcıyı mağdur eder ve profilinizden -0.3 puan düşülmesine sebep olur.', 'cancel_warning', 'Tek taraflı iptal etmek taşıyıcıyı mağdur eder ve profilinizden -0.3 puan düşülmesine sebep olur.', 'Unilateral cancellation victimizes the carrier and causes a -0.3 point deduction from your profile.', '单方面取消会使承运人受害，并导致您的资料被扣除 -0.3 分。', 'Односторонняя отмена вредит перевозчику и приводит к вычету -0.3 балла из вашего профиля.', 'La cancelación unilateral perjudica al transportista y causa una deducción de -0.3 puntos de su perfil.'],
  ['Sevkiyatı İptal Et', 'cancel_shipment_btn', 'Sevkiyatı İptal Et', 'Cancel Shipment', '取消运输', 'Отменить отправку', 'Cancelar Envío'],
  ['İşlem Tamamlandı mı?', 'process_completed_q', 'İşlem Tamamlandı mı?', 'Process Completed?', '处理完成？', 'Процесс завершен?', '¿Proceso Completado?'],
  ['Teslim tarihinin üzerinden çok zaman geçti. İlanı aktif ekranınızdan kaldırabilirsiniz.', 'archive_desc', 'Teslim tarihinin üzerinden çok zaman geçti. İlanı aktif ekranınızdan kaldırabilirsiniz.', 'A lot of time has passed since the delivery date. You can remove the ad from your active screen.', '交货日期已过很久。您可以从活动屏幕中删除该广告。', 'С даты доставки прошло много времени. Вы можете убрать объявление с активного экрана.', 'Ha pasado mucho tiempo desde la fecha de entrega. Puede eliminar el anuncio de su pantalla activa.'],
  ['Süreci Kapat / Arşive Kaldır', 'archive_btn', 'Süreci Kapat / Arşive Kaldır', 'Close Process / Archive', '关闭流程/存档', 'Закрыть процесс / В архив', 'Cerrar Proceso / Archivar'],
  ['Operasyon Geçmişi', 'operation_history', 'Operasyon Geçmişi', 'Operation History', '操作历史记录', 'История операций', 'Historial de Operaciones'],
  ['Teslim Edildi', 'delivered', 'Teslim Edildi', 'Delivered', '已交付', 'Доставлено', 'Entregado'],
  ['Lojistik operasyonu tamamlandı. Deneyiminizi nasıl değerlendirirsiniz?', 'review_prompt', 'Lojistik operasyonu tamamlandı. Deneyiminizi nasıl değerlendirirsiniz?', 'Logistics operation completed. How would you rate your experience?', '物流操作完成。您如何评价您的体验？', 'Логистическая операция завершена. Как вы оцениваете свой опыт?', 'Operación logística completada. ¿Cómo calificaría su experiencia?'],
  ['⭐ Taşıyıcıyı Değerlendir', 'rate_carrier_btn', '⭐ Taşıyıcıyı Değerlendir', '⭐ Rate Carrier', '⭐ 评价承运人', '⭐ Оценить перевозчика', '⭐ Calificar Transportista'],
  ['Bilinmeyen Taşıyıcı', 'unknown_carrier', 'Bilinmeyen Taşıyıcı', 'Unknown Carrier', '未知承运人', 'Неизвестный перевозчик', 'Transportista Desconocido'],
  ['Henüz tamamlanmış bir sevkiyatınız bulunmuyor.', 'no_completed_shipments', 'Henüz tamamlanmış bir sevkiyatınız bulunmuyor.', 'You have no completed shipments yet.', '您还没有完成的运输。', 'У вас еще нет завершенных отправлений.', 'Aún no tienes envíos completados.'],
  ['Puanlandı', 'rated', 'Puanlandı', 'Rated', '已评分', 'Оценено', 'Calificado'],
  ['Değerlendir', 'rate_btn', 'Değerlendir', 'Rate', '评分', 'Оценить', 'Calificar'],
  ['Teslimat Onayı Bekleniyor', 'delivery_confirm_pending', 'Teslimat Onayı Bekleniyor', 'Delivery Confirmation Pending', '待确认交付', 'Ожидается подтверждение доставки', 'Confirmación de Entrega Pendiente'],
  ['parkuru için taşıyıcı teslimatın tamamlandığını bildirdi.', 'delivery_reported_1', 'parkuru için taşıyıcı teslimatın tamamlandığını bildirdi.', 'route, the carrier reported the delivery is completed.', '路线，承运人报告交付已完成。', 'маршрут, перевозчик сообщил о завершении доставки.', 'ruta, el transportista informó que la entrega se ha completado.'],
  ['İşlemi bitirmek ve değerlendirme yapmak için lütfen onay verin.', 'delivery_reported_2', 'İşlemi bitirmek ve değerlendirme yapmak için lütfen onay verin.', 'Please confirm to finish the process and give a rating.', '请确认以完成流程并进行评分。', 'Пожалуйста, подтвердите, чтобы завершить процесс и оставить отзыв.', 'Por favor confirme para finalizar el proceso y dejar una calificación.'],
  ['Teslimatı Onayla ve Bitir', 'confirm_delivery_btn', 'Teslimatı Onayla ve Bitir', 'Confirm Delivery and Finish', '确认交付并完成', 'Подтвердить доставку и завершить', 'Confirmar Entrega y Finalizar'],
  ['Taşıyıcıyla Konuş', 'talk_to_carrier_btn', 'Taşıyıcıyla Konuş', 'Talk to Carrier', '与承运人交谈', 'Поговорить с перевозчиком', 'Hablar con Transportista'],
  ['Sorun Bildir', 'report_issue_btn', 'Sorun Bildir', 'Report Issue', '报告问题', 'Сообщить о проблеме', 'Reportar Problema'],
  ['Sevkiyatlarınızı izleyin, teklifleri yönetin ve operasyonunuzu hızlandırın.', 'dash_subtitle', 'Sevkiyatlarınızı izleyin, teklifleri yönetin ve operasyonunuzu hızlandırın.', 'Monitor your shipments, manage offers, and speed up your operation.', '监控您的运输，管理报价，并加快您的操作。', 'Отслеживайте свои отправления, управляйте предложениями и ускоряйте свои операции.', 'Monitoree sus envíos, gestione ofertas y acelere su operación.'],
  ['Hoş Geldiniz', 'welcome', 'Hoş Geldiniz', 'Welcome', '欢迎', 'Добро пожаловать', 'Bienvenido'],
  ['Aktif İlan', 'active_ad', 'Aktif İlan', 'Active Ad', '活跃广告', 'Активное объявление', 'Anuncio Activo'],
  ['Bekleyen Teklif', 'pending_offer', 'Bekleyen Teklif', 'Pending Offer', '待处理报价', 'Ожидающее предложение', 'Oferta Pendiente'],
  ['Yoldaki Yükler', 'freight_on_way', 'Yoldaki Yükler', 'Freight on the Way', '在途货物', 'Грузы в пути', 'Carga en Camino']
];

reps.forEach(rep => {
  const [trText, key, trTrans, enTrans, zhTrans, ruTrans, esTrans, isAttr, attrName] = rep;
  addTranslation('loader_dash', key, trTrans, enTrans, zhTrans, ruTrans, esTrans);
  
  if (isAttr && attrName === 'title') {
    content = content.replaceAll(`title="${trText}"`, `data-i18n="[title]loader_dash.${key}" title="${trText}"`);
  } else {
    content = content.replaceAll(`>${trText}<`, ` data-i18n="loader_dash.${key}">${trText}<`);
    content = content.replaceAll(`> ${trText} <`, ` data-i18n="loader_dash.${key}"> ${trText} <`);
    // string literals in JS
    content = content.replaceAll(`'${trText}'`, `'${trText}' /* i18n */`);
    
    // Partial matches
    if (!content.includes(`loader_dash.${key}`)) {
        content = content.replaceAll(trText, `<span data-i18n="loader_dash.${key}">${trText}</span>`);
    }
  }
});

// Specific ref replacements
content = content.replace(
  /Tüm Referanslar: \$\{verifiedRefs.map\(r => r.companyName\).join\(\', \'\)\}/g,
  `<span data-i18n="[title]loader_dash.all_references_title">Tüm Referanslar:</span> \${verifiedRefs.map(r => r.companyName).join(', ')}`
);

fs.writeFileSync('loaderDashboard.js', content, 'utf8');

const outputDir = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain\\6b769998-3ef4-49ee-9fef-bcb683c78d24\\scratch';
fs.writeFileSync(path.join(outputDir, 'translations_loaderDashboard.json'), JSON.stringify({
  tr: trTranslations,
  en: enTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  es: esTranslations
}, null, 2), 'utf8');

console.log("loaderDashboard processed");
