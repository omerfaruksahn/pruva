/**
 * PRUVA — Pricing AI Mail Scanner Endpoint Test Script
 * 
 * Bu betik, Express server'ı başlatır, yetkilendirme token'ı üretir,
 * POST /api/outlook/scan endpoint'ine istek atar ve veritabanı yansımalarını
 * (pricing_rfqs, pricing_actions ve pricing_rates tablolarını) terminalde gösterir.
 */

// Port çakışmasını önlemek için test portu tanımlıyoruz
process.env.PORT = 5001;

const path = require('path');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Express uygulamasını ve dummy veri kaynağını yükle
const dummyData = require('./dummyData');

// Test kullanıcısı için JWT token üret (userId: 1)
const JWT_SECRET = process.env.JWT_SECRET || 'pruva_a9f2b8c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E';
const token = jwt.sign({ user: { id: 1 } }, JWT_SECRET, { expiresIn: '1h' });

async function runTest() {
    console.log('\n==================================================');
    console.log('   PRUVA PRICING AI ENDPOINT TEST BAŞLATILDI');
    console.log('==================================================\n');

    console.log('[TEST] Sunucu başlatılıyor...');
    
    // Server.js'i başlat (PORT: 5001 olarak çalışacaktır)
    const server = require('./server');

    // Sunucunun ayağa kalkması için kısa bir süre bekle
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('\n[TEST] POST /api/outlook/scan endpoint\'ine istek atılıyor...');

    const postData = JSON.stringify({ mockMode: true });

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/outlook/scan',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'x-auth-token': token
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            body += chunk;
        });
        res.on('end', () => {
            try {
                const resData = JSON.parse(body);
                
                console.log('\n[TEST] ENDPOINT YANITI:');
                console.log(JSON.stringify(resData, null, 2));
                console.log('--------------------------------------------------');

                // dummyData durumunu yazdır
                console.log(`\n==================================================`);
                console.log(` VERİTABANI DURUMU (DUMMY DATA)`);
                console.log(` Toplam RFQ: ${dummyData.pricing_rfqs.length} | Toplam Aksiyon: ${dummyData.pricing_actions.length} | Fiyat Teklifi: ${dummyData.pricing_rates.length}`);
                console.log(`==================================================\n`);

                console.log('--- 1. pricing_rfqs TABLOSU (Taranan Talepler) ---');
                if (dummyData.pricing_rfqs.length === 0) {
                    console.log('Kayıt bulunamadı.');
                } else {
                    dummyData.pricing_rfqs.forEach(rfq => {
                        console.log(`\n[ID: ${rfq.id}] [Gönderen: ${rfq.sender_name}] [Konu: ${rfq.subject}]`);
                        console.log(`   - Mesaj ID: ${rfq.outlook_message_id}`);
                        console.log(`   - Kategori: ${rfq.category}`);
                        console.log(`   - Taşıma Modu: ${rfq.transport_mode}`);
                        console.log(`   - Çıkarılan Veriler:`, JSON.stringify(rfq.extracted_data, null, 2));
                        console.log(`   - Eksik Alanlar:`, JSON.stringify(rfq.missing_fields));
                        console.log(`   - Durum: ${rfq.status}`);
                    });
                }

                console.log('\n--------------------------------------------------');
                console.log('--- 2. pricing_actions TABLOSU (AI Aksiyonları) ---');
                if (dummyData.pricing_actions.length === 0) {
                    console.log('Kayıt bulunamadı.');
                } else {
                    dummyData.pricing_actions.forEach(action => {
                        console.log(`\n[ID: ${action.id}] [RFQ ID: ${action.rfq_id}] [Aksiyon Tipi: ${action.action_type}]`);
                        console.log(`   - Başlık: ${action.title}`);
                        console.log(`   - Açıklama: ${action.description}`);
                        console.log(`   - Önerilen Alıcı: ${action.suggested_mail.to}`);
                        console.log(`   - Önerilen Konu: ${action.suggested_mail.subject}`);
                        console.log(`   - Önerilen İçerik:\n"""\n${action.suggested_mail.body}\n"""`);
                        console.log(`   - İletişime Geçilecek Taşıyıcılar:`, JSON.stringify(action.carriers_to_contact, null, 2));
                        console.log(`   - Durum: ${action.status}`);
                    });
                }

                console.log('\n--------------------------------------------------');
                console.log('--- 3. pricing_rates TABLOSU (Taşıyıcı Teklifleri) ---');
                if (dummyData.pricing_rates.length === 0) {
                    console.log('Kayıt bulunamadı.');
                } else {
                    dummyData.pricing_rates.forEach(rate => {
                        console.log(`\n[ID: ${rate.id}] [RFQ ID: ${rate.rfq_id}] [Taşıyıcı: ${rate.carrier_name}]`);
                        console.log(`   - Mesaj ID: ${rate.outlook_message_id}`);
                        console.log(`   - Fiyat: ${rate.extracted_price} ${rate.currency} (${rate.price_per})`);
                        console.log(`   - Geçerlilik Tarihi: ${rate.validity_date}`);
                        console.log(`   - Durum: ${rate.status}`);
                    });
                }

                console.log('\n==================================================');
                console.log('   TEST BAŞARIYLA TAMAMLANDI. ÇIKIŞ YAPILIYOR...');
                console.log('==================================================\n');

                // Sunucuyu kapatıp çık
                server.close(() => {
                    process.exit(0);
                });

            } catch (parseErr) {
                console.error('[TEST HATASI] Yanıt parse edilemedi:', parseErr);
                server.close(() => process.exit(1));
            }
        });
    });

    req.on('error', (err) => {
        console.error('\n[TEST HATASI] İstek atılırken hata oluştu:', err);
        server.close(() => process.exit(1));
    });

    // İstek gövdesini yaz ve sonlandır
    req.write(postData);
    req.end();
}

runTest();
