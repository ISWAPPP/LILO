// popup.js — thin controller. Feature initialization only.

import { TabManager } from './core/tabs.js';
import { initDnsFeature } from './features/dns/dns.js';
import { initPicsFeature } from './features/pics/pics.js';
import { initNotesFeature } from './features/notes/notes.js';
import { Settings } from './core/settings.js';
import { I18n } from './core/i18n.js';
import { Theme } from './core/theme.js';
import { initSettingsFeature } from './features/settings/settings.js';

document.addEventListener('DOMContentLoaded', async () => {
  initDnsFeature();
  initPicsFeature();
  initNotesFeature();
  initSettingsFeature();

  const settings = await Settings.load();
  await I18n.init(settings.language);
  Theme.init(settings.theme || 'auto');
  document.documentElement.style.setProperty('--cached-height', (settings.windowHeight || 600) + 'px');
  localStorage.setItem('lilo_height_cache', settings.windowHeight || 600);

  let initialTab = 'dns';
  if (settings.startupTab === 'last') {
    initialTab = await Settings.getLastTab();
  } else {
    initialTab = settings.startupTab;
  }

  TabManager.init(initialTab);
});