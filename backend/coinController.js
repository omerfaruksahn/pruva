const db = require('./db');

exports.getBalance = async (req, res) => {
    try {
        const result = await db.query('SELECT coin_balance FROM users WHERE id = $1', [req.user.id]);
        res.json({ balance: result.rows[0].coin_balance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.buyCoins = async (req, res) => {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ msg: 'Geçersiz miktar' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Update user balance
        const updateRes = await client.query(
            'UPDATE users SET coin_balance = coin_balance + $1 WHERE id = $2 RETURNING coin_balance',
            [amount, req.user.id]
        );

        // Log transaction
        await client.query(
            'INSERT INTO coin_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
            [req.user.id, amount, 'purchase', `${amount} coin satın alındı.`]
        );

        await client.query('COMMIT');
        res.json({ balance: updateRes.rows[0].coin_balance, msg: 'Coinler başarıyla yüklendi.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};

exports.getHistory = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM coin_transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
