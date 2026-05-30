const db = require('./db');
const { validationResult } = require('express-validator');

const offerController = {
    createOffer: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { listing_id, price, currency, price_type, transit_time, note } = req.body;

        try {
            if (req.user.role !== 'logistician') {
                return res.status(403).json({ success: false, message: 'Sadece lojistik firmaları teklif verebilir.' });
            }

            const existingOffer = await db.query(
                'SELECT id FROM offers WHERE listing_id = $1 AND forwarder_id = $2',
                [listing_id, req.user.id]
            );

            if (existingOffer.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Bu ilana zaten bir teklif verdiniz.' });
            }

            await db.query('BEGIN');

            const result = await db.query(
                `INSERT INTO offers (listing_id, forwarder_id, price, currency, price_type, transit_time, note) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
                [listing_id, req.user.id, price, currency, price_type, transit_time, note]
            );

            const listingResult = await db.query(`
                SELECT u.id as owner_id, l.origin, l.destination 
                FROM listings l 
                JOIN companies c ON l.company_id = c.id
                JOIN users u ON u.company_id = c.id
                WHERE l.id = $1
            `, [listing_id]);

            if (listingResult.rows.length > 0) {
                const ownerId = listingResult.rows[0].owner_id;
                const msg = `${listingResult.rows[0].origin} - ${listingResult.rows[0].destination} ilanınıza yeni bir teklif geldi: ${price}$`;
                await db.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [ownerId, msg]);
            }

            // Audit Log Kaydı
            const { createAuditLog } = require('./auditService');
            await createAuditLog(req.user.id, 'CREATE_OFFER', 'offers', result.rows[0].id);

            await db.query('COMMIT');

            res.status(201).json({ success: true, message: 'Teklifiniz başarıyla iletildi.', offer: result.rows[0] });
        } catch (err) {
            await db.query('ROLLBACK');
            if (err.code === '23505') {
                return res.status(400).json({ success: false, message: 'Bu ilana zaten bir teklif verdiniz.' });
            }
            next(err);
        }
    },

    acceptOffer: async (req, res, next) => {
        const { id } = req.params;

        try {
            await db.query('BEGIN');

            const offerResult = await db.query(`
                SELECT o.*, l.company_id as owner_company_id 
                FROM offers o
                JOIN listings l ON o.listing_id = l.id
                WHERE o.id = $1
            `, [id]);

            if (offerResult.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ success: false, message: 'Teklif bulunamadı.' });
            }

            const offer = offerResult.rows[0];

            const userResult = await db.query('SELECT company_id FROM users WHERE id = $1', [req.user.id]);
            if (userResult.rows[0].company_id !== offer.owner_company_id) {
                await db.query('ROLLBACK');
                return res.status(403).json({ success: false, message: 'Yetkisiz işlem.' });
            }

            await db.query('UPDATE listings SET status = $1 WHERE id = $2', ['closed', offer.listing_id]);
            await db.query('UPDATE offers SET status = $1 WHERE id = $2', ['accepted', id]);
            await db.query('UPDATE offers SET status = $1 WHERE listing_id = $2 AND id != $3', ['rejected', offer.listing_id, id]);

            const matchResult = await db.query(
                'INSERT INTO matches (listing_id, shipper_id, forwarder_id, offer_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [offer.listing_id, req.user.id, offer.forwarder_id, id]
            );

            // Audit Log Kaydı
            const { createAuditLog } = require('./auditService');
            await createAuditLog(req.user.id, 'ACCEPT_OFFER', 'offers', id);
            await createAuditLog(req.user.id, 'CREATE_MATCH', 'matches', matchResult.rows[0].id);

            const shipperInfo = await db.query('SELECT u.email, c.name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = $1', [req.user.id]);
            const forwarderInfo = await db.query('SELECT u.email, c.name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = $1', [offer.forwarder_id]);

            await db.query('COMMIT');

            console.log(`[MATCH LOG] Offer Accepted: #${id}`);

            res.json({ 
                success: true, 
                message: 'Eşleşme sağlandı!', 
                contactDetails: { shipper: shipperInfo.rows[0], forwarder: forwarderInfo.rows[0] }
            });
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        }
    },

    // Teklif Güncelle (Sadece sahibi ve kabul edilmemişse)
    updateOffer: async (req, res, next) => {
        const { id } = req.params;
        const { price, currency, price_type, transit_time, note } = req.body;

        try {
            // Teklifi bul ve kontrol et
            const offerResult = await db.query('SELECT * FROM offers WHERE id = $1', [id]);
            if (offerResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Teklif bulunamadı.' });
            }

            const offer = offerResult.rows[0];

            // Sahiplik kontrolü
            if (offer.forwarder_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Sadece kendi teklifinizi güncelleyebilirsiniz.' });
            }

            // Statü kontrolü
            if (offer.status === 'accepted') {
                return res.status(400).json({ success: false, message: 'Kabul edilmiş bir teklif güncellenemez.' });
            }

            const result = await db.query(
                `UPDATE offers 
                SET price = $1, currency = $2, price_type = $3, transit_time = $4, note = $5, status = 'pending' 
                WHERE id = $6 RETURNING *`,
                [price || offer.price, currency || offer.currency, price_type || offer.price_type, transit_time || offer.transit_time, note || offer.note, id]
            );

            res.json({ success: true, message: 'Teklif başarıyla güncellendi.', offer: result.rows[0] });
        } catch (err) {
            next(err);
        }
    },

    // Teklif Sil (Sadece sahibi)
    deleteOffer: async (req, res, next) => {
        const { id } = req.params;

        try {
            const offerResult = await db.query('SELECT * FROM offers WHERE id = $1', [id]);
            if (offerResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Teklif bulunamadı.' });
            }

            const offer = offerResult.rows[0];

            // Sahiplik kontrolü
            if (offer.forwarder_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Sadece kendi teklifinizi silebilirsiniz.' });
            }

            // Statü kontrolü (Kabul edilmişse silinmesi tartışılabilir ama genellikle engellenir)
            if (offer.status === 'accepted') {
                return res.status(400).json({ success: false, message: 'Kabul edilmiş bir teklif silinemez.' });
            }

            await db.query('DELETE FROM offers WHERE id = $1', [id]);

            res.json({ success: true, message: 'Teklif başarıyla silindi.' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = offerController;
