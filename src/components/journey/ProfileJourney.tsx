import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Eye, Flag, Sparkles, Trophy } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PROFILES } from '@/data/profiles';
import { getCurrentMonthKey } from '@/data/challenges';
import { getLessonsForProfile } from '@/data/lessons';
import { practiceProgress } from '@/lib/practice';
import { Dialog } from '@/components/ui/Dialog';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import { missionProgress } from '@/lib/journeyMissions';
import { ProfileMark } from './NexoMark';
import { ProgressBar } from './Journey';

export function ProfileJourney() {
  const state = useStore();
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => { const timer = setInterval(() => setMonth(getCurrentMonthKey()), 30000); return () => clearInterval(timer); }, []);
  const ensure = state._ensureMonthlyChallenges;
  useEffect(() => { ensure(); }, [ensure, month]);
  const monthName = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const config = PROFILES[state.onboarding.profile ?? 'explorer'];
  const missions = state.challenges.filter((item) => item.id.startsWith('journey-v2-') && item.mes === month && item.perfil === config.id);
  const selected = missions.find((item) => item.id === selectedId);
  const steps = selected ? practiceProgress(selected.requirements ?? [], state, -1, month) : [];
  const categoryTotal = selected?.contextCategory ? state.transactions.filter((item) => item.tipo === 'despesa' && item.data.slice(0, 7) === month && item.categoria === selected.contextCategory).reduce((sum, item) => sum + item.valor, 0) : 0;
  const expenseTotal = state.transactions.filter((item) => item.tipo === 'despesa' && item.data.slice(0, 7) === month).reduce((sum, item) => sum + item.valor, 0);
  const lessons = getLessonsForProfile(config.id, state.preferences?.focus);
  const done = lessons.filter((item) => state.lessonProgress.some((entry) => entry.lessonId === item.id && entry.concluido)).length;
  const level = Math.floor(state.xp / 100) + 1;
  return <div className="mb-3 space-y-2">
    <section className="rounded-2xl border border-ink-200 bg-white px-3 py-2"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: config.cor, backgroundColor: config.corLight }}><ProfileMark profile={config.id} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] text-ink-500">Seu perfil</p><h2 className="text-sm font-semibold">{config.nome}</h2></div><span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700">Nível {level}</span></div><div className="mt-1.5 flex items-center gap-2"><div className="flex-1"><ProgressBar value={state.xp % 100} label="Progresso até o próximo nível" color={config.cor} /></div><span className="text-[10px] text-ink-500">{state.xp % 100}/100 XP</span></div></section>
    <section aria-label={`Quatro missões de ${monthName}`}>
      <header className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Seus desafios</p><h2 className="mt-0.5 text-lg font-semibold text-ink-900">Missões de <span className="capitalize">{monthName}</span></h2></div><span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{missions.filter((item) => item.concluido).length}/4</span></header>
      <p className="mb-3 text-xs leading-relaxed text-ink-600">{missions[0]?.theme} · quatro práticas para fazer ao longo do mês, no seu ritmo.</p>
      <div className="space-y-2">{missions.map((mission) => {
        const progress = missionProgress(mission, state);
        return <article key={mission.id} className="rounded-2xl border border-ink-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mission.concluido ? 'bg-green-50 text-income' : 'bg-violet-50 text-violet-700'}`}>{mission.concluido ? <Check className="h-4 w-4" /> : <Flag className="h-4 w-4" />}</span><h3 className="min-w-0 flex-1 text-xs font-semibold leading-snug text-ink-900">{mission.titulo}</h3><span className="shrink-0 text-[10px] font-bold text-primary-700">+{mission.xp} XP</span><button type="button" onClick={() => { state.startMission(mission.id); setSelectedId(mission.id); }} aria-label={`Ver missão: ${mission.titulo}`} className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-primary-200 px-2 text-xs font-semibold text-primary-700 hover:bg-primary-50">Ver<Eye className="h-3.5 w-3.5" /></button></div>
          <div className="mt-2 flex items-center gap-2"><div className="flex-1"><ProgressBar value={mission.concluido ? 100 : progress.current / progress.target * 100} label={mission.titulo} color={mission.concluido ? '#0B784B' : '#4F6DFF'} /></div><span className="shrink-0 text-[10px] text-ink-600">{mission.concluido ? 'Concluída' : `${progress.current}/${progress.target}`}</span></div>
        </article>;
      })}</div>
    </section>
    {selected && <Dialog title={selected.titulo} onClose={() => setSelectedId(null)}><p className="text-xs text-violet-700">{selected.theme} · {config.nome}</p>{selected.contextCategory && expenseTotal > 0 && <p className="mt-3 rounded-xl bg-primary-50 p-3 text-sm text-ink-800">{CATEGORIES[selected.contextCategory]?.nome ?? 'Categoria acompanhada'}: <strong>{formatCurrency(categoryTotal)}</strong>, {Math.round(categoryTotal / expenseTotal * 100)}% dos gastos deste mês. Investigue os registros que formam esse valor.</p>}<p className="mt-3 text-xs text-ink-600">As ações deste mês são verificadas automaticamente. Não precisa fazer compras nem inventar registros.</p><ul className="mt-3 space-y-2">{steps.map((step, index) => <li key={index}><Link to={step.route} className="flex min-h-12 items-center gap-2 rounded-xl border border-ink-200 p-3 text-sm text-primary-700">{step.current >= step.target ? <Check className="h-4 w-4 shrink-0 text-income" /> : <span className="shrink-0 text-xs">{step.current}/{step.target}</span>}<span className="flex-1">{step.label}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul><button type="button" disabled={selected.concluido || !steps.length || steps.some((step) => step.current < step.target)} onClick={() => { state.completeChallenge(selected.id); setSelectedId(null); }} className="btn-primary mt-4 w-full">{selected.concluido ? 'Missão concluída' : `Concluir · +${selected.xp} XP`}</button></Dialog>}
    <details className="rounded-xl border border-ink-200 bg-white px-3 py-1"><summary className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-semibold"><Trophy className="h-4 w-4 text-amber-600" />Conquistas<ChevronRight className="ml-auto h-3 w-3" /></summary><div className="grid grid-cols-3 gap-2 py-2">{[{ name: 'Primeiro passo', target: 1 }, { name: 'Seis passos', target: 6 }, { name: 'Trilha completa', target: lessons.length }].map((item) => <div key={item.name} className="rounded-lg bg-ink-50 p-2 text-center"><Sparkles className={`mx-auto h-4 w-4 ${done >= item.target ? 'text-amber-600' : 'text-ink-300'}`} /><p className="mt-1 text-[10px] font-semibold">{item.name}</p><p className="text-[10px] text-ink-500">{Math.min(done, item.target)}/{item.target}</p></div>)}</div><Link to="/aprender" className="text-link">Continuar trilha</Link></details>
  </div>;
}
