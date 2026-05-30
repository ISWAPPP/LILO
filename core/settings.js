let cache = null;

const defaultSettings = {
  language: 'auto',
  theme: 'auto',
  startupTab: 'last',
  dnsProvider: 'google',
  windowHeight: 300,
  dnsHistoryLimit: 4,
  passgen: { lower: true, upper: true, numbers: true, symbols: false, excludeSimilar: false, length: 16 },
  dnsQueries: { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true }
};

function mergeSettings(saved) {
  return {
    ...defaultSettings,
    ...saved,
    passgen: { ...defaultSettings.passgen, ...saved.passgen },
    dnsQueries: { ...defaultSettings.dnsQueries, ...saved.dnsQueries },
  };
}

export const Settings = {
  defaultSettings,

  async load(force = false) {
    if (cache && !force) {
      return mergeSettings(cache);
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(['lilo_settings'], (result) => {
        const saved = result.lilo_settings || {};
        cache = saved;
        resolve(mergeSettings(saved));
      });
    });
  },

  async save(settings) {
    cache = {
      ...settings,
      passgen: { ...settings.passgen },
      dnsQueries: { ...settings.dnsQueries },
    };

    return new Promise((resolve) => {
      chrome.storage.local.set({ lilo_settings: cache }, resolve);
    });
  },

  invalidate() {
    cache = null;
  },

  async getLastTab() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lilo_last_tab'], (result) => {
        resolve(result.lilo_last_tab || 'dns');
      });
    });
  },

  async setLastTab(tab) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ lilo_last_tab: tab }, resolve);
    });
  }
};
