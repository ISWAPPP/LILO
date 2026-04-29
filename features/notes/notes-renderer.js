// features/notes/notes-renderer.js — побудова HTML для нотаток та генератора паролів.

import { Utils } from '../../core/utils.js';

export const NotesRenderer = {
  /** Один рядок нотатки (нормальний стан). */
  noteItem(note) {
    const escaped = Utils.escapeHTML(note.text);
    return `
      <div class="note-item" data-id="${note.id}">
        <span class="note-text" title="Натисніть щоб скопіювати">${escaped}</span>
        <div class="note-actions">
          <button class="note-edit-btn" title="Редагувати">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="note-delete-btn" title="Видалити">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>`;
  },

  /** Один рядок нотатки (режим редагування). */
  noteItemEditing(note) {
    const escaped = Utils.escapeHTML(note.text);
    return `
      <div class="note-item editing" data-id="${note.id}">
        <textarea class="note-edit-input" placeholder="Текст нотатки..." rows="2">${escaped}</textarea>
        <button class="note-save-btn" title="Зберегти">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </div>`;
  },

  /** Повний список нотаток. */
  notesList(notes) {
    if (!notes.length) {
      return '<div class="notes-empty">Нотаток поки немає</div>';
    }
    return notes.map(n => this.noteItem(n)).join('');
  },

  /** Повідомлення про копіювання. */
  copiedFeedback() {
    return '<span class="copied-badge">Скопійовано!</span>';
  },
};
