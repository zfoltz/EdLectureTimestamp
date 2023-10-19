// injected.js
(function() {
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                if (key === 'authToken') {
                    const event = new CustomEvent('authTokenSet', { detail: value });
                    document.dispatchEvent(event);
                }
                return originalSetItem.apply(this, arguments);
            };
        })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
})();
