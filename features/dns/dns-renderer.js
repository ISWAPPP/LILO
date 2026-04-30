// features/dns/dns-renderer.js — HTML rendering for DNS results.

import { Utils } from '../../core/utils.js';

export const DnsRenderer = {
  /** Full block of DNS check results. */
  results({ ips, mx, ns }) {
    let html = `<div class="results-container">`;
    html += this.row('IP (A)', ips.join('<br>'));

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
        let result = `<span class="badge-mx">${prio}</span> ${Utils.escapeHTML(srv.join(' '))}`;
        if (r.targetIps && r.targetIps.length > 0) {
            result += ` <span style="color:var(--text-muted); font-size: 0.9em; margin-left: 6px;">(${r.targetIps.join(', ')})</span>`;
        }
        return result;
      }).join('<br>');
  },

  loader() {
    return '<div class="loader"></div>';
  },

  error(msg) {
    return `<div class="msg error">${msg}</div>`;
  },
};
