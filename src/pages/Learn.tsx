import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Check, ChevronDown, ChevronRight, LockKeyhole, Sparkles, Trophy } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { useStore } from '@/store/useStore';
import { getLessonsForProfile, type Lesson } from '@/data/lessons';
import { canCompleteLesson } from '@/lib/progress';

export function Learn() {
  const state = useStore();
  const profile = state.onboarding.profile ?? 'explorer';
  const lessons = getLessonsForProfile(profile, state.preferences?.focus);
  const completed = new Set(state.lessonProgress.filter((item) => item.concluido).map((item) => item.lessonId));
  const active = lessons.find((item) => !completed.has(item.id));
  const [review, setReview] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState('');
  const lesson = lessons.find((item) => item.id === review) ?? active;
  const done = lessons.filter((item) => completed.has(item.id)).length;
  const index = lesson ? lessons.findIndex((item) => item.id === lesson.id) : lessons.length;

  return <Layout title="Aprender" compact>
    <div className="learn-screen">
      <header className="learn-header flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-1.5"><h1 className="text-sm font-semibold text-emerald-900">Trilha de aprendizado</h1><div className="flex items-center gap-1"><span className="text-xs font-semibold text-emerald-800" aria-label={`${done} de ${lessons.length} etapas concluídas`}>{done}/{lessons.length}</span><button type="button" onClick={() => setShowHistory(true)} aria-label="Expandir etapas concluídas" title="Etapas concluídas" className="flex h-10 w-10 items-center justify-center rounded-lg text-emerald-800 hover:bg-emerald-100"><ChevronDown className="h-4 w-4" /></button></div></header>
      {message && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-800">{message}</p>}
      {lesson ? <LessonCard key={lesson.id} lesson={lesson} index={index} done={completed.has(lesson.id)} ready={canCompleteLesson(lesson.id, state)} onReview={(answer) => { state.reviewLesson(lesson.id, answer); setMessage('Revisão registrada.'); setReview(null); }} onComplete={(answer) => { state.completeLesson(lesson.id, answer); setMessage(`+${lesson.xp} XP! Próxima etapa liberada.`); setReview(null); }} /> : <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-center"><Trophy className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 font-semibold">Trilha concluída!</h2></section>}
    </div>
    {showHistory && <Dialog title="Etapas concluídas" onClose={() => setShowHistory(false)}><div className="grid gap-1">{lessons.filter((item) => completed.has(item.id)).map((item) => <button key={item.id} type="button" onClick={() => { setReview(item.id); setShowHistory(false); }} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-left text-xs hover:bg-ink-50"><Check className="h-4 w-4 text-emerald-600" />{item.titulo}</button>)}{done === 0 && <p className="text-xs text-ink-500">Sua primeira etapa aparece aqui depois de concluída.</p>}</div></Dialog>}
  </Layout>;
}

function LessonCard({ lesson, index, done, ready, onComplete, onReview }: { lesson: Lesson; index: number; done: boolean; ready: boolean; onComplete: (answer: number) => void; onReview: (answer: number) => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = answer === lesson.question?.correct;
  const task = lesson.desafioPratico;
  return <motion.section initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="learn-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"><div className="shrink-0 border-b border-emerald-100 bg-emerald-50 px-4 py-2"><p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><BookOpen className="h-3.5 w-3.5" />{done ? 'Revisão' : `Etapa ${index + 1}`} · {lesson.duracao} · +{lesson.xp} XP</p><h2 className="mt-0.5 text-base font-bold text-ink-900">{lesson.titulo}</h2></div><div className="learn-card-body min-h-0 flex-1 overflow-y-auto p-3"><p className="text-xs leading-relaxed text-ink-700">{lesson.conteudo}</p><div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2"><p className="text-[11px] font-bold text-emerald-800">Atividade no app</p><p className="mt-0.5 text-xs leading-snug text-ink-700">{task?.descricao}</p>{task && task.rota !== '/aprender' && <Link to={task.rota} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-emerald-800">Fazer atividade<ChevronRight className="h-3 w-3" /></Link>}{!ready && <p className="flex items-center gap-1 text-[10px] text-ink-500"><LockKeyhole className="h-3 w-3" />Conclua a atividade para avançar.</p>}</div>{lesson.question && <fieldset className="mt-3"><legend className="mb-2 text-xs font-semibold">{lesson.question.text}</legend><div className="grid gap-1.5">{lesson.question.options.map((option, optionIndex) => <button type="button" key={option} aria-pressed={answer === optionIndex} onClick={() => setAnswer(optionIndex)} className={`min-h-10 rounded-xl border px-3 py-1.5 text-left text-xs ${answer === optionIndex ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-ink-200'}`}>{option}</button>)}</div>{answer !== null && <p role="status" className="mt-2 text-[11px] text-ink-600">{correct ? lesson.question.explanation : `Tente de novo. ${lesson.question.explanation}`}</p>}</fieldset>}</div><div className="shrink-0 border-t border-ink-100 bg-white p-3">{done ? <button type="button" disabled={!correct} onClick={() => onReview(answer!)} className="btn-secondary w-full text-xs">Registrar revisão</button> : <button type="button" disabled={!ready || !correct} onClick={() => onComplete(answer!)} className="btn-primary w-full text-sm"><Sparkles className="h-4 w-4" />Concluir etapa</button>}</div></motion.section>;
}
