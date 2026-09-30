import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function moduleUrl(path, replacements = {}) {
  let { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
  for (const [name, url] of Object.entries(replacements)) outputText = outputText.replace(name, url);
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const categories = await moduleUrl('../src/data/categories.ts');
const { getTransactionView, parseMonthKey } = await import(await moduleUrl('../src/lib/transactionView.ts', { '@/data/categories': categories }));
const tx = (id, data, tipo, categoria, valor, descricao) => ({ id, data, tipo, categoria, valor, descricao });
const records = [
  tx('income', '2026-09-01', 'receita', 'salario', 1000),
  tx('food-a', '2026-09-02T12:00:00', 'despesa', 'alimentacao', 10.10, 'Lanche escola'),
  tx('food-b', '2026-09-03T12:00:00', 'despesa', 'alimentacao', 20.20, 'Almoço'),
  tx('bus', '2026-09-04T12:00:00', 'despesa', 'transporte', 5.50, 'Ônibus'),
  tx('previous', '2026-08-31T12:00:00', 'despesa', 'alimentacao', 99),
  tx('future', '2026-10-01T12:00:00', 'receita', 'salario', 400),
  tx('last-year', '2025-09-02T12:00:00', 'despesa', 'outros', 500),
];
const month = new Date(2026, 8, 1);

test('monthly summary excludes other months and years, and sorts recent entries', () => {
  const view = getTransactionView(records, { month });
  assert.deepEqual([view.income, view.expenses, view.balance], [1000, 35.80, 964.20]);
  assert.deepEqual(view.items.map((item) => item.id), ['bus', 'food-b', 'food-a', 'income']);
  assert.deepEqual(view.categories, [{ categoria: 'alimentacao', valor: 30.30 }, { categoria: 'transporte', valor: 5.50 }]);
  assert.equal(records[0].id, 'income', 'source array remains unchanged');
});
test('type and category filters update both list and sums', () => {
  const view = getTransactionView(records, { month, type: 'despesa', category: 'alimentacao' });
  assert.equal(view.items.length, 2);
  assert.deepEqual([view.income, view.expenses], [0, 30.30]);
});
test('search matches descriptions and category names without case or accent sensitivity', () => {
  assert.equal(getTransactionView(records, { month, search: ' ALIMENTACAO ' }).expenses, 30.30);
  assert.equal(getTransactionView(records, { month, search: 'almoco' }).expenses, 20.20);
  assert.equal(getTransactionView(records, { month, search: 'onibus' }).expenses, 5.50);
});
test('combined filters intersect; no results and empty months have zero totals', () => {
  for (const filters of [{ month, type: 'receita', category: 'alimentacao' }, { month, type: 'despesa', search: 'Salário' }, { month: new Date(2027, 0, 1) }]) {
    const view = getTransactionView(records, filters);
    assert.equal(view.items.length, 0);
    assert.deepEqual([view.income, view.expenses, view.balance], [0, 0, 0]);
  }
});
test('deleting or editing a visible item is reflected in filtered totals', () => {
  const filters = { month, type: 'despesa', category: 'alimentacao' };
  assert.equal(getTransactionView(records.filter((item) => item.id !== 'food-a'), filters).expenses, 20.20);
  assert.equal(getTransactionView(records.map((item) => item.id === 'food-a' ? { ...item, valor: 5 } : item), filters).expenses, 25.20);
});
test('month keys are validated and December/January boundaries use the proper year', () => {
  const january = parseMonthKey('2027-01');
  const previous = new Date(january.getFullYear(), january.getMonth() - 1, 1);
  assert.deepEqual([previous.getFullYear(), previous.getMonth()], [2026, 11]);
  assert.equal(parseMonthKey('2026-13', month).getMonth(), 8);
  assert.equal(parseMonthKey('invalid', month).getFullYear(), 2026);
  assert.equal(getTransactionView(records, { month: parseMonthKey('2026-08') }).expenses, 99);
  assert.equal(getTransactionView(records, { month: parseMonthKey('2026-10') }).income, 400);
});
