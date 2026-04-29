// core/api.js — усі зовнішні HTTP-запити. Без кешу — дані завжди актуальні.

import { Config } from '../config.js';
import { Settings } from './settings.js';

export const Api = {
  /** Отримує домен активної вкладки Chrome. */
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

  /** DNS-запит через обраний провайдер (Google або Cloudflare). */
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

  /** HTTP HEAD ping з таймаутом. */
  async httpPing(domain) {
    const start = performance.now();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), Config.timing.pingTimeout);
    try {
      await fetch(`https://${domain}/?_p=${Date.now()}`, {
        method: 'HEAD', mode: 'no-cors', signal: controller.signal,
      });
      clearTimeout(id);
      return Math.round(performance.now() - start);
    } catch { return null; }
  },

  /** Завантаження зображення на freeimage.host. */
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
        console.error('Server error:', await res.json());
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
