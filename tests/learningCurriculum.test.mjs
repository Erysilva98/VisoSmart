import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { tsLoader } from './helpers/loadTs.mjs';

const loader = await tsLoader({
  'lib/db.ts': 'export const saveState = async (state) => { globalThis.__nyxSaved = state; }; export const loadState = async () => globalThis.__nyxSaved ?? null; export const clearState = async () => { globalThis.__nyxSaved = null; }; export const requestPersistentStorage = async () => false;',
  'lib/storageStatus.ts': 'export const setStorageStatus = () => {};',
});
after(loader.cleanup);
const { TRAIL_LESSONS, orderedTrail } = await loader.load('data/trailLessons');
const { monthlyMissions, missionProgress, MONTHLY_THEMES } = await loader.load('lib/journeyMissions');
const { practiceProgress, lessonPracticeProgress } = await loader.load('lib/practice');
const { useStore } = await loader.load('store/useStore');
const { canCompleteLesson } = await loader.load('lib/progress');
const profiles = ['explorer', 'equilibrado', 'construtor'];
const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const empty = () => ({ transactions: [], goals: [], budgets: [], lessonProgress: [], practiceEvents: [] });
const movement = (id, category, value, period = month) => ({ id, tipo: 'despesa', categoria: category, valor: value, data: `${period}-01T12:00:00` });

test('removed export and data panels never block lessons or monthly missions', () => {
  const retired = new Set(['exportReport', 'dataHelp', 'privacy']);
  const activities = [...TRAIL_LESSONS, ...profiles.flatMap((profile) => Array.from({ length: 12 }, (_, i) => monthlyMissions(profile, `2026-${String(i + 1).padStart(2, '0')}`)).flat())];
  for (const activity of activities) assert.ok(activity.requirements.every((rule) => rule.actions.every((action) => !retired.has(action))), activity.id);
});

test('existing monthly missions migrate retired actions without losing completion or XP', () => {
  const previous = useStore.getState();
  try {
    const missions = monthlyMissions('construtor', month);
    missions[0] = { ...missions[0], concluido: true, requirements: [{ actions: ['exportReport'], label: 'Old export', route: '/perfil' }] };
    useStore.setState({ onboarding: { completed: true, profile: 'construtor', score: 0 }, challenges: missions, challengeHistory: [], xp: 120 });
    useStore.getState()._ensureMonthlyChallenges();
    const updated = useStore.getState();
    assert.equal(updated.challenges.length, 4);
    assert.equal(updated.challenges[0].concluido, true);
    assert.equal(updated.xp, 120);
    assert.ok(updated.challenges[0].requirements.every((rule) => !rule.actions.includes('exportReport')));
  } finally { useStore.setState(previous, true); }
});

test('90 distinct lessons: three linear curricula, six modules each, with explicit practice and quizzes', () => {
  assert.equal(TRAIL_LESSONS.length, 90);
  assert.equal(new Set(TRAIL_LESSONS.map((item) => item.id)).size, 90);
  assert.equal(new Set(TRAIL_LESSONS.map((item) => item.titulo)).size, 90);
  for (const profile of profiles) {
    const lessons = orderedTrail(profile);
    assert.equal(lessons.length, 30);
    assert.deepEqual(lessons.map((item) => item.order), Array.from({ length: 30 }, (_, index) => index + 1));
    assert.deepEqual(orderedTrail(profile, 'save'), lessons, 'focus must not allow skipping fundamentals');
    const modules = new Map();
    for (const lesson of lessons) {
      modules.set(lesson.modulo, (modules.get(lesson.modulo) ?? 0) + 1);
      assert.deepEqual(lesson.perfil, [profile]);
      assert.equal(lesson.question.options.length, 3);
      assert.equal(new Set(lesson.question.options).size, 3);
      assert.ok(lesson.question.options[lesson.question.correct]);
      assert.ok(lesson.requirements.length);
      assert.notEqual(lesson.desafioPratico.validacao, 'reflexao');
      assert.ok(lesson.xp > 0 && lesson.conteudo.length > 60);
      assert.ok(lesson.requirements.every((rule) => rule.actions.length && /^\/(dashboard|gastos|metas|orcamentos|perfil)(\?|$)/.test(rule.route)));
    }
    assert.equal(modules.size, 6);
    assert.ok([...modules.values()].every((size) => size === 5));
  }
  assert.deepEqual(orderedTrail('mestre'), orderedTrail('construtor'));
});

test('12 cycles × 3 profiles × 4 missions, deterministic IDs and explicit requirements', () => {
  const ids = new Set();
  assert.equal(MONTHLY_THEMES.length, 12);
  for (const profile of profiles) for (let m = 1; m <= 12; m++) {
    const period = `2026-${String(m).padStart(2, '0')}`;
    const missions = monthlyMissions(profile, period);
    assert.equal(missions.length, 4);
    assert.deepEqual(missions, monthlyMissions(profile, period));
    for (const mission of missions) {
      ids.add(mission.id);
      assert.equal(mission.perfil, profile);
      assert.equal(mission.theme, MONTHLY_THEMES[m - 1]);
      assert.ok(mission.requirements.every((rule) => rule.actions.length && (rule.count ?? 1) > 0));
    }
  }
  assert.equal(ids.size, 144);
  assert.deepEqual(monthlyMissions('explorer', '2026-13'), []);
  assert.notEqual(monthlyMissions('explorer', '2026-01')[0].id, monthlyMissions('explorer', '2027-01')[0].id);
});

test('mission context uses actual top category and adapts activity to available history', () => {
  const context = { ...empty(), transactions: [movement('a', 'alimentacao', 120, '2026-01'), movement('b', 'lazer', 40, '2026-01'), ...Array.from({ length: 30 }, (_, index) => movement(`old-${index}`, 'lazer', 1, '2025-12'))] };
  const missions = monthlyMissions('explorer', '2026-01', 'understand', context);
  assert.equal(missions[2].contextCategory, 'alimentacao');
  assert.equal(missions[2].requirements[0].entity, 'alimentacao');
  assert.match(missions[2].categoria, /category=alimentacao/);
  assert.equal(missions[0].requirements[0].count, 2, 'do not demand more expenses than existing history');
  const blank = monthlyMissions('explorer', '2026-01');
  assert.deepEqual(blank[0].requirements.map((rule) => rule.actions[0]), ['statement', 'expenseCategories']);
  assert.ok(blank[0].descricao.includes('sem salvar'));
});

test('practice rejects prior lesson evidence, wrong categories, repeated entities and wrong months', () => {
  const lesson = orderedTrail('explorer')[0];
  const state = { ...empty(), lessonStarts: { [lesson.id]: 5 }, practiceEvents: [{ sequence: 5, action: 'home', at: '2026-09-01', month: '2026-09' }] };
  assert.equal(lessonPracticeProgress(lesson, state)[0].current, 0);
  state.practiceEvents.push({ sequence: 6, action: 'home', at: '2026-09-02', month: '2026-09' });
  assert.equal(lessonPracticeProgress(lesson, state)[0].current, 1);
  assert.equal(lessonPracticeProgress(lesson, { ...state, lessonStarts: {} })[0].current, 0);
  const rules = [{ actions: ['categoryFilter'], label: 'Two', route: '/gastos', distinct: true, count: 2 }];
  state.practiceEvents = [1, 2].map((sequence) => ({ sequence, action: 'categoryFilter', entity: 'lazer', at: '2026-09-02', month: '2026-09' }));
  assert.equal(practiceProgress(rules, state, -1, '2026-09')[0].current, 1);
  state.practiceEvents.push({ sequence: 3, action: 'categoryFilter', entity: 'alimentacao', at: '2026-08-20', month: '2026-09' });
  assert.equal(practiceProgress(rules, state, -1, '2026-09')[0].current, 1);
  state.practiceEvents[2].at = '2026-09-20';
  state.practiceEvents[2].month = '2026-08';
  assert.equal(practiceProgress(rules, state, -1, '2026-09')[0].current, 1);
  assert.equal(practiceProgress([{ ...rules[0], entity: 'outros' }], state)[0].current, 0);
});

test('store enforces active profile, sequence, question, new practice and one XP award', async () => {
  await useStore.getState().resetApp();
  useStore.getState().completeOnboarding(0);
  const [first, second] = orderedTrail('explorer');
  useStore.getState().recordPractice('home');
  useStore.getState().startLesson(first.id);
  assert.equal(canCompleteLesson(first.id, useStore.getState()), false);
  useStore.getState().completeLesson(first.id, first.question.correct);
  assert.equal(useStore.getState().xp, 0);
  useStore.getState().recordPractice('statement');
  useStore.getState().recordPractice('home');
  assert.equal(canCompleteLesson(first.id, useStore.getState()), true);
  useStore.getState().completeLesson(first.id, (first.question.correct + 1) % 3);
  assert.equal(useStore.getState().xp, 0);
  useStore.getState().completeLesson(second.id, second.question.correct);
  useStore.getState().completeLesson(orderedTrail('construtor')[0].id, 0);
  assert.equal(useStore.getState().xp, 0);
  useStore.getState().answerLesson(first.id, first.question.correct);
  assert.equal(useStore.getState().lessonAnswers[first.id], first.question.correct);
  useStore.getState().completeLesson(first.id, first.question.correct);
  useStore.getState().completeLesson(first.id, first.question.correct);
  assert.equal(useStore.getState().xp, first.xp);
  useStore.getState().reviewLesson(first.id, first.question.correct);
  assert.equal(useStore.getState().xp, first.xp);
  useStore.getState().startLesson(second.id);
  assert.equal(canCompleteLesson(second.id, useStore.getState()), false);
  const start = useStore.getState().lessonStarts[second.id];
  useStore.getState().recordPractice('incomeCategories');
  useStore.getState().startLesson(second.id);
  assert.equal(useStore.getState().lessonStarts[second.id], start, 'returning to the lesson preserves the activity baseline');
  useStore.getState().recordPractice('expenseCategories');
  assert.equal(canCompleteLesson(second.id, useStore.getState()), true);
});

test('related activities require the same category, and comparisons use the same month', () => {
  const rules = [
    { actions: ['categoryFilter'], group: 'pair', label: 'Category', route: '/gastos' },
    { actions: ['saveLimit'], group: 'pair', label: 'Limit', route: '/orcamentos' },
  ];
  const state = { practiceEvents: [
    { sequence: 1, action: 'categoryFilter', entity: 'alimentacao', at: `${month}-01`, month },
    { sequence: 2, action: 'saveLimit', entity: 'lazer', at: `${month}-01`, month },
  ] };
  assert.ok(practiceProgress(rules, state).every((step) => step.current === 0));
  state.practiceEvents[1].entity = 'alimentacao';
  assert.ok(practiceProgress(rules, state).every((step) => step.current === 1));
  const compare = [{ actions: ['categoryFilter'], label: 'Compare', route: '/gastos', count: 2, distinct: true, sameMonth: true }];
  state.practiceEvents[1] = { ...state.practiceEvents[1], action: 'categoryFilter', entity: 'lazer', month: '2000-01' };
  assert.equal(practiceProgress(compare, state)[0].current, 1);
});

test('financial mutations produce truthful events: no contribution without funds or update without a change', async () => {
  await useStore.getState().resetApp();
  useStore.getState().completeOnboarding(0);
  useStore.getState().addGoal({ titulo: 'Livro', valorAlvo: 50, meses: 2 });
  const goalId = useStore.getState().goals[0].id;
  useStore.getState().updateGoal(goalId, 10);
  assert.equal(useStore.getState().practiceEvents.some((event) => event.action === 'contribution'), false);
  useStore.getState().addTransaction({ tipo: 'receita', categoria: 'mesada', valor: 30, data: `${month}-01` });
  useStore.getState().updateGoal(goalId, 10);
  assert.ok(useStore.getState().practiceEvents.some((event) => event.action === 'contribution' && event.entity === goalId));
  const count = useStore.getState().practiceEvents.filter((event) => event.action === 'contribution').length;
  useStore.getState().updateGoal(goalId, 10);
  assert.equal(useStore.getState().practiceEvents.filter((event) => event.action === 'contribution').length, count);
  useStore.getState().setBudget('lazer', 20);
  useStore.getState().setBudget('lazer', 20);
  assert.equal(useStore.getState().practiceEvents.some((event) => event.action === 'updateLimit'), false);
  useStore.getState().setBudget('lazer', 25);
  assert.ok(useStore.getState().practiceEvents.some((event) => event.action === 'updateLimit'));
  useStore.getState().setBudget('lazer', -1);
  assert.equal(useStore.getState().budgets[0].limite, 25);
});

test('hydration preserves answers, activity markers and XP while migrating legacy profile aliases', async () => {
  await useStore.getState().resetApp();
  const lesson = orderedTrail('construtor')[0];
  globalThis.__nyxSaved = { ...useStore.getState(), onboarding: { completed: true, profile: 'mestre', initialProfile: 'mestre', score: 90 }, xp: 75, lessonStarts: { [lesson.id]: 7 }, lessonAnswers: { [lesson.id]: lesson.question.correct }, practiceSequence: 8, practiceEvents: [{ sequence: 8, action: 'home', at: `${month}-01`, month }], lessonProgress: [{ lessonId: 'trail-categories', concluido: true }] };
  await useStore.getState().init();
  assert.equal(useStore.getState().onboarding.profile, 'construtor');
  assert.equal(useStore.getState().xp, 75);
  assert.equal(useStore.getState().lessonStarts[lesson.id], 7);
  assert.equal(useStore.getState().lessonAnswers[lesson.id], lesson.question.correct);
  assert.equal(useStore.getState().practiceEvents.length, 1);
  assert.ok(useStore.getState().lessonProgress.some((item) => item.lessonId === 'trail-categories'));
});

test('all 90 lesson validations are satisfiable with their explicit activities and stay linear', async () => {
  for (const profile of profiles) {
    await useStore.getState().resetApp();
    useStore.setState({ onboarding: { completed: true, profile, initialProfile: profile, score: 0 } });
    let expectedXp = 0;
    for (const lesson of orderedTrail(profile)) {
      useStore.getState().startLesson(lesson.id);
      assert.equal(canCompleteLesson(lesson.id, useStore.getState()), false, lesson.id);
      for (const [index, rule] of lesson.requirements.entries()) for (let i = 0; i < (rule.count ?? 1); i++) {
        useStore.getState().recordPractice(rule.actions[0], rule.entity ?? `${lesson.id}-${rule.group ?? index}-${i}`);
      }
      assert.equal(canCompleteLesson(lesson.id, useStore.getState()), true, lesson.id);
      useStore.getState().completeLesson(lesson.id, lesson.question.correct);
      expectedXp += lesson.xp;
      assert.equal(useStore.getState().xp, expectedXp, lesson.id);
    }
    assert.equal(useStore.getState().lessonProgress.length, 30);
  }
});

test('monthly missions freeze context when started, persist completions and reject double XP', async () => {
  await useStore.getState().resetApp();
  useStore.getState().completeOnboarding(0);
  const mission = useStore.getState().challenges.find((item) => item.mes === month);
  useStore.getState().startMission(mission.id);
  const started = useStore.getState().challenges.find((item) => item.id === mission.id);
  assert.equal(started.started, true);
  useStore.getState().addTransaction({ tipo: 'despesa', categoria: 'alimentacao', valor: 10, data: `${month}-01` });
  useStore.getState().startMission(mission.id);
  assert.deepEqual(useStore.getState().challenges.find((item) => item.id === mission.id), started);
  for (const [index, rule] of started.requirements.entries()) for (let i = 0; i < (rule.count ?? 1); i++) useStore.getState().recordPractice(rule.actions[0], rule.entity ?? `mission-${index}-${i}`);
  const progress = missionProgress(started, useStore.getState());
  assert.equal(progress.current, progress.target);
  useStore.getState().completeChallenge(mission.id);
  useStore.getState().completeChallenge(mission.id);
  assert.equal(useStore.getState().xp, mission.xp);
  assert.ok(useStore.getState().challengeHistory.some((entry) => entry.templateId === mission.id));
  useStore.getState()._ensureMonthlyChallenges();
  assert.equal(useStore.getState().challenges.filter((item) => item.id === mission.id).length, 1);
  assert.equal(useStore.getState().challenges.find((item) => item.id === mission.id).concluido, true);
  const old = { ...started, id: 'old', mes: '2000-01', concluido: false };
  useStore.setState({ challenges: [old] });
  useStore.getState().completeChallenge('old');
  assert.equal(useStore.getState().xp, mission.xp);
});

test('legacy history remains intact and cannot grant new XP; reset clears practice data', async () => {
  await useStore.getState().resetApp();
  const legacy = [{ lessonId: 'trail-categories', concluido: true, concluidoEm: '2025-01-01' }];
  useStore.setState({ lessonProgress: legacy, xp: 75, onboarding: { completed: true, profile: 'explorer', initialProfile: 'explorer', score: 0 } });
  useStore.getState().completeLesson('trail-income', 0);
  assert.equal(useStore.getState().xp, 75);
  assert.deepEqual(useStore.getState().lessonProgress, legacy);
  useStore.getState().recordPractice('home');
  await useStore.getState().resetApp();
  assert.deepEqual(useStore.getState().practiceEvents, []);
  assert.deepEqual(useStore.getState().lessonStarts, {});
  assert.deepEqual(useStore.getState().lessonAnswers, {});
  assert.equal(useStore.getState().xp, 0);
});
