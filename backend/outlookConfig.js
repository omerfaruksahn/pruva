const msal = require('@azure/msal-node');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cachePath = path.join(__dirname, 'msal_cache.json');
const db = require('./db');

// Ensure the table exists
db.query(`
    CREATE TABLE IF NOT EXISTS msal_cache (
        id INTEGER PRIMARY KEY,
        cache_data TEXT NOT NULL
    )
`).catch(e => console.error('[MSAL CACHE] Table creation error:', e));

const beforeCacheAccess = async (cacheContext) => {
    try {
        const result = await db.query('SELECT cache_data FROM msal_cache WHERE id = 1');
        if (result.rows.length > 0 && result.rows[0].cache_data) {
            cacheContext.tokenCache.deserialize(result.rows[0].cache_data);
        }
    } catch (e) {
        console.error('[MSAL CACHE] Read Error:', e);
    }
};

const afterCacheAccess = async (cacheContext) => {
    if (cacheContext.cacheHasChanged) {
        try {
            const cacheData = cacheContext.tokenCache.serialize();
            await db.query(`
                INSERT INTO msal_cache (id, cache_data) 
                VALUES (1, $1) 
                ON CONFLICT (id) DO UPDATE SET cache_data = EXCLUDED.cache_data
            `, [cacheData]);
        } catch (e) {
            console.error('[MSAL CACHE] Write Error:', e);
        }
    }
};

const cachePlugin = {
    beforeCacheAccess,
    afterCacheAccess
};

const clientExists = process.env.OUTLOOK_CLIENT_ID && process.env.OUTLOOK_CLIENT_SECRET;

const msalConfig = {
    auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID || '00000000-0000-0000-0000-000000000000',
        authority: process.env.OUTLOOK_AUTHORITY || 'https://login.microsoftonline.com/common',
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET || 'dummy_client_secret_for_local_testing',
    },
    cache: {
        cachePlugin
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                if (process.env.NODE_ENV !== 'production' && message.includes('Error')) {
                    console.log(`[MSAL LOGGER] ${message}`);
                }
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        }
    }
};

const cca = clientExists ? new msal.ConfidentialClientApplication(msalConfig) : null;
const scopes = ['user.read', 'mail.read', 'mail.send', 'offline_access'];
const redirectUri = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:5000/api/outlook/callback';

module.exports = {
    cca,
    scopes,
    redirectUri
};
