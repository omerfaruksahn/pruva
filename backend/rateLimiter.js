const rateLimit = require('express-rate-limit');

// Genel Uygulama Limiti: Yerelde kısıtlamayı kaldırıyoruz (Maksimum limit)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 999999, 
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen bir süre sonra tekrar deneyiniz.'
    },
    standardHeaders: true, // `RateLimit-*` headerlarını döndürür
    legacyHeaders: false, // `X-RateLimit-*` headerlarını devre dışı bırakır
});

// Kimlik Doğrulama Limiti (Login/Register/Verify): Yerelde kısıtlamayı kaldırıyoruz
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 999999,
    message: {
        success: false,
        message: 'Güvenlik nedeniyle kimlik doğrulama denemeleriniz kısıtlanmıştır. Lütfen 15 dakika sonra tekrar deneyiniz.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
