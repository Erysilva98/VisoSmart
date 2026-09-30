import { useState } from 'react';
import { ArrowDownToLine, Bike, BookOpen, Check, ChevronDown, ChevronRight, ChevronUp, Headphones, Home, Laptop, Plane, PiggyBank, Smartphone, Sparkles, Target, Trash2 } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/journey/Journey';
import { useStore } from '@/store/useStore';
import { recordedMoney } from '@/lib/financialSummary';
import { formatCurrency } from '@/lib/format';
import { parseAmount } from '@/lib/money';

const GOAL_ICONS = [
  { id: 'Headphones', label: 'Fone', icon: Headphones, color: '#7C5CFF' },
  { id: 'Smartphone', label: 'Celular', icon: Smartphone, color: '#2476CE' },
  { id: 'Plane', label: 'Viagem', icon: Plane, color: '#C25E08' },
  { id: 'Laptop', label: 'Notebook', icon: Laptop, color: '#245789' },
  { id: 'Bike', label: 'Bicicleta', icon: Bike, color: '#15803D' },
  { id: 'BookOpen', label: 'Estudos', icon: BookOpen, color: '#245789' },
  { id: 'Sparkles', label: 'Outro', icon: Sparkles, color: '#BE185D' },
];

export function Goals() {
  const { goals, transactions, openingBalance, addGoal, updateGoal, deleteGoal } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'active' | 'done'>('active');
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [icon, setIcon] = useState('Headphones');
  const [name, setName] = useState('Fone');
  const [target, setTarget] = useState('');
  const [months, setMonths] = useState('6');
  const [contributionId, setContributionId] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [contribution, setContribution] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const free = recordedMoney(transactions, goals, openingBalance).available;
  const value = parseAmount(target);
  const monthsValue = Number(months);
  const validGoal = name.trim().length > 0 && Number.isFinite(value) && value > 0 && Number.isInteger(monthsValue) && monthsValue > 0 && monthsValue <= 1200;
  const selectedGoal = goals.find((item) => item.id === contributionId);
  const contributionValue = parseAmount(contribution);
  const remaining = selectedGoal ? Math.max(0, selectedGoal.valorAlvo - selectedGoal.valorAtual) : 0;
  const validContribution = Number.isFinite(contributionValue) && contributionValue > 0 && contributionValue <= (releasing ? selectedGoal?.valorAtual ?? 0 : Math.min(remaining, Math.max(0, free)));
  const activeGoals = goals.filter((item) => item.valorAtual < item.valorAlvo);
  const completedGoals = goals.filter((item) => item.valorAtual >= item.valorAlvo);
  const visibleGoals = tab === 'active' ? activeGoals : completedGoals;
  const totalSaved = goals.reduce((sum, goal) => sum + goal.valorAtual, 0);

  function chooseGoal(id: string, label: string) { setIcon(id); setName(id === 'Sparkles' ? '' : label); setTarget(''); setMonths('6'); setShowForm(true); }
  function createGoal(event: React.FormEvent) {
    event.preventDefault(); if (!validGoal) return;
    addGoal({ titulo: name.trim(), valorAlvo: value, meses: monthsValue, icone: icon });
    setShowForm(false); setMessage('Meta criada!'); setTab('active');
  }
  function contribute(event: React.FormEvent) {
    event.preventDefault(); if (!selectedGoal || !validContribution) return;
    updateGoal(selectedGoal.id, Math.round((selectedGoal.valorAtual + (releasing ? -contributionValue : contributionValue)) * 100) / 100);
    setContributionId(null); setContribution(''); setMessage(releasing ? 'Reserva liberada.' : 'Valor separado para sua meta.');
  }

  return <Layout title="Metas" compact>
    <header className="mb-3 flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Seus sonhos</p><h1 className="text-lg font-semibold">Escolha uma meta</h1></div><span className="text-right text-[11px] text-ink-500">Guardado<br /><strong className="text-sm text-ink-900">{formatCurrency(totalSaved)}</strong></span></header>
    <nav aria-label="Criar uma meta" className="grid grid-cols-4 gap-2">{(showAllOptions ? GOAL_ICONS : GOAL_ICONS.slice(0, 4)).map(({ id, label, icon: Icon, color }) => <button key={id} type="button" onClick={() => chooseGoal(id, label)} aria-label={`Criar meta: ${label}`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-ink-200 bg-white px-1 text-[10px] font-semibold hover:border-primary-300 hover:bg-primary-50"><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ color, backgroundColor: `${color}12` }}><Icon className="h-4 w-4" /></span>{label}</button>)}</nav><button type="button" onClick={() => setShowAllOptions(!showAllOptions)} aria-expanded={showAllOptions} className="mb-2 flex min-h-9 w-full items-center justify-center gap-1 text-xs font-semibold text-primary-700">{showAllOptions ? 'Mostrar menos' : 'Ver mais sonhos'}{showAllOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
    {message && <p role="status" className="mb-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-800">{message}</p>}
    <div className="mb-2 grid grid-cols-2 rounded-xl bg-white p-1" role="group" aria-label="Filtrar metas"><button type="button" aria-pressed={tab === 'active'} onClick={() => setTab('active')} className={`min-h-9 rounded-lg text-xs font-semibold ${tab === 'active' ? 'border border-primary-500 bg-primary-50 text-primary-700' : 'text-ink-500'}`}>Em andamento ({activeGoals.length})</button><button type="button" aria-pressed={tab === 'done'} onClick={() => setTab('done')} className={`min-h-9 rounded-lg text-xs font-semibold ${tab === 'done' ? 'border border-primary-500 bg-primary-50 text-primary-700' : 'text-ink-500'}`}>Concluídas ({completedGoals.length})</button></div>
    <div className="grid gap-2">{visibleGoals.length ? visibleGoals.map((goal) => { const visual = GOAL_ICONS.find((item) => item.id === goal.icone); const Icon = visual?.icon ?? (goal.icone === 'Home' ? Home : Target); const color = visual?.color ?? '#64748B'; const progress = goal.valorAlvo > 0 ? Math.min(100, goal.valorAtual / goal.valorAlvo * 100) : 0; return <article key={goal.id} className="rounded-2xl border border-ink-200 bg-white p-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ color, backgroundColor: `${color}12` }}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{goal.titulo}</h2><p className="text-[11px] text-ink-500">{formatCurrency(goal.valorAtual)} / {formatCurrency(goal.valorAlvo)}</p></div><span className="text-xs font-semibold text-primary-700">{Math.round(progress)}%</span></div><div className="mt-2"><ProgressBar label={`Meta ${goal.titulo}`} value={progress} color={color} /></div><div className="mt-1.5 flex items-center justify-between"><button type="button" onClick={() => setDeleteId(goal.id)} aria-label={`Excluir meta ${goal.titulo}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400"><Trash2 className="h-4 w-4" /></button><div className="flex gap-2">{goal.valorAtual > 0 && <button type="button" onClick={() => { setReleasing(true); setContributionId(goal.id); setContribution(''); }} className="flex min-h-9 items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 text-[11px] font-semibold text-primary-700"><ArrowDownToLine className="h-3.5 w-3.5" />Liberar</button>}{progress < 100 ? <button type="button" onClick={() => { setReleasing(false); setContributionId(goal.id); setContribution(''); }} className="flex min-h-9 items-center gap-1 rounded-lg bg-primary-600 px-3 text-[11px] font-semibold text-white"><PiggyBank className="h-3.5 w-3.5" />Guardar</button> : <span className="flex min-h-9 items-center gap-1 text-xs text-income"><Check className="h-4 w-4" />Conquistada</span>}</div></div></article>; }) : <p className="rounded-xl bg-white px-4 py-3 text-xs text-ink-500">{tab === 'active' ? 'Escolha um dos ícones acima para criar sua primeira meta.' : 'Suas metas concluídas aparecerão aqui.'}</p>}</div>
    {showForm && <Dialog title="Nova meta" onClose={() => setShowForm(false)}><form onSubmit={createGoal} className="space-y-4"><fieldset><legend className="mb-2 text-xs font-semibold text-ink-600">1. Escolha seu sonho</legend><div className="grid grid-cols-4 gap-2">{GOAL_ICONS.map(({ id, label, icon: Icon, color }) => <button key={id} type="button" aria-label={label} aria-pressed={icon === id} onClick={() => { setIcon(id); setName(id === 'Sparkles' ? '' : label); }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-semibold ${icon === id ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`} style={{ color, backgroundColor: `${color}12`, borderColor: icon === id ? color : `${color}30` }}><Icon className="h-5 w-5" />{label}</button>)}</div></fieldset>{icon === 'Sparkles' && <label className="block text-xs font-semibold text-ink-600">Nome do seu sonho<input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex.: meu curso" className="input mt-2 text-sm" /></label>}<label className="block text-xs font-semibold text-ink-600">2. Quanto custa?<input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="R$ 0,00" className="input mt-2 text-xl font-semibold" /></label><fieldset><legend className="mb-2 text-xs font-semibold text-ink-600">3. Em quanto tempo?</legend><div className="grid grid-cols-4 gap-2">{[3, 6, 12].map((amount) => <button key={amount} type="button" aria-pressed={months === String(amount)} onClick={() => setMonths(String(amount))} className={`min-h-11 rounded-xl border text-xs font-semibold ${months === String(amount) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-ink-200'}`}>{amount} meses</button>)}<input aria-label="Outro prazo em meses" value={[3, 6, 12].includes(Number(months)) ? '' : months} onChange={(e) => setMonths(e.target.value)} inputMode="numeric" placeholder="Outro" className="input min-w-0 px-2 text-center text-xs" /></div></fieldset>{validGoal && <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-800">Para chegar lá: cerca de {formatCurrency(value / monthsValue)} por mês.</p>}<button type="submit" disabled={!validGoal} className="btn-primary w-full text-sm">Criar meta<ChevronRight className="h-4 w-4" /></button></form></Dialog>}
    {selectedGoal && <Dialog title={`${releasing ? 'Liberar de' : 'Separar para'} ${selectedGoal.titulo}`} onClose={() => setContributionId(null)}><form onSubmit={contribute}><p className="mb-4 text-sm text-ink-500">{releasing ? `Reservado: ${formatCurrency(selectedGoal.valorAtual)}.` : `Livre pelos registros: ${formatCurrency(Math.max(0, free))}. Faltam ${formatCurrency(remaining)} para a meta.`}</p><label className="block text-xs font-semibold text-ink-600">{releasing ? 'Quanto quer liberar?' : 'Quanto vai separar?'}<input autoFocus value={contribution} onChange={(e) => setContribution(e.target.value)} inputMode="decimal" placeholder="0,00" className="input mt-2" /></label>{contribution && !validContribution && <p className="mt-3 text-xs text-danger">Informe um valor entre R$ 0,01 e {formatCurrency(releasing ? selectedGoal.valorAtual : Math.max(0, Math.min(remaining, free)))}.</p>}<button type="submit" disabled={!validContribution} className="btn-primary mt-5 w-full text-sm">{releasing ? 'Liberar reserva' : 'Confirmar reserva'}</button></form></Dialog>}
    {deleteId && <Dialog title="Excluir esta meta?" onClose={() => setDeleteId(null)}><p className="text-sm text-ink-500">O valor reservado ficará livre. Esta ação não pode ser desfeita.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm">Cancelar</button><button type="button" onClick={() => { deleteGoal(deleteId); setDeleteId(null); }} className="btn flex-1 bg-danger px-4 py-3 text-sm text-white">Excluir</button></div></Dialog>}
  </Layout>;
}
