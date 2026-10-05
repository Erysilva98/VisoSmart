import { ArrowDownLeft, ArrowUpRight, BookOpen, ChevronRight, Eye, EyeOff, Plus, Sparkles, Target } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ProfileMark } from '@/components/journey/NexoMark';
import { CATEGORIES } from '@/data/categories';
import { PROFILES } from '@/data/profiles';
import { formatCurrency, formatDate } from '@/lib/format';
import type { getTransactionView } from '@/lib/transactionView';
import type { Goal, ProfileType, Transaction } from '@/types';
import type { HomeVariant } from './homeVariantOptions';
import { InteractiveBalanceHome } from './InteractiveBalanceHome';

type View = ReturnType<typeof getTransactionView>;
export interface HomeVariantProps {
  variant: HomeVariant;
  view: View;
  goals: Goal[];
  profile: ProfileType;
  level: number;
  lessonTitle: string | null;
  lessonDuration: string | null;
  lessonXp?: number;
  lessonProgress: string;
  hidden: boolean;
  currentMonth: boolean;
  onToggleBalance: () => void;
  onAdd: () => void;
  onStatement: () => void;
  onIncome: () => void;
  onExpenses: () => void;
  onLearn: () => void;
  onGoals: () => void;
  onLimits: () => void;
  onCategory: (category: Transaction['categoria']) => void;
}

function cash(value: number, hidden: boolean) { return hidden ? '••••' : formatCurrency(value); }
function availability(view: View) {
  if (view.income <= 0) return null;
  return Math.max(0, Math.min(100, Math.round(view.balance / view.income * 100)));
}
function message(view: View) {
  const reserved = Math.max(0, view.income - view.expenses - view.balance);
  if (!view.items.length) return 'Seu primeiro registro começa aqui.';
  if (view.balance < 0) return reserved > 0 && view.expenses <= view.income ? 'Revise o que separou para metas.' : 'Confira os gastos deste mês.';
  if (view.balance === 0) return 'O dinheiro do mês já foi usado ou reservado.';
  if (view.income > 0 && view.balance / view.income < 0.25) return 'Veja quanto ainda está livre.';
  if (reserved > 0 && view.expenses === 0) return 'Você guardou um pouco para sua meta!';
  if (view.expenses === 0) return 'Seu dinheiro está pronto para as próximas escolhas.';
  if (view.income > 0 && view.expenses / view.income >= 0.5) return 'Vale olhar seus próximos gastos.';
  return 'Você tem espaço para escolher.';
}

function Identity({ profile, level }: Pick<HomeVariantProps, 'profile' | 'level'>) {
  const config = PROFILES[profile];
  return <div className="flex items-center gap-2 px-0.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: config.corLight, color: config.cor }}><ProfileMark profile={profile} className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-ink-500">Seu espaço</span><span className="block truncate text-sm font-bold">Olá, {config.nome}</span></span><span className="rounded-full border border-ink-200 bg-white px-2 py-1 text-[10px] font-semibold text-ink-700">Nível {level}</span></div>;
}
function BalanceLabel({ props }: { props: HomeVariantProps }) {
  return <div className="flex min-h-11 items-center gap-1"><span className="text-sm font-semibold text-ink-700">{props.currentMonth ? 'Dinheiro disponível' : 'Disponível neste mês'}</span><button type="button" onClick={props.onToggleBalance} aria-label={props.hidden ? 'Mostrar valores' : 'Ocultar valores'} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-primary-50">{props.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>;
}
function MainAmount({ props, large = false }: { props: HomeVariantProps; large?: boolean }) {
  return <><p data-month-balance className={`truncate font-extrabold tracking-tight text-ink-900 ${large ? 'text-[clamp(2rem,8vw,3rem)] leading-none' : 'text-[clamp(1.75rem,7vw,2.4rem)] leading-none'}`}>{cash(props.view.balance, props.hidden)}</p><p className="mt-1 text-[11px] text-ink-600">{props.view.balance < 0 && !props.hidden ? 'Confira seu mês' : 'Disponível para suas escolhas'}</p></>;
}
function Flow({ props, floating = false }: { props: HomeVariantProps; floating?: boolean }) {
  return <div className="grid grid-cols-2 gap-2">
    <button type="button" onClick={props.onIncome} aria-label={props.hidden ? 'Ver entradas do mês' : `Ver entradas do mês: ${formatCurrency(props.view.income)}`} className={`min-h-12 min-w-0 rounded-xl px-3 py-1.5 text-left transition-colors hover:bg-emerald-50 ${floating ? 'border border-white/70 bg-white/85 shadow-sm' : 'border border-ink-100 bg-ink-50/70'}`}><span className="flex items-center gap-1 text-[10px] text-ink-600"><ArrowDownLeft className="h-3.5 w-3.5 text-income" />Entrou</span><strong data-month-income className="block truncate text-sm text-income">{cash(props.view.income, props.hidden)}</strong></button>
    <button type="button" onClick={props.onExpenses} aria-label={props.hidden ? 'Ver gastos do mês' : `Ver gastos do mês: ${formatCurrency(props.view.expenses)}`} className={`min-h-12 min-w-0 rounded-xl px-3 py-1.5 text-left transition-colors hover:bg-rose-50 ${floating ? 'border border-white/70 bg-white/85 shadow-sm' : 'border border-ink-100 bg-ink-50/70'}`}><span className="flex items-center gap-1 text-[10px] text-ink-600"><ArrowUpRight className="h-3.5 w-3.5 text-expense" />Gastou</span><strong data-month-expenses className="block truncate text-sm text-expense">{cash(props.view.expenses, props.hidden)}</strong></button>
  </div>;
}
function StateMessage({ props }: { props: HomeVariantProps }) {
  const negative = props.view.balance < 0 && !props.hidden;
  return <p role="status" className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium ${negative ? 'bg-rose-50 text-rose-900' : 'bg-primary-50 text-primary-800'}`}><Sparkles className="h-3.5 w-3.5 shrink-0" />{props.hidden ? 'Mostre os valores para ver sua situação.' : message(props.view)}</p>;
}
function NextStep({ props }: { props: HomeVariantProps }) {
  const goal = props.goals.find((item) => item.valorAtual < item.valorAlvo);
  const target = goal ? { title: goal.titulo, label: 'Continuar minha meta', action: props.onGoals, icon: Target } : props.lessonTitle ? { title: props.lessonTitle, label: 'Continuar aprendendo', action: props.onLearn, icon: BookOpen } : { title: 'Registre sua primeira movimentação', label: 'Registrar agora', action: props.onAdd, icon: Plus };
  const Icon = target.icon;
  return <button type="button" onClick={target.action} className="flex min-h-14 w-full items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-3 py-2 text-left hover:bg-primary-100"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700"><Icon className="h-[18px] w-[18px]" /></span><span className="min-w-0 flex-1"><span className="block text-[11px] text-primary-700">Seu próximo passo</span><span className="block truncate text-sm font-semibold">{target.title}</span>{goal && <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-primary-100"><span className="block h-full rounded-full bg-primary-600" style={{ width: `${Math.min(100, goal.valorAtual / goal.valorAlvo * 100)}%` }} /></span>}</span><ChevronRight className="h-4 w-4 shrink-0 text-primary-700" /><span className="sr-only">{target.label}</span></button>;
}
function LearningCard({ props, prominent = false }: { props: HomeVariantProps; prominent?: boolean }) {
  const [done, total] = props.lessonProgress.split('/').map(Number);
  return <button type="button" onClick={props.onLearn} className={`flex w-full items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 text-left hover:border-primary-400 hover:bg-primary-100 ${prominent ? 'min-h-28 p-3.5' : 'min-h-14 p-3'}`}><span className={`flex shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 ${prominent ? 'h-11 w-11' : 'h-9 w-9'}`}><BookOpen className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-[11px] font-semibold text-primary-700"><span>Próxima missão</span><span>{props.lessonProgress}</span></span><span className={`block font-bold text-ink-900 ${prominent ? 'mt-1 line-clamp-2 text-sm' : 'truncate text-xs'}`}>{props.lessonTitle ?? 'Trilha concluída!'}</span><span className="mt-1 block text-[11px] text-ink-600">{props.lessonTitle ? `${props.lessonDuration ?? '2 min'} · Uma descoberta rápida` : 'Veja tudo o que você conquistou.'}</span>{prominent && <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-primary-100"><span className="block h-full rounded-full bg-primary-600" style={{ width: `${total > 0 ? done / total * 100 : 0}%` }} /></span>}<span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-primary-700">{props.lessonTitle ? 'Continuar' : 'Ver trilha'}<ChevronRight className="h-3.5 w-3.5" /></span></span></button>;
}
function RecentExpense({ props }: { props: HomeVariantProps }) {
  const item = props.view.items.find((entry) => entry.tipo === 'despesa');
  return <button type="button" onClick={props.onStatement} aria-label={item ? `Ver último gasto: ${CATEGORIES[item.categoria].nome}` : 'Ver extrato sem gastos'} className="flex min-h-12 w-full items-center gap-2 rounded-xl border border-ink-100 bg-white py-2 pl-3 pr-16 text-left hover:bg-ink-50 md:pr-3"><span className="sr-only">Último registro</span>{item ? <><CategoryIcon category={item.categoria} compact /><span className="min-w-0 flex-1 truncate text-xs font-semibold">{CATEGORIES[item.categoria].nome}</span><span className="shrink-0 text-xs font-semibold text-expense">{cash(item.valor, props.hidden)}</span></> : <span className="min-w-0 flex-1 text-[11px] text-ink-500">Nenhum gasto ainda</span>}<ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary-700" /></button>;
}
function RecentExpenses({ props }: { props: HomeVariantProps }) {
  const items = props.view.items.filter((item) => item.tipo === 'despesa').slice(0, 3);
  return <section aria-label="Gastos recentes" className="rounded-2xl border border-ink-200/70 bg-white px-3 py-2"><div className="flex items-center justify-between gap-2"><h2 className="text-xs font-bold">Gastos recentes</h2><button type="button" onClick={props.onStatement} className="flex min-h-10 items-center gap-0.5 text-[11px] font-semibold text-primary-700">Ver todos<ChevronRight className="h-3.5 w-3.5" /></button></div>{items.length ? items.map((item) => <button type="button" key={item.id} onClick={props.onStatement} className="flex min-h-11 w-full items-center gap-2 border-t border-ink-100 pr-14 text-left hover:bg-ink-50 md:pr-0"><CategoryIcon category={item.categoria} compact /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{item.descricao || CATEGORIES[item.categoria].nome}</span><span className="block text-[10px] text-ink-500">{formatDate(item.data)}</span></span><span className="shrink-0 text-xs font-bold text-expense">−{cash(item.valor, props.hidden)}</span></button>) : <p className="py-2 text-xs text-ink-500">Nenhum gasto ainda. Use + para registrar.</p>}</section>;
}

export function HomeVariantContent(props: HomeVariantProps) {
  const available = availability(props.view);
  return <div className="grid gap-2.5">
    {props.variant !== 5 && <Identity profile={props.profile} level={props.level} />}
    {props.variant === 1 && <>
      <section aria-label="Resumo do dinheiro" className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm"><BalanceLabel props={props} /><MainAmount props={props} large /><div className="mt-4"><Flow props={props} /></div></section>
      <StateMessage props={props} /><NextStep props={props} />
    </>}
    {props.variant === 2 && <>
      <section aria-label="Resumo visual do dinheiro" className="rounded-2xl border border-ink-200/70 bg-white px-4 py-3 shadow-sm"><BalanceLabel props={props} /><div className="mx-auto mt-1 flex h-36 w-36 items-center justify-center rounded-full p-2.5" role="img" aria-label={props.hidden ? 'Proporção oculta' : available === null ? 'Sem entradas para comparar' : `${available}% do dinheiro registrado no mês está livre`} style={{ background: `conic-gradient(#4F6DFF ${props.hidden || available === null ? 0 : available}%, #e8eff7 0)` }}><div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center"><strong data-month-balance className="max-w-[110px] truncate text-lg font-extrabold text-ink-900">{cash(props.view.balance, props.hidden)}</strong><span className="text-[11px] font-medium text-primary-700">{props.hidden || available === null ? 'Sem comparação' : `${available}% livre`}</span></div></div><p className="mt-1 text-center text-[11px] text-ink-600">{props.hidden ? 'Valores ocultos' : 'Disponível para suas escolhas'}</p><div className="mt-2"><Flow props={props} /></div></section>
      <StateMessage props={props} /><RecentExpense props={props} />
    </>}
    {props.variant === 3 && <>
      <section aria-label="Resumo do dinheiro" className="rounded-2xl border border-ink-200/70 bg-white px-4 py-3 shadow-sm"><BalanceLabel props={props} /><MainAmount props={props} /><p className="mt-2 text-[11px] font-medium text-primary-700">{props.hidden ? 'Valores ocultos' : available === null ? 'Comece com seu primeiro registro' : `${available}% do dinheiro do mês está livre`}</p><p className="mt-1 text-[11px] text-ink-600">{props.hidden ? 'Mostre os valores para ver sua situação.' : message(props.view)}</p></section>
      <LearningCard props={props} prominent /><Flow props={props} /><RecentExpense props={props} />
    </>}
    {props.variant === 4 && <>
      <section aria-label="Resumo do dinheiro" className="rounded-2xl border border-ink-200/70 bg-white px-4 py-3 shadow-sm"><BalanceLabel props={props} /><MainAmount props={props} /><div className="mt-3"><Flow props={props} /></div></section>
      <StateMessage props={props} />
      <section aria-label="Principais gastos" className="rounded-2xl border border-ink-200/70 bg-white p-3"><div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-bold">Como seu dinheiro foi usado?</h2><button type="button" onClick={props.onStatement} className="flex min-h-9 items-center gap-0.5 text-[11px] font-semibold text-primary-700">Ver extrato<ChevronRight className="h-3.5 w-3.5" /></button></div>{props.view.categories.length ? props.view.categories.slice(0, 3).map((item) => <button type="button" key={item.categoria} onClick={() => props.onCategory(item.categoria)} className="flex min-h-11 w-full items-center gap-2 rounded-lg text-left hover:bg-ink-50"><CategoryIcon category={item.categoria} compact /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{CATEGORIES[item.categoria].nome}</span><span aria-hidden="true" className="mt-1 block h-1 overflow-hidden rounded-full bg-ink-100"><span className="block h-full rounded-full" style={{ width: props.hidden ? '0%' : `${Math.round(item.valor / props.view.expenses * 100)}%`, backgroundColor: CATEGORIES[item.categoria].cor }} /></span></span><span className="text-xs font-semibold">{cash(item.valor, props.hidden)}</span></button>) : <p className="py-2 text-xs text-ink-500">Registre um gasto para ver suas categorias.</p>}</section>
      <RecentExpenses props={props} />
    </>}
    {props.variant === 5 && <>
      <InteractiveBalanceHome props={props} />
    </>}
  </div>;
}
