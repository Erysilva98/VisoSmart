import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChartPie, ChevronDown, ChevronUp, ReceiptText } from 'lucide-react';
import { ExpenseDonut } from '@/components/ui/ExpenseDonut';
import { SpendingCalendar } from '@/components/ui/SpendingCalendar';
import { Layout } from '@/components/ui/Layout';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { FAB } from '@/components/ui/FAB';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { HomeVariantContent } from '@/components/home/HomeVariants';
import { HOME_VARIANTS, type HomeVariant } from '@/components/home/homeVariantOptions';
import { useStore } from '@/store/useStore';
import { getMonthKey } from '@/lib/format';
import { getTransactionView, parseMonthKey } from '@/lib/transactionView';
import { getLessonsForProfile } from '@/data/lessons';
import type { CategoryId, TransactionType } from '@/types';

export function Dashboard() {
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia('(max-width: 767px) and (max-height: 780px)').matches);
  const [expandedPanel, setExpandedPanel] = useState<'calendar' | 'categories' | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px) and (max-height: 780px)');
    const update = () => { setSmallScreen(media.matches); setExpandedPanel(null); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!expandedPanel) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpandedPanel(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [expandedPanel]);
  const [registrationDate, setRegistrationDate] = useState<string | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const transactions = useStore((state) => state.transactions);
  const budgets = useStore((state) => state.budgets);
  const goals = useStore((state) => state.goals);
  const xp = useStore((state) => state.xp);
  const lessonProgress = useStore((state) => state.lessonProgress);
  const profile = useStore((state) => state.onboarding.profile) ?? 'explorer';
  const focus = useStore((state) => state.preferences?.focus);
  const selectedMonth = useMemo(() => parseMonthKey(params.get('month')), [params]);
  const month = getMonthKey(selectedMonth);
  const recordPractice = useStore((s) => s.recordPractice);
  useEffect(() => { setExpandedPanel(null); recordPractice('month', month); recordPractice('home', undefined, month); }, [month, recordPractice]);
  const variantParam = Number(params.get('home'));
  const variant: HomeVariant = variantParam >= 1 && variantParam <= 5 && Number.isInteger(variantParam) ? variantParam as HomeVariant : 5;
  const view = useMemo(() => getTransactionView(transactions, { month: selectedMonth }), [transactions, selectedMonth]);
  const lessons = useMemo(() => getLessonsForProfile(profile, focus), [profile, focus]);
  const completed = new Set(lessonProgress.filter((item) => item.concluido).map((item) => item.lessonId));
  const nextLesson = lessons.find((item) => !completed.has(item.id));
  const done = lessons.filter((item) => completed.has(item.id)).length;
  const today = new Date();
  const currentMonth = selectedMonth.getMonth() === today.getMonth() && selectedMonth.getFullYear() === today.getFullYear();

  function openStatement(filter?: TransactionType, categoria?: CategoryId) {
    navigate(`/gastos?month=${month}`, { state: { filter: filter ?? 'all', categoria: categoria ?? null, month } });
  }
  function openAdd(date?: string) { setRegistrationDate(date); setShowAdd(true); }
  function chooseVariant(value: HomeVariant) {
    setParams((previous) => { const next = new URLSearchParams(previous); next.set('home', String(value)); return next; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <Layout title="Início" compact>
    <h1 className="sr-only">Resumo financeiro do mês</h1>
    <div className="home-month"><MonthSelector value={selectedMonth} onChange={(date) => setParams((previous) => { const next = new URLSearchParams(previous); next.set('month', getMonthKey(date)); return next; }, { replace: true })} /></div>
    <HomeVariantContent variant={variant} view={view} goals={goals} profile={profile} level={Math.floor(xp / 100) + 1} lessonTitle={nextLesson?.titulo ?? null} lessonDuration={nextLesson?.duracao ?? null} lessonXp={nextLesson?.xp} lessonProgress={`${done}/${lessons.length}`} hidden={hideBalance} currentMonth={currentMonth} onToggleBalance={() => setHideBalance((value) => !value)} onAdd={() => openAdd()} onStatement={() => openStatement()} onIncome={() => openStatement('receita')} onExpenses={() => openStatement('despesa')} onLearn={() => navigate('/aprender')} onGoals={() => navigate('/metas')} onLimits={() => navigate('/orcamentos')} onCategory={(category) => { recordPractice('chart', category, month); openStatement('despesa', category); }} />
    <div className="home-insights" data-expanded={expandedPanel ?? 'none'}>
    <div className="home-calendar-slot"><SpendingCalendar key={month} compact weekOnly={smallScreen && expandedPanel !== 'calendar'} expandable={smallScreen} expanded={expandedPanel === 'calendar'} onToggle={() => setExpandedPanel((value) => value === 'calendar' ? null : 'calendar')} month={selectedMonth} items={view.items} hidden={hideBalance} onViewStatement={() => openStatement()} onViewDay={(date) => navigate(`/gastos?month=${date.slice(0, 7)}&from=${date}&to=${date}&type=despesa`)} onAdd={(date) => openAdd(date)} /></div>
    {variant !== 4 && <div className="home-categories-slot"><section data-expanded={expandedPanel === 'categories'} aria-label="Gastos por categoria" className="home-categories rounded-2xl border border-ink-200/70 bg-white px-3 py-1"><header className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-1 text-xs font-semibold sm:text-sm"><ChartPie className="h-4 w-4 text-expense" />Gastos por categoria</h2><div className="flex shrink-0 items-center gap-1">{view.categories.length > 3 && <button type="button" onClick={() => setExpandedPanel((value) => value === 'categories' ? null : 'categories')} aria-expanded={expandedPanel === 'categories'} aria-controls="home-category-chart" aria-label={expandedPanel === 'categories' ? 'Recolher categorias' : 'Expandir todas as categorias'} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50">{expandedPanel === 'categories' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</button>}<button type="button" onClick={() => openStatement('despesa')} aria-label="Ver gastos no extrato" className="flex min-h-11 items-center gap-1 text-[10px] font-medium text-primary-700">Ver<ReceiptText className="h-3.5 w-3.5" /></button></div></header><div id="home-category-chart" className="home-category-chart">{view.categories.length ? <ExpenseDonut compact expanded={expandedPanel === 'categories'} budgets={budgets} categories={view.categories} hidden={hideBalance} onSelect={(category) => { recordPractice('chart', category, month); openStatement('despesa', category); }} /> : <p className="py-3 text-xs text-ink-500">Registre uma despesa para descobrir para onde vai seu dinheiro.</p>}</div></section></div>}
    </div>
    <details className="rounded-2xl border border-dashed border-ink-200 bg-white px-3 py-2"><summary className="flex min-h-10 cursor-pointer items-center text-xs font-semibold text-primary-700">Explorar versões da Home <span className="ml-auto font-normal text-ink-500">{variant}/5</span></summary><p className="mt-1 text-[11px] text-ink-500">Protótipos para comparar o que fica mais claro para você.</p><div className="mt-2 grid gap-1.5 sm:grid-cols-2">{HOME_VARIANTS.map((option) => <button key={option.id} type="button" onClick={() => chooseVariant(option.id)} aria-pressed={variant === option.id} className={`min-h-11 rounded-xl border px-3 py-2 text-left ${variant === option.id ? 'border-primary-400 bg-primary-50' : 'border-ink-200 hover:bg-ink-50'}`}><span className="block text-xs font-semibold">{option.id}. {option.name}</span><span className="block text-[10px] text-ink-500">{option.description}</span></button>)}</div></details>
    {!expandedPanel && <FAB onClick={() => openAdd()} />}
    <QuickAddModal initialDate={registrationDate} open={showAdd} onClose={() => setShowAdd(false)} />
  </Layout>;
}
