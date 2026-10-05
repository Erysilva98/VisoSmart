import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, ChevronDown, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { useStore } from '@/store/useStore';
import { getLessonsForProfile, type Lesson } from '@/data/lessons';
import { PROFILES } from '@/data/profiles';
import { canCompleteLesson } from '@/lib/progress';
import { lessonPracticeProgress } from '@/lib/practice';

export function Learn() {
  const state = useStore();
  const profile = state.onboarding.profile ?? 'explorer';
  const lessons = getLessonsForProfile(profile);
  const completed = new Set(state.lessonProgress.filter((item) => item.concluido).map((item) => item.lessonId));
  const active = lessons.find((item) => !completed.has(item.id));
  const [review, setReview] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState('');
  const startLesson = state.startLesson;
  const activeId = active?.id;
  useEffect(() => { if (activeId) startLesson(activeId); }, [activeId, startLesson]);
  const lesson = lessons.find((item) => item.id === review) ?? active;
  const done = lessons.filter((item) => completed.has(item.id)).length;
  const legacy = state.lessonProgress.filter((item) => item.concluido && !item.lessonId.startsWith('trail-v2-')).length;

  return <Layout title="Aprender" compact><div className="learn-screen">
    {lesson ? <LessonCard key={lesson.id} lesson={lesson} profileName={PROFILES[profile].nome} completedCount={done} message={message} legacy={legacy} onShowHistory={() => setShowHistory(true)} done={completed.has(lesson.id)} onFinished={(text) => { setMessage(text); setReview(null); }} /> : <section className="rounded-2xl border border-violet-100 bg-white p-6 text-center"><TrailHeading profileName={PROFILES[profile].nome} completedCount={done} onShowHistory={() => setShowHistory(true)} /><Trophy className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 font-semibold">30 etapas concluídas!</h2><p className="mt-2 text-sm text-ink-600">Continue aplicando o que aprendeu nas missões mensais.</p><Link to="/perfil" className="btn-primary mt-4">Ver minhas missões</Link></section>}
  </div>
  {showHistory && <Dialog title="Sua trilha · 6 módulos" onClose={() => setShowHistory(false)}><div className="max-h-[65dvh] space-y-4 overflow-y-auto">{Array.from(new Set(lessons.map((item) => item.modulo))).map((module) => <section key={module}><h2 className="mb-1 text-sm font-semibold">{module}</h2>{lessons.filter((item) => item.modulo === module).map((item) => <button key={item.id} type="button" disabled={!completed.has(item.id) && item.id !== active?.id} onClick={() => { setReview(completed.has(item.id) ? item.id : null); setShowHistory(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-xs hover:bg-ink-50 disabled:text-ink-400"><span>{completed.has(item.id) ? <Check className="h-4 w-4 text-income" /> : item.order}</span><span>{item.titulo}{item.id === active?.id && ' · atual'}</span></button>)}</section>)}</div></Dialog>}
  </Layout>;
}

function TrailHeading({ profileName, completedCount, onShowHistory }: { profileName: string; completedCount: number; onShowHistory: () => void }) {
  return <div className="flex items-center justify-between gap-2"><div className="min-w-0"><h1 className="text-lg font-semibold text-ink-900">Trilha de Aprendizado</h1><p className="mt-1 text-xs text-violet-700">{profileName} · {completedCount}/30 etapas</p></div><button type="button" onClick={onShowHistory} aria-label="Ver módulos e etapas" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100"><ChevronDown className="h-4 w-4" /></button></div>;
}

function LessonCard({ lesson, done, onFinished, profileName, completedCount, onShowHistory, message, legacy }: { lesson: Lesson; done: boolean; onFinished: (text: string) => void; profileName: string; completedCount: number; onShowHistory: () => void; message: string; legacy: number }) {
  const state = useStore();
  const [reviewAnswer, setReviewAnswer] = useState<number | null>(null);
  const answer = done ? reviewAnswer : state.lessonAnswers?.[lesson.id] ?? null;
  const correct = answer === lesson.question?.correct;
  const ready = canCompleteLesson(lesson.id, state);
  const progress = lessonPracticeProgress(lesson, state);
  return <section className="learn-card flex max-h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
    <header className="shrink-0 border-b border-violet-100 bg-white px-4 py-3"><TrailHeading profileName={profileName} completedCount={completedCount} onShowHistory={onShowHistory} /><p className="mt-3 flex items-center gap-1 text-xs font-semibold text-violet-700"><BookOpen className="h-4 w-4" />{done ? 'Revisão' : `Etapa ${lesson.order} de 30`} · {lesson.duracao} · +{lesson.xp} XP</p><p className="mt-1 text-[11px] text-ink-600">Módulo {Math.ceil((lesson.order ?? 1) / 5)} · {lesson.modulo}</p><h2 className="mt-1 text-base font-bold">{lesson.titulo}</h2></header>
    <div className="learn-card-body min-h-0 overflow-y-auto p-4">{message && <p role="status" className="mb-3 text-xs text-violet-700">{message}</p>}{legacy > 0 && completedCount === 0 && <p className="mb-3 text-xs text-ink-600">Nova trilha com 30 etapas para seu perfil. Seu XP e as {legacy} etapas anteriores foram preservados.</p>}<p className="text-sm leading-relaxed text-ink-700">{lesson.conteudo}</p>
      {lesson.question && <fieldset className="mt-4"><legend className="mb-2 text-sm font-semibold">{lesson.question.text}</legend><div className="grid gap-2">{lesson.question.options.map((option, index) => <button type="button" key={option} aria-pressed={answer === index} onClick={() => { if (done) setReviewAnswer(index); else state.answerLesson(lesson.id, index); }} className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${answer === index ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-ink-200'}`}>{option}</button>)}</div>{answer !== null && <p role="status" className={`mt-2 text-xs leading-relaxed ${correct ? 'text-income' : 'text-ink-700'}`}>{correct ? 'Isso! ' : 'Tente novamente. '}{lesson.question.explanation}</p>}</fieldset>}
      {correct && !done && <section className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 p-3" aria-label="Atividade prática"><h3 className="text-sm font-semibold text-violet-700">Agora faça no APP</h3><p className="mt-1 text-xs leading-relaxed text-ink-700">{lesson.desafioPratico?.descricao}</p><ul className="mt-2 space-y-1">{progress.map((item, index) => <li key={index}><Link to={item.route} className="flex min-h-11 items-center gap-2 rounded-lg bg-white p-2 text-xs text-primary-700">{item.current >= item.target ? <Check className="h-4 w-4 shrink-0 text-income" /> : <span className="shrink-0 text-ink-500">{item.current}/{item.target}</span>}<span className="flex-1">{item.label}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul><p role="status" className="mt-2 text-xs text-ink-600">{ready ? 'Atividade verificada. Você já pode concluir.' : 'A prática é verificada automaticamente. Depois, volte à trilha.'}</p></section>}
    </div>
    <div className="shrink-0 border-t border-ink-100 bg-white p-3"><button type="button" disabled={!correct || !done && !ready} onClick={() => {
      if (done) { state.reviewLesson(lesson.id, answer!); onFinished('Revisão registrada, sem repetir o XP da etapa.'); return; }
      state.completeLesson(lesson.id, answer!);
      if (useStore.getState().lessonProgress.some((item) => item.lessonId === lesson.id && item.concluido)) onFinished(`Prática concluída! +${lesson.xp} XP. ${lesson.order === 30 ? 'Sua trilha está completa.' : 'Próxima etapa liberada.'}`);
    }} className="btn-primary w-full text-sm"><Sparkles className="h-4 w-4" />{done ? 'Registrar revisão' : 'Concluir etapa'}</button>{!done && !correct && <p className="mt-1 text-center text-xs text-ink-500">Responda à pergunta para abrir a prática.</p>}</div>
  </section>;
}
