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
  
  let password = '';
  const array = new Uint8Array(1);
  const maxValid = 256 - (256 % charset.length);

  while (password.length < length) {
    crypto.getRandomValues(array);
    if (array[0] < maxValid) {
      password += charset[array[0] % charset.length];
    }
  }

  return password;
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

  notes.unshift({ id: crypto.randomUUID(), text: trimmed });
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
    // Empty text = deletion
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

  // Visual feedback
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

  // Focus on input
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

    // Save button
    if (e.target.closest('.note-save-btn')) {
      const input = item.querySelector('.note-edit-input');
      updateNote(id, input?.value || '');
      return;
    }

    // Click on text = copy
    if (e.target.closest('.note-text')) {
      copyNote(id);
      return;
    }
  });

  list.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('note-edit-input')) {
      e.preventDefault(); // Prevent adding new line
      const item = e.target.closest('.note-item');
      const id = item?.dataset.id;
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

      // Click on password = copy (like notes)
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
    },
  });
}
