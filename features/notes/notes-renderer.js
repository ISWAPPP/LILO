// features/notes/notes-renderer.js — HTML rendering for notes and password generator.
 
import { Utils } from '../../core/utils.js';
import { I18n } from '../../core/i18n.js';
 
export const NotesRenderer = {
  /** Secure Regex-based Markdown Parser */
  parseMarkdown(text) {
    if (!text) return '';
    // 1. Escape HTML for strict XSS protection
    let html = Utils.escapeHTML(text);

    // 2. Code blocks (do first to isolate content)
    const codeBlocks = [];
    html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, (match, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code>${code}</code></pre>`);
      return id;
    });

    // 3. Lists
    const lines = html.split('\n');
    let inList = false;
    const processedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^[-*+]\s+(.*)$/);
      if (bulletMatch) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${bulletMatch[1]}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    if (inList) {
      processedLines.push('</ul>');
    }
    html = processedLines.join('\n');

    // 4. Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 5. Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 6. Convert non-block newlines to <br>
    const finalLines = html.split('\n');
    const finalHtml = finalLines.map(line => {
      if (line.startsWith('__CODE_BLOCK_') || line === '<ul>' || line === '</ul>' || line.startsWith('<li>')) {
        return line;
      }
      return line + '<br>';
    }).join('');

    // 7. Restore code blocks
    let restoredHtml = finalHtml;
    for (let i = 0; i < codeBlocks.length; i++) {
      restoredHtml = restoredHtml.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
    }

    return restoredHtml;
  },

  /** Single note item (normal state). */
  noteItem(note) {
    const rendered = this.parseMarkdown(note.text);
    const inlineStyle = note.color 
      ? `background-color: ${note.color}; --note-bg: ${note.color}; --note-text: #1a1a1a; --note-btn-hover-bg: rgba(0, 0, 0, 0.08);` 
      : '';
    return `
      <div class="note-item" data-id="${note.id}" style="${inlineStyle}">
        <div class="note-markdown-body note-text" title="${I18n.t('passgen_tooltip')}">${rendered}</div>
        <div class="note-actions">
          <button class="note-move-up-btn" title="${I18n.t('notes_move_up')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="note-move-down-btn" title="${I18n.t('notes_move_down')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="note-edit-btn" title="${I18n.t('notes_title_edit')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="note-delete-btn" title="${I18n.t('notes_title_delete')}">
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
    
    const inlineStyle = note.color 
      ? `background-color: ${note.color}; --note-bg: ${note.color}; --note-text: #1a1a1a; --note-btn-hover-bg: rgba(0, 0, 0, 0.08);` 
      : '';
    
    return `
      <div class="note-item editing" data-id="${note.id}" style="${inlineStyle}">
        <div style="display:flex; flex-direction:column; flex:1; gap:6px;">
          <textarea class="note-edit-input" placeholder="${I18n.t('notes_edit_placeholder')}" rows="1">${escaped}</textarea>
          <div style="display:flex; gap:6px;" class="note-color-picker">
            ${palette}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="note-save-btn" title="${I18n.t('notes_title_save')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button class="note-cancel-btn" title="Cancel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>`;
  },
 
  /** Full list of notes. */
  notesList(notes) {
    if (!notes || notes.length === 0) {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0; color: var(--text-muted); opacity: 0.7;">
          <svg class="icon icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; margin-bottom: 10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p style="margin:0; font-size: 13px; font-weight: 500;">${I18n.t('notes_empty')}</p>
        </div>
      `;
    }
    return notes.map(n => this.noteItem(n)).join('');
  },
 
  /** Copy notification. */
  copiedFeedback() {
    return `<span class="copied-badge">${I18n.t('copied')}</span>`;
  },
};
