// core/api.js — all external HTTP requests. No cache — data is always fresh.

import { Config } from '../config.js';
import { Settings } from './settings.js';

async function fetchWithTimeout(resource, options = {}) {
  window.liloApiCallsCount = (window.liloApiCallsCount || 0) + 1;
  const start = performance.now();
  const { timeout = 8000 } = options;
  const controller = new self.AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
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
      } else if (host === 'ip-api.com' || host === 'www.ip-api.com') {
        urlLabel = 'IP Geo Check';
      } else if (host === 'ssl-checker.io' || host === 'api.cert.ist') {
        urlLabel = 'SSL Expiry Check';
      }
    } catch (e) {
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
    } catch (e) { return null; }
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
      return await res.json();
    } catch (err) { 
      console.error('DNS query failed:', err);
      return { Answer: [] }; 
    }
  },
  /** IP Geolocation via ip-api.com */
  async getIpGeo(ip) {
    try {
      const res = await fetchWithTimeout(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`, { timeout: Config.timing.pingTimeout || 4000 });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.status === 'success') {
        return data;
      }
      return null;
    } catch (err) {
      console.error('IP Geo check failed:', err);
      return null;
    }
  },

  /** Uploads an image to freeimage.host. Optional onProgress(0–100). */
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
        if (xhr.status < 200 || xhr.status >= 300) {
          console.error('Server error:', xhr.responseText);
          resolve(null);
          return;
        }
        try {
          const result = JSON.parse(xhr.responseText);
          if (result?.image?.url) {
            resolve(result.image.url);
          } else {
            console.error('Invalid response format', result);
            resolve(null);
          }
        } catch (err) {
          console.error('Upload parse failed:', err);
          resolve(null);
        }
      });

      xhr.addEventListener('error', () => {
        const latency = performance.now() - start;
        Api.recordCall('Image Upload', latency, 'Network Error');
        console.error('Upload failed: network error');
        resolve(null);
      });

      xhr.addEventListener('timeout', () => {
        const latency = performance.now() - start;
        Api.recordCall('Image Upload', latency, 'Timeout');
        console.error('Upload failed: timeout');
        resolve(null);
      });

      xhr.send(formData);
    });
  },

  /** Gets SSL certificate info (days remaining) via the configured provider */
  async getSslDays(domain) {
    try {
      const settings = await Settings.load();
      const provider = settings.sslProvider || 'certist';

      if (provider === 'sslchecker') {
        const res = await fetchWithTimeout(`https://ssl-checker.io/api/v1/check/${encodeURIComponent(domain)}`, { timeout: 6000 });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.status === 'ok' && data.result) {
          return data.result.days_left !== undefined ? data.result.days_left : null;
        }
        return null;
      }

      // Default to certist
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
};
