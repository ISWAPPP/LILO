import { Settings } from '../../core/settings.js';
import { I18n } from '../../core/i18n.js';
import { TabManager } from '../../core/tabs.js';
import { Theme } from '../../core/theme.js';

export function initSettingsFeature() {
  TabManager.register('settings', {
    async init() {
      const settings = await Settings.load();
      
      const langSelect = document.getElementById('setting-language');
      const themeSelect = document.getElementById('setting-theme');
      const startupSelect = document.getElementById('setting-startup-tab');
      const dnsSelect = document.getElementById('setting-dns-provider');
      const heightSlider = document.getElementById('setting-window-height');
      const heightVal = document.getElementById('setting-window-height-val');

      if (langSelect) langSelect.value = settings.language;
      if (themeSelect) themeSelect.value = settings.theme || 'auto';
      if (startupSelect) startupSelect.value = settings.startupTab;
      if (dnsSelect) dnsSelect.value = settings.dnsProvider || 'google';
      if (heightSlider) {
        heightSlider.value = settings.windowHeight || 600;
        if (heightVal) heightVal.textContent = (settings.windowHeight || 600) + 'px';
      }

      const handleSave = async () => {
        const newSettings = {
          ...settings,
          language: langSelect?.value || 'auto',
          theme: themeSelect?.value || 'auto',
          startupTab: startupSelect?.value || 'last',
          dnsProvider: dnsSelect?.value || 'google',
          windowHeight: parseInt(heightSlider?.value || '600')
        };
        await Settings.save(newSettings);
        
        // Update i18n
        await I18n.init(newSettings.language);
        
        // Update theme
        Theme.apply(newSettings.theme);
        
        // Update height
        document.body.style.height = newSettings.windowHeight + 'px';
      };

      langSelect?.addEventListener('change', handleSave);
      themeSelect?.addEventListener('change', handleSave);
      startupSelect?.addEventListener('change', handleSave);
      dnsSelect?.addEventListener('change', handleSave);
      
      heightSlider?.addEventListener('input', () => {
        if (heightVal) heightVal.textContent = heightSlider.value + 'px';
        document.body.style.height = heightSlider.value + 'px';
      });
      heightSlider?.addEventListener('change', handleSave);
    }
  });
}
