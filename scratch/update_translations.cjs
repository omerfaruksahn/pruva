const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';

const resetPassTranslations = {
    tr: {
        "auth": {
            "reset_password": {
                "invalid_link_title": "Bağlantı Geçersiz",
                "invalid_link_subtitle": "Şifre sıfırlama talebinizin süresi dolmuş veya bağlantı bozulmuş olabilir.",
                "invalid_link_desc": "Güvenliğiniz için şifre sıfırlama bağlantıları tek kullanımlıktır ve belirli bir süre sonra otomatik olarak devre dışı kalır. Lütfen giriş sayfasına dönerek tekrar yeni bir şifre sıfırlama bağlantısı talep edin.",
                "go_to_login": "Giriş Sayfasına Git",
                "title": "Yeni Şifre Belirleyin",
                "subtitle": "Lojistik platformunuz için güçlü ve güvenli yeni bir şifre girin",
                "new_password": "Yeni Şifre",
                "new_password_confirm": "Yeni Şifre (Tekrar)",
                "req_length": "En az 12 karakter uzunluğu",
                "req_upper": "En az bir büyük harf (A-Z)",
                "req_number": "En az bir rakam (0-9)",
                "update_btn": "Şifreyi Güncelle",
                "back_to_login": "Giriş Sayfasına Dön"
            }
        }
    },
    en: {
        "auth": {
            "reset_password": {
                "invalid_link_title": "Invalid Link",
                "invalid_link_subtitle": "Your password reset request may have expired or the link is broken.",
                "invalid_link_desc": "For your security, password reset links are single-use and automatically expire after a certain period. Please return to the login page and request a new password reset link.",
                "go_to_login": "Go to Login Page",
                "title": "Set New Password",
                "subtitle": "Enter a strong and secure new password for your logistics platform",
                "new_password": "New Password",
                "new_password_confirm": "Confirm New Password",
                "req_length": "At least 12 characters length",
                "req_upper": "At least one uppercase letter (A-Z)",
                "req_number": "At least one number (0-9)",
                "update_btn": "Update Password",
                "back_to_login": "Return to Login Page"
            }
        }
    },
    zh: {
        "auth": {
            "reset_password": {
                "invalid_link_title": "无效链接",
                "invalid_link_subtitle": "您的密码重置请求可能已过期或链接已损坏。",
                "invalid_link_desc": "为了您的安全，密码重置链接是一次性的，并在一定时间后自动失效。请返回登录页面并请求新的密码重置链接。",
                "go_to_login": "转到登录页面",
                "title": "设置新密码",
                "subtitle": "为您的物流平台输入强大且安全的新密码",
                "new_password": "新密码",
                "new_password_confirm": "确认新密码",
                "req_length": "长度至少为12个字符",
                "req_upper": "至少一个大写字母 (A-Z)",
                "req_number": "至少一个数字 (0-9)",
                "update_btn": "更新密码",
                "back_to_login": "返回登录页面"
            }
        }
    },
    ru: {
        "auth": {
            "reset_password": {
                "invalid_link_title": "Недействительная ссылка",
                "invalid_link_subtitle": "Срок действия вашего запроса на сброс пароля мог истечь, или ссылка недействительна.",
                "invalid_link_desc": "В целях вашей безопасности ссылки для сброса пароля являются одноразовыми и автоматически истекают через определенное время. Пожалуйста, вернитесь на страницу входа и запросите новую ссылку для сброса пароля.",
                "go_to_login": "Перейти на страницу входа",
                "title": "Установите новый пароль",
                "subtitle": "Введите надежный и безопасный новый пароль для вашей логистической платформы",
                "new_password": "Новый пароль",
                "new_password_confirm": "Подтвердите новый пароль",
                "req_length": "Длина не менее 12 символов",
                "req_upper": "Хотя бы одна заглавная буква (A-Z)",
                "req_number": "Хотя бы одна цифра (0-9)",
                "update_btn": "Обновить пароль",
                "back_to_login": "Вернуться на страницу входа"
            }
        }
    },
    es: {
        "auth": {
            "reset_password": {
                "invalid_link_title": "Enlace inválido",
                "invalid_link_subtitle": "Su solicitud de restablecimiento de contraseña puede haber expirado o el enlace está roto.",
                "invalid_link_desc": "Por su seguridad, los enlaces de restablecimiento de contraseña son de un solo uso y caducan automáticamente después de un cierto período. Vuelva a la página de inicio de sesión y solicite un nuevo enlace de restablecimiento de contraseña.",
                "go_to_login": "Ir a la página de inicio de sesión",
                "title": "Establecer nueva contraseña",
                "subtitle": "Ingrese una nueva contraseña segura y robusta para su plataforma logística",
                "new_password": "Nueva contraseña",
                "new_password_confirm": "Confirmar nueva contraseña",
                "req_length": "Al menos 12 caracteres de longitud",
                "req_upper": "Al menos una letra mayúscula (A-Z)",
                "req_number": "Al menos un número (0-9)",
                "update_btn": "Actualizar contraseña",
                "back_to_login": "Volver a la página de inicio de sesión"
            }
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
    // Deep merge for auth
    if (!current.auth) current.auth = {};
    current.auth.reset_password = resetPassTranslations[lang].auth.reset_password;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Updated ${lang}.json with reset_password`);
});
