// Shared Theme Management for Hpower Car Rental
(function() {
    let currentTheme = localStorage.getItem('theme') || 'dark';

    window.setTheme = function(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeButtons();
        
        // Custom event to notify other components if needed
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    };

    window.updateThemeButtons = function() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes(`'${currentTheme}'`) || onclickAttr.includes(`"${currentTheme}"`)) {
                btn.classList.add('active');
            }
        });
    };

    // Initialize theme
    document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeButtons();
    });

    // Also run immediately to avoid flicker if possible
    document.documentElement.setAttribute('data-theme', currentTheme);
})();
