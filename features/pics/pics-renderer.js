import { I18n } from '../../core/i18n.js';
import { Utils } from '../../core/utils.js';
 
export const PicsRenderer = {
  loading() {
    return `<div class="loader"></div><p>${I18n.t('pics_loading')}</p>`;
  },
 
  preview(dataUrl, percent = 0) {
    const safeUrl = Utils.escapeHTML(dataUrl);
    const width = Math.max(0, Math.min(100, percent));
    return `
      <div class="img-preview" style="text-align:center; position:relative; margin-top: 10px;">
         <img src="${safeUrl}" style="max-width:100%; max-height:200px; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); opacity:0.85;">
         <div class="pics-upload-progress" style="margin-top: 10px;">
           <div class="pics-upload-progress-track">
             <div class="pics-upload-progress-bar" style="width: ${width}%;"></div>
           </div>
           <p class="pics-upload-progress-label">${I18n.t('pics_uploading')} ${width}%</p>
         </div>
      </div>
    `;
  },
 
  success(url) {
    const safeUrl = Utils.escapeHTML(url);
    return `
      <div class="img-result" style="position: relative;">
        <button id="close-pics-success" style="position: absolute; top: 6px; right: 8px; background: transparent; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        <p class="img-success" style="display: flex; align-items: center; justify-content: center; gap: 4px; color: var(--success-text); margin-top: 0;">
          <svg class="icon icon-inline icon-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${I18n.t('copied')}</span>
        </p>
        <img src="${safeUrl}" alt="Uploaded" style="max-height: 250px; object-fit: contain;">
        <input value="${safeUrl}" readonly class="img-url-input">
      </div>`;
  },
 
  error(msg) {
    const errorMsg = msg || I18n.t('pics_error_failed');
    return `
      <div class="msg error" style="margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <svg class="icon icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${errorMsg}</span>
      </div>`;
  },
 
  history(items) {
    if (!items || items.length === 0) return '';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin: 15px 0 5px;">
        <h4 style="margin: 0; font-size: 12px; color: var(--text-muted); text-transform: uppercase;" data-i18n="pics_history_title">${I18n.t('pics_history_title')}</h4>
        <button id="clear-pics-history" style="background:transparent; border:none; padding:0; color:var(--text-muted); cursor:pointer; display:flex; align-items:center;" title="${I18n.t('clear')}">
           <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="pics-history-grid" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; scrollbar-width: none;">
         ${items.map(item => {
          const safeUrl = Utils.escapeHTML(item.url);
          return `
           <div class="pics-history-item" data-url="${safeUrl}" style="width: 50px; height: 50px; flex-shrink: 0; cursor: pointer; border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; position: relative; transition: all 0.2s;">
             <img src="${safeUrl}" style="width: 100%; height: 100%; object-fit: cover;" title="${I18n.t('pics_click_to_copy')}">
             <div class="copy-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; color:var(--success-text);">
               <svg class="icon icon-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
           </div>
         `;
         }).join('')}
      </div>
    `;
  }
};
