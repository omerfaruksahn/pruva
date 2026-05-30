const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const authController = {
    // Yeni Kullanıcı ve Şirket Kaydı + Email Token
    register: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, role, companyName, companyEmail, logoUrl, taxDocUrl } = req.body;

        try {
            const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
            }

            await db.query('BEGIN');

            let companyId = null;
            if (role === 'shipper') {
                const companyResult = await db.query(
                    'INSERT INTO companies (name, email, logo_url, tax_document_url) VALUES ($1, $2, $3, $4) RETURNING id',
                    [companyName, companyEmail, logoUrl, taxDocUrl]
                );
                companyId = companyResult.rows[0].id;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUserResult = await db.query(
                'INSERT INTO users (email, password, role, company_id) VALUES ($1, $2, $3, $4) RETURNING id, email',
                [email, hashedPassword, role, companyId]
            );
            const user = newUserResult.rows[0];

            // Doğrulama Tokenı Oluştur (24 saat geçerli)
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await db.query(
                'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
                [user.id, token, expiresAt]
            );

            await db.query('COMMIT');

            // Simülasyon: Linki konsola yazdır
            console.log(`\n[EMAIL SIMULATION] To: ${email}\nVerification Link: http://localhost:5000/api/auth/verify-email?token=${token}\n`);

            res.status(201).json({
                success: true,
                message: 'Kayıt başarıyla tamamlandı. Lütfen e-postanızı doğrulayın.'
            });
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        }
    },

    // Email Doğrula (GET)
    verifyEmail: async (req, res, next) => {
        const { token } = req.query;

        try {
            const result = await db.query(
                'SELECT * FROM verification_tokens WHERE token = $1',
                [token]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
            }

            const verification = result.rows[0];

            // Süre kontrolü
            if (new Date() > new Date(verification.expires_at)) {
                await db.query('DELETE FROM verification_tokens WHERE id = $1', [verification.id]);
                return res.status(400).json({ success: false, message: 'Token süresi dolmuş. Lütfen yeni bir link isteyin.' });
            }

            await db.query('BEGIN');

            // Kullanıcıyı doğrulanmış yap
            await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [verification.user_id]);

            // Token'ı sil (tek kullanımlık)
            await db.query('DELETE FROM verification_tokens WHERE id = $1', [verification.id]);

            await db.query('COMMIT');

            res.json({ success: true, message: 'E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.' });
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        }
    },

    // Yeni Doğrulama Linki İste (POST)
    resendVerification: async (req, res, next) => {
        const { email } = req.body;

        try {
            const userResult = await db.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            }

            const user = userResult.rows[0];
            if (user.is_verified) {
                return res.status(400).json({ success: false, message: 'Hesabınız zaten doğrulanmış.' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await db.query('BEGIN');
            // Eski tokenları temizle
            await db.query('DELETE FROM verification_tokens WHERE user_id = $1', [user.id]);
            // Yeni token ekle
            await db.query(
                'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
                [user.id, token, expiresAt]
            );
            await db.query('COMMIT');

            console.log(`\n[EMAIL RESEND SIMULATION] To: ${email}\nNew Verification Link: http://localhost:5000/api/auth/verify-email?token=${token}\n`);

            res.json({ success: true, message: 'Yeni doğrulama linki e-posta adresinize gönderildi.' });
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        }
    },

    login: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
            }

            const user = result.rows[0];

            // Email doğrulama kontrolü (Giriş yapmadan önce)
            if (!user.is_verified) {
                return res.status(403).json({ success: false, message: 'Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
            }

            const payload = { user: { id: user.id, role: user.role } };

            // Access Token (Kısa ömürlü)
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            // Refresh Token (Uzun ömürlü)
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

            // Refresh Token'ı veritabanına kaydet
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün

            await db.query('BEGIN');
            await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]); // Eski tokenları temizle
            await db.query(
                'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
                [user.id, refreshToken, expiresAt]
            );
            await db.query('COMMIT');

            res.json({ 
                success: true, 
                accessToken, 
                refreshToken,
                user: { id: user.id, email: user.email, role: user.role }
            });
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        }
    },

    // Refresh Token ile Yeni Access Token Al
    refreshToken: async (req, res, next) => {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Refresh token gereklidir.' });
        }

        try {
            // Token'ı veritabanında kontrol et
            const result = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
            if (result.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Geçersiz refresh token.' });
            }

            const storedToken = result.rows[0];

            // Süre kontrolü
            if (new Date() > new Date(storedToken.expires_at)) {
                await db.query('DELETE FROM refresh_tokens WHERE id = $1', [storedToken.id]);
                return res.status(403).json({ success: false, message: 'Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.' });
            }

            // Token doğrula
            jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ success: false, message: 'Refresh token doğrulanamadı.' });
                }

                // Yeni Access Token üret
                const payload = { user: { id: decoded.user.id, role: decoded.user.role } };
                const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

                res.json({ success: true, accessToken });
            });
        } catch (err) {
            next(err);
        }
    },

    // Çıkış Yap (Refresh Token'ı Sil)
    logout: async (req, res, next) => {
        const { token } = req.body;
        try {
            await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
            res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = authController;
