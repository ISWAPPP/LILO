// features/notes/notes.js — модуль вкладки NOTES (генератор паролів + нотатки).

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

async function saveNotes(notes) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [Config.storage.notesKey]: notes }, resolve);
  });
}

// ==================== PASSWORD GENERATOR ====================

function generatePassword() {
  const cfg = Config.passgen;
  let charset = '';

  if (document.getElementById('opt-lower')?.checked)   charset += cfg.charsets.lower;
  if (document.getElementById('opt-upper')?.checked)   charset += cfg.charsets.upper;
  if (document.getElementById('opt-numbers')?.checked)  charset += cfg.charsets.numbers;
  if (document.getElementById('opt-symbols')?.checked)  charset += cfg.charsets.symbols;

  if (!charset) charset = cfg.charsets.lower; // Fallback

  const length = parseInt(document.getElementById('passgen-length')?.value) || cfg.defaultLength;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (v) => charset[v % charset.length]).join('');
}

function refreshPassword() {
  const output = document.getElementById('passgen-result');
  if (output) output.value = generatePassword();
}

// ==================== NOTES LOGIC ====================

let notes = [];

async function renderNotes() {
  const list = document.getElementById('notes-list');
  if (!list) return;
  list.innerHTML = NotesRenderer.notesList(notes);
}

async function addNote(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (trimmed === 'GETPICS') {
    const settings = await Settings.load();
    if (!settings.picsUnlocked) {
      await Settings.save({ ...settings, picsUnlocked: true });
      const btn = document.getElementById('tab-btn-pics');
      if (btn) btn.style.display = '';
      const opt = document.getElementById('setting-startup-pics');
      if (opt) opt.style.display = '';
    }
    return;
  }

  if (trimmed === 'NOPICS') {
    const settings = await Settings.load();
    if (settings.picsUnlocked) {
      await Settings.save({ ...settings, picsUnlocked: false });
      const btn = document.getElementById('tab-btn-pics');
      if (btn) btn.style.display = 'none';
      const opt = document.getElementById('setting-startup-pics');
      if (opt) opt.style.display = 'none';
      
      if (document.getElementById('pics-tab')?.classList.contains('active')) {
        TabManager.switchTo('dns');
      }
    }
    return;
  }

  notes.unshift({ id: Date.now(), text: trimmed });
  await saveNotes(notes);
  renderNotes();
}

async function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  await saveNotes(notes);
  renderNotes();
}

async function updateNote(id, newText) {
  if (!newText.trim()) {
    // Порожній текст = видалення
    notes = notes.filter(n => n.id !== id);
  } else {
    const note = notes.find(n => n.id === id);
    if (note) note.text = newText.trim();
  }
  await saveNotes(notes);
  renderNotes();
}

async function copyNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  const ok = await Utils.copyToClipboard(note.text);
  if (!ok) return;

  // Візуальний фідбек
  const item = document.querySelector(`.note-item[data-id="${id}"]`);
  if (item) {
    item.classList.add('copied');
    setTimeout(() => item.classList.remove('copied'), 800);
  }
}

function startEditing(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  const item = document.querySelector(`.note-item[data-id="${id}"]`);
  if (!item) return;

  item.outerHTML = NotesRenderer.noteItemEditing(note);

  // Фокус на інпут
  const input = document.querySelector(`.note-item[data-id="${id}"] .note-edit-input`);
  if (input) {
    input.focus();
    input.selectionStart = input.value.length;
  }
}

// ==================== EVENT DELEGATION ====================

function setupNoteEvents() {
  const list = document.getElementById('notes-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.note-item');
    if (!item) return;
    const id = parseInt(item.dataset.id);

    // Кнопка редагування
    if (e.target.closest('.note-edit-btn')) {
      startEditing(id);
      return;
    }

    // Кнопка видалення
    if (e.target.closest('.note-delete-btn')) {
      deleteNote(id);
      return;
    }

    // Кнопка збереження
    if (e.target.closest('.note-save-btn')) {
      const input = item.querySelector('.note-edit-input');
      updateNote(id, input?.value || '');
      return;
    }

    // Клік по тексту = копіювати
    if (e.target.closest('.note-text')) {
      copyNote(id);
      return;
    }
  });

  // Enter в режимі редагування = зберегти (Shift+Enter = новий рядок)
  list.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('note-edit-input')) {
      e.preventDefault(); // Запобігти додаванню нового рядка
      const item = e.target.closest('.note-item');
      const id = parseInt(item?.dataset.id);
      updateNote(id, e.target.value || '');
    }
  });
}

// ==================== INIT ====================

export function initNotesFeature() {
  TabManager.register('notes', {
    async init() {
      // Password generator events
      const passgenOptions = ['opt-lower', 'opt-upper', 'opt-numbers', 'opt-symbols'];
      passgenOptions.forEach(optId => {
        document.getElementById(optId)?.addEventListener('change', refreshPassword);
      });

      const lengthSlider = document.getElementById('passgen-length');
      const lengthVal = document.getElementById('passgen-length-val');
      if (lengthSlider) {
        lengthSlider.addEventListener('input', () => {
          if (lengthVal) lengthVal.textContent = lengthSlider.value;
          refreshPassword();
        });
      }

      // Клік по паролю = скопіювати (як нотатки)
      const passgenResult = document.getElementById('passgen-result');
      passgenResult?.addEventListener('click', async () => {
        if (!passgenResult.value) return;
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
        if (addInput) addInput.value = '';
      });

      addInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          addNote(addInput.value);
          addInput.value = '';
        }
      });

      // Event delegation на список нотаток
      setupNoteEvents();

      // Завантажити нотатки з storage
      notes = await loadNotes();
      renderNotes();

      // Згенерувати початковий пароль
      refreshPassword();
    },

    onActivate() {
      document.getElementById('note-input')?.focus();
    },
  });
}
