const { check } = require('express-validator');

// Tüm API uç noktaları için doğrulama şemaları
const schemas = {
    register: [
        check('email', 'Geçerli bir e-posta adresi giriniz').isEmail().normalizeEmail(),
        check('password', 'Şifre en az 12 karakter olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/),
        check('role', 'Geçersiz kullanıcı rolü').isIn(['shipper', 'logistician', 'admin']),
        // Shipper ise şirket bilgileri zorunlu olabilir (Controller'da kontrol ediliyor)
    ],
    login: [
        check('email', 'Geçerli bir e-posta adresi giriniz').isEmail(),
        check('password', 'Şifre gereklidir').notEmpty()
    ],
    listing: [
        check('origin', 'Çıkış noktası gereklidir').notEmpty().trim(),
        check('destination', 'Varış noktası gereklidir').notEmpty().trim(),
        check('cargo_type', 'Yük tipi belirtilmelidir').notEmpty(),
        check('loading_date', 'Geçerli bir yükleme tarihi giriniz').isISO8601(),
        check('volume', 'Hacim sayısal bir değer olmalıdır').optional().isNumeric()
    ],
    offer: [
        check('listing_id', 'Geçerli bir ilan ID belirtilmelidir').isInt(),
        check('price', 'Fiyat sayısal ve pozitif olmalıdır').isFloat({ min: 0.01 }),
        check('currency', 'Geçersiz para birimi (TRY, USD, EUR)').isIn(['TRY', 'USD', 'EUR']),
        check('price_type', 'Geçersiz fiyat tipi (all-in, freight, customs)').isIn(['all-in', 'freight', 'customs']),
        check('transit_time', 'Tahmini varış süresi gereklidir').notEmpty().trim()
    ]
};

module.exports = schemas;
