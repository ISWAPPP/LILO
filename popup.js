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
  // Step 1: Register features with TabManager (no init() calls yet).
  initDnsFeature();
  initPicsFeature();
  initNotesFeature();
  initSettingsFeature();

  // Step 2: Load settings, apply i18n and theme before rendering.
  const settings = await Settings.load();
  await I18n.init(settings.language);
  Theme.init(settings.theme || 'auto');

  let initialTab = 'dns';
  if (settings.startupTab === 'last') {
    initialTab = await Settings.getLastTab();
  } else {
    initialTab = settings.startupTab;
  }

  // Step 3: Initialize TabManager — this calls handler.init() on all registered features.
  TabManager.init(initialTab);
});