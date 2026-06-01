let cache = null;

const defaultSettings = {
  language: 'auto',
  theme: 'auto',
  startupTab: 'last',
  dnsProvider: 'google',
  sslProvider: 'certist',
  dnsHistoryLimit: 4,
  picsHistoryLimit: 5,
  font: 'system',
  grainEnabled: false,
  grainOpacity: 0.05,
  grainContrast: 100,
  experimentalNotes: false,
  passgen: { lower: true, upper: true, numbers: true, symbols: false, excludeSimilar: false, length: 16 },
  dnsQueries: { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true },
  dnsToolbarButtons: { ssl: true, dns: true, whois: false }
};

function mergeSettings(saved) {
  return {
    ...defaultSettings,
    ...saved,
    passgen: { ...defaultSettings.passgen, ...saved.passgen },
    dnsQueries: { ...defaultSettings.dnsQueries, ...saved.dnsQueries },
    dnsToolbarButtons: { ...defaultSettings.dnsToolbarButtons, ...saved.dnsToolbarButtons },
  };
}

export const Settings = {
  defaultSettings,

  async load(force = false) {
    if (cache && !force) {
      return mergeSettings(cache);
    }

    // Try synchronous localStorage cache first for near-instant (0.1ms) load
    try {
      const localSaved = localStorage.getItem('lilo_settings_cache');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        cache = parsed;
        // Keep chrome.storage in sync in background
        chrome.storage.local.get(['lilo_settings'], (result) => {
          if (result.lilo_settings) {
            localStorage.setItem('lilo_settings_cache', JSON.stringify(result.lilo_settings));
          }
        });
        return mergeSettings(parsed);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage cache:', e);
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(['lilo_settings'], (result) => {
        const saved = result.lilo_settings || {};
        cache = saved;
        try {
          localStorage.setItem('lilo_settings_cache', JSON.stringify(saved));
        } catch {
          // Ignored
        }
        resolve(mergeSettings(saved));
      });
    });
  },

  async save(settings) {
    cache = {
      ...settings,
      passgen: { ...settings.passgen },
      dnsQueries: { ...settings.dnsQueries },
      dnsToolbarButtons: { ...settings.dnsToolbarButtons },
    };

    try {
      localStorage.setItem('lilo_settings_cache', JSON.stringify(cache));
    } catch {
      // Ignored
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ lilo_settings: cache }, resolve);
    });
  },

  invalidate() {
    cache = null;
    try {
      localStorage.removeItem('lilo_settings_cache');
      localStorage.removeItem('lilo_last_tab_cache');
    } catch {
      // Ignored
    }
  },

  async getLastTab() {
    try {
      const localTab = localStorage.getItem('lilo_last_tab_cache');
      if (localTab) {
        // Sync check in background
        chrome.storage.local.get(['lilo_last_tab'], (result) => {
          if (result.lilo_last_tab) {
            localStorage.setItem('lilo_last_tab_cache', result.lilo_last_tab);
          }
        });
        return localTab;
      }
    } catch {
      // Ignored
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(['lilo_last_tab'], (result) => {
        const tab = result.lilo_last_tab || 'dns';
        try {
          localStorage.setItem('lilo_last_tab_cache', tab);
        } catch {
          // Ignored
        }
        resolve(tab);
      });
    });
  },

  async setLastTab(tab) {
    try {
      localStorage.setItem('lilo_last_tab_cache', tab);
    } catch {
      // Ignored
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ lilo_last_tab: tab }, resolve);
    });
  }
};
