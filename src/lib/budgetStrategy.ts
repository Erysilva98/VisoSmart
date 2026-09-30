import type { CategoryId, ProfileType } from '@/types';

export interface BudgetStrategy {
  id: string;
  title: string;
  essential: number;
  goals: number;
  lifestyle: number;
  explanation: string;
}
export interface BudgetStrategyRecommendation extends BudgetStrategy {
  essentialLimit: number;
  goalsLimit: number;
  lifestyleLimit: number;
  currentEssential: number;
  adjustedForReality: boolean;
}
export const ESSENTIAL_CATEGORIES: CategoryId[] = ['moradia', 'alimentacao', 'transporte', 'saude', 'educacao'];
export const GOAL_CATEGORIES: CategoryId[] = ['investimentos_economia'];
export const LIFESTYLE_CATEGORIES: CategoryId[] = ['lazer', 'compras', 'assinaturas', 'jogos', 'cartao_credito', 'outros'];
export type BudgetGroupId = 'essential' | 'lifestyle' | 'goals';
export const BUDGET_GROUPS: { id: BudgetGroupId; title: string; percent: number; categories: CategoryId[] }[] = [
  { id: 'essential', title: 'Despesas essenciais', percent: 50, categories: ESSENTIAL_CATEGORIES },
  { id: 'lifestyle', title: 'Desejos e escolhas', percent: 30, categories: LIFESTYLE_CATEGORIES },
  { id: 'goals', title: 'Economia', percent: 20, categories: GOAL_CATEGORIES },
];
const STRATEGY: BudgetStrategy = {
  id: '50-30-20', title: 'Regra 50 / 30 / 20', essential: 50, lifestyle: 30, goals: 20,
  explanation: '50% para despesas essenciais, 30% para desejos e escolhas e 20% para economia. Uma referência opcional: adapte os limites às despesas que você realmente paga.',
};

export function recommendBudgetStrategy(profile: ProfileType, income: number, expenses: Map<CategoryId, number>): BudgetStrategyRecommendation {
  // O perfil muda a jornada de aprendizado, nunca os percentuais do plano.
  void profile;
  const cents = Math.round(Math.max(0, Number.isFinite(income) ? income : 0) * 100);
  const essentialCents = Math.round(cents * 0.5);
  const lifestyleCents = Math.round(cents * 0.3);
  return {
    ...STRATEGY,
    essentialLimit: essentialCents / 100,
    lifestyleLimit: lifestyleCents / 100,
    goalsLimit: (cents - essentialCents - lifestyleCents) / 100,
    currentEssential: ESSENTIAL_CATEGORIES.reduce((sum, category) => sum + (expenses.get(category) ?? 0), 0),
    adjustedForReality: false,
  };
}

/** Distribui centavos sem perder ou criar saldo no arredondamento. */
export function splitBudgetAmount(amount: number, count: number): number[] {
  if (!Number.isInteger(count) || count <= 0) return [];
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / count);
  const remainder = cents % count;
  return Array.from({ length: count }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100);
}
