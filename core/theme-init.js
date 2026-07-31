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

    // Bootstrap font setting to prevent FOUF (flash of unstyled font)
    const font = localStorage.getItem('lilo_font_cache') || 'system';
    document.documentElement.setAttribute('data-font', font);

    // Bootstrap grain setting to prevent FOUC / flash of ungrained content
    const grainEnabled = localStorage.getItem('lilo_grain_enabled_cache') === 'true';
    const grainOpacity = localStorage.getItem('lilo_grain_opacity_cache') || '0.05';
    const grainContrast = localStorage.getItem('lilo_grain_contrast_cache') || '100';
    if (grainEnabled) {
        document.documentElement.setAttribute('data-grain', 'true');
        document.documentElement.style.setProperty('--grain-opacity', grainOpacity);
        document.documentElement.style.setProperty('--grain-contrast', `${grainContrast}%`);
    } else {
        document.documentElement.removeAttribute('data-grain');
    }
})();
