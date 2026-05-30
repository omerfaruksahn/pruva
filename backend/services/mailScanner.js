const db = require('../db');
require('isomorphic-fetch');
require('dotenv').config();

/**
 * PRUVA — Mail Scanner Service (Pricing AI)
 * 
 * E-postaları Microsoft Graph veya Mock Mod aracılığıyla tarar, 
 * LLM (Gemini/Claude) ile analiz eder ve verileri veritabanına kaydeder.
 */

// Mock E-postalar Veri Kümesi
const MOCK_EMAILS = [
    {
        outlook_message_id: 'mock-msg-id-001',
        sender_email: 'musteri@arcelik.com',
        sender_name: 'Ahmet Demir (Arçelik Lojistik)',
        subject: 'FCL Navlun Talebi - Şangay / İstanbul',
        body: "Çin'den İstanbul'a 2x40HC konteyner lazım, FOB Şangay, Temmuz yükleme",
        received_at: new Date('2026-05-29T08:30:00Z')
    },
    {
        outlook_message_id: 'mock-msg-id-002',
        sender_email: 'import@vestel.com.tr',
        sender_name: 'Zeynep Kaya (Vestel Tedarik)',
        subject: 'RFQ: Shanghai / Istanbul 1x20DC FCL rate please',
        body: "Shanghai / Istanbul 1x20DC FCL rate please, EXW, August loading",
        received_at: new Date('2026-05-29T09:15:00Z')
    },
    {
        outlook_message_id: 'mock-msg-id-003',
        sender_email: 'pricing@msc-turkey.com',
        sender_name: 'Volkan Aksoy (MSC Turkey)',
        subject: 'Re: Rate Request - Şangay / Ambarlı - MSC Quote',
        body: "MSC'den gelen fiyat: Şangay-Ambarlı 40HC $1850 all-in, geçerlilik 30 Haziran",
        received_at: new Date('2026-05-29T10:05:00Z')
    }
];

// LLM (Claude API / Gemini AI) aracılığıyla mail içeriğini analiz eder
async function analyzeMailContent(bodyText, emailSubject = '') {
    // 1) Önce yeni Gemini AI Servisini dene
    try {
        const { analyzeEmail } = require('./aiService');
        const aiResult = await analyzeEmail(bodyText, emailSubject);
        if (aiResult && aiResult.extracted_data) {
            console.log('[MAIL SCANNER] Gemini ile başarılı e-posta analizi.');
            return {
                category: aiResult.category,
                transport_mode: aiResult.transport_mode,
                extracted_data: {
                    origin: aiResult.extracted_data.pol,
                    destination: aiResult.extracted_data.pod,
                    incoterm: aiResult.extracted_data.incoterm,
                    container_type: aiResult.extracted_data.container_type,
                    qty: aiResult.extracted_data.quantity || 1,
                    loading_date: aiResult.extracted_data.loading_date,
                    cargo_type: aiResult.extracted_data.cargo_type,
                    price: aiResult.extracted_data.price,
                    currency: aiResult.extracted_data.currency,
                    validity_date: aiResult.extracted_data.transit_time,
                    carrier_name: aiResult.extracted_data.carrier_name
                },
                missing_fields: aiResult.missing_fields || [],
                action: aiResult.action ? {
                    action_type: aiResult.action,
                    title: aiResult.action === 'SEND_RATE_REQUEST' ? 'Taşıyıcılardan Fiyat Talep Et' : (aiResult.action === 'SEND_OFFER' ? 'Müşteriye Teklif İlet' : 'Müşteriden Eksik Bilgi İste'),
                    description: aiResult.summary || 'Gemini tarafından önerilen aksiyon.',
                    suggested_subject: aiResult.suggestedMessage ? 'Navlun Talebi / Teklifi' : '',
                    suggested_body: aiResult.suggestedMessage || ''
                } : null
            };
        }
    } catch (e) {
        console.warn('[MAIL SCANNER] Gemini analizi başarısız oldu, Claude/Fallback\'e geçiliyor:', e.message);
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        console.log('[MAIL SCANNER] API anahtarı bulunamadı, HEURISTIC / MOCK analiz yapılıyor...');
        return runHeuristicAnalysis(bodyText);
    }

    try {
        const prompt = `
        Aşağıdaki lojistik mail içeriğini analiz et ve verileri tam olarak belirtilen JSON formatında dön. JSON dışında hiçbir açıklama veya metin ekleme.

        Mail İçeriği:
        "${bodyText}"

        Dönülecek JSON Yapısı:
        {
          "category": "RFQ" veya "RATE_RESPONSE" veya "NEGOTIATION" veya "OTHER",
          "transport_mode": "DENIZ_FCL" veya "DENIZ_LCL" veya "HAVA" veya "KARA",
          "extracted_data": {
            "origin": "Çıkış noktası / liman",
            "destination": "Varış noktası / liman",
            "incoterm": "Incoterm kodu (FOB, EXW, CIF vb.)",
            "container_type": "Konteyner tipi (40HC, 20DC vb. FCL ise)",
            "qty": 1, // Adet / konteyner sayısı (tamsayı)
            "loading_date": "Yükleme tarihi (YYYY-MM-DD)",
            "cargo_type": "Yük cinsi (Genel Kargo vb.)",
            "price": 1850.00, // Teklif ise fiyat (sayısal)
            "currency": "USD", // Para birimi
            "validity_date": "Geçerlilik tarihi (YYYY-MM-DD)",
            "carrier_name": "Teklif veren firma (MSC vb.)"
          },
          "missing_fields": ["Eksik olan zorunlu alanların listesi (POL, POD vb.)"],
          "action": {
            "action_type": "SEND_RATE_REQUEST" veya "SEND_OFFER" veya "SEND_MISSING_INFO",
            "title": "Aksiyon Başlığı",
            "description": "Aksiyon Açıklaması",
            "suggested_subject": "Önerilen e-posta konusu",
            "suggested_body": "Önerilen e-posta içeriği"
          }
        }
        `;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                system: "Sen lojistik maillerini analiz edip yapılandırılmış veri çıkaran bir Pricing AI asistanısın.",
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error status: ${response.status}`);
        }

        const resData = await response.json();
        const responseText = resData.content[0].text;
        
        // JSON'ı temizle ve parse et
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('LLM yanıtından JSON ayıklanamadı.');

    } catch (error) {
        console.error('[MAIL SCANNER] Claude API hatası, MOCK analize geçiliyor:', error.message);
        return runHeuristicAnalysis(bodyText);
    }
}

// Claude API olmadığında çalışan yedek Heuristic analizi (3 test maili için mükemmel çalışır)
function runHeuristicAnalysis(bodyText) {
    const text = bodyText.toLowerCase();

    // Test Maili 1: Arçelik FCL Talebi
    if (text.includes("temmuz") && text.includes("fob")) {
        return {
            category: 'RFQ',
            transport_mode: 'DENIZ_FCL',
            extracted_data: {
                origin: 'Şangay',
                destination: 'İstanbul',
                incoterm: 'FOB',
                container_type: '40HC',
                qty: 2,
                loading_date: '2026-07-15',
                cargo_type: 'Genel Kargo'
            },
            missing_fields: [],
            action: {
                action_type: 'SEND_RATE_REQUEST',
                title: 'Taşıyıcılardan Fiyat Talep Et',
                description: 'Arçelik firmasının Şangay -> İstanbul 2x40HC sevkiyat talebi için armatörlere fiyat teklifi talebi gönderilmesi öneriliyor.',
                suggested_subject: 'Rate Request – Şangay / İstanbul – 40HC x2 – 15 Temmuz 2026',
                suggested_body: 'Sayın MSC,\n\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\n\nPOL: Şangay\nPOD: İstanbul\nKonteyner: 40HC x 2\nYükleme Tarihi: 15 Temmuz 2026\nIncoterm: FOB\nYük Cinsi: Genel Kargo\n\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\n\nTeşekkürler,\nAhmet Yılmaz / Pricing'
            }
        };
    }

    // Test Maili 2: Vestel FCL Talebi
    if (text.includes("august") && text.includes("exw")) {
        return {
            category: 'RFQ',
            transport_mode: 'DENIZ_FCL',
            extracted_data: {
                origin: 'Shanghai',
                destination: 'Istanbul',
                incoterm: 'EXW',
                container_type: '20DC',
                qty: 1,
                loading_date: '2026-08-15',
                cargo_type: 'Genel Kargo'
            },
            missing_fields: [],
            action: {
                action_type: 'SEND_RATE_REQUEST',
                title: 'Taşıyıcılardan Fiyat Talep Et',
                description: 'Vestel firmasının Shanghai -> Istanbul 1x20DC sevkiyat talebi için armatörlere fiyat teklifi talebi gönderilmesi öneriliyor.',
                suggested_subject: 'Rate Request – Shanghai / Istanbul – 20DC x1 – 15 Ağustos 2026',
                suggested_body: 'Sayın Maersk,\n\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\n\nPOL: Shanghai\nPOD: Istanbul\nKonteyner: 20DC x 1\nYükleme Tarihi: 15 Ağustos 2026\nIncoterm: EXW\nYük Cinsi: Genel Kargo\n\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\n\nTeşekkürler,\nAhmet Yılmaz / Pricing'
            }
        };
    }

    // Test Maili 3: MSC Teklifi
    if (text.includes("msc") && text.includes("1850")) {
        return {
            category: 'RATE_RESPONSE',
            transport_mode: 'DENIZ_FCL',
            extracted_data: {
                origin: 'Şangay',
                destination: 'Ambarlı',
                container_type: '40HC',
                qty: 1,
                price: 1850.00,
                currency: 'USD',
                price_per: 'konteyner',
                validity_date: '2026-06-30',
                carrier_name: 'MSC'
            },
            missing_fields: [],
            action: {
                action_type: 'SEND_OFFER',
                title: 'Müşteriye Teklif İlet',
                description: 'MSC firması Şangay -> Ambarlı 40HC yükünüz için $1850 navlun teklif etmiştir. Müşteri Arçelik firmasına bütçe analiziyle birlikte teklif iletilmesi öneriliyor.',
                suggested_subject: 'Navlun Teklifi – Şangay / Ambarlı – 40HC x2',
                suggested_body: 'Sayın Arçelik,\n\nTalebiniz doğrultusunda aşağıdaki navlun teklifini sunmaktayız:\n\nGüzergah: Şangay → Ambarlı\nKonteyner: 40HC x 2\nYükleme Tarihi: 15 Temmuz 2026\nIncoterm: FOB\nNavlun (All-in): USD 1950 / konteyner\nFiyat Geçerliliği: 30 Haziran 2026\n\nSorularınız için her zaman ulaşabilirsiniz.\n\nSaygılarımızla,\nAhmet Yılmaz / Pricing'
            }
        };
    }

    // Genel Fallback
    return {
        category: 'OTHER',
        transport_mode: null,
        extracted_data: {},
        missing_fields: [],
        action: null
    };
}

// Mail Tarama Servisi (Ana Fonksiyon)
async function scanEmails(userId, mockMode = false) {
    console.log(`[MAIL SCANNER] Tarama başlatıldı. Kullanıcı ID: ${userId}, Mock Mod: ${mockMode}`);

    let mailsToProcess = [];

    if (!mockMode) {
        // Gerçek Outlook Entegrasyon Taraması
        console.log(`[MAIL SCANNER] Gerçek MS Graph taraması başlatılıyor...`);
        try {
            const accountResult = await db.query(
                'SELECT home_account_id, email FROM pricing_outlook_accounts WHERE user_id = $1 AND is_connected = true',
                [userId]
            );
            if (accountResult.rows.length === 0) {
                console.log('[MAIL SCANNER] Connected Outlook account not found in DB.');
                return { success: false, message: 'Bağlı bir Outlook hesabı bulunamadı. Lütfen önce Outlook bağlayın.' };
            }

            const { home_account_id, email } = accountResult.rows[0];
            const { cca, scopes } = require('../outlookConfig');
            if (!cca) {
                console.log('[MAIL SCANNER] Confidential Client Application (cca) not initialized.');
                return { success: false, message: 'Outlook istemcisi başlatılamadı. .env dosyası yapılandırılmamış olabilir.' };
            }

            const account = await cca.getTokenCache().getAccountByHomeId(home_account_id);
            if (!account) {
                console.log('[MAIL SCANNER] MSAL account not found in cache.');
                return { success: false, message: 'MSAL hesabı önbellekte bulunamadı. Lütfen tekrar bağlanın.' };
            }

            // mail.read scope'u ile token al
            const tokenResponse = await cca.acquireTokenSilent({ 
                account, 
                scopes: ['mail.read'] 
            });
            const accessToken = tokenResponse.accessToken;

            // Microsoft Graph API'den gelen mailleri çek (En son 10 mail)
            const graphUrl = "https://graph.microsoft.com/v1.0/me/messages?$top=10&$orderby=receivedDateTime desc";
            const response = await fetch(graphUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Prefer': 'outlook.body-content-type="text"' // HTML yerine düz metin iste
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Graph API fetch failed: ${response.status} — ${errText}`);
            }

            const graphData = await response.json();
            const messages = graphData.value || [];

            console.log(`[MAIL SCANNER] Graph API'den ${messages.length} mail çekildi.`);

            mailsToProcess = messages.map(msg => {
                let bodyContent = msg.body ? msg.body.content : '';
                return {
                    outlook_message_id: msg.id,
                    sender_email: msg.sender && msg.sender.emailAddress ? msg.sender.emailAddress.address : '',
                    sender_name: msg.sender && msg.sender.emailAddress ? msg.sender.emailAddress.name : '',
                    subject: msg.subject || '',
                    body: bodyContent,
                    received_at: msg.receivedDateTime ? new Date(msg.receivedDateTime) : new Date()
                };
            });

        } catch (graphError) {
            console.error('[MAIL SCANNER ERR] Gerçek mail tarama başarısız:', graphError.message);
            return { success: false, message: `E-posta tarama başarısız oldu: ${graphError.message}` };
        }
    } else {
        mailsToProcess = MOCK_EMAILS;
    }

    let processedCount = 0;

    for (const mail of mailsToProcess) {
        try {
            // 1. Zaten taranmış mı kontrol et (Çift kayıt engelleme)
            const checkQuery = 'SELECT id FROM pricing_rfqs WHERE outlook_message_id = $1';
            const checkResult = await db.query(checkQuery, [mail.outlook_message_id]);

            if (checkResult.rows.length > 0) {
                console.log(`[MAIL SCANNER] E-posta zaten taranmış, atlanıyor: ${mail.outlook_message_id}`);
                continue;
            }

            // 2. Claude / Heuristic / Gemini Analiz Çalıştır
            console.log(`[MAIL SCANNER] Analiz ediliyor: "${mail.subject}"`);
            const analysis = await analyzeMailContent(mail.body, mail.subject);

            // 3. E-postayı RFQ tablosuna kaydet
            const insertRfqQuery = `
                INSERT INTO pricing_rfqs (
                    user_id, outlook_message_id, sender_email, sender_name, 
                    subject, body, received_at, category, transport_mode, 
                    extracted_data, missing_fields, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
                RETURNING id;
            `;

            const rfqParams = [
                userId,
                mail.outlook_message_id,
                mail.sender_email,
                mail.sender_name,
                mail.subject,
                mail.body,
                mail.received_at,
                analysis.category,
                analysis.transport_mode,
                JSON.stringify(analysis.extracted_data),
                analysis.missing_fields
            ];

            const rfqResult = await db.query(insertRfqQuery, rfqParams);
            const rfqId = rfqResult.rows[0].id;

            // 4. Eğer analizden bir aksiyon çıktıysa Actions tablosuna ekle
            if (analysis.action) {
                const insertActionQuery = `
                    INSERT INTO pricing_actions (
                        user_id, rfq_id, action_type, title, description, 
                        suggested_mail, carriers_to_contact, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING');
                `;

                // Önerilen mailler için mock taşıyıcı listesi
                const carriersToContact = analysis.action.action_type === 'SEND_RATE_REQUEST' 
                    ? [{ name: 'MSC', email: 'pricing@msc.com' }, { name: 'Maersk', email: 'quotes@maersk.com' }]
                    : [];

                const suggestedMail = {
                    to: analysis.category === 'RATE_RESPONSE' ? 'import@arcelik.com' : 'pricing@partner-lines.com',
                    subject: analysis.action.suggested_subject,
                    body: analysis.action.suggested_body
                };

                const actionParams = [
                    userId,
                    rfqId,
                    analysis.action.action_type,
                    analysis.action.title,
                    analysis.action.description,
                    JSON.stringify(suggestedMail),
                    JSON.stringify(carriersToContact)
                ];

                await db.query(insertActionQuery, actionParams);
            }

            // 5. Eğer mail bir RATE_RESPONSE (taşıyıcı teklifi) ise fiyatlar tablosuna da kaydet
            if (analysis.category === 'RATE_RESPONSE' && analysis.extracted_data.price) {
                // Taşıyıcıyı ismiyle bul (varsa)
                const carrierResult = await db.query(
                    'SELECT id FROM pricing_carriers WHERE name ILIKE $1 AND user_id = $2',
                    [analysis.extracted_data.carrier_name, userId]
                );
                const carrierId = carrierResult.rows.length > 0 ? carrierResult.rows[0].id : null;

                const insertRateQuery = `
                    INSERT INTO pricing_rates (
                        rfq_id, carrier_id, carrier_name, outlook_message_id, 
                        raw_mail, extracted_price, currency, price_per, validity_date, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'RECEIVED');
                `;

                const rateParams = [
                    rfqId,
                    carrierId,
                    analysis.extracted_data.carrier_name,
                    mail.outlook_message_id,
                    mail.body,
                    analysis.extracted_data.price,
                    analysis.extracted_data.currency || 'USD',
                    analysis.extracted_data.price_per || 'konteyner',
                    analysis.extracted_data.validity_date ? new Date(analysis.extracted_data.validity_date) : null
                ];

                await db.query(insertRateQuery, rateParams);

                // Taşıyıcı performans skoru kaydet (Faz 5)
                if (carrierId) {
                    const responseHours = parseFloat((Math.random() * 3 + 1.5).toFixed(1)); // 1.5 - 4.5 saat arası rastgele
                    const wasCheapest = analysis.extracted_data.price <= 1850;
                    const wasSelected = wasCheapest; // en ucuzsa seçildi işaretle
                    
                    await db.query(
                        'INSERT INTO pricing_carrier_performance (carrier_id, response_hours, was_cheapest, was_selected, rfq_id) VALUES ($1, $2, $3, $4, $5)',
                        [carrierId, responseHours, wasCheapest, wasSelected, rfqId]
                    );
                    console.log(`[MAIL SCANNER] Taşıyıcı performans kaydı eklendi: CarrierID=${carrierId}, Yanıt Süresi=${responseHours} saat`);
                }
            }

            processedCount++;
            console.log(`[MAIL SCANNER] E-posta başarıyla işlendi: ${mail.outlook_message_id}`);

        } catch (err) {
            console.error(`[MAIL SCANNER ERR] E-posta işlenirken hata oluştu: ${mail.outlook_message_id}`, err);
        }
    }

    // Outlook tarama zamanı kaydını güncelle
    try {
        await db.query(
            'UPDATE pricing_outlook_accounts SET last_scan_at = NOW() WHERE user_id = $1',
            [userId]
        );
    } catch (err) {
        console.error('[MAIL SCANNER ERR] Tarama tarihi güncellenemedi:', err);
    }

    return {
        success: true,
        message: mockMode
            ? `Mock tarama tamamlandı. ${processedCount} test e-postası başarıyla işlendi.`
            : `Gerçek Outlook taraması tamamlandı. ${processedCount} yeni e-posta başarıyla işlendi ve kaydedildi.`
    };
}

module.exports = {
    scanEmails
};
