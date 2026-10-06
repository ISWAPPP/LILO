let cache = null;

const defaultSettings = {
  theme: 'auto',
  startupTab: 'last',
  dnsProvider: 'google',
  geoProvider: 'ipwhois',
  tabShortcutModifier: 'off',
  dnsHistoryLimit: 4,
  picsHistoryLimit: 5,
  font: 'system',
  experimentalNotes: false,
  passgenEnabled: true,
  passgen: { lower: true, upper: true, numbers: true, symbols: false, excludeSimilar: false, length: 16 },
  dnsQueries: { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true, caa: false, soa: false },
  dnsToolbarButtons: { ssl: true, dns: true, whois: false }
};

function writeLocalCache(saved) {
  try {
    localStorage.setItem('lilo_settings_cache', JSON.stringify(saved));
  } catch {
    // Ignored
  }
}

/** Reads settings from chrome.storage.sync; one-time migrates the old chrome.storage.local copy. */
async function readSynced() {
  const { lilo_settings: synced } = await chrome.storage.sync.get('lilo_settings');
  if (synced) {
    return synced;
  }
  const { lilo_settings: legacy } = await chrome.storage.local.get('lilo_settings');
  if (legacy) {
    await chrome.storage.sync.set({ lilo_settings: legacy });
    await chrome.storage.local.remove('lilo_settings');
  }
  return legacy || {};
}

// Settings changed on another device (or another open popup): drop stale copies.
globalThis.chrome?.storage?.onChanged?.addListener((changes, area) => {
  if (area === 'sync' && changes.lilo_settings) {
    cache = changes.lilo_settings.newValue || {};
    writeLocalCache(cache);
  }
});

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

    // localStorage copy gives a near-instant (0.1ms) start; chrome.storage.sync is the source of truth.
    try {
      const localSaved = localStorage.getItem('lilo_settings_cache');
      if (localSaved) {
        cache = JSON.parse(localSaved);
        readSynced().then(writeLocalCache); // refresh copy in background (picks up other devices)
        return mergeSettings(cache);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage cache:', e);
    }

    cache = await readSynced();
    writeLocalCache(cache);
    return mergeSettings(cache);
  },

  async save(settings) {
    cache = {
      ...settings,
      passgen: { ...settings.passgen },
      dnsQueries: { ...settings.dnsQueries },
      dnsToolbarButtons: { ...settings.dnsToolbarButtons },
    };
    writeLocalCache(cache);
    await chrome.storage.sync.set({ lilo_settings: cache });
  },

  /** Removes saved settings everywhere (sync + legacy local) — back to defaults. */
  async reset() {
    await chrome.storage.sync.remove('lilo_settings');
    await chrome.storage.local.remove('lilo_settings');
    this.invalidate();
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
