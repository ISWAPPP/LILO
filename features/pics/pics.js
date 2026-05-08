// features/pics/pics.js — PICS tab module (image uploading).
 
import { Api } from '../../core/api.js';
import { Utils } from '../../core/utils.js';
import { TabManager } from '../../core/tabs.js';
import { PicsRenderer } from './pics-renderer.js';
import { I18n } from '../../core/i18n.js';
 
export function initPicsFeature() {
  const statusBox = document.getElementById('pics-output');
  const uploadZone = document.getElementById('upload_zone');
  const fileInput = document.getElementById('pics-file-input');
  const historyContainer = document.getElementById('pics-history-container');
  let uploadHistory = [];
 
  const loadHistory = async () => {
    return new Promise(resolve => {
      chrome.storage.local.get('lilo_pics_history', res => {
        resolve(res.lilo_pics_history || []);
      });
    });
  };
 
  const saveHistory = async (history) => {
    return new Promise(resolve => {
      chrome.storage.local.set({ lilo_pics_history: history }, resolve);
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
      statusBox.innerHTML = PicsRenderer.preview(e.target.result);
      
      const url = await Api.uploadImage(file);
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
    const picsTab = document.getElementById('pics-tab');
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
    
    const picsTab = document.getElementById('pics-tab');
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
    const item = e.target.closest('.pics-history-item');
    if (item && item.dataset.url) {
      const ok = await Utils.copyToClipboard(item.dataset.url);
      if (ok) {
        item.style.borderColor = 'var(--success-text)';
        setTimeout(() => { item.style.borderColor = 'var(--border-light)'; }, 800);
      }
    }
  });

  // Block copying on PICS tab
  const blockCopy = (e) => {
    const picsTab = document.getElementById('pics-tab');
    if (picsTab?.classList.contains('active')) {
      e.preventDefault();
    }
  };

  TabManager.register('pics', {
    async init() {
      document.addEventListener('paste', handlePaste);

      document.addEventListener('keydown', (e) => {
        const picsTab = document.getElementById('pics-tab');
        if (!picsTab?.classList.contains('active')) return;
        if (e.ctrlKey && (e.key === 'a' || e.key === 'c')) {
          e.preventDefault();
        }
      });

      document.addEventListener('copy', blockCopy);
      
      uploadHistory = await loadHistory();
      renderHistory();
    },

    onActivate() {
      document.getElementById('pics-tab')?.classList.add('no-select');
    },

    onDeactivate() {
      document.getElementById('pics-tab')?.classList.remove('no-select');
    },
  });
}
