// features/notes/notes-renderer.js — HTML rendering for notes and password generator.
 
import { Utils } from '../../core/utils.js';
import { I18n } from '../../core/i18n.js';
 
export const NotesRenderer = {
  /** Single note item (normal state). */
  noteItem(note) {
    const escaped = Utils.escapeHTML(note.text);
    const textStyle = note.color ? `color: #1a1a1a;` : '';
    const bgStyle = note.color ? `background-color: ${note.color}; ${textStyle}` : '';
    return `
      <div class="note-item" data-id="${note.id}" style="${bgStyle}">
        <span class="note-text" title="${I18n.t('passgen_tooltip')}" style="${textStyle}">${escaped}</span>
        <div class="note-actions">
          <button class="note-move-up-btn" title="${I18n.t('notes_move_up')}" style="${textStyle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="note-move-down-btn" title="${I18n.t('notes_move_down')}" style="${textStyle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="note-edit-btn" title="${I18n.t('notes_title_edit')}" style="${textStyle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="note-delete-btn" title="${I18n.t('notes_title_delete')}" style="${textStyle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>`;
  },
 
  /** Single note item (editing mode). */
  noteItemEditing(note) {
    const escaped = Utils.escapeHTML(note.text);
    const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3', '#f3f4f6', ''];
    const palette = colors.map(c => 
      `<div class="color-swatch" data-color="${c}" style="width:14px; height:14px; border-radius:50%; background:${c || 'var(--bg-main)'}; border:1px solid var(--border-light); cursor:pointer;"></div>`
    ).join('');
    
    const textStyle = note.color ? `color: #1a1a1a;` : '';
    const bgStyle = note.color ? `background-color: ${note.color}; ${textStyle}` : '';
    
    return `
      <div class="note-item editing" data-id="${note.id}" style="${bgStyle}">
        <div style="display:flex; flex-direction:column; flex:1; gap:6px;">
          <textarea class="note-edit-input" placeholder="${I18n.t('notes_edit_placeholder')}" rows="2" style="${textStyle}">${escaped}</textarea>
          <div style="display:flex; gap:6px;" class="note-color-picker">
            ${palette}
          </div>
        </div>
        <button class="note-save-btn" title="${I18n.t('notes_title_save')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </div>`;
  },
 
  /** Full list of notes. */
  notesList(notes) {
    if (!notes.length) {
      return `<div class="notes-empty">${I18n.t('notes_empty')}</div>`;
    }
    return notes.map(n => this.noteItem(n)).join('');
  },
 
  /** Copy notification. */
  copiedFeedback() {
    return `<span class="copied-badge">${I18n.t('copied')}</span>`;
  },
};
