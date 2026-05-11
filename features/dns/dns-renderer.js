// features/dns/dns-renderer.js — HTML rendering for DNS results.

import { Utils } from '../../core/utils.js';

export const DnsRenderer = {
  /** Full block of DNS check results. */
  results({ ips, ipv6, mx, txt, dmarc, ns, mainGeo, dq }) {
    let html = `<div class="results-container animate-fade-in-up">`;
    
    if (dq.a && ips) {
      let ipContent = ips.map(ip => Utils.escapeHTML(ip)).join('<br>');
      if (mainGeo && ips.length > 0) {
        const geoStr = `<div class="geo-info no-copy">${Utils.getFlagEmoji(mainGeo.countryCode)} ${Utils.escapeHTML(mainGeo.country)}, ${Utils.escapeHTML(mainGeo.city)}</div>`;
        ipContent = geoStr + ips.map(ip => Utils.escapeHTML(ip)).join('<br>');
      }
      html += this.row('IP (A)', ipContent || '—');
    }
    
    if (dq.aaaa && ipv6) {
      html += this.row('IPv6', ipv6.length > 0 ? ipv6.map(ip => Utils.escapeHTML(ip)).join('<br>') : '—');
    }

    if (dq.mx && mx) {
      html += this.row('MX', this.formatMX(mx));
    }

    // TXT & Security
    const txtRecords = txt || [];
    const dmarcRecords = dmarc || [];
    
    const spfRec = txtRecords.find(r => r.data.includes('v=spf1'));
    const dkimRec = txtRecords.find(r => r.data.includes('v=DKIM1'));
    const dmarcRec = dmarcRecords.find(r => r.data.includes('v=DMARC1'));
    const otherTxt = txtRecords.filter(r => r !== spfRec && r !== dkimRec).map(r => Utils.escapeHTML(r.data));

    if (dq.spf) {
      if (spfRec) {
        html += this.row('SPF', `<span style="font-family: monospace; font-size: 11px; word-break: break-all;">${Utils.escapeHTML(spfRec.data)}</span>`);
      } else {
        html += this.row('SPF', '<span style="color: var(--text-muted); font-size: 11px; display: flex; align-items: center; gap: 4px;"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Not found</span>');
      }
    }
    
    if (dq.dmarc) {
      if (dmarcRec) {
        html += this.row('DMARC', `<span style="font-family: monospace; font-size: 11px; word-break: break-all;">${Utils.escapeHTML(dmarcRec.data)}</span>`);
      } else {
        html += this.row('DMARC', '<span style="color: var(--text-muted); font-size: 11px; display: flex; align-items: center; gap: 4px;"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Not found</span>');
      }
    }
    
    if (dq.dkim) {
      if (dkimRec) {
        html += this.row('DKIM', `<span style="color: var(--success-text); display: flex; align-items: center; gap: 4px; margin-bottom:4px;"><svg class="icon icon-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Configured (in root TXT)</span><span style="font-family: monospace; font-size: 11px;">${Utils.escapeHTML(dkimRec.data)}</span>`);
      } else {
        html += this.row('DKIM', '<span style="color: var(--text-muted); font-size: 11px; display: flex; align-items: center; gap: 4px;"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Not found (or requires selector)</span>');
      }
    }

    if (dq.txt) {
      if (otherTxt.length > 0) {
        html += this.row('TXT', `<div style="font-family: monospace; font-size: 11px; word-break: break-all;">${otherTxt.join('<br>')}</div>`);
      } else {
        html += this.row('TXT', '—');
      }
    }

    if (dq.ns && ns) {
      html += this.row('NS', ns.length > 0 ? ns.map(r => Utils.escapeHTML(r.data)).join('<br>') : '—');
    }
    
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
      return `<div class="results-container">${this.row('IP', Utils.escapeHTML(ip))}</div>`;
    }
    
    let html = `<div class="results-container animate-fade-in-up">`;
    html += this.row('IP', Utils.escapeHTML(ip));
    html += this.row('Location', `${Utils.getFlagEmoji(geo.countryCode)} ${Utils.escapeHTML(geo.country)}, ${Utils.escapeHTML(geo.regionName)}, ${Utils.escapeHTML(geo.city)}`);
    html += this.row('ISP', Utils.escapeHTML(geo.isp));
    if (geo.org && geo.org !== geo.isp) {
      html += this.row('Org', Utils.escapeHTML(geo.org));
    }
    html += this.row('AS', Utils.escapeHTML(geo.as));
    html += '</div>';
    return html;
  },

  error(msg) {
    return `
      <div class="msg error" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
        <svg class="icon icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${Utils.escapeHTML(msg)}</span>
      </div>`;
  },
};
