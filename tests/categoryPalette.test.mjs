import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { tsLoader } from './helpers/loadTs.mjs';

const loader = await tsLoader();
after(loader.cleanup);
const { CATEGORY_PALETTE, unusedCategoryStyles } = await loader.load('data/categoryPalette');

test('new categories exclude occupied colors regardless of case and occupied icons', () => {
  const categories = [{ id: 'a', cor: '#4f6dff', icon: 'Wallet' }, { id: 'custom_b', cor: '#0284C7', icon: 'Coffee' }];
  const available = unusedCategoryStyles(categories, ['Wallet', 'Coffee', 'Bike']);
  assert.deepEqual(available.icons, ['Bike']);
  assert.ok(!available.colors.some((color) => ['#4f6dff', '#0284c7'].includes(color.value.toLowerCase())));
  assert.equal(new Set(CATEGORY_PALETTE.map((color) => color.value.toLowerCase())).size, CATEGORY_PALETTE.length);
});

test('editing excludes only other categories and exhaustion returns no duplicate fallback', () => {
  const categories = CATEGORY_PALETTE.map((color, i) => ({ id: String(i), cor: color.value, icon: `icon${i}` }));
  assert.deepEqual(unusedCategoryStyles(categories, categories.map((item) => item.icon)), { colors: [], icons: [] });
  const editing = unusedCategoryStyles(categories, categories.map((item) => item.icon), '0');
  assert.deepEqual(editing.colors, [CATEGORY_PALETTE[0]]);
  assert.deepEqual(editing.icons, ['icon0']);
});
