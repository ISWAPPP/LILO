// config.js — single source of truth for constants across the extension.

export const Config = {
  api: {
    dnsProviders: {
      google: 'https://dns.google/resolve',
      cloudflare: 'https://1.1.1.1/dns-query'
    },
    imgUpload: 'https://freeimage.host/api/1/upload',
    imgApiKey: '6d207e02198a847aa98d0a2a901485a5',
  },

  links: {
    ssl: (d) => `https://www.sslshopper.com/ssl-checker.html#hostname=${d}`,
    dns: (d) => `https://dnschecker.org/#A/${d}`,
    whois: (d) => `https://who.is/whois/${d}`,
  },

  timing: {
    throttleMs: 1000,
    pingTimeout: 4000,
  },

  storage: {
    notesKey: 'lilo_notes',
    settingsKey: 'lilo_settings',
    lastTabKey: 'lilo_last_tab',
    picsHistoryKey: 'lilo_pics_history',
  },

  passgen: {
    defaultLength: 16,
    minLength: 4,
    maxLength: 64,
    similarChars: '0O1lI|',
    charsets: {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:<>?',
    },
  },
};
