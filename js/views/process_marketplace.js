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

let content = fs.readFileSync('marketplace.js', 'utf8');

const reps = [
  ['Önceki', 'prev', 'Önceki', 'Previous', '上一页', 'Предыдущая', 'Anterior'],
  ['Sonraki', 'next', 'Sonraki', 'Next', '下一页', 'Следующая', 'Siguiente'],
  ['Pazaryeri Akışı', 'title', 'Pazaryeri Akışı', 'Marketplace Feed', '市场动态', 'Лента маркетплейса', 'Flujo del Mercado'],
  ['aktif ilan bulundu', 'active_ads_found', 'aktif ilan bulundu', 'active ads found', '找到活跃广告', 'найдено активных объявлений', 'anuncios activos encontrados', 'span'],
  ['Filtreleri Göster / Gizle', 'toggle_filters', 'Filtreleri Göster / Gizle', 'Show / Hide Filters', '显示 / 隐藏过滤器', 'Показать / Скрыть фильтры', 'Mostrar / Ocultar Filtros'],
  ['Çıkış Noktası', 'origin_label', 'Çıkış Noktası', 'Origin', '起运地', 'Пункт отправления', 'Origen'],
  ['Şehir / Liman', 'city_port_placeholder', 'Şehir / Liman', 'City / Port', '城市 / 港口', 'Город / Порт', 'Ciudad / Puerto', true],
  ['Varış Noktası', 'destination_label', 'Varış Noktası', 'Destination', '目的地', 'Пункт назначения', 'Destino'],
  ['İlan No Sorgula', 'ad_id_label', 'İlan No Sorgula', 'Search Ad No', '搜索广告编号', 'Поиск по номеру объявления', 'Buscar Nro de Anuncio'],
  ['Filtrele', 'filter_btn', 'Filtrele', 'Filter', '过滤', 'Фильтровать', 'Filtrar'],
  ['Deniz', 'transport_sea', 'Deniz', 'Sea', '海运', 'Морской', 'Marítimo'],
  ['Kara', 'transport_land', 'Kara', 'Land', '陆运', 'Наземный', 'Terrestre'],
  ['Hava', 'transport_air', 'Hava', 'Air', '空运', 'Авиа', 'Aéreo'],
  ['Parsiyel', 'cargo_partial', 'Parsiyel', 'LTL', '拼箱', 'Сборный', 'Carga Parcial'],
  ['Konteyner', 'cargo_container', 'Konteyner', 'Container', '整箱', 'Контейнер', 'Contenedor'],
  ['Komple Tır', 'cargo_full', 'Komple Tır', 'FTL', '整车', 'Полная фура', 'Camión Completo'],
  ['Premium Üyelik Gerektirir', 'premium_required', 'Premium Üyelik Gerektirir', 'Premium Membership Required', '需要高级会员', 'Требуется премиум-подписка', 'Se Requiere Membresía Premium', true, 'title'],
  ['Acil İlanlar', 'urgent_ads', 'Acil İlanlar', 'Urgent Ads', '紧急广告', 'Срочные объявления', 'Anuncios Urgentes'],
  ['Onaylı Yükleyiciler', 'verified_loaders', 'Onaylı Yükleyiciler', 'Verified Shippers', '已认证发货人', 'Проверенные грузоотправители', 'Remitentes Verificados'],
  ['Filtreleri Temizle', 'clear_filters', 'Filtreleri Temizle', 'Clear Filters', '清除过滤器', 'Очистить фильтры', 'Borrar Filtros'],
  ['Bekliyor', 'status_pending', 'Bekliyor', 'Pending', '待处理', 'В ожидании', 'Pendiente'],
  ['Onaylandı', 'status_accepted', 'Onaylandı', 'Accepted', '已接受', 'Принято', 'Aceptado'],
  ['Teklif Var', 'status_bidded', 'Teklif Var', 'Bidded', '已有报价', 'Есть ставки', 'Con Ofertas'],
  ['İlanın yayında kalacağı süre', 'ad_duration_title', 'İlanın yayında kalacağı süre', 'Ad duration', '广告持续时间', 'Продолжительность объявления', 'Duración del anuncio', true, 'title'],
  ['İlanı Paylaş', 'share_ad_title', 'İlanı Paylaş', 'Share Ad', '分享广告', 'Поделиться объявлением', 'Compartir Anuncio', true, 'title'],
  ['Kaydı Kaldır', 'remove_favorite', 'Kaydı Kaldır', 'Remove Favorite', '取消收藏', 'Удалить из избранного', 'Quitar Favorito', true, 'title'],
  ['İlanı Kaydet', 'save_ad_title', 'İlanı Kaydet', 'Save Ad', '保存广告', 'Сохранить объявление', 'Guardar Anuncio', true, 'title'],
  ['Gizlilik Notu:', 'privacy_note', 'Gizlilik Notu:', 'Privacy Note:', '隐私提示：', 'Примечание о конфиденциальности:', 'Nota de Privacidad:'],
  ['Diğer yükleyicilerin ilan detayları ve teklifleri güvenliğiniz için gizlenmiştir. Kendi ilanlarınızın detaylarını', 'privacy_desc_1', 'Diğer yükleyicilerin ilan detayları ve teklifleri güvenliğiniz için gizlenmiştir. Kendi ilanlarınızın detaylarını', 'Details of other shippers are hidden for security. View your own ad details in the', '出于安全考虑，隐藏了其他发货人的详细信息和报价。您可以在', 'Для вашей безопасности детали объявлений других отправителей скрыты. Свои объявления можно посмотреть на странице', 'Los detalles de otros remitentes están ocultos por seguridad. Puede ver los detalles de sus anuncios en'],
  ['Panelim', 'my_panel', 'Panelim', 'My Dashboard', '我的仪表板', 'Моя панель', 'Mi Panel'],
  ['sayfasından görebilirsiniz.', 'privacy_desc_2', 'sayfasından görebilirsiniz.', 'page.', '页面查看。', '.', 'página.'],
  ['Yük Sevkiyat İlanı', 'default_ad_title', 'Yük Sevkiyat İlanı', 'Freight Shipment Ad', '货物运输广告', 'Объявление о перевозке груза', 'Anuncio de Envío de Carga'],
  ['Belirtilmedi', 'not_specified', 'Belirtilmedi', 'Not Specified', '未指定', 'Не указано', 'No Especificado'],
  ['Malın Cinsi:', 'goods_type_label', 'Malın Cinsi:', 'Type of Goods:', '货物种类：', 'Вид товара:', 'Tipo de Mercancía:'],
  ['Kategori:', 'category_label', 'Kategori:', 'Category:', '分类：', 'Категория:', 'Categoría:'],
  ['Genel Kargo', 'general_cargo', 'Genel Kargo', 'General Cargo', '普通货物', 'Генеральный груз', 'Carga General'],
  ['Yük Detayları:', 'cargo_details_label', 'Yük Detayları:', 'Cargo Details:', '货物详情：', 'Детали груза:', 'Detalles de Carga:'],
  ['Adet', 'qty', 'Adet', 'Pieces', '件', 'шт.', 'Piezas'],
  ['Ağırlık:', 'weight_label', 'Ağırlık:', 'Weight:', '重量：', 'Вес:', 'Peso:'],
  ['Toplam Hacim:', 'total_volume_label', 'Toplam Hacim:', 'Total Volume:', '总体积：', 'Общий объем:', 'Volumen Total:'],
  ['Hacim:', 'volume_label', 'Hacim:', 'Volume:', '体积：', 'Объем:', 'Volumen:'],
  ['İstifleme:', 'stacking_label', 'İstifleme:', 'Stacking:', '堆叠：', 'Штабелирование:', 'Apilamiento:'],
  ['İstiflenebilir', 'stackable', 'İstiflenebilir', 'Stackable', '可堆叠', 'Штабелируемый', 'Apilable'],
  ['İstiflenemez', 'not_stackable', 'İstiflenemez', 'Not Stackable', '不可堆叠', 'Не штабелируемый', 'No Apilable'],
  ['Yükleme Tarihi:', 'deadline_label', 'Yükleme Tarihi:', 'Loading Date:', '装货日期：', 'Дата загрузки:', 'Fecha de Carga:'],
  ['Açıklama ve Sevkiyat Notları', 'notes_label', 'Açıklama ve Sevkiyat Notları', 'Description & Shipping Notes', '说明和运输注意事项', 'Описание и примечания к отправке', 'Descripción y Notas de Envío'],
  ['Yük Fotoğrafları:', 'photos_label', 'Yük Fotoğrafları:', 'Cargo Photos:', '货物照片：', 'Фотографии груза:', 'Fotos de la Carga:'],
  ['Teklif verebilmek için', 'premium_desc_1', 'Teklif verebilmek için', 'To make an offer, a', '如需报价，需要', 'Чтобы сделать предложение, требуется', 'Para hacer una oferta, se requiere'],
  ['Profesyonel Üyelik', 'professional_membership', 'Profesyonel Üyelik', 'Professional Membership', '专业会员资格', 'Профессиональное членство', 'Membresía Profesional'],
  ['gereklidir.', 'premium_desc_2', 'gereklidir.', 'is required.', '。', '.', '.'],
  ['Teklif Ver / Detaylar', 'offer_btn', 'Teklif Ver / Detaylar', 'Make Offer / Details', '报价 / 详情', 'Сделать предложение / Детали', 'Hacer Oferta / Detalles'],
  ['Kapat', 'close_btn', 'Kapat', 'Close', '关闭', 'Закрыть', 'Cerrar'],
  ['İlanı Spam/Sahte Olarak Şikayet Et', 'report_title', 'İlanı Spam/Sahte Olarak Şikayet Et', 'Report Ad as Spam/Fake', '举报广告为垃圾/虚假', 'Пожаловаться на объявление как на спам/фейк', 'Reportar Anuncio como Spam/Falso', true, 'title'],
  ['Spam Bildir', 'report_btn', 'Spam Bildir', 'Report Spam', '举报垃圾信息', 'Сообщить о спаме', 'Reportar Spam']
];

reps.forEach(rep => {
  const [trText, key, trTrans, enTrans, zhTrans, ruTrans, esTrans, isAttr, attrName] = rep;
  addTranslation('marketplace', key, trTrans, enTrans, zhTrans, ruTrans, esTrans);
  
  if (isAttr && attrName === 'title') {
    content = content.replaceAll(`title="${trText}"`, `data-i18n="[title]marketplace.${key}" title="${trText}"`);
    content = content.replaceAll(`title="\${activeSub !== 'premium' ? '${trText}' : ''}"`, `data-i18n="[title]marketplace.${key}" title="\${activeSub !== 'premium' ? '${trText}' : ''}"`);
    content = content.replaceAll(`title="\${isFavorite ? 'Kaydı Kaldır' : 'İlanı Kaydet'}"`, `data-i18n="[title]marketplace.\${isFavorite ? 'remove_favorite' : 'save_ad_title'}" title="\${isFavorite ? 'Kaydı Kaldır' : 'İlanı Kaydet'}"`);
  } else if (isAttr) { // Placeholder
    content = content.replaceAll(`placeholder="${trText}"`, `data-i18n="[placeholder]marketplace.${key}" placeholder="${trText}"`);
  } else {
    // some exact matches
    if(key === 'active_ads_found') {
        content = content.replaceAll(`aktif ilan bulundu`, `<span data-i18n="marketplace.${key}">aktif ilan bulundu</span>`);
    } else if (key === 'ad_duration_title' || key === 'share_ad_title' || key === 'save_ad_title' || key === 'remove_favorite' || key === 'report_title' || key === 'premium_required') {
        // already handled by title
    } else {
        content = content.replaceAll(`>${trText}<`, ` data-i18n="marketplace.${key}">${trText}<`);
        content = content.replaceAll(`> ${trText} <`, ` data-i18n="marketplace.${key}"> ${trText} <`);
        // for ternary or literal inside string
        content = content.replaceAll(`'${trText}'`, `'${trText}' /* i18n-handled-dynamically-or-not */`);
        if (!content.includes(`marketplace.${key}`)) {
            content = content.replaceAll(trText, `<span data-i18n="marketplace.${key}">${trText}</span>`);
        }
    }
  }
});

// Handling pagination info specifically
content = content.replace(
  /\$\{filteredAds\.length\} ilandan \$\{startIdx \+ 1\}–\$\{Math\.min\(startIdx \+ perPage\, filteredAds\.length\)\} arası gösteriliyor/g,
  `<span data-i18n="marketplace.pagination_info" data-i18n-options='{"total": \${filteredAds.length}, "start": \${startIdx + 1}, "end": \${Math.min(startIdx + perPage, filteredAds.length)}}'>\${filteredAds.length} ilandan \${startIdx + 1}–\${Math.min(startIdx + perPage, filteredAds.length)} arası gösteriliyor</span>`
);
addTranslation('marketplace', 'pagination_info', '{{total}} ilandan {{start}}–{{end}} arası gösteriliyor', 'Showing {{start}}–{{end}} of {{total}} ads', '显示 {{total}} 个广告中的 {{start}}–{{end}} 个', 'Показано {{start}}–{{end}} из {{total}} объявлений', 'Mostrando {{start}}–{{end}} de {{total}} anuncios');

fs.writeFileSync('marketplace.js', content, 'utf8');

const outputDir = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain\\6b769998-3ef4-49ee-9fef-bcb683c78d24\\scratch';
fs.writeFileSync(path.join(outputDir, 'translations_marketplace.json'), JSON.stringify({
  tr: trTranslations,
  en: enTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  es: esTranslations
}, null, 2), 'utf8');

console.log("marketplace processed");
