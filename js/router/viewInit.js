export const VIEW_INIT_MAP = {
    'post-ad': (app) => {
        const destinations = window.logisticsKnowledge.getAutocompleteData();
        window.utils.dom.initAutocomplete('origin-input', 'origin-results', destinations);
        window.utils.dom.initAutocomplete('destination-input', 'destination-results', destinations);
        window.utils.dom.initAutocomplete('gt-initial', 'gr-initial', window.logisticsKnowledge.goodsCategories);
        if (window.postAdManager) window.postAdManager.updateGlobalDetailsVisibility();
    },

    'marketplace': (app) => {
        const destinations = window.logisticsKnowledge.getAutocompleteData();
        window.utils.dom.initAutocomplete('market-origin-input', 'market-origin-results', destinations);
        window.utils.dom.initAutocomplete('market-dest-input', 'market-dest-results', destinations);
    },

    'navlun-hesaplama': (app) => {
        const params = app.state.activeRouteParams;
        if (!params) return;

        const parts = params.split('-');
        if (parts.length < 2) return;

        const origin = parts[0];
        const destInput = parts[1];

        let dest = 'europe';
        if (['shanghai', 'singapore', 'asia'].includes(destInput.toLowerCase())) {
            dest = 'asia';
        } else if (['newyork', 'new-york', 'houston', 'usa', 'america'].includes(destInput.toLowerCase())) {
            dest = 'usa';
        } else if (['rotterdam', 'hamburg', 'europe'].includes(destInput.toLowerCase())) {
            dest = 'europe';
        } else if (['genova', 'alexandria', 'med', 'akdeniz'].includes(destInput.toLowerCase())) {
            dest = 'med';
        }

        const originEl = document.getElementById('rate-origin');
        const destEl = document.getElementById('rate-dest');

        if (originEl) originEl.value = origin;
        if (destEl) destEl.value = dest;

        if (typeof window.estimateNavlunTool === 'function') {
            window.estimateNavlunTool();
        }
    },

    'login': (app) => {
        const form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value.trim();
            const pass = document.getElementById('login-password')?.value;
            if (email && pass) app.auth.login(email, pass);
        });

        const forgotLink = form.querySelector('a[href="#"]');
        if (forgotLink) {
            forgotLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email')?.value.trim();
                if (!email) {
                    if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('auth.err_enter_email'), 'warning');
                    return;
                }
                try {
                    const { sendPasswordResetEmail } = await import('firebase/auth');
                    await sendPasswordResetEmail(window.fbAuth, email);
                    if (window.notificationManager) window.notificationManager.showToast(window.i18n.t('auth.reset_link_sent'), 'success');
                } catch(err) {
                    let cleanErr = err.message || '';
                    cleanErr = cleanErr.replace(/firebase:/gi, '').replace(/error/gi, '').replace(/\(auth\/[a-z-]+\)/gi, '').replace(/\./g, '').trim();
                    const msg = err.code === 'auth/user-not-found' ? window.i18n.t('auth.err_email_not_registered') : window.i18n.t('auth.err_occurred') + cleanErr;
                    if (window.notificationManager) window.notificationManager.showToast(msg, 'error');
                }
            });
        }
    },

    'register': (app) => {
        const form = document.getElementById('register-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.terms = form.querySelector('input[name="terms"]')?.checked;

            const toast = (msg, type) => {
                if (window.notificationManager) window.notificationManager.showToast(msg, type);
                else alert(msg);
            };

            if (!data.terms) {
                toast(window.i18n.t('auth.err_terms_required'), 'warning');
                return;
            }

            if (data.password !== data.passwordConfirm) {
                toast(window.i18n.t('auth.err_password_mismatch'), 'error');
                form.querySelector('input[name="password"]').focus();
                return;
            }

            const pwdStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(data.password);
            if (!pwdStrong) {
                toast(window.i18n.t('auth.err_password_format'), 'error');
                form.querySelector('input[name="password"]').focus();
                return;
            }

            const taxNum = data.taxNumber?.replace(/\s/g, '');
            if (!/^\d{10,11}$/.test(taxNum)) {
                toast(window.i18n.t('auth.err_tax_format'), 'error');
                form.querySelector('input[name="taxNumber"]').focus();
                return;
            }
            data.taxNumber = taxNum;

            const phoneNum = data.phone?.replace(/\s|-/g, '');
            if (!/^(\+90|0)?5\d{9}$/.test(phoneNum)) {
                toast(window.i18n.t('auth.err_phone_format'), 'error');
                form.querySelector('input[name="phone"]').focus();
                return;
            }

            if (!data.companyName || data.companyName.trim().length < 3) {
                toast(window.i18n.t('auth.err_company_name_short'), 'error');
                return;
            }

            if (!data.address || data.address.trim().length < 10) {
                toast(window.i18n.t('auth.err_address_short'), 'error');
                form.querySelector('textarea[name="address"]').focus();
                return;
            }

            app.auth.register(data);
        });
    },

    'reset-password': (app) => {
        const form = document.getElementById('reset-password-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oobCode = document.getElementById('reset-oob-code')?.value;
            const newPassword = document.getElementById('reset-password')?.value;
            const confirmPassword = document.getElementById('reset-password-confirm')?.value;

            const toast = (msg, type) => {
                if (window.notificationManager) window.notificationManager.showToast(msg, type);
                else alert(msg);
            };

            if (!oobCode) {
                toast(window.i18n.t('auth.err_invalid_oob'), 'error');
                return;
            }

            if (!newPassword || !confirmPassword) {
                toast(window.i18n.t('auth.err_all_fields'), 'warning');
                return;
            }

            const pwdStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(newPassword);
            if (!pwdStrong) {
                toast(window.i18n.t('auth.err_password_format'), 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                toast(window.i18n.t('auth.err_password_mismatch'), 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = window.i18n.t('auth.updating');
            }

            try {
                const { confirmPasswordReset } = await import('firebase/auth');
                if (!window.fbAuth) throw new Error(window.i18n.t('auth.firebase_auth_not_ready'));

                await confirmPasswordReset(window.fbAuth, oobCode, newPassword);

                const card = form.closest('.auth-card');
                if (card) {
                    card.innerHTML = `
                        <div class="auth-header" style="text-align: center;">
                            <div style="font-size: 3.5rem; color: #52c41a; margin-bottom: 15px;">✓</div>
                            <h2 class="auth-title" style="color: #52c41a;">${window.i18n.t('auth.password_updated_title')}</h2>
                            <p class="auth-subtitle">${window.i18n.t('auth.password_updated_subtitle')}</p>
                        </div>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; font-size: 0.95rem; line-height: 1.5; text-align: center;">
                            ${window.i18n.t('auth.password_updated_desc')}
                        </p>
                        <button class="btn-primary auth-submit-btn" onclick="window.app.router.navigate('login')" style="margin-top: 0;">${window.i18n.t('auth.login.submit_btn')}</button>
                    `;
                }

                toast(window.i18n.t('auth.toast_password_updated'), 'success');
            } catch (err) {
                console.error('Password reset confirmation error:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = window.i18n.t('auth.reset_password.update_btn');
                }

                let msg = window.i18n.t('auth.err_password_update');
                if (err.code === 'auth/expired-action-code') {
                    msg = window.i18n.t('auth.err_reset_code_expired');
                } else if (err.code === 'auth/invalid-action-code') {
                    msg = window.i18n.t('auth.err_reset_code_invalid');
                } else if (err.code === 'auth/weak-password') {
                    msg = window.i18n.t('auth.err_weak_password');
                }
                toast(msg, 'error');
            }
        });
    },

    'membership': (app) => {
        if (window.membershipManager) window.membershipManager.init();
    },

    'education': (app) => {
        // Pruva Kampüs (Campus) için özel bir init gerekiyorsa buraya eklenebilir.
        // Şimdilik boş bırakıyoruz, çünkü state ve view render yeterli.
        window.scrollTo(0, 0);
    },

    'inbox': (app) => {
        if (typeof window.inboxInit === 'function') {
            window.inboxInit(app);
        }
    },

    'pruva-ai': (app) => {
        if (app.managers.pruvaAi) {
            app.managers.pruvaAi.init();
            app.managers.pruvaAi.startEmailPolling();
        }
    },

    'pricing-settings': (app) => {
        if (window.pricingSettingsViewInit) {
            window.pricingSettingsViewInit(app);
        }
    },

    'pricing-reports': (app) => {
        if (window.pricingReportsViewInit) {
            window.pricingReportsViewInit(app);
        }
    },
    'pricing-actions': (app) => {
        if (window.pricingActionsViewInit) {
            window.pricingActionsViewInit(app);
        }
    },
    'pricing-customers': (app) => {
        if (window.pricingCustomersViewInit) {
            window.pricingCustomersViewInit(app);
        }
    },
    'rate-sheets': (app) => {
        if (window.rateSheetsViewInit) {
            window.rateSheetsViewInit(app);
        }
    },
};