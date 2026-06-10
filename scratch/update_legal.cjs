const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';

const legalTranslations = {
    tr: {
        "legal": {
            "title": "Yasal Metinler",
            "btn_understood": "Okudum, Anladım",
            "kvkk_title": "KVKK Aydınlatma Metni",
            "term_title": "Kullanıcı Sözleşmesi",
            "kvkk_content": `<h4>1. Veri Sorumlusu</h4>
                <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Pruva Lojistik Platformu ("Platform") olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan kapsamda işleyeceğiz.</p>
                <h4>2. Kişisel Verilerin İşlenme Amacı</h4>
                <p>Platform üzerinden toplanan şirket unvanı, VKN, kurumsal e-posta ve operasyonel verileriniz; servislerin sunulması, kullanıcı doğrulama, ilan ve teklif süreçlerinin yönetilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>
                <h4>3. Veri Aktarımı ve Korunması</h4>
                <p>Verileriniz, yalnızca hizmetin ifası için gerekli olduğu ölçüde (eşleşen taşıyıcı/yükleyici ile) paylaşılır. Platformumuz, verilerinizin güvenliği için endüstri standardı şifreleme ve güvenlik önlemlerini uygulamaktadır.</p>
                <h4>4. Haklarınız</h4>
                <p>KVKK'nın 11. maddesi uyarınca; verilerinizin silinmesini isteme, işlenip işlenmediğini öğrenme ve düzeltme hakkına sahipsiniz. Başvurularınızı kurumsal e-posta adresimiz üzerinden yapabilirsiniz.</p>`,
            "term_content": `<div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    ÖNEMLİ: Pruva Lojistik bir "Aracı Hizmet Sağlayıcı"dır. Taşıma sürecindeki hiçbir hasar, gecikme veya kayıptan doğrudan sorumlu tutulamaz.
                </div>
                <h4>1. Tarafların Sorumlulukları</h4>
                <p><strong>Pruva Lojistik:</strong> Sadece yükleyici ile taşıyıcıyı bir araya getiren dijital bir pazaryeridir. Taraflar arasındaki ticari anlaşmazlıklarda hakemlik yapmaz, garanti vermez.</p>
                <h4>2. Veri Doğruluğu</h4>
                <p>Kullanıcı, kayıt sırasında sunduğu VKN ve şirket bilgilerinin doğruluğunu taahhüt eder. Yanlış veya sahte belge sunulması durumunda doğacak hukuki sorumluluk tamamen kullanıcıya aittir ve hesabı süresiz kapatılır.</p>
                <h4>3. Platform Kullanımı</h4>
                <p>Platform üzerinden elde edilen fiyat teklifleri ve müşteri bilgileri "Ticari Sır" kapsamındadır. Bu bilgilerin platform dışına sızdırılması veya kötüye kullanılması durumunda Pruva Lojistik tazminat hakkını saklı tutar.</p>
                <h4>4. Sorumluluk Sınırlandırması</h4>
                <p>Pruva Lojistik; sistem kesintileri, veri kayıpları veya mücbir sebeplerden dolayı oluşabilecek dolaylı zararlardan sorumlu değildir. Platform "Olduğu Gibi" (As-Is) esasıyla sunulmaktadır.</p>`
        }
    },
    en: {
        "legal": {
            "title": "Legal Documents",
            "btn_understood": "I have read and understood",
            "kvkk_title": "GDPR Illumination Text",
            "term_title": "User Agreement",
            "kvkk_content": `<h4>1. Data Controller</h4>
                <p>In accordance with the Personal Data Protection Law ("KVKK"), as Pruva Logistics Platform ("Platform"), acting as a data controller, we will process your personal data within the scope described below.</p>
                <h4>2. Purpose of Processing Personal Data</h4>
                <p>Company title, Tax ID, corporate e-mail, and operational data collected through the Platform are processed to provide services, verify users, manage advertisement and bidding processes, and fulfill legal obligations.</p>
                <h4>3. Data Transfer and Protection</h4>
                <p>Your data is shared only to the extent necessary for the performance of the service (with the matching carrier/loader). Our platform applies industry standard encryption and security measures for the safety of your data.</p>
                <h4>4. Your Rights</h4>
                <p>You have the right to request deletion of your data, learn whether it is processed, and request correction. You can submit your applications via our corporate e-mail address.</p>`,
            "term_content": `<div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    IMPORTANT: Pruva Logistics is an "Intermediary Service Provider". It cannot be held directly responsible for any damage, delay, or loss during the transportation process.
                </div>
                <h4>1. Responsibilities of Parties</h4>
                <p><strong>Pruva Logistics:</strong> It is only a digital marketplace that brings together the loader (shipper) and carrier. It does not act as an arbitrator in commercial disputes between the parties and does not provide guarantees.</p>
                <h4>2. Data Accuracy</h4>
                <p>The user undertakes the accuracy of the Tax ID and company information provided during registration. In case of submitting false or fake documents, the legal responsibility belongs entirely to the user and their account will be permanently closed.</p>
                <h4>3. Platform Usage</h4>
                <p>Price quotes and customer information obtained through the platform are considered "Trade Secrets". In case of leaking or misusing this information outside the platform, Pruva Logistics reserves the right to compensation.</p>
                <h4>4. Limitation of Liability</h4>
                <p>Pruva Logistics is not responsible for indirect damages that may arise due to system outages, data losses, or force majeure. The platform is provided on an "As-Is" basis.</p>`
        }
    },
    zh: {
        "legal": {
            "title": "法律文件",
            "btn_understood": "我已阅读并了解",
            "kvkk_title": "个人数据保护法 (KVKK) 说明文本",
            "term_title": "用户协议",
            "kvkk_content": `<h4>1. 数据控制者</h4>
                <p>根据《个人数据保护法》(“KVKK”)，作为 Pruva 物流平台（“平台”），作为数据控制者，我们将在以下描述的范围内处理您的个人数据。</p>
                <h4>2. 处理个人数据的目的</h4>
                <p>通过平台收集的公司名称、税号、企业电子邮件和运营数据将用于提供服务、验证用户、管理广告和招标流程以及履行法律义务。</p>
                <h4>3. 数据传输与保护</h4>
                <p>您的数据仅在执行服务所需的范围内（与匹配的承运人/托运人）共享。我们的平台采用行业标准的加密和安全措施来保障您数据的安全。</p>
                <h4>4. 您的权利</h4>
                <p>您有权要求删除您的数据，了解数据是否被处理，并要求更正。您可以通过我们的企业电子邮件地址提交申请。</p>`,
            "term_content": `<div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    重要提示：Pruva 物流是“中介服务提供商”。对于运输过程中的任何损坏、延误或损失，不承担直接责任。
                </div>
                <h4>1. 各方责任</h4>
                <p><strong>Pruva 物流：</strong> 它只是一个将托运人和承运人聚集在一起的数字市场。它不充当双方之间商业纠纷的仲裁者，也不提供担保。</p>
                <h4>2. 数据准确性</h4>
                <p>用户承诺在注册期间提供的税号和公司信息的准确性。如果提交虚假或伪造文件，法律责任完全由用户承担，其帐户将被永久关闭。</p>
                <h4>3. 平台使用</h4>
                <p>通过平台获得的报价和客户信息被视为“商业机密”。如果将这些信息泄露到平台之外或被滥用，Pruva 物流保留索赔的权利。</p>
                <h4>4. 责任限制</h4>
                <p>Pruva 物流不对由于系统中断、数据丢失或不可抗力引起的间接损失负责。本平台按“原样”提供。</p>`
        }
    },
    ru: {
        "legal": {
            "title": "Юридические документы",
            "btn_understood": "Я прочитал и понял",
            "kvkk_title": "Текст об осведомленности в соответствии с Законом о защите персональных данных (KVKK)",
            "term_title": "Пользовательское соглашение",
            "kvkk_content": `<h4>1. Контроллер данных</h4>
                <p>В соответствии с Законом о защите персональных данных («KVKK»), как логистическая платформа Pruva («Платформа»), выступая в качестве контроллера данных, мы будем обрабатывать ваши персональные данные в рамках, описанных ниже.</p>
                <h4>2. Цель обработки персональных данных</h4>
                <p>Название компании, ИНН, корпоративная электронная почта и операционные данные, собранные через Платформу, обрабатываются для предоставления услуг, проверки пользователей, управления процессами публикации объявлений и торгов, а также выполнения юридических обязательств.</p>
                <h4>3. Передача и защита данных</h4>
                <p>Ваши данные передаются только в объеме, необходимом для оказания услуги (с подходящим перевозчиком/отправителем). Наша платформа применяет стандартные отраслевые меры шифрования и безопасности для защиты ваших данных.</p>
                <h4>4. Ваши права</h4>
                <p>Вы имеете право потребовать удаления ваших данных, узнать, обрабатываются ли они, и запросить их исправление. Вы можете подать свои заявки на наш корпоративный адрес электронной почты.</p>`,
            "term_content": `<div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    ВАЖНО: Логистическая компания Pruva является «Поставщиком посреднических услуг». Она не несет прямой ответственности за любой ущерб, задержку или потерю во время процесса транспортировки.
                </div>
                <h4>1. Обязанности сторон</h4>
                <p><strong>Pruva Logistics:</strong> Это только цифровой рынок, который объединяет грузоотправителя (loader) и перевозчика (carrier). Она не выступает в качестве арбитра в коммерческих спорах между сторонами и не предоставляет гарантий.</p>
                <h4>2. Точность данных</h4>
                <p>Пользователь обязуется обеспечить достоверность ИНН и информации о компании, предоставленной при регистрации. В случае предоставления ложных или поддельных документов юридическая ответственность полностью ложится на пользователя, и его учетная запись будет закрыта навсегда.</p>
                <h4>3. Использование платформы</h4>
                <p>Ценовые предложения и информация о клиентах, полученные через платформу, считаются «коммерческой тайной». В случае утечки или неправомерного использования этой информации за пределами платформы, Pruva Logistics оставляет за собой право на компенсацию.</p>
                <h4>4. Ограничение ответственности</h4>
                <p>Pruva Logistics не несет ответственности за косвенные убытки, которые могут возникнуть из-за сбоев в системе, потери данных или форс-мажорных обстоятельств. Платформа предоставляется на условиях «Как есть».</p>`
        }
    },
    es: {
        "legal": {
            "title": "Documentos legales",
            "btn_understood": "He leído y entendido",
            "kvkk_title": "Texto de iluminación RGPD",
            "term_title": "Acuerdo de usuario",
            "kvkk_content": `<h4>1. Controlador de datos</h4>
                <p>De conformidad con la Ley de Protección de Datos Personales ("KVKK"), como Plataforma de Logística de Pruva ("Plataforma"), actuando como controlador de datos, procesaremos sus datos personales dentro del alcance que se describe a continuación.</p>
                <h4>2. Finalidad del tratamiento de datos personales</h4>
                <p>El título de la empresa, el número de identificación fiscal, el correo electrónico corporativo y los datos operativos recopilados a través de la Plataforma se procesan para proporcionar servicios, verificar usuarios, gestionar anuncios y procesos de licitación, y cumplir con obligaciones legales.</p>
                <h4>3. Transferencia y protección de datos</h4>
                <p>Sus datos se comparten solo en la medida necesaria para la prestación del servicio (con el transportista/cargador correspondiente). Nuestra plataforma aplica medidas de cifrado y seguridad estándar de la industria para la seguridad de sus datos.</p>
                <h4>4. Sus derechos</h4>
                <p>Tiene derecho a solicitar la eliminación de sus datos, saber si se procesan y solicitar su corrección. Puede enviar sus solicitudes a través de nuestra dirección de correo electrónico corporativo.</p>`,
            "term_content": `<div style="background: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin-bottom: 20px; font-weight: 600; color: #c0392b;">
                    IMPORTANTE: Pruva Logistics es un "Proveedor de servicios intermediario". No se le puede responsabilizar directamente por ningún daño, retraso o pérdida durante el proceso de transporte.
                </div>
                <h4>1. Responsabilidades de las partes</h4>
                <p><strong>Pruva Logistics:</strong> Es solo un mercado digital que reúne al cargador (remitente) y al transportista. No actúa como árbitro en disputas comerciales entre las partes y no ofrece garantías.</p>
                <h4>2. Precisión de los datos</h4>
                <p>El usuario se compromete a la exactitud del número de identificación fiscal y la información de la empresa proporcionada durante el registro. En caso de presentar documentos falsos o falsificados, la responsabilidad legal recae enteramente en el usuario y su cuenta se cerrará permanentemente.</p>
                <h4>3. Uso de la plataforma</h4>
                <p>Las cotizaciones de precios y la información de los clientes obtenidas a través de la plataforma se consideran "Secretos comerciales". En caso de filtrar o hacer mal uso de esta información fuera de la plataforma, Pruva Logistics se reserva el derecho de indemnización.</p>
                <h4>4. Limitación de responsabilidad</h4>
                <p>Pruva Logistics no es responsable de los daños indirectos que puedan surgir debido a cortes del sistema, pérdida de datos o fuerza mayor. La plataforma se proporciona "tal cual".</p>`
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
    current.legal = legalTranslations[lang].legal;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Updated ${lang}.json with legal`);
});
