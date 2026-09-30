import { missionProgress } from './journeyMissions';
import type { AppState, Challenge } from '@/types';
import { getLessonById } from '@/data/lessons';

type ProgressState = Pick<AppState, 'transactions' | 'goals' | 'budgets' | 'lessonProgress' | 'learningActions' | 'lessonReviews'>;

/** Centraliza regras verificáveis; o store é a única camada que concede XP. */
export function canCompleteChallenge(challenge: Challenge, state: ProgressState): boolean {
  if (challenge.id.startsWith('journey-')) { const progress = missionProgress(challenge, state); return progress.current >= progress.target; }
  const baseId = challenge.id.replace(/_\d{4}-\d{2}$/, '');
  const expenses = state.transactions.filter((item) => item.tipo === 'despesa');
  const incomes = state.transactions.filter((item) => item.tipo === 'receita' && item.origem !== 'saldo_inicial');
  const completedLessons = new Set(state.lessonProgress.filter((item) => item.concluido).map((item) => item.lessonId));
  const hasSavingsPlan = state.budgets.some((item) => item.categoria === 'investimentos_economia');
  const isBalanced = incomes.reduce((sum, item) => sum + item.valor, 0) >= expenses.reduce((sum, item) => sum + item.valor, 0);

  if (challenge.validacao) {
    const validations: Record<string, boolean> = {
      sempre: true, despesa_1: expenses.length >= 1, despesas_3: expenses.length >= 3,
      receita_1: incomes.length >= 1, categorias_2: new Set(expenses.map((item) => item.categoria)).size >= 2,
      meta_1: state.goals.length >= 1, orcamento_1: state.budgets.length >= 1, orcamentos_2: state.budgets.length >= 2,
      saldo_guardado: incomes.length > 0 && hasSavingsPlan, investimento_1: hasSavingsPlan, ativo_1: state.goals.length >= 1,
      movimentos_3: state.transactions.length >= 3, saldo_positivo: isBalanced,
    };
    return validations[challenge.validacao] ?? false;
  }

  switch (baseId) {
    case 'exp_reg15': return expenses.length >= 15;
    case 'exp_cat': return expenses.length > 0;
    case 'exp_aula': return completedLessons.size > 0;
    case 'eq_orc': return state.budgets.length >= 3;
    case 'eq_contas': return state.budgets.length >= 2;
    case 'eq_guardar': return incomes.length > 0 && hasSavingsPlan;
    case 'con_meta': return state.goals.length > 0;
    case 'con_inv': return completedLessons.has('l4');
    case 'con_red': return expenses.length >= 2;
    case 'est_rel': return state.transactions.length >= 3;
    case 'est_pat': return state.goals.length > 0;
    case 'est_otm': return expenses.length > 0 && isBalanced;
    case 'est_mestre_teste': return true;
    default: return false;
  }
}

export function getChallengeProgress(challenge: Challenge, state: ProgressState): { current: number; target: number } {
  if (challenge.id.startsWith('journey-')) return missionProgress(challenge, state);
  const baseId = challenge.id.replace(/_\d{4}-\d{2}$/, '');
  const expenses = state.transactions.filter((item) => item.tipo === 'despesa');
  const completedLessons = state.lessonProgress.filter((item) => item.concluido).length;
  const values: Record<string, [number, number]> = {
    exp_reg15: [expenses.length, 15], exp_cat: [expenses.length, 1], exp_aula: [completedLessons, 1],
    eq_orc: [state.budgets.length, 3], eq_contas: [state.budgets.length, 2], eq_guardar: [state.transactions.filter((item) => item.tipo === 'receita' && item.origem !== 'saldo_inicial').length, 1],
    con_meta: [state.goals.length, 1], con_inv: [state.lessonProgress.some((item) => item.lessonId === 'l4' && item.concluido) ? 1 : 0, 1], con_red: [expenses.length, 2],
    est_rel: [state.transactions.length, 3], est_pat: [state.goals.length, 1], est_otm: [canCompleteChallenge(challenge, state) ? 1 : 0, 1], est_mestre_teste: [1, 1],
  };
  const [current, target] = values[baseId] ?? [0, 1];
  return { current: Math.min(current, target), target };
}

export function canCompleteLesson(lessonId: string, state: Omit<ProgressState, 'lessonProgress'>): boolean {
  const expenses = state.transactions.filter((item) => item.tipo === 'despesa');
  const lesson = getLessonById(lessonId);
  const hasSavingsPlan = state.budgets.some((item) => item.categoria === 'investimentos_economia');
  if (lesson?.desafioPratico) {
    const validations: Record<string, boolean> = {
      reflexao: true, filtro: Boolean(state.learningActions?.filter), calendario: Boolean(state.learningActions?.calendar),
      despesa: expenses.length >= 1, receita: state.transactions.some((item) => item.tipo === 'receita' && item.origem !== 'saldo_inicial'),
      transacao: state.transactions.length >= 1, categorias: new Set(expenses.map((item) => item.categoria)).size >= 2,
      meta: state.goals.length >= 1, orcamento: state.budgets.length >= 1, orcamentos_2: state.budgets.length >= 2, investimento: hasSavingsPlan,
    };
    return validations[lesson.desafioPratico.validacao] ?? false;
  }
  switch (lessonId) {
    case 'l1': return state.transactions.length >= 1;
    case 'l2': return expenses.length >= 1;
    case 'l3': case 'l4': return hasSavingsPlan;
    case 'l5': return new Set(expenses.map((item) => item.categoria)).size >= 2;
    case 'l6': case 'l8': return state.goals.length >= 1;
    case 'l7': return state.budgets.length >= 1;
    default: return false;
  }
}

export function getLessonTask(lessonId: string): { label: string; path: string } {
  const lesson = getLessonById(lessonId);
  if (lesson?.desafioPratico) return { label: lesson.desafioPratico.descricao, path: lesson.desafioPratico.rota };
  const tasks: Record<string, { label: string; path: string }> = {
    l1: { label: 'Registre uma transação no app.', path: '/gastos' },
    l2: { label: 'Registre uma despesa e classifique-a por categoria.', path: '/gastos' },
    l3: { label: 'Defina investimentos e economia no orçamento.', path: '/orcamentos' },
    l4: { label: 'Defina investimentos e economia no orçamento.', path: '/orcamentos' },
    l5: { label: 'Registre despesas em pelo menos duas categorias.', path: '/gastos' },
    l6: { label: 'Crie uma meta financeira com valor e prazo.', path: '/metas' },
    l7: { label: 'Defina um orçamento para uma categoria.', path: '/orcamentos' },
    l8: { label: 'Crie uma meta para acompanhar seu progresso financeiro.', path: '/metas' },
  };
  return tasks[lessonId] ?? { label: 'Realize uma ação financeira no app.', path: '/dashboard' };
}
