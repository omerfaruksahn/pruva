const db = require('../db');
const mailScanner = require('./mailScanner');
require('dotenv').config();

let schedulerInterval = null;

let schedulerApp = null;

async function scanAllConnectedAccounts() {
  console.log('[SCHEDULER] Bağlı Outlook e-posta hesapları için tarama başlatılıyor...');
  try {
    let usersToScan = [];
    
    if (process.env.USE_DUMMY_DATA === 'true') {
      // Çevrimdışı/Dummy modda test kullanıcısı (id: 1) için tarama yap
      usersToScan = [{ user_id: 1 }];
    } else {
      // Üretim modunda gerçek bağlı hesapları sorgula
      const result = await db.query(
        'SELECT user_id FROM pricing_outlook_accounts WHERE is_connected = true'
      );
      usersToScan = result.rows;
    }

    console.log(`[SCHEDULER] Taranacak toplam hesap sayısı: ${usersToScan.length}`);

    for (const account of usersToScan) {
      const userId = account.user_id;
      try {
        console.log(`[SCHEDULER] Kullanıcı ${userId} için tarama başlatılıyor...`);
        const scanResult = await mailScanner.scanEmails(userId);
        console.log(`[SCHEDULER] Kullanıcı ${userId} tarama tamamlandı:`, scanResult.message);
        
        // Yeni e-posta bulunduysa anlık bildirim fırlat
        if (scanResult.processed_count > 0 && schedulerApp) {
            const io = schedulerApp.get('io');
            if (io) {
                io.to(`user_${userId}`).emit('NEW_AI_ACTION', {
                    type: 'NEW_EMAILS_SCANNED',
                    count: scanResult.processed_count,
                    message: `${scanResult.processed_count} adet yeni e-posta yapay zeka tarafından işlendi.`
                });
            }
        }
      } catch (scanErr) {
        console.error(`[SCHEDULER ERR] Kullanıcı ${userId} taranırken hata:`, scanErr.message);
      }
    }
  } catch (err) {
    console.error('[SCHEDULER ERR] Bağlı hesaplar listelenirken veritabanı hatası:', err.message);
  }
}

function startEmailScheduler(app) {
  schedulerApp = app;
  if (schedulerInterval) {
    console.log('[SCHEDULER] E-posta zamanlayıcı zaten çalışıyor.');
    return;
  }

  console.log('[SCHEDULER] E-posta arka plan zamanlayıcı başlatıldı (5 dakikalık periyotlarla taranacak).');
  
  // Sunucu başlarken hemen ilk taramayı tetikle
  scanAllConnectedAccounts();

  // Her 5 dakikada bir çalıştır (5 * 60 * 1000 milisaniye)
  schedulerInterval = setInterval(scanAllConnectedAccounts, 5 * 60 * 1000);
}

function stopEmailScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[SCHEDULER] E-posta arka plan zamanlayıcı durduruldu.');
  }
}

module.exports = {
  startEmailScheduler,
  stopEmailScheduler
};
