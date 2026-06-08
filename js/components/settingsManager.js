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
        if (!user?.id) { alert(window.i18n.t('comp.settings.user_not_found')); return; }
        if (!confirm(window.i18n.t('comp.settings.confirm_remove_avatar'))) return;

        await this.app.store.updateUser(user.name, { avatar: null });
        window.notificationManager?.showToast(window.i18n.t('comp.settings.avatar_removed'), 'info');
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
                    <h3 style="margin:0;" data-i18n="comp.settings.profile_photo">Profil Fotoğrafı</h3>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <div id="upload-state" style="padding:40px; border:2px dashed var(--border); border-radius:12px; cursor:pointer;" onclick="document.getElementById('avatar-file-input').click()">
                    <i data-lucide="image-plus" style="width:48px; height:48px; color:var(--text-muted); margin-bottom:15px;"></i>
                    <p style="margin:0; font-weight:600;" data-i18n="comp.settings.choose_photo">Bilgisayarınızdan bir fotoğraf seçin</p>
                    <p style="margin:8px 0 0; font-size:0.8rem; color:var(--text-secondary);" data-i18n="comp.settings.max_5mb">Maksimum 5MB, JPG veya PNG</p>
                </div>
                <div id="cropper-state" style="display:none;">
                    <div style="width:100%; height:300px; background:#000; border-radius:8px; overflow:hidden; margin-bottom:15px;">
                        <img id="cropper-image" style="max-width:100%; display:block;" />
                    </div>
                </div>
                <input type="file" id="avatar-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                <button class="btn-primary" style="width:100%; padding:12px; font-size:1rem; margin-top:10px;" id="avatar-save-btn" disabled data-i18n="comp.settings.save">Kaydet</button>
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
            if (file.size > 5 * 1024 * 1024) { alert(window.i18n.t('comp.settings.file_too_large')); return; }

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
            if (!user?.id) { alert(window.i18n.t('comp.settings.login_required_avatar')); return; }

            saveBtn.disabled = true;
            saveBtn.textContent = window.i18n.t('comp.settings.uploading');

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
                    window.notificationManager?.showToast(window.i18n.t('comp.settings.avatar_updated'), 'success');
                    window.switchSettingsTab?.('profile');
                    this.app.router.updateNav();
                } catch(err) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Kaydet';
                    alert(window.i18n.t('comp.settings.upload_error') + ' ' + err.message);
                }
            }, 'image/jpeg', 0.9);
        };
    }

    async sendPasswordResetEmail() {
        try {
            const { sendPasswordResetEmail } = await import('firebase/auth');
            const user = window.fbAuth?.currentUser;
            if (!user || !user.email) throw new Error(window.i18n.t('comp.settings.session_not_found'));

            await sendPasswordResetEmail(window.fbAuth, user.email);
            window.notificationManager?.showToast(window.i18n.t('comp.settings.pwd_reset_sent'), 'success');
        } catch (err) {
            console.error('Password Reset Error:', err);
            let msg = window.i18n.t('comp.settings.pwd_reset_failed');
            if (err.code === 'auth/too-many-requests') msg = window.i18n.t('comp.settings.too_many_requests');
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    async saveProfile() {
        const uid  = this.app.state.currentUserUid;
        const user = this.app.store.getCurrentUser();

        if (!uid || !user) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.no_user_data'), 'error');
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
                window.notificationManager?.showToast(window.i18n.t('comp.settings.verify_email_sent'), 'info');
            } catch(e) {
                window.notificationManager?.showToast(window.i18n.t('comp.settings.email_update_failed') + ' ' + e.message, 'warning');
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
        window.notificationManager?.showToast(window.i18n.t('comp.settings.profile_saved'), 'success');
    }

    async saveNotifications() {
        const uid  = this.app.state.currentUserUid;
        const user = this.app.store.getCurrentUser();

        if (!uid || !user) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.no_user_data'), 'error');
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
        window.notificationManager?.showToast(window.i18n.t('comp.settings.notifications_saved'), 'success');
    }

    async sendEmailVerification() {
        try {
            const { sendEmailVerification } = await import('firebase/auth');
            const user = window.fbAuth?.currentUser;
            if (!user) throw new Error(window.i18n.t('comp.settings.session_not_found_short'));

            await sendEmailVerification(user);
            window.notificationManager?.showToast(window.i18n.t('comp.settings.verify_mail_sent'), 'success');
        } catch (err) {
            console.error('Email Verification Error:', err);
            let msg = window.i18n.t('comp.settings.mail_send_failed');
            if (err.code === 'auth/too-many-requests') msg = window.i18n.t('comp.settings.too_many_requests');
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    async startPhoneVerification() {
        const phoneInput = document.getElementById('profile-phone');
        if (!phoneInput) return;
        
        let phone = phoneInput.value.trim();
        if (!phone) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.enter_phone_first'), 'warning');
            return;
        }

        if (!phone.startsWith('+')) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.enter_phone_with_code'), 'warning');
            phoneInput.focus();
            return;
        }

        try {
            const { RecaptchaVerifier, linkWithPhoneNumber } = await import('firebase/auth');
            const auth = window.fbAuth;
            const currentUser = auth.currentUser;

            if (!currentUser) throw new Error(window.i18n.t('comp.settings.session_not_found_short'));

            window.notificationManager?.showToast(window.i18n.t('comp.settings.sending_sms'), 'info');

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
                    <h3 style="margin-bottom:15px; font-weight:600;"><i data-lucide="smartphone"></i> <span data-i18n="comp.settings.enter_code">Kodu Girin</span></h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
                        ${phone} <span data-i18n="comp.settings.code_sent_to">numarasına 6 haneli bir kod gönderdik. Lütfen aşağıya girin.</span>
                    </p>
                    <input type="text" id="otp-code" placeholder="000000" maxlength="6" 
                        style="font-size:2rem; text-align:center; letter-spacing:8px; width:100%; padding:10px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid var(--border); color:white; margin-bottom:20px;">
                    <button class="btn-primary" style="width:100%; padding:12px; font-size:1rem;" onclick="window.settingsManager.confirmPhoneVerification()" data-i18n="comp.settings.verify">Doğrula</button>
                    <button class="btn-ghost" style="width:100%; margin-top:10px; font-size:0.8rem;" onclick="document.getElementById('${modalId}').remove()" data-i18n="comp.settings.cancel">İptal</button>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('otp-code').focus();

        } catch (err) {
            console.error('SMS Error:', err);
            let msg = window.i18n.t('comp.settings.sms_failed');
            if (err.code === 'auth/invalid-phone-number') msg = window.i18n.t('comp.settings.invalid_phone');
            else if (err.code === 'auth/credential-already-in-use') msg = window.i18n.t('comp.settings.phone_in_use');
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
            window.notificationManager?.showToast(window.i18n.t('comp.settings.enter_6_digit'), 'warning');
            return;
        }

        if (!window.confirmationResult) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.verify_session_not_found'), 'error');
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
            window.notificationManager?.showToast(window.i18n.t('comp.settings.phone_verified'), 'success');
            window.switchSettingsTab?.('profile');

        } catch (err) {
            console.error('OTP Error:', err);
            let msg = window.i18n.t('comp.settings.verification_failed');
            if (err.code === 'auth/invalid-verification-code') msg = window.i18n.t('comp.settings.wrong_code');
            else if (err.code === 'auth/code-expired') msg = window.i18n.t('comp.settings.code_expired');
            window.notificationManager?.showToast(msg, 'error');
        }
    }

    saveCompany() {
        window.notificationManager?.showToast(window.i18n.t('comp.settings.company_saved'), 'success');
    }

    async updatePassword() {
        const currentPass = document.getElementById('current-password')?.value;
        const newPass     = document.getElementById('new-password')?.value;
        const confirmPass = document.getElementById('confirm-password')?.value;

        if (!currentPass || !newPass || !confirmPass) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.fill_all'), 'warning');
            return;
        }
        if (newPass !== confirmPass) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.pwd_mismatch'), 'warning');
            return;
        }

        const errors = [];
        if (newPass.length < 12)          errors.push(window.i18n.t('comp.settings.pwd_min_12'));
        if (!/[A-Z]/.test(newPass))       errors.push(window.i18n.t('comp.settings.pwd_min_upper'));
        if (!/[a-z]/.test(newPass))       errors.push(window.i18n.t('comp.settings.pwd_min_lower'));
        if (!/[0-9]/.test(newPass))       errors.push(window.i18n.t('comp.settings.pwd_min_digit'));
        if (errors.length) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.pwd_weak') + ' ' + errors.join(', '), 'warning');
            return;
        }

        try {
            const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
            const fbUser = window.fbAuth?.currentUser;
            if (!fbUser) throw new Error(window.i18n.t('comp.settings.session_not_found_short'));

            await reauthenticateWithCredential(fbUser, EmailAuthProvider.credential(fbUser.email, currentPass));
            await updatePassword(fbUser, newPass);

            ['current-password', 'new-password', 'confirm-password'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const bar = document.getElementById('strength-bar');
            if (bar) bar.style.width = '0%';

            window.notificationManager?.showToast(window.i18n.t('comp.settings.pwd_updated'), 'success');
        } catch(err) {
            const msgs = {
                'auth/wrong-password':    window.i18n.t('comp.settings.current_pwd_wrong'),
                'auth/too-many-requests': window.i18n.t('comp.settings.too_many_tries'),
                'auth/weak-password':     window.i18n.t('comp.settings.new_pwd_weak'),
            };
            window.notificationManager?.showToast(msgs[err.code] || window.i18n.t('comp.settings.pwd_change_failed') + ' ' + err.message, 'error');
        }
    }

    terminateSession(btn) {
        const item = btn.closest('.session-item');
        if (item) {
            item.style.opacity = '0.5';
            item.style.pointerEvents = 'none';
            window.notificationManager?.showToast(window.i18n.t('comp.settings.session_ended'), 'info');
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
            { max: 25, color: '#ff4d4f', label: window.i18n.t('comp.settings.weak') },
            { max: 50, color: '#faad14', label: window.i18n.t('comp.settings.medium') },
            { max: 75, color: '#1890ff', label: window.i18n.t('comp.settings.good') },
            { max: 100, color: '#52c41a', label: window.i18n.t('comp.settings.strong') },
        ];
        const level = levels.find(l => strength <= l.max) || levels[3];
        bar.style.background = level.color;
        text.textContent = level.label;
    }

    toggle2FA() {
        if (confirm(window.i18n.t('comp.settings.confirm_2fa'))) {
            window.notificationManager?.showToast(window.i18n.t('comp.settings.2fa_enabled'), 'success');
        }
    }

    async deleteAccount() {
        const password = prompt(window.i18n.t('comp.settings.prompt_delete_pwd'));
        if (!password) return;
        if (!confirm(window.i18n.t('comp.settings.confirm_delete'))) return;

        try {
            const { EmailAuthProvider, reauthenticateWithCredential, deleteUser } = await import('firebase/auth');
            const fbUser = window.fbAuth?.currentUser;
            if (!fbUser) throw new Error(window.i18n.t('comp.settings.session_not_found_short'));

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
                'auth/wrong-password':    window.i18n.t('comp.settings.pwd_wrong'),
                'auth/too-many-requests': window.i18n.t('comp.settings.too_many_tries'),
            };
            window.notificationManager?.showToast(msgs[err.code] || window.i18n.t('comp.settings.delete_failed') + ' ' + err.message, 'error');
        }
    }
}

window.SettingsManager = SettingsManager;
