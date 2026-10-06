// features/notes/notes.js — NOTES tab module (password generator + notes).

import { Config } from '../../config.js';
import { Utils } from '../../core/utils.js';
import { TabManager } from '../../core/tabs.js';
import { NotesRenderer } from './notes-renderer.js';
import { initPassgen } from '../passgen/passgen.js';

// ==================== STORAGE ====================

async function loadNotes() {
  return new Promise((resolve) => {
    chrome.storage.local.get(Config.storage.notesKey, (result) => {
      resolve(result[Config.storage.notesKey] || []);
    });
  });
}

const saveNotes = () => chrome.storage.local.set({ [Config.storage.notesKey]: notes });

// ==================== NOTES LOGIC ====================

let notes = [];

async function renderNotes() {
  const list = document.getElementById('notes-list');
  if (!list) {
    return;
  }
  list.innerHTML = NotesRenderer.notesList(notes);

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
      if (!first) { return; }
      
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

  item.outerHTML = NotesRenderer.noteItemEditing(note);

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
  if (!item) { return; }
  const textEl = item.querySelector('.note-text');
  const textareaEl = item.querySelector('.note-edit-input');
  const scrollEl = textEl || textareaEl;
  if (!scrollEl) { return; }
  
  const hasOverflow = scrollEl.scrollHeight > scrollEl.clientHeight;
  const isAtBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 6; // 6px padding tolerance
  
  if (hasOverflow && !isAtBottom) {
    item.classList.add('has-more-content');
  } else {
    item.classList.remove('has-more-content');
  }
}

// ==================== EVENT DELEGATION ====================

/** Live preview while dragging: apply the same side rules to the DOM order. */
function syncDomSides(list) {
  const items = Array.from(list.querySelectorAll('.note-item'));
  const pseudo = items.map(el => ({
    width: el.classList.contains('mini-sticker') ? 48 : 100,
    side: el.dataset.side,
  }));
  NotesRenderer.normalizeSides(pseudo).forEach((p, idx) => {
    const side = p.side === 'right' ? 'right' : 'left';
    if (items[idx].dataset.side !== side) {
      items[idx].dataset.side = side;
    }
  });
}

const MASONRY_GAP = 8; // vertical gap between notes, px (grid rows are 1px)

/** Each note spans as many 1px grid rows as it is tall, so the grid packs like masonry. */
function layoutMasonry(list, resizeObserver) {
  list.querySelectorAll('.note-item').forEach(item => {
    resizeObserver.observe(item); // no-op if already observed
    const span = `span ${Math.ceil(item.getBoundingClientRect().height) + MASONRY_GAP}`;
    if (item.style.gridRowEnd !== span) {
      item.style.gridRowEnd = span;
    }
  });
}

function setupNoteEvents() {
  const list = document.getElementById('notes-list');
  if (!list) {
    return;
  }

  // Re-pack on re-render / edit mode / drag reorder (childList) and on any note height change.
  const resizeObserver = new ResizeObserver(() => layoutMasonry(list, resizeObserver));
  new MutationObserver(() => layoutMasonry(list, resizeObserver)).observe(list, { childList: true });

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
      
      const picker = swatch.closest('.note-color-picker');
      if (picker) {
        picker.querySelectorAll('.color-swatch').forEach(s => { s.classList.remove('active'); });
        swatch.classList.add('active');
      }

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
    if (!item || item.classList.contains('editing')) { return; }
    
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
    document.querySelectorAll('.note-item').forEach(el => { el.classList.remove('drag-over'); });
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = list.querySelector('.dragging');
    // Pointer over the dragged note itself: it is already where the pointer is. Moving it
    // here would shift the layout under the pointer and flip back next event (flicker loop).
    if (!draggingItem || e.target.closest('.note-item') === draggingItem) { return; }

    // Mini sticker: the pointer's half of the list decides its column.
    if (draggingItem.classList.contains('mini-sticker')) {
      const rect = list.getBoundingClientRect();
      const side = e.clientX > rect.left + rect.width / 2 ? 'right' : 'left';
      if (draggingItem.dataset.side !== side) {
        draggingItem.dataset.side = side;
      }
    }
    
    const items = Array.from(list.querySelectorAll('.note-item:not(.dragging)'));
    if (items.length === 0) { return; }
    
    let closestItem = null;
    let closestDistance = Infinity;
    let isAfter = false;
    
    items.forEach(item => {
      if (item.classList.contains('editing')) { return; }
      
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
    
    const target = isAfter ? closestItem?.nextSibling : closestItem;
    // dragover fires continuously; only touch the DOM when the position actually changes.
    if (closestItem && target !== draggingItem && draggingItem.nextSibling !== target) {
      list.insertBefore(draggingItem, target);
    }
    syncDomSides(list);
  });

  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) { return; }
    
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
    const dragged = notes.find(n => n.id === draggedId);
    const draggedEl = list.querySelector(`.note-item[data-id="${CSS.escape(draggedId)}"]`);
    if (dragged && draggedEl) {
      dragged.side = draggedEl.dataset.side;
    }
    
    await animateReorderAndRender(async () => {
      notes = reorderedNotes;
      await saveNotes();
      await renderNotes();
    });
  });

  // ==================== MOUSE RESIZING ====================
  list.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.note-resize-handle');
    if (!handle) { return; }
    
    e.preventDefault();
    const item = handle.closest('.note-item.editing');
    if (!item) { return; }
    
    const startX = e.clientX;
    const startWidth = item.offsetWidth;
    const containerWidth = list.offsetWidth || 380;
    
    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;
      
      if (newWidth < 120) { newWidth = 120; }
      if (newWidth > containerWidth) { newWidth = containerWidth; }
      
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
      initPassgen();

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
      loadNotes().then((loadedNotes) => {
        notes = loadedNotes;
        renderNotes();
      });
    },
  });
}
