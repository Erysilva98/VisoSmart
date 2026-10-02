import { ArrowDownLeft, BookOpen, ChevronRight, Eye, EyeOff, ReceiptText, SlidersHorizontal, Target } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import type { HomeVariantProps } from './HomeVariants';

export function InteractiveBalanceHome({ props }: { props: HomeVariantProps }) {
  const largest = props.view.categories[0] ?? null;
  const [done, total] = props.lessonProgress.split('/').map(Number);
  const lessonPercent = total > 0 ? Math.min(100, done / total * 100) : 0;
  const money = (value: number) => props.hidden ? '••••' : formatCurrency(value);
  const actions = [
    { label: 'Extrato', icon: ReceiptText, onClick: props.onStatement },
    { label: 'Aprender', icon: BookOpen, onClick: props.onLearn },
    { label: 'Metas', icon: Target, onClick: props.onGoals },
    { label: 'Limites', icon: SlidersHorizontal, onClick: props.onLimits },
  ];

  return <div className="home-interactive grid gap-2">
    <section aria-label="Resumo do dinheiro" className="rounded-[22px] border border-sky-200/80 bg-gradient-to-br from-sky-100 to-blue-50 px-4 py-3.5 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(94px,0.55fr)] items-end gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1"><h2 className="text-sm font-medium text-ink-700">Saldo</h2><button type="button" onClick={props.onToggleBalance} aria-label={props.hidden ? 'Mostrar valores' : 'Ocultar valores'} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-white/60">{props.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          <p data-month-balance className="truncate text-[clamp(1.8rem,8vw,2.75rem)] font-bold leading-none tracking-tight text-ink-900 tabular-nums">{money(props.view.balance)}</p>
        </div>
        <button type="button" onClick={props.onExpenses} aria-label={props.hidden ? 'Ver gastos do mês' : `Ver gastos do mês: ${formatCurrency(props.view.expenses)}`} className="min-h-14 min-w-0 border-l border-primary-200/80 pl-3 text-left hover:bg-white/40">
          <span className="block text-xs text-ink-600">Gastou</span>
          <strong data-month-expenses className="block truncate text-[clamp(0.95rem,4vw,1.2rem)] font-semibold leading-tight tabular-nums text-expense">{money(props.view.expenses)}</strong>
        </button>
      </div>
      {largest && !props.hidden ? <button type="button" onClick={() => props.onCategory(largest.categoria)} aria-label={`Ver maior gasto do mês: ${formatCurrency(largest.valor)} em ${CATEGORIES[largest.categoria].nome}`} className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-xl bg-white/70 px-2.5 text-left hover:bg-white"><CategoryIcon category={largest.categoria} compact /><span className="min-w-0 flex-1"><span className="block text-[11px] text-ink-600">Maior gasto do mês</span><span className="block truncate text-xs text-ink-900">Gastei <strong>{formatCurrency(largest.valor)}</strong> em <strong>{CATEGORIES[largest.categoria].nome}</strong></span></span><ChevronRight className="h-4 w-4 shrink-0 text-primary-700" /></button> : <p className="mt-3 rounded-xl bg-white/65 px-3 py-2 text-xs text-ink-600">{props.hidden ? 'Mostre os valores para ver seu maior gasto.' : 'Ainda não há gastos neste mês.'}</p>}
      <button type="button" onClick={props.onIncome} aria-label={props.hidden ? 'Ver entradas do mês' : `Ver entradas do mês: ${formatCurrency(props.view.income)}`} className="mt-1.5 flex min-h-9 items-center gap-1 text-xs font-medium text-primary-700 hover:underline"><ArrowDownLeft className="h-3.5 w-3.5" /><span data-month-income>Entrou no mês: {money(props.view.income)}</span></button>
    </section>

    <button type="button" onClick={props.onLearn} aria-label={props.lessonTitle ? `Continuar desafio: ${props.lessonTitle}` : 'Ver trilha de aprendizado concluída'} className="flex min-h-[86px] w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-left shadow-sm hover:bg-emerald-100">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700"><BookOpen className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-[11px] font-semibold text-emerald-800"><span>Próximo desafio</span><span>{props.lessonProgress}</span></span><span className="mt-0.5 block truncate text-sm font-bold text-ink-900">{props.lessonTitle ?? 'Trilha concluída!'}</span><span className="mt-1 flex items-center justify-between gap-2 text-xs"><span className="text-ink-600">{props.lessonTitle ? props.lessonDuration ?? '2 min' : 'Veja suas conquistas'}</span><span className="inline-flex items-center font-bold text-emerald-800">{props.lessonTitle ? 'Continuar' : 'Ver trilha'}<ChevronRight className="h-4 w-4" /></span></span><span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${lessonPercent}%` }} /></span></span>
    </button>

    <nav aria-label="Acesso rápido" className="grid grid-cols-4 gap-1 rounded-2xl border border-ink-200/70 bg-white p-1">
      {actions.map(({ label, icon: Icon, onClick }) => <button type="button" key={label} onClick={onClick} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-primary-700 hover:bg-primary-50"><Icon className="h-[18px] w-[18px]" /><span className="text-[11px] font-medium">{label}</span></button>)}
    </nav>
  </div>;
}
