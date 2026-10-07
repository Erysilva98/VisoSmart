import type { CategoryId, Transaction, TransactionType } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { localDayKey, parseDateRange, type DateRange } from './dateRange';

export function parseMonthKey(value: string | null | undefined, fallback = new Date()): Date {
  if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    if (year >= 100) return new Date(year, month - 1, 1);
  }
  return new Date(fallback.getFullYear(), fallback.getMonth(), 1);
}

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

export interface TransactionFilters {
  month: Date;
  dateRange?: DateRange | null;
  type?: TransactionType | 'all';
  category?: CategoryId | null;
  search?: string;
}

/** A lista e os totais usam exatamente o mesmo conjunto de registros. */
export function getTransactionView(transactions: Transaction[], filters: TransactionFilters) {
  const query = normalizeSearch(filters.search ?? '');
  const range = parseDateRange(filters.dateRange?.from, filters.dateRange?.to);
  const hasFilters = Boolean(range || (filters.type && filters.type !== 'all') || filters.category || query);
  const monthStart = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1);
  const localDate = (value: string) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  // O dinheiro disponível no fim de um mês abre o seguinte, inclusive reservas e saques de metas.
  const carriedCents = hasFilters ? 0 : transactions.reduce((sum, item) => {
    if (localDate(item.data) >= monthStart) return sum;
    const cents = Math.round(item.valor * 100);
    if (item.origem === 'meta_aporte') return sum - cents;
    if (item.origem === 'meta_saque') return sum + cents;
    return sum + (item.tipo === 'receita' ? cents : item.tipo === 'despesa' ? -cents : 0);
  }, 0);
  const items = transactions.filter((item) => {
    // Datas sem horário representam o dia local, não meia-noite UTC.
    const date = localDate(item.data);
    if (range) {
      const day = localDayKey(date);
      if (!Number.isFinite(date.getTime()) || day < range.from || day > range.to) return false;
    } else if (date.getFullYear() !== filters.month.getFullYear() || date.getMonth() !== filters.month.getMonth()) return false;
    if (filters.type && filters.type !== 'all' && item.tipo !== filters.type) return false;
    if (filters.category && item.categoria !== filters.category) return false;
    return !query || normalizeSearch(item.descricao ?? '').includes(query) || normalizeSearch(CATEGORIES[item.categoria].nome).includes(query);
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  let openingCents = 0;
  let incomeCents = 0;
  let expenseCents = 0;
  let reservedCents = 0;
  const categoryCents = new Map<CategoryId, number>();
  items.forEach((item) => {
    const cents = Math.round(item.valor * 100);
    if (item.origem === 'meta_aporte') { reservedCents += cents; return; }
    if (item.origem === 'meta_saque') { reservedCents -= cents; return; }
    if (item.origem === 'saldo_inicial') {
      if (hasFilters) incomeCents += cents;
      else openingCents += cents;
      return;
    }
    if (item.tipo === 'receita') incomeCents += cents;
    else if (item.tipo === 'despesa') {
      expenseCents += cents;
      categoryCents.set(item.categoria, (categoryCents.get(item.categoria) ?? 0) + cents);
    }
  });
  const categories = Array.from(categoryCents, ([categoria, cents]) => ({ categoria, valor: cents / 100 })).sort((a, b) => b.valor - a.valor);
  const availableCents = carriedCents + openingCents + incomeCents - expenseCents - reservedCents;
  return { initialBalance: openingCents / 100, carriedBalance: carriedCents / 100, items, income: (carriedCents + openingCents + incomeCents) / 100, expenses: expenseCents / 100, balance: availableCents / 100, categories };
}
