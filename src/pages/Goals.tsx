import { recordedMoney } from '@/lib/financialSummary';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, BookOpen, Check, Headphones, Home, Plane, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/journey/Journey';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/format';
import { parseAmount } from '@/lib/money';

const GOAL_ICONS = [
  { id: 'Headphones', label: 'Fone', icon: Headphones, color: '#7C5CFF' }, { id: 'Bike', label: 'Bicicleta', icon: Bike, color: '#15803D' },
  { id: 'Plane', label: 'Viagem', icon: Plane, color: '#C25E08' }, { id: 'BookOpen', label: 'Estudos', icon: BookOpen, color: '#245789' },
  { id: 'Sparkles', label: 'Outro sonho', icon: Sparkles, color: '#BE185D' },
];
export function Goals() {
  const { goals, transactions, openingBalance, addGoal, updateGoal, deleteGoal } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState('Headphones');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [months, setMonths] = useState('');
  const [contributionId, setContributionId] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const free = recordedMoney(transactions, goals, openingBalance).available;
  const [contribution, setContribution] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const value = parseAmount(target);
  const monthsValue = Number(months);
  const validGoal = name.trim().length > 0 && Number.isFinite(value) && value > 0 && Number.isInteger(monthsValue) && monthsValue > 0 && monthsValue <= 1200;
  const contributionValue = parseAmount(contribution);
  const selectedGoal = goals.find((g) => g.id === contributionId);
  const remaining = selectedGoal ? Math.max(0, selectedGoal.valorAlvo - selectedGoal.valorAtual) : 0;
  const validContribution = Number.isFinite(contributionValue) && contributionValue > 0 && contributionValue <= (releasing ? selectedGoal?.valorAtual ?? 0 : Math.min(remaining, Math.max(0, free)));
  function createGoal(event: React.FormEvent) {
    event.preventDefault(); if (!validGoal) return;
    addGoal({ titulo: name.trim(), valorAlvo: value, meses: monthsValue, icone: icon });
    setName(''); setTarget(''); setMonths(''); setShowForm(false); setMessage('Seu sonho ganhou um plano. Meta criada!');
  }
  function contribute(event: React.FormEvent) {
    event.preventDefault(); if (!selectedGoal || !validContribution) return;
    updateGoal(selectedGoal.id, Math.round((selectedGoal.valorAtual + (releasing ? -contributionValue : contributionValue)) * 100) / 100);
    setContributionId(null); setContribution(''); setMessage(releasing ? 'Reserva liberada. Esse dinheiro voltou ao valor livre; não é uma nova receita.' : 'Dinheiro reservado. O valor livre diminuiu, mas seu total não mudou.');
  }
  const totalSaved = goals.reduce((sum, goal) => sum + goal.valorAtual, 0);
  return <Layout title="Metas" compact>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2 text-amber-700">Sonhos merecem um plano</p><h1 className="text-xl font-semibold">O que você quer conquistar?</h1><p className="page-copy">Dê um nome ao seu objetivo. Comece do seu jeito.</p></div><button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" />Nova meta</button></div>
    <div role="status" aria-live="polite">{message && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800"><Check className="h-4 w-4 shrink-0" /><span className="flex-1">{message}</span><button type="button" onClick={() => setMessage('')} className="text-xs">Fechar</button></div>}</div>
    <section className="surface mb-6 flex flex-wrap items-center gap-4 p-5 sm:p-6"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Target className="h-6 w-6" /></span><div className="flex-1"><p className="text-xs text-ink-500">Guardado para seus sonhos</p><p className="mt-1 text-2xl font-semibold tracking-tight">{formatCurrency(totalSaved)}</p></div><span className="text-xs text-ink-500">{goals.filter((g) => g.valorAtual >= g.valorAlvo).length} de {goals.length} metas alcançadas</span></section>
    {!goals.length ? <section className="surface px-6 py-12 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500"><FlagIllustration /></div><h2 className="mt-5 text-xl font-bold">Tudo começa com um “eu quero”.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-500">Um fone, uma bicicleta, uma experiência. Escolha algo importante para você e acompanhe cada pequeno passo.</p><button type="button" onClick={() => setShowForm(true)} className="btn-secondary mt-6 text-sm">Criar minha primeira meta <Plus className="h-4 w-4" /></button></section> : <div className="grid gap-5 lg:grid-cols-2">{goals.map((goal) => {
      const color = GOAL_ICONS.find((item) => item.id === goal.icone)?.color ?? '#64748B';
      const Icon = GOAL_ICONS.find((item) => item.id === goal.icone)?.icon ?? (goal.icone === 'Home' ? Home : Target);
      const progress = goal.valorAlvo > 0 ? Math.min(100, goal.valorAtual / goal.valorAlvo * 100) : 0;
      const elapsed = Math.max(0, (new Date().getFullYear() - new Date(goal.criadaEm).getFullYear()) * 12 + new Date().getMonth() - new Date(goal.criadaEm).getMonth());
      const monthsLeft = goal.prazo ? Math.max(1, Math.ceil((new Date(goal.prazo).getTime() - Date.now()) / 2592000000)) : goal.meses ? Math.max(1, goal.meses - elapsed) : null;
      const monthly = monthsLeft ? Math.max(0, goal.valorAlvo - goal.valorAtual) / monthsLeft : 0;

      return <motion.section key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ color, backgroundColor: `${color}12` }}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="truncate font-bold">{goal.titulo}</h2><p className="mt-1 text-xs text-ink-500">{progress >= 100 ? 'Você conseguiu!' : 'Um passo de cada vez'}</p></div><button type="button" onClick={() => setDeleteId(goal.id)} aria-label={`Excluir meta ${goal.titulo}`} className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div><div className="mb-3 mt-6 flex items-baseline justify-between gap-2"><span className="text-xl font-semibold tracking-tight">{formatCurrency(goal.valorAtual)}</span><span className="text-xs text-ink-500">de {formatCurrency(goal.valorAlvo)}</span></div><ProgressBar label={`Meta ${goal.titulo}`} value={progress} color={color} /><div className="mt-3 flex items-center justify-between"><span className="text-xs text-ink-500">{Math.round(progress)}% do seu sonho</span></div>{progress < 100 ? <><p className="mt-3 text-xs leading-relaxed text-ink-500">{monthsLeft ? `Para chegar em aproximadamente ${monthsLeft} ${monthsLeft === 1 ? 'mês' : 'meses'}: ${formatCurrency(monthly)} por mês.` : `Faltam ${formatCurrency(goal.valorAlvo - goal.valorAtual)} para chegar lá.`}</p><button type="button" onClick={() => { setReleasing(false); setContributionId(goal.id); setContribution(''); }} className="btn-secondary mt-5 w-full text-sm"><Plus className="h-4 w-4" />Separar dinheiro</button></> : <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary-50 py-3 text-sm font-semibold text-primary-700"><Check className="h-4 w-4" />Meta conquistada</p>}{goal.valorAtual > 0 && <button type="button" onClick={() => { setReleasing(true); setContributionId(goal.id); setContribution(''); }} className="mt-2 min-h-11 w-full text-xs font-semibold text-primary-700">Liberar dinheiro reservado</button>}</motion.section>;
    })}</div>}
    {showForm && <Dialog title="Um novo sonho no papel" onClose={() => setShowForm(false)}><form onSubmit={createGoal} className="space-y-4"><div className="grid grid-cols-5 gap-2">{GOAL_ICONS.map(({ id, label, icon: Icon, color }) => <button key={id} type="button" aria-label={label} aria-pressed={icon === id} onClick={() => setIcon(id)} className={`flex h-12 items-center justify-center rounded-xl border ${icon === id ? 'ring-2 ring-offset-2' : ''}`} style={{ color, backgroundColor: `${color}12`, borderColor: icon === id ? color : `${color}30`, outlineColor: color }}><Icon className="h-5 w-5" /></button>)}</div><label className="block text-xs font-semibold text-ink-600">O que você quer conquistar?<input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex.: meu primeiro fone" className="input mt-2 text-sm" /></label><label className="block text-xs font-semibold text-ink-600">Qual é o valor da meta?<input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="R$ 0,00" className="input mt-2 text-sm" /></label><label className="block text-xs font-semibold text-ink-600">Em quantos meses?<input value={months} onChange={(e) => setMonths(e.target.value)} inputMode="numeric" placeholder="Ex.: 6" className="input mt-2 text-sm" /></label><p className="text-xs leading-relaxed text-ink-500">Escolha um prazo possível para você. Seu plano pode começar pequeno.</p><button type="submit" disabled={!validGoal} className="btn-primary w-full text-sm">Criar minha meta</button></form></Dialog>}
    {selectedGoal && <Dialog title={`${releasing ? 'Liberar de' : 'Separar para'} ${selectedGoal.titulo}`} onClose={() => setContributionId(null)}><form onSubmit={contribute}><p className="mb-4 text-sm text-ink-500">{releasing ? `Reservado: ${formatCurrency(selectedGoal.valorAtual)}.` : `Livre pelos registros: ${formatCurrency(Math.max(0, free))}. Faltam ${formatCurrency(remaining)} para a meta.`}</p><label className="block text-xs font-semibold text-ink-600">{releasing ? 'Quanto quer liberar?' : 'Quanto vai separar?'}<input autoFocus value={contribution} onChange={(e) => setContribution(e.target.value)} inputMode="decimal" placeholder="0,00" className="input mt-2" /></label><p className="mt-3 text-xs leading-relaxed text-ink-500">O app não movimenta sua conta. Reservar reduz o dinheiro livre; liberar aumenta. Se você gastar esse dinheiro, registre a despesa no extrato.</p>{contribution && !validContribution && <p className="mt-3 text-xs text-danger">Informe um valor maior que zero e até {formatCurrency(releasing ? selectedGoal.valorAtual : Math.max(0, Math.min(remaining, free)))}.</p>}<button type="submit" disabled={!validContribution} className="btn-primary mt-5 w-full text-sm">{releasing ? 'Liberar reserva' : 'Confirmar reserva'}</button></form></Dialog>}
    {deleteId && <Dialog title="Excluir esta meta?" onClose={() => setDeleteId(null)}><p className="text-sm leading-relaxed text-ink-500">A meta será removida e o valor reservado ficará livre novamente. Nenhuma receita será criada. Essa ação não pode ser desfeita.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm">Cancelar</button><button type="button" onClick={() => { deleteGoal(deleteId); setDeleteId(null); }} className="btn flex-1 bg-danger px-4 py-3 text-sm text-white">Excluir meta</button></div></Dialog>}
  </Layout>;
}
function FlagIllustration() { return <Target className="h-10 w-10" strokeWidth={1.4} />; }
