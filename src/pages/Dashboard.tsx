import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, BookOpen, ChartPie, Eye, EyeOff, ReceiptText, SlidersHorizontal, Target, ChevronRight } from 'lucide-react';
import { ExpenseDonut } from '@/components/ui/ExpenseDonut';
import { SpendingCalendar } from '@/components/ui/SpendingCalendar';
import { Layout } from '@/components/ui/Layout';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { FAB } from '@/components/ui/FAB';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { useStore } from '@/store/useStore';
import { formatCurrency, getMonthKey } from '@/lib/format';
import { getTransactionView, parseMonthKey } from '@/lib/transactionView';
import type { CategoryId, TransactionType } from '@/types';

export function Dashboard() {
  const [registrationDate, setRegistrationDate] = useState<string | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const transactions = useStore((state) => state.transactions);
  const recordLearningAction = useStore((state) => state.recordLearningAction);
  const monthParam = params.get('month');
  const selectedMonth = useMemo(() => parseMonthKey(monthParam), [monthParam]);
  const month = getMonthKey(selectedMonth);
  const view = useMemo(() => getTransactionView(transactions, { month: selectedMonth }), [transactions, selectedMonth]);
  const money = (value: number) => hideBalance ? '••••' : formatCurrency(value);
  function openStatement(filter?: TransactionType, categoria?: CategoryId) {
    navigate(`/gastos?month=${month}`, { state: { filter: filter ?? 'all', categoria: categoria ?? null, month } });
  }

  return <Layout title="Início" compact headerRight={<Link to="/perfil" className="inline-flex min-h-11 items-center rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-primary-700">Meu perfil</Link>}>
    <h1 className="sr-only">Resumo financeiro do mês</h1>
    <div className="home-month"><MonthSelector value={selectedMonth} onChange={(date) => setParams({ month: getMonthKey(date) }, { replace: true })} /></div>
    <section aria-label="Resultado do mês" className="home-summary rounded-2xl border border-ink-200/70 bg-white px-3 py-3">
      <div className="grid grid-cols-[1fr_1.25fr_1fr] items-center gap-1 text-center">
        <button type="button" onClick={() => openStatement('receita')} className="min-w-0 rounded-xl px-1 py-2 hover:bg-ink-50" aria-label={`Ver entradas do mês: ${formatCurrency(view.income)}`}><span className="flex items-center justify-center gap-0.5 text-[10px] text-ink-500"><ArrowDownLeft className="h-3 w-3 text-income" />Entrou</span><span className="mt-1 block truncate text-xs font-medium text-income" data-month-income>{money(view.income)}</span></button>
        <div className="min-w-0 border-x border-ink-100 px-1"><div className="flex items-center justify-center gap-1"><span className="text-[10px] text-ink-500">Saldo do mês</span><button type="button" onClick={() => setHideBalance(!hideBalance)} aria-label={hideBalance ? 'Mostrar valores' : 'Ocultar valores'} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50">{hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div><p className="truncate text-lg font-bold tracking-tight sm:text-2xl" data-month-balance>{money(view.balance)}</p></div>
        <button type="button" onClick={() => openStatement('despesa')} className="min-w-0 rounded-xl px-1 py-2 hover:bg-ink-50" aria-label={`Ver gastos do mês: ${formatCurrency(view.expenses)}`}><span className="flex items-center justify-center gap-0.5 text-[10px] text-ink-500"><ArrowUpRight className="h-3 w-3 text-expense" />Gastos</span><span className="mt-1 block truncate text-xs font-medium text-expense" data-month-expenses>{money(view.expenses)}</span></button>
      </div>
    </section>
    <nav aria-label="Atalhos" className="home-shortcuts grid grid-cols-4 gap-1 rounded-2xl border border-ink-200/70 bg-white p-1">
      {[{ label: 'Extrato', icon: ReceiptText, action: () => openStatement() }, { label: 'Aprender', icon: BookOpen, action: () => navigate('/aprender') }, { label: 'Metas', icon: Target, action: () => navigate('/metas') }, { label: 'Limites', icon: SlidersHorizontal, action: () => navigate('/orcamentos') }].map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-primary-700 transition-colors hover:bg-primary-50"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${label === 'Aprender' ? 'learn-shortcut bg-primary-100 ring-1 ring-primary-200' : 'bg-primary-50'}`}><Icon className="h-4 w-4" /></span><span className="text-[10px] font-medium">{label}</span></button>)}
    </nav>
    <SpendingCalendar key={month} compact month={selectedMonth} items={view.items} hidden={hideBalance} onViewStatement={() => openStatement()} onAdd={(date) => { setRegistrationDate(date); setShowAdd(true); }} />
    <section aria-label="Gastos por categoria" className="home-categories rounded-2xl border border-ink-200/70 bg-white px-3 py-1">
      <header className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-semibold"><ChartPie className="h-4 w-4 text-expense" />Gastos por categoria</h2><button type="button" onClick={() => openStatement('despesa')} className="flex min-h-9 items-center gap-0.5 text-[11px] font-medium text-primary-700">Ver todos<ChevronRight className="h-3 w-3" /></button></header>
      {view.categories.length ? <ExpenseDonut compact categories={view.categories} hidden={hideBalance} onSelect={(category) => { recordLearningAction('chart'); openStatement('despesa', category); }} /> : <p className="py-3 text-xs text-ink-500">Registre uma despesa para descobrir para onde vai seu dinheiro.</p>}
    </section>
    <FAB onClick={() => { setRegistrationDate(undefined); setShowAdd(true); }} />
    <QuickAddModal initialDate={registrationDate} open={showAdd} onClose={() => setShowAdd(false)} />
  </Layout>;
}
