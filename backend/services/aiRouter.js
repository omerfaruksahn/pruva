// ─────────────────────────────────────────────────────────────
// PRUVA — AI Router (Maliyet Optimizasyon Katmanı)
//
// 3 katmanlı yönlendirme ile AI maliyetini düşürür:
//   Katman 0 (BEDAVA): Basit kalıplar AI'a hiç gitmez (selam, teşekkür, reset).
//   Katman 1 (UCUZ):   Sınıflandırma + günlük işler → gemini-2.5-flash-lite ($0.10/$0.40).
//   Katman 2 (PAHALI): Sadece karmaşık işler → gemini-2.5-flash ($0.30/$2.50).
//
// Hangi katmana gideceğine basit, deterministik kurallarla karar verir
// (router kararının kendisi de AI'a sorulmaz → ekstra maliyet yok).
// ─────────────────────────────────────────────────────────────

// Model isimleri .env'den override edilebilir
const MODEL_CHEAP = process.env.AI_MODEL_CHEAP || 'gemini-2.5-flash-lite';
const MODEL_SMART = process.env.AI_MODEL_SMART || 'gemini-2.5-flash';

// ── KATMAN 0: AI'a hiç gitmeyen, kodla cevaplanan basit kalıplar ──
// Eşleşirse { handled: true, response } döner; eşleşmezse { handled: false }.
function tryStaticReply(rawMessage) {
  const msg = (rawMessage || '').trim().toLowerCase();
  if (!msg) return { handled: false };

  // Çok kısa selamlaşma / nezaket kalıpları
  const greetings = ['selam', 'merhaba', 'mrb', 'günaydın', 'gunaydin', 'iyi günler', 'iyi gunler',
    'iyi akşamlar', 'iyi aksamlar', 'naber', 'nasılsın', 'nasilsin', 'hey', 'hi', 'hello'];
  const thanks = ['teşekkür', 'tesekkur', 'sağol', 'sagol', 'eyvallah', 'teşekkürler',
    'tesekkurler', 'sağ ol', 'thanks', 'thank you'];
  const bye = ['görüşürüz', 'gorusuruz', 'bay', 'bye', 'hoşça kal', 'hosca kal', 'kapat'];

  // Tam eşleşme veya çok kısa mesajlarda kelime içeriyorsa (uzun cümlede tetiklenmesin)
  const isShort = msg.split(/\s+/).length <= 3;

  if (isShort && greetings.some(g => msg === g || msg.startsWith(g))) {
    return {
      handled: true,
      response: {
        success: true,
        action: 'GENERAL',
        summary: 'Merhaba! Ben Pruva AI. Navlun fiyatı alma, mail tarama, teklif hazırlama gibi konularda yardımcı olabilirim. Ne yapmak istersiniz?',
        confidence: 1,
        _tier: 'static'
      }
    };
  }
  if (isShort && thanks.some(t => msg.includes(t))) {
    return {
      handled: true,
      response: {
        success: true,
        action: 'GENERAL',
        summary: 'Rica ederim! Başka bir konuda yardımcı olmamı ister misiniz?',
        confidence: 1,
        _tier: 'static'
      }
    };
  }
  if (isShort && bye.some(b => msg === b || msg.startsWith(b))) {
    return {
      handled: true,
      response: {
        success: true,
        action: 'GENERAL',
        summary: 'Görüşmek üzere! İhtiyacınız olduğunda buradayım.',
        confidence: 1,
        _tier: 'static'
      }
    };
  }

  return { handled: false };
}

// ── KATMAN 1 vs 2: Hangi modele gideceğine karar ver ──
// "Karmaşık" sinyalleri varsa pahalı (SMART) modele, yoksa ucuz (CHEAP) modele.
function pickModel(rawMessage, context = {}, hasFiles = false) {
  const msg = (rawMessage || '').toLowerCase();
  const wordCount = msg.split(/\s+/).filter(Boolean).length;

  // Karmaşıklık sinyalleri → SMART model gerekir
  const complexKeywords = [
    'pazarlık', 'pazarlik', 'müzakere', 'muzakere', 'revize', 'karşı teklif', 'karsi teklif',
    'analiz et', 'karşılaştır', 'karsilastir', 'neden', 'açıkla', 'aciklia', 'strateji',
    'hangisini', 'tavsiye', 'öner', 'oner', 'yorumla', 'değerlendir', 'degerlendir'
  ];
  const hasComplexKeyword = complexKeywords.some(k => msg.includes(k));

  // Uzun konuşma geçmişi = bağlam yükü = SMART daha tutarlı
  const longHistory = (context.history?.length || 0) >= 6;

  // Uzun mesaj (50+ kelime) genelde karmaşık talep
  const longMessage = wordCount >= 50;

  // Dosya (PDF/görsel rate sheet) analizi SMART ister
  if (hasFiles || hasComplexKeyword || longHistory || longMessage) {
    return { model: MODEL_SMART, tier: 'smart' };
  }

  // Geri kalan her şey ucuz modele
  return { model: MODEL_CHEAP, tier: 'cheap' };
}

module.exports = {
  tryStaticReply,
  pickModel,
  MODEL_CHEAP,
  MODEL_SMART
};
