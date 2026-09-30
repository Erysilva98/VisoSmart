import type { CategoryId, JourneyPreferences, ProfileType, Transaction } from '@/types';
import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '@/data/categories';

export const FOCUS_LABELS = { understand: 'Entender meus gastos', organize: 'Organizar meu mês', save: 'Guardar para uma meta' };
export function profileForExperience(experience: number): ProfileType {
  return experience === 2 ? 'construtor' : experience === 1 ? 'equilibrado' : 'explorer';
}
export function categoryOrder(type: 'receita' | 'despesa', preferences?: JourneyPreferences): CategoryId[] {
  const all = type === 'receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
  const selected = type === 'receita' ? preferences?.incomeCategories : preferences?.expenseCategories;
  return Array.from(new Set(selected ? selected.filter((id) => all.includes(id)) : all));
}
export function initialBalanceValue(transactions: Transaction[], legacy = 0): number {
  const item = transactions.find((entry) => entry.origem === 'saldo_inicial');
  return item ? item.valor : legacy;
}
export function withInitialBalance(transactions: Transaction[], value: number, date: string): Transaction[] {
  const existing = transactions.find((item) => item.origem === 'saldo_inicial');
  const entry: Transaction = { id: existing?.id ?? 'nexo-opening-balance', tipo: 'receita', categoria: 'saldo_inicial', origem: 'saldo_inicial', valor: Math.round(value * 100) / 100, data: existing?.data ?? date, descricao: 'Dinheiro que você já tinha ao começar' };
  return [entry, ...transactions.filter((item) => item.origem !== 'saldo_inicial')];
}
export function localDateTime(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T12:00:00`;
}
