/**
 * PRUVA — Pricing AI Mail Scanner Test Script
 * 
 * Bu betik, mailScanner servisini çalıştırır ve veritabanı yansımalarını yazdırır.
 */

const { scanEmails } = require('./services/mailScanner');
const dummyData = require('./dummyData');

async function runTest() {
    console.log('=== PRICING AI TARAMA TESTİ BAŞLATILDI ===\n');

    // 1. Tarama Servisini Çalıştır
    const userId = 1; // Test kullanıcısı
    const mockMode = true;

    try {
        const result = await scanEmails(userId, mockMode);
        console.log('Servis Sonucu:', result);
        console.log('\n=========================================');
        console.log(`DUMMY DATA TABLO DURUMLARI (Toplam RFQ: ${dummyData.pricing_rfqs.length}, Aksiyon: ${dummyData.pricing_actions.length})`);
        console.log('=========================================\n');

        // 2. RFQ'ları listele
        console.log('--- pricing_rfqs TABLOSU KAYITLARI ---');
        dummyData.pricing_rfqs.forEach(rfq => {
            console.log(`\n[ID: ${rfq.id}] [Gönderen: ${rfq.sender_name}] [Konu: ${rfq.subject}]`);
            console.log(`  - Kategori: ${rfq.category}`);
            console.log(`  - Taşıma Modu: ${rfq.transport_mode}`);
            console.log(`  - Çıkarılan Veriler:`, JSON.stringify(rfq.extracted_data));
        });

        // 3. Aksiyonları listele
        console.log('\n--- pricing_actions TABLOSU KAYITLARI ---');
        dummyData.pricing_actions.forEach(action => {
            console.log(`\n[ID: ${action.id}] [RFQ ID: ${action.rfq_id}] [Tip: ${action.action_type}]`);
            console.log(`  - Başlık: ${action.title}`);
            console.log(`  - Açıklama: ${action.description}`);
            console.log(`  - Önerilen Alıcı: ${action.suggested_mail.to}`);
            console.log(`  - Önerilen Konu: ${action.suggested_mail.subject}`);
        });

        console.log('\n=== TEST BAŞARIYLA TAMAMLANDI ===');
    } catch (err) {
        console.error('Test hatası:', err);
    }
}

runTest();
