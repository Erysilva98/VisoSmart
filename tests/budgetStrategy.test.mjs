import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/budgetStrategy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { recommendBudgetStrategy, splitBudgetAmount, BUDGET_GROUPS } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const profiles = ['explorer', 'equilibrado', 'construtor', 'estrategista', 'mestre'];

test('all profiles use 50% essentials, 30% expenses and 20% savings', () => {
  for (const profile of profiles) {
    const strategy = recommendBudgetStrategy(profile, 1000, new Map());
    assert.deepEqual([strategy.essential, strategy.lifestyle, strategy.goals], [50, 30, 20]);
    assert.deepEqual([strategy.essentialLimit, strategy.lifestyleLimit, strategy.goalsLimit], [500, 300, 200]);
  }
});
test('high essential spending never changes the agreed strategy', () => {
  for (const profile of profiles) {
    const strategy = recommendBudgetStrategy(profile, 1000, new Map([['moradia', 900], ['saude', 400]]));
    assert.equal(strategy.currentEssential, 1300);
    assert.equal(strategy.id, '50-30-20');
    assert.equal(strategy.essentialLimit, 500);
    assert.equal(strategy.adjustedForReality, false);
  }
});
test('group and category allocations preserve every cent, including small incomes', () => {
  for (let cents = 0; cents <= 12345; cents++) {
    const strategy = recommendBudgetStrategy('explorer', cents / 100, new Map());
    const amounts = [strategy.essentialLimit, strategy.lifestyleLimit, strategy.goalsLimit];
    assert.equal(amounts.reduce((sum, amount) => sum + Math.round(amount * 100), 0), cents);
    amounts.forEach((amount, index) => {
      const split = splitBudgetAmount(amount, BUDGET_GROUPS[index].categories.length);
      assert.equal(split.reduce((sum, value) => sum + Math.round(value * 100), 0), Math.round(amount * 100));
      assert.ok(split.every((value) => value >= 0));
    });
  }
});
test('no income produces zero limits and category groups do not overlap', () => {
  for (const income of [0, -10, NaN, Infinity]) {
    const result = recommendBudgetStrategy('construtor', income, new Map());
    assert.deepEqual([result.essentialLimit, result.lifestyleLimit, result.goalsLimit], [0, 0, 0]);
  }
  const categories = BUDGET_GROUPS.flatMap((group) => group.categories);
  assert.equal(new Set(categories).size, categories.length);
  assert.ok(categories.includes('outros'));
  assert.deepEqual(splitBudgetAmount(100, 0), []);
});
