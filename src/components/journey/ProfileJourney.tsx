import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Flag, Sparkles, Trophy } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PROFILES } from '@/data/profiles';
import { getCurrentMonthKey } from '@/data/challenges';
import { getLessonsForProfile } from '@/data/lessons';
import { missionProgress } from '@/lib/journeyMissions';
import { ProfileMark } from './NexoMark';
import { ProgressBar } from './Journey';

export function ProfileJourney() {
  const state = useStore();
  const month = getCurrentMonthKey();
  const ensure = state._ensureMonthlyChallenges;
  useEffect(() => { ensure(); }, [ensure, month]);
  const monthName = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const config = PROFILES[state.onboarding.profile ?? 'explorer'];
  const missions = state.challenges.filter((item) => item.id.startsWith('journey-') && item.mes === month);
  const lessons = getLessonsForProfile(config.id, state.preferences?.focus);
  const done = lessons.filter((item) => state.lessonProgress.some((entry) => entry.lessonId === item.id && entry.concluido)).length;
  const level = Math.floor(state.xp / 100) + 1;
  return <div className="mb-3 space-y-2">
    <section className="rounded-2xl border border-ink-200 bg-white px-3 py-2"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: config.cor, backgroundColor: config.corLight }}><ProfileMark profile={config.id} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] text-ink-500">Seu perfil</p><h2 className="text-sm font-semibold">{config.nome}</h2></div><span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700">Nível {level}</span></div><div className="mt-1.5 flex items-center gap-2"><div className="flex-1"><ProgressBar value={state.xp % 100} label="Progresso até o próximo nível" color={config.cor} /></div><span className="text-[10px] text-ink-500">{state.xp % 100}/100 XP</span></div></section>
    <section className="rounded-2xl border border-ink-200 bg-white p-3" aria-label={`Quatro missões de ${monthName}`}><header className="mb-2 flex items-center justify-between gap-2"><h2 className="flex items-center gap-1.5 text-xs font-semibold capitalize"><Flag className="h-4 w-4 text-primary-600" />Missões de {monthName}</h2><span className="text-[11px] text-ink-500">{missions.filter((item) => item.concluido).length}/4</span></header><div className="grid grid-cols-2 gap-1.5">{missions.map((mission) => { const progress = missionProgress(mission, state); const ready = progress.current >= progress.target; return <article key={mission.id} className="flex min-w-0 flex-col rounded-xl border border-ink-100 bg-ink-50/50 p-2"><div className="flex items-center justify-between gap-1"><span className="text-primary-600">{mission.concluido ? <Check className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}</span><span className="text-[9px] font-semibold text-primary-700">+{mission.xp} XP</span></div><h3 className="mt-1 line-clamp-2 min-h-8 text-[10px] font-semibold leading-tight">{mission.titulo}</h3><div className="mt-auto flex items-center gap-1"><div className="flex-1"><ProgressBar value={mission.concluido ? 100 : progress.current / progress.target * 100} label={mission.titulo} color="#648EBB" /></div><span className="text-[9px] text-ink-500">{mission.concluido ? progress.target : progress.current}/{progress.target}</span></div>{mission.concluido ? <span className="mt-1.5 flex h-7 items-center justify-center text-[10px] font-semibold text-income">Concluída</span> : ready ? <button type="button" onClick={() => state.completeChallenge(mission.id)} className="mt-1.5 flex min-h-8 items-center justify-center rounded-lg bg-primary-600 text-[10px] font-semibold text-white">Concluir</button> : <Link to={mission.categoria ?? '/aprender'} aria-label={`Continuar: ${mission.titulo}`} className="mt-1.5 flex min-h-8 items-center justify-center gap-1 rounded-lg border border-primary-200 bg-white text-[10px] font-semibold text-primary-700">Continuar<ChevronRight className="h-3 w-3" /></Link>}</article>; })}</div></section>
    <details className="rounded-xl border border-ink-200 bg-white px-3 py-1"><summary className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-semibold"><Trophy className="h-4 w-4 text-amber-600" />Conquistas<ChevronRight className="ml-auto h-3 w-3" /></summary><div className="grid grid-cols-3 gap-2 py-2">{[{ name: 'Primeiro passo', target: 1 }, { name: 'Seis passos', target: 6 }, { name: 'Trilha completa', target: lessons.length }].map((item) => <div key={item.name} className="rounded-lg bg-ink-50 p-2 text-center"><Sparkles className={`mx-auto h-4 w-4 ${done >= item.target ? 'text-amber-600' : 'text-ink-300'}`} /><p className="mt-1 text-[10px] font-semibold">{item.name}</p><p className="text-[10px] text-ink-500">{Math.min(done, item.target)}/{item.target}</p></div>)}</div><Link to="/aprender" className="text-link">Continuar trilha</Link></details>
  </div>;
}
