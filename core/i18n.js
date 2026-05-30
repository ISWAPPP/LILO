export const I18n = {
  currentLang: 'en',

  translations: {
    uk: {
      'tab_dns': 'DNS',
      'tab_pics': 'PICS',
      'tab_notes': 'NOTES',
      'tab_settings': 'НАЛАШТУВАННЯ',
      'dns_ssl': 'SSL',
      'dns_ssl_days': '{days} дн.',
      'dns_ssl_expired': 'Закінчився',
      'dns_dns': 'DNS',
      'dns_whois': 'Whois',
      'dns_placeholder': 'example.com',
      'dns_btn_go': 'GO',
      'dns_output_wait': 'Очікування...',
      'dns_error_invalid': 'Некоректний домен або IP',
      'dns_error_network': 'Помилка з\'єднання',
      'dns_group_addressing': 'Адресація та Маршрутизація',
      'dns_group_mail': 'Поштові сервери (MX)',
      'dns_group_security': 'Безпека та Автентифікація',
      'dns_group_txt': 'Інші текстові записи (TXT)',
      'pics_warning': 'Зображення зберігаються на сторонніх серверах. Не поширюйте приватну інформацію!',
      'pics_paste_prefix': 'Натисніть ',
      'pics_paste_suffix': ' щоб вставити скріншот',
      'pics_auto': 'Зображення буде завантажено автоматично',
      'pics_history_title': 'Історія завантажень',
      'passgen_placeholder': '...',
      'passgen_tooltip': 'Натисніть щоб скопіювати',
      'passgen_refresh': 'Згенерувати новий',
      'passgen_no_similar': 'Без схожих',
      'pics_uploading': 'Завантаження',
      'notes_placeholder': 'Нова нотатка...',
      'feedback_title': 'Є ідеї як покращити LILO?',
      'feedback_text': 'Залиште свій відгук, щоб зробити плагін ще кращим!',
      'feedback_btn': 'Залишити відгук',
      'settings_title': 'Налаштування',
      'settings_shortcuts_title': 'Швидка навігація:',
      'settings_shortcuts_desc': 'Використовуйте Alt+1 (DNS), Alt+2 (PICS), Alt+3 (NOTES) або Alt+4 (Налаштування).',
      'settings_lang': 'Мова інтерфейсу',
      'settings_lang_auto': 'Автоматично (браузер)',
      'settings_lang_uk': 'Українська',
      'settings_lang_en': 'English',
      'settings_startup': 'Початкова вкладка',
      'settings_startup_last': 'Остання відкрита',
      'settings_startup_dns': 'DNS',
      'settings_startup_pics': 'PICS',
      'settings_startup_notes': 'NOTES',
      'settings_dns': 'DNS Провайдер',
      'settings_dns_config': 'Конфігурація DNS',
      'settings_dns_queries': 'Запити DNS',
      'settings_dns_buttons': 'Кнопки швидкого доступу DNS',
      'settings_window_height': 'Максимальна висота вікна (px)',
      'settings_history_limit': 'Макс. доменів в історії DNS',
      'settings_dns_google': 'Google (8.8.8.8)',
      'settings_dns_cloudflare': 'Cloudflare (1.1.1.1)',
      'settings_ssl_provider_label': 'Провайдер перевірки SSL',
      'settings_ssl_certist': 'api.cert.ist (CORS-сумісний)',
      'settings_ssl_sslchecker': 'ssl-checker.io',
      'settings_theme': 'Тема оформлення',
      'settings_theme_auto': 'Автоматично (браузер)',
      'settings_theme_light': 'Світла',
      'settings_theme_dark': 'Темна',
      'settings_theme_forest': 'Ліс',
      'settings_theme_paper': 'Папір',
      'settings_theme_sea': 'Море',
      'settings_theme_sunset': 'Захід сонця',
      'settings_theme_cyberpunk': 'Кіберпанк',
      'settings_theme_coffee': 'Кава',
      'settings_theme_matcha': 'Матча',
      'settings_theme_peach': 'Персик',
      'settings_theme_lavender': 'Лаванда',
      'settings_theme_nord': 'Норд',
      'settings_theme_mint': 'М\'ята',
      'settings_theme_rose': 'Троянда',
      'settings_theme_sakura': 'Сакура',
      'settings_theme_solarized_light': 'Соларайзд Світла',
      'settings_theme_solarized_dark': 'Соларайзд Темна',
      'settings_theme_dracula': 'Дракула',
      'settings_theme_gruvbox': 'Грувбокс',
      'settings_theme_oceanic': 'Океанік',
      'settings_theme_sand': 'Пісок',
      'settings_theme_breeze': 'Бриз',
      'settings_theme_autumn': 'Осінь',
      'settings_theme_navy': 'Нейві',
      'settings_theme_blood': 'Кров',
      'settings_theme_monochrome': 'Монохром',
      'settings_theme_terminal': 'Термінал',
      'settings_theme_amber': 'Янтарний',
      'settings_theme_midnight': 'Північ',
      'settings_theme_synthwave': 'Синтвейв',
      'settings_theme_neon_cyan': 'Неон Ціан',
      'settings_save': 'Зберегти',
      'settings_confirm_reset': 'Ви впевнені, що хочете скинути налаштування інтерфейсу?',
      'settings_confirm_clear': 'УВАГА: Це видалить ВСІ ваші нотатки та налаштування. Ви впевнені?',
      'settings_data_title': 'Управління даними',
      'settings_btn_export': 'Експорт',
      'settings_btn_import': 'Імпорт',
      'settings_btn_reset': 'Скинути UI',
      'settings_btn_clear': 'Очистити все',
      'settings_tooltip_export': 'Експортувати дані',
      'settings_tooltip_import': 'Імпортувати дані',
      'settings_tooltip_reset': 'Скинути UI',
      'settings_tooltip_clear': 'Очистити всі дані',
      'toast_saved': 'Налаштування збережено!',
      'toast_exported': 'Дані успішно експортовано',
      'toast_imported': 'Дані імпортовано. Перезапуск...',
      'toast_import_error': 'Помилка імпортування даних',
      'toast_cleared': 'Всі дані очищено!',
      'toast_reset': 'Налаштування скинуто',
      'notes_move_up': 'Вгору',
      'notes_move_down': 'Вниз',
      'notes_empty': 'Нотаток ще немає',
      'notes_edit_placeholder': 'Текст нотатки...',
      'notes_max_lines': 'Макс. рядків',
      'notes_title_edit': 'Редагувати',
      'notes_title_delete': 'Видалити',
      'notes_title_save': 'Зберегти',
      'pics_click_to_copy': 'Клікніть щоб скопіювати',
      'pics_loading': 'Завантаження на хостинг...',
      'pics_error_too_large': 'Файл занадто великий (> 10 МБ)',
      'pics_error_no_internet': 'Відсутнє з\'єднання з інтернетом',
      'pics_error_failed': 'Помилка завантаження',
      'dns_error_no_internet': 'Відсутнє з\'єднання з інтернетом',
      'copied': 'Скопійовано!',
      'clear': 'Очистити'
    },
    en: {
      'tab_dns': 'DNS',
      'tab_pics': 'PICS',
      'tab_notes': 'NOTES',
      'tab_settings': 'SETTINGS',
      'dns_ssl': 'SSL',
      'dns_ssl_days': '{days} days',
      'dns_ssl_expired': 'Expired',
      'dns_dns': 'DNS',
      'dns_whois': 'Whois',
      'dns_placeholder': 'example.com',
      'dns_btn_go': 'GO',
      'dns_output_wait': 'Waiting...',
      'dns_error_invalid': 'Invalid domain or IP',
      'dns_error_network': 'Connection error',
      'dns_group_addressing': 'Addressing & Routing',
      'dns_group_mail': 'Mail Exchange (MX)',
      'dns_group_security': 'Security & Validation',
      'dns_group_txt': 'Other Text Records (TXT)',
      'pics_warning': 'Images are stored on third-party servers. Do not share private information!',
      'pics_paste_prefix': 'Press ',
      'pics_paste_suffix': ' to paste screenshot',
      'pics_auto': 'Image will be uploaded automatically',
      'pics_history_title': 'Upload History',
      'passgen_placeholder': '...',
      'passgen_tooltip': 'Click to copy',
      'passgen_refresh': 'Generate new',
      'passgen_no_similar': 'No similar',
      'pics_uploading': 'Uploading',
      'notes_placeholder': 'New note...',
      'feedback_title': 'Have ideas to improve LILO?',
      'feedback_text': 'Leave your feedback to make the plugin even better!',
      'feedback_btn': 'Leave Feedback',
      'settings_title': 'Settings',
      'settings_shortcuts_title': 'Quick Navigation:',
      'settings_shortcuts_desc': 'Use Alt+1 (DNS), Alt+2 (PICS), Alt+3 (NOTES) or Alt+4 (Settings).',
      'settings_lang': 'Interface Language',
      'settings_lang_auto': 'Auto (Browser)',
      'settings_lang_uk': 'Українська',
      'settings_lang_en': 'English',
      'settings_startup': 'Startup Tab',
      'settings_startup_last': 'Last Opened',
      'settings_startup_dns': 'DNS',
      'settings_startup_pics': 'PICS',
      'settings_startup_notes': 'NOTES',
      'settings_dns': 'DNS Provider',
      'settings_dns_config': 'DNS Configuration',
      'settings_dns_queries': 'DNS Queries',
      'settings_dns_buttons': 'DNS Toolbar Buttons',
      'settings_window_height': 'Maximum Window Height (px)',
      'settings_history_limit': 'Max DNS History Domains',
      'settings_dns_google': 'Google (8.8.8.8)',
      'settings_dns_cloudflare': 'Cloudflare (1.1.1.1)',
      'settings_ssl_provider_label': 'SSL Checker Provider',
      'settings_ssl_certist': 'api.cert.ist (CORS compliant)',
      'settings_ssl_sslchecker': 'ssl-checker.io',
      'settings_theme': 'Theme',
      'settings_theme_auto': 'Auto (Browser)',
      'settings_theme_light': 'Light',
      'settings_theme_dark': 'Dark',
      'settings_theme_forest': 'Forest',
      'settings_theme_paper': 'Paper',
      'settings_theme_sea': 'Sea',
      'settings_theme_sunset': 'Sunset',
      'settings_theme_cyberpunk': 'Cyberpunk',
      'settings_theme_coffee': 'Coffee',
      'settings_theme_matcha': 'Matcha',
      'settings_theme_peach': 'Peach',
      'settings_theme_lavender': 'Lavender',
      'settings_theme_nord': 'Nord',
      'settings_theme_mint': 'Mint',
      'settings_theme_rose': 'Rose',
      'settings_theme_sakura': 'Sakura',
      'settings_theme_solarized_light': 'Solarized Light',
      'settings_theme_solarized_dark': 'Solarized Dark',
      'settings_theme_dracula': 'Dracula',
      'settings_theme_gruvbox': 'Gruvbox',
      'settings_theme_oceanic': 'Oceanic',
      'settings_theme_sand': 'Sand',
      'settings_theme_breeze': 'Breeze',
      'settings_theme_autumn': 'Autumn',
      'settings_theme_navy': 'Navy',
      'settings_theme_blood': 'Blood',
      'settings_theme_monochrome': 'Monochrome',
      'settings_theme_terminal': 'Terminal',
      'settings_theme_amber': 'Amber',
      'settings_theme_midnight': 'Midnight',
      'settings_theme_synthwave': 'Synthwave',
      'settings_theme_neon_cyan': 'Neon Cyan',
      'settings_save': 'Save',
      'settings_confirm_reset': 'Are you sure you want to reset the UI settings?',
      'settings_confirm_clear': 'WARNING: This will delete ALL your notes and settings. Are you sure?',
      'settings_data_title': 'Data Management',
      'settings_btn_export': 'Export',
      'settings_btn_import': 'Import',
      'settings_btn_reset': 'Reset UI',
      'settings_btn_clear': 'Clear All',
      'settings_tooltip_export': 'Export Data',
      'settings_tooltip_import': 'Import Data',
      'settings_tooltip_reset': 'Reset UI',
      'settings_tooltip_clear': 'Clear All Data',
      'toast_saved': 'Settings saved!',
      'toast_exported': 'Data exported successfully',
      'toast_imported': 'Data imported. Restarting...',
      'toast_import_error': 'Error importing data',
      'toast_cleared': 'All data cleared!',
      'toast_reset': 'Settings reset',
      'notes_move_up': 'Move Up',
      'notes_move_down': 'Move Down',
      'notes_empty': 'No notes yet',
      'notes_edit_placeholder': 'Note text...',
      'notes_max_lines': 'Max lines',
      'notes_title_edit': 'Edit',
      'notes_title_delete': 'Delete',
      'notes_title_save': 'Save',
      'pics_click_to_copy': 'Click to copy',
      'pics_loading': 'Uploading to host...',
      'pics_error_too_large': 'File is too large (> 10 MB)',
      'pics_error_no_internet': 'No internet connection',
      'pics_error_failed': 'Upload failed',
      'dns_error_no_internet': 'No internet connection',
      'copied': 'Copied!',
      'clear': 'Clear'
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
            el.textContent = '';
            el.appendChild(icon);
            
            let btnText = this.t(key);
            if (el.id === 'copySSL' && el.hasAttribute('data-ssl-days')) {
              const daysVal = el.getAttribute('data-ssl-days');
              if (daysVal === 'expired') {
                btnText = this.t('dns_ssl_expired');
              } else if (daysVal === 'loading') {
                btnText = 'SSL...';
              } else if (daysVal !== '') {
                btnText = this.t('dns_ssl_days').replace('{days}', daysVal);
              }
            }
            
            el.appendChild(document.createTextNode(` ${btnText}`));
        } else {
          el.textContent = this.t(key);
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
