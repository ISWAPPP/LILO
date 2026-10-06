// core/api.js — all external HTTP requests. No cache — data is always fresh.

import { Config } from '../config.js';
import { Settings } from './settings.js';

export const IP_API_ORIGIN = 'http://ip-api.com/*';

const GEO_PROVIDERS = {
  ipwhois: {
    url: (ip) => `https://ipwho.is/${ip}`,
    parse: (d) => d.success ? {
      country: d.country, countryCode: d.country_code, regionName: d.region, city: d.city,
      isp: d.connection?.isp, org: d.connection?.org, as: d.connection?.asn ? `AS${d.connection.asn} ${d.connection.org || ''}`.trim() : ''
    } : null
  },
  ipinfo: {
    url: (ip) => `https://ipinfo.io/${ip}/json`,
    parse: (d) => d.country ? {
      country: d.country, countryCode: d.country, regionName: d.region, city: d.city,
      isp: (d.org || '').replace(/^AS\d+\s*/, ''), org: '', as: d.org || ''
    } : null
  },
  ipapi: {
    url: (ip) => `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`,
    parse: (d) => d.status === 'success' ? d : null
  }
};

async function fetchWithTimeout(resource, options = {}) {
  window.liloApiCallsCount = (window.liloApiCallsCount || 0) + 1;
  const start = performance.now();
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    // Debug-console throttling: artificial delay before each request (session only).
    if (window.liloThrottleMs) {
      await new Promise(r => setTimeout(r, window.liloThrottleMs));
    }
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    const latency = performance.now() - start;
    Api.recordCall(resource, latency, response.status);
    return response;
  } catch (error) {
    clearTimeout(id);
    const latency = performance.now() - start;
    Api.recordCall(resource, latency, error.message || 'Timeout/Error');
    throw error;
  }
}

export const Api = {
  recordCall(url, latency, status) {
    window.liloApiCallsLog = window.liloApiCallsLog || [];
    
    let urlLabel = String(url);
    try {
      const baseOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : 'chrome-extension://lilo';
      const parsedUrl = new URL(urlLabel, baseOrigin);
      const host = parsedUrl.hostname.toLowerCase();
      const path = parsedUrl.pathname;
      if (host === 'dns.google' && path === '/resolve') {
        urlLabel = 'DNS Query (Google)';
      } else if (host === '1.1.1.1' && path === '/dns-query') {
        urlLabel = 'DNS Query (Cloudflare)';
      } else if (['ip-api.com', 'ipwho.is', 'ipinfo.io'].includes(host)) {
        urlLabel = 'IP Geo Check';
      } else if (host === 'api.cert.ist') {
        urlLabel = 'SSL Expiry Check';
      } else if (host === 'who-dat.as93.net') {
        urlLabel = 'WHOIS Expiry Check';
      }
    } catch {
      // Fallback to original label if URL parsing fails (e.g. non-URL logs)
    }
    
    window.liloApiCallsLog.unshift({
      timestamp: new Date().toLocaleTimeString(),
      label: urlLabel,
      latency: latency,
      status: status
    });
    if (window.liloApiCallsLog.length > 10) {
      window.liloApiCallsLog.pop();
    }

    if (window.updateLiloDebugMetrics) {
      window.updateLiloDebugMetrics();
    }
  },

  /** Retrieves the domain of the active Chrome tab. */
  async getActiveTabDomain() {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      return null;
    }
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        return null;
      }
      const url = new URL(tab.url);
      if (['http:', 'https:'].includes(url.protocol)) {
        return url.hostname;
      }
      return null;
    } catch { return null; }
  },

  /** DNS query via the selected provider (Google or Cloudflare). */
  async dnsQuery(name, type, provider = 'google') {
    try {
      const baseUrl = Config.api.dnsProviders[provider];
      
      const res = await fetchWithTimeout(
        `${baseUrl}?name=${encodeURIComponent(name)}&type=${type}`,
        { headers: { 'accept': 'application/dns-json' }, timeout: Config.timing.pingTimeout || 4000 }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Drop the FQDN root dot (example.com. -> example.com) from hostnames; TXT data is left untouched.
      if (type !== 'TXT') {
        data.Answer?.forEach(r => { r.data = r.data.replace(/\.(?=\s|$)/g, ''); });
      }
      return data;
    } catch (err) { 
      console.error('DNS query failed:', err);
      return { Answer: [] }; 
    }
  },
  /** IP Geolocation via the selected provider, normalized to { country, countryCode, regionName, city, isp, org, as }. */
  async getIpGeo(ip) {
    try {
      let { geoProvider = 'ipwhois' } = await Settings.load();
      // ip-api.com is an optional permission; settings may sync from a device where it was granted.
      if (geoProvider === 'ipapi' && !(await chrome.permissions.contains({ origins: [IP_API_ORIGIN] }))) {
        geoProvider = 'ipwhois';
      }
      const p = GEO_PROVIDERS[geoProvider] || GEO_PROVIDERS.ipwhois;
      const res = await fetchWithTimeout(p.url(encodeURIComponent(ip)), { timeout: Config.timing.pingTimeout || 4000 });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return p.parse(await res.json());
    } catch (err) {
      console.error('IP Geo check failed:', err);
      return null;
    }
  },

  /** Uploads an image to freeimage.host. Optional onProgress(0–100). Resolves { url } or { error }. */
  uploadImage(blob, onProgress) {
    window.liloApiCallsCount = (window.liloApiCallsCount || 0) + 1;
    const start = performance.now();
    const formData = new FormData();
    formData.append('key', Config.api.imgApiKey);
    formData.append('source', blob);
    formData.append('action', 'upload');

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', Config.api.imgUpload);
      xhr.timeout = 15000;

      xhr.upload.addEventListener('progress', (e) => {
        if (!onProgress) {
          return;
        }
        if (e.lengthComputable) {
          onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
        }
      });

      xhr.addEventListener('load', () => {
        const latency = performance.now() - start;
        Api.recordCall('Image Upload', latency, xhr.status);
        if (onProgress) {
          onProgress(100);
        }
        let result = null;
        try {
          result = JSON.parse(xhr.responseText);
        } catch {
          // Non-JSON body (e.g. HTML error page) — handled below
        }
        if (xhr.status >= 200 && xhr.status < 300 && result?.image?.url) {
          resolve({ url: result.image.url });
          return;
        }
        console.error('Upload failed:', xhr.status, xhr.responseText);
        const serverMsg = result?.error?.message || result?.status_txt || xhr.statusText;
        resolve({ error: `HTTP ${xhr.status || '—'}${serverMsg ? `: ${serverMsg}` : ''}` });
      });

      xhr.addEventListener('error', () => {
        const latency = performance.now() - start;
        Api.recordCall('Image Upload', latency, 'Network Error');
        console.error('Upload failed: network error');
        resolve({ error: 'Network error' });
      });

      xhr.addEventListener('timeout', () => {
        const latency = performance.now() - start;
        Api.recordCall('Image Upload', latency, 'Timeout');
        console.error('Upload failed: timeout');
        resolve({ error: 'Timeout (15 s)' });
      });

      xhr.send(formData);
    });
  },

  /** Gets SSL certificate days remaining via api.cert.ist */
  async getSslDays(domain) {
    try {
      const res = await fetchWithTimeout(`https://api.cert.ist/${encodeURIComponent(domain)}`, { timeout: 6000 });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data?.certificate?.validity_dates?.not_after) {
        const expiryDate = new Date(data.certificate.validity_dates.not_after);
        const diffTime = expiryDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return null;
    } catch (err) {
      console.error('SSL check failed:', err);
      return null;
    }
  },

  /** Gets WHOIS domain expiration date via who-dat API */
  async getWhoisExpiry(domain) { // NOPMD
    try { // NOPMD
      const res = await fetchWithTimeout(`https://who-dat.as93.net/${encodeURIComponent(domain)}`, { timeout: 6000 });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data?.dates?.expires) {
        return data.dates.expires;
      }
      return null;
    } catch (err) {
      console.error('WHOIS lookup failed:', err);
      return null;
    }
  },
};
