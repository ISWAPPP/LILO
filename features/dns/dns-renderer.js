// features/dns/dns-renderer.js — HTML rendering for DNS results.

import { Utils } from '../../core/utils.js';

export const DnsRenderer = {
  /** Full block of DNS check results. */
  results({ ips, ipv6, mx, ns, mainGeo }) {
    let html = `<div class="results-container animate-fade-in-up">`;
    let ipContent = ips.join('<br>');
    if (mainGeo && ips.length > 0) {
      const geoStr = `<div class="geo-info no-copy">${Utils.getFlagEmoji(mainGeo.countryCode)} ${mainGeo.country}, ${mainGeo.city}</div>`;
      ipContent = geoStr + ips.join('<br>');
    }

    html += this.row('IP (A)', ipContent);
    
    if (ipv6 && ipv6.length > 0) {
      html += this.row('IPv6', ipv6.join('<br>'));
    }

    html += this.row('MX', this.formatMX(mx));
    html += this.row('NS', (ns || []).map(r => Utils.escapeHTML(r.data)).join('<br>'));
    html += '</div>';
    return html;
  },

  row(label, content) {
    if (!content || content === '—') return '';
    return `
      <div class="result-row">
        <div class="result-label">${label}</div>
        <div class="result-value">${content}</div>
      </div>`;
  },

  formatMX(records) {
    if (!records?.length) return '—';
    return records
      .sort((a, b) => (parseInt(a.data) || 0) - (parseInt(b.data) || 0))
      .map(r => {
        const [prio, ...srv] = r.data.split(' ');
        let result = '';
        if (r.targetIps && r.targetIps.length > 0) {
          result += `<div class="geo-info no-copy">${r.targetIps.join(', ')}</div>`;
        }
        result += `<span class="badge-mx">${prio}</span> ${Utils.escapeHTML(srv.join(' '))}`;
        return result;
      }).join('<br>');
  },

  loader() {
    return '<div class="loader-container animate-fade-in-up"><div class="loader"></div></div>';
  },

  ipResults(ip, geo) {
    if (!geo) {
      return `<div class="results-container">${this.row('IP', ip)}</div>`;
    }
    
    let html = `<div class="results-container animate-fade-in-up">`;
    html += this.row('IP', ip);
    html += this.row('Location', `${Utils.getFlagEmoji(geo.countryCode)} ${geo.country}, ${geo.regionName}, ${geo.city}`);
    html += this.row('ISP', geo.isp);
    if (geo.org && geo.org !== geo.isp) {
      html += this.row('Org', geo.org);
    }
    html += this.row('AS', geo.as);
    html += '</div>';
    return html;
  },

  error(msg) {
    return `
      <div class="msg error" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
        <svg class="icon icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${msg}</span>
      </div>`;
  },
};
