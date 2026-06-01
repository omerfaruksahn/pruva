const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'your_password', host: 'localhost', port: 5432, database: 'pruva_db' });
client.connect().then(() => {
  client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(res => {
    console.log(res.rows.map(r => r.table_name));
    client.end();
  });
});
