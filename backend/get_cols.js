const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'your_password', host: 'localhost', port: 5432, database: 'pruva_db' });
client.connect().then(() => {
  client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pricing_actions'").then(res => {
    console.log("pricing_actions columns:", res.rows);
    client.end();
  });
});
