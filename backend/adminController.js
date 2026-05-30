const db = require('./db');

const adminController = {
    // Şirketi Onayla
    approveCompany: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query(
                'UPDATE companies SET approved = TRUE WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Şirket bulunamadı.' });
            }

            res.json({ message: 'Şirket başarıyla onaylandı.', company: result.rows[0] });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    },

    // Şirketi Reddet / Sil
    rejectCompany: async (req, res) => {
        const { id } = req.params;
        try {
            // Şirketi silmek yerine approved = false bırakabilir veya silebilirsiniz
            const result = await db.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Şirket bulunamadı.' });
            }

            res.json({ message: 'Şirket başvurusu reddedildi ve silindi.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    },

    // Tüm Kullanıcıları Listele
    getAllUsers: async (req, res) => {
        try {
            const result = await db.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    },

    // İlan Sil
    deleteListing: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'İlan bulunamadı.' });
            }

            res.json({ message: 'İlan admin tarafından başarıyla silindi.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server hatası');
        }
    }
};

module.exports = adminController;
