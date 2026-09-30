import type { Budget, CategoryId } from '@/types';

export function spendingAlert(available: number, categories: { categoria: CategoryId; valor: number }[], budgets: Budget[]) {
  const over = categories.filter((item) => budgets.some((budget) => budget.categoria === item.categoria && Math.round(item.valor * 100) > Math.round(budget.limite * 100)));
  const near = categories.filter((item) => budgets.some((budget) => budget.categoria === item.categoria && budget.limite > 0 && Math.round(item.valor * 100) >= Math.round(budget.limite * 80)));
  if (available < 0 || over.length) return { level: 'red', label: 'Revise seus registros e limites', near } as const;
  if (!categories.length || near.length) return { level: 'yellow', label: categories.length ? 'Atenção aos limites do mês' : 'Registre despesas para acompanhar', near } as const;
  return { level: 'green', label: 'Sem alertas nos registros atuais', near } as const;
}
