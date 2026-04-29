// core/tabs.js — реєстр вкладок. Фічі реєструють себе через register().

import { Settings } from './settings.js';

const registry = new Map();
let activeTab = null;

export const TabManager = {
  /**
   * Реєструє вкладку з хендлером.
   * @param {string} name — data-tab значення
   * @param {{ init?: Function, onActivate?: Function, onDeactivate?: Function }} handler
   */
  register(name, handler) {
    registry.set(name, handler);
  },

  /** Ініціалізує UI вкладок і викликає init() на всіх зареєстрованих фічах. */
  init(initialTab = null) {
    document.querySelectorAll('.tab-link').forEach(btn => {
      btn.addEventListener('click', () => this.switchTo(btn.dataset.tab));
    });

    // Ініціалізація всіх зареєстрованих фіч
    for (const [, handler] of registry) {
      handler.init?.();
    }

    if (initialTab) {
      this.switchTo(initialTab, true); // true = don't save to storage initially
    } else {
      // Активувати дефолтну вкладку
      const defaultBtn = document.querySelector('.tab-link.active');
      if (defaultBtn) {
        activeTab = defaultBtn.dataset.tab;
        registry.get(activeTab)?.onActivate?.();
      }
    }
  },

  switchTo(name, skipSave = false) {
    if (name === activeTab) return;

    // Деактивувати поточну
    if (activeTab) {
      registry.get(activeTab)?.onDeactivate?.();
    }

    // Переключити UI
    document.querySelectorAll('.tab-link, .tab-content')
      .forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-tab="${name}"]`)?.classList.add('active');
    document.getElementById(`${name}-tab`)?.classList.add('active');

    activeTab = name;
    registry.get(name)?.onActivate?.();

    if (!skipSave && name !== 'settings') {
      Settings.setLastTab(name);
    }
  },
};
