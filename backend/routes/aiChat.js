const express = require('express');
const router = express.Router();
const auth = require('../authMiddleware');
const { analyzeCommand } = require('../services/aiService');
const db = require('../db');

// @route   POST api/ai/analyze
// @desc    Kullanıcı komutunu analiz eder ve AI önerisi üretir
router.post('/analyze', auth, async (req, res) => {
  const client = await db.getClient();
  try {
    const { message, context } = req.body;
    
    // 1) Giriş Parametresi Doğrulaması (Input Validation)
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'mesaj alanı zorunludur ve metin tipinde olmalıdır.' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: 'mesaj alanı en fazla 5000 karakter olabilir.' });
    }
    if (context && typeof context !== 'object') {
      return res.status(400).json({ error: 'context alanı geçerli bir nesne olmalıdır.' });
    }

    await client.query('BEGIN');

    let carriers = [];
    try {
      const carrierResult = await client.query(
        'SELECT name, email, category FROM pricing_carriers WHERE user_id = $1 AND is_active = true',
        [req.user.id]
      );
      carriers = carrierResult.rows;
    } catch (e) {
      console.warn('[AI Route] Carrier query failed:', e.message);
    }

    // Mesajları bağlamak için RFQ ID'yi bulalım veya oluşturalım
    let rfqId = null;
    const conversationId = context?.conversationId;
    const email = context?.email;
    
    if (conversationId === 'copilot' || email === 'copilot@pruva.ai') {
      // Kullanıcının co-pilot chat geçmişini bağlamak için ana bir RFQ kaydı bul veya oluştur
      const baseRfqRes = await client.query(
        "SELECT id FROM pricing_rfqs WHERE sender_email = 'copilot@pruva.ai' AND user_id = $1 LIMIT 1",
        [req.user.id]
      );
      if (baseRfqRes.rows.length > 0) {
        rfqId = baseRfqRes.rows[0].id;
      } else {
        const insertBase = await client.query(
          `INSERT INTO pricing_rfqs (user_id, outlook_message_id, sender_email, sender_name, subject, body, received_at, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [req.user.id, 'copilot-chat-base', 'copilot@pruva.ai', 'Pruva AI Co-pilot', 'Co-pilot Sohbeti', 'Co-pilot Sohbeti', new Date(), 'COPILOT', 'COMPLETED']
        );
        rfqId = insertBase.rows[0].id;
      }
      
      // Kullanıcının yazdığı yeni co-pilot komutunu veri tabanında bir aksiyon olarak sakla (outgoing/giden)
      // rfqId'yi ezmiyoruz, base RFQ id'si olarak koruyoruz!
      await client.query(
        `INSERT INTO pricing_actions (user_id, rfq_id, action_type, title, description, suggested_mail, carriers_to_contact, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [req.user.id, rfqId, 'USER_MESSAGE', 'Kullanıcı Mesajı', message, null, null, 'COMPLETED']
      );
    } else if (conversationId) {
      // Spesifik bir e-posta akışındayız. rfqId'yi tespit et
      if (typeof conversationId === 'number') {
        rfqId = conversationId;
      } else if (typeof conversationId === 'string' && conversationId.startsWith('rfq-')) {
        rfqId = parseInt(conversationId.replace('rfq-', ''));
      } else {
        const latestRfq = await client.query(
          "SELECT id FROM pricing_rfqs WHERE sender_email = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1",
          [email || '', req.user.id]
        );
        if (latestRfq.rows.length > 0) {
          rfqId = latestRfq.rows[0].id;
        }
      }
      
      // Kullanıcının komutunu pricing_actions tablosunda saklayalım
      if (rfqId) {
        await client.query(
          `INSERT INTO pricing_actions (user_id, rfq_id, action_type, title, description, suggested_mail, carriers_to_contact, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [req.user.id, rfqId, 'USER_MESSAGE', 'Kullanıcı Mesajı', message, null, null, 'COMPLETED']
        );
      }
    }
    
    // 2) Son 10 mesaja ait kronolojik geçmişi veri tabanından çekelim (Geçmiş Desteği)
    let history = [];
    if (rfqId) {
      const historyRes = await client.query(
        `SELECT action_type, description, suggested_mail 
         FROM pricing_actions 
         WHERE rfq_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [rfqId]
      );
      history = historyRes.rows.reverse().map(h => {
        let text = h.description || '';
        if (h.suggested_mail) {
          try {
            const mailObj = typeof h.suggested_mail === 'string' ? JSON.parse(h.suggested_mail) : h.suggested_mail;
            if (mailObj && mailObj.body) text = mailObj.body;
          } catch (e) {}
        }
        return {
          role: h.action_type === 'USER_MESSAGE' ? 'user' : 'model',
          text: text
        };
      });
    }

    // 3) Yapay zeka analizi çağır
    const enrichedContext = { ...context, carriers, userId: req.user.id, history };
    const result = await analyzeCommand(message, enrichedContext);
    console.log(`[AI] User: "${message.substring(0, 50)}" → Action: ${result.action} (${result.confidence})`);
    
    // 4) Yapay zekanın cevabını veya aksiyon önerisini veritabanına kaydet
    if (rfqId) {
      const isDraftAction = ['SEND_CUSTOM_EMAIL', 'SEND_RATE_REQUEST', 'SEND_OFFER', 'SEND_MISSING_INFO', 'SEND_FOLLOWUP'].includes(result.action);
    console.log('DEBUG AI ACTION:', result.action, 'isDraftAction:', isDraftAction);
      
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
      
      await client.query(
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
    
    await client.query('COMMIT');
    res.json(result);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('AI analyze error:', error);
    res.status(500).json({ success: false, action: 'GENERAL', summary: 'Bir hata oluştu, lütfen tekrar deneyin.', confidence: 0 });
  } finally {
    client.release();
  }
});

// @route   GET api/ai/conversations
// @desc    Kullanıcının aktif AI konuşma listesini ve geçmişini getirir
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Otomatik olarak kullanıcının ürettiği sahte (mock) mailleri temizle (Self-healing)
    try {
      if (userId) {
        await db.query("DELETE FROM pricing_actions WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_rates WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_carrier_performance WHERE rfq_id IN (SELECT id FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1)", [userId]);
        await db.query("DELETE FROM pricing_rfqs WHERE outlook_message_id LIKE 'mock-msg-id-%' AND user_id = $1", [userId]);
      }
    } catch (dbErr) {
      console.warn('[DB CLEANUP WARNING] Sahte e-postalar temizlenemedi:', dbErr.message);
    }
    
    // RFQ'lardan konuşmaları oluştur
    const result = await db.query(`
      SELECT 
        r.id,
        r.sender_email,
        r.sender_name,
        r.subject,
        r.body,
        r.category,
        r.transport_mode,
        r.status,
        r.created_at,
        r.extracted_data,
        r.missing_fields,
        c.company_name as customer_company,
        c.id as customer_id,
        c.customer_type,
        c.active_regions
      FROM pricing_rfqs r
      LEFT JOIN pricing_customers c ON LOWER(c.email) = LOWER(r.sender_email) AND c.user_id = $1
      WHERE r.user_id = $1 AND (r.category IS DISTINCT FROM 'OTHER' OR r.sender_email = 'copilot@pruva.ai')
      ORDER BY r.created_at DESC
    `, [userId]);
    
    const convMap = {};
    result.rows.forEach(row => {
      const isCopilot = row.sender_email === 'copilot@pruva.ai';
      // Copilot ise anahtarı 'copilot' yap, değilse rfq id (row.id) yap
      const key = isCopilot ? 'copilot' : row.id;
      
      if (!convMap[key]) {
        const company = isCopilot ? 'Pruva AI Co-pilot' : (row.customer_company || row.sender_name || row.sender_email.split('@')[0]);
        convMap[key] = {
          id: isCopilot ? 'copilot' : row.id,
          company: company,
          email: row.sender_email,
          subject: row.subject,
          logoLetter: isCopilot ? '🤖' : company.charAt(0).toUpperCase(),
          logoBg: isCopilot ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : `hsl(${Math.abs(company.split('').reduce((a,c) => a + c.charCodeAt(0), 0)) % 360}, 60%, 50%)`,
          status: row.status,
          customerType: row.customer_type || 'unknown',
          regions: row.active_regions || [],
          messages: [],
          lastMessage: row.subject,
          time: new Date(row.created_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        
        // İlk mesaj olarak gelen maili ekle
        if (!isCopilot) {
          convMap[key].messages.push({
            sender: row.sender_name || row.sender_email,
            time: new Date(row.created_at).toLocaleString('tr-TR'),
            timestamp: new Date(row.created_at),
            type: 'incoming',
            text: row.subject + '\n' + (row.body || '').substring(0, 300)
          });
        }
      } else {
        // Eğer copilot konuşmasındaysak ve zaten convMap['copilot'] varsa, bu bir ek copilot komut kaydıdır
        if (isCopilot) {
          convMap[key].messages.push({
            sender: 'Kullanıcı',
            time: new Date(row.created_at).toLocaleString('tr-TR'),
            timestamp: new Date(row.created_at),
            type: 'outgoing',
            text: row.subject
          });
        }
      }
    });
    
    // İlgili action'ları rfq_id bazlı ekle
    const actions = await db.query(`
      SELECT a.*, r.sender_email 
      FROM pricing_actions a 
      JOIN pricing_rfqs r ON r.id = a.rfq_id 
      WHERE a.user_id = $1
      ORDER BY a.created_at ASC
    `, [userId]);
    
    actions.rows.forEach(action => {
      const isCopilot = action.sender_email === 'copilot@pruva.ai';
      const key = isCopilot ? 'copilot' : action.rfq_id;
      
      const conv = convMap[key];
      if (conv) {
        let type = (action.status || '').toUpperCase() === 'PENDING' ? 'ai_suggestion' : 'ai_action';
        let sender = 'Pruva AI';
        
        if (action.action_type === 'USER_MESSAGE') {
          type = 'outgoing';
          sender = 'Kullanıcı';
        } else if (action.action_type === 'AI_RESPONSE') {
          type = 'incoming';
          sender = 'Pruva AI';
        }

        conv.messages.push({
          sender: sender,
          time: new Date(action.created_at).toLocaleString('tr-TR'),
          timestamp: new Date(action.created_at),
          type: type,
          text: action.description || action.body || action.preview || action.subject,
          action: action.action_type || action.type,
          actionId: action.id,
          suggestedMail: action.suggested_mail
        });
      }
    });

    // Pinned Co-pilot kanalının her zaman var olmasını ve en tepede selamlama mesajıyla başlamasını garantileyelim
    if (!convMap['copilot']) {
      convMap['copilot'] = {
        id: 'copilot',
        company: 'Pruva AI Co-pilot',
        email: 'copilot@pruva.ai',
        logoLetter: '🤖',
        logoBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        status: 'COMPLETED',
        customerType: 'standard',
        regions: [],
        messages: [],
        lastMessage: 'Genel Komut & Yapay Zeka Sohbeti',
        time: ''
      };
    }

    const copilotConv = convMap['copilot'];
    const hasGreeting = copilotConv.messages.some(m => m.text && m.text.includes('Ben Pruva AI Co-pilot'));
    if (!hasGreeting) {
      copilotConv.messages.unshift({
        sender: 'Pruva AI',
        time: 'Sistem',
        timestamp: new Date(0), // Her zaman ilk sırada
        type: 'incoming',
        text: 'Merhaba! Ben Pruva AI Co-pilot. Bana dilediğiniz lojistik komutunu verebilirsiniz. Örneğin:<br><br>• <i>\'destek@pruvahub.com adresine [Firma Adı] adıyla tanıtım e-postası tasarla\'</i><br>• <i>\'Hamburg\'dan İzmir\'e TIR fiyatı al\'</i>'
      });
    }

    // Her konuşmanın mesajlarını zamana göre kronolojik sıralayalım
    Object.values(convMap).forEach(conv => {
      conv.messages.sort((a, b) => a.timestamp - b.timestamp);
    });
    
    res.json(Object.values(convMap));
  } catch (err) {
    console.error('Conversations error:', err);
    res.json([]);
  }
});

module.exports = router;
