require('dotenv').config();

async function sendViaGraph(accessToken, mailData) {
  const graphPayload = {
    message: {
      subject: mailData.subject,
      body: { contentType: 'HTML', content: mailData.body },
      toRecipients: mailData.to.map(email => ({ emailAddress: { address: email } })),
      ccRecipients: (mailData.cc || []).map(email => ({ emailAddress: { address: email } }))
    },
    saveToSentItems: true
  };

  if (mailData.attachments && mailData.attachments.length > 0) {
    graphPayload.message.attachments = [];
    for (const att of mailData.attachments) {
      if (att.path) {
        try {
          let buffer;
          if (att.path.startsWith('http')) {
            const response = await fetch(att.path);
            if (response.ok) {
              buffer = await response.arrayBuffer();
            }
          } else if (att.path.startsWith('uploads/')) {
            const fs = require('fs');
            const path = require('path');
            const localPath = path.join(__dirname, '..', '..', att.path);
            if (fs.existsSync(localPath)) {
              buffer = fs.readFileSync(localPath);
            }
          }

          if (buffer) {
            const base64Data = Buffer.from(buffer).toString('base64');
            graphPayload.message.attachments.push({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: att.name || "Ekli_Dosya",
              contentType: att.type || "application/octet-stream",
              contentBytes: base64Data
            });
          }
        } catch (e) {
          console.error('[EMAIL SENDER] Attachment download error:', e);
        }
      }
    }
  }

  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(graphPayload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph sendMail hatası: ${response.status} — ${errorText}`);
  }
  return { method: 'graph', success: true };
}

async function sendViaResend(mailData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY tanımlanmamış');
  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@pruvahub.com',
    to: mailData.to,
    cc: mailData.cc || [],
    subject: mailData.subject,
    html: mailData.body
  });
  return { method: 'resend', success: true, id: result.id };
}

async function sendEmail(userId, mailData) {
  // 1) Microsoft Graph
  try {
    const db = require('../db');
    const accountResult = await db.query(
      'SELECT home_account_id FROM pricing_outlook_accounts WHERE user_id = $1 AND is_connected = true',
      [userId]
    );
    if (accountResult.rows.length > 0) {
      const { cca } = require('../outlookConfig');
      if (cca) {
        const homeAccountId = accountResult.rows[0].home_account_id;
        const account = await cca.getTokenCache().getAccountByHomeId(homeAccountId);
        if (account) {
          const tokenResponse = await cca.acquireTokenSilent({ account, scopes: ['mail.send'] });
          return await sendViaGraph(tokenResponse.accessToken, mailData);
        }
      }
    }
  } catch (graphError) {
    console.warn('[Email] Graph gönderim başarısız:', graphError.message);
    // If we are in production, we should probably throw this so the user knows!
    if (process.env.NODE_ENV === 'production') {
       throw new Error('Microsoft Outlook üzerinden e-posta gönderilemedi: ' + graphError.message);
    }
  }
  // 2) Resend API (Fallback)
  try {
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(mailData);
    }
  } catch (resendError) {
    console.warn('[Email] Resend gönderim başarısız:', resendError.message);
  }
  // 3) Dev mode
  console.log('[Email] DEV MODE — Email gönderildi (simülasyon):');
  console.log('  To:', mailData.to.join(', '));
  console.log('  Subject:', mailData.subject);
  console.log('  Body:', mailData.body.substring(0, 200));
  
  // Return dev-console but with a warning message so the frontend knows it was simulated!
  if (process.env.NODE_ENV === 'production') {
      throw new Error('E-posta gönderimi başarısız oldu (API hatası veya yetki eksikliği).');
  }
  
  return { method: 'dev-console', success: true, note: 'Email sadece console\'a loglandı (dev mode).' };
}

module.exports = { sendEmail };
