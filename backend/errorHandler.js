// Merkezi Hata Yönetimi Middleware
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR LOG] ${err.stack}`);

    // Özel hata kodları ve mesajları
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Dahili Sunucu Hatası';

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Sadece development ortamında stack trace gösterilebilir
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
