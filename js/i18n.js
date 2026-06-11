class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('app_lang') || 'tr';
        this.translations = {};
        this.supportedLangs = ['tr', 'en', 'zh', 'ru', 'es'];
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.updateDOM();
        
        // Listen for custom event to update language
        window.addEventListener('languageChanged', (e) => {
            this.updateDOM();
        });

        const switcher = document.getElementById('lang-switcher');
        if (switcher) {
            switcher.value = this.currentLang;
        }
    }

    async loadLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            lang = 'tr';
        }
        
        try {
            const cacheBuster = new Date().getTime();
            const response = await fetch(`/locales/${lang}.json?v=${cacheBuster}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            this.translations = await response.json();
            this.currentLang = lang;
            localStorage.setItem('app_lang', lang);
            document.documentElement.lang = lang;
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to TR if something fails
            if (lang !== 'tr') {
                await this.loadLanguage('tr');
            }
        }
    }

    async setLanguage(lang) {
        if (lang === this.currentLang) return;
        
        await this.loadLanguage(lang);
        this.updateDOM();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }

    // Get translation by key (e.g., 'nav.home')
    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return the key itself if translation is missing
            }
        }
        
        return value;
    }

    // Update all elements with data-i18n attribute
    updateDOM(container = document) {
        const elements = container.querySelectorAll('[data-i18n]');
        
        elements.forEach(el => {
            let key = el.getAttribute('data-i18n');
            let targetAttr = null;
            
            // Check for [attr]key syntax
            const match = key.match(/^\[(.*?)\](.*)$/);
            if (match) {
                targetAttr = match[1];
                key = match[2];
            }
            
            const translation = this.t(key);
            
            if (translation !== key) {
                if (targetAttr === 'placeholder' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else if (targetAttr === 'title') {
                    el.title = translation;
                } else if (targetAttr) {
                    el.setAttribute(targetAttr, translation);
                } else {
                    const childElements = Array.from(el.children);
                    if (childElements.length === 0) {
                        el.textContent = translation;
                    } else {
                        let textUpdated = false;
                        
                        // If translation has HTML tags, just overwrite with innerHTML
                        if (translation.includes('<') && translation.includes('>')) {
                            el.innerHTML = translation;
                        } else {
                            for (let i = 0; i < el.childNodes.length; i++) {
                                const node = el.childNodes[i];
                                if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
                                    node.nodeValue = translation;
                                    textUpdated = true;
                                    break; 
                                }
                            }
                            if (!textUpdated) {
                                el.innerHTML = translation; 
                            }
                        }
                    }
                }
            }
        });

        const titleElements = container.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation !== key) el.title = translation;
        });

        const placeholderElements = container.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) el.placeholder = translation;
        });
    }
}

// Export a singleton instance
export const i18n = new I18nManager();

// Also put it on window for global access (e.g., from inline event handlers)
window.i18n = i18n;
window.t = (key) => i18n.t(key);
