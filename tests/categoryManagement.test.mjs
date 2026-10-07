import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { tsLoader } from './helpers/loadTs.mjs';
const loader = await tsLoader({
  'lib/db.ts': 'export const saveState = async () => {}; export const loadState = async () => null; export const clearState = async () => {}; export const requestPersistentStorage = async () => false;',
  'lib/storageStatus.ts': 'export const setStorageStatus = () => {};',
});
after(loader.cleanup);
const { CATEGORIES, categoryOptions, syncCategories, DESPESA_CATEGORIES, RECEITA_CATEGORIES } = await loader.load('data/categories');
const { useStore } = await loader.load('store/useStore');
const custom = (type, count) => Array.from({ length: count }, (_, i) => ({ id: `custom_${type}_${i}`, tipo: type, nome: `${type} ${i}`, cor: '#4338CA', icon: 'Coffee' }));
const prefs = { experience: 0, focus: 'understand', incomeCategories: ['mesada'], expenseCategories: ['alimentacao'] };

test('30 total categories per type includes defaults and ignores deleted categories', () => {
  const expenses = custom('despesa', 30 - categoryOptions('despesa').length);
  const income = custom('receita', 30 - categoryOptions('receita').length);
  useStore.getState().saveCategoryPreferences([...expenses, ...income], prefs);
  assert.equal(categoryOptions('despesa', [...expenses, ...income]).length, 30);
  assert.equal(categoryOptions('receita', [...expenses, ...income]).length, 30);
  for (const tipo of ['despesa', 'receita']) {
    assert.throws(() => useStore.getState().saveCategoryPreferences([...expenses, ...income, { id: `custom_extra_${tipo}`, tipo, nome: 'Extra', cor: '#334455', icon: 'Coins' }], prefs), /30/);
  }
  const removed = expenses.map((item, i) => i === 0 ? { ...item, deleted: true } : item);
  assert.equal(categoryOptions('despesa', removed).length, 29);
  syncCategories();
});

test('deleting default and custom categories preserves transactions and historical labels', () => {
  const transaction = { id: 'history', tipo: 'despesa', categoria: 'alimentacao', valor: 15, data: '2026-10-01T12:00:00' };
  const archived = { id: 'custom_old', tipo: 'receita', nome: 'Trabalho antigo', cor: '#4338CA', icon: 'Coffee', deleted: true };
  const definitions = [{ ...CATEGORIES.alimentacao, deleted: true }, archived];
  useStore.setState({ transactions: [transaction], budgets: [{ categoria: 'alimentacao', limite: 50 }, { categoria: 'lazer', limite: 40 }] });
  useStore.getState().saveCategoryPreferences(definitions, { ...prefs, incomeCategories: ['mesada', 'custom_old'] });
  assert.deepEqual(useStore.getState().transactions, [transaction]);
  assert.equal(CATEGORIES.alimentacao.nome, 'Alimentação');
  assert.equal(CATEGORIES.custom_old.nome, 'Trabalho antigo');
  assert.ok(!DESPESA_CATEGORIES.includes('alimentacao'));
  assert.ok(!RECEITA_CATEGORIES.includes('custom_old'));
  assert.deepEqual(useStore.getState().preferences.expenseCategories, []);
  assert.deepEqual(useStore.getState().preferences.incomeCategories, ['mesada']);
  assert.deepEqual(useStore.getState().budgets, [{ categoria: 'lazer', limite: 40 }]);
  syncCategories(definitions);
  assert.ok(!DESPESA_CATEGORIES.includes('alimentacao'), 'deletion survives registry reload');
  syncCategories();
});
