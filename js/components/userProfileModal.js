window.userProfileModal = {
    show: function(companyName) {
        if (document.getElementById('user-profile-modal')) return;

        const user = window.app.state.users.find(u => u.name === companyName);
        if (!user) return;

        const isCarrier = user.role === 'carrier';

        const perf = user.performance || {
            overallRating: 0,
            completedJobs: 0,
            communication: 0,
            delivery: 0,
            documentation: 0,
            lastReviews: []
        };

        const verifiedRefs = user.references ? user.references.filter(r => r.status === 'verified') : [];

        // Role-based config
        const roleConfig = isCarrier ? {
            icon: 'truck',
            label: window.i18n.t('user_profile.role_carrier'),
            cat1Label: window.i18n.t('user_profile.cat_comm'),
            cat2Label: window.i18n.t('user_profile.cat_delivery'),
            cat3Label: window.i18n.t('user_profile.cat_doc'),
            cat1Color: '#3498db',
            cat2Color: '#27ae60',
            cat3Color: '#9b59b6',
            trustLevels: [
                { min: 50, minRating: 4.8, label: window.i18n.t('user_profile.elite_carrier'), color: '#9b59b6', icon: 'award' },
                { min: 10, minRating: 4.5, label: window.i18n.t('user_profile.reliable_carrier'), color: '#27ae60', icon: 'shield-check' },
                { min: 1, minRating: 0, label: window.i18n.t('user_profile.active_carrier'), color: '#3498db', icon: 'truck' }
            ]
        } : {
            icon: 'package',
            label: window.i18n.t('user_profile.role_loader'),
            cat1Label: window.i18n.t('user_profile.cat_prof'),
            cat2Label: window.i18n.t('user_profile.cat_pay'),
            cat3Label: window.i18n.t('user_profile.cat_proc'),
            cat1Color: '#3498db',
            cat2Color: '#e67e22',
            cat3Color: '#27ae60',
            trustLevels: [
                { min: 50, minRating: 4.8, label: window.i18n.t('user_profile.elite_loader'), color: '#9b59b6', icon: 'award' },
                { min: 10, minRating: 4.5, label: window.i18n.t('user_profile.reliable_loader'), color: '#27ae60', icon: 'shield-check' },
                { min: 1, minRating: 0, label: window.i18n.t('user_profile.active_loader'), color: '#e67e22', icon: 'package' }
            ]
        };

        // Trust level hesaplama
        let trustLevel = { label: window.i18n.t('user_profile.new_member'), color: '#888', icon: 'shield' };
        for (const tl of roleConfig.trustLevels) {
            if (perf.completedJobs >= tl.min && perf.overallRating >= tl.minRating) {
                trustLevel = { label: tl.label, color: tl.color, icon: tl.icon };
                break;
            }
        }

        const renderStars = (rating) => {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
            return `
                ${'<i data-lucide="star" style="width: 14px; height: 14px; fill: #f39c12; color: #f39c12;"></i>'.repeat(fullStars)}
                ${halfStar ? '<i data-lucide="star-half" style="width: 14px; height: 14px; fill: #f39c12; color: #f39c12;"></i>' : ''}
                ${'<i data-lucide="star" style="width: 14px; height: 14px; color: #e2e8f0;"></i>'.repeat(emptyStars)}
            `;
        };

        const modalHTML = `
            <div id="user-profile-modal" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; animation: fadeIn 0.3s ease;">
                <div class="modal-content" style="background: var(--bg-page); border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 0; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    
                    <!-- Header -->
                    <div style="padding: 30px 30px 20px 30px; border-bottom: 1px solid var(--border-dim); position: relative;">
                        <button onclick="window.userProfileModal.close()" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                        
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <div style="width: 70px; height: 70px; border-radius: 50%; background: ${isCarrier ? '#f0f7ff' : '#fff7ed'}; display: flex; align-items: center; justify-content: center; color: ${isCarrier ? 'var(--secondary)' : '#e67e22'};">
                                <i data-lucide="${roleConfig.icon}" style="width: 32px; height: 32px;"></i>
                            </div>
                            <div>
                                <h2 style="margin: 0 0 5px 0; font-size: 1.5rem; color: var(--primary); font-weight: 800; ${!isCarrier ? 'filter: blur(6px); user-select: none;' : ''}" title="${!isCarrier ? window.i18n.t('user_profile.hidden_name') : ''}">${companyName}</h2>
                                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                    <span style="font-size: 0.75rem; color: ${isCarrier ? 'var(--secondary)' : '#e67e22'}; background: ${isCarrier ? '#f0f7ff' : '#fff7ed'}; padding: 3px 10px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                        ${roleConfig.label}
                                    </span>
                                    <span style="font-size: 0.8rem; color: ${trustLevel.color}; background: ${trustLevel.color}15; padding: 4px 10px; border-radius: 20px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                        <i data-lucide="${trustLevel.icon}" style="width: 14px; height: 14px;"></i> ${trustLevel.label}
                                    </span>
                                    ${verifiedRefs.length > 0 ? `
                                        <span style="font-size: 0.8rem; color: #27ae60; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                                            <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> ${window.i18n.t('user_profile.references').replace('{count}', verifiedRefs.length)}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 30px; display: flex; flex-direction: column; gap: 30px;">
                        
                        <!-- Main Stats -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="background: var(--bg-surface); padding: 20px; border-radius: 16px; border: 1px solid var(--border-dim); text-align: center;">
                                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">${window.i18n.t('user_profile.overall_rating')}</div>
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1; margin-bottom: 10px;">${perf.overallRating > 0 ? perf.overallRating : '-'}</div>
                                <div style="display: flex; justify-content: center; gap: 2px;">
                                    ${perf.overallRating > 0 ? renderStars(perf.overallRating) : `<span style="color: var(--text-muted); font-size: 0.8rem;">${window.i18n.t('user_profile.no_rating')}</span>`}
                                </div>
                            </div>
                            <div style="background: var(--bg-surface); padding: 20px; border-radius: 16px; border: 1px solid var(--border-dim); text-align: center;">
                                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">${window.i18n.t('user_profile.completed_jobs')}</div>
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1; margin-bottom: 10px;">${perf.completedJobs}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${window.i18n.t('user_profile.via_pruva')}</div>
                            </div>
                        </div>

                        <!-- Category Breakdown -->
                        ${perf.completedJobs > 0 ? `
                        <div>
                            <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: var(--primary);">${window.i18n.t('user_profile.cat_perf')}</h3>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: var(--text-secondary);">
                                        <span>${roleConfig.cat1Label}</span>
                                        <span>${perf.communication}</span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: var(--border-dim); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${(perf.communication / 5) * 100}%; height: 100%; background: ${roleConfig.cat1Color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: var(--text-secondary);">
                                        <span>${roleConfig.cat2Label}</span>
                                        <span>${perf.delivery}</span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: var(--border-dim); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${(perf.delivery / 5) * 100}%; height: 100%; background: ${roleConfig.cat2Color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: var(--text-secondary);">
                                        <span>${roleConfig.cat3Label}</span>
                                        <span>${perf.documentation}</span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: var(--border-dim); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${(perf.documentation / 5) * 100}%; height: 100%; background: ${roleConfig.cat3Color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Recent Reviews -->
                        <div>
                            <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: var(--primary);">${window.i18n.t('user_profile.recent_reviews')}</h3>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${(perf.lastReviews && perf.lastReviews.length > 0) ? perf.lastReviews.map(review => {
                                    const avg = ((review.scores.cat1 + review.scores.cat2 + review.scores.cat3) / 3).toFixed(1);
                                    const reviewerLabel = review.reviewerRole === 'loader' ? window.i18n.t('user_profile.role_loader') : review.reviewerRole === 'carrier' ? window.i18n.t('user_profile.role_carrier') : window.i18n.t('user_profile.company');
                                    return `
                                    <div style="background: var(--bg-surface); padding: 15px; border-radius: 12px; border: 1px solid var(--border-dim);">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                            <div>
                                                <div style="font-weight: 600; color: var(--primary); font-size: 0.9rem;">${reviewerLabel}</div>
                                                <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(review.date).toLocaleDateString('tr-TR')} • ${review.origin || ''} → ${review.destination || ''}</div>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 4px; background: #fff8e1; padding: 4px 8px; border-radius: 8px; border: 1px solid #ffe082;">
                                                <i data-lucide="star" style="width: 12px; height: 12px; fill: #f39c12; color: #f39c12;"></i>
                                                <span style="font-size: 0.85rem; font-weight: 700; color: #d35400;">${avg}</span>
                                            </div>
                                        </div>
                                        ${review.comment ? `<p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; font-style: italic;">"${review.comment}"</p>` : ''}
                                    </div>
                                    `;
                                }).join('') : `
                                    <div style="text-align: center; padding: 30px; background: var(--bg-surface); border-radius: 12px; border: 1px dashed var(--border-dim); color: var(--text-muted); font-size: 0.9rem;">
                                        ${window.i18n.t('user_profile.no_reviews')}
                                    </div>
                                `}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        if (window.lucide) window.lucide.createIcons();
    },

    close: function() {
        const modal = document.getElementById('user-profile-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.2s ease';
            setTimeout(() => modal.remove(), 200);
        }
    }
};

// Geriye dönük uyumluluk
window.carrierProfileModal = window.userProfileModal;
