// core/tabs.js — tab registry. Features register themselves via register().

import { Settings } from './settings.js';

const registry = new Map();
const lazyLoaders = new Map();
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

  /** Registers a lazy loader callback for a tab. */
  registerLazy(name, loader) {
    lazyLoaders.set(name, loader);
  },

  tabLoadTimes: {},

  /** Initializes tab UI and sets up lazy loading. */
  async init(initialTab = null) {
    document.querySelectorAll('.tab-link').forEach(btn => {
      btn.addEventListener('click', () => this.switchTo(btn.dataset.tab));
    });

    const tabByCode = { Digit1: 'dns', Digit2: 'pics', Digit3: 'notes', Digit4: 'settings' };
    document.addEventListener('keydown', async (e) => {
      const tab = tabByCode[e.code]; // e.code ignores keyboard layout and Mac Option symbols
      if (!tab || e.shiftKey || e.metaKey) {
        return;
      }
      const { tabShortcutModifier: mod = 'off' } = await Settings.load();
      if ((mod === 'alt' && e.altKey && !e.ctrlKey) || (mod === 'ctrl' && e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        this.switchTo(tab);
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
    if (name === activeTab) {
      return;
    }

    // Deactivate current
    if (activeTab) {
      registry.get(activeTab)?.onDeactivate?.();
    }

    // Switch UI
    document.querySelectorAll('.tab-link, .tab-content')
      .forEach(el => {
        el.classList.remove('active');
      });
    
    const newBtn = document.querySelector(`[data-tab="${CSS.escape(name)}"]`);
    newBtn?.classList.add('active');
    
    const slider = document.getElementById('tab-slider');
    if (slider && newBtn) {
      slider.style.width = `${newBtn.offsetWidth}px`;
      slider.style.left = `${newBtn.offsetLeft}px`;
    }

    document.getElementById(`${name}-tab`)?.classList.add('active');

    activeTab = name;

    // Lazily import the feature module if registered as lazy and not loaded yet
    if (lazyLoaders.has(name) && !registry.has(name)) {
      await lazyLoaders.get(name)();
    }

    const handler = registry.get(name);

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

