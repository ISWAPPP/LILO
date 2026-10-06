// Run: node features/passgen/passgen.test.mjs
import assert from 'node:assert/strict';
import { generatePassword } from './passgen.js';
import { Config } from '../../config.js';

const { charsets, similarChars } = Config.passgen;
const all = { lower: true, upper: true, numbers: true, symbols: true, length: 64 };

for (let i = 0; i < 200; i++) {
  const p = generatePassword(all);
  assert.equal(p.length, 64);
  assert.ok([...p].every(c => Object.values(charsets).join('').includes(c)));
}
assert.match(generatePassword({ numbers: true, length: 30 }), /^[0-9]{30}$/);
assert.ok(![...generatePassword({ ...all, excludeSimilar: true, length: 2000 })].some(c => similarChars.includes(c)));
assert.match(generatePassword({ length: 10 }), /^[a-z]{10}$/, 'nothing selected falls back to lowercase');
assert.equal(generatePassword({ lower: true }).length, Config.passgen.defaultLength);
console.log('passgen ok');
