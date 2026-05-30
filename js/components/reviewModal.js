window.reviewModal = {
    show: function(adId, targetName, targetRole = 'carrier') {
        if (document.getElementById('pruva-review-modal')) return;

        const criteria = targetRole === 'carrier' ? [
            { id: 'cat1', label: 'İletişim & Ulaşılabilirlik' },
            { id: 'cat2', label: 'Zamanında Teslimat' },
            { id: 'cat3', label: 'Evrak Düzeni & Özen' }
        ] : [
            { id: 'cat1', label: 'İletişim & Profesyonellik' },
            { id: 'cat2', label: 'Ödeme Hızı / Güven' },
            { id: 'cat3', label: 'İş Süreçleri Uyumu' }
        ];

        const modalHTML = `
            <div id="pruva-review-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease; font-family: 'Inter', sans-serif;">
                <div style="background: white; border-radius: 20px; width: 90%; max-width: 450px; padding: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 3.5rem; margin-bottom: 15px;">🌟</div>
                        <h3 style="font-size: 1.4rem; color: var(--primary); margin: 0 0 8px 0;">Değerlendirme Yapın</h3>
                        <p style="font-size: 0.95rem; color: #666; margin: 0;"><strong style="color:var(--secondary);">${targetName}</strong> ile olan deneyiminizi puanlayın.</p>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
                        ${criteria.map(c => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #f8f9fc; border-radius: 12px; border: 1px solid #edf2f7;">
                                <span style="font-size: 0.85rem; font-weight: 600; color: #4a5568;">${c.label}</span>
                                <div class="star-rating" data-category="${c.id}" style="cursor: pointer; color: #f39c12; font-size: 1.1rem; display: flex; gap: 2px;">
                                    <span data-idx="1">★</span><span data-idx="2">★</span><span data-idx="3">★</span><span data-idx="4">★</span><span data-idx="5" style="color:#cbd5e0;">★</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <textarea id="review-comment" placeholder="Yorumunuzu buraya yazabilirsiniz (isteğe bağlı)..." style="width: 100%; padding: 15px; border: 1.5px solid #e2e8f0; border-radius: 12px; resize: none; height: 90px; font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--secondary)'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="btn-outline" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: 600;" onclick="window.reviewModal.close()">Kapat</button>
                        <button class="btn-primary" style="flex: 2; padding: 12px; border-radius: 10px; font-weight: 600; background: var(--secondary);" onclick="window.reviewModal.submit('${adId}', '${targetName}')">Puanlamayı Bitir</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachStarEvents();
    },

    attachStarEvents: function() {
        const ratingContainers = document.querySelectorAll('.star-rating');
        ratingContainers.forEach(container => {
            const stars = container.querySelectorAll('span');
            stars.forEach((star) => {
                star.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-idx'));
                    stars.forEach((s, i) => {
                        s.style.color = (i + 1) <= idx ? '#f39c12' : '#cbd5e0';
                    });
                    container.setAttribute('data-value', idx);
                });
            });
        });
    },

    close: function() {
        const modal = document.getElementById('pruva-review-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.25s ease';
            setTimeout(() => modal.remove(), 250);
        }
    },

    submit: function(adId, targetName) {
        const getScore = (cat) => {
            const el = document.querySelector(`.star-rating[data-category="${cat}"]`);
            return el ? parseInt(el.getAttribute('data-value') || "4") : 4;
        };

        const scores = {
            cat1: getScore('cat1'),
            cat2: getScore('cat2'),
            cat3: getScore('cat3')
        };
        const comment = document.getElementById('review-comment').value;

        if (window.referenceManager) {
            window.referenceManager.submitReview(adId, targetName, scores, comment);
        }
        
        this.close();
    }
};
