const db = require('./db');
const { validationResult } = require('express-validator');

const listingController = {
    createListing: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        let { origin, destination, cargo_type, is_dangerous, danger_code, volume, load_type, loading_date, expiration_date, notes } = req.body;

        try {
            const userResult = await db.query('SELECT company_id FROM users WHERE id = $1', [req.user.id]);
            const companyId = userResult.rows[0].company_id;

            if (!companyId) {
                return res.status(403).json({ success: false, message: 'İlan oluşturmak için bir şirkete bağlı olmalısınız.' });
            }

            // Günlük Limit Kontrolü (Max 5 ilan / Gün)
            const dailyCountResult = await db.query(
                "SELECT COUNT(*) FROM listings WHERE company_id = $1 AND created_at > NOW() - INTERVAL '24 hours'",
                [companyId]
            );

            if (parseInt(dailyCountResult.rows[0].count) >= 5) {
                return res.status(429).json({ 
                    success: false, 
                    message: 'Günlük ilan limitinize (5) ulaştınız. Lütfen yarın tekrar deneyiniz.' 
                });
            }

            // Varsayılan süre: 7 gün (Eğer expiration_date gönderilmemişse)
            if (!expiration_date) {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                expiration_date = date;
            }

            const result = await db.query(
                `INSERT INTO listings 
                (origin, destination, cargo_type, is_dangerous, danger_code, volume, load_type, loading_date, expiration_date, notes, company_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING *`,
                [origin, destination, cargo_type, is_dangerous, danger_code, volume, load_type, loading_date, expiration_date, notes, companyId]
            );

            // Audit Log Kaydı
            const { createAuditLog } = require('./auditService');
            await createAuditLog(req.user.id, 'CREATE_LISTING', 'listings', result.rows[0].id);

            res.status(201).json({ success: true, message: 'İlan başarıyla yayınlandı.', listing: result.rows[0] });
        } catch (err) {
            next(err);
        }
    },

    getAllListings: async (req, res, next) => {
        const { filter } = req.query;
        const userId = req.user ? req.user.id : null;

        try {
            // Pasif Cron: Süresi dolan ilanları otomatik 'expired' yap
            await db.query(
                "UPDATE listings SET status = 'expired' WHERE status = 'pending' AND expiration_date < CURRENT_TIMESTAMP"
            );

            let queryText = `
                SELECT listings.*, companies.name as company_name, companies.logo_url 
                FROM listings 
                JOIN companies ON listings.company_id = companies.id 
                WHERE companies.approved = TRUE AND listings.status = 'pending'
            `;
            let queryParams = [];

            if (filter === 'my_listings' && userId) {
                queryText = `
                    SELECT listings.*, companies.name as company_name 
                    FROM listings 
                    JOIN companies ON listings.company_id = companies.id 
                    JOIN users ON users.company_id = companies.id 
                    WHERE users.id = $1
                `;
                queryParams = [userId];
            } else if (filter === 'my_bids' && userId) {
                queryText = `
                    SELECT listings.*, companies.name as company_name 
                    FROM listings 
                    JOIN companies ON listings.company_id = companies.id 
                    JOIN offers ON offers.listing_id = listings.id 
                    WHERE offers.forwarder_id = $1
                `;
                queryParams = [userId];
            }

            queryText += ` ORDER BY listings.created_at DESC`;

            const result = await db.query(queryText, queryParams);
            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = listingController;
