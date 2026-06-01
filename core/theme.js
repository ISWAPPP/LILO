export const Theme = {
  // Removed hardcoded themes list; themes are now managed dynamically

  init(themeName) {
    this.apply(themeName);
    
    // Listen for system theme changes if set to auto
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      chrome.storage.local.get(['lilo_settings'], (result) => {
        if (result.lilo_settings?.theme === 'auto') {
          this.apply('auto');
        }
      });
    });
  },

  apply(themeName) {
    const root = document.documentElement;
    let actualTheme = themeName;

    if (themeName === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Remove all theme classes dynamically
    Array.from(root.classList).forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });
    
    // Add current theme class
    root.classList.add(`theme-${actualTheme}`);
    root.setAttribute('data-theme', actualTheme);
    
    // Also store the theme setting name (like 'auto')
    root.setAttribute('data-theme-setting', themeName);

    // Sync to localStorage for fast sync access in popup.html (prevents flashing)
    localStorage.setItem('lilo_theme_cache', themeName);
  },

  applyFont(fontName) {
    const root = document.documentElement;
    root.setAttribute('data-font', fontName);
    localStorage.setItem('lilo_font_cache', fontName);
  },

  applyGrain(enabled, opacity, contrast) {
    const root = document.documentElement;
    if (enabled) {
      root.setAttribute('data-grain', 'true');
      root.style.setProperty('--grain-opacity', opacity);
      root.style.setProperty('--grain-contrast', `${contrast}%`);
      localStorage.setItem('lilo_grain_enabled_cache', 'true');
    } else {
      root.removeAttribute('data-grain');
      localStorage.setItem('lilo_grain_enabled_cache', 'false');
    }
    localStorage.setItem('lilo_grain_opacity_cache', opacity);
    localStorage.setItem('lilo_grain_contrast_cache', contrast);
  }
};
