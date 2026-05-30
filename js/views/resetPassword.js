window.resetPasswordView = (state) => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode !== 'resetPassword' || !oobCode) {
        return `
        <div class="auth-wrapper" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
            <div class="card auth-card" style="text-align: center; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <!-- Logo -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 30px;">
                    <div style="background: var(--primary-gradient); padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        <i data-lucide="handshake" style="width: 28px; height: 28px; color: white;"></i>
                    </div>
                    <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; color: white;">PRUVA</span>
                </div>

                <div class="auth-header">
                    <div style="font-size: 3.5rem; margin-bottom: 15px; animation: bounce 2s infinite;">⚠️</div>
                    <h2 class="auth-title" style="color: white; font-size: 1.6rem; letter-spacing: -0.5px;">Bağlantı Geçersiz</h2>
                    <p class="auth-subtitle" style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px;">Şifre sıfırlama talebinizin süresi dolmuş veya bağlantı bozulmuş olabilir.</p>
                </div>
                <p style="color: #cbd5e1; margin-bottom: 30px; font-size: 0.95rem; line-height: 1.6;">
                    Güvenliğiniz için şifre sıfırlama bağlantıları tek kullanımlıktır ve belirli bir süre sonra otomatik olarak devre dışı kalır. Lütfen giriş sayfasına dönerek tekrar yeni bir şifre sıfırlama bağlantısı talep edin.
                </p>
                <button class="btn-primary auth-submit-btn" onclick="window.app.router.navigate('login')" style="margin-top: 0; background: var(--primary-gradient); font-weight: 600; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">Giriş Sayfasına Git</button>
            </div>
        </div>
        `;
    }

    return `
    <div class="auth-wrapper" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
        <div class="card auth-card" style="border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            
            <!-- PRUVA Brand Header -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px;">
                <div style="background: var(--primary-gradient); padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                    <i data-lucide="handshake" style="width: 26px; height: 26px; color: white;"></i>
                </div>
                <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; color: white;">PRUVA</span>
            </div>

            <div class="auth-header" style="text-align: center; margin-bottom: 24px;">
                <h2 class="auth-title" style="color: white; font-size: 1.5rem; letter-spacing: -0.5px; font-weight: 700;">Yeni Şifre Belirleyin</h2>
                <p class="auth-subtitle" style="color: #94a3b8; font-size: 0.88rem; margin-top: 6px;">Lojistik platformunuz için güçlü ve güvenli yeni bir şifre girin</p>
            </div>

            <form id="reset-password-form">
                <input type="hidden" id="reset-oob-code" value="${oobCode}">
                
                <div class="form-group auth-form-group" style="margin-bottom: 20px;">
                    <label style="color: #e2e8f0; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; display: block;">Yeni Şifre</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <i data-lucide="lock" style="position: absolute; left: 14px; width: 18px; height: 18px; color: #94a3b8;"></i>
                        <input type="password" id="reset-password" class="form-control auth-input" placeholder="Yeni şifrenizi girin" required oninput="window.updateResetPasswordStrength(this.value)" 
                            style="width: 100%; padding: 12px 12px 12px 42px !important; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(15,23,42,0.6); color: white; transition: all 0.3s ease;">
                    </div>
                    
                    <!-- Premium Password Strength Bar -->
                    <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin-top: 12px; overflow: hidden;">
                        <div id="reset-strength-bar" style="height: 100%; width: 0%; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: #ff4d4f;"></div>
                    </div>

                    <!-- Sleek Real-time Requirements Checklist -->
                    <ul class="password-requirements" style="list-style: none; padding: 0; margin: 14px 0 0; font-size: 0.8rem; display: flex; flex-direction: column; gap: 8px;">
                        <li id="req-length" style="color: #94a3b8; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;">
                            <span class="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #475569; transition: all 0.3s ease;"></span>
                            <span>En az 12 karakter uzunluğu</span>
                        </li>
                        <li id="req-upper" style="color: #94a3b8; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;">
                            <span class="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #475569; transition: all 0.3s ease;"></span>
                            <span>En az bir büyük harf (A-Z)</span>
                        </li>
                        <li id="req-number" style="color: #94a3b8; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;">
                            <span class="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #475569; transition: all 0.3s ease;"></span>
                            <span>En az bir rakam (0-9)</span>
                        </li>
                    </ul>
                </div>
                
                <div class="form-group auth-form-group" style="margin-bottom: 24px;">
                    <label style="color: #e2e8f0; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; display: block;">Yeni Şifre (Tekrar)</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <i data-lucide="shield-check" style="position: absolute; left: 14px; width: 18px; height: 18px; color: #94a3b8;"></i>
                        <input type="password" id="reset-password-confirm" class="form-control auth-input" placeholder="Şifrenizi tekrar girin" required
                            style="width: 100%; padding: 12px 12px 12px 42px !important; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(15,23,42,0.6); color: white; transition: all 0.3s ease;">
                    </div>
                </div>

                <button type="submit" class="btn-primary auth-submit-btn" style="width: 100%; padding: 14px; font-size: 1rem; font-weight: 600; margin-top: 15px; background: var(--primary-gradient); border-radius: 10px; border: none; color: white; cursor: pointer; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;">
                    Şifreyi Güncelle
                </button>
            </form>

            <div class="auth-footer" style="text-align: center; margin-top: 25px; font-size: 0.9rem;">
                <a onclick="window.app.router.navigate('login')" class="auth-link" style="color: #3b82f6; text-decoration: none; cursor: pointer; font-weight: 600; transition: color 0.2s ease;">
                    Giriş Sayfasına Dön
                </a>
            </div>
        </div>
    </div>
    `;
};

// ── Şifre Güç Ölçer (Premium Animasyonlu Rapor) ────────────────
window.updateResetPasswordStrength = function(password) {
    const bar = document.getElementById('reset-strength-bar');
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqNumber = document.getElementById('req-number');
    
    if (!bar) return;

    const isLengthValid = password.length >= 12;
    const isUpperValid = /[A-Z]/.test(password);
    const isNumberValid = /[0-9]/.test(password);

    // Requirements Checklist Update
    const updateReqEl = (el, isValid) => {
        if (!el) return;
        const dot = el.querySelector('.status-dot');
        if (isValid) {
            el.style.color = '#34d399'; // Bright emerald green
            if (dot) {
                dot.style.background = '#10b981';
                dot.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.6)';
            }
        } else {
            el.style.color = '#94a3b8'; // Slate grey
            if (dot) {
                dot.style.background = '#475569';
                dot.style.boxShadow = 'none';
            }
        }
    };

    updateReqEl(reqLength, isLengthValid);
    updateReqEl(reqUpper, isUpperValid);
    updateReqEl(reqNumber, isNumberValid);

    // Calculate score
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 10) score += 20;
    if (password.length >= 12) score += 20;
    if (isUpperValid) score += 20;
    if (isNumberValid) score += 20;

    bar.style.width = score + '%';

    // Color code bar based on quality
    if (!isLengthValid) {
        bar.style.background = '#ef4444'; // Red
    } else {
        if (score <= 60) {
            bar.style.background = '#f59e0b'; // Amber
        } else if (score <= 80) {
            bar.style.background = '#3b82f6'; // Blue
        } else {
            bar.style.background = '#10b981'; // Emerald
        }
    }
};
