import { syncCategories } from '@/data/categories';
import { localDateTime, withInitialBalance } from '@/lib/personalization';
import { monthlyMissions } from '@/lib/journeyMissions';
import { create } from 'zustand';
import type {
  AppState, CategoryDefinition, Transaction, Goal, Investment, JourneyPreferences, LearningAction, PracticeAction,
  Budget, LessonProgress, CategoryId, OnboardingState, PlannedExpense, CreditCard, CreditCardExpense,
} from '@/types';
import { clearState, loadState, requestPersistentStorage, saveState } from '@/lib/db';
import { setStorageStatus } from '@/lib/storageStatus';
import { getProfileFromExperience, getProfileFromScore } from '@/data/profiles';
import { getCurrentMonthKey } from '@/data/challenges';
import { canCompleteChallenge, canCompleteLesson } from '@/lib/progress';
import { getLessonById, getLessonsForProfile } from '@/data/lessons';
import { recordedMoney } from '@/lib/financialSummary';
import { isCardExpenseDue } from '@/lib/forecast';

const DEFAULT_CARDS = ['saldo', 'entradas_saidas', 'gastos_categoria', 'score', 'metas'];

function initialState(): AppState {
  return {
    onboarding: { completed: false, score: 0, profile: null, initialProfile: null },
    transactions: [],
    goals: [],
    investments: [],
    challenges: [],
    challengeHistory: [],
    lessonProgress: [],
    budgets: [],
    plannedExpenses: [],
    creditCards: [],
    creditCardExpenses: [],
    xp: 0,
    cardOrder: [...DEFAULT_CARDS],
    disabledCards: [],
  };
}

interface StoreActions {
  startMission: (id: string) => void;
  recordPractice: (action: PracticeAction, entity?: string, month?: string) => void;
  startLesson: (lessonId: string) => void;
  answerLesson: (lessonId: string, answer: number) => void;
  saveCategoryPreferences: (definitions: CategoryDefinition[], preferences: JourneyPreferences) => void;
  init: () => Promise<void>;
  completeOnboarding: (score: number, preferences?: JourneyPreferences) => void;
  updatePreferences: (preferences: JourneyPreferences) => void;
  recordLearningAction: (action: LearningAction) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => string;
  restoreTransaction: (transaction: Transaction) => void;
  setMoneyContext: (openingBalance: number, incomePattern: 'regular' | 'irregular') => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id' | 'criadaEm' | 'valorAtual'>) => void;
  updateGoal: (id: string, valorAtual: number) => void;
  deleteGoal: (id: string) => string | null;
  restoreGoal: (goal: Goal, investment: Investment | undefined, withdrawalId: string | null) => void;
  reorderGoals: (goals: Goal[]) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'criadoEm'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addXp: (amount: number) => void;
  completeChallenge: (id: string) => void;
  completeLesson: (lessonId: string, answer?: number) => void;
  reviewLesson: (lessonId: string, answer: number) => void;
  setBudget: (categoria: CategoryId, limite: number) => void;
  deleteBudget: (categoria: CategoryId) => void;
  addPlannedExpense: (item: Omit<PlannedExpense, 'id' | 'pagamentos' | 'status'>) => void;
  updatePlannedExpense: (id: string, item: Partial<PlannedExpense>) => void;
  deletePlannedExpense: (id: string) => void;
  payPlannedExpense: (id: string, date?: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  addCreditCardExpense: (expense: Omit<CreditCardExpense, 'id' | 'pagamentos'>) => void;
  deleteCreditCardExpense: (id: string) => void;
  payCreditCardInvoice: (cardId: string, monthKey: string) => void;
  toggleCard: (cardId: string) => void;
  reorderCards: (newOrder: string[]) => void;
  resetApp: () => Promise<void>;
  _persist: () => void;
  _ensureMonthlyChallenges: () => void;
}

type Store = AppState & StoreActions;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: AppState | null = null;
let saving = false;
let activeSave: Promise<void> | null = null;
let resetting = false;
let saveListenersRegistered = false;

function flushPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!pendingSave || saving) return;

  const state = pendingSave;
  pendingSave = null;
  saving = true;
  activeSave = saveState(state).then(() => {
    saving = false;
    if (resetting) return;
    if (pendingSave) flushPendingSave();
    else setStorageStatus('idle');
  }).catch((error: unknown) => {
    saving = false;
    if (resetting) return;
    pendingSave ??= state;
    setStorageStatus('error');
    console.error('Não foi possível salvar os dados offline.', error);
  });
}

export function retryPendingSave() {
  if (pendingSave) {
    setStorageStatus('saving');
    flushPendingSave();
  }
}

function registerSaveListeners() {
  if (saveListenersRegistered || typeof window === 'undefined') return;
  saveListenersRegistered = true;
  window.addEventListener('pagehide', flushPendingSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingSave();
    else if (pendingSave) scheduleSave(pendingSave);
  });
}

function scheduleSave(state: AppState) {
  pendingSave = state;
  setStorageStatus('saving');
  registerSaveListeners();
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    flushPendingSave();
  }, 300);
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function updateProfileFromExperience(onboarding: OnboardingState, xp: number): OnboardingState {
  const initialProfile = onboarding.initialProfile ?? onboarding.profile;
  if (!initialProfile) return onboarding;
  return { ...onboarding, initialProfile, profile: getProfileFromExperience(initialProfile, xp) };
}

export const useStore = create<Store>((set, get) => ({
  ...initialState(),
  startMission: (id) => {
    const s = get();
    const mission = s.challenges.find((item) => item.id === id);
    if (!mission || mission.started || mission.concluido || mission.mes !== getCurrentMonthKey() || mission.perfil !== s.onboarding.profile) return;
    const contextual = monthlyMissions(mission.perfil, mission.mes, s.preferences?.focus, s).find((item) => item.id === id);
    if (!contextual) return;
    set({ challenges: s.challenges.map((item) => item.id === id ? { ...contextual, started: true } : item) });
    get()._persist();
  },
  recordPractice: (action, entity, month = getCurrentMonthKey()) => {
    const s = get();
    const now = new Date();
    const at = `${localDateTime(now).slice(0, 10)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const last = s.practiceEvents?.[s.practiceEvents.length - 1];
    if (last?.action === action && last.entity === entity && last.month === month && Date.now() - Date.parse(last.at) < 800) return;
    const sequence = (s.practiceSequence ?? 0) + 1;
    set({ practiceSequence: sequence, practiceEvents: [...(s.practiceEvents ?? []), { sequence, action, entity, month, at }] });
    get()._persist();
  },
  startLesson: (lessonId) => {
    const s = get();
    const next = getLessonsForProfile(s.onboarding.profile ?? 'explorer').find((lesson) => !s.lessonProgress.some((item) => item.lessonId === lesson.id && item.concluido));
    if (next?.id !== lessonId || s.lessonStarts?.[lessonId] !== undefined) return;
    set({ lessonStarts: { ...s.lessonStarts, [lessonId]: s.practiceSequence ?? 0 } });
    get()._persist();
  },
  answerLesson: (lessonId, answer) => {
    const s = get();
    const lesson = getLessonById(lessonId);
    if (!lesson?.question || !Number.isInteger(answer) || !lesson.question.options[answer] || s.lessonStarts?.[lessonId] === undefined) return;
    set({ lessonAnswers: { ...s.lessonAnswers, [lessonId]: answer } });
    get()._persist();
  },
  saveCategoryPreferences: (categoryDefinitions, preferences) => {
    const changed = JSON.stringify(categoryDefinitions) !== JSON.stringify(get().categoryDefinitions ?? []);
    syncCategories(categoryDefinitions);
    set({ categoryDefinitions, preferences });
    get().recordPractice('saveCategories');
    if (changed) get().recordPractice('editCategory');
    get()._persist();
  },

  init: async () => {
    void requestPersistentStorage();
    const saved = await loadState();
    if (saved) {
      const merged = { ...initialState(), ...saved };
      if ((merged.openingBalance ?? 0) > 0) {
        const earliest = [...merged.transactions].sort((a, b) => a.data.localeCompare(b.data))[0]?.data ?? localDateTime();
        merged.transactions = withInitialBalance(merged.transactions, merged.transactions.find((item) => item.origem === 'saldo_inicial')?.valor ?? merged.openingBalance!, earliest);
        merged.openingBalance = 0;
      }
      // Preserve reserves created before transfers were shown in the statement.
      for (const goal of merged.goals) {
        const recordedCents = merged.transactions.filter((item) => item.metaId === goal.id).reduce((sum, item) => sum + Math.round(item.valor * 100) * (item.origem === 'meta_aporte' ? 1 : item.origem === 'meta_saque' ? -1 : 0), 0);
        const missingCents = Math.round(goal.valorAtual * 100) - recordedCents;
        if (missingCents !== 0) merged.transactions = [{ id: uid(), tipo: 'transferencia', categoria: missingCents > 0 ? 'metas' : 'saque', origem: missingCents > 0 ? 'meta_aporte' : 'meta_saque', metaId: goal.id, valor: Math.abs(missingCents) / 100, data: localDateTime(), descricao: goal.titulo }, ...merged.transactions];
      }
      merged.plannedExpenses = merged.plannedExpenses.map((expense) => ({ ...expense, pagamentos: expense.pagamentos ?? [], status: expense.status ?? 'ativo' }));
      const currentMonth = getCurrentMonthKey();
      merged.challenges = merged.challenges.filter((challenge) => !(challenge.mes === currentMonth && (challenge.teste || !challenge.nivelMinimo)));
      merged.cardOrder = [...new Set(merged.cardOrder.filter((cardId) => cardId !== 'contas' && cardId !== 'sugestoes'))];
      merged.disabledCards = merged.disabledCards.filter((cardId) => cardId !== 'contas' && cardId !== 'sugestoes');
      for (const cardId of DEFAULT_CARDS) {
        if (!merged.cardOrder.includes(cardId)) merged.cardOrder.push(cardId);
      }
      merged.onboarding = updateProfileFromExperience(merged.onboarding, merged.xp);
      // Perfis legados avançados passam a fazer parte da etapa Planejador.
      if (merged.onboarding.profile === 'estrategista' || merged.onboarding.profile === 'mestre') {
        merged.onboarding.profile = 'construtor';
      }
      if (merged.onboarding.initialProfile === 'estrategista' || merged.onboarding.initialProfile === 'mestre') {
        merged.onboarding.initialProfile = 'construtor';
      }
      syncCategories(merged.categoryDefinitions);
      set({ ...merged });
      get()._ensureMonthlyChallenges();
      get()._persist();
    }
  },

  completeOnboarding: (score, preferences) => {
    const profile = getProfileFromScore(score);
    set((s) => ({ onboarding: { completed: true, score, profile, initialProfile: profile }, preferences: preferences ?? s.preferences }));
    get()._ensureMonthlyChallenges();
    get()._persist();
  },
  updatePreferences: (preferences) => {
    set({ preferences });
    get()._persist();
  },
  recordLearningAction: (action) => {
    get().recordPractice(action);
    const date = localDateTime();
    if (get().learningActions?.[action] === date) return;
    set((s) => ({ learningActions: { ...s.learningActions, [action]: date } }));
    get()._persist();
  },

  addTransaction: (t) => {
    const transaction: Transaction = { ...t, id: uid() };
    set((s) => ({ transactions: [transaction, ...s.transactions] }));
    if (t.origem !== 'saldo_inicial' && t.tipo !== 'transferencia') {
      get().recordPractice('record', transaction.id, t.data.slice(0, 7));
      get().recordPractice(t.tipo === 'receita' ? 'income' : 'expense', t.categoria, t.data.slice(0, 7));
    }
    get()._persist();
    return transaction.id;
  },
  restoreTransaction: (transaction) => {
    const missing = !get().transactions.some((item) => item.id === transaction.id);
    set((s) => s.transactions.some((item) => item.id === transaction.id) ? s : { transactions: [transaction, ...s.transactions] });
    if (missing) get().recordPractice('undo', transaction.id);
    get()._persist();
  },
  setMoneyContext: (openingBalance, incomePattern) => {
    if (!Number.isFinite(openingBalance) || openingBalance < 0) return;
    set((s) => ({ openingBalance: 0, incomePattern, transactions: withInitialBalance(s.transactions, openingBalance, localDateTime()) }));
    get()._persist();
  },

  // Edição preserva o identificador para manter filtros, desafios e histórico consistentes.
  updateTransaction: (id, transaction) => {
    const existing = get().transactions.find((item) => item.id === id);
    set((s) => ({ transactions: s.transactions.map((item) => item.id === id ? { ...transaction, id } : item) }));
    if (existing && JSON.stringify(existing) !== JSON.stringify({ ...transaction, id })) get().recordPractice('edit', id, transaction.data.slice(0, 7));
    get()._ensureMonthlyChallenges();
    get()._persist();
  },

  deleteTransaction: (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    get()._persist();
  },

  addGoal: (g) => {
    const goalId = uid();
    const investmentId = uid();
    const goal: Goal = { ...g, id: goalId, investimentoId: investmentId, criadaEm: new Date().toISOString(), valorAtual: 0 };
    const investment: Investment = { id: investmentId, nome: goal.titulo, valor: 0, criadoEm: goal.criadaEm, tipo: 'reserva', considerarDisponivel: false, metaId: goalId, icone: goal.icone };
    set((s) => {
      return { goals: [...s.goals, goal].sort((first, second) => (first.meses ?? Number.MAX_SAFE_INTEGER) - (second.meses ?? Number.MAX_SAFE_INTEGER)), investments: [...s.investments, investment] };
    });
    get().recordLearningAction('goal');
    get().recordPractice('createGoal', goalId);
    get()._ensureMonthlyChallenges();
    get()._persist();
  },

  updateGoal: (id, valorAtual) => {
    const previousValue = get().goals.find((item) => item.id === id)?.valorAtual;
    set((s) => {
      const goal = s.goals.find((item) => item.id === id);
      if (!goal || !Number.isFinite(valorAtual) || valorAtual < 0 || valorAtual > goal.valorAlvo) return s;
      const increase = Math.round((valorAtual - goal.valorAtual) * 100) / 100;
      if (increase > 0 && increase > recordedMoney(s.transactions, s.goals, s.openingBalance).available) return s;
      const movement: Transaction | null = increase === 0 ? null : {
        id: uid(), tipo: 'transferencia', categoria: increase > 0 ? 'metas' : 'saque',
        origem: increase > 0 ? 'meta_aporte' : 'meta_saque', metaId: id,
        valor: Math.abs(increase), data: localDateTime(), descricao: goal.titulo,
      };
      return {
        goals: s.goals.map((g) => (g.id === id ? { ...g, valorAtual } : g)),
        investments: goal?.investimentoId ? s.investments.map((item) => item.id === goal.investimentoId ? { ...item, valor: valorAtual } : item) : s.investments,
        transactions: movement ? [movement, ...s.transactions] : s.transactions,
      };
    });
    if (get().goals.find((item) => item.id === id)?.valorAtual === valorAtual) get().recordLearningAction('goal');
    if (previousValue !== undefined && valorAtual > previousValue && get().goals.find((item) => item.id === id)?.valorAtual === valorAtual) get().recordPractice('contribution', id);
    get()._persist();
  },

  deleteGoal: (id) => {
    let withdrawalId: string | null = null;
    set((s) => {
      const goal = s.goals.find((item) => item.id === id);
      const withdrawal: Transaction | null = goal && goal.valorAtual > 0 ? {
        id: uid(), tipo: 'transferencia', categoria: 'saque', origem: 'meta_saque', metaId: id,
        valor: goal.valorAtual, data: localDateTime(), descricao: goal.titulo,
      } : null;
      withdrawalId = withdrawal?.id ?? null;
      return { goals: s.goals.filter((g) => g.id !== id), investments: s.investments.filter((item) => item.metaId !== id), transactions: withdrawal ? [withdrawal, ...s.transactions] : s.transactions };
    });
    get()._persist();
    return withdrawalId;
  },
  restoreGoal: (goal, investment, withdrawalId) => {
    set((s) => {
      if (s.goals.some((item) => item.id === goal.id)) return s;
      return {
        goals: [...s.goals, goal].sort((first, second) => (first.meses ?? Number.MAX_SAFE_INTEGER) - (second.meses ?? Number.MAX_SAFE_INTEGER)),
        investments: investment ? [...s.investments, investment] : s.investments,
        transactions: withdrawalId ? s.transactions.filter((item) => item.id !== withdrawalId) : s.transactions,
      };
    });
    get()._persist();
  },

  reorderGoals: (goals) => {
    set({ goals });
    get()._persist();
  },

  addInvestment: (investment) => {
    const item: Investment = { ...investment, id: uid(), criadoEm: new Date().toISOString() };
    set((s) => ({ investments: [item, ...s.investments] }));
    get()._persist();
  },

  updateInvestment: (id, investment) => {
    set((s) => {
      const current = s.investments.find((item) => item.id === id);
      return {
        investments: s.investments.map((item) => item.id === id ? { ...item, ...investment } : item),
        goals: current?.metaId && typeof investment.valor === 'number' ? s.goals.map((goal) => goal.id === current.metaId ? { ...goal, valorAtual: investment.valor as number } : goal) : s.goals,
      };
    });
    get()._persist();
  },

  deleteInvestment: (id) => {
    set((s) => {
      const current = s.investments.find((item) => item.id === id);
      return { investments: s.investments.filter((item) => item.id !== id), goals: current?.metaId ? s.goals.filter((goal) => goal.id !== current.metaId) : s.goals };
    });
    get()._persist();
  },

  addXp: (amount) => {
    set((s) => {
      const xp = Math.max(0, s.xp + amount);
      return { xp, onboarding: updateProfileFromExperience(s.onboarding, xp) };
    });
    get()._ensureMonthlyChallenges();
    get()._persist();
  },

  completeChallenge: (id) => {
    set((s) => {
      const challenge = s.challenges.find((c) => c.id === id);
      if (!challenge || challenge.mes !== getCurrentMonthKey() || challenge.perfil !== s.onboarding.profile || challenge.concluido || !canCompleteChallenge(challenge, s)) return s;
      const xp = s.xp + challenge.xp;
      return {
        challenges: s.challenges.map((c) =>
          c.id === id ? { ...c, concluido: true } : c
        ),
        xp,
        challengeHistory: [...s.challengeHistory, { templateId: challenge.id, perfil: challenge.perfil, mes: challenge.mes }],
        onboarding: updateProfileFromExperience(s.onboarding, xp),
      };
    });
    get()._ensureMonthlyChallenges();
    get()._persist();
  },

  reviewLesson: (lessonId, answer) => {
    const state = get();
    const lesson = getLessonById(lessonId);
    if (!lesson?.question || lesson.question.correct !== answer || !state.lessonProgress.some((item) => item.lessonId === lessonId && item.concluido)) return;
    set((s) => ({ lessonReviews: { ...s.lessonReviews, [lessonId]: localDateTime() } }));
    get()._persist();
  },

  completeLesson: (lessonId, answer) => {
    set((s) => {
      const lesson = getLessonById(lessonId);
      // Only the active curriculum can award new completion XP. Legacy history stays readable.
      if (!lesson?.requirements) return s;
      if (lessonId.startsWith('trail-')) {
        const next = getLessonsForProfile(s.onboarding.profile ?? 'explorer', s.preferences?.focus).find((item) => !s.lessonProgress.some((entry) => entry.lessonId === item.id && entry.concluido));
        if (next?.id !== lessonId) return s;
      }
      if (lesson?.question && answer !== lesson.question.correct) return s;
      const existing = s.lessonProgress.find((l) => l.lessonId === lessonId);
      if (existing?.concluido || !canCompleteLesson(lessonId, s)) return s;
      const progress: LessonProgress = {
        lessonId,
        concluido: true,
        concluidoEm: localDateTime(),
      };
      const xp = s.xp + (getLessonById(lessonId)?.xp ?? 15);
      return {
        lessonProgress: existing
          ? s.lessonProgress.map((l) => (l.lessonId === lessonId ? progress : l))
          : [...s.lessonProgress, progress],
        xp,
        onboarding: updateProfileFromExperience(s.onboarding, xp),
      };
    });
    get()._ensureMonthlyChallenges();
    get()._persist();
  },

  addPlannedExpense: (item) => {
    set((s) => ({ plannedExpenses: [...s.plannedExpenses, { ...item, id: uid(), status: 'ativo', pagamentos: [] }] }));
    get()._persist();
  },

  updatePlannedExpense: (id, item) => {
    set((s) => ({ plannedExpenses: s.plannedExpenses.map((expense) => expense.id === id ? { ...expense, ...item } : expense) }));
    get()._persist();
  },

  deletePlannedExpense: (id) => {
    set((s) => ({ plannedExpenses: s.plannedExpenses.filter((expense) => expense.id !== id) }));
    get()._persist();
  },

  payPlannedExpense: (id, date = new Date().toISOString()) => {
    set((s) => {
      const expense = s.plannedExpenses.find((item) => item.id === id);
      const paymentKey = date.slice(0, 10);
      if (!expense || (expense.pagamentos ?? []).includes(paymentKey)) return s;
      const paymentDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00` : date;
      const parcelada = expense.recorrencia === 'parcelada';
      const nextInstallment = (expense.parcelaAtual ?? 1) + (parcelada ? 1 : 0);
      const finalizado = parcelada && expense.totalParcelas !== undefined && nextInstallment > expense.totalParcelas;
      const transaction: Transaction = { id: uid(), tipo: 'despesa', valor: expense.valor, categoria: expense.categoria, data: paymentDate, descricao: expense.titulo, origem: expense.tipo === 'divida' ? 'divida' : expense.tipo === 'fixa' ? 'fixa' : expense.tipo === 'recorrente' ? 'recorrente' : 'prevista' };
      const xp = s.xp + 5;
      return { transactions: [transaction, ...s.transactions], xp, onboarding: updateProfileFromExperience(s.onboarding, xp), plannedExpenses: s.plannedExpenses.map((item) => item.id === id ? { ...item, pagamentos: [...(item.pagamentos ?? []), paymentKey], parcelaAtual: parcelada ? nextInstallment : item.parcelaAtual, status: finalizado ? 'finalizado' : item.status } : item) };
    });
    get()._ensureMonthlyChallenges(); get()._persist();
  },

  addCreditCard: (card) => { set((s) => ({ creditCards: [...s.creditCards, { ...card, id: uid() }] })); get()._persist(); },
  updateCreditCard: (id, card) => { set((s) => ({ creditCards: s.creditCards.map((item) => item.id === id ? { ...item, ...card } : item) })); get()._persist(); },
  deleteCreditCard: (id) => { set((s) => ({ creditCards: s.creditCards.filter((item) => item.id !== id) })); get()._persist(); },
  addCreditCardExpense: (expense) => { set((s) => ({ creditCardExpenses: [...s.creditCardExpenses, { ...expense, id: uid(), pagamentos: [] }] })); get()._persist(); },
  deleteCreditCardExpense: (id) => { set((s) => ({ creditCardExpenses: s.creditCardExpenses.filter((item) => item.id !== id) })); get()._persist(); },
  payCreditCardInvoice: (cardId, monthKey) => {
    set((s) => {
      const expenses = s.creditCardExpenses.filter((item) => item.cardId === cardId && isCardExpenseDue(item, monthKey) && !item.pagamentos.includes(monthKey));
      if (!expenses.length) return s;
      const transaction: Transaction = { id: uid(), tipo: 'despesa', valor: expenses.reduce((sum, item) => sum + item.valor, 0), categoria: 'outros', data: `${monthKey}-01`, descricao: `Fatura do cartão`, origem: 'cartao' };
      const xp = s.xp + 5;
      return { transactions: [transaction, ...s.transactions], xp, onboarding: updateProfileFromExperience(s.onboarding, xp), creditCardExpenses: s.creditCardExpenses.map((item) => expenses.some((expense) => expense.id === item.id) ? { ...item, pagamentos: [...item.pagamentos, monthKey], parcelaAtual: item.tipo === 'parcelada' ? (item.parcelaAtual ?? 1) + 1 : item.parcelaAtual } : item) };
    });
    get()._ensureMonthlyChallenges(); get()._persist();
  },

  setBudget: (categoria, limite) => {
    if (!Number.isFinite(limite) || limite <= 0) return;
    const previous = get().budgets.find((item) => item.categoria === categoria);
    set((s) => {
      const existing = s.budgets.find((b) => b.categoria === categoria);
      const budget: Budget = { categoria, limite };
      return {
        budgets: existing
          ? s.budgets.map((b) => (b.categoria === categoria ? budget : b))
          : [...s.budgets, budget],
      };
    });
    get().recordLearningAction('budget');
    get().recordPractice('saveLimit', categoria);
    if (previous && previous.limite !== limite) get().recordPractice('updateLimit', categoria);
    get()._persist();
  },

  deleteBudget: (categoria) => {
    set((s) => ({ budgets: s.budgets.filter((budget) => budget.categoria !== categoria) }));
    get()._persist();
  },

  toggleCard: (cardId) => {
    set((s) => {
      const isDisabled = s.disabledCards.includes(cardId);
      return {
        disabledCards: isDisabled
          ? s.disabledCards.filter((c) => c !== cardId)
          : [...s.disabledCards, cardId],
      };
    });
    get()._persist();
  },

  reorderCards: (newOrder) => {
    set(() => ({ cardOrder: newOrder }));
    get()._persist();
  },

  resetApp: async () => {
    resetting = true;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    pendingSave = null;
    await activeSave;
    syncCategories();
    set({ ...initialState(), categoryDefinitions: [], preferences: undefined, openingBalance: undefined, incomePattern: undefined, learningActions: undefined, lessonReviews: undefined, practiceEvents: [], practiceSequence: 0, lessonStarts: {}, lessonAnswers: {} });
    try { await clearState(); setStorageStatus('idle'); }
    finally { resetting = false; }
  },

  _persist: () => {
    const state = get();
    const data = Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value !== 'function'));
    scheduleSave(data as unknown as AppState);
  },

  _ensureMonthlyChallenges: () => {
    const s = get();
    if (!s.onboarding.profile) return;
    const monthKey = getCurrentMonthKey();
    const current = s.challenges.filter((item) => item.id.startsWith('journey-v2-') && item.mes === monthKey && item.perfil === s.onboarding.profile);
    const hasRetiredAction = (mission: typeof current[number]) => mission.requirements?.some((requirement) => requirement.actions.some((action) => ['exportReport', 'dataHelp', 'privacy'].includes(action)));
    if (current.length === 4 && !current.some(hasRetiredAction)) return;
    const next = monthlyMissions(s.onboarding.profile, monthKey, s.preferences?.focus, s).map((item) => {
      const existing = current.find((old) => old.id === item.id);
      if (existing && hasRetiredAction(existing)) return { ...existing, titulo: item.titulo, requirements: item.requirements };
      return existing ?? { ...item, concluido: s.challengeHistory.some((entry) => entry.templateId === item.id) };
    });
    set({ challenges: [...s.challenges.filter((item) => !current.some((old) => old.id === item.id)), ...next] });
    get()._persist();
  },
}));
