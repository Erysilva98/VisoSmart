import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, ChevronRight, Eye, Flag, Target, BookOpen, Trophy } from 'lucide-react';
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
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [listSize, setListSize] = useState({ height: 76, maxHeight: 320 });
  function toggleMissions() {
    const rect = listRef.current?.getBoundingClientRect();
    if (rect && !expanded) {
      const navTop = document.querySelector('nav[aria-label="Navegação principal"]')?.getBoundingClientRect().top ?? window.innerHeight;
      setListSize({ height: rect.height, maxHeight: Math.max(100, Math.min(window.innerHeight, navTop) - rect.top - 12) });
    }
    setExpanded((value) => !value);
  }
  useEffect(() => {
    if (!expanded) return;
    const close = () => setExpanded(false);
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !sectionRef.current?.contains(event.target) && !(event.target instanceof Element && event.target.closest('dialog'))) close(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('resize', close);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { window.removeEventListener('resize', close); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [expanded]);
  const [showAchievements, setShowAchievements] = useState(false);
  const completedMissions = new Set([...state.challengeHistory.map((entry) => entry.templateId), ...state.challenges.filter((entry) => entry.concluido).map((entry) => entry.id)]).size;
  const completedGoals = state.goals.filter((goal) => goal.valorAtual >= goal.valorAlvo).length;
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => { const timer = setInterval(() => setMonth(getCurrentMonthKey()), 30000); return () => clearInterval(timer); }, []);
  const ensure = state._ensureMonthlyChallenges;
  useEffect(() => { ensure(); }, [ensure, month]);
  const monthName = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const config = PROFILES[state.onboarding.profile ?? 'explorer'];
  const missions = state.challenges.filter((item) => item.id.startsWith('journey-v2-') && item.mes === month && item.perfil === config.id);
  const primaryMission = missions.find((mission) => !mission.concluido) ?? missions[0];
  const orderedMissions = primaryMission ? [primaryMission, ...missions.filter((mission) => mission.id !== primaryMission.id)] : [];
  const selected = missions.find((item) => item.id === selectedId);
  const steps = selected ? practiceProgress(selected.requirements ?? [], state, -1, month) : [];
  const categoryTotal = selected?.contextCategory ? state.transactions.filter((item) => item.tipo === 'despesa' && item.data.slice(0, 7) === month && item.categoria === selected.contextCategory).reduce((sum, item) => sum + item.valor, 0) : 0;
  const expenseTotal = state.transactions.filter((item) => item.tipo === 'despesa' && item.data.slice(0, 7) === month).reduce((sum, item) => sum + item.valor, 0);
  const lessons = getLessonsForProfile(config.id, state.preferences?.focus);
  const done = lessons.filter((item) => state.lessonProgress.some((entry) => entry.lessonId === item.id && entry.concluido)).length;
  const level = Math.floor(state.xp / 100) + 1;
  return <div className="mb-3 space-y-2">
    <div className="flex items-stretch gap-2"><section className="min-w-0 flex-1 rounded-2xl border border-ink-200 bg-white px-3 py-2"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: config.cor, backgroundColor: config.corLight }}><ProfileMark profile={config.id} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] text-ink-500">Seu perfil</p><h2 className="text-sm font-semibold">{config.nome}</h2></div><span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700">Nível {level}</span></div><div className="mt-1.5 flex items-center gap-2"><div className="flex-1"><ProgressBar value={state.xp % 100} label="Progresso até o próximo nível" color={config.cor} /></div><span className="text-[10px] text-ink-500">{state.xp % 100}/100 XP</span></div></section><button type="button" onClick={() => setShowAchievements(true)} aria-label="Ver conquistas" className="flex w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600"><Trophy className="h-6 w-6" /></button></div>
    <section ref={sectionRef} className="profile-missions" data-expanded={expanded} aria-label={`Quatro missões de ${monthName}`}>
      <header className="mb-1 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Seus desafios</p><h2 className="mt-0.5 text-lg font-semibold text-ink-900">Missões de <span className="capitalize">{monthName}</span></h2></div><div className="flex shrink-0 items-center gap-1"><span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">{missions.filter((item) => item.concluido).length}/4</span>{missions.length > 1 && <button type="button" onClick={toggleMissions} aria-expanded={expanded} aria-controls="profile-mission-list" aria-label={expanded ? 'Recolher missões' : 'Expandir missões do mês'} className="profile-missions-toggle h-9 w-9 items-center justify-center rounded-xl text-violet-700 hover:bg-violet-50">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>}</div></header>
      <p className="mb-2 text-[11px] leading-relaxed text-ink-600">{missions[0]?.theme} · quatro práticas para fazer ao longo do mês, no seu ritmo.</p>
      <div ref={listRef} className="profile-missions-anchor" style={expanded ? { minHeight: listSize.height } : undefined}><div id="profile-mission-list" className="profile-mission-list space-y-1.5" style={expanded ? { maxHeight: listSize.maxHeight } : undefined}>{orderedMissions.map((mission) => {
        const progress = missionProgress(mission, state);
        return <article key={mission.id} className="rounded-2xl border border-ink-200 bg-white px-2.5 py-1.5">
          <div className="flex items-center gap-2"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${mission.concluido ? 'bg-green-50 text-income' : 'bg-violet-50 text-violet-700'}`}>{mission.concluido ? <Check className="h-4 w-4" /> : <Flag className="h-4 w-4" />}</span><h3 className="min-w-0 flex-1 text-xs font-semibold leading-snug text-ink-900">{mission.titulo}{mission.concluido && <span className="sr-only"> · Concluída</span>}</h3>{!mission.concluido && <span className="shrink-0 text-[10px] font-bold text-primary-700">+{mission.xp} XP</span>}<button type="button" onClick={() => { state.startMission(mission.id); setSelectedId(mission.id); }} aria-label={`Ver missão: ${mission.titulo}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-700 hover:bg-primary-50"><Eye className="h-3.5 w-3.5" /></button></div>
          {!mission.concluido && <div className="flex items-center gap-2"><div className="flex-1"><ProgressBar value={progress.current / progress.target * 100} label={mission.titulo} color="#4F6DFF" /></div><span aria-label={`${progress.current} de ${progress.target} etapas concluídas`} className="shrink-0 text-[10px] text-ink-600">{progress.current}/{progress.target}</span></div>}
        </article>;
      })}</div></div>
    </section>
    {selected && <Dialog title={selected.titulo} onClose={() => setSelectedId(null)}><p className="text-xs text-violet-700">{selected.theme} · {config.nome}</p>{selected.contextCategory && expenseTotal > 0 && <p className="mt-3 rounded-xl bg-primary-50 p-3 text-sm text-ink-800">{CATEGORIES[selected.contextCategory]?.nome ?? 'Categoria acompanhada'}: <strong>{formatCurrency(categoryTotal)}</strong>, {Math.round(categoryTotal / expenseTotal * 100)}% dos gastos deste mês. Investigue os registros que formam esse valor.</p>}<p className="mt-3 text-xs text-ink-600">As ações deste mês são verificadas automaticamente. Não precisa fazer compras nem inventar registros.</p><ul className="mt-3 space-y-2">{steps.map((step, index) => <li key={index}><Link to={step.route} className="flex min-h-12 items-center gap-2 rounded-xl border border-ink-200 p-3 text-sm text-primary-700">{step.current >= step.target ? <Check className="h-4 w-4 shrink-0 text-income" /> : <span className="shrink-0 text-xs">{step.current}/{step.target}</span>}<span className="flex-1">{step.label}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul><button type="button" disabled={selected.concluido || !steps.length || steps.some((step) => step.current < step.target)} onClick={() => { state.completeChallenge(selected.id); setSelectedId(null); }} className="btn-primary mt-4 w-full">{selected.concluido ? 'Missão concluída' : `Concluir · +${selected.xp} XP`}</button></Dialog>}
    {showAchievements && <Dialog title="Suas conquistas" onClose={() => setShowAchievements(false)}>
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-4 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-4 ring-white"><Trophy className="h-8 w-8" /></span><h3 className="mt-3 text-lg font-bold">Cada passo conta</h3><p className="mt-1 text-xs leading-relaxed text-ink-600">Suas escolhas e seu aprendizado estão construindo essa jornada.</p><span className="mt-3 inline-flex rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-semibold text-violet-700">Nível {level} · {state.xp} XP</span></div>
      <div className="mt-3 grid grid-cols-2 gap-3">{[{ label: 'Missões concluídas', value: completedMissions, Icon: Flag, color: 'bg-violet-50 text-violet-700' }, { label: 'Metas alcançadas', value: completedGoals, Icon: Target, color: 'bg-green-50 text-income' }].map(({ label, value, Icon, color }) => <section key={label} className="rounded-2xl border border-ink-200 p-3"><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span><p className="mt-2 text-2xl font-bold tabular-nums">{value}</p><h3 className="mt-1 text-[11px] font-medium text-ink-600">{label}</h3></section>)}</div>
      <section className="mt-3 rounded-2xl border border-primary-100 bg-primary-50/60 p-4"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary-700" /><h3 className="flex-1 text-xs font-semibold">Trilha de aprendizado</h3><span className="text-sm font-bold text-primary-700">{done}/{lessons.length}</span></div><div className="mt-3"><ProgressBar value={done / lessons.length * 100} label="Etapas concluídas da trilha" color="#4F6DFF" /></div><div className="mt-3 grid grid-cols-3 gap-2">{[{ label: 'Primeiro passo', target: 1 }, { label: '6 etapas', target: 6 }, { label: 'Trilha completa', target: lessons.length }].map((milestone) => <div key={milestone.label} className={`rounded-xl p-2 text-center ${done >= milestone.target ? 'bg-white text-primary-800 shadow-sm' : 'text-ink-500'}`}><span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${done >= milestone.target ? 'bg-amber-100 text-amber-700' : 'border border-dashed border-ink-300'}`}>{done >= milestone.target ? <Check className="h-4 w-4" /> : <span className="text-[10px]">{milestone.target}</span>}</span><p className="mt-1 text-[10px] leading-snug">{milestone.label}</p></div>)}</div></section>
      <Link to="/aprender" className="btn-primary mt-4 w-full">{done === lessons.length ? 'Revisar minha trilha' : 'Continuar aprendendo'}<ChevronRight className="h-4 w-4" /></Link>
    </Dialog>}
  </div>;
}
