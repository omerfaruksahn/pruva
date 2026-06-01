const db = require('../db');
require('isomorphic-fetch');
require('dotenv').config();

/**
 * PRUVA — Mail Scanner Service (Pricing AI)
 * 
 * E-postaları Microsoft Graph veya Mock Mod aracılığıyla tarar, 
 * LLM (Gemini/Claude) ile analiz eder ve verileri veritabanına kaydeder.
 */

// Mock e-postalar tamamen kaldırılmıştır.

// LLM (Claude API / Gemini AI) aracılığıyla mail içeriğini analiz eder
async function analyzeMailContent(bodyText, emailSubject = '') {
    // 1) Önce yeni Gemini AI Servisini dene
    try {
        const { analyzeEmail } = require('./aiService');
        const aiResult = await analyzeEmail(bodyText, emailSubject);
        
        // Gemini başarısız olunca direkt fallback'e düşmemesi için:
        // Gemini'nin döndürdüğü sonuçta extracted_data yoksa bile action alanı varsa onu kullanıyoruz.
        if (aiResult && (aiResult.action || aiResult.extracted_data)) {
            console.log('[MAIL SCANNER] Gemini ile başarılı e-posta analizi.');
            const ext = aiResult.extracted_data || {};
            return {
                category: aiResult.category || 'OTHER',
                transport_mode: aiResult.transport_mode || null,
                extracted_data: {
                    origin: ext.pol || ext.origin || null,
                    destination: ext.pod || ext.destination || null,
                    incoterm: ext.incoterm || null,
                    container_type: ext.container_type || null,
                    qty: ext.quantity || ext.qty || 1,
                    loading_date: ext.loading_date || null,
                    cargo_type: ext.cargo_type || null,
                    price: ext.price || null,
                    currency: ext.currency || null,
                    validity_date: ext.transit_time || ext.validity_date || null,
                    carrier_name: ext.carrier_name || null
                },
                missing_fields: aiResult.missing_fields || [],
                action: aiResult.action ? {
                    action_type: aiResult.action,
                    title: aiResult.action === 'SEND_RATE_REQUEST' ? 'Taşıyıcılardan Fiyat Talep Et' : (aiResult.action === 'SEND_OFFER' ? 'Müşteriye Teklif İlet' : (aiResult.action === 'SEND_MISSING_INFO' ? 'Müşteriden Eksik Bilgi İste' : 'Yapay Zeka Önerisi')),
                    description: aiResult.summary || 'Gemini tarafından önerilen aksiyon.',
                    suggested_subject: aiResult.suggestedMessage ? (emailSubject ? `Re: ${emailSubject}` : 'Navlun Talebi / Teklifi') : '',
                    suggested_body: aiResult.suggestedMessage || ''
                } : null
            };
        }
    } catch (e) {
        console.warn('[MAIL SCANNER] Gemini analizi başarısız oldu, Claude/Fallback\'e geçiliyor:', e.message);
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('API anahtarı bulunamadı, analiz yapılamıyor.');
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
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && (parsed.action || parsed.extracted_data)) {
                return parsed;
            }
        }
        throw new Error('LLM yanıtından JSON ayıklanamadı.');

    } catch (error) {
        console.error('[MAIL SCANNER] Claude API hatası:', error.message);
        throw error;
    }
}

// runHeuristicAnalysis tamamen silinmiştir.

// Mail Tarama Servisi (Ana Fonksiyon)
async function scanEmails(userId) {
    console.log(`[MAIL SCANNER] Tarama başlatıldı. Kullanıcı ID: ${userId}`);

    let mailsToProcess = [];

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

    let processedCount = 0;

    for (const mail of mailsToProcess) {
        try {
            // Kendi gönderdiğimiz mailleri atla
            const ownEmails = ['pruvahub@outlook.com', 'noreply@pruvahub.com'];
            if (ownEmails.some(e => mail.sender_email.toLowerCase().includes(e.toLowerCase()))) {
                console.log(`[MAIL SCANNER] Kendi gönderilen mail atlanıyor: ${mail.sender_email}`);
                continue;
            }

            // Microsoft ve diğer sistem maillerini atla
            const systemDomains = ['microsoft.com', 'microsoftemail.com', 'outlook.com', 'accountprotection.microsoft.com', 'google.com', 'linkedin.com'];
            const isSystemMail = systemDomains.some(d => mail.sender_email.toLowerCase().endsWith('@' + d) || mail.sender_email.toLowerCase().includes('noreply') || mail.sender_email.toLowerCase().includes('no-reply'));
            if (isSystemMail && !mail.sender_email.toLowerCase().includes('pruvahub')) {
                console.log(`[MAIL SCANNER] Sistem maili atlanıyor: ${mail.sender_email}`);
                continue;
            }

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

            // Eğer analysis.category === 'RFQ' ise, rate_sheet_items tablosunda pol ve pod alanlarına göre eşleşen geçerli fiyat var mı sorgula
            if (analysis.category === 'RFQ' && analysis.extracted_data && (analysis.extracted_data.origin || analysis.extracted_data.pol) && (analysis.extracted_data.destination || analysis.extracted_data.pod)) {
                const polVal = analysis.extracted_data.origin || analysis.extracted_data.pol;
                const podVal = analysis.extracted_data.destination || analysis.extracted_data.pod;
                
                try {
                    const rateSheetQuery = `
                        SELECT rsi.*, rs.carrier_name, rs.filename
                        FROM rate_sheet_items rsi
                        JOIN rate_sheets rs ON rs.id = rsi.sheet_id
                        WHERE rsi.user_id = $1
                        AND LOWER(rsi.pol) LIKE LOWER($2)
                        AND LOWER(rsi.pod) LIKE LOWER($3)
                        AND (rsi.valid_until IS NULL OR rsi.valid_until >= CURRENT_DATE)
                        ORDER BY rsi.price ASC
                        LIMIT 5
                    `;
                    
                    const rateSheetResult = await db.query(rateSheetQuery, [
                        userId, 
                        `%${polVal}%`, 
                        `%${podVal}%`
                    ]);
                    
                    if (rateSheetResult.rows && rateSheetResult.rows.length > 0) {
                        console.log(`[MAIL SCANNER] RFQ için veritabanında ${rateSheetResult.rows.length} adet eşleşen rate sheet fiyatı bulundu.`);
                        
                        if (!analysis.action) {
                            analysis.action = {};
                        }
                        
                        analysis.action.action_type = 'SEND_OFFER';
                        analysis.action.title = 'Müşteriye Teklif İlet';
                        
                        let suggestedPricesText = '';
                        rateSheetResult.rows.forEach(row => {
                            suggestedPricesText += `\n• Elinizdeki rate sheet'e göre ${row.carrier_name || 'Acente'} $${row.price} teklif ediyor.`;
                        });
                        
                        analysis.action.suggested_body = `Sayın Müşterimiz,\n\nTalebiniz için teşekkür ederiz. Portföyümüzdeki en güncel acente spot navlun listelerimize göre size sunduğumuz en iyi teklif detayları aşağıdadır:\n${suggestedPricesText}\n\nDetayları teyit etmek ve yükleme rezervasyonunu (booking) başlatmak için bu e-postayı yanıtlayabilirsiniz.\n\nSaygılarımızla,\nAhmet Yılmaz / Pricing`;
                        analysis.action.description = `Sistemde kayıtlı rate sheet dosyalarınızda ${polVal} → ${podVal} rotası için geçerli fiyatlar bulundu. En ucuz fiyat: $${rateSheetResult.rows[0].price} (${rateSheetResult.rows[0].carrier_name}).`;
                    }
                } catch (dbErr) {
                    console.error('[MAIL SCANNER ERR] RFQ rate sheet sorgusu sırasında hata oluştu:', dbErr);
                }
            }

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
        message: `Gerçek Outlook taraması tamamlandı. ${processedCount} yeni e-posta başarıyla işlendi ve kaydedildi.`
    };
}

module.exports = {
    scanEmails
};
