// features/notes/notes.js — NOTES tab module (password generator + notes).

import { Config } from '../../config.js';
import { Utils } from '../../core/utils.js';
import { TabManager } from '../../core/tabs.js';
import { NotesRenderer } from './notes-renderer.js';
import { Settings } from '../../core/settings.js';

// ==================== STORAGE ====================

async function loadNotes() {
  return new Promise((resolve) => {
    chrome.storage.local.get(Config.storage.notesKey, (result) => {
      resolve(result[Config.storage.notesKey] || []);
    });
  });
}

const _saveNotes = async () => {
  return new Promise(resolve => {
    chrome.storage.local.set({ [Config.storage.notesKey]: notes }, resolve);
  });
};
const saveNotes = Utils.debounce(_saveNotes, 500);

// ==================== PASSWORD GENERATOR ====================

function generatePassword() {
  const cfg = Config.passgen;
  let charset = '';

  if (document.getElementById('opt-lower')?.checked) {
    charset += cfg.charsets.lower;
  }
  if (document.getElementById('opt-upper')?.checked) {
    charset += cfg.charsets.upper;
  }
  if (document.getElementById('opt-numbers')?.checked) {
    charset += cfg.charsets.numbers;
  }
  if (document.getElementById('opt-symbols')?.checked) {
    charset += cfg.charsets.symbols;
  }

  if (!charset) {
    charset = cfg.charsets.lower; // Fallback
  }

  if (document.getElementById('opt-no-similar')?.checked) {
    const similar = new Set(cfg.similarChars.split(''));
    charset = [...charset].filter(ch => !similar.has(ch)).join('');
    if (!charset) {
      charset = cfg.charsets.lower;
    }
  }

  const length = parseInt(document.getElementById('passgen-length')?.value, 10) || cfg.defaultLength;
  
  let password = '';
  const bufferSize = Math.max(length * 2, 64);
  const array = new Uint8Array(bufferSize);
  const maxValid = 256 - (256 % charset.length);
  
  let bufferIndex = 0;
  crypto.getRandomValues(array);

  while (password.length < length) {
    if (bufferIndex >= array.length) {
      crypto.getRandomValues(array);
      bufferIndex = 0;
    }
    const val = array[bufferIndex++];
    if (val < maxValid) {
      password += charset[val % charset.length];
    }
  }

  return password;
}

function calculateStrength(password, opts) {
  let score = 0;
  if (password.length >= 6) {
    score += 1;
  }
  if (password.length >= 10) {
    score += 1;
  }
  if (password.length >= 14) {
    score += 1;
  }
  
  let variety = 0;
  if (opts.lower) {
    variety++;
  }
  if (opts.upper) {
    variety++;
  }
  if (opts.numbers) {
    variety++;
  }
  if (opts.symbols) {
    variety++;
  }
  
  if (variety >= 3) {
    score += 1;
  }
  if (variety === 4) {
    score += 1;
  }

  const meter = document.getElementById('passgen-strength-meter');
  if (!meter) {
    return;
  }

  meter.className = 'passgen-strength-meter'; // reset
  if (password.length === 0) {
    // do nothing
  } else if (score <= 2) {
    meter.classList.add('weak');
  } else if (score <= 3) {
    meter.classList.add('medium');
  } else if (score <= 4) {
    meter.classList.add('strong');
  } else {
    meter.classList.add('very-strong');
  }
}

function refreshPassword() {
  const output = document.getElementById('passgen-result');
  if (output) {
    const pass = generatePassword();
    output.value = pass;
    
    const opts = {
      lower: document.getElementById('opt-lower')?.checked,
      upper: document.getElementById('opt-upper')?.checked,
      numbers: document.getElementById('opt-numbers')?.checked,
      symbols: document.getElementById('opt-symbols')?.checked,
    };
    calculateStrength(pass, opts);
  }
}

// ==================== NOTES LOGIC ====================

let notes = [];
let passwordInitialized = false;

async function renderNotes() {
  const list = document.getElementById('notes-list');
  if (!list) {
    return;
  }
  list.innerHTML = NotesRenderer.notesList(notes);
}

async function addNote(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  notes.unshift({ id: crypto.randomUUID(), text: trimmed });
  saveNotes();
  renderNotes();
}

async function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

async function updateNoteWithColor(id, newText, color, lines) {
  if (!newText.trim()) {
    // Empty text = deletion
    notes = notes.filter(n => n.id !== id);
  } else {
    const note = notes.find(n => n.id === id);
    if (note) {
      note.text = newText.trim();
      note.color = color;
      if (lines !== undefined) {
        note.lines = lines;
      }
    }
  }
  saveNotes();
  renderNotes();
}

async function moveNoteUp(id) {
  const index = notes.findIndex(n => n.id === id);
  if (index > 0) {
    [notes[index - 1], notes[index]] = [notes[index], notes[index - 1]];
    saveNotes();
    renderNotes();
  }
}

async function moveNoteDown(id) {
  const index = notes.findIndex(n => n.id === id);
  if (index < notes.length - 1) {
    [notes[index + 1], notes[index]] = [notes[index], notes[index + 1]];
    saveNotes();
    renderNotes();
  }
}

async function copyNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) {
    return;
  }

  const ok = await Utils.copyToClipboard(note.text);
  if (!ok) {
    return;
  }

  // Visual feedback
  const item = document.querySelector(`.note-item[data-id="${id}"]`);
  if (item) {
    item.classList.add('copied');
    setTimeout(() => item.classList.remove('copied'), 800);
  }
}

function startEditing(id) {
  const note = notes.find(n => n.id === id);
  if (!note) {
    return;
  }

  const item = document.querySelector(`.note-item[data-id="${id}"]`);
  if (!item) {
    return;
  }

  item.outerHTML = NotesRenderer.noteItemEditing(note);

  // Focus on input
  const newItem = document.querySelector(`.note-item[data-id="${id}"]`);
  if (newItem && note.color) {
    newItem.style.backgroundColor = note.color;
    newItem.style.setProperty('--note-bg', note.color);
    newItem.style.setProperty('--note-text', '#1a1a1a');
    newItem.style.setProperty('--note-btn-hover-bg', 'rgba(0, 0, 0, 0.08)');
  }
  const input = newItem ? newItem.querySelector('.note-edit-input') : null;
  if (input) {
    input.focus();
    input.selectionStart = input.value.length;
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight + 2) + 'px';
  }
}

// ==================== EVENT DELEGATION ====================

function setupNoteEvents() {
  const list = document.getElementById('notes-list');
  if (!list) {
    return;
  }

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.note-item');
    if (!item) {
      return;
    }
    const id = item.dataset.id;

    // Edit button
    if (e.target.closest('.note-edit-btn')) {
      startEditing(id);
      return;
    }

    // Delete button
    if (e.target.closest('.note-delete-btn')) {
      deleteNote(id);
      return;
    }

    // Color swatch click
    if (e.target.closest('.color-swatch')) {
      const swatch = e.target.closest('.color-swatch');
      const color = swatch.dataset.color;
      if (color) {
        item.style.backgroundColor = color;
        item.style.setProperty('--note-bg', color);
        item.style.setProperty('--note-text', '#1a1a1a');
        item.style.setProperty('--note-btn-hover-bg', 'rgba(0, 0, 0, 0.08)');
      } else {
        item.style.backgroundColor = '';
        item.style.removeProperty('--note-bg');
        item.style.removeProperty('--note-text');
        item.style.removeProperty('--note-btn-hover-bg');
      }
      item.dataset.selectedColor = color;
      return;
    }

    // Move Up
    if (e.target.closest('.note-move-up-btn')) {
      moveNoteUp(id);
      return;
    }

    // Move Down
    if (e.target.closest('.note-move-down-btn')) {
      moveNoteDown(id);
      return;
    }

    // Cancel button
    if (e.target.closest('.note-cancel-btn')) {
      renderNotes();
      return;
    }

    // Save button
    if (e.target.closest('.note-save-btn')) {
      const input = item.querySelector('.note-edit-input');
      const slider = item.querySelector('.note-height-slider');
      const lines = slider ? parseInt(slider.value, 10) : 20;
      const color = item.dataset.selectedColor !== undefined ? item.dataset.selectedColor : (notes.find(n => n.id === id)?.color || '');
      updateNoteWithColor(id, input?.value || '', color, lines);
      return;
    }

    // Click on text = copy
    if (e.target.closest('.note-text')) {
      copyNote(id);
      return;
    }
  });

  list.addEventListener('input', (e) => {
    if (e.target.classList.contains('note-edit-input')) {
      e.target.style.height = 'auto';
      e.target.style.height = (e.target.scrollHeight + 2) + 'px';
    }
    if (e.target.classList.contains('note-height-slider')) {
      const item = e.target.closest('.note-item');
      const valEl = item ? item.querySelector('.range-val') : null;
      if (valEl) {
        valEl.textContent = e.target.value;
      }
    }
  });

  list.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && e.target.classList.contains('note-edit-input')) {
      renderNotes();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('note-edit-input')) {
      e.preventDefault(); // Prevent adding new line
      const item = e.target.closest('.note-item');
      const id = item?.dataset.id;
      const slider = item?.querySelector('.note-height-slider');
      const lines = slider ? parseInt(slider.value, 10) : 20;
      const color = item?.dataset.selectedColor !== undefined ? item.dataset.selectedColor : (notes.find(n => n.id === id)?.color || '');
      updateNoteWithColor(id, e.target.value || '', color, lines);
    }
  });
}

// ==================== INIT ====================

export function initNotesFeature() {
  TabManager.register('notes', {
    async init() {
      // Load saved passgen settings
      const settings = await Settings.load();
      const pg = settings.passgen;

      const elLower = document.getElementById('opt-lower');
      const elUpper = document.getElementById('opt-upper');
      const elNum = document.getElementById('opt-numbers');
      const elSym = document.getElementById('opt-symbols');
      const elNoSimilar = document.getElementById('opt-no-similar');
      const lengthSlider = document.getElementById('passgen-length');
      const lengthVal = document.getElementById('passgen-length-val');

      if (elLower) {
        elLower.checked = pg.lower;
      }
      if (elUpper) {
        elUpper.checked = pg.upper;
      }
      if (elNum) {
        elNum.checked = pg.numbers;
      }
      if (elSym) {
        elSym.checked = pg.symbols;
      }
      if (elNoSimilar) {
        elNoSimilar.checked = pg.excludeSimilar;
      }
      if (lengthSlider) {
        lengthSlider.value = pg.length;
      }
      if (lengthVal) {
        lengthVal.textContent = pg.length;
      }

      const savePassgenSettings = async () => {
        const current = await Settings.load();
        await Settings.save({
          ...current,
          passgen: {
            lower: elLower?.checked,
            upper: elUpper?.checked,
            numbers: elNum?.checked,
            symbols: elSym?.checked,
            excludeSimilar: elNoSimilar?.checked,
            length: parseInt(lengthSlider?.value, 10) || 16
          }
        });
      };

      // Password generator events
      const passgenOptions = ['opt-lower', 'opt-upper', 'opt-numbers', 'opt-symbols', 'opt-no-similar'];
      passgenOptions.forEach(optId => {
        document.getElementById(optId)?.addEventListener('change', () => {
          savePassgenSettings();
          refreshPassword();
        });
      });

      if (lengthSlider) {
        lengthSlider.addEventListener('input', () => {
          if (lengthVal) lengthVal.textContent = lengthSlider.value;
          savePassgenSettings();
          refreshPassword();
        });
      }

      // Click on password = copy (like notes)
      const passgenResult = document.getElementById('passgen-result');
      passgenResult?.addEventListener('click', async () => {
        if (!passgenResult.value) {
          return;
        }
        const ok = await Utils.copyToClipboard(passgenResult.value);
        if (ok) {
          const section = passgenResult.closest('.passgen-section');
          section?.classList.add('copied');
          setTimeout(() => section?.classList.remove('copied'), 800);
        }
      });

      document.getElementById('passgen-refresh')?.addEventListener('click', refreshPassword);

      // Notes add
      const addBtn = document.getElementById('note-add-btn');
      const addInput = document.getElementById('note-input');

      addBtn?.addEventListener('click', () => {
        addNote(addInput?.value || '');
        if (addInput) {
          addInput.value = '';
          addInput.style.height = ''; // reset to default
        }
      });

      addInput?.addEventListener('input', () => {
        addInput.style.height = 'auto';
        addInput.style.height = (addInput.scrollHeight + 2) + 'px';
        if (!addInput.value) {
           addInput.style.height = ''; // reset to default
        }
      });

      addInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          addNote(addInput.value);
          addInput.value = '';
          addInput.style.height = ''; // reset to default
        }
      });

      // Event delegation for notes list
      setupNoteEvents();

      // Load notes from storage
      notes = await loadNotes();
      renderNotes();

      // Generate initial password
      refreshPassword();
    },

    onActivate() {
      document.getElementById('note-input')?.focus();
      if (!passwordInitialized) {
        refreshPassword();
        passwordInitialized = true;
      }
    },
  });
}
