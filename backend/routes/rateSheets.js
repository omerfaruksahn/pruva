const express = require('express');
const router = express.Router();
const db = require('../db');
const { analyzeRateSheetImage } = require('../services/aiService');

/**
 * PRUVA — Rate Sheets Routing
 * carrier rate sheet görsellerini Gemini Vision ile işler ve kaydeder.
 */

// 1. POST /api/rate-sheets/upload — Görsel yükle, Gemini Vision ile analiz et, kaydet
router.post('/upload', async (req, res, next) => {
    const { file, filename, mimeType } = req.body;
    const userId = '1'; // Gerçek uygulamada req.user?.id veya '1'

    if (!file) {
        return res.status(400).json({ success: false, message: 'Yüklenecek dosya verisi (base64) bulunamadı.' });
    }

    // Base64 veri önekini temizle (data:image/...;base64, prefix'ini temizler)
    const base64Clean = file.replace(/^data:image\/\w+;base64,/, '');
    let detectedMimeType = mimeType || 'image/png';

    if (file.includes(';base64,')) {
        const parts = file.split(';base64,');
        detectedMimeType = parts[0].replace('data:', '');
    }

    let client;
    try {
        console.log(`[RATE SHEET] Analiz başlatılıyor: "${filename || 'gorsel.png'}" (${detectedMimeType})`);
        
        // Gemini Vision Analizi
        const analysis = await analyzeRateSheetImage(base64Clean, detectedMimeType, filename);
        console.log('[RATE SHEET] Gemini analizi başarılı:', JSON.stringify(analysis));

        // DB İşlemlerini transaction ile yürütelim
        client = await db.getClient();
        await client.query('BEGIN');

        // 1) rate_sheets tablosuna kaydet
        const insertSheetQuery = `
            INSERT INTO rate_sheets (user_id, carrier_name, valid_from, valid_until, status, filename)
            VALUES ($1, $2, NOW(), $3, 'ACTIVE', $4)
            RETURNING id;
        `;
        const sheetParams = [
            userId,
            analysis.carrier_name || 'Bilinmeyen Taşıyıcı',
            analysis.valid_until ? new Date(analysis.valid_until) : null,
            filename || 'unnamed_rate_sheet.png'
        ];
        
        const sheetResult = await client.query(insertSheetQuery, sheetParams);
        const sheetId = sheetResult.rows[0].id;

        // 2) rate_sheet_items tablosuna bulk insert
        if (analysis.items && analysis.items.length > 0) {
            for (const item of analysis.items) {
                const insertItemQuery = `
                    INSERT INTO rate_sheet_items (
                        sheet_id, user_id, pol, pod, container_type, price, currency, includes, transit_days, valid_until
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                `;
                const itemParams = [
                    sheetId,
                    userId,
                    item.pol || 'Shanghai',
                    item.pod || 'Istanbul',
                    item.container_type || '40HC',
                    item.price || 0,
                    item.currency || 'USD',
                    item.includes || [],
                    item.transit_days || null,
                    analysis.valid_until ? new Date(analysis.valid_until) : null
                ];
                await client.query(insertItemQuery, itemParams);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Navlun fiyat görseli başarıyla analiz edildi ve kaydedildi.',
            sheetId,
            carrierName: analysis.carrier_name,
            validUntil: analysis.valid_until,
            extractedCount: analysis.items ? analysis.items.length : 0
        });

    } catch (err) {
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('[RATE SHEET ERR] Rollback hatası:', rollbackErr.message);
            }
        }
        console.error('[RATE SHEET ERR] Yükleme/Analiz hatası:', err);
        next(err);
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
});

// 2. GET /api/rate-sheets — Yüklenen sheet listesi
router.get('/', async (req, res, next) => {
    const userId = '1';
    try {
        const result = await db.query(
            'SELECT * FROM rate_sheets WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
});

// 3. GET /api/rate-sheets/query — Belirli rota için en uygun fiyatı sorgula
router.get('/query', async (req, res, next) => {
    const { pol, pod } = req.query;
    
    if (!pol || !pod) {
        return res.status(400).json({ success: false, message: 'Lütfen pol ve pod parametrelerini gönderin.' });
    }

    try {
        const queryText = `
            SELECT rsi.*, rs.carrier_name, rs.filename
            FROM rate_sheet_items rsi
            JOIN rate_sheets rs ON rsi.sheet_id = rs.id
            WHERE rsi.pol ILIKE $1 AND rsi.pod ILIKE $2 AND rs.status = 'ACTIVE'
            ORDER BY rsi.price ASC;
        `;
        const result = await db.query(queryText, [pol, pod]);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
});

// 4. DELETE /api/rate-sheets/:id — Navlun sayfasını sil (cascade ile item'lar silinir)
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM rate_sheets WHERE id = $1', [id]);
        res.json({ success: true, message: 'Navlun fiyat görseli ve ilişkili satırları başarıyla silindi.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
