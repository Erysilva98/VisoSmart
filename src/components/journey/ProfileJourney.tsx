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
  const config = PROFILES[state.onboarding.profile ?? 'explorer'];
  const missions = state.challenges.filter((item) => item.id.startsWith('journey-') && item.mes === month);
  const lessons = getLessonsForProfile(config.id, state.preferences?.focus);
  const done = lessons.filter((item) => state.lessonProgress.some((entry) => entry.lessonId === item.id && entry.concluido)).length;
  const level = Math.floor(state.xp / 100) + 1;
  return <div className="mb-4 space-y-3"><section className="rounded-2xl border border-ink-200 bg-white p-4"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ color: config.cor, backgroundColor: config.corLight }}><ProfileMark profile={config.id} className="h-6 w-6" /></span><div className="flex-1"><p className="text-[10px] text-ink-500">Seu perfil de aprendizado</p><h2 className="text-lg font-semibold">{config.nome}</h2><p className="text-[11px] text-ink-500">{config.objetivo}</p></div></div><div className="mb-2 mt-4 flex justify-between text-xs"><span className="flex items-center gap-1 font-semibold text-primary-700"><Sparkles className="h-3.5 w-3.5" />Nível de prática {level}</span><span className="text-ink-500">{state.xp} XP acumulados</span></div><ProgressBar value={state.xp % 100} label="Progresso até o próximo nível" color={config.cor} /><p className="mt-2 text-[10px] leading-relaxed text-ink-500">Faltam {100 - state.xp % 100} XP para o próximo nível. Pontos celebram etapas e missões concluídas, não quanto você gasta ou quanto dinheiro tem.</p></section><section className="rounded-2xl border border-ink-200 bg-white p-4" aria-label="Quatro missões do mês"><header className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-semibold"><Flag className="h-4 w-4 text-primary-600" />Suas 4 missões do mês</h2><span className="text-xs text-ink-500">{missions.filter((item) => item.concluido).length}/4</span></header><div className="grid grid-cols-2 gap-2">{missions.map((mission) => {
    const progress = missionProgress(mission, state);
    const ready = progress.current >= progress.target;
    return <article key={mission.id} className="flex min-w-0 flex-col rounded-xl border border-ink-100 bg-ink-50/40 p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${mission.concluido ? 'bg-primary-100 text-primary-700' : 'bg-white text-primary-600'}`}>{mission.concluido ? <Check className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}</span>
        
        <span className="shrink-0 text-[10px] font-semibold text-primary-700">+{mission.xp} XP</span>
      </div>
      <h3 className="mt-2 min-w-0 text-xs font-semibold leading-relaxed">{mission.titulo}</h3>
      <details className="mt-1 text-[11px] text-ink-500"><summary className="flex min-h-8 cursor-pointer items-center text-primary-700">Como concluir</summary><p className="pb-2 leading-relaxed">{mission.descricao}</p></details>
      <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-2 pt-2">
        <div className="min-w-0 flex-1"><ProgressBar value={mission.concluido ? 100 : progress.current / progress.target * 100} label={mission.titulo} color="#648EBB" /></div>
        <span className="text-[10px] tabular-nums text-ink-500">{mission.concluido ? progress.target : progress.current}/{progress.target}</span>
        {mission.concluido ? <span className="col-span-2 flex min-h-11 items-center justify-center text-[11px] font-semibold text-primary-700">Concluída</span> : ready ? <button type="button" onClick={() => state.completeChallenge(mission.id)} className="col-span-2 flex min-h-11 w-full min-w-0 items-center justify-center rounded-xl border border-primary-600 bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Concluir missão</button> : <Link to={mission.categoria ?? '/aprender'} aria-label={`Continuar: ${mission.titulo}`} className="col-span-2 flex min-h-11 w-full min-w-0 items-center justify-center gap-1 rounded-xl border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Continuar<ChevronRight className="h-3 w-3" /></Link>}
      </div>
    </article>;
  })}</div><p className="mt-3 text-[10px] leading-relaxed text-ink-500">Use situações reais. Você não perde pontos por fazer uma pausa. Novas missões aparecem a cada mês.</p></section><section className="rounded-2xl border border-ink-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Suas conquistas</h2><Link to="/aprender" className="text-link text-[11px]">Continuar trilha</Link></div><div className="mt-2 grid grid-cols-3 gap-2">{[{ name: 'Primeira descoberta', target: 1 }, { name: 'Seis passos', target: 6 }, { name: 'Caminho completo', target: lessons.length }].map((item) => <div key={item.name} className={`rounded-xl border p-3 text-center ${done >= item.target ? 'border-primary-100 bg-primary-50' : 'border-ink-100 bg-ink-50'}`}><Trophy className={`mx-auto h-5 w-5 ${done >= item.target ? 'text-amber-600' : 'text-ink-300'}`} /><p className="mt-2 text-[10px] font-semibold">{item.name}</p><p className="mt-1 text-[10px] text-ink-500">{Math.min(done, item.target)}/{item.target}</p></div>)}</div></section></div>;
}
