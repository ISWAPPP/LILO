// features/dns/dns.js — DNS tab module.
// This module handles checking DNS records (A, MX, TXT, NS),
// getting geodata, and performing HTTP pings for the entered domain.
// It also manages UI state (external link buttons, loader) during requests.

import { Api } from '../../core/api.js';
import { Utils } from '../../core/utils.js';
import { Config } from '../../config.js';
import { TabManager } from '../../core/tabs.js';
import { DnsRenderer } from './dns-renderer.js';

export function initDnsFeature() {
  const input  = document.getElementById('domain_input');
  const output = document.getElementById('output');
  const btn    = document.getElementById('btnDIG');

  const links = {
    ssl:   { a: document.getElementById('linkSSL'), btn: document.getElementById('copySSL') },
    dns:   { a: document.getElementById('linkDNS'), btn: document.getElementById('copyDNS') },
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
          btn.innerHTML = '<span>✅</span> Copied';
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

    const domain = Utils.cleanDomain(rawValue);

    if (!Utils.isValidDomain(domain)) {
      output.innerHTML = DnsRenderer.error('⚠️ Некоректний домен');
      return;
    }

    input.value = domain;
    updateLinks(domain);

    btn.disabled = true;
    output.innerHTML = DnsRenderer.loader();

    try {
      const [A, MX, TXT, NS] = await Promise.all([
        Api.dnsQuery(domain, 'A'),
        Api.dnsQuery(domain, 'MX'),
        Api.dnsQuery(domain, 'TXT'),
        Api.dnsQuery(domain, 'NS'),
      ]);

      const ips  = (A.Answer || []).map(r => r.data);
      
      const mxRecords = MX.Answer || [];
      const mxResolved = await Promise.all(mxRecords.map(async r => {
        const parts = r.data.split(' ');
        const target = parts[parts.length - 1]; // last part is the domain
        if (target) {
            try {
                const targetA = await Api.dnsQuery(target, 'A');
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

      output.innerHTML = DnsRenderer.results({
        ips,
        mx: mxResolved,
        ns: NS.Answer,
      });
    } catch (err) {
      console.error('DNS check failed:', err);
      output.innerHTML = DnsRenderer.error('❌ Помилка з\'єднання');
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

        // innerText automatically converts <br> and block elements into new lines
        let textToCopy = valueEl.innerText.trim();
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
