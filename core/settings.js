export const Settings = {
  defaultSettings: {
    language: 'auto',
    theme: 'auto',
    startupTab: 'last',
    dnsProvider: 'google',
    windowHeight: 600,
    passgen: { lower: true, upper: true, numbers: true, symbols: false, length: 16 },
    dnsQueries: { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true }
  },

  async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lilo_settings'], (result) => {
        resolve({ ...this.defaultSettings, ...result.lilo_settings });
      });
    });
  },

  async save(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ lilo_settings: settings }, resolve);
    });
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
