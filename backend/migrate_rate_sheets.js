const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === 'true';

async function run() {
    console.log('[MIGRATION] Migration runner starting...');
    console.log('[MIGRATION] USE_DUMMY_DATA status:', USE_DUMMY_DATA);
    console.log('[MIGRATION] Loaded .env path:', path.join(__dirname, '.env'));

    const dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    if (dbConfig.host && dbConfig.database) {
        console.log('[MIGRATION] PostgreSQL bağlantısı kuruluyor:', dbConfig.host, dbConfig.database);
        const pool = new Pool(dbConfig);
        try {
            const client = await pool.connect();
            console.log('[MIGRATION] PostgreSQL bağlantısı başarılı.');

            const sql = `
                CREATE TABLE IF NOT EXISTS rate_sheets (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT,
                    carrier_name TEXT,
                    valid_from DATE,
                    valid_until DATE,
                    status TEXT DEFAULT 'ACTIVE',
                    filename TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS rate_sheet_items (
                    id SERIAL PRIMARY KEY,
                    sheet_id INTEGER REFERENCES rate_sheets(id) ON DELETE CASCADE,
                    user_id TEXT,
                    pol TEXT,
                    pod TEXT,
                    container_type TEXT,
                    price NUMERIC(10,2),
                    currency TEXT DEFAULT 'USD',
                    includes TEXT[],
                    transit_days INTEGER,
                    valid_until DATE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `;
            console.log('[MIGRATION] SQL tabloları oluşturuluyor...');
            await client.query(sql);
            console.log('[MIGRATION] Tablolar başarıyla oluşturuldu veya zaten mevcuttu.');

            client.release();
        } catch (dbErr) {
            console.error('[MIGRATION] PostgreSQL çalıştırılırken hata (Dummy Mode için bu normaldir):', dbErr.message);
        } finally {
            await pool.end();
        }
    } else {
        console.log('[MIGRATION] PostgreSQL bağlantı detayları bulunamadı (sadece Dummy mod aktif).');
    }

    console.log('[MIGRATION] Migrasyon bitti.');
}

run().catch(err => {
    console.error('[MIGRATION] Beklenmedik hata:', err);
    process.exit(1);
});
