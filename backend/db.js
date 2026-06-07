const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Dummy Data Mode Toggle
const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === 'true';

let pool;
if (!USE_DUMMY_DATA) {
    pool = new Pool(
        process.env.DATABASE_URL
            ? {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
              }
            : {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                port: process.env.DB_PORT,
              }
    );

    pool.on('connect', () => {
        console.log('PostgreSQL veritabanına bağlandı.');
    });

    // Otomatik Migration: pricing_actions tablosuna attachments sütununu ekle (yoksa)
    pool.query(`ALTER TABLE pricing_actions ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;`)
        .then(() => console.log('[DB] attachments sütunu kontrol edildi/eklendi.'))
        .catch(err => console.error('[DB MIGRATION ERROR]', err.message));
        
    // Otomatik Migration: pricing_outlook_accounts tablosuna subscription_id sütununu ekle (yoksa)
    pool.query(`ALTER TABLE pricing_outlook_accounts ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);`)
        .then(() => console.log('[DB] subscription_id sütunu kontrol edildi/eklendi.'))
        .catch(err => console.error('[DB MIGRATION ERROR]', err.message));
} else {
    console.log('[DUMMY MODE] Sunucu dummy verilerle çalışıyor...');
}

const dummyData = USE_DUMMY_DATA ? require('./dummyData') : null;

module.exports = {
    query: async (text, params) => {
        if (!USE_DUMMY_DATA) {
            return pool.query(text, params);
        }

        // Simple Mock Router for Dummy Data
        const query = text.toLowerCase();
        
        if (query.includes('from notifications')) {
            return { rows: dummyData.notifications };
        }
        if (query.includes('from listings')) {
            return { rows: dummyData.listings };
        }
        if (query.includes('from users')) {
            const userId = params && params[0] ? parseInt(params[0]) : 1;
            const user = dummyData.users.find(u => u.id === userId) || dummyData.users[0];
            return { rows: [user] };
        }
        if (query.includes('insert into listings')) {
            const newListing = { id: Date.now(), ...params };
            dummyData.listings.push(newListing);
            return { rows: [newListing] };
        }
        if (query.includes('count(*)')) {
            return { rows: [{ count: "0" }] };
        }

        // --- PRICING AI MOCK ROUTING ---
        if (query.includes('from pricing_templates')) {
            const userId = params[0];
            const match = dummyData.pricing_templates.filter(t => t.user_id === userId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_templates') || query.includes('conflict (user_id, template_key)')) {
            const userId = params[0];
            const key = params[1];
            const transportMode = params[2];
            const type = params[3];
            const subject = params[4];
            const body = params[5];
            
            const matchIdx = dummyData.pricing_templates.findIndex(t => t.user_id === userId && t.template_key === key);
            if (matchIdx !== -1) {
                dummyData.pricing_templates[matchIdx] = {
                    ...dummyData.pricing_templates[matchIdx],
                    transport_mode: transportMode,
                    template_type: type,
                    subject,
                    body,
                    updated_at: new Date()
                };
            } else {
                dummyData.pricing_templates.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    user_id: userId,
                    template_key: key,
                    transport_mode: transportMode,
                    template_type: type,
                    subject,
                    body,
                    is_active: true,
                    updated_at: new Date()
                });
            }
            return { rows: [] };
        }
        if (query.includes('delete from pricing_templates')) {
            const key = params[0];
            const userId = params[1];
            dummyData.pricing_templates = dummyData.pricing_templates.filter(t => !(t.user_id === userId && t.template_key === key));
            return { rows: [] };
        }
        if (query.includes('from pricing_carriers') && query.includes('ilike $1')) {
            const carrierName = params && params[0];
            const cleanName = carrierName ? carrierName.replace(/%/g, '') : '';
            const match = dummyData.pricing_carriers.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
            return { rows: match ? [match] : [] };
        }
        if (query.includes('from pricing_carriers') && !query.includes('ilike $1')) {
            const userId = params[0];
            const match = dummyData.pricing_carriers.filter(c => c.user_id === userId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_carriers')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newCarrier = {
                id,
                user_id: params[0],
                name: params[1],
                email: params[2],
                category: params[3],
                regions: params[4],
                transport_modes: params[5],
                template_type: params[6],
                preference_score: params[7],
                is_active: true,
                created_at: new Date()
            };
            dummyData.pricing_carriers.push(newCarrier);
            return { rows: [{ id }] };
        }
        if (query.includes('update pricing_carriers')) {
            if (query.includes('is_active = $1')) {
                const isActive = params[0];
                const id = params[1];
                const userId = params[2];
                const idx = dummyData.pricing_carriers.findIndex(c => c.id === id && c.user_id === userId);
                if (idx !== -1) {
                    dummyData.pricing_carriers[idx].is_active = isActive;
                }
            } else {
                const name = params[0];
                const email = params[1];
                const category = params[2];
                const regions = params[3];
                const transportModes = params[4];
                const templateType = params[5];
                const preferenceScore = params[6];
                const isActive = params[7];
                const id = params[8];
                const userId = params[9];
                
                const idx = dummyData.pricing_carriers.findIndex(c => c.id === id && c.user_id === userId);
                if (idx !== -1) {
                    dummyData.pricing_carriers[idx] = {
                        ...dummyData.pricing_carriers[idx],
                        name,
                        email,
                        category,
                        regions,
                        transport_modes: transportModes,
                        template_type: templateType,
                        preference_score: preferenceScore,
                        is_active: isActive
                    };
                }
            }
            return { rows: [] };
        }
        if (query.includes('delete from pricing_carriers')) {
            const id = params[0];
            const userId = params[1];
            dummyData.pricing_carriers = dummyData.pricing_carriers.filter(c => !(c.id === id && c.user_id === userId));
            return { rows: [] };
        }
        if (query.includes('from pricing_rfqs') && query.includes('outlook_message_id = $1')) {
            const messageId = params && params[0];
            const match = dummyData.pricing_rfqs.find(r => r.outlook_message_id === messageId);
            return { rows: match ? [match] : [] };
        }
        if (query.includes('from pricing_rfqs') && !query.includes('outlook_message_id = $1')) {
            const userId = params[0];
            const match = dummyData.pricing_rfqs.filter(r => r.user_id === userId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_rfqs')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newRfq = {
                id,
                user_id: params[0],
                outlook_message_id: params[1],
                sender_email: params[2],
                sender_name: params[3],
                subject: params[4],
                body: params[5],
                received_at: params[6],
                category: params[7],
                transport_mode: params[8],
                extracted_data: typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9],
                missing_fields: params[10],
                status: 'PENDING',
                created_at: new Date(),
                updated_at: new Date()
            };
            dummyData.pricing_rfqs.push(newRfq);
            return { rows: [{ id }] };
        }
        if (query.includes('update pricing_rfqs') && query.includes('status = $1')) {
            const status = params[0];
            const id = params[1];
            const userId = params[2];
            const idx = dummyData.pricing_rfqs.findIndex(r => r.id === id && r.user_id === userId);
            if (idx !== -1) {
                dummyData.pricing_rfqs[idx].status = status;
            }
            return { rows: [] };
        }
        if (query.includes('update pricing_rfqs') && query.includes('is_archived = true')) {
            const convId = params[0];
            const userId = params[1];
            dummyData.pricing_rfqs.forEach(r => {
                if ((String(r.conversation_id) === String(convId) || String(r.id) === String(convId)) && r.user_id === userId) {
                    r.is_archived = true;
                }
            });
            return { rows: [] };
        }
        if (query.includes('update pricing_rfqs') && query.includes('is_archived = false')) {
            const convId = params[0];
            const userId = params[1];
            dummyData.pricing_rfqs.forEach(r => {
                if ((String(r.conversation_id) === String(convId) || String(r.id) === String(convId)) && r.user_id === userId) {
                    r.is_archived = false;
                }
            });
            return { rows: [] };
        }
        if (query.includes('from pricing_actions')) {
            let match = [];
            if (query.includes('where id = $1') || query.includes('where a.id = $1')) {
                const actionId = params && params[0];
                match = dummyData.pricing_actions.filter(a => String(a.id) === String(actionId));
            } else {
                const userId = params && params[0];
                match = dummyData.pricing_actions.filter(a => !userId || String(a.user_id) === String(userId));
            }
            const rows = match.map(action => {
                const rfq = dummyData.pricing_rfqs.find(r => String(r.id) === String(action.rfq_id));
                return {
                    ...action,
                    sender_email: rfq ? rfq.sender_email : null
                };
            });
            return { rows };
        }
        if (query.includes('insert into pricing_actions')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newAction = {
                id,
                user_id: params[0],
                rfq_id: params[1],
                action_type: params[2],
                title: params[3],
                description: params[4],
                suggested_mail: typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5],
                carriers_to_contact: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
                status: 'PENDING',
                created_at: new Date(),
                updated_at: new Date()
            };
            dummyData.pricing_actions.push(newAction);
            return { rows: [{ id }] };
        }
        if (query.includes('update pricing_actions') && query.includes('status = $1')) {
            const status = params[0];
            const id = params[1];
            const userId = params[2];
            const idx = dummyData.pricing_actions.findIndex(a => a.id === id && a.user_id === userId);
            if (idx !== -1) {
                dummyData.pricing_actions[idx].status = status;
            }
            return { rows: [] };
        }
        if (query.includes('from pricing_rates')) {
            const rfqId = params[0];
            const match = dummyData.pricing_rates.filter(r => r.rfq_id === rfqId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_rates')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newRate = {
                id,
                rfq_id: params[0],
                carrier_id: params[1],
                carrier_name: params[2],
                outlook_message_id: params[3],
                raw_mail: params[4],
                extracted_price: params[5],
                currency: params[6],
                price_per: params[7],
                validity_date: params[8],
                status: 'RECEIVED',
                received_at: new Date()
            };
            dummyData.pricing_rates.push(newRate);
            return { rows: [{ id }] };
        }
        if (query.includes('insert into pricing_outlook_accounts') || query.includes('conflict (user_id)')) {
            const userId = params[0];
            const homeAccountId = params[1];
            const email = params[2];
            
            const matchIdx = dummyData.pricing_outlook_accounts.findIndex(a => a.user_id === userId);
            if (matchIdx !== -1) {
                dummyData.pricing_outlook_accounts[matchIdx] = {
                    ...dummyData.pricing_outlook_accounts[matchIdx],
                    home_account_id: homeAccountId,
                    email,
                    is_connected: true,
                    last_scan_at: new Date()
                };
            } else {
                dummyData.pricing_outlook_accounts.push({
                    id: Date.now(),
                    user_id: userId,
                    home_account_id: homeAccountId,
                    email,
                    is_connected: true,
                    last_scan_at: new Date(),
                    created_at: new Date()
                });
            }
            return { rows: [] };
        }
        if (query.includes('from pricing_outlook_accounts')) {
            const userId = params && params[0];
            const match = dummyData.pricing_outlook_accounts.find(a => a.user_id === userId);
            return { rows: match ? [match] : [] };
        }

        // --- PHASE 5: MARGIN RULES INTERCEPT ---
        if (query.includes('from pricing_margins')) {
            const userId = params[0];
            const match = dummyData.pricing_margins.filter(m => m.user_id === userId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_margins')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newMargin = {
                id,
                user_id: params[0],
                region: params[1],
                transport_mode: params[2],
                margin_percent: parseFloat(params[3]),
                customer_type: params[4] || 'STANDARD',
                created_at: new Date()
            };
            dummyData.pricing_margins.push(newMargin);
            return { rows: [newMargin] };
        }

        // --- PHASE 5: CUSTOMER PROFILES INTERCEPT ---
        if (query.includes('from pricing_customers')) {
            const userId = params[0];
            const match = dummyData.pricing_customers.filter(c => c.user_id === userId);
            return { rows: match };
        }
        if (query.includes('insert into pricing_customers')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newCustomer = {
                id,
                user_id: params[0],
                company_name: params[1],
                email: params[2],
                active_regions: params[3],
                monthly_volume: parseInt(params[4]) || 0,
                price_sensitivity: params[5] || 'NORMAL',
                customer_type: params[6] || 'STANDARD',
                notes: params[7],
                created_at: new Date()
            };
            dummyData.pricing_customers.push(newCustomer);
            return { rows: [newCustomer] };
        }
        if (query.includes('update pricing_customers')) {
            const companyName = params[0];
            const email = params[1];
            const activeRegions = params[2];
            const monthlyVolume = parseInt(params[3]) || 0;
            const priceSensitivity = params[4];
            const customerType = params[5];
            const notes = params[6];
            const id = params[7];
            const userId = params[8];

            const idx = dummyData.pricing_customers.findIndex(c => c.id === id && c.user_id === userId);
            if (idx !== -1) {
                dummyData.pricing_customers[idx] = {
                    ...dummyData.pricing_customers[idx],
                    company_name: companyName,
                    email,
                    active_regions: activeRegions,
                    monthly_volume: monthlyVolume,
                    price_sensitivity: priceSensitivity,
                    customer_type: customerType,
                    notes
                };
            }
            return { rows: [] };
        }
        if (query.includes('delete from pricing_customers')) {
            const id = params[0];
            const userId = params[1];
            dummyData.pricing_customers = dummyData.pricing_customers.filter(c => !(c.id === id && c.user_id === userId));
            return { rows: [] };
        }

        // --- PHASE 5: CARRIER PERFORMANCE INTERCEPT ---
        if (query.includes('from pricing_carrier_performance')) {
            return { rows: dummyData.pricing_carrier_performance };
        }
        if (query.includes('insert into pricing_carrier_performance')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newPerf = {
                id,
                carrier_id: params[0],
                response_hours: parseFloat(params[1]),
                was_cheapest: params[2] === true,
                was_selected: params[3] === true,
                rfq_id: params[4],
                created_at: new Date()
            };
            dummyData.pricing_carrier_performance.push(newPerf);
            return { rows: [newPerf] };
        }
 
        // --- FAZ 6: RATE GEÇMİŞİ VE KAYBEDİLEN TEKLİF INTERCEPT ---
        if (query.includes('from pricing_rate_history')) {
            // Can be filtered by pol, pod, transport_mode
            let results = dummyData.pricing_rate_history;
            if (params && params.length >= 3) {
                const pol = params[0];
                const pod = params[1];
                const mode = params[2];
                if (pol) results = results.filter(r => r.pol.toLowerCase() === pol.toLowerCase());
                if (pod) results = results.filter(r => r.pod.toLowerCase() === pod.toLowerCase());
                if (mode) results = results.filter(r => r.transport_mode.toLowerCase() === mode.toLowerCase());
            }
            return { rows: results };
        }
        if (query.includes('update pricing_rfqs') && query.includes('lost_reason')) {
            const lostReason = params[0];
            const competitorPrice = parseFloat(params[1]) || 0;
            const status = params[2];
            const id = parseInt(params[3]);
            
            const idx = dummyData.pricing_rfqs.findIndex(r => r.id === id);
            if (idx !== -1) {
                dummyData.pricing_rfqs[idx].lost_reason = lostReason;
                dummyData.pricing_rfqs[idx].competitor_price = competitorPrice;
                dummyData.pricing_rfqs[idx].status = status;
                dummyData.pricing_rfqs[idx].updated_at = new Date();
            }
            return { rows: [] };
        }

        // --- FAZ 6: MISSING ACTIONS & RFQS INTERCEPTORS ---
        if (query.includes('from pricing_actions') && !query.includes('update') && !query.includes('insert')) {
            const userId = params && params[0];
            const results = dummyData.pricing_actions.filter(a => !userId || a.user_id === userId);
            return { rows: results };
        }
        if (query.includes('update pricing_actions') && query.includes('status = $1')) {
            const status = params[0];
            const id = parseInt(params[1]); // Assuming params is [status, id, user_id]
            const idx = dummyData.pricing_actions.findIndex(a => a.id === id);
            if (idx !== -1) {
                dummyData.pricing_actions[idx].status = status;
            }
            return { rows: [] };
        }
        if (query.includes('update pricing_actions') && query.includes("status = 'completed'")) {
            const id = parseInt(params[1]); // params: [suggested_mail, id, user_id]
            const idx = dummyData.pricing_actions.findIndex(a => a.id === id);
            if (idx !== -1) {
                dummyData.pricing_actions[idx].status = 'COMPLETED';
                dummyData.pricing_actions[idx].suggested_mail = params[0];
            }
            return { rows: [] };
        }
        if (query.includes('from pricing_rfqs') && !query.includes('update') && !query.includes('insert') && !query.includes('message_id')) {
            const userId = params && params[0];
            const results = dummyData.pricing_rfqs.filter(r => !userId || r.user_id === userId);
            return { rows: results };
        }
        if (query.includes('delete from pricing_margins')) {
            const id = params[0];
            const userId = params[1];
            dummyData.pricing_margins = dummyData.pricing_margins.filter(m => !(m.id == id && m.user_id == userId));
            return { rows: [] };
        }

        // --- RATE SHEETS MOCK INTERCEPTORS ---
        if (query.includes('from rate_sheets')) {
            const userId = params && params[0];
            const results = dummyData.rate_sheets.filter(s => !userId || String(s.user_id) === String(userId));
            return { rows: results };
        }
        if (query.includes('insert into rate_sheets')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newSheet = {
                id,
                user_id: params[0],
                carrier_name: params[1],
                valid_from: params[2] || new Date(),
                valid_until: params[3],
                status: params[4] || 'ACTIVE',
                filename: params[5],
                created_at: new Date()
            };
            dummyData.rate_sheets.push(newSheet);
            return { rows: [{ id }] };
        }
        if (query.includes('insert into rate_sheet_items')) {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const newItem = {
                id,
                sheet_id: params[0],
                user_id: params[1],
                pol: params[2],
                pod: params[3],
                container_type: params[4],
                price: parseFloat(params[5]),
                currency: params[6] || 'USD',
                includes: Array.isArray(params[7]) ? params[7] : (typeof params[7] === 'string' ? JSON.parse(params[7]) : []),
                transit_days: params[8] ? parseInt(params[8]) : null,
                valid_until: params[9],
                created_at: new Date()
            };
            dummyData.rate_sheet_items.push(newItem);
            return { rows: [{ id }] };
        }
        if (query.includes('from rate_sheet_items')) {
            let results = dummyData.rate_sheet_items;
            const polParam = params && params[0];
            const podParam = params && params[1];
            
            if (polParam) {
                results = results.filter(item => item.pol.toLowerCase() === polParam.toLowerCase());
            }
            if (podParam) {
                results = results.filter(item => item.pod.toLowerCase() === podParam.toLowerCase());
            }
            
            const rows = results.map(item => {
                const sheet = dummyData.rate_sheets.find(s => s.id === item.sheet_id);
                return {
                    ...item,
                    carrier_name: sheet ? sheet.carrier_name : 'Unknown'
                };
            });
            return { rows };
        }
        if (query.includes('delete from rate_sheets')) {
            const id = parseInt(params[0]);
            dummyData.rate_sheets = dummyData.rate_sheets.filter(s => s.id !== id);
            dummyData.rate_sheet_items = dummyData.rate_sheet_items.filter(item => item.sheet_id !== id);
            return { rows: [] };
        }
 
        // --- MSAL CACHE MOCK INTERCEPTORS ---
        if (query.includes('from msal_cache')) {
            return { rows: dummyData.msal_cache ? [{ cache_data: dummyData.msal_cache }] : [] };
        }
        if (query.includes('insert into msal_cache')) {
            dummyData.msal_cache = params[0];
            return { rows: [] };
        }

        return { rows: [] };
    },
    getClient: async () => {
        if (!USE_DUMMY_DATA) {
            return pool.connect();
        }
        // Dummy data için mock client dönüyoruz
        return {
            query: async (text, params) => module.exports.query(text, params),
            release: () => {}
        };
    }
};
