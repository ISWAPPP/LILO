// core/tabs.js — tab registry. Features register themselves via register().

import { Settings } from './settings.js';

const registry = new Map();
const initialized = new Set();
let activeTab = null;

export const TabManager = {
  /**
   * Registers a tab with a handler.
   * @param {string} name — data-tab value
   * @param {{ init?: Function, onActivate?: Function, onDeactivate?: Function }} handler
   */
  register(name, handler) {
    registry.set(name, handler);
  },

  tabLoadTimes: {},

  /** Initializes tab UI and sets up lazy loading. */
  async init(initialTab = null) {
    document.querySelectorAll('.tab-link').forEach(btn => {
      btn.addEventListener('click', () => this.switchTo(btn.dataset.tab));
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        if (e.key === '1') this.switchTo('dns');
        else if (e.key === '2') this.switchTo('pics');
        else if (e.key === '3') this.switchTo('notes');
        else if (e.key === '4') this.switchTo('settings');
      }
    });

    if (initialTab) {
      await this.switchTo(initialTab, true); // true = don't save to storage initially
    } else {
      // Activate default tab
      const defaultBtn = document.querySelector('.tab-link.active');
      if (defaultBtn) {
        await this.switchTo(defaultBtn.dataset.tab, true);
      }
    }
  },

  async switchTo(name, skipSave = false) {
    if (name === activeTab) return;

    const handler = registry.get(name);

    // Deactivate current
    if (activeTab) {
      registry.get(activeTab)?.onDeactivate?.();
    }

    // Switch UI
    document.querySelectorAll('.tab-link, .tab-content')
      .forEach(el => el.classList.remove('active'));
    
    const newBtn = document.querySelector(`[data-tab="${CSS.escape(name)}"]`);
    newBtn?.classList.add('active');
    
    const slider = document.getElementById('tab-slider');
    if (slider && newBtn) {
      slider.style.width = `${newBtn.offsetWidth}px`;
      slider.style.left = `${newBtn.offsetLeft}px`;
    }

    document.getElementById(`${name}-tab`)?.classList.add('active');

    activeTab = name;

    // Lazily initialize the tab if not done already
    if (handler && !initialized.has(name)) {
      const start = performance.now();
      initialized.add(name);
      await handler.init?.();
      const duration = performance.now() - start;
      this.tabLoadTimes[name] = duration;
      this.onTabInitialized?.(name, duration);
    }

    handler?.onActivate?.();

    if (!skipSave && name !== 'settings') {
      Settings.setLastTab(name);
    }
  },
};
