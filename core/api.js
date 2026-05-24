// core/api.js — all external HTTP requests. No cache — data is always fresh.

import { Config } from '../config.js';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const Api = {
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
    const formData = new FormData();
    formData.append('key', Config.api.imgApiKey);
    formData.append('source', blob);
    formData.append('action', 'upload');

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', Config.api.imgUpload);
      xhr.timeout = 15000;

      xhr.upload.addEventListener('progress', (e) => {
        if (!onProgress) return;
        if (e.lengthComputable) {
          onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
        }
      });

      xhr.addEventListener('load', () => {
        if (onProgress) onProgress(100);
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
        console.error('Upload failed: network error');
        resolve(null);
      });

      xhr.addEventListener('timeout', () => {
        console.error('Upload failed: timeout');
        resolve(null);
      });

      xhr.send(formData);
    });
  },
};
