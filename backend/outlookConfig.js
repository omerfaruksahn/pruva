const msal = require('@azure/msal-node');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cachePath = path.join(__dirname, 'msal_cache.json');

const beforeCacheAccess = async (cacheContext) => {
    if (fs.existsSync(cachePath)) {
        cacheContext.tokenCache.deserialize(fs.readFileSync(cachePath, 'utf-8'));
    }
};

const afterCacheAccess = async (cacheContext) => {
    if (cacheContext.cacheHasChanged) {
        fs.writeFileSync(cachePath, cacheContext.tokenCache.serialize());
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
