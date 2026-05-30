const db = require('./db');

const middlewares = {
    // Admin yetkisi kontrolü
    isAdmin: (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Erişim reddedildi. Sadece adminler bu işlemi yapabilir.' });
        }
        next();
    },

    // Şirket onaylı mı kontrolü
    isApproved: async (req, res, next) => {
        try {
            const userResult = await db.query('SELECT company_id FROM users WHERE id = $1', [req.user.id]);
            const companyId = userResult.rows[0].company_id;

            if (!companyId) {
                return res.status(403).json({ message: 'Bir şirkete bağlı değilsiniz.' });
            }

            const companyResult = await db.query('SELECT approved FROM companies WHERE id = $1', [companyId]);
            if (!companyResult.rows[0].approved) {
                return res.status(403).json({ message: 'Şirketiniz henüz onaylanmamış. İlan oluşturamazsınız.' });
            }

            next();
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    }
};

module.exports = middlewares;
