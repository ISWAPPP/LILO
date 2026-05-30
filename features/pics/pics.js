// features/pics/pics.js — PICS tab module (image uploading).
 
import { Api } from '../../core/api.js';
import { Utils } from '../../core/utils.js';
import { TabManager } from '../../core/tabs.js';
import { PicsRenderer } from './pics-renderer.js';
import { I18n } from '../../core/i18n.js';
import { Config } from '../../config.js';
 
export function initPicsFeature() {
  const statusBox = document.getElementById('pics-output');
  const uploadZone = document.getElementById('upload_zone');
  const fileInput = document.getElementById('pics-file-input');
  const historyContainer = document.getElementById('pics-history-container');
  const picsTab = document.getElementById('pics-tab');
  let uploadHistory = [];
 
  const loadHistory = async () => {
    return new Promise(resolve => {
      chrome.storage.local.get(Config.storage.picsHistoryKey, res => {
        resolve(res[Config.storage.picsHistoryKey] || []);
      });
    });
  };
 
  const saveHistory = async (history) => {
    return new Promise(resolve => {
      chrome.storage.local.set({ [Config.storage.picsHistoryKey]: history }, resolve);
    });
  };
 
  const renderHistory = () => {
    if (historyContainer) {
      historyContainer.innerHTML = PicsRenderer.history(uploadHistory);
    }
  };
 
  const processFile = async (file) => {
    if (!file || !file.type.includes('image')) return;
 
    if (file.size > 10 * 1024 * 1024) {
      statusBox.innerHTML = PicsRenderer.error(I18n.t('pics_error_too_large'));
      return;
    }
 
    // Check offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
       statusBox.innerHTML = PicsRenderer.error(I18n.t('pics_error_no_internet'));
       return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      statusBox.innerHTML = PicsRenderer.preview(dataUrl, 0);

      const url = await Api.uploadImage(file, (percent) => {
        statusBox.innerHTML = PicsRenderer.preview(dataUrl, percent);
      });
      if (url) {
        await Utils.copyToClipboard(url);
        statusBox.innerHTML = PicsRenderer.success(url);
        
        // Add to history
        uploadHistory.unshift({ url, date: Date.now() });
        if (uploadHistory.length > 5) uploadHistory.pop();
        await saveHistory(uploadHistory);
        renderHistory();
      } else {
        statusBox.innerHTML = PicsRenderer.error();
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e) => {
    if (!picsTab?.classList.contains('active')) return;

    const item = Array.from(e.clipboardData.items).find(i => i.type.includes('image'));
    if (!item) return;

    const blob = item.getAsFile();
    await processFile(blob);
  };

  // Drag and Drop
  uploadZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--accent)';
    uploadZone.style.background = 'var(--bg-tertiary)';
  });

  uploadZone?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });

  uploadZone?.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    
    if (!picsTab?.classList.contains('active')) return;

    const file = Array.from(e.dataTransfer.files).find(f => f.type.includes('image'));
    if (file) {
      await processFile(file);
    }
  });

  // Click to upload
  uploadZone?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
    // reset input
    if (fileInput) fileInput.value = '';
  });

  // History click
  historyContainer?.addEventListener('click', async (e) => {
    if (e.target.closest('#clear-pics-history')) {
      uploadHistory = [];
      await saveHistory(uploadHistory);
      renderHistory();
      return;
    }

    const item = e.target.closest('.pics-history-item');
    if (item && item.dataset.url) {
      const ok = await Utils.copyToClipboard(item.dataset.url);
      if (ok) {
        const overlay = item.querySelector('.copy-overlay');
        item.style.borderColor = 'var(--success-text)';
        if (overlay) overlay.style.opacity = '1';
        setTimeout(() => { 
          item.style.borderColor = 'var(--border-light)'; 
          if (overlay) overlay.style.opacity = '0';
        }, 800);
      }
    }
  });

  // Block copying on PICS tab
  const blockCopy = (e) => {
    if (picsTab?.classList.contains('active')) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    }
  };

  TabManager.register('pics', {
    async init() {
      // Prevent browser from opening dragged files when dropped outside upload zone
      window.addEventListener('dragover', (e) => {
        if (picsTab?.classList.contains('active')) e.preventDefault();
      }, false);
      window.addEventListener('drop', (e) => {
        if (picsTab?.classList.contains('active')) e.preventDefault();
      }, false);

      document.addEventListener('paste', handlePaste);

      document.addEventListener('keydown', (e) => {
        if (!picsTab?.classList.contains('active')) return;
        if (e.ctrlKey && (e.key === 'a' || e.key === 'c')) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          e.preventDefault();
        }
      });

      document.addEventListener('copy', blockCopy);
      
      uploadHistory = await loadHistory();
      renderHistory();
    },

    onActivate() {
      picsTab?.classList.add('no-select');
    },

    onDeactivate() {
      picsTab?.classList.remove('no-select');
    },
  });
}
