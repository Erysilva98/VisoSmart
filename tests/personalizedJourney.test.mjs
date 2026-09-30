import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
async function moduleUrl(path, replacements = {}) {
  let { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  for (const [name, url] of Object.entries(replacements)) outputText = outputText.replace(name, url);
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const categories = await moduleUrl('../src/data/categories.ts');
const { syncCategories, CATEGORIES } = await import(categories);
const { categoryOrder, profileForExperience, initialBalanceValue, withInitialBalance } = await import(await moduleUrl('../src/lib/personalization.ts', { '@/data/categories': categories }));
const { monthlyMissions, missionProgress } = await import(await moduleUrl('../src/lib/journeyMissions.ts'));
const { orderedTrail, TRAIL_LESSONS } = await import(await moduleUrl('../src/data/trailLessons.ts'));
const prefs = { experience: 1, incomeCategories: ['bolsa', 'estagio'], expenseCategories: ['educacao', 'transporte'], focus: 'save' };
test('custom categories survive hydration, edits retain identifiers, and deselection preserves history metadata', () => {
  const custom = { id: 'custom_test', nome: 'Pets', cor: '#123456', icon: 'HeartPulse', tipo: 'despesa' };
  try {
    syncCategories([custom]);
    assert.deepEqual(categoryOrder('despesa', { ...prefs, expenseCategories: [custom.id] }), [custom.id]);
    assert.ok(!categoryOrder('receita', { ...prefs, incomeCategories: [custom.id] }).length);
    syncCategories([{ ...custom, nome: 'Meu pet', cor: '#654321' }]);
    assert.equal(CATEGORIES[custom.id].nome, 'Meu pet');
    assert.equal(CATEGORIES[custom.id].cor, '#654321');
    assert.deepEqual(categoryOrder('despesa', { ...prefs, expenseCategories: [] }), []);
    assert.equal(CATEGORIES[custom.id].id, custom.id);
  } finally { syncCategories(); }
  assert.equal(CATEGORIES[custom.id], undefined);
});
test('experience selects three profiles and preferences restrict registration categories', () => {
  assert.deepEqual([0, 1, 2].map(profileForExperience), ['explorer', 'equilibrado', 'construtor']);
  assert.deepEqual(categoryOrder('receita', prefs).slice(0, 2), ['bolsa', 'estagio']);
  assert.deepEqual(categoryOrder('despesa', prefs).slice(0, 2), ['educacao', 'transporte']);
  assert.ok(!categoryOrder('despesa', prefs).includes('lazer'));
  assert.ok(categoryOrder('despesa').includes('lazer'));
  assert.deepEqual(categoryOrder('despesa', { ...prefs, expenseCategories: [] }), []);
  assert.ok(!categoryOrder('receita', prefs).includes('saldo_inicial'));
});
test('initial balance becomes one identifiable entry, updates without duplication, and preserves unrelated data', () => {
  const expense = { id: 'expense', tipo: 'despesa', categoria: 'alimentacao', valor: 20, data: '2026-09-02' };
  const first = withInitialBalance([expense], 100, '2026-09-01T12:00:00');
  const revised = withInitialBalance(first, 150, '2026-09-30T12:00:00');
  assert.equal(revised.length, 2);
  assert.equal(revised[0].origem, 'saldo_inicial');
  assert.equal(revised[0].data, '2026-09-01T12:00:00');
  assert.equal(initialBalanceValue(revised, 100), 150);
  assert.deepEqual(revised[1], expense);
  assert.equal(withInitialBalance([], 0, '2026-09-01')[0].valor, 0);
});
test('four missions are unique and focus changes the fourth objective', () => {
  for (const profile of ['explorer', 'equilibrado', 'construtor']) {
    for (const focus of ['understand', 'organize', 'save']) {
      const missions = monthlyMissions(profile, '2026-09', focus);
      assert.equal(missions.length, 4);
      assert.equal(new Set(missions.map((item) => item.id)).size, 4);
      assert.ok(missions.some((item) => item.validacao === (focus === 'save' ? 'goal' : 'review')));
    }
  }
});
test('mission progress is monthly and two reviews of the same lesson only count once', () => {
  const missions = monthlyMissions('explorer', '2026-09');
  const state = { transactions: [{ tipo: 'despesa', categoria: 'alimentacao', data: '2026-09-02' }, { tipo: 'despesa', categoria: 'lazer', data: '2026-08-02' }], budgets: [{ categoria: 'alimentacao', limite: 30 }], goals: [], learningActions: { budget: '2026-08-20' }, lessonProgress: [{ lessonId: 'trail-categories', concluido: true, concluidoEm: '2026-09-01' }], lessonReviews: { 'trail-categories': '2026-09-02' } };
  assert.equal(missionProgress(missions.find((item) => item.validacao === 'categories'), state).current, 1);
  assert.equal(missionProgress(missions.find((item) => item.validacao === 'budget'), state).current, 0);
  assert.equal(missionProgress(missions.find((item) => item.validacao === 'learn'), state).current, 1);
  state.lessonReviews['trail-income'] = '2026-09-03';
  assert.equal(missionProgress(missions.find((item) => item.validacao === 'learn'), state).current, 2);
});
test('trail contains 18 unique concepts and profile/focus meaningfully reorder it', () => {
  assert.equal(TRAIL_LESSONS.length, 18);
  assert.equal(new Set(TRAIL_LESSONS.map((item) => item.titulo)).size, 18);
  assert.ok(TRAIL_LESSONS.every((item) => item.question && item.question.options[item.question.correct] && item.xp > 0));
  assert.notEqual(orderedTrail('explorer')[0].id, orderedTrail('equilibrado')[0].id);
  assert.notEqual(orderedTrail('explorer')[0].id, orderedTrail('construtor')[0].id);
  assert.equal(orderedTrail('equilibrado', 'save')[0].id, 'trail-goal');
});
