// Run: node features/notes/notes.test.mjs
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { NotesRenderer } = await import('./notes-renderer.js');

const mini = (side) => ({ width: 48, ...(side ? { side } : {}) });
const full = () => ({ width: 100, side: 'right' });
const sides = (notes) => NotesRenderer.normalizeSides(notes).map(n => n.side || '-');

// A lone mini sticker at the start of a row keeps its right side.
assert.deepEqual(sides([mini('right'), mini(), mini()]), ['right', '-', '-']);
// A stale side on the second sticker of a pair is dropped (it must not block pairing).
assert.deepEqual(sides([mini(), mini('right'), mini()]), ['-', '-', '-']);
// The odd one out keeps its side.
assert.deepEqual(sides([mini(), mini(), mini('right')]), ['-', '-', 'right']);
// Full-width notes never keep a side.
assert.deepEqual(sides([full(), mini('right')]), ['-', 'right']);

// The side attribute is whitelisted, never echoed raw into HTML.
assert.ok(!NotesRenderer.noteItem({ id: 'x', text: 'x', side: '"><b>' }).includes('<b>'));

console.log('notes: ok');
