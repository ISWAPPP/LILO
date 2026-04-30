export const Theme = {
  themes: {
    light: 'light',
    dark: 'dark',
    forest: 'forest',
    paper: 'paper',
    sea: 'sea',
    auto: 'auto'
  },

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

    // Remove all theme classes
    Object.values(this.themes).forEach(t => root.classList.remove(`theme-${t}`));
    
    // Add current theme class
    root.classList.add(`theme-${actualTheme}`);
    root.setAttribute('data-theme', actualTheme);
    
    // Also store the theme setting name (like 'auto')
    root.setAttribute('data-theme-setting', themeName);
  }
};
