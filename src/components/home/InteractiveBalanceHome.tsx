import { ArrowDownLeft, BookOpen, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import type { HomeVariantProps } from './HomeVariants';

export function InteractiveBalanceHome({ props }: { props: HomeVariantProps }) {
  const largest = props.view.categories[0] ?? null;
  const [done, total] = props.lessonProgress.split('/').map(Number);
  const lessonPercent = total > 0 ? Math.min(100, done / total * 100) : 0;
  const money = (value: number) => props.hidden ? '••••' : formatCurrency(value);


  return <div className="home-interactive grid gap-2">
    <section aria-label="Resumo do dinheiro" className="rounded-[22px] border border-white/90 bg-gradient-to-br from-white via-[#F8FAFF] to-[#EDF2FF] px-4 py-3.5 shadow-[inset_0_1px_0_#FFFFFF,0_10px_28px_-16px_rgba(38,54,140,0.35)] ring-1 ring-primary-200/70 backdrop-blur-xl">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(94px,0.55fr)] items-end gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1"><h2 className="text-sm font-semibold text-ink-700">Saldo</h2><button type="button" onClick={props.onToggleBalance} aria-label={props.hidden ? 'Mostrar valores' : 'Ocultar valores'} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-primary-50">{props.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          <p data-month-balance className="truncate font-display text-[clamp(1.8rem,8vw,2.75rem)] font-bold leading-none tracking-tight text-ink-900 tabular-nums">{money(props.view.balance)}</p>
        </div>
        <button type="button" onClick={props.onExpenses} aria-label={props.hidden ? 'Ver gastos do mês' : `Ver gastos do mês: ${formatCurrency(props.view.expenses)}`} className="min-h-14 min-w-0 border-l border-primary-200 pl-3 text-left hover:bg-white/75">
          <span className="block text-xs font-medium text-ink-600">Gastou</span>
          <strong data-month-expenses className="block truncate text-[clamp(0.95rem,4vw,1.2rem)] font-semibold leading-tight tabular-nums text-expense">{money(props.view.expenses)}</strong>
        </button>
      </div>
      {largest && !props.hidden ? <button type="button" onClick={() => props.onCategory(largest.categoria)} aria-label={`Ver maior gasto do mês: ${formatCurrency(largest.valor)} em ${CATEGORIES[largest.categoria].nome}`} className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-xl border border-white bg-white/85 px-2.5 text-left shadow-sm hover:bg-white"><CategoryIcon category={largest.categoria} compact /><span className="min-w-0 flex-1"><span className="block text-[11px] font-medium text-ink-600">Maior gasto do mês</span><span className="block truncate text-xs text-ink-900">Gastei <strong>{formatCurrency(largest.valor)}</strong> em <strong>{CATEGORIES[largest.categoria].nome}</strong></span></span><ChevronRight className="h-4 w-4 shrink-0 text-primary-700" /></button> : <p className="mt-3 rounded-xl bg-white/85 px-3 py-2 text-xs text-ink-700">{props.hidden ? 'Mostre os valores para ver seu maior gasto.' : 'Ainda não há gastos neste mês.'}</p>}
      <button type="button" onClick={props.onIncome} aria-label={props.hidden ? 'Ver entradas do mês' : `Ver entradas do mês: ${formatCurrency(props.view.income)}`} className="mt-1.5 flex min-h-9 items-center gap-1 text-xs font-semibold text-income hover:underline"><ArrowDownLeft className="h-3.5 w-3.5" /><span data-month-income>Entrou no mês: {money(props.view.income)}</span></button>
    </section>

    <button type="button" onClick={props.onLearn} aria-label={props.lessonTitle ? `Continuar desafio: ${props.lessonTitle}` : 'Ver trilha de aprendizado concluída'} className="flex min-h-[86px] w-full items-center gap-3 rounded-2xl border border-violet-200 bg-white px-3.5 py-3 text-left shadow-[0_8px_22px_-14px_rgba(122,99,254,0.5)] hover:bg-violet-50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-primary-600 text-white shadow-sm"><BookOpen className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-xs font-semibold text-violet-700"><span>Próximo desafio</span><span>{props.lessonProgress}</span></span><span className="mt-0.5 block truncate text-sm font-bold text-ink-900">{props.lessonTitle ?? 'Trilha concluída!'}</span><span className="mt-1 flex items-center justify-between gap-2 text-xs"><span className="text-ink-600">{props.lessonTitle ? props.lessonDuration ?? '2 min' : 'Veja suas conquistas'}</span><span className="inline-flex items-center font-bold text-violet-700">{props.lessonTitle ? 'Continuar' : 'Ver trilha'}<ChevronRight className="h-4 w-4" /></span></span><span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink-100"><span className="block h-full rounded-full bg-gradient-to-r from-violet-600 to-primary-600" style={{ width: `${lessonPercent}%` }} /></span></span>
    </button>


  </div>;
}
