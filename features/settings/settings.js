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

      if (langSelect) langSelect.value = settings.language;
      if (themeSelect) themeSelect.value = settings.theme || 'auto';
      if (startupSelect) startupSelect.value = settings.startupTab;
      if (dnsSelect) dnsSelect.value = settings.dnsProvider || 'google';

      const handleSave = async () => {
        const newSettings = {
          ...settings,
          language: langSelect?.value || 'auto',
          theme: themeSelect?.value || 'auto',
          startupTab: startupSelect?.value || 'last',
          dnsProvider: dnsSelect?.value || 'google'
        };
        await Settings.save(newSettings);
        
        // Update i18n
        await I18n.init(newSettings.language);
        
        // Update theme
        Theme.apply(newSettings.theme);
      };

      langSelect?.addEventListener('change', handleSave);
      themeSelect?.addEventListener('change', handleSave);
      startupSelect?.addEventListener('change', handleSave);
      dnsSelect?.addEventListener('change', handleSave);
    }
  });
}
