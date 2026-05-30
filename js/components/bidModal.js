window.bidModalComponent = (state, adId) => {
    const ad = state.ads.find(a => String(a.id) === String(adId));
    return `
    <div id="bid-modal" class="modal-overlay" style="display: flex;" onclick="window.marketplaceManager.toggleBidModal(false)">
        <div class="modal-content" style="max-width: 600px;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="text-align: left;">
                    <h2 id="bid-title" style="margin: 0; font-size: 1.4rem;">Teklif Ver</h2>
                    <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">${ad ? `${ad.origin} ➔ ${ad.destination}` : ''}</p>
                </div>
                <button onclick="window.marketplaceManager.toggleBidModal(false)" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <form id="bid-form" onsubmit="window.marketplaceManager.handleBid(event)">
                <input type="hidden" id="bid-ad-id" value="${adId}">
                
                <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
                    <div class="form-group" style="grid-column: span 2;">
                        <label style="font-weight: 600; font-size: 0.85rem;">Navlun Tutarı (All-in)</label>
                        <div style="display: flex; gap: 10px; margin-top: 5px;">
                            <input type="number" id="bid-price" class="form-control" style="flex: 1;" placeholder="Örn: 2450" required>
                            <select id="bid-currency" class="form-control" style="width: 100px;">
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="₺">TRY (₺)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Taşıyıcı / Hat (Line)</label>
                        <input type="text" id="bid-line" class="form-control" placeholder="Örn: MSC, Maersk, THY" style="margin-top: 5px;" required>
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Free Time (Gün)</label>
                        <input type="number" id="bid-free-time" class="form-control" placeholder="Örn: 14" style="margin-top: 5px;">
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Sefer Tipi</label>
                        <select id="bid-route-type" class="form-control" style="margin-top: 5px;">
                            <option value="Direkt">Direkt</option>
                            <option value="Aktarmalı">Aktarmalı</option>
                            <option value="Multimodal">Multimodal</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Transit Süre (Gün)</label>
                        <input type="number" id="bid-transit-time" class="form-control" placeholder="Örn: 22" style="margin-top: 5px;" required>
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem;">Teklif Geçerlilik Tarihi</label>
                        <input type="date" id="bid-validity" class="form-control" style="margin-top: 5px;" min="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>

                <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px;">
                    <button type="button" class="btn-outline" onclick="window.marketplaceManager.toggleBidModal(false)">Vazgeç</button>
                    <button type="submit" class="btn-primary" style="background: var(--secondary);">Teklifi Onaya Gönder</button>
                </div>
            </form>
        </div>
    </div>
    `;
};
