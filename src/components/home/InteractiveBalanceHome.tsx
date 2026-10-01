import { ArrowDownLeft, ArrowUpRight, BookOpen, ChevronRight, Eye, EyeOff, ReceiptText, SlidersHorizontal, Target } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import type { HomeVariantProps } from './HomeVariants';

export function InteractiveBalanceHome({ props }: { props: HomeVariantProps }) {
  const largest = props.view.categories[0] ?? null;
  const [done, total] = props.lessonProgress.split('/').map(Number);
  const lessonPercent = total > 0 ? Math.min(100, done / total * 100) : 0;
  const actions = [
    { label: 'Extrato', icon: ReceiptText, onClick: props.onStatement },
    { label: 'Aprender', icon: BookOpen, onClick: props.onLearn },
    { label: 'Metas', icon: Target, onClick: props.onGoals },
    { label: 'Limites', icon: SlidersHorizontal, onClick: props.onLimits },
  ];
  const money = (value: number) => props.hidden ? '••••' : formatCurrency(value);

  return <div className="home-interactive grid gap-2">
    <section aria-label="Saldo do mês" className="relative overflow-hidden rounded-[22px] border border-white/80 bg-gradient-to-br from-sky-100/95 via-blue-100/80 to-white/75 px-3.5 py-3 shadow-[0_10px_30px_-20px_rgba(21,94,239,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-sky-200/60 backdrop-blur-xl">
      <div className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_96px]">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex items-center gap-1"><h2 className="text-sm font-normal text-ink-800">Saldo</h2><button type="button" onClick={props.onToggleBalance} aria-label={props.hidden ? 'Mostrar valores' : 'Ocultar valores'} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-white/60">{props.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          <p data-month-balance className="truncate text-[clamp(1.8rem,7vw,2.35rem)] font-medium leading-tight tracking-tight text-ink-900 tabular-nums">{money(props.view.balance)}</p>
        </div>
        <div className="flex flex-col items-center" aria-label="Entradas e gastos do mês">
          <div className="w-full divide-y divide-sky-200/75 rounded-xl border border-white/70 bg-white/45 backdrop-blur-md">
            <button type="button" onClick={props.onIncome} aria-label={props.hidden ? 'Ver entradas do mês' : `Ver entradas do mês: ${formatCurrency(props.view.income)}`} className="flex min-h-11 w-full min-w-0 flex-col justify-center rounded-t-xl px-1.5 text-left hover:bg-white/60"><span className="flex items-center gap-0.5 text-[10px] leading-none text-ink-600"><ArrowDownLeft className="h-2.5 w-2.5 text-income" />Entrou</span><span data-month-income className="block w-full truncate text-xs font-medium leading-tight text-income">{money(props.view.income)}</span></button>
            <button type="button" onClick={props.onExpenses} aria-label={props.hidden ? 'Ver gastos do mês' : `Ver gastos do mês: ${formatCurrency(props.view.expenses)}`} className="flex min-h-11 w-full min-w-0 flex-col justify-center rounded-b-xl px-1.5 text-left hover:bg-white/60"><span className="flex items-center gap-0.5 text-[10px] leading-none text-ink-600"><ArrowUpRight className="h-2.5 w-2.5 text-expense" />Gastou</span><span data-month-expenses className="block w-full truncate text-xs font-medium leading-tight text-expense">{money(props.view.expenses)}</span></button>
          </div>
        </div>
      </div>
      {largest && !props.hidden && <div className="home-largest-row mt-1.5 flex min-h-8 items-center gap-2 rounded-xl border border-white/60 bg-white/55 px-2 py-1 backdrop-blur-md"><CategoryIcon category={largest.categoria} compact /><p className="min-w-0 flex-1 text-xs leading-snug text-ink-800">Gastei <strong>{formatCurrency(largest.valor)}</strong> em <strong>{CATEGORIES[largest.categoria].nome}</strong></p></div>}
    </section>

    <nav aria-label="Acesso rápido" className="grid grid-cols-4 gap-1 rounded-2xl border border-ink-200/70 bg-white p-1">
      {actions.map(({ label, icon: Icon, onClick }, index) => <button type="button" key={label} onClick={onClick} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-primary-700 hover:bg-primary-50"><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${index === 0 ? 'bg-primary-100 ring-1 ring-primary-200' : 'bg-primary-50'}`}><Icon className="h-[18px] w-[18px]" /></span><span className="text-[11px] font-semibold">{label}</span></button>)}
    </nav>

    <button type="button" onClick={props.onLearn} aria-label={props.lessonTitle ? `Continuar desafio da trilha: ${props.lessonTitle}` : 'Ver trilha de aprendizado concluída'} className="flex min-h-[72px] w-full items-center gap-2.5 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-sky-50 px-3 py-2 text-left shadow-sm hover:border-primary-400">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700"><BookOpen className="h-[18px] w-[18px]" /></span>
      <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-[10px] font-bold text-primary-700"><span>Trilha de aprendizado</span><span>{props.lessonProgress}</span></span><span className="block truncate text-[13px] font-bold leading-tight text-ink-900">{props.lessonTitle ?? 'Trilha concluída!'}</span><span className="flex items-center justify-between gap-2 text-[10px]"><span className="text-ink-600">{props.lessonTitle ? `${props.lessonDuration ?? '2 min'} · +${props.lessonXp ?? 15} XP` : 'Veja suas conquistas'}</span><span className="inline-flex items-center font-bold text-primary-700">{props.lessonTitle ? 'Continuar' : 'Ver trilha'}<ChevronRight className="h-3 w-3" /></span></span><span className="mt-1 block h-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-primary-600" style={{ width: `${lessonPercent}%` }} /></span></span>
    </button>
  </div>;
}
