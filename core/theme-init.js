// theme-init.js — Synchronous theme bootstrap to prevent flash of unstyled content.
// NOTE: This intentionally duplicates logic from core/theme.js because it must run
// before ES modules load. Keep both files in sync when changing theme detection logic.
(() => {
    const theme = localStorage.getItem('lilo_theme_cache') || 'auto';
    let actualTheme = theme;
    if (theme === 'auto') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(`theme-${actualTheme}`);
    document.documentElement.setAttribute('data-theme', actualTheme);
    document.documentElement.setAttribute('data-theme-setting', theme);
})();
