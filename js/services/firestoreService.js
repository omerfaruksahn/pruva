import { db, storage } from '../firebase-config.js';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * PRUVA - Firestore Service
 * Tüm veritabanı okuma/yazma işlemleri burada soyutlanmıştır (abstracted).
 */
export class FirestoreService {

    // ─────────────────────────────────────────
    // COURSES (Eğitim Kursları — admin panelden yönetilir)
    // ─────────────────────────────────────────

    static async getCourses() {
        try {
            const q = query(collection(db, "courses"), limit(100));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.warn("[FIRESTORE] Kurslar yüklenemedi:", error.message);
            return []; // Hata olsa bile sayfa çalışmaya devam etsin
        }
    }

    // ─────────────────────────────────────────
    // USERS (Kullanıcılar)
    // ─────────────────────────────────────────
    
    static async getUser(uid) {
        try {
            const { getDocFromServer } = await import('firebase/firestore');
            const docRef = doc(db, "users", uid);
            const docSnap = await getDocFromServer(docRef);
            if (docSnap.exists()) {
                return { ...docSnap.data(), id: docSnap.id };
            }
            return null;
        } catch (error) {
            // Yetki hatası ayrı ele al (silinen kullanıcı vs. izin yok)
            if (error.code === 'permission-denied') {
                console.warn("[FIRESTORE] getUser: Firestore yetki hatası (rules).", uid);
                return null; // rules bunu engelliyor, throw etme
            }
            console.error("Firestore GetUser Hatası:", error);
            throw error;
        }
    }

    /**
     * @deprecated SADECE ADMIN SERVER (admin-server.js) için.
     * Yeni Firestore rules ile istemci tarafından çalışmaz.
     * Admin panel için /api/all-data endpoint'ini kullanın.
     */
    static async getAllUsers() {
        throw new Error('[FIRESTORE] getAllUsers() sadece server-side çalışır. /api/all-data endpoint’ini kullanın.');
    }

    static async createUser(uid, userData) {
        try {
            await setDoc(doc(db, "users", uid), userData);
            return { ...userData, id: uid };
        } catch (error) {
            console.error("Firestore CreateUser Hatası:", error);
            throw error;
        }
    }

    static async updateUser(uid, updates) {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, updates);
        } catch (error) {
            console.error("Firestore UpdateUser Hatası:", error);
            throw error;
        }
    }

    static async deleteUser(uid) {
        try {
            await deleteDoc(doc(db, "users", uid));
        } catch (error) {
            console.error("Firestore DeleteUser Hatası:", error);
            throw error;
        }
    }

    // ─────────────────────────────────────────
    // ADS (İlanlar)
    // ─────────────────────────────────────────

    static async getAds() {
        try {
            // İlanları tarihe göre yeninden eskiye sıralamak için orderBy eklenebilir.
            // Şimdilik test için düz çekiyoruz. Index hatası almamak adına önce basit query.
            const q = query(collection(db, "ads"), limit(100));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error("Firestore GetAds Hatası:", error);
            return [];
        }
    }

    static async addAd(adData) {
        try {
            const docRef = await addDoc(collection(db, "ads"), adData);
            return { ...adData, id: docRef.id };
        } catch (error) {
            console.error("Firestore AddAd Hatası:", error);
            throw error;
        }
    }

    static async updateAd(adId, updates) {
        try {
            const adRef = doc(db, "ads", adId);
            await updateDoc(adRef, updates);
        } catch (error) {
            console.error("Firestore UpdateAd Hatası:", error);
            throw error;
        }
    }

    static async deleteAd(adId) {
        try {
            await deleteDoc(doc(db, "ads", adId));
        } catch (error) {
            console.error("Firestore DeleteAd Hatası:", error);
            throw error;
        }
    }

    // ─────────────────────────────────────────
    // NOTIFICATIONS (Bildirimler)
    // ─────────────────────────────────────────

    static subscribeToNotifications(uid, callback) {
        const q = query(collection(db, "notifications"), where("userId", "==", uid), orderBy("timestamp", "desc"), limit(20));
        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            callback(notifications);
        });
    }

    static async addNotification(userId, notificationData) {
        try {
            await addDoc(collection(db, "notifications"), {
                userId,
                ...notificationData,
                timestamp: new Date().getTime(),
                isRead: false
            });
        } catch (error) {
            console.error("Firestore AddNotification Hatası:", error);
        }
    }

    static async markNotificationRead(notifId) {
        try {
            const notifRef = doc(db, "notifications", notifId);
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.error("Firestore MarkNotificationRead Hatası:", error);
        }
    }

    // ─────────────────────────────────────────
    // REAL-TIME (Anlık Dinleme)
    // ─────────────────────────────────────────
    
    static subscribeToAds(callback, onError) {
        // İlanlar koleksiyonundaki değişiklikleri canlı dinle. Maksimum 100 ilan çekerek performans sağla.
        const q = query(collection(db, "ads"), limit(100));
        return onSnapshot(q, (snapshot) => {
            const ads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            callback(ads);
        }, (error) => {
            console.error("Ads Real-time Hatası:", error);
            if (onError) onError(error);
        });
    }

    /**
     * @deprecated SADECE ADMIN SERVER (admin-server.js) için.
     * Yeni Firestore rules ile istemci tarafından çalışmaz.
     */
    static subscribeToUsers(callback, onError) {
        console.error('[FIRESTORE] subscribeToUsers() sadece server-side çalışır.');
        if (onError) onError(new Error('permission-denied'));
        return () => {}; // no-op unsubscribe
    }

    // ─────────────────────────────────────────
    // OFFERS (Teklifler)
    // ─────────────────────────────────────────

    static async addOffer(offerData) {
        try {
            const docRef = await addDoc(collection(db, "offers"), {
                ...offerData,
                timestamp: new Date().getTime()
            });
            return { ...offerData, id: docRef.id };
        } catch (error) {
            console.error("Firestore AddOffer Hatası:", error);
            throw error;
        }
    }

    static subscribeToOffers(adId, callback) {
        const q = query(collection(db, "offers"), where("adId", "==", adId), orderBy("timestamp", "desc"));
        return onSnapshot(q, (snapshot) => {
            const offers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            callback(offers);
        });
    }

    // ─────────────────────────────────────────
    // CHATS (Mesajlaşma)
    // ─────────────────────────────────────────

    static async getOrCreateChat(adId, participants) {
        try {
            // Basit bir chatId oluştur (Sıralı UID'ler ile benzersizlik sağla)
            const chatId = [adId, ...participants.sort()].join('_');
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                const chatData = {
                    adId,
                    participants,
                    lastMessage: "",
                    lastTimestamp: new Date().getTime(),
                    createdAt: new Date().getTime()
                };
                await setDoc(chatRef, chatData);
                return { ...chatData, id: chatId };
            }
            return { ...chatSnap.data(), id: chatId };
        } catch (error) {
            console.error("Firestore GetOrCreateChat Hatası:", error);
            throw error;
        }
    }

    static async sendMessage(chatId, messageData) {
        try {
            const messagesRef = collection(db, "chats", chatId, "messages");
            await addDoc(messagesRef, {
                ...messageData,
                timestamp: new Date().getTime(),
                isRead: false
            });

            // Chat ana dökümanını güncelle
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                lastMessage: messageData.text,
                lastSenderId: messageData.senderId,
                lastTimestamp: new Date().getTime()
            });
        } catch (error) {
            console.error("Firestore SendMessage Hatası:", error);
            throw error;
        }
    }

    static subscribeToMessages(chatId, callback) {
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            callback(messages);
        });
    }

    static async setChatPresence(chatId, uid, isOnline) {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                [`presence.${uid}`]: isOnline
            });
        } catch (error) {
            console.error("Firestore SetChatPresence Hatası:", error);
            throw error;
        }
    }

    static async markChatAsRead(chatId, uid) {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                [`lastReadTime.${uid}`]: Date.now()
            });
        } catch (error) {
            console.error("Firestore MarkChatAsRead Hatası:", error);
            throw error;
        }
    }

    static async updateTypingStatus(chatId, uid, isTyping) {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                [`typing.${uid}`]: isTyping
            });
        } catch (error) {
            console.error("Firestore UpdateTypingStatus Hatası:", error);
            throw error;
        }
    }

    static subscribeToChatDoc(chatId, callback) {
        const chatRef = doc(db, "chats", chatId);
        return onSnapshot(chatRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({ ...docSnap.data(), id: docSnap.id });
            }
        });
    }

    // ─── Mesaj Aksiyonları ───

    static async addReaction(chatId, messageId, uid, emoji) {
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            if (!emoji) {
                const { deleteField } = await import('firebase/firestore');
                await updateDoc(msgRef, { [`reactions.${uid}`]: deleteField() });
            } else {
                await updateDoc(msgRef, { [`reactions.${uid}`]: emoji });
            }
        } catch (error) {
            console.error("Firestore AddReaction Hatası:", error);
            throw error;
        }
    }

    static async removeReaction(chatId, messageId, uid) {
        try {
            const { deleteField } = await import('firebase/firestore');
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(msgRef, { [`reactions.${uid}`]: deleteField() });
        } catch (error) {
            console.error("Firestore RemoveReaction Hatası:", error);
            throw error;
        }
    }

    static async deleteMessage(chatId, messageId) {
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(msgRef, { deleted: true, text: '' });
        } catch (error) {
            console.error("Firestore DeleteMessage Hatası:", error);
            throw error;
        }
    }

    static async editMessage(chatId, messageId, newText) {
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(msgRef, { text: newText, edited: true, editedAt: new Date().getTime() });
        } catch (error) {
            console.error("Firestore EditMessage Hatası:", error);
            throw error;
        }
    }

    // ─────────────────────────────────────────
    // EDUCATION (Eğitim)
    // ─────────────────────────────────────────


    static async updateProgress(uid, courseId, completedModules) {
        try {
            const progressId = `${uid}_${courseId}`;
            const progressRef = doc(db, "userProgress", progressId);
            await setDoc(progressRef, {
                userId: uid,
                courseId: courseId,
                completedModules: completedModules,
                lastAccessed: new Date().getTime()
            }, { merge: true });
        } catch (error) {
            console.error("Firestore UpdateProgress Hatası:", error);
            throw error;
        }
    }

    static async getProgress(uid, courseId) {
        try {
            const progressId = `${uid}_${courseId}`;
            const docSnap = await getDoc(doc(db, "userProgress", progressId));
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error("Firestore GetProgress Hatası:", error);
            return null;
        }
    }

    // ─────────────────────────────────────────
    // STORAGE (Dosya / Fotoğraf Yükleme)
    // ─────────────────────────────────────────

    static async uploadFile(file, folderPath = 'uploads') {
        try {
            if (!storage) throw new Error("Firebase Storage ayarlanmamış.");
            
            const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storageRef = ref(storage, `${folderPath}/${uniqueFilename}`);

            const snapshot = await uploadBytesResumable(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Dosya yükleme hatası:", error);
            throw error;
        }
    }
}
