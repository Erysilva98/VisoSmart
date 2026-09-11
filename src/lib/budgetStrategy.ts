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
export const LIFESTYLE_CATEGORIES: CategoryId[] = ['lazer', 'cartao_credito', 'outros'];

const STRATEGIES: Record<ProfileType, BudgetStrategy> = {
  explorer: { id: '80-10-10', title: 'Criar hábito · 80 / 10 / 10', essential: 80, goals: 10, lifestyle: 10, explanation: 'Comece pequeno: o foco agora é acompanhar seus gastos e criar o hábito de guardar.' },
  equilibrado: { id: '70-20-10', title: 'Organização · 70 / 20 / 10', essential: 70, goals: 20, lifestyle: 10, explanation: 'Você já tem controle. Agora vamos criar espaço para objetivos financeiros.' },
  construtor: { id: '60-20-20', title: 'Construção · 60 / 20 / 20', essential: 60, goals: 20, lifestyle: 20, explanation: 'Seu dinheiro começa a trabalhar para suas metas e para a qualidade de vida.' },
  estrategista: { id: '50-30-20', title: 'Otimização · 50 / 30 / 20', essential: 50, goals: 30, lifestyle: 20, explanation: 'Com mais maturidade, você pode ampliar a construção financeira.' },
  mestre: { id: '40-40-20', title: 'Independência · 40 / 40 / 20', essential: 40, goals: 40, lifestyle: 20, explanation: 'A estratégia prioriza a independência sem eliminar qualidade de vida.' },
};

export function recommendBudgetStrategy(profile: ProfileType, income: number, expenses: Map<CategoryId, number>): BudgetStrategyRecommendation {
  const base = STRATEGIES[profile];
  const currentEssential = ESSENTIAL_CATEGORIES.reduce((sum, category) => sum + (expenses.get(category) ?? 0), 0);
  const actualPercentage = income > 0 ? currentEssential / income * 100 : 0;
  const strategies = Object.values(STRATEGIES);
  const viable = strategies.filter((strategy) => strategy.essential >= actualPercentage).sort((a, b) => a.essential - b.essential)[0];
  const strategy = viable && viable.essential > base.essential ? viable : base;
  return { ...strategy, essentialLimit: income * strategy.essential / 100, goalsLimit: income * strategy.goals / 100, lifestyleLimit: income * strategy.lifestyle / 100, currentEssential, adjustedForReality: strategy.id !== base.id };
}
