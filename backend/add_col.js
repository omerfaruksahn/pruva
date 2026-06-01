const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'your_password', host: 'localhost', port: 5432, database: 'pruva_db' });
client.connect().then(() => {
  client.query("ALTER TABLE pricing_actions ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;").then(() => {
    console.log('Column added');
    client.end();
  }).catch(e => {
    console.error(e);
    client.end();
  });
});
