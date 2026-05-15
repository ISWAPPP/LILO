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
    if (!domain) return;
    const urls = {
      ssl: Config.links.ssl(domain),
      dns: Config.links.dns(domain),
      whois: Config.links.whois(domain),
    };

    Object.keys(links).forEach(key => {
      const { a, btn } = links[key];
      if (!a || !btn) return;

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
    if (!rawValue) return;

    // Throttle
    if (Date.now() - lastRequest < Config.timing.throttleMs) return;
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
          if (target.endsWith('.')) target = target.slice(0, -1);
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

      let mainGeo = null;
      if (ips && ips.length > 0) {
        mainGeo = await Api.getIpGeo(ips[0]);
      }

      output.innerHTML = DnsRenderer.results({
        ips,
        ipv6,
        mx: MX.Answer === null ? null : mxResolved,
        txt: TXT.Answer === null ? null : (TXT.Answer || []),
        dmarc: DMARC.Answer === null ? null : (DMARC.Answer || []),
        dkim: DKIM.Answer === null ? null : (DKIM.Answer || []),
        ns: NS.Answer === null ? null : (NS.Answer || []),
        mainGeo,
        dq
      });
    } catch (err) {
      console.error('DNS check failed:', err);
      output.innerHTML = DnsRenderer.error(I18n.t('dns_error_network'));
    } finally {
      btn.disabled = false;
    }
  };

  // --- Tab registration ---
  TabManager.register('dns', {
    init() {
      btn.addEventListener('click', checkDNS);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkDNS();
      });

      // Click on result-row — copy value
      output.addEventListener('click', async (e) => {
        const row = e.target.closest('.result-row');
        if (!row) return;

        const valueEl = row.querySelector('.result-value');
        if (!valueEl) return;

        // Clone to manipulate without affecting UI
        const clone = valueEl.cloneNode(true);
        clone.querySelectorAll('.no-copy').forEach(el => el.remove());

        let textToCopy = clone.innerText.trim();
        if (!textToCopy) return;

        // For MX records, priority text could be removed if needed, 
        // but priority is usually useful. innerText preserves it.

        const ok = await Utils.copyToClipboard(textToCopy);
        if (ok) {
          row.classList.add('copied');
          setTimeout(() => row.classList.remove('copied'), 800);
        }
      });
    },

    async onActivate() {
      input.focus();

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
