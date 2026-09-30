import { BudgetRuleCard } from '@/components/ui/BudgetRuleCard';
import { useState } from 'react';
import { CalendarClock, ChevronRight, CircleDollarSign, Plus, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { useStore } from '@/store/useStore';
import { getDespesasMes, getReceitasMes } from '@/lib/analytics';
import { getMonthlyForecast } from '@/lib/forecast';
import { formatCurrency } from '@/lib/format';

/** Centraliza a leitura do mês, compromissos e objetivo sem exigir novas telas no menu. */
export function Planning() {
  const navigate = useNavigate();
  const { transactions, plannedExpenses, creditCards, creditCardExpenses, goals, updateGoal } = useStore();
  const [contributionId, setContributionId] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const income = getReceitasMes(transactions);
  const spent = getDespesasMes(transactions);
  const forecast = getMonthlyForecast(plannedExpenses, creditCards, creditCardExpenses);
  const free = income - spent - forecast.pending;
  const mainGoal = goals[0];
  const contribute = () => {
    const amount = Number(value.replace(',', '.'));
    const goal = goals.find((item) => item.id === contributionId);
    if (!goal || !Number.isFinite(amount) || amount <= 0) return;
    updateGoal(goal.id, Math.min(goal.valorAlvo, goal.valorAtual + amount));
    setContributionId(null);
    setValue('');
  };

  return <Layout title="Planejamento"><main className="space-y-4">
    <section className="rounded-3xl bg-primary-600 p-5 text-white shadow-card"><p className="text-sm font-medium">Meu mês</p><div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><span>Recebi <b className="block text-lg">{formatCurrency(income)}</b></span><span>Já gastei <b className="block text-lg">{formatCurrency(spent)}</b></span><span>Ainda vou pagar <b className="block text-lg">{formatCurrency(forecast.pending)}</b></span><span>Livre depois disso <b className="block text-lg">{formatCurrency(free)}</b></span></div>{income === 0 && <p className="mt-4 text-sm text-primary-50">Registre uma entrada para comparar seus compromissos com o dinheiro do mês.</p>}</section>
    <section className="rounded-3xl bg-white p-5 shadow-card"><div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary-600" /><h1 className="flex-1 font-bold text-ink-900">Compromissos</h1><span className="text-sm text-ink-500">{forecast.commitments}</span></div><p className="mt-2 text-sm text-ink-600">Você ainda tem {formatCurrency(forecast.pending)} para pagar neste mês.</p><button type="button" onClick={() => navigate('/previsoes')} className="btn-secondary mt-4 w-full"><Plus className="h-4 w-4" /> Adicionar compromisso</button></section>
    <section className="rounded-3xl bg-white p-5 shadow-card"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-primary-600" /><h1 className="flex-1 font-bold text-ink-900">Meu objetivo</h1><button onClick={() => navigate('/metas')} className="text-sm font-semibold text-primary-600">Ver todos</button></div>{mainGoal ? <><div className="mt-4 flex justify-between text-sm"><b>{mainGoal.titulo}</b><span>{formatCurrency(mainGoal.valorAtual)} / {formatCurrency(mainGoal.valorAlvo)}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-100"><div className="h-full bg-primary-600" style={{ width: `${Math.min(100, mainGoal.valorAtual / mainGoal.valorAlvo * 100)}%` }} /></div><button type="button" onClick={() => { setContributionId(mainGoal.id); setValue(''); }} className="btn-primary mt-4 w-full"><CircleDollarSign className="h-4 w-4" /> Aportar</button></> : <button type="button" onClick={() => navigate('/metas')} className="btn-secondary mt-4 w-full"><Plus className="h-4 w-4" /> Criar objetivo</button>}</section>
    <section className="rounded-3xl bg-white p-5 shadow-card"><h1 className="font-bold text-ink-900">Meu plano</h1><div className="mt-3"><BudgetRuleCard /></div><button type="button" onClick={() => navigate('/orcamentos')} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-ink-50 p-4 text-left"><span><b className="block">Regra 50 / 30 / 20</b><small className="text-ink-500">Ajustar meu plano do mês</small></span><ChevronRight className="h-5 w-5 text-ink-400" /></button></section>
    {contributionId && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="font-bold">Aportar no objetivo</h2><button onClick={() => setContributionId(null)}><X className="text-ink-400" /></button></div><input autoFocus value={value} onChange={(event) => setValue(event.target.value.replace(/[^0-9.,]/g, ''))} inputMode="decimal" className="input mt-4" placeholder="Valor do aporte (R$)" /><button disabled={!Number(value.replace(',', '.'))} onClick={contribute} className="btn-primary mt-3 w-full">Confirmar aporte</button></section></div>}
  </main></Layout>;
}
