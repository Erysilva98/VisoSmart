import { Link } from 'react-router-dom';
import { recordedMoney, spendingSummary } from '@/lib/financialSummary';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SpendingCalendar } from '@/components/ui/SpendingCalendar';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, BookOpen, ChevronRight, Eye, EyeOff, ReceiptText, Target } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { FAB } from '@/components/ui/FAB';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, getMonthKey } from '@/lib/format';
import { getTransactionView, parseMonthKey } from '@/lib/transactionView';
import type { CategoryId, TransactionType } from '@/types';

export function Dashboard() {
  const [registrationDate, setRegistrationDate] = useState<string | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { transactions, goals, budgets, openingBalance, incomePattern, plannedExpenses, creditCards } = useStore();
  const monthParam = params.get('month');
  const selectedMonth = useMemo(() => parseMonthKey(monthParam), [monthParam]);
  const month = getMonthKey(selectedMonth);
  const view = useMemo(() => getTransactionView(transactions, { month: selectedMonth }), [transactions, selectedMonth]);
  const available = recordedMoney(transactions, goals, openingBalance);
  const summary = spendingSummary(transactions, budgets, selectedMonth);
  const money = (value: number) => hideBalance ? '••••' : formatCurrency(value);
  function openStatement(filter?: TransactionType, categoria?: CategoryId) {
    navigate(`/gastos?month=${month}`, { state: { filter: filter ?? 'all', categoria: categoria ?? null, month } });
  }

  return <Layout title="Início" compact>
    <h1 className="sr-only">Resumo financeiro do mês</h1>
    <div className="mb-3"><MonthSelector value={selectedMonth} onChange={(date) => setParams({ month: getMonthKey(date) }, { replace: true })} /></div>
    <section aria-label="Resumo do mês" className="rounded-2xl border border-ink-200/70 bg-white p-4">
      <div className="flex items-center justify-between"><span className="text-xs font-medium text-ink-500">Resultado do mês</span><button type="button" onClick={() => setHideBalance(!hideBalance)} aria-label={hideBalance ? 'Mostrar valores' : 'Ocultar valores'} className="-my-2 flex h-10 w-10 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50">{hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
      <p className="mt-1 text-[28px] font-semibold tracking-tight" data-month-balance>{money(view.balance)}</p>
      <p className="mt-0.5 text-[10px] text-ink-500">Entradas menos saídas do período</p>
      <div className="mt-3 grid grid-cols-2 divide-x divide-ink-100 border-t border-ink-100 pt-3">
        <button type="button" onClick={() => openStatement('receita')} className="min-h-11 pr-3 text-left"><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowDownLeft className="h-3 w-3 text-income" />Entrou no mês</span><span className="mt-1 block text-base font-semibold text-income" data-month-income>{money(view.income)}</span></button>
        <button type="button" onClick={() => openStatement('despesa')} className="min-h-11 pl-4 text-left"><span className="flex items-center gap-1 text-[11px] text-ink-500"><ArrowUpRight className="h-3 w-3 text-expense" />Saiu no mês</span><span className="mt-1 block text-base font-semibold text-expense" data-month-expenses>{money(view.expenses)}</span></button>
      </div>
      <details className="mt-3 border-t border-ink-100 pt-3" aria-label="Dinheiro registrado"><summary className="cursor-pointer text-xs font-semibold text-primary-700">Livre hoje, pelos registros: {money(available.available)}</summary><p className="mt-2 text-[11px] leading-relaxed text-ink-500">Total registrado: {money(available.total)} · Reservado em metas: {money(available.reserved)}. Inclui todos os meses até hoje e o saldo inicial, sem descontar contas futuras.</p><Link to="/perfil" className="text-link text-[11px]">Ajustar saldo inicial</Link>{available.available < 0 && <p className="text-xs text-expense">Saídas e reservas superam as entradas. Confira seus registros antes de reservar mais.</p>}{(plannedExpenses.length > 0 || creditCards.length > 0) && <Link to="/perfil" className="text-link text-[10px]">Há compromissos antigos arquivados. Revise no perfil.</Link>}</details>
    </section>

    <nav aria-label="Atalhos" className="my-3 grid grid-cols-3 gap-1 rounded-2xl border border-ink-200/70 bg-white p-2">
      {[{ label: 'Extrato', icon: ReceiptText, action: () => openStatement() }, { label: 'Aprender', icon: BookOpen, action: () => navigate('/aprender') }, { label: 'Metas', icon: Target, action: () => navigate('/metas') }].map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-primary-700 transition-colors hover:bg-primary-50"><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${label === 'Aprender' ? 'learn-shortcut bg-primary-100 ring-1 ring-primary-200' : 'bg-primary-50'}`}><Icon className="h-4 w-4" strokeWidth={1.7} /></span><span className="text-[10px] font-medium">{label}</span></button>)}
    </nav>

    <section className="mb-3 rounded-2xl border border-primary-100 bg-primary-50/40 p-4" aria-label="Leitura dos gastos"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Onde vale prestar atenção</h2><Link to="/orcamentos" className="text-link text-[11px]">Meus limites</Link></div>{summary.largest ? <button type="button" onClick={() => openStatement('despesa', summary.largest.categoria)} className="mt-1 w-full text-left text-xs leading-relaxed text-ink-700"><strong>{CATEGORIES[summary.largest.categoria].nome}</strong> é seu maior gasto: {money(summary.largest.valor)}{!hideBalance && ` (${summary.largestPercent}% das despesas)`}. Toque para entender os registros.</button> : <p className="mt-1 text-xs text-ink-500">Registre os gastos que já aconteceram para descobrir para onde o dinheiro vai.</p>}{summary.over.slice(0, 2).map((item) => <p key={item.categoria} className="mt-2 text-xs text-expense">{CATEGORIES[item.categoria].nome}: {money(item.excess)} acima do limite atual. Revise as próximas escolhas.</p>)}{summary.largest && summary.over.length === 0 && <p className="mt-2 text-[11px] text-ink-500">Um gasto alto não é necessariamente ruim. Veja o que é necessário e o que você pode ajustar.</p>}{incomePattern === 'irregular' && <p className="mt-2 text-[11px] text-ink-500">Como sua renda varia, planeje com o dinheiro que já recebeu.</p>}</section>
    <div className="space-y-3">
      <SpendingCalendar key={month} month={selectedMonth} items={view.items} hidden={hideBalance} onViewStatement={() => openStatement()} onAdd={(date) => { setRegistrationDate(date); setShowAdd(true); }} />
      <section aria-label="Gastos por categoria" className="rounded-2xl border border-ink-200/70 bg-white px-4 py-2">
        <header className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Gastos por categoria</h2><button type="button" onClick={() => openStatement('despesa')} className="flex min-h-11 items-center gap-0.5 text-[11px] font-medium text-primary-700">Ver todos<ChevronRight className="h-3 w-3" /></button></header>
        {view.categories.length ? <div><div className="h-44" role="img" aria-label={hideBalance ? 'Distribuição de gastos oculta' : 'Gráfico de pizza dos gastos por categoria; valores na legenda abaixo'}>{hideBalance ? <div className="flex h-full items-center justify-center text-xs text-ink-500">Valores ocultos</div> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={view.categories} dataKey="valor" nameKey="categoria" cx="50%" cy="50%" outerRadius={76} stroke="#FFFFFF" strokeWidth={3} isAnimationActive={false}>{view.categories.map(({ categoria }) => <Cell key={categoria} fill={CATEGORIES[categoria].cor} />)}</Pie></PieChart></ResponsiveContainer>}</div><div className="divide-y divide-ink-100">{view.categories.map(({ categoria, valor }) => <button key={categoria} type="button" onClick={() => openStatement('despesa', categoria)} className="flex min-h-11 w-full items-center gap-2 text-left"><CategoryIcon category={categoria} compact /><span className="min-w-0 flex-1 truncate text-xs">{CATEGORIES[categoria].nome}</span><span className="text-xs font-semibold text-expense">{money(valor)}</span></button>)}</div></div> : <p className="py-5 text-xs text-ink-500">Nenhuma despesa neste mês.</p>}
      </section>
    </div>

    <FAB onClick={() => { setRegistrationDate(undefined); setShowAdd(true); }} />
    <QuickAddModal initialDate={registrationDate} open={showAdd} onClose={() => { setShowAdd(false); }} />
  </Layout>;
}
