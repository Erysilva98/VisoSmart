import type { AppState, ProfileType, Transaction } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { getDespesasMes, getGastosPorCategoria, getReceitasMes } from './analytics';

export interface TransactionInsight { title: string; message: string; tone: 'positive' | 'attention' | 'guidance'; }
export interface FinancialMaturityScore { organization: number; planning: number; control: number; education: number; consistency: number; total: number; }
export interface Recommendation { title: string; description: string; actionLabel: string; path: string; }

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

/** Transforma registros locais em orientação simples, sem rede ou IA generativa. */
export function getFinancialMaturity(state: Pick<AppState, 'transactions' | 'budgets' | 'goals' | 'plannedExpenses' | 'lessonProgress' | 'challenges'>): FinancialMaturityScore {
  const expenseCategories = new Set(state.transactions.filter((item) => item.tipo === 'despesa').map((item) => item.categoria)).size;
  const organization = clamp(Math.min(70, state.transactions.length * 8) + expenseCategories * 10);
  const planning = clamp(state.budgets.length * 20 + state.goals.length * 20 + state.plannedExpenses.length * 10);
  const income = getReceitasMes(state.transactions); const expense = getDespesasMes(state.transactions);
  const control = clamp((income > 0 && income >= expense ? 60 : 25) + state.budgets.length * 10);
  const education = clamp(state.lessonProgress.filter((item) => item.concluido).length * 8 + state.challenges.filter((item) => item.concluido).length * 10);
  const days = new Set(state.transactions.map((item) => item.data.slice(0, 10))).size;
  const consistency = clamp(days * 12);
  return { organization, planning, control, education, consistency, total: clamp((organization + planning + control + education + consistency) / 5) };
}

export function getRecommendation(state: Pick<AppState, 'transactions' | 'budgets' | 'goals'>, profile: ProfileType): Recommendation {
  const closeBudget = state.budgets.find((budget) => {
    const amount = getGastosPorCategoria(state.transactions).find((item) => item.categoria === budget.categoria)?.valor ?? 0;
    return amount >= budget.limite * 0.8;
  });
  if (closeBudget) return { title: 'Seu próximo passo', description: `${CATEGORIES[closeBudget.categoria].nome} está próxima do limite planejado.`, actionLabel: 'Ver orçamento', path: '/orcamentos' };
  if (!state.transactions.length) return { title: 'Seu próximo passo', description: 'Registre sua primeira movimentação para entender seus hábitos.', actionLabel: 'Registrar agora', path: '/gastos' };
  if (!state.goals.length && profile !== 'explorer') return { title: 'Seu próximo passo', description: 'Crie uma meta para transformar seu plano em ação.', actionLabel: 'Criar meta', path: '/metas' };
  return { title: 'Seu próximo passo', description: 'Continue registrando para acompanhar sua evolução financeira.', actionLabel: 'Abrir extrato', path: '/gastos' };
}

export function getTransactionInsight(transaction: Omit<Transaction, 'id'>, state: Pick<AppState, 'transactions' | 'budgets' | 'goals'>, profile: ProfileType): TransactionInsight {
  if (transaction.tipo === 'receita') return { title: 'Entrada registrada', message: 'Você registrou uma entrada. Planeje uma parte para seus objetivos.', tone: 'positive' };
  const budget = state.budgets.find((item) => item.categoria === transaction.categoria);
  const spent = (getGastosPorCategoria(state.transactions).find((item) => item.categoria === transaction.categoria)?.valor ?? 0) + transaction.valor;
  if (budget && spent >= budget.limite) return { title: 'Limite alcançado', message: `Este gasto leva ${CATEGORIES[transaction.categoria].nome} ao limite planejado. Ajuste os próximos gastos com calma.`, tone: 'attention' };
  if (budget && spent >= budget.limite * 0.8) return { title: 'Atenção ao planejamento', message: `Você já utilizou ${Math.round(spent / budget.limite * 100)}% do limite de ${CATEGORIES[transaction.categoria].nome}.`, tone: 'attention' };
  if (profile === 'construtor' && state.goals.length) return { title: 'Gasto registrado', message: 'Acompanhar este valor ajuda a proteger as suas metas.', tone: 'guidance' };
  return { title: 'Gasto registrado', message: 'Continue registrando. Cada informação ajuda a reconhecer seus hábitos.', tone: 'positive' };
}
