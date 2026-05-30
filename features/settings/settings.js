import { Settings } from '../../core/settings.js';
import { I18n } from '../../core/i18n.js';
import { TabManager } from '../../core/tabs.js';
import { Theme } from '../../core/theme.js';
import { Utils } from '../../core/utils.js';
import { Config } from '../../config.js';

export function initSettingsFeature() {
  TabManager.register('settings', {
    async init() {
      const settings = await Settings.load();
      
      const langSelect = document.getElementById('setting-language');
      const startupSelect = document.getElementById('setting-startup-tab');
      const dnsSelect = document.getElementById('setting-dns-provider');
      const sslSelect = document.getElementById('setting-ssl-provider');
      const historyLimitSlider = document.getElementById('setting-history-limit');
      const historyLimitVal = document.getElementById('setting-history-limit-val');

      const dq = settings.dnsQueries || { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true };
      const qA = document.getElementById('setting-query-a');
      const qAAAA = document.getElementById('setting-query-aaaa');
      const qMX = document.getElementById('setting-query-mx');
      const qNS = document.getElementById('setting-query-ns');
      const qTXT = document.getElementById('setting-query-txt');
      const qSPF = document.getElementById('setting-query-spf');
      const qDKIM = document.getElementById('setting-query-dkim');
      const qDMARC = document.getElementById('setting-query-dmarc');

      if (qA) { qA.checked = dq.a; }
      if (qAAAA) { qAAAA.checked = dq.aaaa; }
      if (qMX) { qMX.checked = dq.mx; }
      if (qNS) { qNS.checked = dq.ns; }
      if (qTXT) { qTXT.checked = dq.txt; }
      if (qSPF) { qSPF.checked = dq.spf; }
      if (qDKIM) { qDKIM.checked = dq.dkim; }
      if (qDMARC) { qDMARC.checked = dq.dmarc; }
      
      const tb = settings.dnsToolbarButtons || { ssl: true, dns: true, whois: false };
      const tbSsl = document.getElementById('setting-btn-ssl');
      const tbDns = document.getElementById('setting-btn-dns');
      const tbWhois = document.getElementById('setting-btn-whois');

      if (tbSsl) { tbSsl.checked = tb.ssl; }
      if (tbDns) { tbDns.checked = tb.dns; }
      if (tbWhois) { tbWhois.checked = tb.whois; }
      
      // Theme Palette logic
      const themeSwatches = document.querySelectorAll('.theme-swatch');
      let currentTheme = settings.theme || 'auto';
      
      const updateThemeActiveState = (themeValue) => {
        themeSwatches.forEach(swatch => {
          swatch.classList.toggle('active', swatch.dataset.value === themeValue);
        });
      };
      
      updateThemeActiveState(currentTheme);
 
      // Horizontal scroll logic for Zen palette
      const paletteScroll = document.getElementById('setting-theme-palette');
      const btnScrollLeft = document.getElementById('zen-scroll-left');
      const btnScrollRight = document.getElementById('zen-scroll-right');
 
      if (btnScrollLeft && paletteScroll) {
        btnScrollLeft.addEventListener('click', () => {
          paletteScroll.scrollBy({ left: -120, behavior: 'smooth' });
        });
      }
      
      if (btnScrollRight && paletteScroll) {
        btnScrollRight.addEventListener('click', () => {
          paletteScroll.scrollBy({ left: 120, behavior: 'smooth' });
        });
      }
 
      if (langSelect) { langSelect.value = settings.language; }
      if (startupSelect) { startupSelect.value = settings.startupTab; }
      if (dnsSelect) { dnsSelect.value = settings.dnsProvider || 'google'; }
      if (sslSelect) { sslSelect.value = settings.sslProvider || 'certist'; }

      if (historyLimitSlider) {
        historyLimitSlider.value = settings.dnsHistoryLimit || 4;
        if (historyLimitVal) {
          historyLimitVal.textContent = settings.dnsHistoryLimit || 4;
        }
      }
 
      const handleSave = async (updatedSettings = {}) => {
        const current = await Settings.load();
        const newSettings = {
          ...current,
          language: langSelect?.value || 'auto',
          theme: currentTheme,
          startupTab: startupSelect?.value || 'last',
          dnsProvider: dnsSelect?.value || 'google',
          sslProvider: sslSelect?.value || 'certist',
          dnsHistoryLimit: parseInt(historyLimitSlider?.value || '4', 10),
          dnsQueries: {
            a: qA?.checked,
            aaaa: qAAAA?.checked,
            mx: qMX?.checked,
            ns: qNS?.checked,
            txt: qTXT?.checked,
            spf: qSPF?.checked,
            dkim: qDKIM?.checked,
            dmarc: qDMARC?.checked
          },
          dnsToolbarButtons: {
            ssl: tbSsl?.checked,
            dns: tbDns?.checked,
            whois: tbWhois?.checked
          },
          ...updatedSettings
        };
        await Settings.save(newSettings);
        
        // Update i18n
        await I18n.init(newSettings.language);
        
        // Update theme
        Theme.apply(newSettings.theme);
        
        // Update toolbar buttons visibility immediately
        const activeTb = newSettings.dnsToolbarButtons || { ssl: true, dns: true, whois: false };
        const groupSSL = document.getElementById('groupSSL');
        const groupDNS = document.getElementById('groupDNS');
        const groupWhois = document.getElementById('groupWhois');
        if (groupSSL) { groupSSL.style.display = activeTb.ssl ? '' : 'none'; }
        if (groupDNS) { groupDNS.style.display = activeTb.dns ? '' : 'none'; }
        if (groupWhois) { groupWhois.style.display = activeTb.whois ? '' : 'none'; }
        
        Utils.showToast(I18n.t('toast_saved'));
      };
 
      langSelect?.addEventListener('change', () => handleSave());
      startupSelect?.addEventListener('change', () => handleSave());
      dnsSelect?.addEventListener('change', () => handleSave());
      sslSelect?.addEventListener('change', () => handleSave());
      
      const queryCheckboxes = [qA, qAAAA, qMX, qNS, qTXT, qSPF, qDKIM, qDMARC];
      queryCheckboxes.forEach(cb => {
        cb?.addEventListener('change', () => handleSave());
      });

      const tbCheckboxes = [tbSsl, tbDns, tbWhois];
      tbCheckboxes.forEach(cb => {
        cb?.addEventListener('change', () => handleSave());
      });
      
      themeSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          const newTheme = e.currentTarget.dataset.value;
          currentTheme = newTheme;
          updateThemeActiveState(newTheme);
          handleSave({ theme: newTheme });
        });
      });
      

      
      historyLimitSlider?.addEventListener('input', () => {
        if (historyLimitVal) {
          historyLimitVal.textContent = historyLimitSlider.value;
        }
      });
      historyLimitSlider?.addEventListener('change', () => handleSave());
 
      // Data Management
      const btnExport = document.getElementById('btn-export-data');
      const btnImport = document.getElementById('btn-import-data');
      const btnReset = document.getElementById('btn-reset-settings');
      const btnClear = document.getElementById('btn-clear-data');
      const fileImport = document.getElementById('file-import');
 
      btnExport?.addEventListener('click', async () => {
        const data = {};
        await new Promise(r => chrome.storage.local.get(null, res => { Object.assign(data, res); r(); }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lilo_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showToast(I18n.t('toast_exported'));
      });
 
      btnImport?.addEventListener('click', () => {
        fileImport?.click();
      });
 
      fileImport?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) { return; }
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (typeof data !== 'object' || data === null) {
              throw new Error('Invalid format');
            }
            
            const allowedKeys = Object.values(Config.storage);
            const filteredData = {};
            for (const key of allowedKeys) {
              if (data[key] !== undefined) {
                filteredData[key] = data[key];
              }
            }
            
            if (Object.keys(filteredData).length === 0) {
              throw new Error('No valid data found');
            }
            
            await new Promise(r => chrome.storage.local.set(filteredData, r));
            Settings.invalidate();
            Utils.showToast(I18n.t('toast_imported'));
            setTimeout(() => location.reload(), 1000);
          } catch (err) {
            Utils.showToast(I18n.t('toast_import_error'));
          }
        };
        reader.readAsText(file);
      });
  
      btnReset?.addEventListener('click', async () => {
        if (!confirm(I18n.t('settings_confirm_reset'))) { return; }
        await new Promise(r => chrome.storage.local.remove('lilo_settings', r));
        Settings.invalidate();
        Utils.showToast(I18n.t('toast_reset'));
        setTimeout(() => location.reload(), 800);
      });
  
      btnClear?.addEventListener('click', async () => {
        if (!confirm(I18n.t('settings_confirm_clear'))) { return; }
        await new Promise(r => chrome.storage.local.clear(r));
        Settings.invalidate();
        localStorage.clear();
        Utils.showToast(I18n.t('toast_cleared'));
        setTimeout(() => location.reload(), 800);
      });
    }
  });
}
