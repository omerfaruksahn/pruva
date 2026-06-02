const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `Sen Pruva AI'sın — bir lojistik operasyon ve fiyatlama asistanısın. Tıpkı Iron Man'deki JARVIS gibi, kullanıcınla doğal, zeki ve samimi bir dille konuşmalısın.

GÖREV TANIMLARIN:
1. Kullanıcının doğal dilde yazdığı komutları veya soruları anla.
2. Sadece e-posta GÖNDERİLMESİ gereken durumlarda SEND_ aksiyonlarını seç.
3. Sohbet, soru-cevap, durum sorma gibi durumlarda KESİNLİKLE 'GENERAL' aksiyonunu seç ve ona doğrudan yanıt ver.

ALGILAYACAĞIN AKSİYONLAR:
- SEND_CUSTOM_EMAIL: Özel bir e-posta tasarlayıp birine göndermek için.
- SEND_RATE_REQUEST: Taşıyıcılardan fiyat talep etmek için.
- SEND_OFFER: Müşteriye fiyat teklifi göndermek için.
- SEND_MISSING_INFO: Müşteriden eksik bilgi istemek için.
- SEND_FOLLOWUP: Taşıyıcıya veya müşteriye hatırlatma maili atmak için.
- GENERAL: Bütün diğer sorular, muhabbet, "ne oldu?", "bunun adresi ne?", "bu kim?" gibi bilgi soruları. JARVIS gibi yanıtla!

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
  "suggestedMessage": "SADECE SEND_ aksiyonlarında karşı tarafa gidecek e-posta gövdesi. GENERAL aksiyonunda boş bırak."
}

ÖNEMLİ KURALLAR:
- Kullanıcı sana soru sorduğunda (örn: 'mail adresini versen de olur', 'ne çıktı?'), 'GENERAL' aksiyonunu seçip 'summary' alanında ona bir insan gibi yanıt ver. Kesinlikle arka planda eylem yapıyormuş gibi davranma.
- Emin değilsen daima 'GENERAL' seç.`;

async function analyzeCommand(userMessage, context = {}, fileParts = []) {
  try {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY bulunamadı. Yapay zeka kullanılamıyor.');
    }
    
    const model = genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-2.5-flash' 
    });
    
    const contextStr = context.company 
      ? `\nAKTİF KONUŞMA: ${context.company} (${context.status || 'UNKNOWN'})`
      : '';
    
    let historyStr = '';
    if (context.history && context.history.length > 0) {
      historyStr = '\nSOHBET GEÇMİŞİ:\n' + context.history.map(h => `${h.role === 'user' ? 'Kullanıcı' : 'Pruva AI'}: ${h.text}`).join('\n') + '\n';
    }
    
    const carriersStr = context.carriers?.length 
      ? `\nMEVCUT TAŞIYICILAR: ${context.carriers.map(c => c.name).join(', ')}`
      : '';
    
    const prompt = `${SYSTEM_PROMPT}\n${contextStr}${historyStr}\n${carriersStr}\n\nKULLANICI MESAJI: "${userMessage}"\n\nJSON yanıtını ver:`;
    
    const parts = [{ text: prompt }, ...fileParts];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
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
    const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL || 'gemini-2.0-flash' });
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
      model: process.env.AI_MODEL || 'gemini-2.0-flash' 
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
