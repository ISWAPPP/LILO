// features/notes/notes-renderer.js — HTML rendering for notes and password generator.

import { Utils } from '../../core/utils.js';

export const NotesRenderer = {
  /** Single note item (normal state). */
  noteItem(note) {
    const escaped = Utils.escapeHTML(note.text);
    return `
      <div class="note-item" data-id="${note.id}">
        <span class="note-text" title="Click to copy">${escaped}</span>
        <div class="note-actions">
          <button class="note-edit-btn" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="note-delete-btn" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>`;
  },

  /** Single note item (editing mode). */
  noteItemEditing(note) {
    const escaped = Utils.escapeHTML(note.text);
    return `
      <div class="note-item editing" data-id="${note.id}">
        <textarea class="note-edit-input" placeholder="Note text..." rows="2">${escaped}</textarea>
        <button class="note-save-btn" title="Save">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </div>`;
  },

  /** Full list of notes. */
  notesList(notes) {
    if (!notes.length) {
      return '<div class="notes-empty">No notes yet</div>';
    }
    return notes.map(n => this.noteItem(n)).join('');
  },

  /** Copy notification. */
  copiedFeedback() {
    return '<span class="copied-badge">Copied!</span>';
  },
};
