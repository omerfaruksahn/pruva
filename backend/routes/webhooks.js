const express = require('express');
const router = express.Router();
const mailScanner = require('../services/mailScanner');
const db = require('../db');

// @route   POST api/webhooks/outlook
// @desc    Microsoft Graph Webhook Endpoint
router.post('/outlook', async (req, res) => {
    // 1. Validation Token Kontrolü (Abonelik Doğrulaması)
    if (req.query && req.query.validationToken) {
        console.log('[WEBHOOK] Microsoft Subscription Validation alındı.');
        return res.status(200).send(req.query.validationToken);
    }

    // 2. Notification (Yeni Mail Geldiğinde)
    if (req.body && req.body.value) {
        console.log(`[WEBHOOK] ${req.body.value.length} adet yeni bildirim alındı.`);

        for (const notification of req.body.value) {
            try {
                // notification.resourceData içerisinden e-posta veya account bilgisi gelir
                const subscriptionId = notification.subscriptionId;

                // Abonelikten hangi kullanıcıya ait olduğunu bul
                const accountResult = await db.query(
                    'SELECT user_id FROM pricing_outlook_accounts WHERE subscription_id = $1',
                    [subscriptionId]
                );

                if (accountResult.rows.length > 0) {
                    const userId = accountResult.rows[0].user_id;
                    console.log(`[WEBHOOK] Kullanıcı ${userId} için yeni mail algılandı. Taramaya başlanıyor...`);
                    
                    // mailScanner'ı sadece o kullanıcı için tetikle
                    const scanResult = await mailScanner.scanEmails(userId);
                    
                    if (scanResult && scanResult.processed_count > 0) {
                        const io = req.app.get('io');
                        if (io) {
                            io.to(`user_${userId}`).emit('NEW_AI_ACTION', {
                                type: 'NEW_EMAILS_SCANNED',
                                count: scanResult.processed_count,
                                message: `Webhook: ${scanResult.processed_count} adet yeni e-posta işlendi.`
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('[WEBHOOK ERR] Bildirim işlenirken hata:', err);
            }
        }
    }

    // Microsoft'a 202 Accepted dönülmesi zorunludur
    res.status(202).send();
});

// @route   POST api/webhooks/simulate
// @desc    Sistemi test etmek için Webhook simülasyonu
router.post('/simulate', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'userId gerekli' });
    }

    console.log(`[WEBHOOK SIMULATION] Kullanıcı ${userId} için webhook simüle ediliyor...`);
    
    try {
        const scanResult = await mailScanner.scanEmails(userId);
        
        if (scanResult && scanResult.processed_count >= 0) {
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${userId}`).emit('NEW_AI_ACTION', {
                    type: 'NEW_EMAILS_SCANNED',
                    count: scanResult.processed_count,
                    message: `Simülasyon: ${scanResult.processed_count} adet e-posta tarandı.`
                });
            }
            res.json({ success: true, processed_count: scanResult.processed_count });
        } else {
            res.status(500).json({ error: 'Tarama tamamlanamadı' });
        }
    } catch (err) {
        console.error('[WEBHOOK SIMULATION ERR]', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
