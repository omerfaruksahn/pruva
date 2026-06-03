// PRUVA ADMIN PANEL V2.1
const API = 'http://localhost:3005/api';
const state = { ads:[], users:[], authUsers:[], stats:{}, activeTab:'overview', filters:{status:'all',search:''}, loading:true, backendOnline:false, editingAd:null, activityLog:[] };

const utils = {
    norm(t){ return (t||'').toString().replace(/İ/g,'i').replace(/I/g,'ı').toLowerCase().trim(); },
    timeAgo(d){ if(!d)return'---'; const m=Math.floor((Date.now()-new Date(d).getTime())/60000); if(m<1)return'Az önce'; if(m<60)return m+' dk önce'; const h=Math.floor(m/60); if(h<24)return h+' saat önce'; return new Date(d).toLocaleDateString('tr-TR'); },
    esc(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
};

function log(a,d){ state.activityLog.unshift({action:a,detail:d,time:new Date().toISOString()}); if(state.activityLog.length>20)state.activityLog.pop(); }

async function api(endpoint, body) {
    try {
        let token = '';
        if (window.auth && auth.currentUser) {
            token = await auth.currentUser.getIdToken();
        } else if (window.firebase && firebase.auth().currentUser) {
            token = await firebase.auth().currentUser.getIdToken();
        }
        
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (body) headers['Content-Type'] = 'application/json';
        
        const opts = {
            method: body ? 'POST' : 'GET',
            headers: headers
        };
        if (body) opts.body = JSON.stringify(body);
        
        const res = await fetch(API+endpoint, opts);
        const data = await res.json();
        return data;
    } catch(e) { console.error('API Error:', endpoint, e); return {error: e.message}; }
}

async function loadAllData() {
    try {
        const data = await api('/all-data');
        if (data.error) throw new Error(data.error);
        state.ads = data.ads||[]; state.users = data.users||[]; state.authUsers = data.authUsers||[]; state.stats = data.stats||{};
        state.loading = false; state.backendOnline = true;
    } catch(e) { console.error('loadAllData failed:', e); state.backendOnline = false; state.loading = false; }
    updateStatusUI(); render();
}

function updateStatusUI() {
    const el=document.getElementById('backend-status'), badge=document.getElementById('env-badge');
    if(!el||!badge)return;
    if(state.backendOnline){ el.innerHTML='<div class="status-dot online"></div> Backend: Online'; badge.innerText="V2.1 SUPER ADMIN"; badge.className="header-badge super"; }
    else { el.innerHTML='<div class="status-dot offline"></div> Backend: Off'; badge.innerText="V2.1 OFFLINE"; badge.className="header-badge"; }
}

// ─── TOAST ───
function toast(msg, type) {
    type = type||'success';
    const icons = {success:'check-circle',error:'x-circle',warning:'alert-triangle'};
    const el = document.createElement('div');
    el.className = 'admin-toast '+type;
    el.innerHTML = '<i data-lucide="'+icons[type]+'"></i><span>'+msg+'</span>';
    document.body.appendChild(el);
    if(window.lucide) window.lucide.createIcons({nodes:[el]});
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),400); },3500);
}

// ─── CONFIRM DIALOG ───
function showConfirm(msg, onYes) {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay active';
    ov.id = 'confirm-overlay';
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = '<p>'+msg+'</p><div class="confirm-actions"><button class="btn btn-outline" id="cbtn-no">Vazgeç</button><button class="btn btn-danger-solid" id="cbtn-yes">Evet, Devam Et</button></div>';
    ov.appendChild(box);
    document.body.appendChild(ov);
    document.getElementById('cbtn-no').addEventListener('click', function(){ ov.remove(); });
    document.getElementById('cbtn-yes').addEventListener('click', function(){ ov.remove(); onYes(); });
}

// ─── EDIT MODAL ───
function showEditModal() {
    const ad = state.editingAd; if(!ad) return;
    // Remove old modal if exists
    const old = document.getElementById('edit-modal'); if(old) old.remove();
    const ov = document.createElement('div');
    ov.className = 'modal-overlay active';
    ov.id = 'edit-modal';
    ov.innerHTML = '<div class="modal-box"><div class="modal-header"><h3>İlan Düzenle</h3><button class="btn btn-ghost" id="modal-close-x">✕</button></div><div class="modal-body"><div class="form-grid"><div class="form-group"><label>Çıkış</label><input id="edit-origin" value="'+utils.esc(ad.origin)+'"></div><div class="form-group"><label>Varış</label><input id="edit-destination" value="'+utils.esc(ad.destination)+'"></div><div class="form-group"><label>Yük Tipi</label><input id="edit-cargo" value="'+utils.esc(ad.cargoType)+'"></div><div class="form-group"><label>Durum</label><select id="edit-status"><option value="pending" '+(ad.status==='pending'?'selected':'')+'>Bekliyor</option><option value="active" '+(ad.status==='active'?'selected':'')+'>Aktif</option></select></div></div></div><div class="modal-footer"><button class="btn btn-outline" id="modal-cancel">İptal</button><button class="btn btn-primary" id="modal-save">Kaydet</button></div></div>';
    document.body.appendChild(ov);
    document.getElementById('modal-close-x').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', async function(){
        const updates = {
            origin: document.getElementById('edit-origin').value,
            destination: document.getElementById('edit-destination').value,
            cargoType: document.getElementById('edit-cargo').value,
            status: document.getElementById('edit-status').value,
        };
        var theId = String(ad.id);
        console.log('Saving ad edit, ID:', theId, 'type:', typeof theId, 'updates:', updates);
        const d = await api('/update-ad', {adId:theId, updates:updates});
        console.log('Update response:', d);
        if(d.success){ toast('İlan güncellendi.','success'); log('İlan Düzenlendi',updates.origin+' → '+updates.destination); closeModal(); loadAllData(); }
        else toast(d.error||'Hata','error');
    });
}
function closeModal(){ const m=document.getElementById('edit-modal'); if(m)m.remove(); const b=document.getElementById('bids-modal'); if(b)b.remove(); state.editingAd=null; }

// ─── BIDS MODAL ───
function showBidsModal(adId) {
    const ad = state.ads.find(function(a){ return String(a.id)===String(adId); });
    if(!ad) return;
    const old = document.getElementById('bids-modal'); if(old) old.remove();
    const ov = document.createElement('div');
    ov.className = 'modal-overlay active';
    ov.id = 'bids-modal';
    
    var bidsHtml = '';
    if(ad.bids && ad.bids.length > 0) {
        var rows = ad.bids.map(function(b, idx) {
            return '<tr>'+
                '<td><strong>'+utils.esc(b.company)+'</strong>'+(b.isGhost?' <span class="ghost-tag" style="display:inline-block;margin-left:5px;">Riskli</span>':'')+'</td>'+
                '<td>'+utils.esc(b.price)+'</td>'+
                '<td>'+utils.esc(b.line||'—')+'</td>'+
                '<td>'+utils.esc(b.time||'—')+'</td>'+
                '<td>'+utils.esc(b.date||'—')+'</td>'+
                '<td class="actions-cell"><button class="btn btn-sm btn-danger" onclick="adminActions.deleteBid(\''+ad.id+'\', '+idx+')" title="Teklifi Sil"><i data-lucide="trash-2"></i></button></td>'+
            '</tr>';
        }).join('');
        bidsHtml = '<div class="table-container" style="max-height: 400px; overflow-y: auto;"><table><thead><tr><th>Taşıyıcı</th><th>Fiyat</th><th>Hat</th><th>Süre</th><th>Tarih</th><th style="text-align:right">İşlem</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    } else {
        bidsHtml = '<div class="empty-mini"><i data-lucide="inbox"></i><p>Bu ilana henüz teklif verilmemiş.</p></div>';
    }

    ov.innerHTML = '<div class="modal-box" style="max-width:700px;"><div class="modal-header"><h3><i data-lucide="banknote"></i> Gelen Teklifler ('+utils.esc(ad.origin)+' → '+utils.esc(ad.destination)+')</h3><button class="btn btn-ghost" id="modal-close-bids">✕</button></div><div class="modal-body">'+bidsHtml+'</div><div class="modal-footer"><button class="btn btn-outline" id="modal-close-bids-btn">Kapat</button></div></div>';
    document.body.appendChild(ov);
    document.getElementById('modal-close-bids').addEventListener('click', closeModal);
    document.getElementById('modal-close-bids-btn').addEventListener('click', closeModal);
    if(window.lucide) window.lucide.createIcons();
}

// ─── ACTIONS (all use addEventListener pattern for reliability) ───
window.adminActions = {
    switchTab: function(tab){ state.activeTab=tab; state.filters={status:'all',search:''}; render(); },
    updateFilter: function(key,val){ state.filters[key]=val; render(); },

    updateAdStatus: async function(adId,status){
        console.log('updateAdStatus',adId,status);
        const d = await api('/update-ad-status',{adId:adId,status:status});
        if(d.success){ toast(d.message,'success'); log('İlan Durumu',adId.substring(0,6)+'→'+status); loadAllData(); }
        else toast(d.error||'Hata','error');
    },
    deleteAd: function(adId){
        console.log('deleteAd called',adId);
        showConfirm('Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?', async function(){
            var theId = String(adId);
            console.log('Deleting ad...',theId);
            const d = await api('/delete-ad',{adId:theId});
            console.log('Delete response:',d);
            if(d.success){
                toast(d.message,'success'); log('İlan Silindi',theId.substring(0,8));
                // Remove from local state immediately
                state.ads = state.ads.filter(function(a){ return String(a.id)!==theId; });
                render();
                // Also reload from server after short delay
                setTimeout(loadAllData, 1000);
            }
            else toast(d.error||'Silme başarısız','error');
        });
    },
    editAd: function(adId){
        console.log('editAd called',adId,'| ads count:',state.ads.length);
        console.log('Available IDs:', state.ads.map(function(a){return a.id+' ('+typeof a.id+')';}));
        state.editingAd = state.ads.find(function(a){ return String(a.id)===String(adId); });
        console.log('Found ad:',state.editingAd);
        if(state.editingAd) showEditModal();
        else toast('İlan bulunamadı','error');
    },
    viewBids: function(adId){
        showBidsModal(adId);
    },
    deleteBid: function(adId, bidIndex){
        showConfirm('Bu teklifi silmek istediğinize emin misiniz?', async function(){
            const ad = state.ads.find(function(a){ return String(a.id)===String(adId); });
            if(!ad || !ad.bids) return;
            ad.bids.splice(bidIndex, 1);
            const d = await api('/update-ad', {adId: String(adId), updates: {bids: ad.bids}});
            if(d.success){
                toast('Teklif silindi.','success');
                log('Teklif Silindi', adId.substring(0,6));
                showBidsModal(adId); // Refresh modal
                loadAllData(); // Refresh background data
            } else {
                toast(d.error||'Hata','error');
            }
        });
    },

    approveUser: async function(uid){
        const d = await api('/approve-user',{uid:uid});
        if(d.success){ toast(d.message,'success'); log('Kullanıcı Onaylandı',uid.substring(0,8)); loadAllData(); }
        else toast(d.error||'Hata','error');
    },
    updateUserStatus: function(uid,status){
        var label = status==='blocked'?'engellemek':'aktif yapmak';
        showConfirm('Bu kullanıcıyı '+label+' istediğinize emin misiniz?', async function(){
            const d = await api('/update-user-status',{uid:uid,status:status});
            if(d.success){ toast(d.message,'success'); log('Durum',uid.substring(0,8)+'→'+status); loadAllData(); }
            else toast(d.error||'Hata','error');
        });
    },
    updateMembership: async function(uid,membership){
        const d = await api('/update-user-membership',{uid:uid,membership:membership});
        if(d.success){ toast(d.message,'success'); log('Üyelik',uid.substring(0,8)+'→'+membership); loadAllData(); }
        else toast(d.error||'Hata','error');
    },
    setAdmin: async function(uid,isAdmin){
        const d = await api('/set-admin',{uid:uid,isAdmin:isAdmin});
        if(d.success){ toast(isAdmin?'Admin yetkisi verildi.':'Admin yetkisi kaldırıldı.','success'); log('Admin',uid.substring(0,8)+'→'+isAdmin); loadAllData(); }
        else toast(d.error||'Hata','error');
    },
    deleteUserFull: function(uid){
        showConfirm('DİKKAT: Bu kullanıcı AUTH+FIRESTORE\'dan kalıcı silinecek!', async function(){
            const d = await api('/delete-user',{uid:uid});
            if(d.success){ toast('Kullanıcı silindi.','success'); log('Kullanıcı Silindi',uid.substring(0,8)); loadAllData(); }
            else toast(d.error||'Hata','error');
        });
    },
    syncUser: async function(uid){
        const d = await api('/sync-user',{uid:uid});
        if(d.success){ toast('Senkronize edildi.','success'); loadAllData(); }
        else toast(d.error||'Hata','error');
    },
    toggleUserDetails: function(uid) {
        var el = document.getElementById('user-details-' + uid);
        if (el) {
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        }
    },
    punishMaliciousReporter: function(carrierName, adId) {
        const carrier = state.users.find(u => u.name === carrierName);
        if (!carrier) {
            toast('Taşıyıcı bulunamadı.', 'error');
            return;
        }
        showConfirm('Taşıyıcı ' + carrierName + ' firmasının bu şikayetinin ASILSIZ olduğunu onaylıyor musunuz? Taşıyıcının puanından -0.2 puan kesilecektir!', async function(){
            const d = await api('/punish-reporter', { uid: carrier.id, adId: adId, carrierName: carrierName });
            if (d.success) {
                toast(d.message, 'success');
                log('Asılsız Şikayet Cezası', carrierName + ' firmasına -0.2 uygulandı.');
                loadAllData();
            } else {
                toast(d.error || 'Hata', 'error');
            }
        });
    },
    dismissReport: function(adId, reportIndex) {
        showConfirm('Bu şikayeti kapatmak/arşive kaldırmak istediğinize emin misiniz?', async function(){
            const d = await api('/dismiss-report', { adId: adId, reportIndex: reportIndex });
            if (d.success) {
                toast(d.message, 'success');
                log('Şikayet Kapatıldı', 'İlan No: ' + adId);
                loadAllData();
            } else {
                toast(d.error || 'Hata', 'error');
            }
        });
    }
};
window.closeModal = closeModal;
window.loadAllData = loadAllData;

// ─── RENDER ───
function render() {
    const c = document.getElementById('admin-main'); if(!c) return;
    if(!state.backendOnline && state.loading){
        c.innerHTML = '<div class="offline-state"><h2>Backend Bağlantısı Bekleniyor</h2><code>node admin-server.js</code><button class="btn btn-primary" onclick="location.reload()">Yeniden Dene</button></div>';
        return;
    }
    var tabs = [{k:'overview',i:'layout-dashboard',l:'Genel Bakış'},{k:'ads',i:'package',l:'İlanlar'},{k:'users',i:'building-2',l:'Şirketler'},{k:'reports',i:'alert-triangle',l:'Şikayetler'},{k:'super',i:'shield-alert',l:'Super Admin'}];
    var tabHtml = tabs.map(function(t){ return '<button onclick="adminActions.switchTab(\''+t.k+'\')" class="tab-btn'+(state.activeTab===t.k?' active':'')+(t.k==='super'&&state.activeTab===t.k?' super':'')+'"><i data-lucide="'+t.i+'"></i>'+t.l+'</button>'; }).join('');
    var content = '';
    if(state.activeTab==='overview') content = renderOverview();
    else if(state.activeTab==='ads') content = renderAds();
    else if(state.activeTab==='users') content = renderUsers();
    else if(state.activeTab==='reports') content = renderReports();
    else content = renderSuper();
    c.innerHTML = '<div class="tab-bar">'+tabHtml+'</div>'+content;
    if(window.lucide) window.lucide.createIcons();
}

function renderOverview(){
    var s=state.stats;
    return '<div class="stats-grid"><div class="stat-card blue"><div class="stat-icon"><i data-lucide="package"></i></div><div><div class="stat-label">Toplam İlan</div><div class="stat-value">'+(s.totalAds||0)+'</div></div></div><div class="stat-card green"><div class="stat-icon"><i data-lucide="check-circle"></i></div><div><div class="stat-label">Aktif İlan</div><div class="stat-value">'+(s.activeAds||0)+'</div></div></div><div class="stat-card orange"><div class="stat-icon"><i data-lucide="building-2"></i></div><div><div class="stat-label">Kayıtlı Şirket</div><div class="stat-value">'+(s.totalUsers||0)+'</div></div></div><div class="stat-card purple"><div class="stat-icon"><i data-lucide="users"></i></div><div><div class="stat-label">Auth Kullanıcı</div><div class="stat-value">'+(s.authUsers||0)+'</div></div></div><div class="stat-card cyan"><div class="stat-icon"><i data-lucide="clock"></i></div><div><div class="stat-label">Bekleyen İlan</div><div class="stat-value">'+(s.pendingAds||0)+'</div></div></div><div class="stat-card red"><div class="stat-icon"><i data-lucide="user-check"></i></div><div><div class="stat-label">Bekleyen Onay</div><div class="stat-value">'+(s.pendingUsers||0)+'</div></div></div></div><div class="overview-grid"><div class="card"><div class="card-header"><h3><i data-lucide="activity"></i> Son İşlemler</h3></div><div class="card-body">'+(state.activityLog.length?state.activityLog.map(function(l){return '<div class="activity-item"><div class="activity-dot"></div><div><strong>'+l.action+'</strong> <span>'+l.detail+'</span></div><time>'+utils.timeAgo(l.time)+'</time></div>';}).join(''):'<div class="empty-mini"><p>Henüz işlem yapılmadı</p></div>')+'</div></div><div class="card"><div class="card-header"><h3><i data-lucide="zap"></i> Hızlı Erişim</h3></div><div class="card-body quick-actions"><button class="btn btn-primary" onclick="adminActions.switchTab(\'ads\')"><i data-lucide="package"></i> İlanları Yönet</button><button class="btn btn-outline" onclick="adminActions.switchTab(\'users\')"><i data-lucide="building-2"></i> Şirketleri Gör</button><button class="btn btn-super" onclick="adminActions.switchTab(\'super\')"><i data-lucide="shield-alert"></i> Super Admin</button><button class="btn btn-outline" onclick="loadAllData()"><i data-lucide="refresh-cw"></i> Veriyi Yenile</button></div></div></div>';
}

function renderAds(){
    var list=[].concat(state.ads);
    if(state.filters.status!=='all') list=list.filter(function(a){return a.status===state.filters.status;});
    if(state.filters.search){ var q=utils.norm(state.filters.search); list=list.filter(function(a){return utils.norm(a.origin).indexOf(q)>=0||utils.norm(a.destination).indexOf(q)>=0||utils.norm(a.owner).indexOf(q)>=0||utils.norm(a.cargoType).indexOf(q)>=0;}); }
    var rows = list.map(function(ad){
        var bidCount = ad.bids ? ad.bids.length : 0;
        var bidBtnClass = bidCount > 0 ? 'btn-primary' : 'btn-outline';
        return '<tr><td><strong>'+utils.esc(ad.origin)+' → '+utils.esc(ad.destination)+'</strong></td><td>'+utils.esc(ad.owner||'—')+'</td><td><span class="cargo-tag">'+utils.esc(ad.cargoType||'—')+'</span></td><td><select onchange="adminActions.updateAdStatus(\''+ad.id+'\',this.value)" class="status-select '+ad.status+'"><option value="pending" '+(ad.status==='pending'?'selected':'')+'>Bekliyor</option><option value="active" '+(ad.status==='active'?'selected':'')+'>Aktif</option></select></td><td class="actions-cell"><button class="btn btn-sm '+bidBtnClass+'" onclick="adminActions.viewBids(\''+ad.id+'\')" title="Teklifleri Gör"><i data-lucide="banknote"></i> '+(bidCount>0?bidCount:'0')+'</button><button class="btn btn-sm btn-outline" onclick="adminActions.editAd(\''+ad.id+'\')" title="Düzenle"><i data-lucide="edit-3"></i></button><button class="btn btn-sm btn-danger" onclick="adminActions.deleteAd(\''+ad.id+'\')" title="Sil"><i data-lucide="trash-2"></i></button></td></tr>';
    }).join('');
    if(!rows) rows='<tr><td colspan="5" class="empty-cell">Sonuç bulunamadı</td></tr>';
    return '<div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="İlan ara..." value="'+state.filters.search+'" oninput="adminActions.updateFilter(\'search\',this.value)"></div><div class="filter-group"><select onchange="adminActions.updateFilter(\'status\',this.value)"><option value="all" '+(state.filters.status==='all'?'selected':'')+'>Tüm Durumlar</option><option value="pending" '+(state.filters.status==='pending'?'selected':'')+'>Bekliyor</option><option value="active" '+(state.filters.status==='active'?'selected':'')+'>Aktif</option></select><span class="result-count">'+list.length+' ilan</span></div></div><div class="card"><div class="card-header"><h3><i data-lucide="package"></i> İlan Yönetimi</h3></div><div class="table-container"><table><thead><tr><th>Rota</th><th>Sahip</th><th>Yük Tipi</th><th>Durum</th><th style="text-align:right">İşlemler</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}

function renderUsers(){
    var list=[].concat(state.users);
    if(state.filters.status!=='all') list=list.filter(function(u){return u.status===state.filters.status;});
    if(state.filters.search){ var q=utils.norm(state.filters.search); list=list.filter(function(u){return utils.norm(u.name).indexOf(q)>=0||utils.norm(u.email).indexOf(q)>=0;}); }
    var rows = list.map(function(u){
        var sc=u.status==='active'?'active':u.status==='blocked'?'blocked':'pending';
        var sl=u.status==='active'?'Aktif':u.status==='blocked'?'Engelli':u.status==='pending_approval'?'Onay Bekliyor':'Bekliyor';
        var mem=u.subscriptionType||'none';
        var ml=mem==='premium'?'Premium':'Standart';
        var mc=mem==='premium'?'premium':'none';
        var actBtn='';
        if(u.status==='pending_approval') actBtn='<button class="btn btn-sm btn-success" onclick="event.stopPropagation(); adminActions.approveUser(\''+u.id+'\')"><i data-lucide="check"></i> Onayla</button>';
        else if(u.status==='active') actBtn='<button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); adminActions.updateUserStatus(\''+u.id+'\',\'blocked\')"><i data-lucide="ban"></i></button>';
        else actBtn='<button class="btn btn-sm btn-success" onclick="event.stopPropagation(); adminActions.updateUserStatus(\''+u.id+'\',\'active\')"><i data-lucide="check-circle"></i></button>';
        
        var detailsHtml = '<div class="user-details-content" style="padding:15px 20px; background:rgba(0,0,0,0.15); border-radius:8px; margin: 5px 16px 15px 16px; display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.82rem; border: 1px solid rgba(255,255,255,0.05);">';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">ID:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.id) + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Telefon:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.phone || '—') + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Firma Adı:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.companyName || u.name || '—') + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Vergi Dairesi:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.taxOffice || '—') + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">VKN / TCKN:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.vkn || u.taxId || u.taxNumber || '—') + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Adres:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.address || '—') + '</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Kayıt Tarihi:</strong> <span style="color:var(--text-primary)">' + utils.timeAgo(u.createdAt) + ' (' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '—') + ')</span></div>';
        detailsHtml += '<div><strong style="color:var(--text-secondary)">Sektör/Diğer:</strong> <span style="color:var(--text-primary)">' + utils.esc(u.sector || u.description || '—') + '</span></div>';
        detailsHtml += '</div>';

        var mainRow = '<tr style="cursor:pointer;" onclick="adminActions.toggleUserDetails(\''+u.id+'\')"><td><strong>'+utils.esc(u.name||'İsimsiz')+'</strong><div class="sub-text">'+utils.esc(u.email||'—')+'</div></td><td><span class="role-tag">'+(u.role||'loader')+'</span></td><td><span class="status-badge '+sc+'">'+sl+'</span></td><td><select class="membership-select '+mc+'" onclick="event.stopPropagation()" onchange="adminActions.updateMembership(\''+u.id+'\',this.value)"><option value="none" '+(mem!=='premium'?'selected':'')+'>Standart</option><option value="premium" '+(mem==='premium'?'selected':'')+'>Premium</option></select></td><td class="actions-cell">'+actBtn+'</td></tr>';
        var detailsRow = '<tr id="user-details-'+u.id+'" style="display:none;"><td colspan="5" style="padding:0; border-bottom:1px solid var(--border);">' + detailsHtml + '</td></tr>';
        
        return mainRow + detailsRow;
    }).join('');
    if(!rows) rows='<tr><td colspan="5" class="empty-cell">Sonuç bulunamadı</td></tr>';
    return '<div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Şirket ara..." value="'+state.filters.search+'" oninput="adminActions.updateFilter(\'search\',this.value)"></div><div class="filter-group"><select onchange="adminActions.updateFilter(\'status\',this.value)"><option value="all" '+(state.filters.status==='all'?'selected':'')+'>Tüm Durumlar</option><option value="active" '+(state.filters.status==='active'?'selected':'')+'>Aktif</option><option value="pending_approval" '+(state.filters.status==='pending_approval'?'selected':'')+'>Onay Bekliyor</option><option value="blocked" '+(state.filters.status==='blocked'?'selected':'')+'>Engelli</option></select><span class="result-count">'+list.length+' şirket</span></div></div><div class="card"><div class="card-header"><h3><i data-lucide="building-2"></i> Kayıtlı Şirketler <span style="font-size:0.75rem; color:var(--text-secondary); font-weight:normal; margin-left:10px;">(Detayları görmek için satıra tıklayın)</span></h3></div><div class="table-container"><table><thead><tr><th>Şirket</th><th>Rol</th><th>Durum</th><th>Üyelik</th><th style="text-align:right">İşlemler</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}

function renderReports() {
    const reportedAds = state.ads.filter(ad => ad.reports && ad.reports.length > 0);
    var rows = '';
    reportedAds.forEach(ad => {
        ad.reports.forEach((report, rIdx) => {
            const adNumber = ad.id ? String(ad.id).slice(-6) : '—';
            rows += '<tr>' +
                '<td><strong>PRV-' + adNumber + '</strong><br><span style="font-size:0.75rem; color:var(--text-secondary);">' + utils.esc(ad.origin) + ' → ' + utils.esc(ad.destination) + '</span></td>' +
                '<td>' + utils.esc(ad.owner) + '</td>' +
                '<td><strong>' + utils.esc(report.by) + '</strong></td>' +
                '<td><span class="cargo-tag" style="background:#fffbe6; color:#d46b08; border-color:#ffe58f; text-transform:uppercase; font-size:0.7rem;">' + utils.esc(report.reason) + '</span><br><span style="font-size:0.8rem; color:var(--text-secondary);">' + utils.esc(report.desc || '—') + '</span></td>' +
                '<td style="font-size:0.75rem; color:var(--text-muted);">' + new Date(report.date).toLocaleString('tr-TR') + '</td>' +
                '<td class="actions-cell" style="display:flex; gap:6px; justify-content:flex-end;">' +
                    '<button class="btn btn-sm btn-danger" onclick="adminActions.punishMaliciousReporter(\'' + report.by + '\', \'' + ad.id + '\')" title="Asılsız Şikayet - Taşıyıcıyı Cezalandır"><i data-lucide="shield-alert"></i> Cezalandır</button>' +
                    '<button class="btn btn-sm btn-outline" style="color:#27ae60; border-color:#27ae60;" onclick="adminActions.dismissReport(\'' + ad.id + '\', ' + rIdx + ')" title="Şikayeti Kapat/Arşive Kaldır"><i data-lucide="check"></i> Onayla</button>' +
                '</td>' +
            '</tr>';
        });
    });

    if (!rows) {
        rows = '<tr><td colspan="6" class="empty-cell" style="text-align:center; padding:40px; color:var(--text-muted);">Raporlanmış ilan bulunmuyor. Her şey temiz!</td></tr>';
    }

    return '<div class="card">' +
        '<div class="card-header"><h3><i data-lucide="alert-triangle"></i> Şikayet Bildirimleri & Güvenlik</h3></div>' +
        '<div class="table-container">' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>İlan No / Rota</th>' +
                        '<th>Yük Sahibi</th>' +
                        '<th>Şikayet Eden Taşıyıcı</th>' +
                        '<th>Neden & Açıklama</th>' +
                        '<th>Tarih</th>' +
                        '<th style="text-align:right">İşlemler</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>' +
    '</div>';
}

function renderSuper(){
    if(!state.backendOnline) return '<div class="card"><div class="offline-state"><h2>Backend Bağlı Değil</h2><code>node admin-server.js</code></div></div>';
    var rows = state.authUsers.map(function(u){
        var isAdmin = u.customClaims && u.customClaims.admin===true;
        var hasFs = state.users.some(function(fs){return fs.id===u.uid;});
        var syncBtn = !hasFs?'<button class="btn btn-sm btn-outline" onclick="adminActions.syncUser(\''+u.uid+'\')">Firestore\'a Ekle</button>':'';
        return '<tr><td><div class="auth-user-name'+(isAdmin?' admin':'')+'">'+utils.esc(u.displayName||'İsimsiz')+'</div><div class="uid-text">'+u.uid+'</div>'+(!hasFs?'<span class="ghost-tag">⚠ Firestore Kaydı Yok</span>':'')+'</td><td>'+utils.esc(u.email||'—')+'</td><td class="sub-text">'+utils.timeAgo(u.lastSignInTime)+'</td><td><button class="btn btn-sm '+(isAdmin?'btn-super':'btn-outline')+'" onclick="adminActions.setAdmin(\''+u.uid+'\','+(isAdmin?'false':'true')+')"><i data-lucide="'+(isAdmin?'shield-check':'shield')+'"></i> '+(isAdmin?'Admin':'Admin Yap')+'</button></td><td class="actions-cell">'+syncBtn+'<button class="btn btn-sm btn-danger" onclick="adminActions.deleteUserFull(\''+u.uid+'\')"><i data-lucide="user-x"></i> SİL</button></td></tr>';
    }).join('');
    return '<div class="card super-card"><div class="card-header"><h3 style="color:var(--super)"><i data-lucide="shield-alert"></i> Firebase Auth Kullanıcıları ('+state.authUsers.length+')</h3><button class="btn btn-sm btn-outline" onclick="loadAllData()"><i data-lucide="refresh-cw"></i> Yenile</button></div><div class="table-container"><table><thead><tr><th>Kullanıcı</th><th>E-Posta</th><th>Son Giriş</th><th>Yetkiler</th><th style="text-align:right">Kritik İşlemler</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}

// INIT
loadAllData();
setInterval(function(){ api('/status').then(function(d){ var was=!state.backendOnline; state.backendOnline=d&&d.status==='online'; updateStatusUI(); if(was&&state.backendOnline)loadAllData(); }).catch(function(){ state.backendOnline=false; updateStatusUI(); }); }, 30000);
