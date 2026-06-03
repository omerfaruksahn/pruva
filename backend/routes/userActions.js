const express = require('express');
const router = express.Router();
const auth = require('../authMiddleware');
const admin = require('../firebaseAdmin');
const db = require('../db');
const { Resend } = require('resend');

// Full Delete User (Auth + Postgres + Firestore)
router.post('/delete-user', auth, async (req, res) => {
  const { uid } = req.body;
  
  // Güvenlik Kontrolü: Kullanıcı sadece kendi hesabını silebilir (admin değilse)
  if (req.user.id !== uid && req.user.admin !== true) {
      return res.status(403).json({ error: 'Sadece kendi hesabınızı silebilirsiniz.' });
  }

  try {
    // 1. Delete from Firebase Auth
    await admin.auth().deleteUser(uid);
    
    // 2. Delete from Firestore
    await admin.firestore().collection('users').doc(uid).delete();
    
    // 3. Postgres (Opsiyonel ama auth tarafında user varsa postgres'ten de temizlenmeli)
    await db.query('DELETE FROM users WHERE id = $1', [uid]);
    
    res.json({ success: true, message: `Kullanıcı kalıcı olarak silindi.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Email on New Bid (Resend Integration)
router.post('/send-email-on-bid', auth, async (req, res) => {
  const { adId, price, carrierName } = req.body;
  
  if (!adId || !price || !carrierName) {
    return res.status(400).json({ error: 'Eksik parametreler: adId, price, carrierName' });
  }

  try {
    // 1. Fetch the ad details to find the owner
    const adDoc = await admin.firestore().collection('ads').doc(adId).get();
    if (!adDoc.exists) {
      return res.status(404).json({ error: `İlan bulunamadı` });
    }
    const adData = adDoc.data();
    const { ownerId, fromCity, toCity, title } = adData;
    const adTitle = title || `${fromCity} -> ${toCity}`;

    if (!ownerId) {
      return res.status(400).json({ error: `İlanın sahibi yok` });
    }

    // 2. Fetch the ad owner's details
    const userDoc = await admin.firestore().collection('users').doc(ownerId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: `İlan sahibi bulunamadı` });
    }
    const userData = userDoc.data();
    const targetEmail = userData.email;

    if (!targetEmail) {
      return res.status(400).json({ error: `Kullanıcının e-posta adresi yok` });
    }

    // 3. Check notification preferences
    const prefs = userData.notificationPreferences || {};
    if (prefs.email === false) {
      return res.json({ success: true, message: 'Kullanıcı e-posta bildirimlerini kapatmış' });
    }

    // 4. Fetch Resend API Key
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY yapılandırılmamış.' });
    }

    const resend = new Resend(resendKey);

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #38bdf8; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0;">PRUVA</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Yeni Nesil Lojistik Ağı</p>
          </div>
          <div style="background-color: #1e293b; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 1px solid #334155;">
              <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 15px;">Yeni Teklif Geldi! 🎉</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
                  Sayın <strong>${userData.name || 'Pruva Üyesi'}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
                  <strong>"${adTitle}"</strong> ilanınız için yeni bir taşıma teklifi aldınız!
              </p>
              <div style="background-color: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 5px 0; color: #94a3b8; font-size: 14px;">Teklif Veren:</td>
                          <td style="padding: 5px 0; color: #ffffff; font-weight: 600; font-size: 14px; text-align: right;">${carrierName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 5px 0; color: #94a3b8; font-size: 14px;">Teklif Tutarı:</td>
                          <td style="padding: 5px 0; color: #38bdf8; font-weight: 800; font-size: 18px; text-align: right;">${Number(price).toLocaleString('tr-TR')} ₺</td>
                      </tr>
                  </table>
              </div>
              <div style="text-align: center;">
                  <a href="https://pruvahub.com/marketplace" style="background-color: #38bdf8; color: #0f172a; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px; transition: background-color 0.2s;">
                      Teklifi İncele
                  </a>
              </div>
          </div>
      </div>
    `;

    await resend.emails.send({
      from: "Pruva Lojistik <noreply@resend.dev>",
      to: targetEmail,
      subject: `Pruva: İlanınıza Yeni Teklif Geldi! (${Number(price).toLocaleString('tr-TR')} ₺)`,
      html: htmlContent
    });

    res.json({ success: true, message: `Email gönderildi.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
