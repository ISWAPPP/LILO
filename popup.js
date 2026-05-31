// popup.js — thin controller. Feature initialization only.

import { TabManager } from './core/tabs.js';
import { Settings } from './core/settings.js';
import { I18n } from './core/i18n.js';
import { Theme } from './core/theme.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Step 1: Speculatively resolve the initial tab synchronously to parallelize module loading (0.1ms latency)
  let initialTab = 'dns';
  try {
    const localSaved = localStorage.getItem('lilo_settings_cache');
    const localLastTab = localStorage.getItem('lilo_last_tab_cache');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed.startupTab === 'last') {
        initialTab = localLastTab || 'dns';
      } else if (parsed.startupTab) {
        initialTab = parsed.startupTab;
      }
    }
  } catch (e) {
    console.warn('Failed to parse localStorage settings cache for speculative load:', e);
  }

  // Speculatively trigger the dynamic import of the active tab script immediately in parallel
  const tabLoaders = {
    dns: () => import('./features/dns/dns.js').then(m => m.initDnsFeature()),
    pics: () => import('./features/pics/pics.js').then(m => m.initPicsFeature()),
    notes: () => import('./features/notes/notes.js').then(m => m.initNotesFeature()),
    settings: () => import('./features/settings/settings.js').then(m => m.initSettingsFeature())
  };

  const activeTabPromise = tabLoaders[initialTab] ? tabLoaders[initialTab]() : null;

  // Register lazy loaders. For the initial tab, return the speculative promise immediately to achieve 0ms load overhead.
  Object.entries(tabLoaders).forEach(([name, loader]) => {
    if (name === initialTab && activeTabPromise) {
      TabManager.registerLazy(name, () => activeTabPromise);
    } else {
      TabManager.registerLazy(name, loader);
    }
  });

  // Step 2: Load settings, apply i18n and theme. Since they hit the localStorage cache, this is virtually synchronous (~0.2ms).
  const settings = await Settings.load();
  await I18n.init(settings.language);
  Theme.init(settings.theme || 'auto');

  // Verify tab match or resolve startup Tab async if it was a cold load
  if (settings.startupTab === 'last') {
    initialTab = await Settings.getLastTab();
  } else {
    initialTab = settings.startupTab;
  }

  // Step 3: Initialize TabManager — instantly mounts tabs and hooks events
  await TabManager.init(initialTab);

  // Record total startup time
  window.liloStartupTime = performance.now();

  // Step 4: Setup LILO Debug Console
  const debugCard = document.getElementById('debug-card');
  const footer = document.querySelector('.settings-footer');
  let footerClicks = 0;

  const updateDebugMetrics = async () => {
    if (!debugCard || debugCard.style.display === 'none') return;

    // --- [1] Performance & Latency ---
    // Startup Time
    const metricStartup = document.getElementById('metric-startup');
    if (metricStartup) {
      const time = window.liloStartupTime ? `${window.liloStartupTime.toFixed(1)} ms` : `${performance.now().toFixed(1)} ms`;
      metricStartup.textContent = time;
    }

    // Active Provider
    const metricDnsProvider = document.getElementById('metric-dns-provider');
    if (metricDnsProvider) {
      const currentSettings = await Settings.load();
      const provider = currentSettings.dnsProvider || 'google';
      metricDnsProvider.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
    }

    // Tab Load Metrics
    const metricTabTimes = document.getElementById('metric-tab-times');
    if (metricTabTimes) {
      const times = TabManager.tabLoadTimes || {};
      const lines = Object.entries(times).map(([tab, ms]) => {
        return `• ${tab.toUpperCase()}: ${ms.toFixed(1)} ms`;
      });
      metricTabTimes.innerHTML = lines.length > 0 ? lines.join('<br>') : 'None loaded yet';
    }

    // --- [2] Storage Diagnostics ---
    const metricStorageSize = document.getElementById('metric-storage-size');
    const metricNotesCount = document.getElementById('metric-notes-count');
    const metricPicsCount = document.getElementById('metric-pics-count');

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // Storage size
      if (metricStorageSize) {
        chrome.storage.local.getBytesInUse(null, (bytes) => {
          const kb = (bytes / 1024).toFixed(2);
          metricStorageSize.textContent = `${bytes} bytes (~${kb} KB)`;
        });
      }
      
      // Notes & Pics Counts
      chrome.storage.local.get(['lilo_notes', 'lilo_pics_history'], (res) => {
        if (metricNotesCount) {
          try {
            const notes = res.lilo_notes ? (typeof res.lilo_notes === 'string' ? JSON.parse(res.lilo_notes) : res.lilo_notes) : [];
            metricNotesCount.textContent = `${notes.length} notes`;
          } catch {
            metricNotesCount.textContent = '0 notes';
          }
        }
        if (metricPicsCount) {
          try {
            const pics = res.lilo_pics_history ? (typeof res.lilo_pics_history === 'string' ? JSON.parse(res.lilo_pics_history) : res.lilo_pics_history) : [];
            metricPicsCount.textContent = `${pics.length} images`;
          } catch {
            metricPicsCount.textContent = '0 images';
          }
        }
      });
    } else {
      if (metricStorageSize) metricStorageSize.textContent = 'N/A';
      if (metricNotesCount) metricNotesCount.textContent = 'N/A';
      if (metricPicsCount) metricPicsCount.textContent = 'N/A';
    }

    // --- [3] API Latency Logs ---
    // Session API Calls
    const metricApiCalls = document.getElementById('metric-api-calls');
    if (metricApiCalls) {
      metricApiCalls.textContent = `${window.liloApiCallsCount || 0} requests`;
    }

    // Render list of API logs
    const apiDetailsContainer = document.getElementById('metric-api-details-container');
    if (apiDetailsContainer) {
      const logs = window.liloApiCallsLog || [];
      if (logs.length === 0) {
        apiDetailsContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 4px 0;">No API calls logged in this session</div>`;
      } else {
        const logElements = logs.map(log => {
          const isError = typeof log.status === 'string' && (log.status.toLowerCase().includes('error') || log.status.toLowerCase().includes('timeout') || log.status === 'Timeout' || log.status === 'Network Error');
          const color = isError ? 'var(--error-text)' : 'var(--success-text)';
          return `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-light); padding: 3px 0;">
              <span style="font-weight: 600; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${log.label}</span>
              <span style="color: var(--text-muted); font-size: 9px;">${log.timestamp}</span>
              <span style="font-weight: 700; color: ${color};">${log.latency.toFixed(0)}ms (${log.status})</span>
            </div>
          `;
        });
        apiDetailsContainer.innerHTML = logElements.join('');
      }
    }

    // --- [4] System & Environment ---
    // Version
    const metricExtVersion = document.getElementById('metric-ext-version');
    if (metricExtVersion) {
      let extVer = '1.0.0';
      let manifestVer = '3';
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        extVer = manifest.version || '1.0.0';
        manifestVer = manifest.manifest_version || '3';
      }
      metricExtVersion.textContent = `v${extVer} (Manifest v${manifestVer})`;
    }

    // Viewport & DOM Elements
    const metricViewport = document.getElementById('metric-viewport');
    if (metricViewport) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const domElements = document.getElementsByTagName('*').length;
      metricViewport.textContent = `${w}x${h} px (${domElements} elements)`;
    }

    // Current Local Time
    const metricLocalTime = document.getElementById('metric-local-time');
    if (metricLocalTime) {
      metricLocalTime.textContent = new Date().toLocaleTimeString();
    }
  };

  // Generate complete Markdown report
  const generateMarkdownReport = async () => {
    const startupTime = window.liloStartupTime ? `${window.liloStartupTime.toFixed(1)} ms` : `${performance.now().toFixed(1)} ms`;
    
    const currentSettings = await Settings.load();
    const dnsProvider = (currentSettings.dnsProvider || 'google').toUpperCase();

    const tabTimes = Object.entries(TabManager.tabLoadTimes || {})
      .map(([tab, ms]) => `  * ${tab.toUpperCase()}: ${ms.toFixed(1)} ms`)
      .join('\n') || '  * None loaded yet';

    let totalBytes = 'N/A';
    let notesCount = '0';
    let picsCount = '0';

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const bytes = await new Promise(r => chrome.storage.local.getBytesInUse(null, r));
      totalBytes = `${bytes} bytes (~${(bytes / 1024).toFixed(2)} KB)`;

      const res = await new Promise(r => chrome.storage.local.get(['lilo_notes', 'lilo_pics_history'], r));
      try {
        const notes = res.lilo_notes ? (typeof res.lilo_notes === 'string' ? JSON.parse(res.lilo_notes) : res.lilo_notes) : [];
        notesCount = notes.length;
      } catch {}
      try {
        const pics = res.lilo_pics_history ? (typeof res.lilo_pics_history === 'string' ? JSON.parse(res.lilo_pics_history) : res.lilo_pics_history) : [];
        picsCount = pics.length;
      } catch {}
    }

    const apiLogs = (window.liloApiCallsLog || [])
      .map(log => `  * [${log.timestamp}] ${log.label} | ${log.latency.toFixed(1)} ms | Status: ${log.status}`)
      .join('\n') || '  * No HTTP requests in session';

    let extVer = '1.0.0';
    let manifestVer = '3';
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      const manifest = chrome.runtime.getManifest();
      extVer = manifest.version || '1.0.0';
      manifestVer = manifest.manifest_version || '3';
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const domCount = document.getElementsByTagName('*').length;
    const ua = navigator.userAgent;

    return `### LILO Developer Diagnostic Report
* Generated: ${new Date().toLocaleString('en-US')}

**[1] PERFORMANCE & LATENCY**
* Extension Startup Speed: ${startupTime}
* Configured DNS Provider: ${dnsProvider}
* Lazy Tab Load Speeds:
${tabTimes}

**[2] STORAGE METRICS**
* Local Storage Space Used: ${totalBytes}
* Notes Saved count: ${notesCount}
* Pictures in History: ${picsCount}

**[3] API LATENCY LOGS**
* Session HTTP Calls: ${window.liloApiCallsCount || 0}
* Latency Logs (Last 10):
${apiLogs}

**[4] SYSTEM & ENVIRONMENT**
* Extension Version: v${extVer} (Manifest v${manifestVer})
* Viewport dimension: ${w}x${h} pixels
* Total DOM Elements: ${domCount} nodes
* Current Local Time: ${new Date().toLocaleTimeString()}
* User Agent: \`${ua}\`
`;
  };

  // Expose globally and bind to tab changes
  window.updateLiloDebugMetrics = updateDebugMetrics;
  TabManager.onTabInitialized = () => {
    updateDebugMetrics();
  };

  // Bind custom listener on switching tabs so metrics update automatically!
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(updateDebugMetrics, 50); // slight delay to allow active tab classes to settle
    });
  });

  // Load saved debug state
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get('lilo_debug_mode', (res) => {
      if (res.lilo_debug_mode && debugCard) {
        debugCard.style.display = 'block';
        updateDebugMetrics();
      }
    });
  }

  footer?.addEventListener('click', async (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    footerClicks++;
    if (footerClicks === 5) {
      footerClicks = 0;
      if (debugCard) {
        const isCurrentlyVisible = debugCard.style.display === 'block';
        if (isCurrentlyVisible) {
          debugCard.style.display = 'none';
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await new Promise(r => chrome.storage.local.set({ lilo_debug_mode: false }, r));
          }
          const { Utils } = await import('./core/utils.js');
          Utils.showToast('Developer Debug Console disabled!');
        } else {
          debugCard.style.display = 'block';
          updateDebugMetrics();
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await new Promise(r => chrome.storage.local.set({ lilo_debug_mode: true }, r));
          }
          const { Utils } = await import('./core/utils.js');
          Utils.showToast('Developer Debug Console enabled!');
        }
      }
    }
  });

  // Debug card buttons
  const btnDebugClearStorage = document.getElementById('btn-debug-clear-storage');
  const btnDebugReload = document.getElementById('btn-debug-reload');
  const btnDebugCopyReport = document.getElementById('btn-debug-copy-report');

  btnDebugClearStorage?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all storage to default?')) {
      await new Promise(r => chrome.storage.local.clear(r));
      Settings.invalidate();
      const { Utils } = await import('./core/utils.js');
      Utils.showToast('Storage successfully reset!');
      setTimeout(() => location.reload(), 800);
    }
  });

  btnDebugReload?.addEventListener('click', () => {
    location.reload();
  });

  btnDebugCopyReport?.addEventListener('click', async () => {
    try {
      const report = await generateMarkdownReport();
      await navigator.clipboard.writeText(report);
      
      const { Utils } = await import('./core/utils.js');
      Utils.showToast('Diagnostic report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy report:', err);
      const { Utils } = await import('./core/utils.js');
      Utils.showToast('Failed to copy report!');
    }
  });

  // Set interval to update time dynamically every second
  setInterval(() => {
    if (debugCard && debugCard.style.display === 'block') {
      const metricLocalTime = document.getElementById('metric-local-time');
      if (metricLocalTime) {
        metricLocalTime.textContent = new Date().toLocaleTimeString();
      }
    }
  }, 1000);
});