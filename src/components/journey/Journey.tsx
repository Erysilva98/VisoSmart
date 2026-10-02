import { ArrowUpRight, Check, ChevronRight, LockKeyhole, Sparkles } from 'lucide-react';
import { NexoMark } from './NexoMark';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getAchievements, getPracticeDays, getSkills, localDay } from '@/lib/journey';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 shadow-sm"><NexoMark className="h-8 w-8" /></span>{!compact && <span className="font-display text-[25px] font-bold tracking-[-0.05em] text-ink-900">NYX</span>}</span>;
}

export function ProgressBar({ value, label, color = '#7A63FE' }: { value: number; label: string; color?: string }) {
  const percent = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} className="h-1.5 overflow-hidden rounded-full bg-ink-100"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: color }} /></div>;
}

export function GrowthMark({ small = false }: { small?: boolean }) {
  return <div aria-hidden="true" className={`journey-grid relative flex items-center justify-center overflow-hidden rounded-full ${small ? 'h-28 w-28' : 'h-56 w-56 sm:h-72 sm:w-72'}`}>
    <div className="absolute inset-3 rounded-full border border-primary-200/70" /><div className="absolute inset-9 rounded-full border border-primary-200/70" />
    <motion.div initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', damping: 15 }} className={`relative flex rotate-[-8deg] items-center justify-center rounded-[30%] bg-ink-900 shadow-[0_12px_0_0_#0b1025,0_22px_30px_-10px_#7A63FE45] ${small ? 'h-14 w-14' : 'h-28 w-28'}`}><NexoMark className={small ? 'h-12 w-12' : 'h-24 w-24'} /></motion.div>
    {!small && <><span className="absolute right-7 top-7 flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-amber-100 shadow-sm"><Sparkles className="h-5 w-5 text-amber-600" /></span><span className="absolute bottom-8 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft"><ArrowUpRight className="h-6 w-6 text-primary-600" /></span></>}
  </div>;
}

export function WeekPractice() {
  const state = useStore();
  const activeDays = getPracticeDays(state);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => { const day = new Date(today); day.setDate(today.getDate() - 6 + index); return day; });
  return <div className="flex justify-between gap-2">{days.map((day, index) => {
    const done = activeDays.has(localDay(day));
    return <div key={localDay(day)} className="flex flex-col items-center gap-2"><span className="text-[10px] font-medium text-ink-500">{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><span title={`${day.toLocaleDateString('pt-BR')}: ${done ? 'praticou' : 'sem atividade'}`} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${done ? 'bg-primary-100 text-primary-700' : index === 6 ? 'border-2 border-primary-500 bg-white text-primary-700' : 'bg-ink-50 text-ink-400'}`}>{done ? <Check className="h-4 w-4" aria-label="Praticou" /> : day.getDate()}</span></div>;
  })}</div>;
}

export function EvolutionCard({ compact = false }: { compact?: boolean }) {
  const state = useStore();
  const skills = getSkills(state);
  const completed = skills.filter((s) => s.current === s.target).length;
  return <section className="surface p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-violet-600">Um passo de cada vez</p><h2 className="mt-1 text-base font-bold">Sua evolução</h2></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{completed}/4 habilidades</span></div><div className="space-y-4">{skills.slice(0, compact ? 2 : 4).map((skill) => <div key={skill.title}><div className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="font-medium text-ink-700">{skill.title}</span><span className="text-ink-500">{skill.current}/{skill.target}</span></div><ProgressBar label={skill.title} value={skill.current / skill.target * 100} color={skill.color} />{!compact && <p className="mt-1.5 text-[11px] text-ink-500">{skill.detail}</p>}</div>)}</div>{compact && <Link to="/perfil" className="text-link mt-3">Ver minha evolução <ChevronRight className="h-3.5 w-3.5" /></Link>}</section>;
}

export function AchievementGrid({ compact = false }: { compact?: boolean }) {
  const state = useStore();
  const achievements = getAchievements(state);
  const unlocked = achievements.filter((a) => a.current >= a.target).length;
  return <section className="surface p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Pequenas vitórias</p><h2 className="mt-1 text-base font-bold">Suas conquistas</h2></div><span className="text-xs font-medium text-ink-500">{unlocked}/{achievements.length}</span></div><div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>{achievements.slice(0, compact ? 3 : 6).map((achievement) => {
    const earned = achievement.current >= achievement.target;
    const Icon = achievement.icon;
    return <div key={achievement.id} className={`relative rounded-2xl border p-3 text-center ${earned ? 'border-ink-200 bg-white' : 'border-dashed border-ink-200 bg-ink-50/50'}`}><div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: earned ? achievement.background : '#eff1f4', color: earned ? achievement.color : '#8b95a5' }}><Icon className="h-6 w-6" strokeWidth={1.7} /></div><p className="text-[11px] font-semibold text-ink-700">{achievement.title}</p>{!compact && <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{achievement.description}</p>}<p className={`mt-2 flex items-center justify-center gap-1 text-[10px] font-medium ${earned ? 'text-primary-700' : 'text-ink-500'}`}>{earned ? <><Check className="h-3 w-3" />Conquistado</> : <><LockKeyhole className="h-3 w-3" />{achievement.current}/{achievement.target}</>}</p></div>;
  })}</div>{compact && <Link to="/perfil" className="text-link mt-3">Todas as conquistas <ChevronRight className="h-3.5 w-3.5" /></Link>}</section>;
}
