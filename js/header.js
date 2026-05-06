// Shared Header Component for Hpower Car Rental
(function() {
    // Get current page to set active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Header HTML template
    const headerHTML = `
        <header class="header">
            <a href="index.html" class="logo">
                <img src="Logo/logo_hpower.png" alt="Hpower Car Rental" style="height: 80px; margin-right: 10px;">
                <span style="color: black; font-size: 1.3em; font-style: italic;">H<span style="color: #0047AB;">P</span>ower Car Rental</span>
            </a>
            <nav class="nav-links">
                <a href="index.html" data-i18n="nav.home">Inicio</a>
                <a href="fleet.html" data-i18n="nav.fleet">Flota</a>
                <a href="about.html" data-i18n="nav.about">Sobre Nosotros</a>
                <a href="contact.html" data-i18n="nav.contact">Contacto</a>
                <div class="lang-switcher">
                    <button class="lang-btn active" onclick="setLanguage('es')">ES</button>
                    <button class="lang-btn" onclick="setLanguage('en')">EN</button>
                </div>
                <div class="theme-switcher">
                    <button class="theme-btn active" onclick="setTheme('dark')" title="Modo oscuro">🌙</button>
                    <button class="theme-btn" onclick="setTheme('light')" title="Modo claro">☀️</button>
                </div>
            </nav>
        </header>
    `;

    // Insert header into placeholder
    function insertHeader() {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            placeholder.innerHTML = headerHTML;
            setActiveLink();
        }
    }

    // Set active class on the navigation link matching current page
    function setActiveLink() {
        const navLinks = document.querySelectorAll('.nav-links a[href]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Handle both index.html and root path (/)
            if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
                if (href === 'index.html') {
                    link.classList.add('active');
                }
            } else if (href === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Language and Theme functions are handled globally by i18n-shared.js and the page scripts.
    // The buttons in the header call these global functions directly.


    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertHeader);
    } else {
        insertHeader();
    }
})();
