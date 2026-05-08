// core/utils.js — pure utilities without side effects.

export const Utils = {
  isValidDomain(domain) {
    return /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/.test(domain);
  },

  isValidIP(ip) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
  },

  getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  },

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
  },

  // Returns HTML with CSS class instead of inline styles.
  formatTime(ms) {
    if (typeof ms !== 'number') return '—';
    const cls = ms < 100 ? 'ping-fast' : ms < 300 ? 'ping-mid' : 'ping-slow';
    return `<span class="${cls}">${ms} ms</span>`;
  },

  cleanDomain(input) {
    return input.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];
  },

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },
};
