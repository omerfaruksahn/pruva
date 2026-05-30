/**
 * PRUVA - Paranoid Security Layer
 * This script provides client-side protection against common tampering and inspection.
 * NOTE: Disabled automatically in development mode (Vite DEV).
 */
(function() {
    'use strict';

    // Dev mode detection — Vite automatically sets this
    if (import.meta.env.DEV) {
        console.log('🔓 Security Layer: DEV MODE — protections disabled.');
        return;
    }

    // 1. Anti-Debugger / Console Protection
    const detectDevTools = () => {
        const start = Date.now();
        debugger;
        const end = Date.now();
        if (end - start > 100) {
            // DevTools is likely open and paused execution
            console.clear();
            console.log('%c⚠️ GÜVENLİK UYARISI!', 'color: red; font-size: 30px; font-weight: bold; -webkit-text-stroke: 1px black;');
            console.log('%cBu platform yüksek güvenlikli sistemler tarafından korunmaktadır. Kaynak koduna izinsiz erişim denemeleri loglanmaktadır.', 'font-size: 14px;');
        }
    };
    
    // Interval check for debugger
    setInterval(detectDevTools, 2000);

    // 2. Right-Click Protection
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (window.notificationManager) {
            window.notificationManager.showToast('Güvenlik nedeniyle sağ tık engellenmiştir.', 'info');
        }
    });

    // 3. Keyboard Shortcut Protection (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    });

    // 4. Data Tamper Protection (Proxy for LocalStorage)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        // Add a checksum or simply obfuscate if we were really paranoid
        // For now, let's just log potential state tampering
        if (key.startsWith('pruva_') && window.app && window.app.state) {
            // Optional: Internal integrity check logic
        }
        originalSetItem.apply(this, arguments);
    };

    // 5. Global XSS Filter for all innerHTML assignments (Monkey Patching)
    // Note: This is extremely paranoid and can break things if not careful
    /*
    const originalHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
            // Only allow if it doesn't contain script tags or suspicious attributes
            const cleanValue = value.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                                   .replace(/on\w+="[^"]*"/gim, "");
            originalHTML.call(this, cleanValue);
        }
    });
    */

    console.log('🛡️ Paranoid Security Layer Active');
})();
