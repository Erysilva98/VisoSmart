import { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Dialog } from '@/components/ui/Dialog';
import { parseAmount } from '@/lib/money';
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Search, Trash2, X } from 'lucide-react';
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
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<TransactionType | 'all'>(requested?.filter ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | null>(requested?.categoria ?? null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const transactions = useStore((s) => s.transactions);
  const [deleted, setDeleted] = useState<Transaction | null>(null);
  const restoreTransaction = useStore((s) => s.restoreTransaction);
  const remove = (item: Transaction) => { deleteTransaction(item.id); setDeleted(item); };
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const monthParam = params.get('month') ?? requested?.month;
  const selectedMonth = useMemo(() => parseMonthKey(monthParam), [monthParam]);

  useEffect(() => {
    if (!requested) return;
    setFilter(requested.filter ?? 'all');
    setCategoryFilter(requested.categoria ?? null);
    setSearch('');
  }, [requested]);

  const view = useMemo(() => getTransactionView(transactions, { month: selectedMonth, type: filter, category: categoryFilter, search }), [transactions, selectedMonth, filter, categoryFilter, search]);
  const hasFilters = filter !== 'all' || Boolean(categoryFilter) || Boolean(search.trim());
  function clearFilters() { setFilter('all'); setCategoryFilter(null); setSearch(''); }

  return <Layout title="Extrato" compact>
    <h1 className="sr-only">Extrato</h1>
    {deleted && <div role="status" className="mb-3 flex items-center gap-3 rounded-xl bg-primary-50 p-3 text-xs text-primary-800"><span className="flex-1">Registro excluído.</span><button type="button" onClick={() => { restoreTransaction(deleted); setDeleted(null); }} className="min-h-11 font-semibold underline">Desfazer</button><button type="button" onClick={() => setDeleted(null)} aria-label="Fechar aviso" className="min-h-11"><X className="h-4 w-4" /></button></div>}
    <div className="mb-3"><MonthSelector value={selectedMonth} onChange={(date) => setParams({ month: getMonthKey(date) }, { replace: true })} /></div>
    <section aria-label="Totais dos registros exibidos" className="mb-3 overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
      <div className="grid grid-cols-2 divide-x divide-ink-100">
        <button type="button" onClick={() => setFilter(filter === 'receita' ? 'all' : 'receita')} aria-pressed={filter === 'receita'} className={`p-3 text-left sm:p-4 ${filter === 'receita' ? 'bg-primary-50' : 'hover:bg-ink-50'}`}><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowDownLeft className="h-3 w-3 text-income" />Entrou no mês</span><span className="mt-1 block text-lg font-semibold text-income" data-filtered-income>{formatCurrency(view.income)}</span></button>
        <button type="button" onClick={() => setFilter(filter === 'despesa' ? 'all' : 'despesa')} aria-pressed={filter === 'despesa'} className={`p-3 text-left sm:p-4 ${filter === 'despesa' ? 'bg-primary-50' : 'hover:bg-ink-50'}`}><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowUpRight className="h-3 w-3 text-expense" />Saiu no mês</span><span className="mt-1 block text-lg font-semibold text-expense" data-filtered-expenses>{formatCurrency(view.expenses)}</span></button>
      </div>
      <p role="status" aria-live="polite" className="border-t border-ink-100 px-3 py-2 text-[10px] text-ink-500 sm:px-4">Totais dos {view.items.length} {view.items.length === 1 ? 'registro exibido' : 'registros exibidos'}{hasFilters ? ' · filtros aplicados' : ''}</p>
    </section>

    <div className="mb-3 space-y-2">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" /><input aria-label="Buscar descrição ou categoria" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar descrição ou categoria" className="input min-h-11 py-2 pl-9 pr-10 text-xs" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca" className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-ink-400"><X className="h-3.5 w-3.5" /></button>}</div>
      <div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl border border-ink-200/70 bg-white p-1">{(['all', 'receita', 'despesa'] as const).map((type) => <button key={type} type="button" aria-pressed={filter === type} onClick={() => setFilter(type)} className={`min-h-9 rounded-lg px-3 text-xs font-medium ${filter === type ? (type === 'receita' ? 'bg-income text-white' : type === 'despesa' ? 'bg-expense text-white' : 'bg-primary-600 text-white') : (type === 'receita' ? 'text-income hover:bg-green-50' : type === 'despesa' ? 'text-expense hover:bg-red-50' : 'text-ink-500')}`}>{type === 'all' ? 'Todos' : type === 'receita' ? 'Receitas' : 'Despesas'}</button>)}</div><select aria-label="Filtrar categoria" value={categoryFilter ?? ''} onChange={(event) => setCategoryFilter((event.target.value || null) as CategoryId | null)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 text-xs text-ink-600"><option value="">Todas as categorias</option>{Object.values(CATEGORIES).filter((category) => category.tipo !== 'objetivo').map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></div>
      {hasFilters && <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-ink-500">{categoryFilter ? CATEGORIES[categoryFilter].nome : 'Resultado do filtro'}</span><button type="button" onClick={clearFilters} className="min-h-9 text-[11px] font-semibold text-primary-700">Limpar filtros</button></div>}
    </div>

    {view.items.length === 0 ? <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-7 text-center"><ReceiptText className="mx-auto mb-2 h-5 w-5 text-ink-400" /><h2 className="text-sm font-semibold">{hasFilters ? 'Nenhum resultado' : 'Nenhum registro neste mês'}</h2><p className="mt-1 text-xs text-ink-500">{hasFilters ? 'Ajuste a busca ou limpe os filtros.' : 'Use o + para registrar uma movimentação.'}</p></div> : <div aria-label="Lista de transações" className="divide-y divide-ink-100 rounded-2xl border border-ink-200/70 bg-white px-3 sm:px-4">{view.items.map((item) => <div key={item.id} className="flex items-center gap-1 py-1"><button type="button" onClick={() => setEditing(item)} className="flex min-h-14 min-w-0 flex-1 items-center gap-2.5 py-2 text-left" aria-label={`Editar ${item.descricao || CATEGORIES[item.categoria].nome}`}><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.descricao || CATEGORIES[item.categoria].nome}</p><p className="mt-0.5 text-[10px] text-ink-500">{CATEGORIES[item.categoria].nome} · {formatDate(item.data)}</p></div><span className={`shrink-0 text-xs font-semibold ${item.tipo === 'receita' ? 'text-income' : 'text-expense'}`}>{item.tipo === 'receita' ? '+' : '−'}{formatCurrency(item.valor)}</span></button><button type="button" onClick={() => remove(item)} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-danger" aria-label={`Excluir ${item.descricao || CATEGORIES[item.categoria].nome}`}><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>}
    <FAB onClick={() => setShowAdd(true)} />
    <QuickAddModal open={showAdd} onClose={() => setShowAdd(false)} />
    {editing && <TransactionEditor transaction={editing} onClose={() => setEditing(null)} onSave={(transaction) => { updateTransaction(editing.id, transaction); setEditing(null); }} onDelete={() => { remove(editing); setEditing(null); }} />}
  </Layout>;
}
function TransactionEditor({ transaction, onClose, onSave, onDelete }: { transaction: Transaction; onClose: () => void; onSave: (transaction: Omit<Transaction, 'id'>) => void; onDelete: () => void }) {
  const [form, setForm] = useState({ tipo: transaction.tipo, categoria: transaction.categoria, valor: String(transaction.valor).replace('.', ','), data: transaction.data.slice(0, 10), descricao: transaction.descricao ?? '' });
  const amount = parseAmount(form.valor);
  const cats = form.tipo === 'receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
  const options = [...new Set([...cats, ...(transaction.tipo === form.tipo ? [transaction.categoria] : [])])];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const canSave = Number.isFinite(amount) && amount > 0 && Boolean(form.data) && form.data <= today && options.includes(form.categoria);
  return <Dialog title="Editar registro" onClose={onClose}><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (canSave) onSave({ tipo: form.tipo, categoria: form.categoria, valor: amount, data: `${form.data}T12:00:00`, descricao: form.descricao || undefined, origem: transaction.origem }); }}><label className="block text-xs font-semibold">Tipo<select value={form.tipo} onChange={(event) => { const tipo = event.target.value as TransactionType; setForm({ ...form, tipo, categoria: tipo === 'receita' ? RECEITA_CATEGORIES[0] : DESPESA_CATEGORIES[0] }); }} className="input mt-1"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label><label className="block text-xs font-semibold">Valor<input value={form.valor} inputMode="decimal" onChange={(event) => setForm({ ...form, valor: event.target.value })} className="input mt-1" /></label><label className="block text-xs font-semibold">Categoria<select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value as CategoryId })} className="input mt-1">{options.map((id) => <option key={id} value={id}>{CATEGORIES[id].nome}</option>)}</select></label><label className="block text-xs font-semibold">Data<input required type="date" max={today} value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} className="input mt-1" /></label><label className="block text-xs font-semibold">Descrição (opcional)<input value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="input mt-1" /></label><button disabled={!canSave} className="btn-primary w-full">Salvar alteração</button><button type="button" onClick={onDelete} className="min-h-11 w-full text-sm text-expense">Excluir registro</button></form></Dialog>;
}
