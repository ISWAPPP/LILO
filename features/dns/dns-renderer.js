// features/dns/dns-renderer.js — HTML rendering for DNS results.

import { Utils } from '../../core/utils.js';
import { I18n } from '../../core/i18n.js';

export const DnsRenderer = {
  /** Full block of DNS check results. */
  results({ domain, ips, ipv6, mx, txt, dmarc, dkim, ns, ipGeos, dq }) {
    let html = `<div class="results-container animate-fade-in-up">`;
    
    // Group 1: Addressing & Routing (A, AAAA, NS)
    const hasA = dq.a && ips && ips.length > 0;
    const hasAAAA = dq.aaaa && ipv6 && ipv6.length > 0;
    const hasNS = dq.ns && ns && ns.length > 0;
    
    if (hasA || hasAAAA || hasNS) {
      html += `
        <div class="dns-group-card">
          <div class="dns-group-header no-copy">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>${I18n.t('dns_group_addressing')}</span>
          </div>`;
      
      if (hasA) {
        let valRows = ips.map((ip, i) => {
          const geo = ipGeos?.[i];
          let geoHtml = '';
          if (geo) {
            geoHtml = `<span class="geo-badge no-copy" style="margin-bottom: 0; margin-right: 6px;">${Utils.getFlagEmoji(geo.countryCode)} ${Utils.escapeHTML(geo.country)}, ${Utils.escapeHTML(geo.city)}</span>`;
          }
          return `<div class="dns-val-row">${geoHtml}<span class="dns-single-val" title="Клікніть щоб скопіювати тільки цю адресу">${Utils.escapeHTML(ip)}</span></div>`;
        }).join('');

        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label">A</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div><div class="result-value dns-record-value" style="white-space: normal;">${valRows}</div>
          </div>`;
      }
      
      if (hasAAAA) {
        let valRows = ipv6.map(ip => `<div class="dns-val-row"><span class="dns-single-val" title="Клікніть щоб скопіювати тільки цю адресу">${Utils.escapeHTML(ip)}</span></div>`).join('');

        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label">AAAA</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div><div class="result-value dns-record-value" style="white-space: normal;">${valRows}</div>
          </div>`;
      }
      
      if (hasNS) {
        let valRows = ns.map(r => `<div class="dns-val-row"><span class="dns-single-val" title="Клікніть щоб скопіювати тільки цей запис">${Utils.escapeHTML(r.data)}</span></div>`).join('');

        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label">NS</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div><div class="result-value dns-record-value" style="white-space: normal;">${valRows}</div>
          </div>`;
      }
      
      html += `</div>`;
    }
    
    // Group 2: Mail Exchange (MX)
    const hasMX = dq.mx && mx && mx.length > 0;
    if (hasMX) {
      html += `
        <div class="dns-group-card">
          <div class="dns-group-header no-copy">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>${I18n.t('dns_group_mail')}</span>
          </div>`;
      
      const sortedMx = [...mx].sort((a, b) => (parseInt(a.data) || 0) - (parseInt(b.data) || 0));
      sortedMx.forEach(r => {
        const [prio, ...srv] = r.data.split(' ');
        let geoInfo = '';
        if (r.targetIps && r.targetIps.length > 0) {
          geoInfo = `<div class="geo-badge no-copy">${r.targetIps.join(', ')}</div>`;
        }
        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label" style="display:flex; align-items:center; gap:4px;">MX <span style="background:var(--accent); color:var(--accent-text, #ffffff); font-size:9px; padding:1px 4px; border-radius:10px; border:none; font-weight:800;">${prio}</span></span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            ${geoInfo}
            <div class="result-value dns-record-value">${Utils.escapeHTML(srv.join(' '))}</div>
          </div>`;
      });
      
      html += `</div>`;
    }
    
    // Group 3: Security & Validation (SPF, DKIM, DMARC)
    const txtRecords = txt || [];
    const dmarcRecords = dmarc || [];
    const dkimRecords = dkim || [];
    
    const spfRec = txtRecords.find(r => r.data.includes('v=spf1'));
    const dmarcRec = dmarcRecords.find(r => r.data.includes('v=DMARC1'));
    const dkimRec = dkimRecords.find(r => r.data.includes('v=DKIM1'));
    
    const hasSPF = dq.spf && spfRec;
    const hasDMARC = dq.dmarc && dmarcRec;
    const hasDKIM = dq.dkim && dkimRec;
    
    if (hasSPF || hasDMARC || hasDKIM) {
      html += `
        <div class="dns-group-card">
          <div class="dns-group-header no-copy">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>${I18n.t('dns_group_security')}</span>
          </div>`;
      
      if (hasSPF) {
        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label" style="color: var(--success-text); border-color: var(--success-text); background: var(--success-bg);">SPF</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="result-value dns-record-value">${Utils.escapeHTML(spfRec.data)}</div>
          </div>`;
      }
      
      if (hasDKIM) {
        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label" style="color: var(--success-text); border-color: var(--success-text); background: var(--success-bg);">DKIM</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="result-value dns-record-value">${Utils.escapeHTML(dkimRec.data)}</div>
          </div>`;
      }
      
      if (hasDMARC) {
        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label" style="color: var(--success-text); border-color: var(--success-text); background: var(--success-bg);">DMARC</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="result-value dns-record-value">${Utils.escapeHTML(dmarcRec.data)}</div>
          </div>`;
      }
      
      html += `</div>`;
    }
    
    // Group 4: Other TXT Records (TXT)
    const otherTxt = txtRecords.filter(r => r !== spfRec && !r.data.includes('v=DKIM1')).map(r => r.data);
    const hasTXT = dq.txt && otherTxt.length > 0;
    
    if (hasTXT) {
      html += `
        <div class="dns-group-card">
          <div class="dns-group-header no-copy">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>${I18n.t('dns_group_txt')}</span>
          </div>`;
      
      otherTxt.forEach(data => {
        html += `
          <div class="result-row dns-record-block">
            <div class="dns-record-header no-copy">
              <span class="dns-record-label">TXT</span>
              <span class="dns-record-copy-indicator no-copy">
                <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="result-value dns-record-value">${Utils.escapeHTML(data)}</div>
          </div>`;
      });
      
      html += `</div>`;
    }
    
    html += '</div>';
    return html;
  },

  row(label, content) {
    if (!content || content === '—') {
      return '';
    }
    return `
      <div class="result-row">
        <div class="result-label">${label}</div>
        <div class="result-value">${content}</div>
      </div>`;
  },

  formatMX(records) {
    if (!records?.length) {
      return '—';
    }
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
      return `
        <div class="results-container animate-fade-in-up">
          <div class="dns-group-card">
            <div class="dns-group-header no-copy">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              <span>IP Info</span>
            </div>
            <div class="result-row dns-record-block">
              <div class="dns-record-header no-copy">
                <span class="dns-record-label">IP</span>
                <span class="dns-record-copy-indicator no-copy">
                  <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </div>
              <div class="result-value dns-record-value">${Utils.escapeHTML(ip)}</div>
            </div>
          </div>
        </div>`;
    }
    
    let html = `
      <div class="results-container animate-fade-in-up">
        <div class="dns-group-card">
          <div class="dns-group-header no-copy">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>IP Info</span>
          </div>`;
    
    html += `
      <div class="result-row dns-record-block">
        <div class="dns-record-header no-copy">
          <span class="dns-record-label">IP</span>
          <span class="dns-record-copy-indicator no-copy">
            <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        </div>
        <div class="result-value dns-record-value">${Utils.escapeHTML(ip)}</div>
      </div>`;
      
    html += `
      <div class="result-row dns-record-block">
        <div class="dns-record-header no-copy">
          <span class="dns-record-label">Location</span>
          <span class="dns-record-copy-indicator no-copy">
            <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        </div>
        <div class="geo-badge no-copy">${Utils.getFlagEmoji(geo.countryCode)} ${Utils.escapeHTML(geo.country)}, ${Utils.escapeHTML(geo.regionName)}</div>
        <div class="result-value dns-record-value">${Utils.escapeHTML(geo.city)}</div>
      </div>`;
      
    html += `
      <div class="result-row dns-record-block">
        <div class="dns-record-header no-copy">
          <span class="dns-record-label">ISP / Organization</span>
          <span class="dns-record-copy-indicator no-copy">
            <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        </div>
        <div class="result-value dns-record-value">${Utils.escapeHTML(geo.isp)}${geo.org && geo.org !== geo.isp ? ' (' + Utils.escapeHTML(geo.org) + ')' : ''}</div>
      </div>`;
      
    html += `
      <div class="result-row dns-record-block">
        <div class="dns-record-header no-copy">
          <span class="dns-record-label">AS</span>
          <span class="dns-record-copy-indicator no-copy">
            <svg class="copy-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        </div>
        <div class="result-value dns-record-value">${Utils.escapeHTML(geo.as)}</div>
      </div>`;
      
    html += '</div></div>';
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


