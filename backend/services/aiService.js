const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `Sen Pruva AI'sın — bir lojistik operasyon ve fiyatlama asistanı. 
Türk lojistik şirketlerinin günlük operasyonlarına yardımcı oluyorsun.

GÖREV TANIMLARIN:
1. Kullanıcının doğal dilde yazdığı komutları anla
2. İlgili aksiyonu belirle  
3. Yapılandırılmış JSON yanıt döndür

ALGILAYACAĞIN AKSİYONLAR:
- SEND_CUSTOM_EMAIL: Belirli bir e-posta adresine doğrudan özel tanıtım, bilgilendirme, iş birliği veya ad-hoc fiyat e-postası tasarlama aksiyonu (örn: 'hedef@hedef.com adresine ABC Lojistik adıyla tanıtım e-postası gönder', 'x@y.com adresine Hamburg fiyatı sor').
- SEND_RATE_REQUEST: Taşıyıcılardan fiyat talep et (rfq, fiyat sor, rate iste, navlun sor)
- SEND_OFFER: Müşteriye teklif gönder (teklif ver, teklif hazırla, fiyat ver, price offer)
- SEND_MISSING_INFO: Eksik bilgi iste (eksik bilgi, missing info, bilgi iste)
- SEND_FOLLOWUP: Takip maili gönder (takip, hatırlat, follow up, reminder)
- INFO_QUERY: Bilgi sorgusu (ne durumda, durum ne, kaç teklif, rapor)
- GENERAL: Genel sohbet veya tanımlanamayan istek

YANIT FORMATI (Her zaman bu JSON formatında yanıt ver):
{
  "action": "SEND_CUSTOM_EMAIL|SEND_RATE_REQUEST|SEND_OFFER|SEND_MISSING_INFO|SEND_FOLLOWUP|INFO_QUERY|GENERAL",
  "confidence": 0.0-1.0,
  "companyMention": "algılanan şirket adı veya null",
  "summary": "Kullanıcıya gösterilecek kısa Türkçe açıklama",
  "details": {
    "to_email": "SEND_CUSTOM_EMAIL durumunda alıcının e-posta adresi (örn: destek@pruvahub.com), aksi halde null",
    "subject": "SEND_CUSTOM_EMAIL durumunda Türkçe e-posta konu başlığı, aksi halde null",
    "transportMode": "FCL|LCL|AIR|ROAD|null",
    "route": { "pol": "varsa", "pod": "varsa" },
    "carriers": ["önerilen taşıyıcılar"],
    "templateKey": "kullanılacak template key (ör: fcl-request veya custom-email)",
    "urgency": "LOW|MEDIUM|HIGH"
  },
  "suggestedMessage": "Alıcıya gönderilecek veya onayınıza sunulacak Türkçe e-posta gövdesi (HTML/Rich-text formatında yazılabilir)"
}

ÖNEMLİ KURALLAR:
- Her zaman Türkçe yanıt ver
- Her zaman geçerli JSON döndür, başka metin ekleme
- Lojistik terminolojisini doğru kullan
- Emin olmadığın alanları null yap
- confidence 0.8'den düşükse action'ı GENERAL yap`;

async function analyzeCommand(userMessage, context = {}) {
  try {
    if (!genAI) {
      console.warn('GEMINI_API_KEY bulunamadı, fallback kullanılıyor');
      return fallbackAnalysis(userMessage);
    }
    
    const model = genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-1.5-pro' 
    });
    
    const contextStr = context.company 
      ? `\nAKTİF KONUŞMA: ${context.company} (${context.status || 'UNKNOWN'})`
      : '';
    
    const carriersStr = context.carriers?.length 
      ? `\nMEVCUT TAŞIYICILAR: ${context.carriers.map(c => c.name).join(', ')}`
      : '';
    
    const prompt = `${SYSTEM_PROMPT}\n${contextStr}\n${carriersStr}\n\nKULLANICI MESAJI: "${userMessage}"\n\nJSON yanıtını ver:`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    return { success: true, ...parsed };
  } catch (error) {
    console.error('AI analiz hatası:', error);
    return fallbackAnalysis(userMessage);
  }
}

function fallbackAnalysis(text) {
  const lower = text.toLowerCase();
  let action = 'GENERAL';
  let summary = 'Mesajınız alındı.';
  let templateKey = null;
  let carriers = [];
  let toEmail = null;
  let subject = null;
  let suggestedMessage = null;

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  if (emailMatch && (lower.includes('tanıtım') || lower.includes('tanitim') || lower.includes('mail') || lower.includes('gönder') || lower.includes('gonder'))) {
    action = 'SEND_CUSTOM_EMAIL';
    toEmail = emailMatch[0];
    templateKey = 'custom-email';
    
    // Şirket adını çıkarmaya çalışalım
    let companyName = 'Pruva Lojistik';
    const companyMatch = text.match(/\[([^\]]+)\]/);
    if (companyMatch) {
      companyName = companyMatch[1];
    } else {
      const parts = text.split(/\s+/);
      const nameIndex = parts.findIndex(p => p.toLowerCase().includes('adıyla') || p.toLowerCase().includes('ismiyle'));
      if (nameIndex > 0) {
        companyName = parts[nameIndex - 1];
      }
    }
    
    summary = `${toEmail} adresine ${companyName} tanıtım e-postası taslağı hazırlandı.`;
    subject = `${companyName} — Tanıtım ve İş Birliği Talebi`;
    suggestedMessage = `Sayın Yetkili,<br><br><b>${companyName}</b> olarak lojistik operasyonlarımızda spot navlun, gümrükleme ve tedarik zinciri çözümleri sunmaktayız. Şirketinizin lojistik ihtiyaçları doğrultusunda spot FCL/LCL, hava yolu ve kara yolu taşımalarınız için fiyat teklifleri sunmaktan ve iş birliği yapmaktan memnuniyet duyarız.<br><br>Güncel navlun taleplerinizi paylaşmanız halinde en kısa sürede fiyatlandırma çalışmasını tamamlayabiliriz.<br><br>Saygılarımızla,<br>Pruva Pricing Team`;
  } else if (lower.includes('fiyat sor') || lower.includes('rate iste') || lower.includes('rfq') || lower.includes('navlun')) {
    action = 'SEND_RATE_REQUEST';
    summary = 'Taşıyıcılara fiyat talebi gönderilecek.';
    templateKey = 'fcl-request';
    carriers = ['MSC', 'Maersk'];
  } else if (lower.includes('teklif ver') || lower.includes('teklif gönder') || lower.includes('teklif hazırla')) {
    action = 'SEND_OFFER';
    summary = 'Müşteriye fiyat teklifi gönderilecek.';
    templateKey = 'fcl-offer';
  } else if (lower.includes('eksik bilgi') || lower.includes('bilgi iste') || lower.includes('missing')) {
    action = 'SEND_MISSING_INFO';
    summary = 'Eksik bilgi talebi gönderilecek.';
    templateKey = 'common-missing';
  } else if (lower.includes('takip') || lower.includes('hatırlat') || lower.includes('follow')) {
    action = 'SEND_FOLLOWUP';
    summary = 'Takip maili gönderilecek.';
    templateKey = 'fcl-followup';
    carriers = ['MSC'];
  }
  
  return {
    success: true, action, confidence: action === 'GENERAL' ? 0.3 : 0.85,
    companyMention: null, summary,
    details: { to_email: toEmail, subject, transportMode: null, route: { pol: null, pod: null }, carriers, templateKey, urgency: 'MEDIUM' },
    suggestedMessage
  };
}

async function analyzeEmail(emailBody, emailSubject = '') {
  try {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL || 'gemini-1.5-pro' });
    const prompt = `Sen lojistik maillerini analiz edip yapılandırılmış veri çıkaran bir Pricing AI asistanısın.\n\nAşağıdaki emaili analiz et ve şu JSON formatında yanıt ver:\n{\n  "category": "RFQ|RATE_RESPONSE|NEGOTIATION|FOLLOWUP|OTHER",\n  "transport_mode": "DENIZ_FCL|DENIZ_LCL|HAVA|KARA|null",\n  "extracted_data": {\n    "pol": "yükleme limanı/şehri",\n    "pod": "varış limanı/şehri",\n    "container_type": "20DC|40HC|etc veya null",\n    "quantity": "adet veya null",\n    "incoterm": "FOB|EXW|CIF|etc veya null",\n    "loading_date": "tarih veya null",\n    "cargo_type": "yük cinsi veya null",\n    "weight_kg": "ağırlık veya null",\n    "price": "fiyat veya null",\n    "currency": "USD|EUR|TRY veya null",\n    "carrier_name": "taşıyıcı adı veya null",\n    "transit_time": "transit süre veya null"\n  },\n  "missing_fields": ["eksik alanlar listesi"],\n  "action": "SEND_RATE_REQUEST|SEND_OFFER|SEND_MISSING_INFO|null",\n  "summary": "Kısa Türkçe özet"\n}\n\nKONU: ${emailSubject}\nİÇERİK: ${emailBody}\n\nSadece JSON döndür:`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Email AI analiz hatası:', error);
    return null;
  }
}

module.exports = { analyzeCommand, analyzeEmail, fallbackAnalysis };
