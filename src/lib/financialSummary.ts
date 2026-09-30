import type { Budget, Goal, Transaction } from '@/types';
import { getTransactionView } from './transactionView';

export function recordedMoney(transactions: Transaction[], goals: Goal[], openingBalance = 0, now = new Date()) {
  const total = (Math.round(openingBalance * 100) + transactions.filter((item) => new Date(item.data) <= now).reduce((sum, item) => sum + Math.round(item.valor * 100) * (item.tipo === 'receita' ? 1 : -1), 0)) / 100;
  const reserved = goals.reduce((sum, item) => sum + Math.round(item.valorAtual * 100), 0) / 100;
  return { total, reserved, available: Math.round((total - reserved) * 100) / 100 };
}

export function spendingSummary(transactions: Transaction[], budgets: Budget[], month: Date) {
  const view = getTransactionView(transactions, { month });
  const over = view.categories.flatMap((item) => {
    const limit = budgets.find((budget) => budget.categoria === item.categoria)?.limite;
    return limit !== undefined && item.valor > limit ? [{ ...item, excess: Math.round((item.valor - limit) * 100) / 100, limit }] : [];
  }).sort((a, b) => b.excess - a.excess);
  return { ...view, over, largest: view.categories[0], largestPercent: view.expenses > 0 ? Math.round((view.categories[0]?.valor ?? 0) / view.expenses * 100) : 0 };
}

export function transactionImpact(transaction: Transaction, transactions: Transaction[], budgets: Budget[]) {
  const view = getTransactionView(transactions, { month: new Date(transaction.data), type: transaction.tipo, category: transaction.categoria });
  if (transaction.tipo === 'receita') return { kind: 'income' as const, value: view.income, count: view.items.length };
  const limit = budgets.find((item) => item.categoria === transaction.categoria)?.limite;
  if (limit === undefined) return { kind: 'count' as const, value: view.expenses, count: view.items.length };
  const remaining = Math.round((limit - view.expenses) * 100) / 100;
  return { kind: remaining >= 0 ? 'remaining' as const : 'over' as const, value: Math.abs(remaining), count: view.items.length };
}
