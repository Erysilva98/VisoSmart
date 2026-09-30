import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/spendingAlert.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { spendingAlert } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const categories = (valor) => [{ categoria: 'alimentacao', valor }];
const budgets = [{ categoria: 'alimentacao', limite: 100 }];
test('guidance distinguishes missing data, approaching limits and exceeding limits', () => {
  assert.equal(spendingAlert(700, [], budgets).level, 'yellow');
  assert.equal(spendingAlert(700, categories(79.99), budgets).level, 'green');
  assert.equal(spendingAlert(700, categories(80), budgets).level, 'yellow');
  assert.equal(spendingAlert(700, categories(100), budgets).level, 'yellow');
  assert.equal(spendingAlert(700, categories(100.01), budgets).level, 'red');
});
test('negative available money takes precedence; absent and zero budgets behave explicitly', () => {
  assert.equal(spendingAlert(-1, [], []).level, 'red');
  assert.equal(spendingAlert(100, categories(50), []).level, 'green');
  assert.equal(spendingAlert(100, categories(1), [{ categoria: 'alimentacao', limite: 0 }]).level, 'red');
});
