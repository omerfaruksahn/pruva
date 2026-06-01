const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'your_password', host: 'localhost', port: 5432, database: 'pruva_db' });
client.connect()
  .then(() => client.query("SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'pricing_actions'"))
  .then(res => console.log(res.rows))
  .finally(() => client.end());
