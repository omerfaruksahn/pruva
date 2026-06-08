window.LegalModal = class LegalModal {
    constructor() {
        this.isOpen = false;
        this.currentType = 'kvkk'; // 'kvkk', 'term', 'kvkk-light'
        this.createElements();
    }

    createElements() {
        const modal = document.createElement('div');
        modal.id = 'legal-modal';
        modal.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
            display: none; align-items: center; justify-content: center;
            z-index: 10000; animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="card" style="width: 90%; max-width: 800px; max-height: 85vh; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                <div style="padding: 20px 30px; background: var(--primary-gradient); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h3 id="legal-title" style="margin: 0; font-size: 1.2rem; font-weight: 700;" data-i18n="legal.title">Yasal Metinler</h3>
                    <button onclick="window.legalModal.hide()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                <div id="legal-body" style="padding: 30px; overflow-y: auto; line-height: 1.8; color: #444; font-size: 0.95rem;">
                    <!-- İçerik buraya gelecek -->
                </div>
                <div style="padding: 20px 30px; background: #f8f9fa; border-top: 1px solid #eee; text-align: right;">
                    <button class="btn-primary" onclick="window.legalModal.hide()" style="padding: 10px 25px;" data-i18n="legal.btn_understood">Okudum, Anladım</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.body = modal.querySelector('#legal-body');
        this.title = modal.querySelector('#legal-title');
    }

    show(type) {
        this.currentType = type;
        this.isOpen = true;
        this.modal.style.display = 'flex';
        this.updateContent();
    }

    hide() {
        this.isOpen = false;
        this.modal.style.display = 'none';
    }

    updateContent() {
        if (this.currentType === 'kvkk') {
            this.title.innerText = window.i18n.t('legal.kvkk_title');
            this.body.innerHTML = window.i18n.t('legal.kvkk_content');
        } else if (this.currentType === 'term') {
            this.title.innerText = window.i18n.t('legal.term_title');
            this.body.innerHTML = window.i18n.t('legal.term_content');
        }
    }
};
