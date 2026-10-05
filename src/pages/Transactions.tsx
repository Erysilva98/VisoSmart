import { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { dateRangeLabel, parseDateRange, type DateRange } from '@/lib/dateRange';
import { Dialog } from '@/components/ui/Dialog';
import { parseAmount } from '@/lib/money';
import { showNotice } from '@/lib/uiNotice';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChartPie, ReceiptText, Search, Trash2, X } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { FAB } from '@/components/ui/FAB';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useStore } from '@/store/useStore';
import { CATEGORIES, DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '@/data/categories';
import { formatCurrency, formatDate, getMonthKey } from '@/lib/format';
import { getTransactionView, parseMonthKey } from '@/lib/transactionView';
import type { CategoryId, Transaction, TransactionType } from '@/types';

type StatementRequest = { filter?: TransactionType | 'all'; categoria?: CategoryId | null; month?: string } | null;

export function Transactions() {
  const location = useLocation();
  const requested = location.state as StatementRequest;
  const [params, setParams] = useSearchParams();
  const [showAdd, setShowAdd] = useState(params.get('add') === '1');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);
  const fromParam = params.get('from');
  const toParam = params.get('to');
  const dateRange = useMemo(() => parseDateRange(fromParam, toParam), [fromParam, toParam]);
  const [filter, setFilter] = useState<TransactionType | 'all'>(requested?.filter ?? (params.get('type') === 'receita' ? 'receita' : params.get('type') === 'despesa' ? 'despesa' : 'all'));
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | null>(requested?.categoria ?? (CATEGORIES[params.get('category') as CategoryId] ? params.get('category') as CategoryId : null));
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const transactions = useStore((s) => s.transactions);
  const [deleted, setDeleted] = useState<Transaction | null>(null);
  const restoreTransaction = useStore((s) => s.restoreTransaction);
  const remove = (item: Transaction) => { deleteTransaction(item.id); setDeleted(item); };
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const recordLearningAction = useStore((s) => s.recordLearningAction);
  const monthParam = dateRange?.from.slice(0, 7) ?? params.get('month') ?? requested?.month;
  const selectedMonth = useMemo(() => parseMonthKey(monthParam), [monthParam]);

  useEffect(() => {
    if (!requested) return;
    setFilter(requested.filter ?? 'all');
    setCategoryFilter(requested.categoria ?? null);
    setSearch('');
  }, [requested]);

  const view = useMemo(() => getTransactionView(transactions, { month: selectedMonth, dateRange, type: filter, category: categoryFilter, search }), [transactions, selectedMonth, dateRange, filter, categoryFilter, search]);
  const monthView = useMemo(() => getTransactionView(transactions, { month: selectedMonth, dateRange }), [transactions, selectedMonth, dateRange]);
  const filteredTotal = view.items.reduce((sum, item) => sum + Math.round(item.valor * 100), 0) / 100;
  const hasFilters = Boolean(dateRange) || filter !== 'all' || Boolean(categoryFilter) || Boolean(search.trim());
  useEffect(() => { if (hasFilters && view.items.length > 0 && getMonthKey(selectedMonth) === getMonthKey(new Date())) recordLearningAction('filter'); }, [hasFilters, view.items.length, selectedMonth, recordLearningAction]);
  const recordPractice = useStore((s) => s.recordPractice);
  const selectedKey = getMonthKey(selectedMonth);
  useEffect(() => { recordPractice('month', selectedKey); recordPractice('statement', undefined, selectedKey); }, [recordPractice, selectedKey]);
  useEffect(() => { if (filter !== 'all') recordPractice('typeFilter', filter, selectedKey); }, [filter, selectedKey, recordPractice]);
  useEffect(() => { if (categoryFilter) recordPractice('categoryFilter', categoryFilter, selectedKey); }, [categoryFilter, selectedKey, recordPractice]);
  useEffect(() => { if (categoryFilter && filter !== 'all') recordPractice('combinedFilter', categoryFilter, selectedKey); }, [categoryFilter, filter, selectedKey, recordPractice]);
  useEffect(() => {
    if (!search.trim()) return;
    const timer = setTimeout(() => recordPractice('search', undefined, selectedKey), 500);
    return () => clearTimeout(timer);
  }, [search, selectedKey, recordPractice]);
  function applyPeriod(range: DateRange | null) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('from'); next.delete('to'); next.delete('add');
      if (range) { next.set('from', range.from); next.set('to', range.to); next.set('month', range.from.slice(0, 7)); }
      return next;
    }, { replace: true });
    if (range) recordPractice('calendar', range.from, range.from.slice(0, 7));
    setShowPeriod(false);
  }
  function clearFilters() { setFilter('all'); setCategoryFilter(null); setSearch(''); applyPeriod(null); }


  return <Layout title="Extrato" compact>
    <h1 className="sr-only">Extrato</h1>
    {deleted && <div role="status" className="mb-3 flex items-center gap-3 rounded-xl bg-primary-50 p-3 text-xs text-primary-800"><span className="flex-1">Registro excluído.</span><button type="button" onClick={() => { restoreTransaction(deleted); setDeleted(null); }} className="min-h-11 font-semibold underline">Desfazer</button><button type="button" onClick={() => setDeleted(null)} aria-label="Fechar aviso" className="min-h-11"><X className="h-4 w-4" /></button></div>}
    <div className="mb-3"><MonthSelector value={selectedMonth} onChange={(date) => setParams({ month: getMonthKey(date) }, { replace: true })} /></div>
    <section aria-label="Totais dos registros exibidos" className="mb-3 overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
      <div className="grid grid-cols-2 divide-x divide-ink-100">
        <button type="button" onClick={() => setFilter(filter === 'receita' ? 'all' : 'receita')} aria-pressed={filter === 'receita'} className={`p-3 text-left sm:p-4 ${filter === 'receita' ? 'bg-green-50' : 'hover:bg-ink-50'}`}><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowDownLeft className="h-3 w-3 text-income" />{dateRange ? 'Entrou no período' : 'Entrou no mês'}</span><span className="mt-1 block text-lg font-semibold text-income" data-month-income>{formatCurrency(monthView.income)}</span></button>
        <button type="button" onClick={() => setFilter(filter === 'despesa' ? 'all' : 'despesa')} aria-pressed={filter === 'despesa'} className={`p-3 text-left sm:p-4 ${filter === 'despesa' ? 'bg-red-50' : 'hover:bg-ink-50'}`}><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowUpRight className="h-3 w-3 text-expense" />{dateRange ? 'Saiu no período' : 'Saiu no mês'}</span><span className="mt-1 block text-lg font-semibold text-expense" data-month-expenses>{formatCurrency(monthView.expenses)}</span></button>
      </div>
      <div className="border-t border-ink-100 px-3 py-2 sm:px-4"><p className="text-[10px] text-ink-500">{monthView.carriedBalance !== 0 && <>Saldo do mês anterior: {formatCurrency(monthView.carriedBalance)}. </>}{monthView.initialBalance !== 0 && <>Saldo inicial: {formatCurrency(monthView.initialBalance)}. </>}{dateRange ? `Totais de ${dateRangeLabel(dateRange, true)}` : 'Totais do mês inteiro'}</p></div>
    </section>

    <div className="mb-3 space-y-2">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" /><input aria-label="Buscar descrição ou categoria" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar descrição ou categoria" className="input min-h-11 py-2 pl-9 pr-10 text-xs" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca" className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-ink-400"><X className="h-3.5 w-3.5" /></button>}</div>
      <div className="flex flex-wrap items-center gap-2"><div className="grid w-full grid-cols-3 rounded-xl border border-ink-200/70 bg-white p-1">{(['all', 'receita', 'despesa'] as const).map((type) => <button key={type} type="button" aria-pressed={filter === type} onClick={() => setFilter(type)} className={`min-h-11 rounded-lg px-2 text-[11px] font-medium ${filter === type ? (type === 'receita' ? 'bg-income text-white' : type === 'despesa' ? 'bg-expense text-white' : 'bg-primary-600 text-white') : (type === 'receita' ? 'text-income hover:bg-green-50' : type === 'despesa' ? 'text-expense hover:bg-red-50' : 'text-ink-500')}`}>{type === 'all' ? 'Todos' : type === 'receita' ? 'Entradas' : 'Despesas'}</button>)}</div><button type="button" onClick={() => setShowPeriod(true)} aria-label={dateRange ? `Alterar período: ${dateRangeLabel(dateRange, true)}` : 'Selecionar dia ou intervalo'} title={dateRange ? dateRangeLabel(dateRange, true) : 'Selecionar período'} className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 text-left text-[11px] font-semibold ${dateRange ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-ink-200 bg-white text-primary-700'}`}><CalendarDays className="h-4 w-4 shrink-0" /><span className="min-w-0 truncate">{dateRange ? dateRangeLabel(dateRange) : 'Período'}</span></button><button type="button" onClick={() => setShowCategoryPicker(true)} aria-label={categoryFilter ? `Categoria ${CATEGORIES[categoryFilter].nome}. Alterar filtro` : 'Escolher categoria'} className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-2 text-left text-[11px] text-primary-700">{categoryFilter ? <CategoryIcon category={categoryFilter} compact /> : <ChartPie className="h-4 w-4 shrink-0" />}<span className="min-w-0 flex-1 truncate">{hasFilters ? `${filter === 'receita' ? 'Entradas' : filter === 'despesa' || categoryFilter && CATEGORIES[categoryFilter].tipo === 'despesa' ? 'Gastos' : 'Registros'} ${formatCurrency(filteredTotal)}` : 'Categorias'}</span></button></div>
      {hasFilters && <div className="flex items-center justify-between gap-2"><span role="status" aria-live="polite" className="text-[11px] text-ink-500">{view.items.length} {view.items.length === 1 ? 'registro encontrado' : 'registros encontrados'}</span><button type="button" onClick={clearFilters} className="min-h-9 text-[11px] font-semibold text-primary-700">Limpar filtros</button></div>}
    </div>

    {view.items.length === 0 ? <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-7 text-center"><ReceiptText className="mx-auto mb-2 h-5 w-5 text-ink-400" /><h2 className="text-sm font-semibold">{hasFilters ? 'Nenhum resultado' : dateRange ? 'Nenhum registro neste período' : 'Nenhum registro neste mês'}</h2><p className="mt-1 text-xs text-ink-500">{hasFilters ? 'Ajuste a busca ou limpe os filtros.' : 'Use o + para registrar uma movimentação.'}</p></div> : <div aria-label="Lista de transações" className="divide-y divide-ink-100 rounded-2xl border border-ink-200/70 bg-white px-3 sm:px-4">{view.items.map((item) => <div key={item.id} className="flex items-center gap-1 py-1">{item.tipo === 'transferencia' ? <div className="flex min-h-14 min-w-0 flex-1 items-center gap-2.5 py-2"><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{CATEGORIES[item.categoria].nome} · {item.descricao}</p><p className="mt-0.5 text-[10px] text-ink-500">Transferência entre saldo e meta · {formatDate(item.data)}</p></div><span className="shrink-0 text-xs font-semibold text-primary-700">{item.origem === 'meta_saque' ? '+' : '−'}{formatCurrency(item.valor)}</span></div> : <><button type="button" onClick={() => { recordPractice('inspectRecord', item.id, item.data.slice(0, 7)); if (item.tipo === 'despesa') recordPractice('inspectExpense', item.id, item.data.slice(0, 7)); setEditing(item); }} className="flex min-h-14 min-w-0 flex-1 items-center gap-2.5 py-2 text-left" aria-label={`Editar ${item.descricao || CATEGORIES[item.categoria].nome}`}><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.descricao || CATEGORIES[item.categoria].nome}</p><p className="mt-0.5 text-[10px] text-ink-500">{CATEGORIES[item.categoria].nome} · {formatDate(item.data)}</p></div><span className={`shrink-0 text-xs font-semibold ${item.tipo === 'receita' ? 'text-income' : 'text-expense'}`}>{item.tipo === 'receita' ? '+' : '−'}{formatCurrency(item.valor)}</span></button><button type="button" onClick={() => setPendingDelete(item)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-expense hover:bg-red-50" aria-label={`Excluir ${item.descricao || CATEGORIES[item.categoria].nome}`}><Trash2 className="h-3.5 w-3.5" /></button></>}</div>)}</div>}
    <FAB onClick={() => setShowAdd(true)} />
    <QuickAddModal open={showAdd} onClose={() => setShowAdd(false)} />
    {showPeriod && <DateRangePicker value={dateRange} month={selectedMonth} onApply={applyPeriod} onClose={() => setShowPeriod(false)} />}
    {showCategoryPicker && <Dialog title="Filtrar categoria" onClose={() => setShowCategoryPicker(false)}><div className="grid max-h-[55dvh] grid-cols-3 gap-2 overflow-y-auto"><button type="button" onClick={() => { setCategoryFilter(null); setShowCategoryPicker(false); }} className={`flex min-h-16 flex-col items-center justify-center rounded-xl border p-2 text-[11px] ${!categoryFilter ? 'border-primary-500 bg-primary-50' : 'border-ink-200'}`}><ChartPie className="mb-1 h-5 w-5" />Todas</button>{Object.values(CATEGORIES).filter((category) => category.tipo !== 'objetivo' && (filter === 'all' || category.tipo === filter || category.tipo === 'ambos') || filter === 'all' && (category.id === 'metas' || category.id === 'saque')).map((category) => <button key={category.id} type="button" aria-pressed={categoryFilter === category.id} onClick={() => { setCategoryFilter(category.id); setShowCategoryPicker(false); }} className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border p-1 text-center text-[10px] ${categoryFilter === category.id ? 'border-primary-500 bg-primary-50' : 'border-ink-200'}`}><CategoryIcon category={category.id} compact /><span className="line-clamp-2">{category.nome}</span></button>)}</div></Dialog>}
    {pendingDelete && <Dialog title="Excluir registro?" onClose={() => setPendingDelete(null)}><p className="text-sm text-ink-700">Tem certeza de que deseja excluir <strong>{pendingDelete.descricao || CATEGORIES[pendingDelete.categoria].nome}</strong> de {formatCurrency(pendingDelete.valor)}?</p><p className="mt-2 text-xs text-ink-500">Você poderá desfazer logo depois.</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => setPendingDelete(null)} className="btn-secondary flex-1">Cancelar</button><button type="button" onClick={() => { remove(pendingDelete); setPendingDelete(null); }} className="btn flex-1 bg-expense px-4 py-3 text-white">Excluir</button></div></Dialog>}
    {editing && <TransactionEditor transaction={editing} onClose={() => setEditing(null)} onSave={(transaction) => { updateTransaction(editing.id, transaction); setEditing(null); showNotice({ message: 'Registro atualizado.' }); }} onDelete={() => { setPendingDelete(editing); setEditing(null); }} />}
  </Layout>;
}
function TransactionEditor({ transaction, onClose, onSave, onDelete }: { transaction: Transaction; onClose: () => void; onSave: (transaction: Omit<Transaction, 'id'>) => void; onDelete: () => void }) {
  const [form, setForm] = useState({ tipo: transaction.tipo, categoria: transaction.categoria, valor: String(transaction.valor).replace('.', ','), data: transaction.data.slice(0, 10), descricao: transaction.descricao ?? '' });
  const amount = parseAmount(form.valor);
  const cats = form.tipo === 'receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
  const options = [...new Set([...cats, ...(transaction.tipo === form.tipo ? [transaction.categoria] : [])])];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (transaction.origem === 'saldo_inicial') return <Dialog title="Ajustar saldo inicial" onClose={onClose}><p className="mb-3 text-xs text-ink-500">Este é o dinheiro que você já tinha ao começar, não uma nova receita.</p><form onSubmit={(event) => { event.preventDefault(); if (Number.isFinite(amount) && amount >= 0) onSave({ ...transaction, valor: amount }); }}><label className="block text-xs font-semibold">Saldo inicial (R$)<input value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} inputMode="decimal" className="input mt-2" /></label><button disabled={!Number.isFinite(amount) || amount < 0} className="btn-primary mt-4 w-full">Salvar saldo inicial</button></form></Dialog>;
  const canSave = Number.isFinite(amount) && amount > 0 && Boolean(form.data) && form.data <= today && options.includes(form.categoria);
  return <Dialog title="Editar registro" onClose={onClose}><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (canSave) onSave({ tipo: form.tipo, categoria: form.categoria, valor: amount, data: `${form.data}T12:00:00`, descricao: form.descricao || undefined, origem: transaction.origem }); }}><label className="block text-xs font-semibold">Tipo<select value={form.tipo} onChange={(event) => { const tipo = event.target.value as TransactionType; setForm({ ...form, tipo, categoria: tipo === 'receita' ? RECEITA_CATEGORIES[0] : DESPESA_CATEGORIES[0] }); }} className="input mt-1"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label><label className="block text-xs font-semibold">Valor<input value={form.valor} inputMode="decimal" onChange={(event) => setForm({ ...form, valor: event.target.value })} className="input mt-1" /></label><label className="block text-xs font-semibold">Categoria<select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value as CategoryId })} className="input mt-1">{options.map((id) => <option key={id} value={id}>{CATEGORIES[id].nome}</option>)}</select></label><label className="block text-xs font-semibold">Data<input required type="date" max={today} value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} className="input mt-1" /></label><label className="block text-xs font-semibold">Descrição (opcional)<input value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="input mt-1" /></label><button disabled={!canSave} className="btn-primary w-full">Salvar alteração</button><button type="button" onClick={onDelete} className="min-h-11 w-full text-sm text-expense">Excluir registro</button></form></Dialog>;
}
