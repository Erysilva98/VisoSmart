import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { tsLoader } from './helpers/loadTs.mjs';

const loader = await tsLoader();
after(loader.cleanup);
const { parseDay, parseDateRange, dateRangeLabel, localDayKey } = await loader.load('lib/dateRange');
const { getTransactionView } = await loader.load('lib/transactionView');
const { goalForecast } = await loader.load('lib/goalForecast');
const tx = (id, data, valor, categoria = 'alimentacao', tipo = 'despesa') => ({ id, data, valor, categoria, tipo });
const records = [tx('before', '2026-09-29', 200), tx('start', '2026-09-30T00:00:00', 10.1), tx('end-am', '2026-10-05T00:01:00', 20.2), tx('end-pm', '2026-10-05T23:59:59', 15, 'lazer'), tx('income', '2026-10-05', 100, 'mesada', 'receita'), tx('after', '2026-10-06', 900)];

test('date ranges validate real days, accept a single day and normalize reverse selection', () => {
  assert.equal(parseDay('2026-02-29'), null);
  assert.equal(parseDay('2026-04-31'), null);
  assert.equal(parseDay('2026-13-01'), null);
  assert.equal(parseDay('2026-10-5'), null);
  assert.equal(localDayKey(parseDay('2028-02-29')), '2028-02-29');
  assert.deepEqual(parseDateRange('2026-10-05'), { from: '2026-10-05', to: '2026-10-05' });
  assert.deepEqual(parseDateRange('2026-10-05', '2026-09-30'), { from: '2026-09-30', to: '2026-10-05' });
  assert.equal(parseDateRange('2026-02-30', '2026-03-01'), null);
  assert.equal(dateRangeLabel({ from: '2026-10-05', to: '2026-10-05' }), '05/10');
  assert.equal(dateRangeLabel({ from: '2025-12-31', to: '2026-01-01' }, true), '31/12/2025 – 01/01/2026');
});

test('a selected day includes all its expenses and no entries from adjacent days', () => {
  const view = getTransactionView(records, { month: new Date(2026, 9, 1), type: 'despesa', dateRange: { from: '2026-10-05', to: '2026-10-05' } });
  assert.deepEqual(view.items.map((item) => item.id), ['end-pm', 'end-am']);
  assert.equal(view.expenses, 35.2);
  assert.equal(view.income, 0);
  assert.equal(view.carriedBalance, 0);
});

test('intervals span months inclusively, total only the chosen period and intersect other filters', () => {
  const filters = { month: new Date(2026, 8, 1), dateRange: { from: '2026-09-30', to: '2026-10-05' } };
  const view = getTransactionView(records, filters);
  assert.equal(view.items.length, 4);
  assert.equal(view.expenses, 45.3);
  assert.equal(view.income, 100);
  assert.equal(view.carriedBalance, 0);
  const narrowed = getTransactionView(records, { ...filters, type: 'despesa', category: 'alimentacao', search: 'alimenta' });
  assert.deepEqual(narrowed.items.map((item) => item.id), ['end-am', 'start']);
  assert.equal(narrowed.expenses, 30.3);
  assert.equal(getTransactionView(records, { ...filters, search: 'nenhum' }).items.length, 0);
  const month = getTransactionView(records, { month: filters.month });
  assert.deepEqual(month.items.map((item) => item.id), ['start', 'before']);
});

test('intervals cross year boundaries and include leap days without UTC day shifts', () => {
  const range = { from: '2025-12-31', to: '2026-01-01' };
  const data = [tx('dec', range.from, 1), tx('jan', range.to, 2), tx('next', '2026-01-02', 4)];
  assert.equal(getTransactionView(data, { month: new Date(2025, 11, 1), dateRange: range }).expenses, 3);
  assert.equal(getTransactionView([tx('leap', '2028-02-29', 8)], { month: new Date(2028, 1, 1), dateRange: { from: '2028-02-29', to: '2028-02-29' } }).expenses, 8);
});

const goal = { id: 'goal', titulo: 'Fone', valorAlvo: 600, valorAtual: 120, meses: 6, criadaEm: '2026-10-05T12:00:00' };
test('contribution forecast uses the remaining money and recalculates with progress and time', () => {
  const forecast = goalForecast(goal, new Date(2026, 9, 5));
  assert.deepEqual(forecast, { status: 'active', remaining: 480, deadline: '2027-04-05', contributions: 6, monthly: 80 });
  assert.equal(goalForecast({ ...goal, valorAtual: 300 }, new Date(2026, 9, 5)).monthly, 50);
  assert.equal(goalForecast(goal, new Date(2027, 0, 5)).monthly, 160);
  const rounded = goalForecast({ ...goal, valorAlvo: 100, valorAtual: 0, meses: 3 }, new Date(2026, 9, 5));
  assert.equal(rounded.monthly, 33.34);
  assert.ok(rounded.monthly * rounded.contributions >= rounded.remaining);
});

test('forecast clamps month ends and handles completed, overdue and legacy undated goals', () => {
  const january = { ...goal, meses: 1, criadaEm: '2027-01-31T12:00:00' };
  assert.equal(goalForecast(january, new Date(2027, 0, 31)).deadline, '2027-02-28');
  assert.equal(goalForecast({ ...january, criadaEm: '2028-01-31T12:00:00' }, new Date(2028, 0, 31)).deadline, '2028-02-29');
  const due = goalForecast(goal, new Date(2027, 3, 5));
  assert.equal(due.contributions, 1);
  assert.equal(due.monthly, 480);
  assert.equal(goalForecast(goal, new Date(2027, 3, 6)).status, 'overdue');
  assert.equal(goalForecast({ ...goal, valorAtual: 600 }, new Date(2027, 3, 6)).status, 'complete');
  assert.equal(goalForecast({ ...goal, meses: undefined }, new Date(2026, 9, 5)).status, 'unscheduled');
  assert.equal(goalForecast({ ...goal, prazo: '2026-11-05' }, new Date(2026, 9, 5)).monthly, 480);
});
