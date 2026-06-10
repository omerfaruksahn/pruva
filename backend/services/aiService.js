const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { tryStaticReply, pickModel } = require('./aiRouter');
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `Sen Pruva AI'sın — bir lojistik operasyon ve fiyatlama asistanısın. Tıpkı Iron Man'deki JARVIS gibi, kullanıcınla doğal, zeki ve samimi bir dille konuşmalısın. Sen aynı zamanda 20 yıllık tecrübesi olan kurt bir Lojistik Operasyon Müdürüsün.

GÖREV TANIMLARIN:
1. Kullanıcının doğal dilde yazdığı komutları veya soruları anla.
2. Sadece e-posta GÖNDERİLMESİ gereken durumlarda SEND_ aksiyonlarını seç.
3. Sohbet, soru-cevap, durum sorma gibi durumlarda KESİNLİKLE 'GENERAL' aksiyonunu seç ve ona doğrudan yanıt ver.

LOJİSTİK DEHASI KURALLARI (ÇOK ÖNEMLİ):
- Daima profesyonel lojistik terminolojisi kullan (Navlun, B/L, Demuraj, Ardiye, Ordino, THC, VGM, Cut-off).
- Incoterms'leri hatasız uygula: Örn. EXW (Ex Works) isteniyorsa fiyata "İç Nakliye + Gümrükleme + Liman Masrafları" dahil edilmelidir. FOB ise "Sadece Liman Masrafları" dahil edilmelidir.
- Tehlikeli Madde (IMO/ADR): Kullanıcı yük tipinde pil, kimyasal vs. bahsederse mutlaka "MSDS (Material Safety Data Sheet) olmadan fiyat alamayız" diye uyar.
- Fiyat Ekleme / Kâr Marjı: Sen ASLA kendi kendine kâr marjı belirlemezsin. Kullanıcı sana "Fiyatın üstüne 50 dolar ekle" dediğinde, elindeki baz fiyata sadece +50 eklersin.
- Şablon Sadakati: Fiyat teklifi (SEND_OFFER) hazırlarken SÜSLÜ HTML TABLOLARI YAPMA. Sadece şu formatı kullan: "Sayın İlgili,\\n\\n[POL] - [POD] arası navlun teklifimiz aşağıdadır:\\nFiyat: [Para Birimi][Hesaplanan Final Fiyat]\\nGeçerlilik: [Tarih]\\n\\nİyi çalışmalar."

ALGILAYACAĞIN AKSİYONLAR:
- SEND_CUSTOM_EMAIL: Özel bir e-posta tasarlayıp birine göndermek için.
- SEND_RATE_REQUEST: Taşıyıcılardan fiyat talep etmek için.
- SEND_OFFER: Müşteriye fiyat teklifi göndermek için.
- SEND_MISSING_INFO: Müşteriden eksik bilgi istemek için.
- SEND_FOLLOWUP: Taşıyıcıya veya müşteriye hatırlatma maili atmak için.
- GENERAL: Bütün diğer sorular, muhabbet, bilgi soruları veya otonom araç (Function Call) yanıtları.

YANIT FORMATI (Her zaman bu JSON formatında yanıt ver):
{
  "action": "SEND_CUSTOM_EMAIL|SEND_RATE_REQUEST|SEND_OFFER|SEND_MISSING_INFO|SEND_FOLLOWUP|GENERAL",
  "confidence": 0.0-1.0,
  "summary": "Kullanıcıya gösterilecek doğrudan yanıt veya açıklama. JARVIS gibi konuş. GENERAL aksiyonlarında buraya uzun yanıtını yaz.",
  "details": {
    "to_email": "SEND_ aksiyonuysa alıcı e-posta",
    "subject": "SEND_ aksiyonuysa konu başlığı",
    "transportMode": "FCL|LCL|AIR|ROAD|null",
    "carriers": ["önerilen taşıyıcılar"]
  },
  "suggestedMessage": "SADECE SEND_ aksiyonlarında karşı tarafa gidecek e-posta gövdesi. Müşteriye gidiyorsa kesinlikle sadece yukarıda belirtilen metin şablonunu kullan. GENERAL aksiyonunda boş bırak."
}

ÖNEMLİ KURALLAR:
- E-posta arama, geçmişi tarama veya belirli bir kişiden gelen (ör: Gamze Hanım) mailleri bulma taleplerinde ("X'in mailini bul", "Y'den gelen mailleri tara") KESİNLİKLE 'scan_recent_emails' fonksiyonunu (tool) çağırarak arama yap!
- Sınırsız arama yeteneğin var. "Geçmişi tarayamam", "Sadece son 10 maili tarayabilirim", "Kişi bulamam" gibi kısıtlayıcı cümleleri ASLA KURMA. Sistem senin için arka planda Microsoft Graph üzerinden her yeri arayabilir.
- Kullanıcı sana sadece soru sorduğunda (örn: 'mail adresini versen de olur', 'ne çıktı?'), 'GENERAL' aksiyonunu seçip ona doğrudan yanıt ver.
- Emin değilsen daima 'GENERAL' seç.`;

async function analyzeCommand(userMessage, context = {}, fileParts = []) {
  try {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY bulunamadı. Yapay zeka kullanılamıyor.');
    }

    // ── KATMAN 0: Basit kalıp mı? Öyleyse AI'a hiç gitme (BEDAVA) ──
    const staticReply = tryStaticReply(userMessage);
    if (staticReply.handled) {
      console.log('[AI ROUTER] Katman 0 (static) — AI çağrısı yapılmadı, ücretsiz yanıt.');
      return staticReply.response;
    }

    // ── KATMAN 1/2: Hangi modele gideceğine karar ver ──
    const hasFiles = Array.isArray(fileParts) && fileParts.length > 0;
    const routed = pickModel(userMessage, context, hasFiles);
    console.log(`[AI ROUTER] Katman seçildi: ${routed.tier} → model: ${routed.model}`);
    
    const tools = [{
      functionDeclarations: [
        {
          name: "scan_recent_emails",
          description: "Kullanıcının Outlook gelen kutusundaki mailleri tarar. İstenirse bir 'search_query' (isim, e-posta veya kelime) gönderilerek spesifik mailler aranabilir.",
          parameters: { 
            type: "OBJECT", 
            properties: {
              search_query: { type: "STRING", description: "Aranacak kelime, kişi ismi veya e-posta adresi (Opsiyonel)" }
            }, 
            required: [] 
          }
        },
        {
          name: "search_past_rates",
          description: "Veritabanındaki geçmiş navlun fiyatlarını arar.",
          parameters: {
            type: "OBJECT",
            properties: {
              pol: { type: "STRING", description: "Yükleme limanı (Port of Loading)" },
              pod: { type: "STRING", description: "Varış limanı (Port of Discharge)" }
            },
            required: ["pod"]
          }
        }
      ]
    }];

    const model = genAI.getGenerativeModel({ 
      model: routed.model,
      tools: tools
    });
    
    const contextStr = context.company 
      ? `\nAKTİF KONUŞMA: ${context.company} (${context.status || 'UNKNOWN'})\nMUHATAP E-POSTA ADRESİ: ${context.email || 'Bilinmiyor'}`
      : `\nMUHATAP E-POSTA ADRESİ: ${context.email || 'Bilinmiyor'}`;

    const carriersStr = context.carriers?.length 
      ? `\nMEVCUT TAŞIYICILAR: ${context.carriers.map(c => c.name).join(', ')}`
      : '';

    // ── Geçmişi STRING'e gömmek yerine gerçek diyalog turları olarak ver ──
    // Böylece Gemini multi-turn bağlamı doğru anlar ve geçmişteki metinler
    // "talimat" gibi değil "konuşma" gibi işlenir (prompt injection direnci artar).
    const historyTurns = [];
    if (context.history && context.history.length > 0) {
      for (const h of context.history) {
        historyTurns.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text || '' }]
        });
      }
      // Gemini contents dizisi 'user' turu ile başlamalı — baştaki model turlarını at
      while (historyTurns.length > 0 && historyTurns[0].role !== 'user') {
        historyTurns.shift();
      }
    }

    const finalUserText = `${contextStr}${carriersStr}\n\nKULLANICI MESAJI: "${userMessage}"\n\nJSON yanıtını ver:`;

    let contents = [
      ...historyTurns,
      { role: "user", parts: [{ text: finalUserText }, ...fileParts] }
    ];

    // İlk çağrı (SYSTEM_PROMPT artık systemInstruction olarak gidiyor — her turda tekrar gönderilmiyor)
    let result = await model.generateContent({
      contents: contents,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] }
    });
    
    // Eğer AI bir function call (araç kullanımı) döndürdüyse
    const fCalls = typeof result.response.functionCalls === 'function' ? result.response.functionCalls() : null;
    if (fCalls && fCalls.length > 0) {
      const call = fCalls[0];
      console.log(`[AI AGENT] Function Call tetiklendi: ${call.name}`, call.args);
      
      let functionResult = {};
      
      // Fonksiyonların icrası (Execution)
      if (call.name === "scan_recent_emails") {
        if (!context.userId) {
          functionResult = { error: "Kullanıcı ID bulunamadı." };
        } else {
          try {
            const mailScanner = require('./mailScanner');
            const scanRes = await mailScanner.scanEmails(context.userId, call.args.search_query);
            functionResult = scanRes;
          } catch (e) {
            functionResult = { error: "Mail tarama hatası: " + e.message };
          }
        }
      } else if (call.name === "search_past_rates") {
        // GERÇEK veritabanı sorgusu — sahte sabit fiyat KALDIRILDI.
        const pol = (call.args.pol || '').trim();
        const pod = (call.args.pod || '').trim();
        if (!context.userId) {
          functionResult = { error: "Kullanıcı kimliği bulunamadı, fiyat geçmişi sorgulanamadı." };
        } else if (!pod) {
          functionResult = { error: "Varış limanı (POD) belirtilmeden fiyat araması yapılamaz." };
        } else {
          try {
            const found = [];

            // 1) Yüklenen rate sheet'lerden aktif/geçerli fiyatlar
            const rsQuery = `
              SELECT rsi.pol, rsi.pod, rsi.container_type, rsi.price, rsi.currency,
                     rsi.valid_until, rs.carrier_name
              FROM rate_sheet_items rsi
              JOIN rate_sheets rs ON rs.id = rsi.sheet_id
              WHERE rsi.user_id = $1
                AND rsi.pod ILIKE $2
                ${pol ? 'AND rsi.pol ILIKE $3' : ''}
                AND (rsi.valid_until IS NULL OR rsi.valid_until >= CURRENT_DATE)
              ORDER BY rsi.price ASC
              LIMIT 5
            `;
            const rsParams = pol
              ? [String(context.userId), `%${pod}%`, `%${pol}%`]
              : [String(context.userId), `%${pod}%`];
            const rsRes = await db.query(rsQuery, rsParams);
            rsRes.rows.forEach(r => found.push({
              source: 'rate_sheet',
              pol: r.pol, pod: r.pod, container_type: r.container_type,
              price: r.price, currency: r.currency || 'USD',
              carrier_name: r.carrier_name, valid_until: r.valid_until
            }));

            // 2) Geçmiş navlun kayıtları (pricing_rate_history)
            const histQuery = `
              SELECT pol, pod, container_type, carrier_name, price, currency, valid_until, created_at
              FROM pricing_rate_history
              WHERE user_id = $1
                AND pod ILIKE $2
                ${pol ? 'AND pol ILIKE $3' : ''}
              ORDER BY created_at DESC
              LIMIT 5
            `;
            const histParams = pol
              ? [context.userId, `%${pod}%`, `%${pol}%`]
              : [context.userId, `%${pod}%`];
            const histRes = await db.query(histQuery, histParams);
            histRes.rows.forEach(r => found.push({
              source: 'history',
              pol: r.pol, pod: r.pod, container_type: r.container_type,
              price: r.price, currency: r.currency || 'USD',
              carrier_name: r.carrier_name, valid_until: r.valid_until,
              date: r.created_at
            }));

            if (found.length === 0) {
              functionResult = {
                found: false,
                message: `${pol ? pol + ' → ' : ''}${pod} rotası için sistemde kayıtlı geçerli bir fiyat bulunamadı.`
              };
            } else {
              functionResult = { found: true, count: found.length, rates: found };
            }
          } catch (e) {
            console.error('[AI AGENT] search_past_rates DB hatası:', e.message);
            functionResult = { error: "Fiyat veritabanı sorgulanırken hata oluştu: " + e.message };
          }
        }
      }
      
      // Fonksiyon sonucunu AI'a geri gönder (Second Turn)
      contents.push(result.response.candidates[0].content); // Asistanın function call isteği
      contents.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: call.name,
            response: functionResult
          }
        }]
      });
      
      console.log(`[AI AGENT] Function Response AI'a iletiliyor...`);
      result = await model.generateContent({
        contents: contents,
        systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] }
      });
    }
    
    const responseText = result.response.text();
    
    let parsed;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0].trim());
      } else {
        throw parseErr;
      }
    }
    
    return { success: true, ...parsed };
  } catch (error) {
    console.error('AI analiz hatası:', error);
    throw error;
  }
}

// FallbackAnalysis tamamen silindi.

async function analyzeEmail(emailBody, emailSubject = '') {
  try {
    if (!genAI) return null;
    // Mail sınıflandırma basit bir iştir → en ucuz model yeterli (maliyet optimizasyonu)
    const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL_CHEAP || 'gemini-2.5-flash-lite' });
    const prompt = `Sen lojistik maillerini analiz edip yapılandırılmış veri çıkaran bir Pricing AI asistanısın.\n\nAşağıdaki emaili analiz et ve şu JSON formatında yanıt ver:\n{\n  "category": "RFQ|RATE_RESPONSE|NEGOTIATION|FOLLOWUP|OTHER",\n  "transport_mode": "DENIZ_FCL|DENIZ_LCL|HAVA|KARA|null",\n  "extracted_data": {\n    "pol": "yükleme limanı/şehri",\n    "pod": "varış limanı/şehri",\n    "container_type": "20DC|40HC|etc veya null",\n    "quantity": "adet veya null",\n    "incoterm": "FOB|EXW|CIF|etc veya null",\n    "loading_date": "tarih veya null",\n    "cargo_type": "yük cinsi veya null",\n    "weight_kg": "ağırlık veya null",\n    "price": "fiyat veya null",\n    "currency": "USD|EUR|TRY veya null",\n    "carrier_name": "taşıyıcı adı veya null",\n    "transit_time": "transit süre veya null"\n  },\n  "missing_fields": ["eksik alanlar listesi"],\n  "action": "SEND_RATE_REQUEST|SEND_OFFER|SEND_MISSING_INFO|null",\n  "summary": "Kısa Türkçe özet"\n}\n\nKONU: ${emailSubject}\nİÇERİK: ${emailBody}\n\nSadece JSON döndür:`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const responseText = result.response.text();
    
    let parsed;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0].trim());
      } else {
        throw parseErr;
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Email AI analiz hatası:', error);
    return null;
  }
}

async function analyzeRateSheetImage(base64Data, mimeType, filename = '') {
  try {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY bulunamadı, rate sheet analizi yapılamıyor.');
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL_SMART || 'gemini-2.5-flash' 
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const prompt = `Aşağıdaki navlun fiyat görselini (rate sheet / fiyat listesi) analiz et ve taşıyıcı adı, geçerlilik tarihi ile spot navlun fiyat satırlarını çıkart. 
Yanıtı tam olarak aşağıdaki JSON formatında dön. JSON dışında hiçbir açıklama veya metin ekleme.

JSON Formatı:
{
  "carrier_name": "Armatör veya taşıyıcı adı (MSC, Maersk vb.) veya null",
  "valid_until": "Fiyatların son geçerlilik tarihi (YYYY-MM-DD formatında) veya null",
  "items": [
    {
      "pol": "Yükleme limanı (Port of Loading)",
      "pod": "Varış limanı (Port of Discharge)",
      "container_type": "Konteyner tipi (40HC, 20DC, 40GP vb.)",
      "price": 1850.00, // sayısal fiyat
      "currency": "USD veya EUR vb.",
      "includes": ["Dahil olan ücretler, örn: THC, B/L, LSS vb. dizisi"],
      "transit_days": 28 // sayısal transit süre (varsa veya null)
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0].trim());
      } else {
        throw parseErr;
      }
    }
    return parsed;
  } catch (error) {
    console.error('Rate sheet vision analiz hatası:', error);
    throw error;
  }
}

module.exports = { analyzeCommand, analyzeEmail, analyzeRateSheetImage };
