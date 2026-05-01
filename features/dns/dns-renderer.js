// features/dns/dns-renderer.js — HTML rendering for DNS results.

import { Utils } from '../../core/utils.js';

export const DnsRenderer = {
  /** Full block of DNS check results. */
  results({ ips, mx, ns, mainGeo }) {
    let html = `<div class="results-container">`;
    let ipContent = ips.join('<br>');
    if (mainGeo && ips.length > 0) {
      const geoStr = `<div class="no-copy" style="color:var(--text-muted); font-size:0.85em; margin-bottom:2px;">${Utils.getFlagEmoji(mainGeo.countryCode)} ${mainGeo.country}, ${mainGeo.city}</div>`;
      ipContent = geoStr + ips.join('<br>');
    }

    html += this.row('IP (A)', ipContent);

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
          result += `<div class="no-copy" style="color:var(--text-muted); font-size: 0.85em; margin-bottom: 2px;">${r.targetIps.join(', ')}</div>`;
        }
        result += `<span class="badge-mx">${prio}</span> ${Utils.escapeHTML(srv.join(' '))}`;
        return result;
      }).join('<br>');
  },

  loader() {
    return '<div class="loader"></div>';
  },

  ipResults(ip, geo) {
    if (!geo) {
      return `<div class="results-container">${this.row('IP', ip)}</div>`;
    }
    
    let html = `<div class="results-container">`;
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
    return `<div class="msg error">${msg}</div>`;
  },
};
