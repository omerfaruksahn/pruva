const rateLimit = require('express-rate-limit');

// Genel Uygulama Limiti
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: process.env.NODE_ENV === 'production' ? 200 : 999999, 
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen bir süre sonra tekrar deneyiniz.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Kimlik Doğrulama Limiti
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: process.env.NODE_ENV === 'production' ? 10 : 999999,
    message: {
        success: false,
        message: 'Güvenlik nedeniyle kimlik doğrulama denemeleriniz kısıtlanmıştır. Lütfen 15 dakika sonra tekrar deneyiniz.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI Istekleri Limiti
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: process.env.NODE_ENV === 'production' ? 30 : 999999,
    message: {
        success: false,
        message: 'AI istek limitine ulaştınız. Lütfen bir süre bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Dosya Yükleme Limiti
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: process.env.NODE_ENV === 'production' ? 15 : 999999,
    message: {
        success: false,
        message: 'Dosya yükleme limitine ulaştınız. Lütfen bir süre bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// TTS (Sesli Yanıt) Limiti — ses sentezi pahalı bir işlem, sıkı limit (maliyet/DoS koruması)
const ttsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: process.env.NODE_ENV === 'production' ? 10 : 999999,
    message: {
        success: false,
        message: 'Sesli yanıt limitine ulaştınız. Lütfen bir dakika bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter, uploadLimiter, ttsLimiter };
