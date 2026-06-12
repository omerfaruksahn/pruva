// ─── PRUVA Admin Panel — Ortak Yardımcılar ───
// Tüm modüller tarafından kullanılan utility fonksiyonlar

export const utils = {
    // Türkçe karakter uyumlu normalizasyon
    norm(t) {
        return (t || '').toString()
            .replace(/İ/g, 'i').replace(/I/g, 'ı')
            .replace(/Ş/g, 'ş').replace(/Ç/g, 'ç')
            .replace(/Ğ/g, 'ğ').replace(/Ö/g, 'ö')
            .replace(/Ü/g, 'ü')
            .toLowerCase().trim();
    },

    // XSS korumalı HTML escape
    esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    },

    // Zaman farkı hesaplama (Türkçe)
    timeAgo(d) {
        if (!d) return '---';
        const now = Date.now();
        const then = new Date(d).getTime();
        if (isNaN(then)) return '---';
        const m = Math.floor((now - then) / 60000);
        if (m < 1) return 'Az önce';
        if (m < 60) return m + ' dk önce';
        const h = Math.floor(m / 60);
        if (h < 24) return h + ' saat önce';
        const days = Math.floor(h / 24);
        if (days < 7) return days + ' gün önce';
        if (days < 30) return Math.floor(days / 7) + ' hafta önce';
        return new Date(d).toLocaleDateString('tr-TR');
    },

    // Tam tarih formatı
    formatDate(d) {
        if (!d) return '---';
        return new Date(d).toLocaleDateString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    },

    // Tarih + saat formatı
    formatDateTime(d) {
        if (!d) return '---';
        return new Date(d).toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    // Para birimi formatı
    formatCurrency(amount, currency = 'USD') {
        if (amount == null) return '---';
        const symbols = { USD: '$', EUR: '€', TRY: '₺' };
        return (symbols[currency] || currency + ' ') + Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
    },

    // Sayı formatı (binlik ayırıcı)
    formatNumber(n) {
        if (n == null) return '0';
        return Number(n).toLocaleString('tr-TR');
    },

    // Kısa ID (son 6 karakter)
    shortId(id) {
        if (!id) return '---';
        return String(id).slice(-6);
    },

    // Durum badge HTML
    statusBadge(status) {
        const map = {
            'active': { cls: 'active', label: 'Aktif' },
            'pending': { cls: 'pending', label: 'Bekliyor' },
            'pending_approval': { cls: 'pending', label: 'Onay Bekliyor' },
            'blocked': { cls: 'blocked', label: 'Engelli' },
            'completed': { cls: 'completed', label: 'Tamamlandı' },
            'expired': { cls: 'expired', label: 'Süresi Dolmuş' },
            'PENDING': { cls: 'pending', label: 'Bekliyor' },
            'APPROVED': { cls: 'active', label: 'Onaylandı' },
            'REJECTED': { cls: 'blocked', label: 'Reddedildi' },
            'SENT': { cls: 'completed', label: 'Gönderildi' },
            'RECEIVED': { cls: 'active', label: 'Alındı' },
            'SELECTED': { cls: 'active', label: 'Seçildi' },
            'CANCELLED': { cls: 'expired', label: 'İptal' },
            'RATES_REQUESTED': { cls: 'pending', label: 'Fiyat Bekleniyor' },
            'OFFER_SENT': { cls: 'completed', label: 'Teklif Gönderildi' },
            'MISSING_INFO_SENT': { cls: 'pending', label: 'Eksik Bilgi' },
        };
        const s = map[status] || { cls: 'expired', label: status || '—' };
        return `<span class="status-badge ${s.cls}">${s.label}</span>`;
    },

    // Rol etiketi
    roleTag(role) {
        return `<span class="role-tag">${this.esc(role || 'loader')}</span>`;
    },

    // Boş durum gösterimi
    emptyState(icon, message) {
        return `<div class="empty-mini"><i data-lucide="${icon}"></i><p>${message}</p></div>`;
    },

    // Stat kartı HTML
    statCard(color, icon, label, value, change) {
        let changeHtml = '';
        if (change !== undefined) {
            const dir = change >= 0 ? 'up' : 'down';
            const arrow = change >= 0 ? '↑' : '↓';
            changeHtml = `<div class="stat-change ${dir}">${arrow} ${Math.abs(change)}%</div>`;
        }
        return `<div class="stat-card ${color}">
            <div class="stat-icon"><i data-lucide="${icon}"></i></div>
            <div>
                <div class="stat-label">${label}</div>
                <div class="stat-value">${this.formatNumber(value)}</div>
                ${changeHtml}
            </div>
        </div>`;
    },

    // Pagination HTML
    pagination(currentPage, totalPages, onClickFn) {
        if (totalPages <= 1) return '';
        let html = '<div class="pagination">';
        html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="${onClickFn}(${currentPage - 1})">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
                if (i === 4) html += '<button disabled>…</button>';
                continue;
            }
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="${onClickFn}(${i})">${i}</button>`;
        }
        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="${onClickFn}(${currentPage + 1})">›</button>`;
        html += '</div>';
        return html;
    }
};

// ─── TOAST ───
export function toast(msg, type = 'success') {
    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    const el = document.createElement('div');
    el.className = 'admin-toast ' + type;
    el.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${msg}</span>`;
    document.body.appendChild(el);
    if (window.lucide) window.lucide.createIcons({ nodes: [el] });
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3500);
}

// ─── CONFIRM DIALOG ───
export function showConfirm(msg, onYes) {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.id = 'confirm-overlay';
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = `<p>${msg}</p><div class="confirm-actions"><button class="btn btn-outline" id="cbtn-no">Vazgeç</button><button class="btn btn-danger-solid" id="cbtn-yes">Evet, Devam Et</button></div>`;
    ov.appendChild(box);
    document.body.appendChild(ov);
    document.getElementById('cbtn-no').addEventListener('click', () => ov.remove());
    document.getElementById('cbtn-yes').addEventListener('click', () => { ov.remove(); onYes(); });
}

// ─── MODAL HELPER ───
export function showModal(title, icon, bodyHtml, footerHtml, options = {}) {
    const old = document.getElementById('admin-modal');
    if (old) old.remove();
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.id = 'admin-modal';
    const maxW = options.maxWidth || '560px';
    ov.innerHTML = `<div class="modal-box" style="max-width:${maxW}">
        <div class="modal-header">
            <h3><i data-lucide="${icon}"></i> ${title}</h3>
            <button class="btn btn-ghost" onclick="window.closeModal()">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>`;
    document.body.appendChild(ov);
    if (window.lucide) window.lucide.createIcons();
    return ov;
}

export function closeModal() {
    const m = document.getElementById('admin-modal');
    if (m) m.remove();
    const c = document.getElementById('confirm-overlay');
    if (c) c.remove();
}

// ─── API HELPER ───
export async function api(endpoint, body) {
    const API = (window.location.origin || 'http://127.0.0.1:3005') + '/api';
    try {
        const headers = {};
        if (body) headers['Content-Type'] = 'application/json';
        const opts = { method: body ? 'POST' : 'GET', headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(API + endpoint, opts);
        const text = await res.text();

        if (!text) {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return {};
        }

        try {
            const data = JSON.parse(text);
            if (!res.ok) {
                throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
            }
            return data;
        } catch (parseErr) {
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
            throw new Error('Invalid JSON response from admin API.');
        }
    } catch (e) {
        console.error('API Error:', endpoint, e);
        return { error: e.message };
    }
}

// Pagination state helper
export const PAGE_SIZE = 20;
export function paginate(items, page) {
    const total = Math.ceil(items.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    return {
        items: items.slice(start, start + PAGE_SIZE),
        totalPages: total,
        currentPage: Math.min(page, total || 1)
    };
}
