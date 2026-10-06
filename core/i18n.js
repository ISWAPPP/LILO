export const I18n = {
  currentLang: 'en',

  translations: {
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
      'dns_whois_date': '{date}',
      'dns_whois_expired': 'Expired',
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
      'notes_title_placeholder': 'Title (optional)...',
      'feedback_title': 'Have ideas to improve LILO?',
      'feedback_text': 'Leave your feedback to make the plugin even better!',
      'feedback_btn': 'Leave Feedback',
      'footer_feedback': 'Feedback',
      'footer_changelog': 'Changelog',
      'footer_privacy': 'Privacy Policy',
      'settings_title': 'Settings',
      'settings_font': 'Interface Font',
      'settings_font_system': 'System Default',
      'settings_font_georgia': 'Georgia (Elegant Serif)',
      'settings_font_garamond': 'Garamond (Classic Book Serif)',
      'settings_font_trebuchet': 'Trebuchet MS (Modern Humanist)',
      'settings_font_consolas': 'Consolas (Technical Monospace)',
      'settings_font_comic': 'Comic Sans MS (Playful/Casual)',
      'settings_font_impact': 'Impact (Heavy Display)',
      'settings_font_verdana': 'Verdana (Wide & Readable)',
      'settings_font_courier': 'Courier New (Classic Typewriter)',
      'settings_startup': 'Startup Tab',
      'settings_startup_last': 'Last Opened',
      'settings_startup_dns': 'DNS',
      'settings_startup_pics': 'PICS',
      'settings_startup_notes': 'NOTES',
      'settings_dns': 'DNS Provider',
      'settings_dns_config': 'DNS Configuration',
      'settings_dns_queries': 'DNS Queries',
      'settings_dns_buttons': 'DNS Toolbar Buttons',
      'settings_toolbar_buttons': 'Toolbar Buttons',
      'settings_passgen_label': 'Password Generator',
      'settings_passgen_desc': 'Show or hide the password generator widget on the Notes tab.',
      'settings_ui_elements_title': 'Interface Elements',
      'settings_history_limit': 'Max DNS History Domains',
      'settings_pics_history_limit': 'Max Image History Buffer',
      'settings_dns_google': 'Google (8.8.8.8)',
      'settings_dns_cloudflare': 'Cloudflare (1.1.1.1)',
      'settings_geo_provider_label': 'IP Geolocation Provider',
      'settings_theme': 'Theme',
      'settings_experimental_title': 'Experimental Features',
      'settings_experimental_notes': 'Experimental Notes',
      'settings_experimental_notes_desc': 'Enable note drag & drop reordering and mini stickers customized via bottom-left corner.',
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
      'notes_header_only': 'Header only',
      'notes_title_edit': 'Edit',
      'notes_copy_tooltip': 'Copy',
      'notes_title_delete': 'Delete',
      'notes_title_save': 'Save',
      'notes_type': 'Type',
      'notes_type_full': 'Full-width',
      'notes_type_mini': 'Sticker',
      'notes_width': 'Width',
      'btn_cancel': 'Cancel',
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

  async init() {
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
            if (el.id === 'copy-ssl' && el.hasAttribute('data-ssl-days')) {
              const daysVal = el.getAttribute('data-ssl-days');
              if (daysVal === 'expired') {
                btnText = this.t('dns_ssl_expired');
              } else if (daysVal === 'loading') {
                btnText = 'SSL...';
              } else if (daysVal !== '') {
                btnText = this.t('dns_ssl_days').replace('{days}', daysVal);
              }
            }
            if (el.id === 'copyWhois' && el.hasAttribute('data-whois-expiry')) {
              const expiryVal = el.getAttribute('data-whois-expiry');
              if (expiryVal === 'expired') {
                btnText = this.t('dns_whois_expired');
              } else if (expiryVal === 'loading') {
                btnText = 'Whois...';
              } else if (expiryVal !== '') {
                btnText = this.t('dns_whois_date').replace('{date}', expiryVal);
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
