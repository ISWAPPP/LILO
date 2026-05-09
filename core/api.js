// core/api.js — all external HTTP requests. No cache — data is always fresh.

import { Config } from '../config.js';
import { Settings } from './settings.js';

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
    if (typeof chrome === 'undefined' || !chrome.tabs) return null;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return null;
      const url = new URL(tab.url);
      if (['http:', 'https:'].includes(url.protocol)) return url.hostname;
      return null;
    } catch { return null; }
  },

  /** DNS query via the selected provider (Google or Cloudflare). */
  async dnsQuery(name, type) {
    try {
      const settings = await Settings.load();
      const baseUrl = Config.api.dnsProviders[settings.dnsProvider || 'google'];
      
      const res = await fetchWithTimeout(
        `${baseUrl}?name=${encodeURIComponent(name)}&type=${type}`,
        { headers: { 'accept': 'application/dns-json' }, timeout: Config.timing.pingTimeout || 4000 }
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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

  /** Uploads an image to freeimage.host. */
  async uploadImage(blob) {
    const formData = new FormData();
    formData.append('key', Config.api.imgApiKey);
    formData.append('source', blob);
    formData.append('action', 'upload');

    try {
      const res = await fetchWithTimeout(Config.api.imgUpload, {
        method: 'POST', body: formData, timeout: 15000
      });

      if (!res.ok) {
        let errData = 'Unknown error';
        try {
          if (res.headers.get('content-type')?.includes('application/json')) {
            errData = await res.json();
          } else {
            errData = await res.text();
          }
        } catch (e) { /* ignore */ }
        console.error('Server error:', errData);
        return null;
      }

      const result = await res.json();
      if (result?.image?.url) return result.image.url;
      
      console.error('Invalid response format', result);
      return null;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  },
};
