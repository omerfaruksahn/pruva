const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const useSsl = process.env.DATABASE_URL && /render|supabase|neon|azure/i.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});
const sql = fs.readFileSync('db.sql', 'utf8'); pool.query(sql).then(() => { console.log('TABLES CREATED SUCCESSFULLY!'); process.exit(0); }).catch(e => { console.error('ERROR:', e); process.exit(1); });
