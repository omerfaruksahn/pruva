const jwt = require('jsonwebtoken');
const admin = require('./firebaseAdmin');
const db = require('./db');

module.exports = async function(req, res, next) {
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

    // 1. Firebase Admin SDK ile Firebase ID Token doğrulamayı dene
    if (admin && admin.apps.length > 0) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (decodedToken && (decodedToken.email || decodedToken.phone_number)) {
                const userIdentifier = decodedToken.email || decodedToken.phone_number;
                // Postgres users tablosundan email veya phone_number ile kullanıcıyı al veya otomatik oluştur
                let userRes = await db.query('SELECT id FROM users WHERE email = $1', [userIdentifier]);
                
                if (userRes.rows.length === 0) {
                    console.log(`[AUTH MIDDLEWARE] Firebase kullanıcısı Postgres'te yok, oluşturuluyor: ${userIdentifier}`);
                    const insertRes = await db.query(
                        'INSERT INTO users (email, password, role, is_verified) VALUES ($1, $2, $3, true) RETURNING id',
                        [userIdentifier, 'firebase_auth_external', 'shipper']
                    );
                    userRes = insertRes;
                }
                
                // Postgres integer id'sini req.user.id olarak ata (ilişkisel veritabanı kısıtları için zorunludur)
                req.user = { id: userRes.rows[0].id, email: userIdentifier };
                return next();
            }
        } catch (firebaseErr) {
            // Hata detayını warn olarak loglayalım fakat hemen reddetmeyip standart JWT'ye geçelim
            console.warn('[AUTH MIDDLEWARE] Firebase token doğrulama başarısız:', firebaseErr.message);
        }
    }

    try {
        // 2. Standart JWT doğrulamayı dene (Local dev, API testleri vb.)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        // 3. Dummy data mode aktifse Firebase tokenlarını veya test tokenlarını çöz ve hata verme
        if (process.env.USE_DUMMY_DATA === 'true' && process.env.NODE_ENV !== 'production') {
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

        res.status(401).json({ message: 'Token geçersiz veya süresi dolmuş.' });
    }
};
