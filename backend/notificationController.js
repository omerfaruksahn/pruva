const db = require('./db');

const notificationController = {
    // Kullanıcının bildirimlerini listele
    getMyNotifications: async (req, res) => {
        try {
            const result = await db.query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
                [req.user.id]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    },

    // Bildirimi okundu olarak işaretle
    markAsRead: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [id, req.user.id]
            );
            res.json({ message: 'Bildirim okundu olarak işaretlendi.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    }
};

module.exports = notificationController;
