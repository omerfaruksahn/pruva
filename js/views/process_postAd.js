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

let postAdContent = fs.readFileSync('postAd.js', 'utf8');

const postAdReps = [
  ['İlan Başlığı', 'title_label', 'İlan Başlığı', 'Ad Title', '广告标题', 'Заголовок объявления', 'Título del Anuncio'],
  ['Örn: Tekstil Ürünleri İhracatı', 'title_placeholder', 'Örn: Tekstil Ürünleri İhracatı', 'e.g., Textile Products Export', '例如：纺织品出口', 'Например: Экспорт текстиля', 'Ej: Exportación de Textiles', true],
  ['Seçiniz...', 'select_prompt', 'Seçiniz...', 'Select...', '请选择...', 'Выберите...', 'Seleccione...'],
  ['Çıkış Noktası', 'origin_label', 'Çıkış Noktası', 'Origin', '起运地', 'Пункт отправления', 'Origen'],
  ['Şehir / Liman', 'city_port_placeholder', 'Şehir / Liman', 'City / Port', '城市 / 港口', 'Город / Порт', 'Ciudad / Puerto', true],
  ['Varış Noktası', 'destination_label', 'Varış Noktası', 'Destination', '目的地', 'Пункт назначения', 'Destino'],
  ['+ Yeni Yük Ekle', 'add_cargo_btn', '+ Yeni Yük Ekle', '+ Add New Cargo', '+ 添加新货物', '+ Добавить груз', '+ Añadir Carga'],
  ['Yük Tipi', 'cargo_type_label', 'Yük Tipi', 'Cargo Type', '货物类型', 'Тип груза', 'Tipo de Carga'],
  ['Parsiyel (Koli/Palet)', 'cargo_partial', 'Parsiyel (Koli/Palet)', 'LTL (Box/Pallet)', '拼箱 (纸箱/托盘)', 'Сборный груз (Коробка/Паллет)', 'Carga Parcial (Caja/Palet)'],
  ['Konteyner', 'cargo_container', 'Konteyner', 'Container (FCL)', '整箱', 'Контейнер', 'Contenedor'],
  ['Komple Tır', 'cargo_full', 'Komple Tır', 'Full Truck Load (FTL)', '整车', 'Полная фура', 'Camión Completo'],
  ['Malın Cinsi', 'goods_type_label', 'Malın Cinsi', 'Type of Goods', '货物种类', 'Вид товара', 'Tipo de Mercancía'],
  ['Seçiniz veya yazınız...', 'goods_placeholder', 'Seçiniz veya yazınız...', 'Select or type...', '请选择或输入...', 'Выберите или введите...', 'Seleccione o escriba...', true],
  ['En (cm)', 'width_label', 'En (cm)', 'Width (cm)', '宽度 (cm)', 'Ширина (см)', 'Ancho (cm)'],
  ['Boy (cm)', 'length_label', 'Boy (cm)', 'Length (cm)', '长度 (cm)', 'Длина (см)', 'Largo (cm)'],
  ['Yük. (cm)', 'height_label', 'Yük. (cm)', 'Height (cm)', '高度 (cm)', 'Высота (см)', 'Alto (cm)'],
  ['Adet', 'qty_label', 'Adet', 'Qty', '数量', 'Кол-во', 'Cant.'],
  ['Fotoğraflar', 'photos_label', 'Fotoğraflar', 'Photos', '照片', 'Фотографии', 'Fotos'],
  ['(Max 4 Foto)', 'photos_max', '(Max 4 Foto)', '(Max 4 Photos)', '(最多 4 张)', '(Макс 4 фото)', '(Máx 4 Fotos)'],
  ['Yükler İstiflenebilir', 'stackable_label', 'Yükler İstiflenebilir', 'Stackable Cargo', '可堆叠货物', 'Штабелируемый груз', 'Carga Apilable'],
  ['Taşıma Modu', 'transport_mode_label', 'Taşıma Modu', 'Transport Mode', '运输方式', 'Режим транспорта', 'Modo de Transporte'],
  ['Deniz', 'transport_sea', 'Deniz', 'Sea', '海运', 'Морской', 'Marítimo'],
  ['Kara', 'transport_land', 'Kara', 'Land', '陆运', 'Наземный', 'Terrestre'],
  ['Hava', 'transport_air', 'Hava', 'Air', '空运', 'Авиа', 'Aéreo'],
  ['İlan Süresi', 'duration_label', 'İlan Süresi', 'Duration', '发布时长', 'Длительность', 'Duración'],
  ['24 Saat (Acil)', 'duration_24h', '24 Saat (Acil)', '24 Hours (Urgent)', '24小时 (紧急)', '24 часа (Срочно)', '24 Horas (Urgente)'],
  ['48 Saat', 'duration_48h', '48 Saat', '48 Hours', '48小时', '48 часов', '48 Horas'],
  ['72 Saat (Standart)', 'duration_72h', '72 Saat (Standart)', '72 Hours (Standard)', '72小时 (标准)', '72 часа (Стандарт)', '72 Horas (Estándar)'],
  ['1 Hafta', 'duration_1w', '1 Hafta', '1 Week', '1周', '1 неделя', '1 Semana'],
  ['Yükleme Tarihi', 'deadline_label', 'Yükleme Tarihi', 'Loading Date', '装货日期', 'Дата загрузки', 'Fecha de Carga'],
  ['Taşıma ile ilgili belirtmek istediğiniz diğer detaylar...', 'notes_placeholder', 'Taşıma ile ilgili belirtmek istediğiniz diğer detaylar...', 'Any other details regarding the transport...', '关于运输的任何其他详细信息...', 'Любые другие детали о транспортировке...', 'Cualquier otro detalle sobre el transporte...', true]
];

postAdReps.forEach(rep => {
  const [trText, key, trTrans, enTrans, zhTrans, ruTrans, esTrans, isPlaceholder] = rep;
  addTranslation('post_ad', key, trTrans, enTrans, zhTrans, ruTrans, esTrans);
  
  if (isPlaceholder) {
    postAdContent = postAdContent.replaceAll(`placeholder="${trText}"`, `data-i18n="[placeholder]post_ad.${key}" placeholder="${trText}"`);
  } else {
    // We want to replace inside tags, so let's match >trText< or something similar
    // Actually just string replace if it's unique
    // Need to avoid replacing text in JS logic. Most of these are plain text.
    if(key === 'photos_max') {
        postAdContent = postAdContent.replaceAll(`(Max 4 Foto)`, `<span data-i18n="post_ad.photos_max">(Max 4 Foto)</span>`);
    } else {
        postAdContent = postAdContent.replaceAll(`>${trText}<`, ` data-i18n="post_ad.${key}">${trText}<`);
        postAdContent = postAdContent.replaceAll(`> ${trText} <`, ` data-i18n="post_ad.${key}"> ${trText} <`);
        if (!postAdContent.includes(`post_ad.${key}`)) {
            // fallback
            postAdContent = postAdContent.replaceAll(trText, `<span data-i18n="post_ad.${key}">${trText}</span>`);
        }
    }
  }
});

fs.writeFileSync('postAd.js', postAdContent, 'utf8');

const outputDir = 'C:\\Users\\Ömer\\.gemini\\antigravity\\brain\\6b769998-3ef4-49ee-9fef-bcb683c78d24\\scratch';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'translations_postAd.json'), JSON.stringify({
  tr: trTranslations,
  en: enTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  es: esTranslations
}, null, 2), 'utf8');

console.log("postAd processed");
