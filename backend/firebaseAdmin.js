const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (admin.apps.length === 0) {
    try {
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            // Local dev mode: load from service account file
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'pruva-633b8.firebasestorage.app'
            });
            console.log('[FIREBASE ADMIN] Firebase Admin SDK başarıyla dosya üzerinden başlatıldı.');
        } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
            // Production mode (Render): load from environment variables
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                }),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'pruva-633b8.firebasestorage.app'
            });
            console.log('[FIREBASE ADMIN] Firebase Admin SDK başarıyla Çevre Değişkenleri üzerinden başlatıldı.');
        } else {
            console.warn('[FIREBASE ADMIN] Firebase servis anahtarı dosyası veya çevre değişkenleri bulunamadı.');
        }
    } catch (err) {
        console.error('[FIREBASE ADMIN] Firebase Admin SDK başlatılamadı:', err.message);
    }
}

module.exports = admin;
