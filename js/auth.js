import { FirestoreService } from './services/firestoreService.js';

window.Auth = class Auth {
    constructor(appInstance) {
        this.app = appInstance;
        // Initialize state cache to null so first render always happens
        this._lastNavState = null;

        // Dışarı tıklanınca profil dropdown'ı kapat
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('profile-dropdown');
            const nav = e.target.closest('#user-profile-nav');
            if (dropdown && dropdown.style.display === 'block' && !nav) {
                dropdown.style.display = 'none';
            }
        });


    }

    async init() {
        if (!window.fbAuth) {
            console.warn("[AUTH] Firebase Auth hazır değil.");
            return;
        }

        return new Promise((resolve) => {
            import("firebase/auth").then(({ onAuthStateChanged }) => {
                onAuthStateChanged(window.fbAuth, async (user) => {
                    if (user) {
                        try {
                            // BUG FIX: Eğer bu kullanıcı henüz kayıt akışındaysa (yeni kayıt)
                            // Firestore yazma tamamlanmamış olabilir. _registeringUid flag'i bunu işaret eder.
                            if (this._registeringUid === user.uid) {
                                console.log('[AUTH] Yeni kayıt akışı devam ediyor, onAuthStateChanged bekletiliyor...');
                                resolve();
                                return;
                            }

                            let dbUser = null;
                            try {
                                dbUser = await FirestoreService.getUser(user.uid);
                            } catch(e) { console.warn("[AUTH] Firestore getUser failed:", e); }
                            
                            const localUser = this.app.state.users.find(u => u.id === user.uid);

                            if (dbUser || localUser) {
                                const activeUser = dbUser || localUser;
                                
                                // Cache the active user in state.users to prevent "Kullanıcı verileri yüklenemedi" error on refresh
                                const existingIdx = this.app.state.users.findIndex(u => u.id === user.uid);
                                if (existingIdx !== -1) {
                                    this.app.state.users[existingIdx] = activeUser;
                                } else {
                                    this.app.state.users.push(activeUser);
                                }

                                this.app.state.isLoggedIn = true;
                                this.app.state.currentUser = activeUser.name;
                                this.app.state.userRole = activeUser.role;
                                this.app.state.currentUserUid = user.uid;
                                this.app.store.save();
                                
                                // Start real-time listeners if not already started
                                if (this.app.store.loadFromFirestore) {
                                    this.app.store.loadFromFirestore();
                                }
                                
                                // Initialize messages dropdown listener for live badge and popover updates
                                if (window.inboxDropdown && typeof window.inboxDropdown.initListener === 'function') {
                                    window.inboxDropdown.initListener(this.app);
                                }
                            } else {
                                // KRİTİK: Eğer Auth oturumu var ama DB/Local'de yoksa sistemden at.
                                console.warn("[AUTH] Oturum var ama veritabanı/local kaydı yok. Çıkış yapılıyor...");
                                const { signOut } = await import("firebase/auth");
                                await signOut(window.fbAuth);
                                this.app.state.isLoggedIn = false;
                                this.app.state.currentUser = 'Misafir';
                                this.app.state.userRole = 'loader';
                                this.app.store.save();
                            }
                        } catch (err) {
                            console.error("[AUTH] Error fetching user data:", err);
                        }
                    } else {
                        // Signed out
                        this.app.state.isLoggedIn = false;
                        this.app.state.currentUser = 'Misafir';
                        this.app.state.userRole = 'loader';
                        this.app.store.save();
                    }
                    this.updateNavbarUI();
                    
                    if (this.app.router) this.app.router.updateNav();
                    resolve();
                });
            });
        });
    }

    updateNavbarUI() {
        if (window.navbarComponent) {
            window.navbarComponent.render(this.app.state);
        } else {
            console.warn("[AUTH] NavbarComponent has not been initialized yet.");
        }
    }

    login(email, password) {
        this.firebaseLogin(email, password);
    }

    async firebaseRegister(data) {
        // BUG FIX: Kayıt akışını işaret et → onAuthStateChanged race condition'ı önle
        this._registeringUid = '__pending__';

        // Butonu devre dışı bırak (çift tıklamayı önle)
        const submitBtn = document.querySelector('#register-form button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = window.i18n.t('auth.btn_saving'); }

        try {
            if (!window.fbAuth) throw new Error('Firebase Auth initialized değil.');
            const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
            
            const userCredential = await createUserWithEmailAndPassword(window.fbAuth, data.email, data.password);
            const user = userCredential.user;

            // BUG FIX: updateProfile yalnızca bir kez çağrılmalı (önceden 2x yazılmıştı)
            await updateProfile(user, { displayName: data.companyName });

            // Race condition için gerçek UID'yi işaretle
            this._registeringUid = user.uid;

            // Firestore'a kaydet
            const newUser = {
                name: data.companyName,
                companyType: data.companyType,
                taxNumber: data.taxNumber,
                taxOffice: data.taxOffice || '',
                phone: data.phone || '',
                address: data.address || '',
                email: data.email,
                role: data.role,
                status: 'pending_approval',
                joinDate: new Date().toISOString().split('T')[0],
                createdAt: Date.now()
            };

            // Retry write to Firestore up to 3 times to prevent Auth-Firestore token race condition
            let dbSuccess = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    await new Promise(r => setTimeout(r, 300 * attempt)); // progressive delay
                    await FirestoreService.createUser(user.uid, newUser);
                    dbSuccess = true;
                    console.log(`[AUTH] Firestore user document successfully created on attempt ${attempt}`);
                    break;
                } catch(dbErr) {
                    console.warn(`[AUTH] Firestore write attempt ${attempt} failed:`, dbErr.message);
                }
            }

            if (dbSuccess) {
                try {
                    // Otomatik Hoş Geldin Sohbeti Oluştur
                    const welcomeChat = await FirestoreService.getOrCreateChat('system', ['system', user.uid]);
                    
                    // Şık ve kapsamlı Hoş Geldin Mesaj İçeriği
                    const welcomeMessageText = `👋 **Pruva Lojistik Pazaryerine Hoş Geldiniz!**

Merhaba,

Türkiye'nin en hızlı ve güvenilir dijital lojistik platformu **Pruva**'ya başarıyla kayıt oldunuz. Lojistik operasyonlarınızı kolaylaştırmak, en uygun navlun tekliflerine saniyeler içinde ulaşmak ve güvenilir iş ortaklarıyla anında eşleşmek için doğru yerdesiniz!

🚀 **Pruva ile Neler Yapabilirsiniz?**
* **Yük Sahipleri İçin:** Saniyeler içinde detaylı yük ilanı oluşturabilir, taşıyıcılardan gelen rekabetçi navlun tekliflerini değerlendirebilir ve yükünüzün liman serbest süre (free time) durumlarını akıllı alarmlarımızla canlı takip edebilirsiniz.
* **Taşıyıcılar İçin:** Pazaryerindeki yüzlerce aktif yüke anında teklif verebilir, güvenli anlaşma altyapımızla iş hacminizi katlayabilir ve yüksek performans puanı kazanarak öne çıkabilirsiniz.

🛡️ **Güvenli Ticaret Hatırlatması:**
Pruva güvenliğini ve işlem kalitesini korumak amacıyla sohbetler üzerinden doğrudan telefon numarası, e-posta veya banka/fatura bilgisi paylaşılması yasaktır. Platform üzerinden anlaşma sağlandığı anda, iki tarafın da iletişim ve fatura bilgileri sistem tarafından **otomatik ve güvenli olarak** birbirine iletilecektir.

💡 *Not: Bu mesaj otomatik bir sistem bilgilendirmesidir ve yanıtlanamamaktadır. Destek almak istediğiniz her an sol taraftaki menüden **Yardım & Destek** alanına gidebilir veya support@pruvahub.com adresinden ekibimize ulaşabilirsiniz.*

Pruva ile yollarınız açık, işleriniz kolay olsun! İyi çalışmalar dileriz.

**Pruva Destek Ekibi**`;

                    const welcomeMessage = {
                        senderId: 'system',
                        senderName: 'Pruva Destek',
                        text: welcomeMessageText,
                        type: 'text',
                        timestamp: Date.now()
                    };

                    await FirestoreService.sendMessage(welcomeChat.id, welcomeMessage);
                    console.log(`[AUTH] Welcome chat and message successfully created for user ${user.uid}`);
                } catch(welcomeErr) {
                    console.error("[AUTH] Welcome chat creation failed:", welcomeErr);
                }
            }

            if (!dbSuccess) {
                console.warn("[AUTH] Firestore user creation failed after all attempts. Falling back to local state.");
                if (window.notificationManager) {
                    window.notificationManager.showToast(window.i18n.t('auth.toast_db_error'), 'warning');
                }
            }
            
            // Local state'i güncelle (UI için)
            newUser.id = user.uid;
            // Aynı kullanıcı zaten varsa güncelle, yoksa ekle
            const existingIdx = this.app.state.users.findIndex(u => u.id === user.uid);
            if (existingIdx !== -1) {
                this.app.state.users[existingIdx] = newUser;
            } else {
                this.app.state.users.push(newUser);
            }
            this.app.state.currentUser = newUser.name;
            this.app.state.userRole = newUser.role;
            this.app.state.currentUserUid = user.uid;
            this.app.state.isLoggedIn = true;
            this.app.store.save();

            // E-posta doğrulama maili gönder (engelleyici değil, başarısız olursa kayıtı durdurmaz)
            try {
                const { sendEmailVerification } = await import('firebase/auth');
                await sendEmailVerification(user);
                console.log('[AUTH] E-posta doğrulama maili gönderildi:', data.email);
            } catch (verifyErr) {
                console.warn('[AUTH] E-posta doğrulama maili gönderilemedi:', verifyErr.message);
            }

            if (window.notificationManager) {
                window.notificationManager.showToast(window.i18n.t('auth.toast_register_success'), 'success');
            }
            this.app.router.navigate('home');
        } catch (error) {
            console.error('Firebase Kayıt Hatası:', error);

            // BUG FIX: Kullanıcıya anlamlı hata mesajı göster
            const errorMessages = {
                'auth/email-already-in-use':     window.i18n.t('auth.err_email_in_use'),
                'auth/invalid-email':            window.i18n.t('auth.err_invalid_email'),
                'auth/weak-password':            window.i18n.t('auth.err_weak_password'),
                'auth/network-request-failed':   window.i18n.t('auth.err_network'),
                'auth/too-many-requests':        window.i18n.t('auth.err_too_many_requests'),
                'auth/operation-not-allowed':    window.i18n.t('auth.err_operation_not_allowed'),
            };
            let cleanMsg = error.message || '';
            cleanMsg = cleanMsg.replace(/firebase:/gi, '').replace(/error/gi, '').replace(/\(auth\/[a-z-]+\)/gi, '').replace(/\./g, '').trim();
            const userMsg = errorMessages[error.code] || `${window.i18n.t('auth.register_failed')}: ${cleanMsg}`;

            if (window.notificationManager) {
                window.notificationManager.showToast(userMsg, 'error');
            } else {
                alert(userMsg);
            }
        } finally {
            // BUG FIX: Race condition flag'ini temizle
            this._registeringUid = null;
            // Butonu yeniden aktif et
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = window.i18n.t('auth.btn_complete_registration'); }
        }
    }

    async firebaseLogin(email, password) {
        try {
            if (!window.fbAuth) throw new Error('Firebase Auth initialized değil.');
            const { signInWithEmailAndPassword } = await import("firebase/auth");
            
            const userCredential = await signInWithEmailAndPassword(window.fbAuth, email, password);
            const user = userCredential.user;

            // Firestore'dan kullanıcı verisini çek
            let dbUser = null;
            try {
                dbUser = await FirestoreService.getUser(user.uid);
            } catch(e) { console.warn("[AUTH] Firebase login db get hatası:", e); }
            
            const localUser = this.app.state.users.find(u => u.id === user.uid);
            
            if (!dbUser && !localUser) {
                // Eğer kullanıcı veritabanında yoksa (Admin tarafından silinmişse), girişi engelle
                const { signOut } = await import("firebase/auth");
                await signOut(window.fbAuth);
                throw new Error("Hesabınız sistemden silinmiş veya bulunamadı.");
            }
            
            dbUser = dbUser || localUser;
            
            dbUser.id = user.uid;
            
            // Kullanıcı cache'te yoksa ekle, varsa güncelle
            const existingIndex = this.app.state.users.findIndex(u => u.id === user.uid);
            if (existingIndex !== -1) {
                this.app.state.users[existingIndex] = dbUser;
            } else {
                this.app.state.users.push(dbUser);
            }

            this.app.state.currentUser = dbUser.name;
            this.app.state.userRole = dbUser.role;
            this.app.state.currentUserUid = user.uid; // [NEW]
            this.app.state.isLoggedIn = true;
            this.app.store.save();

            if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('auth.toast_login_success'), 'success');

            // E-posta doğrulama uyarısı (engelleyici değil)
            if (!user.emailVerified) {
                setTimeout(() => {
                    if (window.notificationManager) {
                        window.notificationManager.showToast(
                            window.i18n.t('auth.toast_email_not_verified'),
                            'warning'
                        );
                    }
                }, 1500);
            }
            this.app.router.navigate('home');
        } catch (error) {
            console.error('Firebase Giriş Hatası:', error);
            // BUG FIX: alert() yerine tutarlı toast kullan
            const errorMessages = {
                'auth/invalid-credential':       window.i18n.t('auth.err_invalid_credential'),
                'auth/user-not-found':           window.i18n.t('auth.err_user_not_found'),
                'auth/wrong-password':           window.i18n.t('auth.err_wrong_password'),
                'auth/too-many-requests':        window.i18n.t('auth.err_locked'),
                'auth/user-disabled':            window.i18n.t('auth.err_user_disabled'),
                'auth/network-request-failed':   window.i18n.t('auth.err_network'),
                'auth/invalid-email':            window.i18n.t('auth.err_invalid_email'),
            };
            let cleanMsg = error.message || '';
            cleanMsg = cleanMsg.replace(/firebase:/gi, '').replace(/error/gi, '').replace(/\(auth\/[a-z-]+\)/gi, '').replace(/\./g, '').trim();
            const userMsg = errorMessages[error.code] || `${window.i18n.t('auth.login_failed')}: ${cleanMsg}`;
            if (window.notificationManager) {
                window.notificationManager.showToast(userMsg, 'error');
            } else {
                alert(userMsg);
            }
        }
    }


    register(data) {
        this.firebaseRegister(data);
    }

    async logout() {
        try {
            if (window.fbAuth) {
                const { signOut } = await import("firebase/auth");
                await signOut(window.fbAuth);
            }
        } catch (error) {
            console.error('Firebase Logout Hatası:', error);
        }

        this.app.state.isLoggedIn = false;
        this.app.state.currentUser = 'Misafir';
        this.app.state.currentUserUid = null; // [NEW]
        this.app.state.userRole = 'loader';
        this.app.store.save();
        
        // Unsubscribe messages dropdown real-time listener
        if (window.inboxDropdown && typeof window.inboxDropdown.unsubscribe === 'function') {
            window.inboxDropdown.unsubscribe();
            window.inboxDropdown.unsubscribe = null;
        }
        
        this.app.router.navigate('home');
        this.updateNavbarUI();
        this.app.router.updateNav();
        
        if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('auth.toast_logout_success'), 'info');
    }

    resetState() {
        if (confirm(window.i18n.t('auth.confirm_reset_state'))) {
            localStorage.clear();
            location.reload();
        }
    }

    toggleProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (!dropdown) return;
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible && window.lucide) {
            window.lucide.createIcons();
        }
    }
};

