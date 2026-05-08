import { I18n } from '../../core/i18n.js';
 
export const PicsRenderer = {
  loading() {
    return `<div class="loader"></div><p>${I18n.t('pics_loading')}</p>`;
  },
 
  preview(dataUrl) {
    return `
      <div class="img-preview" style="text-align:center; position:relative; opacity:0.7; margin-top: 10px;">
         <img src="${dataUrl}" style="max-width:100%; max-height:200px; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
         <div class="loader" style="position:absolute; top:50%; left:50%; margin: -16px 0 0 -16px; border-width:3px;"></div>
      </div>
    `;
  },
 
  success(url) {
    return `
      <div class="img-result">
        <p class="img-success">✅ ${I18n.t('copied')}</p>
        <img src="${url}" alt="Uploaded" style="max-height: 250px; object-fit: contain;">
        <input value="${url}" readonly class="img-url-input">
      </div>`;
  },
 
  error(msg) {
    const errorMsg = msg || I18n.t('pics_error_failed');
    return `<div class="msg error" style="margin-top: 10px;">${errorMsg}</div>`;
  },
 
  history(items) {
    if (!items || items.length === 0) return '';
    return `
      <h4 style="margin: 15px 0 5px; font-size: 12px; color: var(--text-muted); text-transform: uppercase;" data-i18n="pics_history_title">${I18n.t('pics_history_title')}</h4>
      <div class="pics-history-grid" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; scrollbar-width: none;">
         ${items.map(item => `
          <div class="pics-history-item" data-url="${item.url}" style="width: 50px; height: 50px; flex-shrink: 0; cursor: pointer; border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; position: relative; transition: all 0.2s;">
            <img src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;" title="${I18n.t('pics_click_to_copy')}">
          </div>
        `).join('')}
      </div>
    `;
  }
};
