// features/dns/dns.js — DNS tab module.
// This module handles checking DNS records (A, MX, TXT, NS),
// getting geodata, and performing HTTP pings for the entered domain.
// It also manages UI state (external link buttons, loader) during requests.

import { Api } from '../../core/api.js';
import { Utils } from '../../core/utils.js';
import { Config } from '../../config.js';
import { TabManager } from '../../core/tabs.js';
import { DnsRenderer } from './dns-renderer.js';
import { I18n } from '../../core/i18n.js';
import { Settings } from '../../core/settings.js';

export function initDnsFeature() {
  const input = document.getElementById('domain_input');
  const output = document.getElementById('output');
  const btn = document.getElementById('btnDIG');

  const links = {
    ssl: { a: document.getElementById('linkSSL'), btn: document.getElementById('copySSL') },
    dns: { a: document.getElementById('linkDNS'), btn: document.getElementById('copyDNS') },
    whois: { a: document.getElementById('linkWhois'), btn: document.getElementById('copyWhois') },
  };

  let lastRequest = 0;

  // --- External links and copy handlers update ---
  // This function activates toolbar buttons and assigns target URLs.
  // It also sets up handlers for copying these URLs to clipboard.
  const updateLinks = (domain) => {
    if (!domain) {
      return;
    }
    const urls = {
      ssl: Config.links.ssl(domain),
      dns: Config.links.dns(domain),
      whois: Config.links.whois(domain),
    };

    Object.keys(links).forEach(key => {
      const { a, btn } = links[key];
      if (!a || !btn) {
        return;
      }

      a.href = urls[key];
      a.classList.remove('disabled');
      btn.classList.remove('disabled');

      // Link copy handler on button click
      btn.onclick = async () => {
        const ok = await Utils.copyToClipboard(urls[key]);
        if (ok) {
          const origHTML = btn.innerHTML;
          btn.innerHTML = `<span><svg class="icon icon-inline icon-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg></span> ${I18n.t('copied')}`;
          setTimeout(() => btn.innerHTML = origHTML, 1000);
        }
      };
    });
  };

  // --- Main DNS check ---
  // Performs a series of parallel API requests to gather domain info
  const checkDNS = async () => {
    const rawValue = input.value.trim();
    if (!rawValue) {
      return;
    }

    // Throttle
    if (Date.now() - lastRequest < Config.timing.throttleMs) {
      return;
    }
    lastRequest = Date.now();

    let dkimSelector = 'default';
    let inputToClean = rawValue;
    let isDirectDkimFormat = false;
    let directDkimQuery = '';

    // Handle Option 1: domain:selector
    if (rawValue.includes(':') && !rawValue.startsWith('http')) {
      const parts = rawValue.split(':');
      inputToClean = parts[0];
      if (parts[1]) {
        dkimSelector = parts[1].trim();
      }
    }

    const cleanedTemp = Utils.cleanDomain(inputToClean);

    // Handle Option 2: selector._domainkey.domain
    if (cleanedTemp.includes('._domainkey.')) {
      isDirectDkimFormat = true;
      directDkimQuery = cleanedTemp;
      inputToClean = cleanedTemp.split('._domainkey.')[1];
    }

    const domain = Utils.cleanDomain(inputToClean);
    const isIp = Utils.isValidIP(domain);

    if (!Utils.isValidDomain(domain) && !isIp) {
      output.innerHTML = DnsRenderer.error(I18n.t('dns_error_invalid'));
      Object.keys(links).forEach(key => {
        if (links[key].a) links[key].a.classList.add('disabled');
        if (links[key].btn) links[key].btn.classList.add('disabled');
      });
      return;
    }

    input.value = rawValue;
    updateLinks(domain);

    btn.disabled = true;
    output.innerHTML = DnsRenderer.loader();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      output.innerHTML = DnsRenderer.error(I18n.t('dns_error_no_internet'));
      btn.disabled = false;
      return;
    }

    try {
      if (isIp) {
        const geo = await Api.getIpGeo(domain);
        output.innerHTML = DnsRenderer.ipResults(domain, geo);
        return;
      }

      const settings = await Settings.load();
      const provider = settings.dnsProvider || 'google';
      const dq = settings.dnsQueries || { a: true, aaaa: false, mx: true, txt: false, spf: false, dkim: false, dmarc: false, ns: true };
      const needsTxt = dq.txt || dq.spf;
      
      const dkimQueryStr = isDirectDkimFormat ? directDkimQuery : `${dkimSelector}._domainkey.${domain}`;

      const rawResults = await Promise.allSettled([
        dq.a ? Api.dnsQuery(domain, 'A', provider) : Promise.resolve({ Answer: null }),
        dq.aaaa ? Api.dnsQuery(domain, 'AAAA', provider) : Promise.resolve({ Answer: null }),
        dq.mx ? Api.dnsQuery(domain, 'MX', provider) : Promise.resolve({ Answer: null }),
        needsTxt ? Api.dnsQuery(domain, 'TXT', provider) : Promise.resolve({ Answer: null }),
        dq.ns ? Api.dnsQuery(domain, 'NS', provider) : Promise.resolve({ Answer: null }),
        dq.dmarc ? Api.dnsQuery(`_dmarc.${domain}`, 'TXT', provider) : Promise.resolve({ Answer: null }),
        dq.dkim ? Api.dnsQuery(dkimQueryStr, 'TXT', provider) : Promise.resolve({ Answer: null })
      ]);
      const [A, AAAA, MX, TXT, NS, DMARC, DKIM] = rawResults.map(r => r.status === 'fulfilled' ? r.value : { Answer: null });

      const ips = A.Answer === null ? null : (A.Answer || []).map(r => r.data);
      const ipv6 = AAAA.Answer === null ? null : (AAAA.Answer || []).map(r => r.data);

      const mxRecords = MX.Answer || [];
      const mxResolved = await Promise.all(mxRecords.map(async r => {
        const parts = r.data.split(' ');
        let target = parts[parts.length - 1]; // last part is the domain
        if (target) {
          if (target.endsWith('.')) {
            target = target.slice(0, -1);
          }
          try {
            const targetA = await Api.dnsQuery(target, 'A', provider);
            const targetIps = (targetA.Answer || []).map(a => a.data);
            // Keep only IPs that differ from the main domain
            const differentIps = targetIps.filter(ip => !ips.includes(ip));
            if (differentIps.length > 0) {
              return { ...r, targetIps: differentIps };
            }
          } catch (e) { }
        }
        return r;
      }));

      let ipGeos = [];
      if (ips && ips.length > 0) {
        const geoResults = await Promise.allSettled(ips.map(ip => Api.getIpGeo(ip)));
        ipGeos = geoResults.map(r => (r.status === 'fulfilled' ? r.value : null));
      }

      const data = await chrome.storage.local.get(['lilo_dns_favorites', 'lilo_dns_history']);
      const favs = data.lilo_dns_favorites || [];
      const isFav = favs.includes(domain);

      output.innerHTML = DnsRenderer.results({
        domain,
        isFav,
        ips,
        ipv6,
        mx: MX.Answer === null ? null : mxResolved,
        txt: TXT.Answer === null ? null : (TXT.Answer || []),
        dmarc: DMARC.Answer === null ? null : (DMARC.Answer || []),
        dkim: DKIM.Answer === null ? null : (DKIM.Answer || []),
        ns: NS.Answer === null ? null : (NS.Answer || []),
        ipGeos,
        dq
      });

      // Save to history (keep top 4, unique)
      let hist = data.lilo_dns_history || [];
      hist = [domain, ...hist.filter(d => d !== domain)].slice(0, 4);
      await chrome.storage.local.set({ lilo_dns_history: hist });

      renderQuickAccess();
    } catch (err) {
      console.error('DNS check failed:', err);
      output.innerHTML = DnsRenderer.error(I18n.t('dns_error_network'));
    } finally {
      btn.disabled = false;
    }
  };

  // --- Quick Access Favorites & History logic ---
  const renderQuickAccess = async () => {
    const data = await chrome.storage.local.get(['lilo_dns_favorites', 'lilo_dns_history']);
    const favorites = data.lilo_dns_favorites || [];
    const history = data.lilo_dns_history || [];

    const container = document.getElementById('dns-quick-access');
    const favList = document.getElementById('dns-favorites-list');
    const histList = document.getElementById('dns-history-list');

    if (favorites.length === 0 && history.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';

    if (favorites.length > 0) {
      document.getElementById('dns-favorites-container').style.display = 'flex';
      favList.innerHTML = favorites.map(dom => `
        <span class="dns-chip fav-chip" data-domain="${Utils.escapeHTML(dom)}">
          ★ ${Utils.escapeHTML(dom)}
          <span class="remove-chip" data-domain="${Utils.escapeHTML(dom)}" data-type="favorite">✕</span>
        </span>
      `).join('');
    } else {
      document.getElementById('dns-favorites-container').style.display = 'none';
    }

    if (history.length > 0) {
      document.getElementById('dns-history-container').style.display = 'flex';
      histList.innerHTML = history.map(dom => `
        <span class="dns-chip hist-chip" data-domain="${Utils.escapeHTML(dom)}">
          ${Utils.escapeHTML(dom)}
          <span class="remove-chip" data-domain="${Utils.escapeHTML(dom)}" data-type="history">✕</span>
        </span>
      `).join('');
    } else {
      document.getElementById('dns-history-container').style.display = 'none';
    }

    // Attach click listeners to chips
    container.querySelectorAll('.dns-chip').forEach(chip => {
      chip.onclick = (e) => {
        if (e.target.classList.contains('remove-chip')) {
          e.stopPropagation();
          const dom = e.target.getAttribute('data-domain');
          const type = e.target.getAttribute('data-type');
          removeQuickAccessItem(dom, type);
          return;
        }
        const dom = chip.getAttribute('data-domain');
        input.value = dom;
        checkDNS();
      };
    });
  };

  const removeQuickAccessItem = async (dom, type) => {
    if (type === 'favorite') {
      const data = await chrome.storage.local.get('lilo_dns_favorites');
      let favs = data.lilo_dns_favorites || [];
      favs = favs.filter(d => d !== dom);
      await chrome.storage.local.set({ lilo_dns_favorites: favs });
    } else {
      const data = await chrome.storage.local.get('lilo_dns_history');
      let hist = data.lilo_dns_history || [];
      hist = hist.filter(d => d !== dom);
      await chrome.storage.local.set({ lilo_dns_history: hist });
    }
    renderQuickAccess();
    
    // Update active results star if showing this domain
    const starEl = document.getElementById('dns-star-btn');
    if (starEl && starEl.getAttribute('data-domain') === dom && type === 'favorite') {
      starEl.classList.remove('active');
    }
  };

  const toggleFavorite = async (dom) => {
    const data = await chrome.storage.local.get('lilo_dns_favorites');
    let favs = data.lilo_dns_favorites || [];
    const starEl = document.getElementById('dns-star-btn');
    if (favs.includes(dom)) {
      favs = favs.filter(d => d !== dom);
      if (starEl) starEl.classList.remove('active');
    } else {
      favs.push(dom);
      if (starEl) starEl.classList.add('active');
    }
    await chrome.storage.local.set({ lilo_dns_favorites: favs });
    renderQuickAccess();
  };

  // --- Tab registration ---
  TabManager.register('dns', {
    init() {
      btn.addEventListener('click', checkDNS);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          checkDNS();
        }
      });

      // Click on output elements (copy or star favorite)
      output.addEventListener('click', async (e) => {
        const starEl = e.target.closest('#dns-star-btn');
        if (starEl) {
          e.stopPropagation();
          const dom = starEl.getAttribute('data-domain');
          if (dom) {
            toggleFavorite(dom);
          }
          return;
        }

        const row = e.target.closest('.result-row');
        if (!row) {
          return;
        }

        // Find all single values inside this card
        const singleValEls = row.querySelectorAll('.dns-single-val');

        // If there is only 1 value, click anywhere on the card copies that single value!
        if (singleValEls.length === 1) {
          const singleValEl = singleValEls[0];
          const textToCopy = singleValEl.innerText.trim();
          if (textToCopy) {
            const ok = await Utils.copyToClipboard(textToCopy);
            if (ok) {
              row.classList.add('copied');
              setTimeout(() => row.classList.remove('copied'), 800);
            }
          }
          return;
        }

        // If there are multiple values, check if clicked on a specific row
        const valRowEl = e.target.closest('.dns-val-row');
        if (valRowEl) {
          const singleValEl = valRowEl.querySelector('.dns-single-val');
          if (singleValEl) {
            const textToCopy = singleValEl.innerText.trim();
            if (textToCopy) {
              const ok = await Utils.copyToClipboard(textToCopy);
              if (ok) {
                valRowEl.classList.add('copied');
                setTimeout(() => valRowEl.classList.remove('copied'), 800);

                singleValEl.classList.add('copied');
                setTimeout(() => singleValEl.classList.remove('copied'), 800);

                row.classList.add('copied-partially');
                setTimeout(() => row.classList.remove('copied-partially'), 800);
              }
            }
            return;
          }
        }

        // Else, clicked on the general card area outside specific rows (when multiple values exist) -> copy all!
        const valueEl = row.querySelector('.result-value');
        if (!valueEl) {
          return;
        }

        // Clone to manipulate without affecting UI
        const clone = valueEl.cloneNode(true);
        clone.querySelectorAll('.no-copy').forEach(el => el.remove());

        let textToCopy = clone.innerText.trim();
        if (!textToCopy) {
          return;
        }

        const ok = await Utils.copyToClipboard(textToCopy);
        if (ok) {
          row.classList.add('copied');
          setTimeout(() => row.classList.remove('copied'), 800);
        }
      });
    },

    async onActivate() {
      input.focus();
      renderQuickAccess();

      // Autostart from active tab (only if input is empty)
      if (!input.value.trim()) {
        try {
          const tabDomain = await Api.getActiveTabDomain();
          if (tabDomain) {
            const cleaned = Utils.cleanDomain(tabDomain);
            if (cleaned && cleaned.includes('.')) {
              input.value = cleaned;
              checkDNS();
            }
          }
        } catch {
          console.log('Autostart failed');
        }
      }
    },
  });
}
