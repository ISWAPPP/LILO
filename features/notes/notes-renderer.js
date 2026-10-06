// features/notes/notes-renderer.js — HTML rendering for notes and password generator.
 
import { Utils } from '../../core/utils.js';
import { I18n } from '../../core/i18n.js';
 
export const NotesRenderer = {
  /** Secure Regex-based Markdown Parser */
  parseMarkdown(text) {
    if (!text) {
      return '';
    }
    // 1. Escape HTML for strict XSS protection
    let html = Utils.escapeHTML(text);

    // 2. Code blocks (do first to isolate content)
    const codeBlocks = [];
    html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, (_match, code) => {
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
      return `${line}<br>`;
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
    const escapedTitle = note.title ? Utils.escapeHTML(note.title) : '';
    
    const isMini = note.width && note.width < 100;
    const baseClass = isMini ? 'note-item mini-sticker' : 'note-item full-width';
    const noteClass = escapedTitle ? baseClass : `${baseClass} no-title`;
    
    const inlineStyle = (note.color 
      ? `background-color: ${note.color}; --note-bg: ${note.color}; --note-text: #1a1a1a; --note-btn-hover-bg: rgba(0, 0, 0, 0.08); --note-border: rgba(0, 0, 0, 0.09);` 
      : '') + (note.width ? ` --note-width: calc(${note.width}% - 4px); flex: 0 0 calc(${note.width}% - 4px); max-width: 100%;` : '');
    const lines = note.lines !== undefined ? note.lines : 20;

    let bodyStyle = `max-height: calc(${lines} * 1.5em); overflow-y: auto;`;
    let headerStyle = '';

    if (lines === 1) {
      if (escapedTitle) {
        bodyStyle = 'display: none;';
        headerStyle = 'margin-bottom: 0 !important; padding-bottom: 0 !important; border-bottom: none !important;';
      } else {
        bodyStyle = 'max-height: 1.5em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; border-top: none;';
        headerStyle = 'margin-bottom: 0 !important; padding-bottom: 0 !important; border-bottom: none !important;';
      }
    } else {
      if (!escapedTitle) {
        headerStyle = 'margin-bottom: 0 !important; padding-bottom: 0 !important; border-bottom: none !important;';
      }
    }


    return `
      <div class="${noteClass}" data-id="${note.id}" style="${inlineStyle}" data-side="${note.side === 'right' ? 'right' : 'left'}" draggable="true">
        <div class="note-header" style="${headerStyle}">
          <div class="note-title">${escapedTitle}</div>
          <div class="note-actions">
            <button class="note-copy-btn" title="${I18n.t('notes_copy_tooltip')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="note-edit-btn" title="${I18n.t('notes_title_edit')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="note-delete-btn" title="${I18n.t('notes_title_delete')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="note-markdown-body note-text" style="${bodyStyle}" title="${I18n.t('passgen_tooltip')}">${rendered}</div>
      </div>`;
  },
 
  /** Single note item (editing mode). */
  noteItemEditing(note) {
    const escaped = Utils.escapeHTML(note.text);
    const escapedTitle = note.title ? Utils.escapeHTML(note.title) : '';
    const colors = [
      '#fee2e2', // soft red
      '#ffe4e6', // soft rose
      '#f3e8ff', // soft purple
      '#e0e7ff', // soft indigo
      '#dbeafe', // soft blue
      '#e0f7fa', // soft cyan
      '#ccfbf1', // soft teal
      '#dcfce7', // soft green
      '#ecfccb', // soft lime
      '#fef9c3', // soft yellow
      '#fef3c7', // soft amber
      '#ffedd5', // soft orange
      '#f1f5f9', // soft slate/gray
      ''         // default
    ];
    const noteColor = note.color || '';
    const palette = colors.map(c => {
      const isActive = c === noteColor;
      return `<div class="color-swatch${isActive ? ' active' : ''}" data-color="${c}" style="background:${c || 'var(--bg-main)'};" title="${c ? c : 'Default'}"></div>`;
    }).join('');
    
    const isMini = note.width && note.width < 100;
    const noteClass = isMini ? 'note-item editing mini-sticker' : 'note-item editing full-width';
    const inlineStyle = (note.color 
      ? `background-color: ${note.color}; --note-bg: ${note.color}; --note-text: #1a1a1a; --note-btn-hover-bg: rgba(0, 0, 0, 0.08); --note-border: rgba(0, 0, 0, 0.09);` 
      : '') + (note.width ? ` --note-width: calc(${note.width}% - 4px); flex: 0 0 calc(${note.width}% - 4px); max-width: 100%;` : '');
    
    const lines = note.lines !== undefined ? note.lines : 20;
    const noteWidthVal = note.width !== undefined ? note.width : 100;

    const resizeHandle = `<div class="note-resize-handle" title="Drag to resize note width"></div>`;

    const textLines = note.text ? note.text.split('\n').length : 1;
    const rowsCount = Math.min(textLines, 10);

    return `
      <div class="${noteClass}" data-id="${note.id}" style="${inlineStyle}" data-side="${note.side === 'right' ? 'right' : 'left'}" data-selected-width="${noteWidthVal}">
        ${resizeHandle}
        <div class="note-header" style="margin-bottom: 4px !important; padding-bottom: 0 !important; border-bottom: none !important;">
          <input type="text" class="note-edit-title-input" placeholder="${I18n.t('notes_title_placeholder')}" value="${escapedTitle}" autocomplete="off">
          <div class="note-edit-actions">
            <button class="note-cancel-btn" title="Cancel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <button class="note-save-btn" title="${I18n.t('notes_title_save')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; flex:1; gap:8px;">
          <textarea class="note-edit-input" placeholder="${I18n.t('notes_edit_placeholder')}" rows="${rowsCount}">${escaped}</textarea>
          <div class="note-edit-controls">
            <div class="note-color-picker">
              ${palette}
            </div>
            <div class="note-lines-control">
              <span class="note-lines-label">${I18n.t('notes_max_lines')}: <strong class="range-val">${lines}</strong></span>
              <input type="range" class="note-height-slider" min="1" max="20" value="${lines}">
            </div>
          </div>
        </div>
      </div>`;
  },
 
  /**
   * Keeps side='right' only where it can apply: a mini sticker that starts a grid row.
   * Paired / full-width notes drop stale sides, so a saved side never blocks reordering.
   */
  normalizeSides(notes) {
    const isMini = n => n.width && n.width < 100;
    let i = 0;
    while (i < notes.length) {
      const n = notes[i];
      if (!isMini(n)) {
        delete n.side;
        i += 1;
      } else if (n.side === 'right') {
        i += 1; // alone in its row, right column
      } else {
        delete n.side;
        if (isMini(notes[i + 1] || {})) {
          delete notes[i + 1].side; // second of a pair
          i += 2;
        } else {
          i += 1;
        }
      }
    }
    return notes;
  },

  /** Full list of notes. */
  notesList(notes) {
    if (!notes || notes.length === 0) {
      return `
        <div class="notes-empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0; color: var(--text-muted); opacity: 0.7;">
          <svg class="icon icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; margin-bottom: 10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p style="margin:0; font-size: 13px; font-weight: 500;">${I18n.t('notes_empty')}</p>
        </div>
      `;
    }
    return this.normalizeSides(notes).map(n => this.noteItem(n)).join('');
  },
 
  /** Copy notification. */
  copiedFeedback() {
    return `<span class="copied-badge">${I18n.t('copied')}</span>`;
  },
};
