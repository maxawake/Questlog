import assert from 'node:assert/strict';
import test from 'node:test';
import {demoData, descendants, progress, roots} from '../dist/model.js';

test('nested objectives contribute to their main quest progress', () => {
  const {quests} = demoData();
  assert.equal(descendants(quests, 'home-1').length, 5);
  assert.deepEqual(progress(quests, 'home-1'), {done: 2, total: 5, percent: 40});
});
test('cycles in externally edited data do not recurse indefinitely or disappear', () => {
  const quests = [{id: 'a', parent: 'b'}, {id: 'b', parent: 'a'}];
  assert.equal(roots(quests).length, 1);
  assert.equal(descendants(quests, 'a').length, 1);
});
test('orphaned imported quests remain visible', () => {
  assert.equal(roots([{id: 'a', parent: 'missing'}])[0].id, 'a');
});
