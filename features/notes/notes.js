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
  
  let generatedPass = '';
  const bufferSize = Math.max(length * 2, 64);
  const array = new Uint8Array(bufferSize);
  const maxValid = 256 - (256 % charset.length);
  
  let bufferIndex = 0;
  window.crypto.getRandomValues(array);

  while (generatedPass.length < length) {
    if (bufferIndex >= array.length) {
      window.crypto.getRandomValues(array);
      bufferIndex = 0;
    }
    const val = array[bufferIndex++];
    if (val < maxValid) {
      generatedPass += charset[val % charset.length];
    }
  }

  return generatedPass;
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
  const settings = await Settings.load();
  const experimentalActive = settings.experimentalNotes || false;
  
  list.classList.toggle('experimental-active', experimentalActive);
  list.innerHTML = NotesRenderer.notesList(notes, experimentalActive);

  // Calibrate and apply bottom indicators dynamically on mount
  setTimeout(() => {
    list.querySelectorAll('.note-item').forEach(item => {
      updateScrollIndicators(item);
    });
  }, 100);
}

async function addNote(title, text) {
  const trimmed = text.trim();
  const trimmedTitle = title.trim();
  if (!trimmed) {
    return;
  }

  notes.unshift({ 
    id: window.crypto.randomUUID(), 
    title: trimmedTitle, 
    text: trimmed 
  });
  saveNotes();
  renderNotes();
}

async function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

async function updateNoteWithTitleAndColor(id, newTitle, newText, color, lines, width) {
  if (!newText.trim()) {
    // Empty text = deletion
    notes = notes.filter(n => n.id !== id);
  } else {
    const note = notes.find(n => n.id === id);
    if (note) {
      note.title = newTitle.trim();
      note.text = newText.trim();
      note.color = color;
      if (lines !== undefined) {
        note.lines = lines;
      }
      if (width !== undefined) {
        note.width = width;
      }
    }
  }
  saveNotes();
  renderNotes();
}

async function animateReorderAndRender(action) {
  const items = Array.from(document.querySelectorAll('.note-item'));
  const firstPositions = items.map(item => {
    const rect = item.getBoundingClientRect();
    return { id: item.dataset.id, top: rect.top, left: rect.left };
  });

  await action();

  requestAnimationFrame(() => {
    const newItems = Array.from(document.querySelectorAll('.note-item'));
    newItems.forEach(item => {
      const first = firstPositions.find(p => p.id === item.dataset.id);
      if (!first) return;
      
      const lastRect = item.getBoundingClientRect();
      const invertY = first.top - lastRect.top;
      const invertX = first.left - lastRect.left;
      
      if (invertY !== 0 || invertX !== 0) {
        item.style.transform = `translate(${invertX}px, ${invertY}px)`;
        item.style.transition = 'none';
        
        requestAnimationFrame(() => {
          item.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          item.style.transform = '';
        });
      }
    });
  });
}

async function moveNoteUp(id) {
  const index = notes.findIndex(n => n.id === id);
  if (index > 0) {
    await animateReorderAndRender(async () => {
      [notes[index - 1], notes[index]] = [notes[index], notes[index - 1]];
      await saveNotes();
      await renderNotes();
    });
  }
}

async function moveNoteDown(id) {
  const index = notes.findIndex(n => n.id === id);
  if (index < notes.length - 1) {
    await animateReorderAndRender(async () => {
      [notes[index + 1], notes[index]] = [notes[index], notes[index + 1]];
      await saveNotes();
      await renderNotes();
    });
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

async function startEditing(id) {
  const note = notes.find(n => n.id === id);
  if (!note) {
    return;
  }

  const item = document.querySelector(`.note-item[data-id="${id}"]`);
  if (!item) {
    return;
  }

  const settings = await Settings.load();
  const experimentalActive = settings.experimentalNotes || false;

  item.outerHTML = NotesRenderer.noteItemEditing(note, experimentalActive);

  // Focus on input
  const newItem = document.querySelector(`.note-item[data-id="${id}"]`);
  if (newItem && note.color) {
    newItem.style.backgroundColor = note.color;
    newItem.style.setProperty('--note-bg', note.color);
    newItem.style.setProperty('--note-text', '#1a1a1a');
    newItem.style.setProperty('--note-btn-hover-bg', 'rgba(0, 0, 0, 0.08)');
    newItem.style.setProperty('--note-border', 'rgba(0, 0, 0, 0.09)');
  }
  const input = newItem ? newItem.querySelector('.note-edit-input') : null;
  if (input) {
    input.focus();
    input.selectionStart = input.value.length;
    setTimeout(() => {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight + 2}px`;
      updateScrollIndicators(newItem);
    }, 50);
  }
}

function resetDeleteConfirmations() {
  document.querySelectorAll('.note-delete-btn.confirm-delete').forEach(btn => {
    btn.classList.remove('confirm-delete');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  });
}

// Premium scroll indicator update routine
function updateScrollIndicators(item) {
  if (!item) return;
  const textEl = item.querySelector('.note-text');
  const textareaEl = item.querySelector('.note-edit-input');
  const scrollEl = textEl || textareaEl;
  if (!scrollEl) return;
  
  const hasOverflow = scrollEl.scrollHeight > scrollEl.clientHeight;
  const isAtBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 6; // 6px padding tolerance
  
  if (hasOverflow && !isAtBottom) {
    item.classList.add('has-more-content');
  } else {
    item.classList.remove('has-more-content');
  }
}

// ==================== EVENT DELEGATION ====================

function setupNoteEvents() {
  const list = document.getElementById('notes-list');
  if (!list) {
    return;
  }

  // Global click listener to reset delete confirmations
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.note-delete-btn')) {
      resetDeleteConfirmations();
    }
  });

  // Scroll capture listener to update bottom highlights in real-time
  list.addEventListener('scroll', (e) => {
    const scrollEl = e.target;
    if (scrollEl.classList.contains('note-text') || scrollEl.classList.contains('note-edit-input')) {
      const item = scrollEl.closest('.note-item');
      if (item) {
        updateScrollIndicators(item);
      }
    }
  }, true);

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.note-item');
    if (!item) {
      resetDeleteConfirmations();
      return;
    }
    const id = item.dataset.id;

    // Edit button
    if (e.target.closest('.note-edit-btn')) {
      resetDeleteConfirmations();
      startEditing(id);
      return;
    }

    // Copy button
    if (e.target.closest('.note-copy-btn')) {
      e.stopPropagation();
      copyNote(id);
      return;
    }

    // Delete button
    if (e.target.closest('.note-delete-btn')) {
      const btn = e.target.closest('.note-delete-btn');
      if (!btn.classList.contains('confirm-delete')) {
        e.stopPropagation();
        resetDeleteConfirmations();
        btn.classList.add('confirm-delete');
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        return;
      }
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
        item.style.setProperty('--note-border', 'rgba(0, 0, 0, 0.09)');
      } else {
        item.style.backgroundColor = '';
        item.style.removeProperty('--note-bg');
        item.style.removeProperty('--note-text');
        item.style.removeProperty('--note-btn-hover-bg');
        item.style.removeProperty('--note-border');
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
      const titleInput = item.querySelector('.note-edit-title-input');
      const slider = item.querySelector('.note-height-slider');
      const lines = slider ? parseInt(slider.value, 10) : 20;
      const color = item.dataset.selectedColor !== undefined ? item.dataset.selectedColor : (notes.find(n => n.id === id)?.color || '');
      const width = item.dataset.selectedWidth !== undefined ? parseInt(item.dataset.selectedWidth, 10) : (notes.find(n => n.id === id)?.width || 100);
      updateNoteWithTitleAndColor(id, titleInput?.value || '', input?.value || '', color, lines, width);
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
      e.target.style.height = `${e.target.scrollHeight + 2}px`;
      
      const item = e.target.closest('.note-item');
      if (item) {
        updateScrollIndicators(item);
      }
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
    if (e.key === 'Escape' && (e.target.classList.contains('note-edit-input') || e.target.classList.contains('note-edit-title-input'))) {
      renderNotes();
      return;
    }
    const isEditInput = e.target.classList.contains('note-edit-input');
    const isTitleInput = e.target.classList.contains('note-edit-title-input');
    if (e.key === 'Enter' && ((isEditInput && !e.shiftKey) || isTitleInput)) {
      e.preventDefault();
      const item = e.target.closest('.note-item');
      const id = item?.dataset.id;
      const input = item?.querySelector('.note-edit-input');
      const titleInput = item?.querySelector('.note-edit-title-input');
      const slider = item?.querySelector('.note-height-slider');
      const lines = slider ? parseInt(slider.value, 10) : 20;
      const color = item?.dataset.selectedColor !== undefined ? item.dataset.selectedColor : (notes.find(n => n.id === id)?.color || '');
      const width = item?.dataset.selectedWidth !== undefined ? parseInt(item.dataset.selectedWidth, 10) : (notes.find(n => n.id === id)?.width || 100);
      updateNoteWithTitleAndColor(id, titleInput?.value || '', input?.value || '', color, lines, width);
    }
  });

  // ==================== DRAG & DROP REORDERING ====================
  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.note-item');
    if (!item || item.classList.contains('editing')) return;
    
    // Check if dragging starts inside note header or body, not buttons
    if (e.target.closest('.note-actions') || e.target.closest('button')) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.effectAllowed = 'move';
    item.classList.add('dragging');
    document.body.classList.add('dragging-active');
    e.dataTransfer.setData('text/plain', item.dataset.id);
  });

  list.addEventListener('dragend', (e) => {
    const item = e.target.closest('.note-item');
    if (item) {
      item.classList.remove('dragging');
    }
    document.body.classList.remove('dragging-active');
    document.querySelectorAll('.note-item').forEach(el => el.classList.remove('drag-over'));
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = list.querySelector('.dragging');
    if (!draggingItem) return;
    
    const items = Array.from(list.querySelectorAll('.note-item:not(.dragging)'));
    if (items.length === 0) return;
    
    let closestItem = null;
    let closestDistance = Infinity;
    let isAfter = false;
    
    items.forEach(item => {
      if (item.classList.contains('editing')) return;
      
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        
        if (item.classList.contains('full-width')) {
          isAfter = dy > 0;
        } else {
          if (Math.abs(dy) > 25) {
            isAfter = dy > 0;
          } else {
            isAfter = dx > 0;
          }
        }
      }
    });
    
    if (closestItem) {
      list.insertBefore(draggingItem, isAfter ? closestItem.nextSibling : closestItem);
    }
  });

  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    
    // Get new DOM order of IDs
    const newOrderIds = Array.from(list.querySelectorAll('.note-item')).map(el => el.dataset.id);
    
    // Sort our notes array in-memory to match DOM order
    const reorderedNotes = [];
    newOrderIds.forEach(id => {
      const note = notes.find(n => n.id === id);
      if (note) {
        reorderedNotes.push(note);
      }
    });
    
    await animateReorderAndRender(async () => {
      notes = reorderedNotes;
      await saveNotes();
      await renderNotes();
    });
  });

  // ==================== MOUSE RESIZING ====================
  list.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.note-resize-handle');
    if (!handle) return;
    
    e.preventDefault();
    const item = handle.closest('.note-item.editing');
    if (!item) return;
    
    const startX = e.clientX;
    const startWidth = item.offsetWidth;
    const containerWidth = list.offsetWidth || 380;
    
    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;
      
      if (newWidth < 120) newWidth = 120;
      if (newWidth > containerWidth) newWidth = containerWidth;
      
      const widthPercent = Math.round((newWidth / containerWidth) * 100);
      const isFull = widthPercent >= 75;
      const snapWidth = isFull ? 100 : 48;
      
      if (isFull) {
        item.classList.remove('mini-sticker');
        item.classList.add('full-width');
        item.style.setProperty('--note-width', '100%');
        item.style.setProperty('flex', '0 0 100%');
      } else {
        item.classList.remove('full-width');
        item.classList.add('mini-sticker');
        item.style.setProperty('--note-width', 'calc(48% - 4px)');
        item.style.setProperty('flex', '0 0 calc(48% - 4px)');
      }
      
      item.dataset.selectedWidth = snapWidth;
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// ==================== INIT ====================

export function initNotesFeature() {
  TabManager.register('notes', {
    init() {
      const elLower = document.getElementById('opt-lower');
      const elUpper = document.getElementById('opt-upper');
      const elNum = document.getElementById('opt-numbers');
      const elSym = document.getElementById('opt-symbols');
      const elNoSimilar = document.getElementById('opt-no-similar');
      const lengthSlider = document.getElementById('passgen-length');
      const lengthVal = document.getElementById('passgen-length-val');

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
          if (lengthVal) {
            lengthVal.textContent = lengthSlider.value;
          }
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
      const titleInput = document.getElementById('note-title-input');

      addBtn?.addEventListener('click', () => {
        addNote(titleInput?.value || '', addInput?.value || '');
        if (addInput) {
          addInput.value = '';
          addInput.style.height = ''; // reset to default
        }
        if (titleInput) {
          titleInput.value = '';
        }
      });

      addInput?.addEventListener('input', () => {
        addInput.style.height = 'auto';
        addInput.style.height = `${addInput.scrollHeight + 2}px`;
        if (!addInput.value) {
           addInput.style.height = ''; // reset to default
        }
      });

      addInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          addNote(titleInput?.value || '', addInput.value);
          addInput.value = '';
          addInput.style.height = ''; // reset to default
          if (titleInput) {
            titleInput.value = '';
          }
        }
      });

      titleInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addInput?.focus();
        }
      });

      const addCard = document.querySelector('.notes-add-card');
      addCard?.addEventListener('click', (e) => {
        if (e.target === addCard || e.target.classList.contains('notes-add')) {
          addInput?.focus();
        }
      });

      // Event delegation for notes list
      setupNoteEvents();

      // Load settings and notes asynchronously to make tab open speed near-instant (0.1ms)
      Promise.all([Settings.load(), loadNotes()]).then(([settings, loadedNotes]) => {
        // Show/hide password generator based on setting
        const passgenSection = document.querySelector('.passgen-section');
        if (passgenSection) { passgenSection.style.display = settings.passgenEnabled !== false ? '' : 'none'; }

        const pg = settings.passgen;
        if (elLower) { elLower.checked = pg.lower; }
        if (elUpper) { elUpper.checked = pg.upper; }
        if (elNum) { elNum.checked = pg.numbers; }
        if (elSym) { elSym.checked = pg.symbols; }
        if (elNoSimilar) { elNoSimilar.checked = pg.excludeSimilar; }
        if (lengthSlider) { lengthSlider.value = pg.length; }
        if (lengthVal) { lengthVal.textContent = pg.length; }

        notes = loadedNotes;
        renderNotes();

        // Generate initial password
        refreshPassword();
      });
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
