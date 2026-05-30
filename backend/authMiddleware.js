const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // x-auth-token veya Authorization: Bearer <token> başlığından token'ı al
    let token = req.header('x-auth-token');
    
    const authHeader = req.header('Authorization');
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    // Token yoksa hata döndür
    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı, yetki reddedildi.' });
    }

    try {
        // 1. Standart JWT doğrulamayı dene
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        // 2. Dummy data mode aktifse Firebase tokenlarını veya test tokenlarını çöz ve hata verme
        if (process.env.USE_DUMMY_DATA === 'true') {
            try {
                const decoded = jwt.decode(token);
                if (decoded) {
                    // Firebase UID'sini veya standart id'yi al, yoksa test kullanıcısı 1'i ata
                    const userId = decoded.user_id || decoded.sub || (decoded.user && decoded.user.id) || 1;
                    req.user = { id: userId };
                    return next();
                }
            } catch (decodeErr) {
                console.warn('[AUTH MIDDLEWARE] Dummy mod çözme hatası:', decodeErr.message);
            }
            
            // Çözülemiyorsa default test kullanıcısı 1'i ata
            req.user = { id: 1 };
            return next();
        }

        res.status(401).json({ message: 'Token geçersiz.' });
    }
};
