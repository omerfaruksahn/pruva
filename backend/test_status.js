const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'your_password', host: 'localhost', port: 5432, database: 'pruva_db' });
client.connect()
  .then(() => client.query("SELECT column_default FROM information_schema.columns WHERE table_name = 'pricing_actions' AND column_name = 'status'"))
  .then(res => console.log(res.rows))
  .finally(() => client.end());
