// ─────────────────────────────────────────────────────────────
// PAI (Pruva AI) — Edge-TTS Servis Modülü
// Microsoft'un ücretsiz yüksek kaliteli seslerini kullanarak
// metni insansı konuşmaya çevirir.
// ─────────────────────────────────────────────────────────────

const { EdgeTTS, listVoicesUniversal } = require('edge-tts-universal');

const DEFAULT_VOICE = 'tr-TR-EmelNeural';  // PAI varsayılan kadın sesi
const MAX_TEXT_LENGTH = 5000;              // Maksimum karakter limiti
const CACHE_MAX_SIZE = 100;               // Cache'te tutulacak max öğe sayısı

// ─── Basit LRU Cache ───
const cache = new Map();

function getCacheKey(text, voice) {
    return `${voice}::${text}`;
}

function getCachedAudio(text, voice) {
    const key = getCacheKey(text, voice);
    if (cache.has(key)) {
        // LRU: Erişilen öğeyi sona taşı
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
    }
    return null;
}

function setCachedAudio(text, voice, audioBuffer) {
    const key = getCacheKey(text, voice);
    // Kapasite aşıldıysa en eski öğeyi sil
    if (cache.size >= CACHE_MAX_SIZE) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
    cache.set(key, audioBuffer);
}

// ─── Ana Sentez Fonksiyonu ───
async function synthesizeSpeech(text, voiceName = DEFAULT_VOICE) {
    if (!text || typeof text !== 'string') {
        throw new Error('Geçerli bir metin gerekli.');
    }

    const cleanText = text.trim();
    if (cleanText.length === 0) {
        throw new Error('Boş metin sentezlenemez.');
    }
    if (cleanText.length > MAX_TEXT_LENGTH) {
        throw new Error(`Metin çok uzun (max ${MAX_TEXT_LENGTH} karakter).`);
    }

    // Cache kontrolü
    const cached = getCachedAudio(cleanText, voiceName);
    if (cached) {
        console.log(`[TTS] Cache'ten döndürülüyor (${cleanText.substring(0, 30)}...)`);
        return cached;
    }

    try {
        const tts = new EdgeTTS();
        tts.text = cleanText;
        tts.voice = voiceName;
        tts.rate = '+25%'; // Konuşma hızını %25 artır
        
        const result = await tts.synthesize();
        
        if (!result || !result.audio) {
            throw new Error('Edge-TTS boş ses verisi döndürdü.');
        }

        // result.audio is a Blob, convert to Node Buffer
        const arrayBuffer = await result.audio.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        // Cache'e kaydet
        setCachedAudio(cleanText, voiceName, audioBuffer);
        console.log(`[TTS] Sentezlendi: "${cleanText.substring(0, 50)}..." (${voiceName}, ${audioBuffer.length} bytes)`);

        return audioBuffer;
    } catch (err) {
        console.error(`[TTS] Sentez hatası:`, err.message);
        throw new Error('Ses sentezleme başarısız: ' + err.message);
    }
}

// ─── Kullanılabilir Türkçe Sesleri Listele ───
async function getAvailableVoices() {
    try {
        const voices = await listVoicesUniversal();
        
        // Sadece Türkçe sesleri filtrele
        const turkishVoices = voices.filter(v => 
            v.Locale && v.Locale.startsWith('tr-TR')
        ).map(v => ({
            name: v.ShortName,
            displayName: v.FriendlyName || v.ShortName,
            locale: v.Locale,
            gender: v.Gender
        }));

        return turkishVoices;
    } catch (err) {
        console.error('[TTS] Ses listesi alınamadı:', err.message);
        // Fallback: Bilinen Türkçe sesleri döndür
        return [
            { name: 'tr-TR-EmelNeural', displayName: 'Emel (Kadın)', locale: 'tr-TR', gender: 'Female' },
            { name: 'tr-TR-AhmetNeural', displayName: 'Ahmet (Erkek)', locale: 'tr-TR', gender: 'Male' }
        ];
    }
}

module.exports = {
    synthesizeSpeech,
    getAvailableVoices,
    DEFAULT_VOICE,
    MAX_TEXT_LENGTH
};
