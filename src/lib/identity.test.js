import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidNationalId, generateCode, hashCode, hashNationalId } from './identity.js';

test('valid / invalid national IDs', () => {
  assert.equal(isValidNationalId('A123456789'), true);
  assert.equal(isValidNationalId('a123456789'), true);
  assert.equal(isValidNationalId('A123456780'), false);
  assert.equal(isValidNationalId('123456789'), false);
});

test('generateCode shape', () => {
  assert.match(generateCode(), /^[A-HJ-NP-Z2-9]{8}$/);
});

test('hashes are stable and 64 hex', async () => {
  assert.equal(await hashCode('abc'), await hashCode(' ABC '));
  assert.match(await hashNationalId('A123456789', 's'), /^[0-9a-f]{64}$/);
});
