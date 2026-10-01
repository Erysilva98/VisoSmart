import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const output = await build({
  entryPoints: ['./src/store/useStore.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  plugins: [{
    name: 'memory-db',
    setup(plugin) {
      plugin.onResolve({ filter: /[/\\]lib[/\\]db$/ }, () => ({ path: 'memory-db', namespace: 'test' }));
      plugin.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: `
        export const requestPersistentStorage = async () => true;
        export const loadState = async () => null;
        export const saveState = async () => undefined;
        export const clearState = async () => undefined;
      `, loader: 'js' }));
    },
  }],
});

const storeModule = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].contents).toString('base64')}`);
const { useStore } = storeModule;
const state = () => useStore.getState();

const transactionId = state().addTransaction({ tipo: 'despesa', categoria: 'alimentacao', valor: 15, data: '2026-09-30T12:00:00' });
assert.equal(state().transactions.length, 1);
state().deleteTransaction(transactionId);
assert.equal(state().transactions.length, 0);

state().setMoneyContext(700, 'irregular');
state().addGoal({ titulo: 'Fone', valorAlvo: 300, meses: 6, icone: 'Headphones' });
state().updateGoal(state().goals[0].id, 100);
const goal = state().goals[0];
const investment = state().investments.find((item) => item.metaId === goal.id);
assert.ok(investment);
const withdrawalId = state().deleteGoal(goal.id);
assert.ok(withdrawalId);
assert.equal(state().goals.length, 0);
assert.ok(state().transactions.some((item) => item.id === withdrawalId));
state().restoreGoal(goal, investment, withdrawalId);
assert.equal(state().goals[0].id, goal.id);
assert.equal(state().investments.filter((item) => item.metaId === goal.id).length, 1);
assert.equal(state().transactions.some((item) => item.id === withdrawalId), false);
assert.equal(state().transactions.filter((item) => item.origem === 'meta_aporte').length, 1);

await state().resetApp();
console.log('Desfazer registro e restaurar meta preservam o estado local.');
