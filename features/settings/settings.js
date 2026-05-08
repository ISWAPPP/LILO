import { Settings } from '../../core/settings.js';
import { I18n } from '../../core/i18n.js';
import { TabManager } from '../../core/tabs.js';
import { Theme } from '../../core/theme.js';

export function initSettingsFeature() {
  TabManager.register('settings', {
    async init() {
      const settings = await Settings.load();
      
      const langSelect = document.getElementById('setting-language');
      const startupSelect = document.getElementById('setting-startup-tab');
      const dnsSelect = document.getElementById('setting-dns-provider');
      const heightSlider = document.getElementById('setting-window-height');
      const heightVal = document.getElementById('setting-window-height-val');
      
      // Theme Palette logic
      const themeSwatches = document.querySelectorAll('.theme-swatch');
      const modeBtns = document.querySelectorAll('.zen-mode-btn');
      let currentTheme = settings.theme || 'auto';
      
      const updateThemeActiveState = (themeValue) => {
        themeSwatches.forEach(swatch => {
          swatch.classList.toggle('active', swatch.dataset.value === themeValue);
        });
        modeBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === themeValue);
        });
      };
      
      updateThemeActiveState(currentTheme);

      // Horizontal scroll logic for Zen palette
      const paletteScroll = document.getElementById('setting-theme-palette');
      const btnScrollLeft = document.getElementById('zen-scroll-left');
      const btnScrollRight = document.getElementById('zen-scroll-right');

      if (btnScrollLeft && paletteScroll) {
        btnScrollLeft.addEventListener('click', () => {
          paletteScroll.scrollBy({ left: -120, behavior: 'smooth' });
        });
      }
      
      if (btnScrollRight && paletteScroll) {
        btnScrollRight.addEventListener('click', () => {
          paletteScroll.scrollBy({ left: 120, behavior: 'smooth' });
        });
      }

      if (langSelect) langSelect.value = settings.language;
      if (startupSelect) startupSelect.value = settings.startupTab;
      if (dnsSelect) dnsSelect.value = settings.dnsProvider || 'google';
      if (heightSlider) {
        heightSlider.value = settings.windowHeight || 600;
        if (heightVal) heightVal.textContent = (settings.windowHeight || 600) + 'px';
      }

      const handleSave = async (updatedSettings = {}) => {
        const newSettings = {
          ...settings,
          language: langSelect?.value || 'auto',
          theme: currentTheme,
          startupTab: startupSelect?.value || 'last',
          dnsProvider: dnsSelect?.value || 'google',
          windowHeight: parseInt(heightSlider?.value || '600'),
          ...updatedSettings
        };
        await Settings.save(newSettings);
        
        // Update i18n
        await I18n.init(newSettings.language);
        
        // Update theme
        Theme.apply(newSettings.theme);
        
        // Update height
        document.documentElement.style.setProperty('--cached-height', newSettings.windowHeight + 'px');
        localStorage.setItem('lilo_height_cache', newSettings.windowHeight);
      };

      langSelect?.addEventListener('change', () => handleSave());
      startupSelect?.addEventListener('change', () => handleSave());
      dnsSelect?.addEventListener('change', () => handleSave());
      
      themeSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          const newTheme = e.currentTarget.dataset.value;
          currentTheme = newTheme;
          updateThemeActiveState(newTheme);
          handleSave({ theme: newTheme });
        });
      });

      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const newTheme = e.currentTarget.dataset.value;
          currentTheme = newTheme;
          updateThemeActiveState(newTheme);
          handleSave({ theme: newTheme });
        });
      });
      
      heightSlider?.addEventListener('input', () => {
        if (heightVal) heightVal.textContent = heightSlider.value + 'px';
        document.documentElement.style.setProperty('--cached-height', heightSlider.value + 'px');
      });
      heightSlider?.addEventListener('change', () => handleSave());
    }
  });
}
