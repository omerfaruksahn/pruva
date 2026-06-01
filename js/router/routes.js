export const ROUTE_MAP = {
    tr: {
        'home': '',
        'marketplace': 'marketplace',
        'education': 'education',
        'navlun-hesaplama': 'navlun-hesaplama',
        'lojistik-hizmetleri': 'lojistik-hizmetleri',
        'ithalat-ihracat': 'ithalat-ihracat',
        'konteyner-tasimaciligi': 'konteyner-tasimaciligi',
        'membership': 'membership',
        'settings': 'settings',
        'login': 'login',
        'register': 'register',
        'reset-password': 'sifre-sifirla',
        'post-ad': 'post-ad',
        'loader-dashboard': 'loader-dashboard',
        'carrier-dashboard': 'carrier-dashboard',
        'dashboard': 'dashboard',
        'inbox': 'inbox',
        'pruva-ai': 'pruva-ai',
        'pricing-actions': 'pruva-ai/actions',
        'pricing-customers': 'pricing-customers',
        'pricing-settings': 'pruva-ai/settings',
        'pricing-reports': 'pricing-reports',
        'rate-sheets': 'rate-sheets'
    },
    en: {
        'home': '',
        'marketplace': 'marketplace',
        'education': 'education',
        'navlun-hesaplama': 'freight-calculator',
        'lojistik-hizmetleri': 'logistics-services',
        'ithalat-ihracat': 'import-export',
        'konteyner-tasimaciligi': 'container-transport',
        'membership': 'membership',
        'settings': 'settings',
        'login': 'login',
        'register': 'register',
        'reset-password': 'reset-password',
        'post-ad': 'post-ad',
        'loader-dashboard': 'loader-dashboard',
        'carrier-dashboard': 'carrier-dashboard',
        'dashboard': 'dashboard',
        'inbox': 'inbox',
        'pruva-ai': 'pruva-ai',
        'pricing-actions': 'pruva-ai/actions',
        'pricing-customers': 'pricing-customers',
        'pricing-settings': 'pruva-ai/settings',
        'pricing-reports': 'pricing-reports',
        'rate-sheets': 'rate-sheets'
    }
};

export function getViewUrl(view, lang) {
    const prefix = lang === 'en' ? '/en' : '';
    const path = ROUTE_MAP[lang][view];
    if (path === undefined) return prefix || '/';
    return (prefix + (path ? '/' + path : '')) || '/';
}

export function parseUrl(path) {
    let lang = 'tr';
    let cleanPath = path;

    if (path.startsWith('/en')) {
        lang = 'en';
        cleanPath = path.substring(3);
    }

    cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');

    if (cleanPath.startsWith('rota/')) {
        const routeData = cleanPath.substring(5);
        return { view: 'navlun-hesaplama', lang, routeParams: routeData };
    }
    if (cleanPath.startsWith('route/')) {
        const routeData = cleanPath.substring(6);
        return { view: 'navlun-hesaplama', lang, routeParams: routeData };
    }

    const maps = ROUTE_MAP[lang];
    for (const [viewName, pathVal] of Object.entries(maps)) {
        if (pathVal === cleanPath) {
            return { view: viewName, lang };
        }
    }

    return { view: 'home', lang };
}

// Expose parseUrl & getViewUrl dynamically for backward compatibility
window.parseUrl = parseUrl;
window.getViewUrl = getViewUrl;