// ─────────────────────────────────────────────────────────────
// PAI (Pruva AI) — Text-to-Speech Route
// Edge-TTS üzerinden insansı ses sentezi sağlar.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../authMiddleware');
const { synthesizeSpeech, getAvailableVoices, MAX_TEXT_LENGTH } = require('../services/ttsService');

// ─── TTS Özel Rate Limiter ───
const ttsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 dakika
    max: process.env.NODE_ENV === 'production' ? 60 : 999999,
    message: {
        success: false,
        message: 'Ses sentezleme limitine ulaştınız. Lütfen bir süre bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── POST /api/tts/synthesize ───
// Body: { text: string, voice?: string }
// Response: audio/mpeg binary stream
router.post('/synthesize', authMiddleware, ttsLimiter, async (req, res) => {
    try {
        const { text, voice } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir metin (text) gerekli.'
            });
        }

        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Metin çok uzun. Maksimum ${MAX_TEXT_LENGTH} karakter.`
            });
        }

        const audioBuffer = await synthesizeSpeech(text.trim(), voice || undefined);

        // MP3 olarak döndür
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'public, max-age=86400', // 24 saat tarayıcı cache
            'X-TTS-Voice': voice || 'default'
        });

        return res.send(audioBuffer);
    } catch (err) {
        console.error('[TTS ROUTE] Sentez hatası:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message || 'Ses sentezleme sırasında bir hata oluştu.'
        });
    }
});

// ─── GET /api/tts/voices ───
// Kullanılabilir Türkçe sesleri listeler
router.get('/voices', authMiddleware, async (req, res) => {
    try {
        const voices = await getAvailableVoices();
        return res.json({
            success: true,
            voices,
            default: 'tr-TR-EmelNeural'
        });
    } catch (err) {
        console.error('[TTS ROUTE] Ses listesi hatası:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Ses listesi alınamadı.'
        });
    }
});

module.exports = router;
