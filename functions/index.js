const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// 1. Üyelik Süresi Kontrolü (Günde bir kez çalışır)
// Süresi dolan 'premium' üyelikleri 'none' (Standart) seviyesine çeker.
exports.checkExpiredSubscriptions = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    const now = new Date().toISOString();
    console.log("Checking expired subscriptions at:", now);

    try {
        const usersRef = db.collection("users");
        // Firebase index gerektirmemesi için sadece abone olanları al, filtrelemeyi kodda yap
        const snapshot = await usersRef.where("subscriptionType", "==", "premium").get();

        if (snapshot.empty) {
            console.log("No premium users found.");
            return null;
        }

        let expiredCount = 0;
        const batch = db.batch();

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.subscriptionExpiresAt && data.subscriptionExpiresAt < now) {
                batch.update(doc.ref, { 
                    subscriptionType: "none",
                    subscriptionExpiresAt: null
                });
                expiredCount++;
                console.log(`User ${doc.id} subscription expired.`);
            }
        });

        if (expiredCount > 0) {
            await batch.commit();
            console.log(`Successfully expired ${expiredCount} subscriptions.`);
        } else {
            console.log("No subscriptions needed to be expired.");
        }
        
        return null;
    } catch (error) {
        console.error("Error checking subscriptions:", error);
        return null;
    }
});

// 2. İlan Süresi Kontrolü (Her saat başı çalışır)
// Süresi (expiryDate) dolan ve hala 'pending' (bekliyor) durumunda olan ilanları 'expired' yapar.
exports.checkExpiredAds = functions.pubsub.schedule("every 1 hours").onRun(async (context) => {
    const nowTimestamp = Date.now();
    console.log("Checking expired ads at:", new Date(nowTimestamp).toISOString());

    try {
        const adsRef = db.collection("ads");
        const snapshot = await adsRef.where("status", "==", "pending").get();

        if (snapshot.empty) {
            console.log("No pending ads found.");
            return null;
        }

        let expiredCount = 0;
        const batch = db.batch();

        snapshot.forEach((doc) => {
            const data = doc.data();
            // expiryDate bir milisaniye timestamp olarak kaydediliyor (Date.now() formatı)
            if (data.expiryDate && data.expiryDate < nowTimestamp) {
                batch.update(doc.ref, { status: "expired" });
                expiredCount++;
                console.log(`Ad ${doc.id} expired.`);
            }
        });

        if (expiredCount > 0) {
            await batch.commit();
            console.log(`Successfully expired ${expiredCount} ads.`);
        } else {
            console.log("No ads needed to be expired.");
        }

        return null;
    } catch (error) {
        console.error("Error checking ads:", error);
        return null;
    }
});

// 3. Yeni Teklif Geldiğinde E-posta Gönderme (Resend) - Gen 2
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

exports.sendEmailOnNewBidV2 = onDocumentCreated({
    document: "bids/{bidId}",
    region: "europe-west1"
}, async (event) => {
    const bidData = event.data.data();
    const { adId, price, amount, carrierName } = bidData;
    const bidPrice = price || amount; // Bazı yerlerde price bazı yerlerde amount kullanılmış olabilir

    console.log(`[Gen2] New bid created for ad: ${adId}, price: ${bidPrice}, by: ${carrierName}`);

    try {
        // 1. İlanı bulup yük verenin kim olduğunu bulalım
        const adDoc = await db.collection("ads").doc(adId).get();
        if (!adDoc.exists) {
            console.warn(`Ad ${adId} not found.`);
            return null;
        }
        const adData = adDoc.data();
        const { ownerId, fromCity, toCity, title } = adData;
        const adTitle = title || `${fromCity} -> ${toCity}`;

        if (!ownerId) {
            console.warn(`Ad ${adId} has no ownerId.`);
            return null;
        }

        // 2. Yük verenin kullanıcı detaylarını ve e-postasını çekelim
        const userDoc = await db.collection("users").doc(ownerId).get();
        if (!userDoc.exists) {
            console.warn(`User ${ownerId} not found.`);
            return null;
        }
        const userData = userDoc.data();
        const targetEmail = userData.email;

        if (!targetEmail) {
            console.warn(`User ${ownerId} has no email address.`);
            return null;
        }

        // 3. Bildirim tercihlerini kontrol et (varsayılan: aktif)
        const prefs = userData.notificationPreferences || {};
        if (prefs.email === false) {
            console.log(`User ${ownerId} disabled email notifications.`);
            return null;
        }

        // 4. Resend API Key kontrolü
        const resendKey = process.env.RESEND_API_KEY || (functions.config().resend && functions.config().resend.key);
        if (!resendKey) {
            console.warn("Resend API Key is not set in process.env.RESEND_API_KEY or functions.config().resend.key. Cannot send email.");
            return null;
        }

        const { Resend } = require("resend");
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
                                <td style="padding: 5px 0; color: #ffffff; font-weight: 600; font-size: 14px; text-align: right;">${carrierName || 'Onaylı Taşıyıcı'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #94a3b8; font-size: 14px;">Teklif Tutarı:</td>
                                <td style="padding: 5px 0; color: #38bdf8; font-weight: 800; font-size: 18px; text-align: right;">${Number(bidPrice).toLocaleString('tr-TR')} ₺</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align: center;">
                        <a href="https://pruvahub.com/marketplace" style="background-color: #38bdf8; color: #0f172a; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px; transition: background-color 0.2s;">
                            Teklifi İncele
                        </a>
                    </div>
                </div>
                <div style="text-align: center; color: #64748b; font-size: 12px;">
                    <p style="margin-bottom: 5px;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
                    <p>© 2026 Pruva Lojistik. Tüm Hakları Saklıdır.</p>
                </div>
            </div>
        `;

        await resend.emails.send({
            from: "Pruva Lojistik <noreply@pruvahub.com>",
            to: targetEmail,
            subject: `Pruva: İlanınıza Yeni Teklif Geldi! (${Number(bidPrice).toLocaleString('tr-TR')} ₺)`,
            html: htmlContent
        });

        console.log(`Success! Email notification sent to: ${targetEmail}`);
        return { success: true };
    } catch (err) {
        console.error("Failed to send email notification via Resend:", err);
        return null;
    }
});
