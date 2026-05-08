(function() {
    const theme = localStorage.getItem('lilo_theme_cache') || 'auto';
    let actualTheme = theme;
    if (theme === 'auto') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add('theme-' + actualTheme);
    document.documentElement.setAttribute('data-theme', actualTheme);
    document.documentElement.setAttribute('data-theme-setting', theme);

    const cachedHeight = localStorage.getItem('lilo_height_cache');
    if (cachedHeight) {
        document.documentElement.style.setProperty('--cached-height', cachedHeight + 'px');
    }
})();
