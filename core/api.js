// core/api.js — all external HTTP requests. No cache — data is always fresh.

import { Config } from '../config.js';
import { Settings } from './settings.js';

export const Api = {
  /** Retrieves the domain of the active Chrome tab. */
  async getActiveTabDomain() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return null;
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs?.[0]?.url) return resolve(null);
        try {
          const url = new URL(tabs[0].url);
          if (['http:', 'https:'].includes(url.protocol)) resolve(url.hostname);
          else resolve(null);
        } catch { resolve(null); }
      });
    });
  },

  /** DNS query via the selected provider (Google or Cloudflare). */
  async dnsQuery(name, type) {
    try {
      const settings = await Settings.load();
      const baseUrl = Config.api.dnsProviders[settings.dnsProvider || 'google'];
      
      const res = await fetch(
        `${baseUrl}?name=${encodeURIComponent(name)}&type=${type}`,
        { headers: { 'accept': 'application/dns-json' } }
      );
      return await res.json();
    } catch (err) { 
      console.error('DNS query failed:', err);
      return { Answer: [] }; 
    }
  },
  /** IP Geolocation via ip-api.com */
  async getIpGeo(ip) {
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`);
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
      const res = await fetch(Config.api.imgUpload, {
        method: 'POST', body: formData,
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
