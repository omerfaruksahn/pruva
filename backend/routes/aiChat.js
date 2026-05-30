const express = require('express');
const router = express.Router();
const auth = require('../authMiddleware');
const { analyzeCommand } = require('../services/aiService');
const db = require('../db');

router.post('/analyze', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message alanı gerekli' });
    }
    let carriers = [];
    try {
      const carrierResult = await db.query(
        'SELECT name, email, category FROM pricing_carriers WHERE user_id = $1 AND is_active = true',
        [req.user.id] // Note: pricingData.js uses req.user.id, which authMiddleware populates! Let's ensure consistency by using req.user.id.
      );
      carriers = carrierResult.rows;
    } catch (e) {
      console.warn('[AI Route] Carrier query failed:', e.message);
    }
    const enrichedContext = { ...context, carriers, userId: req.user.id };
    const result = await analyzeCommand(message, enrichedContext);
    console.log(`[AI] User: "${message.substring(0, 50)}" → Action: ${result.action} (${result.confidence})`);
    res.json(result);
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ success: false, action: 'GENERAL', summary: 'Bir hata oluştu, lütfen tekrar deneyin.', confidence: 0 });
  }
});

module.exports = router;
