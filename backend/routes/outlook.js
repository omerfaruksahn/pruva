const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { cca, scopes, redirectUri } = require('../outlookConfig');
const db = require('../db');
const auth = require('../authMiddleware');
const admin = require('../firebaseAdmin');

// @route   GET api/outlook/login
// @desc    OAuth2 Login akışını başlatır (Frontend token'ı query parametresi olarak alır)
router.get('/login', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(401).send('Yetki reddedildi: Token eksik.');
    }

    try {
        // Token'ı doğrula ve kullanıcı ID'sini al
        let userId;
        let verified = false;

        // 1. Firebase Token doğrulamayı dene
        if (admin && admin.apps.length > 0) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                if (decodedToken && decodedToken.email) {
                    let userRes = await db.query('SELECT id FROM users WHERE email = $1', [decodedToken.email]);
                    if (userRes.rows.length === 0) {
                        console.log(`[OUTLOOK LOGIN] Firebase kullanıcısı Postgres'te yok, oluşturuluyor: ${decodedToken.email}`);
                        const insertRes = await db.query(
                            'INSERT INTO users (email, password, role, is_verified) VALUES ($1, $2, $3, true) RETURNING id',
                            [decodedToken.email, 'firebase_auth_external', 'shipper']
                        );
                        userRes = insertRes;
                    }
                    userId = userRes.rows[0].id;
                    verified = true;
                }
            } catch (firebaseErr) {
                console.warn('[OUTLOOK ROUTE] Firebase token doğrulama başarısız:', firebaseErr.message);
            }
        }

        // 2. Standart JWT veya fallback doğrulamayı dene
        if (!verified) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.user.id;
                verified = true;
            } catch (verifyErr) {
                if (process.env.USE_DUMMY_DATA === 'true') {
                    const decoded = jwt.decode(token);
                    userId = decoded ? (decoded.user_id || decoded.sub || (decoded.user && decoded.user.id) || 1) : 1;
                } else {
                    throw verifyErr;
                }
            }
        }

        // State parametresi içine kullanıcı ID'sini şifrelemeden güvenle yerleştiriyoruz.
        // Microsoft bu parametreyi callback'te aynen geri gönderecektir.
        const state = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' });

        const authCodeUrlParameters = {
            scopes: scopes,
            redirectUri: redirectUri,
            state: state
        };

        const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(authUrl);
    } catch (error) {
        console.error('[OUTLOOK ROUTE] Login başlatılamadı:', error);
        res.status(500).send('Outlook bağlantısı başlatılamadı.');
    }
});

// @route   GET api/outlook/callback
// @desc    Microsoft OAuth2 Geri Çağırma (Token takası ve DB kaydı)
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        console.error('[OUTLOOK CALLBACK] Microsoft hatası:', error);
        return res.status(400).send(`Outlook bağlantı hatası: ${error}`);
    }

    if (!code || !state) {
        return res.status(400).send('Geçersiz callback parametreleri.');
    }

    try {
        // State parametresini çözüp userId'yi al
        const stateData = jwt.verify(state, process.env.JWT_SECRET);
        const userId = stateData.userId;

        if (!userId) {
            return res.status(400).send('Geçersiz oturum bilgisi.');
        }

        const tokenRequest = {
            code: code,
            scopes: scopes,
            redirectUri: redirectUri
        };

        // Kodu Access Token ve Account bilgileriyle takas et
        const response = await cca.acquireTokenByCode(tokenRequest);
        const homeAccountId = response.account.homeAccountId;
        const email = response.account.username;

        // Veritabanına kaydet/güncelle (Upsert)
        const upsertQuery = `
            INSERT INTO pricing_outlook_accounts (user_id, home_account_id, email, is_connected, last_scan_at)
            VALUES ($1, $2, $3, true, NOW())
            ON CONFLICT (user_id) DO UPDATE 
            SET home_account_id = EXCLUDED.home_account_id,
                email = EXCLUDED.email,
                is_connected = true,
                last_scan_at = NOW()
            RETURNING id;
        `;
        
        const accountResult = await db.query(upsertQuery, [userId, homeAccountId, email]);
        const accountId = accountResult.rows[0].id;

        // [SIMÜLASYON] Webhook Subscription Oluşturma
        // Gerçekte burada MS Graph API'ye POST /subscriptions atılır
        // ve dönen subscriptionId veritabanına kaydedilir.
        const mockSubscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
        await db.query('UPDATE pricing_outlook_accounts SET subscription_id = $1 WHERE id = $2', [mockSubscriptionId, accountId]);
        console.log(`[WEBHOOK SIM] Kullanıcı ${userId} için Webhook aboneliği simüle edildi: ${mockSubscriptionId}`);

        console.log(`[OUTLOOK SUCCESS] Kullanıcı ${userId} için Outlook bağlandı: ${email}`);
        
        // Socket.io ile frontend'e bildir (cross-origin window.opener sorununu aşmak için)
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${userId}`).emit('OUTLOOK_CONNECTED', { email: email });
        }

        // Geriye dönük derin tarama (Initial Deep Scan) işlemini asenkron olarak arka planda başlat
        const mailScanner = require('../services/mailScanner');
        mailScanner.scanEmails(userId, null, true).then((resData) => {
            if (resData && resData.processed_count > 0) {
                const io = req.app.get('io');
                if (io) {
                    io.to(`user_${userId}`).emit('NEW_AI_ACTION', {
                        type: 'INITIAL_SCAN_COMPLETE',
                        count: resData.processed_count,
                        message: `${resData.processed_count} adet eski e-posta tarandı ve sisteme eklendi.`
                    });
                }
            }
        }).catch(err => {
            console.error('[INITIAL DEEP SCAN ERR] Hata oluştu:', err);
        });

        // Başarılı olduğunda pencereyi kapatıp frontend'e mesaj atan şık script
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Bağlantı Başarılı</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f4f6fa; color: #0f172a;">
                <div style="background: white; padding: 30px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h2 style="color: #10b981; margin-bottom: 10px;">Bağlantı Başarılı!</h2>
                    <p style="color: #475569; margin-bottom: 20px;">Outlook hesabınız Pruva AI ile başarıyla eşleştirildi.</p>
                    <p style="font-size: 0.85rem; color: #94a3b8;">Bu pencere otomatik olarak kapanacaktır...</p>
                </div>
                <script>
                    if (window.opener) {
                        const safeEmail = '${email.replace(/['"<>]/g, '')}';
                        window.opener.postMessage({ type: 'OUTLOOK_CONNECTED', email: safeEmail }, '*');
                    }
                    setTimeout(function() {
                        window.close();
                    }, 1500);
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('[OUTLOOK CALLBACK ERR] Hata oluştu:', err);
        res.status(500).send(`Bağlantı esnasında sunucu hatası oluştu: ${err.message}`);
    }
});

// @route   GET api/outlook/status
// @desc    Outlook bağlantı durumunu kontrol eder
router.get('/status', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT email, is_connected, last_scan_at FROM pricing_outlook_accounts WHERE user_id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0 || !result.rows[0].is_connected) {
            return res.json({ isConnected: false });
        }

        const account = result.rows[0];
        res.json({
            isConnected: true,
            email: account.email,
            lastScanAt: account.last_scan_at
        });
    } catch (err) {
        console.error('[OUTLOOK STATUS ERR]', err);
        res.status(500).json({ error: 'Bağlantı durumu sorgulanamadı.' });
    }
});

// @route   POST api/outlook/disconnect
// @desc    Outlook bağlantısını koparır
router.post('/disconnect', auth, async (req, res) => {
    const client = await db.getClient();
    try {
        const userId = req.user.id;
        await client.query('BEGIN');

        // Bağlantıyı kapat
        await client.query(
            'UPDATE pricing_outlook_accounts SET is_connected = false, home_account_id = NULL WHERE user_id = $1',
            [userId]
        );

        // Outlook'tan taranıp gelen mail/RFQ verilerini temizle — yeniden bağlanınca
        // eski mailler geri dönmesin (kullanıcının manuel girdiği copilot kayıtları KORUNUR)
        await client.query("DELETE FROM pricing_carrier_performance WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE user_id = $1 AND sender_email != 'copilot@pruva.ai')", [userId]);
        await client.query("DELETE FROM pricing_rates WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE user_id = $1 AND sender_email != 'copilot@pruva.ai')", [userId]);
        await client.query("DELETE FROM pricing_actions WHERE user_id = $1 AND rfq_id IN (SELECT id FROM pricing_rfqs WHERE user_id = $1 AND sender_email != 'copilot@pruva.ai')", [userId]);
        await client.query("DELETE FROM pricing_rfqs WHERE user_id = $1 AND sender_email != 'copilot@pruva.ai'", [userId]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Outlook bağlantısı kesildi.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[OUTLOOK DISCONNECT ERR]', err);
        res.status(500).json({ error: 'Bağlantı kesilirken hata oluştu.' });
    } finally {
        client.release();
    }
});

const mailScanner = require('../services/mailScanner');

// @route   POST api/outlook/scan
// @desc    E-postaları tarar ve AI ile işler
router.post('/scan', auth, async (req, res) => {
    try {
        const result = await mailScanner.scanEmails(req.user.id);
        res.json(result);
    } catch (err) {
        console.error('[OUTLOOK SCAN ERR]', err);
        res.status(500).json({ error: 'Mailler taranırken hata oluştu.' });
    }
});

module.exports = router;
