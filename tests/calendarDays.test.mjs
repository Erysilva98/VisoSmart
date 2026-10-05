import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { tsLoader } from './helpers/loadTs.mjs';
const loader = await tsLoader();
after(loader.cleanup);
const { calendarDays } = await loader.load('lib/calendarDays');

test('collapsed calendar shows the current Sunday-first week without invalid dates', () => {
  assert.deepEqual(calendarDays(new Date(2026, 9, 1), true, new Date(2026, 9, 5)), [4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(calendarDays(new Date(2026, 9, 1), true, new Date(2026, 9, 1)), [null, null, null, null, 1, 2, 3]);
  assert.deepEqual(calendarDays(new Date(2026, 10, 1), true, new Date(2026, 10, 30)), [29, 30, null, null, null, null, null]);
});
test('other months show the first week; expanded calendar includes all six weeks and leap days', () => {
  assert.deepEqual(calendarDays(new Date(2026, 7, 1), true, new Date(2026, 9, 5)), [null, null, null, null, null, null, 1]);
  const august = calendarDays(new Date(2026, 7, 1), false);
  assert.equal(august.length, 42);
  assert.deepEqual(august.filter(Boolean), Array.from({ length: 31 }, (_, i) => i + 1));
  assert.ok(calendarDays(new Date(2028, 1, 1), false).includes(29));
});
