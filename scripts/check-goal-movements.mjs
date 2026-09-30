import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const output = await build({
  entryPoints: ['./src/lib/transactionView.ts', './src/lib/financialSummary.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outdir: 'check',
  write: false,
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
});

async function moduleFor(name) {
  const file = output.outputFiles.find((item) => item.path.endsWith(`${name}.js`));
  return import(`data:text/javascript;base64,${Buffer.from(file.contents).toString('base64')}`);
}

const { getTransactionView } = await moduleFor('transactionView');
const { recordedMoney, spendingSummary } = await moduleFor('financialSummary');
const month = new Date(2026, 8, 1);
const transactions = [
  { id: 'open', tipo: 'receita', categoria: 'saldo_inicial', origem: 'saldo_inicial', valor: 700, data: '2026-09-01T12:00:00' },
  { id: 'deposit', tipo: 'transferencia', categoria: 'metas', origem: 'meta_aporte', valor: 20, data: '2026-09-02T12:00:00', metaId: 'goal' },
  { id: 'withdraw', tipo: 'transferencia', categoria: 'saque', origem: 'meta_saque', valor: 5, data: '2026-09-03T12:00:00', metaId: 'goal' },
  { id: 'expense', tipo: 'despesa', categoria: 'alimentacao', valor: 10, data: '2026-09-04T12:00:00' },
];
const goals = [{ id: 'goal', titulo: 'Fone', valorAtual: 15, valorAlvo: 100, criadaEm: '2026-09-01' }];
const monthView = getTransactionView(transactions, { month });
const incomeView = getTransactionView(transactions, { month, type: 'receita' });
const expenseView = getTransactionView(transactions, { month, type: 'despesa' });
const money = recordedMoney(transactions, goals, 0, new Date(2026, 8, 30));
const summary = spendingSummary(transactions, [{ categoria: 'alimentacao', limite: 8 }], month);

assert.equal(monthView.income, 700);
assert.equal(monthView.expenses, 10);
assert.equal(monthView.balance, 675);
assert.equal(incomeView.items.length, 1);
assert.equal(expenseView.items.length, 1);
assert.equal(money.total, 690);
assert.equal(money.reserved, 15);
assert.equal(money.available, 675);
assert.equal(summary.over.length, 1);
assert.equal(summary.over[0].excess, 2);
console.log('Transferências de metas preservam receitas, despesas e alertas de limites.');
