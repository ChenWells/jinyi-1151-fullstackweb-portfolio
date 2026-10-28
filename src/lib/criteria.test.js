import test from 'node:test';
import assert from 'node:assert/strict';
import { TEACHER_CRITERIA, PEER_CRITERIA, calcTotal, average } from './criteria.js';

test('weights sum to 100', () => {
  for (const set of [TEACHER_CRITERIA, PEER_CRITERIA]) {
    assert.equal(set.reduce((s, c) => s + c.weight, 0), 100);
  }
});

test('totals are integers and match the rules formula', () => {
  assert.equal(calcTotal(PEER_CRITERIA, { quality: 5, innovation: 5, teamwork: 5 }), 100);
  assert.equal(calcTotal(PEER_CRITERIA, { quality: 4, innovation: 3, teamwork: 2 }), 8 * 4 + 6 * 3 + 6 * 2);
  assert.equal(
    calcTotal(TEACHER_CRITERIA, { technical: 1, creativity: 2, completion: 3, presentation: 4, collaboration: 5 }),
    6 + 10 + 12 + 12 + 10,
  );
});

test('average', () => {
  assert.equal(average(undefined), null);
  assert.equal(average({ sum: 170, count: 2 }), 85);
});
