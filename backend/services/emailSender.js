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
  }
  // 2) Resend API
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
  return { method: 'dev-console', success: true, note: 'Email sadece console\'a loglandı (dev mode).' };
}

module.exports = { sendEmail };
