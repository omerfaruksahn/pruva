/**
 * PRUVA — Rate Sheets Manager Component
 * 
 * Görsel yüklemeleri base64'e dönüştürür, Rate Sheets API uç noktalarıyla 
 * haberleşir ve frontend durum (state) yönetimini tetikler.
 */

export class RateSheetsManager {
    constructor(app) {
        this.app = app;
        window.rateSheetsManager = this;
        
        // State yapısında rateSheets dizisini başlat
        if (!this.app.state.rateSheets) {
            this.app.state.rateSheets = [];
        }
        if (this.app.state.rateSheetsPol === undefined) {
            this.app.state.rateSheetsPol = '';
        }
        if (this.app.state.rateSheetsPod === undefined) {
            this.app.state.rateSheetsPod = '';
        }
    }

    init() {
        console.log('[RATE SHEET MANAGER] Initialized.');
    }

    // Helper: Dosyayı Base64 dizesine dönüştürür (Promise yapısında)
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 1. Görsel Yükle ve Gemini Analizine Gönder
    async uploadSheet(file) {
        const toast = (msg, type = 'success') => {
            window.notificationManager?.showToast(msg, type);
        };

        try {
            toast(window.i18n.t('comp.rate_sheets.processing'), 'info');
            const base64Data = await this.fileToBase64(file);
            
            // Firebase Auth token al (güvenlik katmanı)
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const payload = {
                file: base64Data,
                filename: file.name,
                mimeType: file.type
            };

            console.log('[RATE SHEET MANAGER] Uploading sheet to API...');
            
            const res = await fetch('/api/rate-sheets/upload', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || window.i18n.t('comp.rate_sheets.api_error'));
            }

            const resData = await res.json();
            console.log('[RATE SHEET MANAGER] Upload success:', resData);

            toast(window.i18n.t('comp.rate_sheets.analysis_success'), 'success');
            
            // Listeyi yeniden yükle
            await this.loadSheets();
            
            return { success: true, data: resData };

        } catch (err) {
            console.error('[RATE SHEET MANAGER] Upload error:', err);
            toast(window.i18n.t('comp.rate_sheets.upload_error') + ' ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    }

    // 2. Yüklenen Navlun Görsel Özet Listesini Çek
    async loadSheets() {
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch('/api/rate-sheets', { headers });
            
            if (res.ok) {
                const resData = await res.json();
                this.app.state.rateSheets = resData.data || [];
                this.app.commit();
                console.log('[RATE SHEET MANAGER] Sheets loaded:', this.app.state.rateSheets);
            }
        } catch (err) {
            console.error('[RATE SHEET MANAGER] Load sheets error:', err);
        }
    }

    // 3. Fiyat Listesi Görselini ve Satırlarını Sil
    async deleteSheet(id) {
        if (!confirm(window.i18n.t('comp.rate_sheets.confirm_delete'))) return;

        const toast = (msg, type = 'success') => {
            window.notificationManager?.showToast(msg, type);
        };

        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`/api/rate-sheets/${id}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                this.app.state.rateSheets = this.app.state.rateSheets.filter(s => s.id !== id);
                this.app.commit();
                toast(window.i18n.t('comp.rate_sheets.delete_success'), 'danger');
            } else {
                throw new Error(window.i18n.t('comp.rate_sheets.api_delete_error'));
            }
        } catch (err) {
            console.error('[RATE SHEET MANAGER] Delete sheet error:', err);
            toast(window.i18n.t('comp.rate_sheets.delete_error') + ' ' + err.message, 'error');
        }
    }

    // 4. Rota Bazlı En Ucuz All-In Fiyatları Sorgula
    async queryRates(pol, pod) {
        try {
            const firebaseUser = window.fbAuth?.currentUser;
            const token = firebaseUser ? await firebaseUser.getIdToken() : '';
            
            const headers = {
                'x-auth-token': token,
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`/api/rate-sheets/query?pol=${encodeURIComponent(pol)}&pod=${encodeURIComponent(pod)}`, { headers });
            
            if (res.ok) {
                const resData = await res.json();
                return resData.data || [];
            }
            throw new Error(window.i18n.t('comp.rate_sheets.api_query_error'));
        } catch (err) {
            console.error('[RATE SHEET MANAGER] Query rates error:', err);
            return [];
        }
    }
}

window.RateSheetsManager = RateSheetsManager;
