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
        [req.user.id]
      );
      carriers = carrierResult.rows;
    } catch (e) {
      console.warn('[AI Route] Carrier query failed:', e.message);
    }

    // 1) Mesajları bağlamak için RFQ ID'yi bulalım veya oluşturalım
    let rfqId = null;
    const conversationId = context?.conversationId;
    const email = context?.email;
    
    if (conversationId === 'copilot' || email === 'copilot@pruva.ai') {
      // Kullanıcının co-pilot chat geçmişini bağlamak için ana bir RFQ kaydı bul veya oluştur
      const baseRfqRes = await db.query(
        "SELECT id FROM pricing_rfqs WHERE sender_email = 'copilot@pruva.ai' AND user_id = $1 LIMIT 1",
        [req.user.id]
      );
      if (baseRfqRes.rows.length > 0) {
        rfqId = baseRfqRes.rows[0].id;
      } else {
        const insertBase = await db.query(
          `INSERT INTO pricing_rfqs (user_id, outlook_message_id, sender_email, sender_name, subject, body, received_at, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [req.user.id, 'copilot-chat-base', 'copilot@pruva.ai', 'Pruva AI Co-pilot', 'Co-pilot Sohbeti', 'Co-pilot Sohbeti', new Date(), 'COPILOT', 'COMPLETED']
        );
        rfqId = insertBase.rows[0].id;
      }
      
      // Kullanıcının yazdığı yeni co-pilot komutunu veri tabanında bir RFQ mesajı olarak sakla (outgoing/giden)
      const insertUserMsg = await db.query(
        `INSERT INTO pricing_rfqs (user_id, outlook_message_id, sender_email, sender_name, subject, body, received_at, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [req.user.id, 'copilot-msg-' + Date.now(), 'copilot@pruva.ai', 'Kullanıcı', message, message, new Date(), 'COPILOT', 'COMPLETED']
      );
      
      // Yapay zeka cevabını doğrudan bu kullanıcı komutuna ait RFQ kaydına bağlayalım
      rfqId = insertUserMsg.rows[0].id;
    } else if (conversationId) {
      // Spesifik bir e-posta akışındayız. rfqId'yi tespit et
      if (typeof conversationId === 'number') {
        rfqId = conversationId;
      } else if (conversationId.startsWith('rfq-')) {
        rfqId = parseInt(conversationId.replace('rfq-', ''));
      } else {
        const latestRfq = await db.query(
          "SELECT id FROM pricing_rfqs WHERE sender_email = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1",
          [email || '', req.user.id]
        );
        if (latestRfq.rows.length > 0) {
          rfqId = latestRfq.rows[0].id;
        }
      }
      
      // Kullanıcının komutunu pricing_actions tablosunda saklayalım
      if (rfqId) {
        await db.query(
          `INSERT INTO pricing_actions (user_id, rfq_id, action_type, title, description, suggested_mail, carriers_to_contact, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [req.user.id, rfqId, 'USER_MESSAGE', 'Kullanıcı Mesajı', message, null, null, 'COMPLETED']
        );
      }
    }
    
    // 2) Yapay zeka analizi çağır
    const enrichedContext = { ...context, carriers, userId: req.user.id };
    const result = await analyzeCommand(message, enrichedContext);
    console.log(`[AI] User: "${message.substring(0, 50)}" → Action: ${result.action} (${result.confidence})`);
    
    // 3) Yapay zekanın cevabını veya aksiyon önerisini veritabanına kaydet
    if (rfqId) {
      const isDraftAction = ['SEND_CUSTOM_EMAIL', 'SEND_RATE_REQUEST', 'SEND_OFFER', 'SEND_MISSING_INFO', 'SEND_FOLLOWUP'].includes(result.action);
      
      let suggestedMail = null;
      if (result.action === 'SEND_CUSTOM_EMAIL') {
        suggestedMail = {
          to: result.details?.to_email || '',
          subject: result.details?.subject || 'Pruva Lojistik Tanıtım Maili',
          body: result.suggestedMessage || ''
        };
      } else if (result.suggestedMessage) {
        suggestedMail = {
          to: '',
          subject: '',
          body: result.suggestedMessage
        };
      }
      
      await db.query(
        `INSERT INTO pricing_actions (user_id, rfq_id, action_type, title, description, suggested_mail, carriers_to_contact, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.user.id,
          rfqId,
          result.action === 'GENERAL' ? 'AI_RESPONSE' : result.action,
          result.action === 'GENERAL' ? 'Pruva AI Yanıtı' : 'Yapay Zeka Önerisi',
          result.summary,
          suggestedMail ? JSON.stringify(suggestedMail) : null,
          result.details?.carriers ? JSON.stringify(result.details.carriers) : null,
          isDraftAction ? 'PENDING' : 'COMPLETED'
        ]
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ success: false, action: 'GENERAL', summary: 'Bir hata oluştu, lütfen tekrar deneyin.', confidence: 0 });
  }
});

module.exports = router;
