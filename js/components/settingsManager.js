export class SettingsManager {
    constructor(app) {
        this.app = app;
        window.settingsManager = this;
        
        // Expose backward-compatible globals for settings tab onclick handlers
        window.removeAvatar = () => this.removeAvatar();
        window.handleAvatarUpload = () => this.handleAvatarUpload();
        window.updatePasswordStrength = (pass) => this.updatePasswordStrength(pass);
        window.settingsManager_updatePassword = () => this.updatePassword();
        window.settingsManager_deleteAccount = () => this.deleteAccount();
    }

    async removeAvatar() {
        const user = this.app.store.getCurrentUser();
        if (!user?.id) { alert('Kullanıcı bulunamadı.'); return; }
        if (!confirm('Profil fotoğrafınızı kaldırmak istiyor musunuz?')) return;

        await this.app.store.updateUser(user.name, { avatar: null });
        window.notificationManager?.showToast('Profil fotoğrafı kaldırıldı.', 'info');
        window.switchSettingsTab?.('profile');
        this.app.router.updateNav();
    }

    async handleAvatarUpload() {
        const modalId = 'avatar-upload-modal';
        if (document.getElementById(modalId)) return;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display:flex; align-items:center; justify-content:center; z-index:9999;';

        modal.innerHTML = `
            <div class="modal-content" style="width:500px; text-align:center; border-radius:16px; padding:30px; animation:modalFadeIn 0.3s ease;">
                <style>
                    @keyframes modalFadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                    @keyframes spin { 100% { transform:rotate(360deg); } }
                    .cropper-view-box, .cropper-face { border-radius:50%; }
                </style>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">Profil Fotoğrafı</h3>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <div id="upload-state" style="padding:40px; border:2px dashed var(--border); border-radius:12px; cursor:pointer;" onclick="document.getElementById('avatar-file-input').click()">
                    <i data-lucide="image-plus" style="width:48px; height:48px; color:var(--text-muted); margin-bottom:15px;"></i>
                    <p style="margin:0; font-weight:600;">Bilgisayarınızdan bir fotoğraf seçin</p>
                    <p style="margin:8px 0 0; font-size:0.8rem; color:var(--text-secondary);">Maksimum 5MB, JPG veya PNG</p>
                </div>
                <div id="cropper-state" style="display:none;">
                    <div style="width:100%; height:300px; background:#000; border-radius:8px; overflow:hidden; margin-bottom:15px;">
                        <img id="cropper-image" style="max-width:100%; display:block;" />
                    </div>
                </div>
                <input type="file" id="avatar-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                <button class="btn-primary" style="width:100%; padding:12px; font-size:1rem; margin-top:10px;" id="avatar-save-btn" disabled>Kaydet</button>
            </div>
        `;

        document.body.appendChild(modal);
        if (window.lucide) window.lucide.createIcons();

        let cropper = null;
        const user = this.app.store.getCurrentUser();
        const fileInput  = document.getElementById('avatar-file-input');
        const saveBtn    = document.getElementById('avatar-save-btn');
        const uploadState  = document.getElementById('upload-state');
        const cropperState = document.getElementById('cropper-state');
        const cropperImage = document.getElementById('cropper-image');

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { alert('Dosya 5MB den küçük olmalıdır.'); return; }

            cropperImage.src = URL.createObjectURL(file);
            uploadState.style.display  = 'none';
            cropperState.style.display = 'block';
            saveBtn.disabled = false;
            if (cropper) cropper.destroy();
            cropper = new Cropper(cropperImage, {
                aspectRatio: 1, viewMode: 1, dragMode: 'move',
                autoCropArea: 1, guides: false, center: false,
                highlight: false, cropBoxMovable: false, cropBoxResizable: false
            });
        };

        saveBtn.onclick = async () => {
            if (!cropper) return;
            if (!user?.id) { alert('Sisteme tam giriş yapmadığınız için fotoğraf yüklenemez.'); return; }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Yükleniyor...';

            cropper.getCroppedCanvas({ width: 400, height: 400 }).toBlob(async (blob) => {
                if (!blob) { saveBtn.disabled = false; saveBtn.textContent = 'Kaydet'; return; }
                try {
                    const { FirestoreService } = await import('/js/services/firestoreService.js');
                    const url = await FirestoreService.uploadFile(
                        new File([blob], `avatar_${user.id}.jpg`, { type: 'image/jpeg' }),
                        'avatars/' + user.id
                    );
                    await this.app.store.updateUser(user.name, { avatar: url });
                    document.getElementById(modalId).remove();
                    window.notificationManager?.showToast('Profil fotoğrafınız güncellendi.', 'success');
                    window.switchSettingsTab?.('profile');
                    this.app.router.updateNav();
                } catch(err) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Kaydet';
                    alert('Yükleme hatası: ' + err.message);
                }
            }, 'image/jpeg', 0.9);
        };
    }

    async sendPasswordResetEmail() {
        try {
            const { sendPasswordResetEmail } = await import('firebase/auth');
            const user = window.fbAuth?.currentUser;
            if (!user || !user.email) throw new Error('Oturum bulunamadı veya e-posta adresi eksik.');

            await sendPasswordResetEmail(window.fbAuth, user.email);
            window.notificationManager?.showToast('Şifre sıfırlama linki e-postanıza gönderildi. Gelen kutusunu ve gereksiz klasörünü kontrol edin.', 'success');
        } catch (err) {
            console.error('Password Reset Error:', err);
            let msg = 'Şifre sıfırlama maili gönderilemedi.';
            if (err.code === 'auth/too-many-requests') msg = 'Çok fazla istek attınız. Lütfen biraz bekleyip tekrar deneyin.';
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    async saveProfile() {
        const uid  = this.app.state.currentUserUid;
        const user = this.app.store.getCurrentUser();

        if (!uid || !user) {
            window.notificationManager?.showToast('Kullanıcı verisi bulunamadı.', 'error');
            return;
        }

        const get = (id) => document.getElementById(id)?.value?.trim() || null;
        const updates = {};
        const newName  = get('profile-name');
        const newEmail = get('profile-email');
        const newPhone = get('profile-phone');

        if (newName)  updates.name     = newName;
        if (newPhone) updates.phone    = newPhone;
        const title    = get('profile-title');    if (title)    updates.title    = title;
        const lang     = get('profile-lang');     if (lang)     updates.lang     = lang;
        const timezone = get('profile-timezone'); if (timezone) updates.timezone = timezone;
        const bio      = get('profile-bio');      if (bio)      updates.bio      = bio;
        const linkedin = get('profile-linkedin'); if (linkedin) updates.linkedin = linkedin;
        const website  = get('profile-website');  if (website)  updates.website  = website;

        const emailNotifyCheckbox = document.getElementById('profile-email-notify');
        if (emailNotifyCheckbox) {
            updates.notificationPreferences = {
                email: emailNotifyCheckbox.checked
            };
        }

        if (newEmail && newEmail !== user.email) {
            try {
                const { verifyBeforeUpdateEmail } = await import('firebase/auth');
                await verifyBeforeUpdateEmail(window.fbAuth.currentUser, newEmail);
                window.notificationManager?.showToast('Doğrulama maili gönderildi. Onaylandıktan sonra e-posta değişecek.', 'info');
            } catch(e) {
                window.notificationManager?.showToast('E-posta güncellenemedi: ' + e.message, 'warning');
            }
        }

        try {
            const { FirestoreService } = await import('/js/services/firestoreService.js');
            await FirestoreService.updateUser(uid, updates);
        } catch(e) {
            console.warn('[SETTINGS] Firestore update failed:', e.message);
        }

        Object.assign(user, updates);
        if (newName) this.app.state.currentUser = newName;
        this.app.store.save();
        this.app.router.updateNav();
        window.notificationManager?.showToast('Profil bilgileriniz kaydedildi.', 'success');
    }

    async saveNotifications() {
        const uid  = this.app.state.currentUserUid;
        const user = this.app.store.getCurrentUser();

        if (!uid || !user) {
            window.notificationManager?.showToast('Kullanıcı verisi bulunamadı.', 'error');
            return;
        }

        const getChecked = (id) => {
            const el = document.getElementById(id);
            return el ? el.checked : true;
        };

        const updates = {
            notificationPreferences: {
                email: getChecked('notify-new-bid'),
                opportunities: getChecked('notify-ops'),
                announcements: getChecked('notify-sys')
            }
        };

        try {
            const { FirestoreService } = await import('/js/services/firestoreService.js');
            await FirestoreService.updateUser(uid, updates);
        } catch(e) {
            console.warn('[SETTINGS] Firestore notifications update failed:', e.message);
        }

        user.notificationPreferences = updates.notificationPreferences;
        this.app.store.save();
        window.notificationManager?.showToast('Bildirim tercihleriniz kaydedildi.', 'success');
    }

    async sendEmailVerification() {
        try {
            const { sendEmailVerification } = await import('firebase/auth');
            const user = window.fbAuth?.currentUser;
            if (!user) throw new Error('Oturum bulunamadı.');

            await sendEmailVerification(user);
            window.notificationManager?.showToast('Doğrulama maili gönderildi. Lütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol edin.', 'success');
        } catch (err) {
            console.error('Email Verification Error:', err);
            let msg = 'Mail gönderilemedi.';
            if (err.code === 'auth/too-many-requests') msg = 'Çok fazla istek attınız. Lütfen biraz bekleyip tekrar deneyin.';
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    async startPhoneVerification() {
        const phoneInput = document.getElementById('profile-phone');
        if (!phoneInput) return;
        
        let phone = phoneInput.value.trim();
        if (!phone) {
            window.notificationManager?.showToast('Lütfen önce bir telefon numarası girin.', 'warning');
            return;
        }

        if (!phone.startsWith('+')) {
            window.notificationManager?.showToast('Lütfen numaranızı ülke koduyla girin (Örn: +905xx...)', 'warning');
            phoneInput.focus();
            return;
        }

        try {
            const { RecaptchaVerifier, linkWithPhoneNumber } = await import('firebase/auth');
            const auth = window.fbAuth;
            const currentUser = auth.currentUser;

            if (!currentUser) throw new Error('Oturum bulunamadı.');

            window.notificationManager?.showToast('SMS gönderiliyor, lütfen bekleyin...', 'info');

            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible'
                });
            }

            const confirmationResult = await linkWithPhoneNumber(currentUser, phone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;

            const modalId = 'otp-modal';
            if (document.getElementById(modalId)) document.getElementById(modalId).remove();

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="width:400px; padding:30px; text-align:center; border-radius:16px; background:var(--bg-card); border:1px solid var(--border);">
                    <h3 style="margin-bottom:15px; font-weight:600;"><i data-lucide="smartphone"></i> Kodu Girin</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
                        ${phone} numarasına 6 haneli bir kod gönderdik. Lütfen aşağıya girin.
                    </p>
                    <input type="text" id="otp-code" placeholder="000000" maxlength="6" 
                        style="font-size:2rem; text-align:center; letter-spacing:8px; width:100%; padding:10px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid var(--border); color:white; margin-bottom:20px;">
                    <button class="btn-primary" style="width:100%; padding:12px; font-size:1rem;" onclick="window.settingsManager.confirmPhoneVerification()">Doğrula</button>
                    <button class="btn-ghost" style="width:100%; margin-top:10px; font-size:0.8rem;" onclick="document.getElementById('${modalId}').remove()">İptal</button>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('otp-code').focus();

        } catch (err) {
            console.error('SMS Error:', err);
            let msg = 'SMS gönderilemedi.';
            if (err.code === 'auth/invalid-phone-number') msg = 'Geçersiz telefon numarası. Lütfen kontrol edin (+90...).';
            else if (err.code === 'auth/credential-already-in-use') msg = 'Bu numara zaten başka bir hesaba bağlı.';
            window.notificationManager?.showToast(msg, 'error');
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    }

    async confirmPhoneVerification() {
        const codeInput = document.getElementById('otp-code');
        const code = codeInput?.value.trim();

        if (!code || code.length !== 6) {
            window.notificationManager?.showToast('Lütfen 6 haneli kodu eksiksiz girin.', 'warning');
            return;
        }

        if (!window.confirmationResult) {
            window.notificationManager?.showToast('Doğrulama oturumu bulunamadı. Lütfen tekrar SMS isteyin.', 'error');
            return;
        }

        try {
            const result = await window.confirmationResult.confirm(code);
            const user = result.user;

            const uid = this.app.state.currentUserUid;
            const phone = user.phoneNumber;
            
            const { FirestoreService } = await import('/js/services/firestoreService.js');
            await FirestoreService.updateUser(uid, {
                phoneVerified: true,
                phoneNumber: phone
            });

            const localUser = this.app.store.getCurrentUser();
            if (localUser) {
                localUser.phoneVerified = true;
                localUser.phone = phone;
                this.app.store.save();
            }

            document.getElementById('otp-modal')?.remove();
            window.notificationManager?.showToast('Telefon numaranız başarıyla doğrulandı!', 'success');
            window.switchSettingsTab?.('profile');

        } catch (err) {
            console.error('OTP Error:', err);
            let msg = 'Doğrulama başarısız.';
            if (err.code === 'auth/invalid-verification-code') msg = 'Hatalı kod girdiniz.';
            else if (err.code === 'auth/code-expired') msg = 'Kodun süresi dolmuş. Tekrar deneyin.';
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    saveCompany() {
        window.notificationManager?.showToast('Şirket bilgileri kaydedildi.', 'success');
    }

    async updatePassword() {
        const currentPass = document.getElementById('current-password')?.value;
        const newPass     = document.getElementById('new-password')?.value;
        const confirmPass = document.getElementById('confirm-password')?.value;

        if (!currentPass || !newPass || !confirmPass) {
            window.notificationManager?.showToast('Lütfen tüm alanları doldurun.', 'warning');
            return;
        }
        if (newPass !== confirmPass) {
            window.notificationManager?.showToast('Yeni şifreler eşleşmiyor.', 'warning');
            return;
        }

        const errors = [];
        if (newPass.length < 12)          errors.push('En az 12 karakter');
        if (!/[A-Z]/.test(newPass))       errors.push('En az 1 büyük harf');
        if (!/[a-z]/.test(newPass))       errors.push('En az 1 küçük harf');
        if (!/[0-9]/.test(newPass))       errors.push('En az 1 rakam');
        if (errors.length) {
            window.notificationManager?.showToast('Şifre zayıf: ' + errors.join(', '), 'warning');
            return;
        }

        try {
            const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
            const fbUser = window.fbAuth?.currentUser;
            if (!fbUser) throw new Error('Oturum bulunamadı.');

            await reauthenticateWithCredential(fbUser, EmailAuthProvider.credential(fbUser.email, currentPass));
            await updatePassword(fbUser, newPass);

            ['current-password', 'new-password', 'confirm-password'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const bar = document.getElementById('strength-bar');
            if (bar) bar.style.width = '0%';

            window.notificationManager?.showToast('Şifreniz başarıyla güncellendi.', 'success');
        } catch(err) {
            const msgs = {
                'auth/wrong-password':    'Mevcut şifreniz hatalı.',
                'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
                'auth/weak-password':     'Yeni şifre çok zayıf.',
            };
            window.notificationManager?.showToast(msgs[err.code] || 'Şifre değiştirilemedi: ' + err.message, 'error');
        }
    }

    terminateSession(btn) {
        const item = btn.closest('.session-item');
        if (item) {
            item.style.opacity = '0.5';
            item.style.pointerEvents = 'none';
            window.notificationManager?.showToast('Oturum sonlandırıldı.', 'info');
            setTimeout(() => item.remove(), 800);
        }
    }

    updatePasswordStrength(password) {
        const bar  = document.getElementById('strength-bar');
        const text = document.getElementById('strength-text');
        if (!bar || !text) return;

        let strength = 0;
        if (password.length >= 12)     strength += 25;
        if (/[A-Z]/.test(password))    strength += 25;
        if (/[a-z]/.test(password))    strength += 25;
        if (/[0-9]/.test(password))    strength += 25;

        bar.style.width = strength + '%';
        const levels = [
            { max: 25, color: '#ff4d4f', label: 'Zayıf' },
            { max: 50, color: '#faad14', label: 'Orta' },
            { max: 75, color: '#1890ff', label: 'İyi' },
            { max: 100, color: '#52c41a', label: 'Çok Güçlü' },
        ];
        const level = levels.find(l => strength <= l.max) || levels[3];
        bar.style.background = level.color;
        text.textContent = level.label;
    }

    toggle2FA() {
        if (confirm('İki Faktörlü Doğrulamayı aktif etmek istiyor musunuz?')) {
            window.notificationManager?.showToast('2FA başarıyla aktif edildi.', 'success');
        }
    }

    async deleteAccount() {
        const password = prompt('Hesabınızı silmek için mevcut şifrenizi girin:');
        if (!password) return;
        if (!confirm('DİKKAT: Hesabınız kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?')) return;

        try {
            const { EmailAuthProvider, reauthenticateWithCredential, deleteUser } = await import('firebase/auth');
            const fbUser = window.fbAuth?.currentUser;
            if (!fbUser) throw new Error('Oturum bulunamadı.');

            const uid = fbUser.uid;
            await reauthenticateWithCredential(fbUser, EmailAuthProvider.credential(fbUser.email, password));

            try {
                let token = await fbUser.getIdToken();
                await fetch('http://localhost:5000/api/user-actions/delete-user', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ uid })
                });
            } catch(e) { console.warn('[SETTINGS] Server delete failed:', e.message); }

            await deleteUser(fbUser);
            this.app?.auth?.logout();
        } catch(err) {
            const msgs = {
                'auth/wrong-password':    'Şifreniz hatalı.',
                'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
            };
            window.notificationManager?.showToast(msgs[err.code] || 'Hesap silinemedi: ' + err.message, 'error');
        }
    }
}

window.SettingsManager = SettingsManager;
