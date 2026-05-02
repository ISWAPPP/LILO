export const I18n = {
  currentLang: 'uk', // Default

  translations: {
    uk: {
      'tab_dns': 'DNS',
      'tab_pics': 'PICS',
      'tab_notes': 'NOTES',
      'tab_settings': 'НАЛАШТУВАННЯ',
      'dns_ssl': 'SSL',
      'dns_dns': 'DNS',
      'dns_whois': 'Whois',
      'dns_placeholder': 'example.com',
      'dns_btn_go': 'GO',
      'dns_output_wait': 'Очікування...',
      'dns_error_invalid': '⚠️ Некоректний домен або IP',
      'dns_error_network': '❌ Помилка з\'єднання',
      'pics_warning': '⚠️ Зображення зберігаються на сторонніх серверах. Не поширюйте приватну інформацію!',
      'pics_paste': 'Натисніть <b>Ctrl + V</b> щоб вставити скріншот',
      'pics_auto': 'Зображення буде завантажено автоматично',
      'passgen_placeholder': '...',
      'passgen_tooltip': 'Натисніть щоб скопіювати',
      'passgen_refresh': 'Згенерувати новий',
      'notes_placeholder': 'Нова нотатка...',
      'feedback_title': 'Є ідеї як покращити LILO?',
      'feedback_text': 'Залиште свій відгук, щоб зробити плагін ще кращим!',
      'feedback_btn': 'Залишити відгук',
      'settings_title': 'Налаштування',
      'settings_lang': 'Мова інтерфейсу',
      'settings_lang_auto': 'Автоматично (браузер)',
      'settings_lang_uk': 'Українська',
      'settings_lang_en': 'English',
      'settings_startup': 'Початкова вкладка',
      'settings_startup_last': 'Остання відкрита',
      'settings_startup_dns': 'DNS',
      'settings_startup_pics': 'PICS',
      'settings_startup_notes': 'NOTES',
      'settings_dns_cloudflare': 'Cloudflare (1.1.1.1)',
      'settings_theme': 'Тема оформлення',
      'settings_theme_auto': 'Автоматично (браузер)',
      'settings_theme_light': 'Світла',
      'settings_theme_dark': 'Темна',
      'settings_theme_forest': 'Ліс',
      'settings_theme_paper': 'Папір',
      'settings_theme_sea': 'Море',
      'settings_save': 'Зберегти'
    },
    en: {
      'tab_dns': 'DNS',
      'tab_pics': 'PICS',
      'tab_notes': 'NOTES',
      'tab_settings': 'SETTINGS',
      'dns_ssl': 'SSL',
      'dns_dns': 'DNS',
      'dns_whois': 'Whois',
      'dns_placeholder': 'example.com',
      'dns_btn_go': 'GO',
      'dns_output_wait': 'Waiting...',
      'dns_error_invalid': '⚠️ Invalid domain or IP',
      'dns_error_network': '❌ Connection error',
      'pics_warning': '⚠️ Images are stored on third-party servers. Do not share private information!',
      'pics_paste': 'Press <b>Ctrl + V</b> to paste screenshot',
      'pics_auto': 'Image will be uploaded automatically',
      'passgen_placeholder': '...',
      'passgen_tooltip': 'Click to copy',
      'passgen_refresh': 'Generate new',
      'notes_placeholder': 'New note...',
      'feedback_title': 'Have ideas to improve LILO?',
      'feedback_text': 'Leave your feedback to make the plugin even better!',
      'feedback_btn': 'Leave Feedback',
      'settings_title': 'Settings',
      'settings_lang': 'Interface Language',
      'settings_lang_auto': 'Auto (Browser)',
      'settings_lang_uk': 'Українська',
      'settings_lang_en': 'English',
      'settings_startup': 'Startup Tab',
      'settings_startup_last': 'Last Opened',
      'settings_startup_dns': 'DNS',
      'settings_startup_pics': 'PICS',
      'settings_startup_notes': 'NOTES',
      'settings_dns_cloudflare': 'Cloudflare (1.1.1.1)',
      'settings_theme': 'Theme',
      'settings_theme_auto': 'Auto (Browser)',
      'settings_theme_light': 'Light',
      'settings_theme_dark': 'Dark',
      'settings_theme_forest': 'Forest',
      'settings_theme_paper': 'Paper',
      'settings_theme_sea': 'Sea',
      'settings_save': 'Save'
    }
  },

  async init(settingsLang) {
    if (settingsLang === 'auto') {
      const browserLang = navigator.language || navigator.userLanguage;
      this.currentLang = browserLang.startsWith('uk') || browserLang.startsWith('ru') ? 'uk' : 'en';
    } else {
      this.currentLang = settingsLang === 'en' ? 'en' : 'uk';
    }
    this.updateDOM();
  },

  t(key) {
    return this.translations[this.currentLang]?.[key] || key;
  },

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[this.currentLang][key]) {
        // If it's a placeholder, update the attribute
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', this.t(key));
          }
        } else if (el.tagName === 'BUTTON' && el.querySelector('span')) {
            // Keep the icon, change the text
            const icon = el.querySelector('span');
            el.innerHTML = '';
            el.appendChild(icon);
            el.appendChild(document.createTextNode(' ' + this.t(key)));
        } else {
          el.innerHTML = this.t(key);
        }
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (this.translations[this.currentLang][key]) {
        el.setAttribute('title', this.t(key));
      }
    });
  }
};
