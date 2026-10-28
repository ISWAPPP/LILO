// Run: node features/notes/notes.test.mjs
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { NotesRenderer } = await import('./notes-renderer.js');

const mini = (side) => ({ width: 48, ...(side ? { side } : {}) });
const full = () => ({ width: 100, side: 'right' });
const sides = (notes) => NotesRenderer.normalizeSides(notes).map(n => n.side || '-');

// Notes without a side alternate left/right; an explicit side is kept.
assert.deepEqual(sides([mini('right'), mini(), mini()]), ['right', 'left', 'right']);
assert.deepEqual(sides([mini(), mini(), mini('right')]), ['left', 'right', 'right']);
// Moving a note must not re-assign the others: sides are stable once set.
assert.deepEqual(sides([mini('left'), mini('left'), mini('right')]), ['left', 'left', 'right']);
// Full-width notes never keep a side and restart the alternation.
assert.deepEqual(sides([full(), mini('right')]), ['-', 'right']);
assert.deepEqual(sides([mini(), full(), mini()]), ['left', '-', 'left']);

// The side attribute is whitelisted, never echoed raw into HTML.
assert.ok(!NotesRenderer.noteItem({ id: 'x', text: 'x', side: '"><b>' }).includes('<b>'));

console.log('notes: ok');
