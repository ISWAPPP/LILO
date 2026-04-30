// features/pics/pics.js — PICS tab module (image uploading).

import { Api } from '../../core/api.js';
import { Utils } from '../../core/utils.js';
import { TabManager } from '../../core/tabs.js';
import { PicsRenderer } from './pics-renderer.js';

export function initPicsFeature() {
  const statusBox = document.getElementById('pics-output');

  const handlePaste = async (e) => {
    // Handle paste only when PICS tab is active
    const picsTab = document.getElementById('pics-tab');
    if (!picsTab?.classList.contains('active')) return;

    const item = Array.from(e.clipboardData.items).find(i => i.type.includes('image'));
    if (!item) return;

    statusBox.innerHTML = PicsRenderer.loading();

    const blob = item.getAsFile();
    const url = await Api.uploadImage(blob);

    if (url) {
      await Utils.copyToClipboard(url);
      statusBox.innerHTML = PicsRenderer.success(url);
    } else {
      statusBox.innerHTML = PicsRenderer.error();
    }
  };

  // Block copying on PICS tab
  const blockCopy = (e) => {
    const picsTab = document.getElementById('pics-tab');
    if (picsTab?.classList.contains('active')) {
      e.preventDefault();
    }
  };

  TabManager.register('pics', {
    init() {
      document.addEventListener('paste', handlePaste);

      // Disable Ctrl+A / Ctrl+C on PICS tab
      document.addEventListener('keydown', (e) => {
        const picsTab = document.getElementById('pics-tab');
        if (!picsTab?.classList.contains('active')) return;
        if (e.ctrlKey && (e.key === 'a' || e.key === 'c')) {
          e.preventDefault();
        }
      });

      document.addEventListener('copy', blockCopy);
    },

    onActivate() {
      document.getElementById('pics-tab')?.classList.add('no-select');
    },

    onDeactivate() {
      document.getElementById('pics-tab')?.classList.remove('no-select');
    },
  });
}
