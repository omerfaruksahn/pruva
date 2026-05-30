const fs = require('fs');
const path = require('path');
const sqlite = require('node:sqlite');

const dbPath = 'C:\\Users\\Ömer\\.gemini\\antigravity\\conversations\\43c634bc-a38a-4831-b215-414a48e6c8a1.db';
const db = new sqlite.DatabaseSync(dbPath);

console.log('Searching for renderMessageList in database...');

const rows = db.prepare("SELECT idx, step_payload, metadata FROM steps").all();
for (const row of rows) {
    let text = '';
    if (row.step_payload) {
        text += Buffer.from(row.step_payload).toString('utf8');
    }
    if (row.metadata) {
        text += Buffer.from(row.metadata).toString('utf8');
    }

    if (text.includes('renderMessageList')) {
        console.log(`Found match in step ${row.idx}`);
        // Let's find the exact block containing renderMessageList
        const index = text.indexOf('renderMessageList');
        // Let's print about 4000 characters after the match
        const snippet = text.substring(index - 100, index + 6000);
        console.log('=== FULL RENDER MESSAGES CODE ===');
        console.log(snippet);
        console.log('=================================');
        break;
    }
}
