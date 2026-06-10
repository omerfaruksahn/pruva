const express = require('express');
const router = express.Router();
const auth = require('../authMiddleware');
const { analyzeCommand } = require('../services/aiService');
const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const admin = require('../firebaseAdmin');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Desteklenmeyen dosya formatı.'), false);
  }
});

async function handleResetHistory(client, rfqId, userId, res) {
  await client.query('DELETE FROM pricing_actions WHERE rfq_id = $1 AND user_id = $2', [rfqId, userId]);
  await client.query('COMMIT');
  return res.json({
    success: true,
    action: 'GENERAL',
    summary: 'Hafıza başarıyla silindi. Geçmiş kısıtlamalarımı unuttum. Lütfen komutunuzu tekrar gönderin.',
    confidence: 1
  });
}

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
      
      if (message.trim().toUpperCase() === 'RESET_HISTORY' || message.trim().toUpperCase() === 'RESET HİSTORY' || message.trim().toUpperCase() === 'RESET HISTORY') {
        await handleResetHistory(client, rfqId, req.user.id, res);
        return;
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
      let isRfqIdDirect = false;
      
      if (typeof conversationId === 'string' && conversationId.startsWith('rfq-')) {
        const match = conversationId.match(/\d+/);
        if (match) {
            rfqId = parseInt(match[0]);
            isRfqIdDirect = true;
        }
      }
      
      if (message.trim().toUpperCase() === 'RESET_HISTORY' || message.trim().toUpperCase() === 'RESET HİSTORY' || message.trim().toUpperCase() === 'RESET HISTORY') {
          await handleResetHistory(client, rfqId, req.user.id, res);
          return;
      }
        
      if (!isRfqIdDirect) {
          // If conversationId is not an 'rfq-X' string, it might be a customer_id or an Outlook string.
          // Fallback 1: Try Outlook conversation_id
          const convRfq = await client.query(
            "SELECT id FROM pricing_rfqs WHERE conversation_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1",
            [String(conversationId), req.user.id]
          );
          
          if (convRfq.rows.length > 0) {
            rfqId = convRfq.rows[0].id;
          } else if (email) {
            // Fallback 2: Try sender_email
            const latestRfq = await client.query(
              "SELECT id FROM pricing_rfqs WHERE sender_email = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1",
              [email, req.user.id]
            );
            if (latestRfq.rows.length > 0) {
              rfqId = latestRfq.rows[0].id;
            }
          }
      }
      
      // Kullanıcının komutunu pricing_actions tablosunda saklayalım
      if (rfqId) {
        await client.query(
          `INSERT INTO pricing_actions (user_id, rfq_id, action_type, title, description, suggested_mail, carriers_to_contact, status, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [req.user.id, rfqId, 'USER_MESSAGE', 'Kullanıcı Mesajı', message, null, null, 'COMPLETED', req.body.attachments ? JSON.stringify(req.body.attachments) : '[]']
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

    // Ekli dosyaları çekip Gemini için base64 (inlineData) formatına dönüştürelim
    let fileParts = [];
    if (req.body.attachments && Array.isArray(req.body.attachments)) {
      for (const att of req.body.attachments) {
        if (att.path) {
          try {
            let buffer;
            if (att.path.startsWith('http')) {
              const response = await fetch(att.path);
              if (response.ok) {
                buffer = await response.arrayBuffer();
              }
            } else if (att.path.startsWith('uploads/')) {
              const localPath = path.join(__dirname, '..', '..', att.path);
              if (fs.existsSync(localPath)) {
                buffer = fs.readFileSync(localPath);
              }
            }
            
            if (buffer) {
              fileParts.push({
                inlineData: {
                  data: Buffer.from(buffer).toString('base64'),
                  mimeType: att.type || 'application/pdf'
                }
              });
            }
          } catch (e) {
            console.error('[ATTACHMENT DOWNLOAD ERROR]', e);
          }
        }
      }
    }

    // 3) Yapay zeka analizi çağır
    const enrichedContext = { ...context, carriers, userId: req.user.id, history };
    const result = await analyzeCommand(message, enrichedContext, fileParts);
    console.log(`[AI] User: "${message.substring(0, 50)}" → Action: ${result.action} (${result.confidence})`);
    
    // 4) Yapay zekanın cevabını veya aksiyon önerisini veritabanına kaydet
    if (rfqId) {
      const isDraftAction = ['SEND_CUSTOM_EMAIL', 'SEND_RATE_REQUEST', 'SEND_OFFER', 'SEND_MISSING_INFO', 'SEND_FOLLOWUP'].includes(result.action);
      
      let suggestedMail = null;
      if (result.suggestedMessage) {
        let toEmail = result.details?.to_email || '';
        if ((toEmail.endsWith('@pruva.ai') && toEmail !== 'copilot@pruva.ai') || !toEmail) {
           toEmail = email || '';
        }
        suggestedMail = {
          to: toEmail,
          subject: result.details?.subject || 'Pruva Lojistik',
          body: result.suggestedMessage,
          attachments: req.body.attachments || []
        };
      }
      
      // Sadece yapay zekanın cevabını kaydet (kullanıcının mesajı zaten yukarıda kaydedildi)

      // Sonra yapay zekanın cevabını kaydet
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
    res.status(500).json({ success: false, action: 'GENERAL', summary: 'Bir hata oluştu: ' + error.message, confidence: 0 });
  } finally {
    client.release();
  }
});

// @route   POST api/ai/upload
// @desc    Dosya yükler ve Firebase Storage'a atar
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.user.id}_${Date.now()}${fileExtension}`;
    const filePath = file.path;
    const destination = `chat_attachments/${fileName}`;

    try {
      const bucket = admin.storage().bucket();
      await bucket.upload(filePath, {
        destination: destination,
        metadata: {
          contentType: file.mimetype
        }
      });
      
      // Public URL oluştur
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`;

      // Temp dosyayı sil
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        file: {
          name: file.originalname,
          path: fileUrl,
          type: file.mimetype,
          size: file.size
        }
      });
    } catch (uploadError) {
      console.error('[FIREBASE UPLOAD ERROR]', uploadError);
      
      // Fallback: Local upload
      const localFileName = `uploads/${fileName}`;
      fs.renameSync(filePath, path.join(__dirname, '..', '..', localFileName));
      return res.json({
        success: true,
        file: {
          name: file.originalname,
          path: localFileName,
          type: file.mimetype,
          size: file.size,
          isLocal: true,
          warning: 'Firebase Storage yüklemesi başarısız oldu, dosya geçici olarak sunucuya kaydedildi.'
        }
      });
    }

  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

// @route   GET api/ai/conversations
// @desc    Kullanıcının aktif AI konuşma listesini ve geçmişini getirir
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
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
        r.conversation_id,
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
        r.is_archived,
        c.company_name as customer_company,
        c.id as customer_id,
        c.customer_type,
        c.active_regions
      FROM pricing_rfqs r
      LEFT JOIN pricing_customers c ON LOWER(c.email) = LOWER(r.sender_email) AND c.user_id = $1
      WHERE r.user_id = $1 AND (r.category IS DISTINCT FROM 'OTHER' OR r.sender_email = 'copilot@pruva.ai')
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const convMap = {};
    result.rows.forEach(row => {
      const email = (row.sender_email || '').toLowerCase().trim();
      const isCopilot = email === 'copilot@pruva.ai';
      // Müşteri bazlı gruplama yap (e-posta adresine göre)
      const key = isCopilot ? 'copilot' : email;
      
      if (!convMap[key]) {
        const company = isCopilot ? 'Pruva AI Co-pilot' : (row.customer_company || row.sender_name || email.split('@')[0]);
        convMap[key] = {
          id: isCopilot ? 'copilot' : (row.customer_id || `rfq-${row.id}`),
          rfqId: row.id, // Keep a reference to the latest rfq id for actions
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
          isArchived: row.is_archived || false,
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
      SELECT a.*, r.sender_email, r.conversation_id 
      FROM pricing_actions a 
      JOIN pricing_rfqs r ON r.id = a.rfq_id 
      WHERE a.user_id = $1
      ORDER BY a.created_at ASC
    `, [userId]);
    
    for (const action of actions.rows) {
      const actionEmail = (action.sender_email || '').toLowerCase().trim();
      // Copilot konuşması convMap'te 'copilot' anahtarıyla tutuluyor — e-postayla DEĞİL.
      // (Eski kod 'copilot@pruva.ai' ile arıyordu → copilot geçmişi her yenilemede kayboluyordu)
      const key = actionEmail === 'copilot@pruva.ai' ? 'copilot' : actionEmail;
      
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

        let processedAttachments = [];
        if (action.attachments && Array.isArray(action.attachments)) {
          for (const att of action.attachments) {
            let signedUrl = att.path;
            // Zaten public URL döndürüyoruz, ek işleme gerek yok
            processedAttachments.push({ ...att, signedUrl });
          }
        }

        let text = action.description || action.body || action.preview || action.subject;
        
        if (action.action_type !== 'USER_MESSAGE' && action.action_type !== 'AI_RESPONSE') {
          if (action.status === 'CANCELLED') {
            type = 'ai_action';
            text = '❌ Öneri reddedildi.';
          } else if (action.status === 'COMPLETED') {
            type = 'ai_action';
            text = '✅ İşlem başarıyla onaylandı ve gönderildi.';
            
            // Onaylanmış bir mail ise, giden maili de ekleyelim
            if (action.suggested_mail) {
              let sentMailObj = typeof action.suggested_mail === 'string' ? JSON.parse(action.suggested_mail) : action.suggested_mail;
              conv.messages.push({
                sender: 'Pruva AI (Giden Mail)',
                time: new Date(action.created_at).toLocaleString('tr-TR'),
                timestamp: new Date(action.created_at),
                type: 'outgoing',
                text: sentMailObj.body || 'Giden mail içeriği',
                action: action.action_type || action.type,
                actionId: action.id,
                attachments: processedAttachments
              });
            }
          }
        }

        conv.messages.push({
          sender: sender,
          time: new Date(action.created_at).toLocaleString('tr-TR'),
          timestamp: new Date(action.created_at),
          type: type,
          text: text,
          action: action.action_type || action.type,
          actionId: action.id,
          suggestedMail: action.suggested_mail,
          attachments: processedAttachments
        });
      }
    }

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
        text: "Merhaba! Ben Pruva AI Co-pilot. Bana dilediğiniz lojistik komutunu verebilirsiniz. Örneğin:\n\n• 'destek@pruvahub.com adresine [Firma Adı] adıyla tanıtım e-postası tasarla'\n• 'Hamburg\\'dan İzmir\\'e TIR fiyatı al'"
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

// ── Konuşma ID'sini muhatap e-postasına çözümle ──
// Frontend'e giden conv.id üç biçimde olabilir:
//   'copilot'      → copilot kanalı
//   'rfq-<sayı>'   → müşteri kaydı olmayan konuşma (RFQ id'si)
//   <sayı>         → pricing_customers.id (müşteri kaydı olan konuşma)
// Konuşmalar e-postaya göre gruplandığı için sil/arşivle işlemleri
// o e-postanın TÜM RFQ'larına uygulanmalı. (Eski kod parseInt(convId) ile
// müşteri ID'sini RFQ ID'si sanıp YANLIŞ kaydı silebiliyordu!)
async function resolveConversationEmail(client, convId, userId) {
  if (String(convId).startsWith('rfq-')) {
    const rfqId = parseInt(String(convId).slice(4));
    if (isNaN(rfqId)) return null;
    const r = await client.query(
      'SELECT sender_email FROM pricing_rfqs WHERE id = $1 AND user_id = $2',
      [rfqId, userId]
    );
    return r.rows[0]?.sender_email || null;
  }
  const customerId = parseInt(convId);
  if (isNaN(customerId)) return null;
  const c = await client.query(
    'SELECT email FROM pricing_customers WHERE id = $1 AND user_id = $2',
    [customerId, userId]
  );
  return c.rows[0]?.email || null;
}

// @route   DELETE api/ai/conversations/:id
// @desc    Konuşma geçmişini kalıcı olarak siler (tüm ilişkili tablolar dahil)
router.delete('/conversations/:id', auth, async (req, res) => {
  const client = await db.getClient();
  try {
    const userId = req.user.id;
    const convId = req.params.id;

    await client.query('BEGIN');

    if (convId === 'copilot') {
      // Copilot: Sadece aksiyonları sil, RFQ kaydını koru (kanal yaşasın)
      await client.query(
        "DELETE FROM pricing_actions WHERE user_id = $1 AND rfq_id IN (SELECT id FROM pricing_rfqs WHERE sender_email = 'copilot@pruva.ai' AND user_id = $1)",
        [userId]
      );
    } else {
      // Konuşma = aynı e-postadan gelen TÜM RFQ'lar → e-postayı çözümle
      const email = await resolveConversationEmail(client, convId, userId);
      if (!email) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Konuşma bulunamadı.' });
      }

      // Bu e-postanın tüm RFQ id'lerini al (sahiplik garantili)
      const rfqsRes = await client.query(
        'SELECT id FROM pricing_rfqs WHERE LOWER(sender_email) = LOWER($1) AND user_id = $2',
        [email, userId]
      );
      const rfqIds = rfqsRes.rows.map(r => r.id);
      if (rfqIds.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Konuşma bulunamadı.' });
      }

      // Cascade silme (foreign key sırasına göre) — tüm RFQ'lar için
      await client.query('DELETE FROM pricing_carrier_performance WHERE rfq_id = ANY($1)', [rfqIds]);
      await client.query('DELETE FROM pricing_rates WHERE rfq_id = ANY($1)', [rfqIds]);
      await client.query('DELETE FROM pricing_actions WHERE rfq_id = ANY($1) AND user_id = $2', [rfqIds, userId]);
      await client.query('DELETE FROM pricing_rfqs WHERE id = ANY($1) AND user_id = $2', [rfqIds, userId]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Konuşma geçmişi kalıcı olarak silindi.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Conversation delete error:', err);
    res.status(500).json({ error: 'Silme işlemi sırasında bir hata oluştu.' });
  } finally {
    client.release();
  }
});

// @route   PUT api/ai/conversations/:id/archive
// @desc    Konuşmayı (muhatabın tüm RFQ'larını) arşivler
router.put('/conversations/:id/archive', auth, async (req, res) => {
  const client = await db.getClient();
  try {
    const userId = req.user.id;
    const convId = req.params.id;

    await client.query('BEGIN');

    if (convId !== 'copilot') {
      const email = await resolveConversationEmail(client, convId, userId);
      if (!email) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Konuşma bulunamadı.' });
      }
      const upd = await client.query(
        'UPDATE pricing_rfqs SET is_archived = true WHERE LOWER(sender_email) = LOWER($1) AND user_id = $2',
        [email, userId]
      );
      if (upd.rowCount === 0) {
        // Eski kod burada da "Arşivlendi!" diyordu — sessiz sahte başarı düzeltildi
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Arşivlenecek konuşma bulunamadı.' });
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Konuşma arşivlendi.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Conversation archive error:', err);
    res.status(500).json({ error: 'Arşivleme işlemi sırasında bir hata oluştu.' });
  } finally {
    client.release();
  }
});

// @route   PUT api/ai/conversations/:id/unarchive
// @desc    Konuşmayı arşivden çıkarır
router.put('/conversations/:id/unarchive', auth, async (req, res) => {
  const client = await db.getClient();
  try {
    const userId = req.user.id;
    const convId = req.params.id;

    await client.query('BEGIN');

    if (convId !== 'copilot') {
      const email = await resolveConversationEmail(client, convId, userId);
      if (!email) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Konuşma bulunamadı.' });
      }
      const upd = await client.query(
        'UPDATE pricing_rfqs SET is_archived = false WHERE LOWER(sender_email) = LOWER($1) AND user_id = $2',
        [email, userId]
      );
      if (upd.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Arşivden çıkarılacak konuşma bulunamadı.' });
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Konuşma arşivden çıkarıldı.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Conversation unarchive error:', err);
    res.status(500).json({ error: 'Arşivden çıkarma işlemi sırasında bir hata oluştu.' });
  } finally {
    client.release();
  }
});

module.exports = router;
