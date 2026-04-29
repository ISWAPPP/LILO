// popup.js — тонкий контролер. Тільки ініціалізація фіч.

import { TabManager } from './core/tabs.js';
import { initDnsFeature } from './features/dns/dns.js';
import { initPicsFeature } from './features/pics/pics.js';
import { initNotesFeature } from './features/notes/notes.js';
import { Settings } from './core/settings.js';
import { I18n } from './core/i18n.js';
import { initSettingsFeature } from './features/settings/settings.js';

const checkFeedbackPopup = () => {
  const overlay = document.getElementById('feedback-overlay');
  const closeBtn = document.getElementById('feedback-close');
  const actionBtn = document.getElementById('feedback-btn');

  const lastSeen = localStorage.getItem('lilo_feedback_seen');
  const now = Date.now();
  const EIGHT_HOURS = 8 * 60 * 60 * 1000;

  if (!lastSeen || now - parseInt(lastSeen, 10) > EIGHT_HOURS) {
    overlay.classList.remove('hidden');

    const hidePopup = () => {
      overlay.classList.add('hidden');
      localStorage.setItem('lilo_feedback_seen', Date.now().toString());
    };

    closeBtn.addEventListener('click', hidePopup);
    actionBtn.addEventListener('click', hidePopup);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  initDnsFeature();
  initPicsFeature();
  initNotesFeature();
  initSettingsFeature();

  const settings = await Settings.load();
  await I18n.init(settings.language);

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
  checkFeedbackPopup();
});