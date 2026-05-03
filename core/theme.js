export const Theme = {
  themes: {
    light: 'light',
    dark: 'dark',
    forest: 'forest',
    paper: 'paper',
    sea: 'sea',
    sunset: 'sunset',
    cyberpunk: 'cyberpunk',
    coffee: 'coffee',
    matcha: 'matcha',
    peach: 'peach',
    lavender: 'lavender',
    nord: 'nord',
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

    // Sync to localStorage for fast sync access in popup.html (prevents flashing)
    localStorage.setItem('lilo_theme_cache', themeName);
  }
};
