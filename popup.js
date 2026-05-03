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
  document.body.style.height = (settings.windowHeight || 600) + 'px';

  if (settings.picsUnlocked) {
    const picsTabBtn = document.getElementById('tab-btn-pics');
    if (picsTabBtn) picsTabBtn.style.display = ''; // empty removes display:none but flex from css doesn't apply directly to button? It's just a button.
    const picsSettingOpt = document.getElementById('setting-startup-pics');
    if (picsSettingOpt) picsSettingOpt.style.display = '';
  }

  let initialTab = 'dns';
  if (settings.startupTab === 'last') {
    initialTab = await Settings.getLastTab();
  } else {
    initialTab = settings.startupTab;
  }

  if (initialTab === 'pics' && !settings.picsUnlocked) {
    initialTab = 'dns';
  }

  TabManager.init(initialTab);
});