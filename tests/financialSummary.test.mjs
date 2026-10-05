import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function moduleUrl(path, replacements = {}) {
  let { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
  for (const [name, url] of Object.entries(replacements)) outputText = outputText.replace(name, url);
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const categoryUrl = await moduleUrl('../src/data/categories.ts');
const dateRangeUrl = await moduleUrl('../src/lib/dateRange.ts');
const viewUrl = await moduleUrl('../src/lib/transactionView.ts', { '@/data/categories': categoryUrl, './dateRange': dateRangeUrl });
const { recordedMoney, spendingSummary, transactionImpact } = await import(await moduleUrl('../src/lib/financialSummary.ts', { './transactionView': viewUrl }));
const tx = (id, tipo, valor, categoria = 'alimentacao', data = '2026-09-05T12:00:00') => ({ id, tipo, valor, categoria, data });

test('initial balance and reservations do not create income; future entries are not available', () => {
  const transactions = [tx('a', 'receita', 50, 'mesada'), tx('b', 'despesa', 80), tx('c', 'receita', 900, 'bolsa', '2026-10-01T12:00:00')];
  assert.deepEqual(recordedMoney(transactions, [{ valorAtual: 20 }], 100, new Date('2026-09-30T12:00:00')), { total: 70, reserved: 20, available: 50 });
  assert.equal(spendingSummary(transactions, [], new Date(2026, 8, 1)).income, 50);
});
test('reserving and releasing never change total money', () => {
  const t = [tx('a', 'receita', 100, 'mesada')];
  const now = new Date('2026-09-30T12:00:00');
  assert.deepEqual(recordedMoney(t, [{ valorAtual: 30 }], 0, now), { total: 100, reserved: 30, available: 70 });
  assert.deepEqual(recordedMoney(t, [{ valorAtual: 10 }], 0, now), { total: 100, reserved: 10, available: 90 });
});
test('today counts before noon while the next local calendar day stays excluded', () => {
  const t = [tx('today', 'receita', 100, 'mesada', '2026-09-05T12:00:00'), tx('next', 'receita', 200, 'bolsa', '2026-09-06')];
  assert.equal(recordedMoney(t, [], 0, new Date(2026, 8, 5, 8)).total, 100);
});
test('largest expense and over-limit warnings use the requested month and integer cents', () => {
  const t = [tx('a', 'despesa', 10.1), tx('b', 'despesa', 20.2), tx('c', 'despesa', 9.7, 'transporte'), tx('d', 'despesa', 900, 'lazer', '2026-08-01T12:00:00')];
  const view = spendingSummary(t, [{ categoria: 'alimentacao', limite: 20 }], new Date(2026, 8, 1));
  assert.equal(view.largest.valor, 30.3);
  assert.equal(view.largestPercent, 76);
  assert.equal(view.over[0].excess, 10.3);
});
test('post-save feedback distinguishes missing budget, remaining, over-limit and income', () => {
  const item = tx('a', 'despesa', 12.5);
  assert.deepEqual(transactionImpact(item, [item], []), { kind: 'count', value: 12.5, count: 1 });
  assert.equal(transactionImpact(item, [item], [{ categoria: 'alimentacao', limite: 20 }]).value, 7.5);
  assert.deepEqual(transactionImpact(item, [item], [{ categoria: 'alimentacao', limite: 10 }]), { kind: 'over', value: 2.5, count: 1 });
  const income = tx('b', 'receita', 100, 'bolsa');
  assert.equal(transactionImpact(income, [item, income], []).kind, 'income');
});
test('youth categories include income sources and preserve legacy card records without offering them for new expenses', async () => {
  const { CATEGORIES, RECEITA_CATEGORIES, DESPESA_CATEGORIES } = await import(categoryUrl);
  for (const id of ['mesada', 'estagio', 'bolsa', 'freelas']) assert.ok(RECEITA_CATEGORIES.includes(id));
  assert.ok(CATEGORIES.cartao_credito.legacy);
  assert.ok(!DESPESA_CATEGORIES.includes('cartao_credito'));
});
