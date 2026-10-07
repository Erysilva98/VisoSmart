import { useRef, useState, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Compass, ReceiptText, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Brand, GrowthMark } from '@/components/journey/Journey';

const pages = [
  {
    badge: 'Pequenos passos, grandes conquistas.',
    title: 'Seu dinheiro. Suas escolhas.',
    highlight: 'Seu próximo passo.',
    description: 'Aprenda a cuidar do seu dinheiro enquanto vive a vida. Um registro, uma descoberta e uma conquista de cada vez.',
    note: 'No seu ritmo. Sem julgamentos. Sem complicação.',
  },
  {
    badge: 'Entenda o que acontece',
    title: 'Cada registro conta.',
    highlight: 'Seu dinheiro faz sentido.',
    description: 'Anote entradas e gastos em segundos. Veja no calendário quando aconteceram e descubra quais escolhas pesam no mês.',
    note: 'Sem planilhas. Sem termos difíceis.',
  },
  {
    badge: 'Aprenda fazendo',
    title: 'Um passo por vez.',
    highlight: 'Mais perto dos seus sonhos.',
    description: 'Faça atividades curtas, acompanhe suas missões e separe dinheiro para o que importa para você.',
    note: 'Pequenas escolhas também são conquistas.',
  },
] as const;

const featurePages = [
  [
    { icon: Compass, title: 'Descubra seus hábitos', text: 'Entenda para onde seu dinheiro vai.', color: 'bg-primary-50 text-primary-600' },
    { icon: BookOpen, title: 'Aprenda fazendo', text: 'Aulas curtas. Missões na vida real.', color: 'bg-accent-50 text-accent-600' },
    { icon: Target, title: 'Conquiste o que importa', text: 'Transforme seus sonhos em metas.', color: 'bg-amber-50 text-amber-600' },
  ],
  [
    { icon: ReceiptText, title: 'Registre rápido', text: 'Escolha a categoria, informe o valor e salve.', color: 'bg-primary-50 text-primary-600' },
    { icon: Compass, title: 'Veja seu mês', text: 'Encontre seus registros no calendário.', color: 'bg-accent-50 text-accent-600' },
    { icon: Check, title: 'Saiba o que mudou', text: 'Entradas e despesas aparecem no seu saldo.', color: 'bg-emerald-50 text-emerald-700' },
  ],
  [
    { icon: BookOpen, title: 'Aprenda no app', text: 'Uma etapa curta de cada vez.', color: 'bg-accent-50 text-accent-600' },
    { icon: Target, title: 'Escolha uma meta', text: 'Veja cada valor guardado virar progresso.', color: 'bg-amber-50 text-amber-700' },
    { icon: Sparkles, title: 'Continue sua jornada', text: 'Missões mostram sua evolução.', color: 'bg-primary-50 text-primary-600' },
  ],
];

function FeatureCard({ page }: { page: number }) {
  return <motion.div key={`feature-${page}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="relative rounded-[32px] border border-primary-100 bg-primary-50 px-5 pb-7 pt-5 sm:px-8">
    <div className="flex items-center justify-between"><span className="eyebrow text-primary-700">{page === 0 ? 'O começo de algo bom' : page === 1 ? 'Seu mês com clareza' : 'Seu ritmo, sua jornada'}</span><span className="h-2 w-2 rounded-full bg-primary-500" /></div>
    {page === 0 && <div className="flex justify-center"><GrowthMark /></div>}
    <div className={`relative rounded-2xl border border-white bg-white/95 p-5 shadow-soft ${page === 0 ? '-mt-1' : 'mt-5'}`}><p className="text-xs font-semibold text-primary-700">{page === 0 ? 'Você não precisa saber tudo para começar.' : page === 1 ? 'O próximo passo fica mais fácil quando você entende o mês.' : 'Aprender e guardar podem acontecer aos poucos.'}</p><h2 className="mt-2 text-xl font-bold">{page === 0 ? 'Só precisa dar o primeiro passo.' : page === 1 ? 'Registre. Entenda. Escolha.' : 'Cada pequena conquista importa.'}</h2><div className="mt-5 space-y-4">{featurePages[page].map(({ icon: Icon, title, text, color }) => <div key={title} className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] text-ink-500">{text}</p></div></div>)}</div></div>
  </motion.div>;
}

function MobileLanding() {
  const [page, setPage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const current = page > 1 ? pages[page - 1] : pages[0];
  const features = page === 1 ? featurePages[0] : page === 2 ? featurePages[1] : featurePages[2];
  const onTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    setPage((currentPage) => Math.max(0, Math.min(3, currentPage + (deltaX < 0 ? 1 : -1))));
  };
  return <div className="landing-mobile flex h-dvh flex-col overflow-hidden bg-ink-50 lg:hidden">
    <header className="flex shrink-0 items-center justify-between px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]"><Brand /><span className="flex items-center gap-1.5 text-xs font-medium text-ink-600"><ShieldCheck className="h-4 w-4" />Sem cadastro</span></header>
    <main className="min-h-0 flex-1 touch-pan-y px-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={() => { touchStart.current = null; }}>
      {page === 0 ? <div className="flex h-full flex-col justify-center gap-6 py-4"><div><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-[11px] font-semibold text-primary-700"><Sparkles className="h-3.5 w-3.5" />Pequenos passos, grandes conquistas.</span><h1 className="landing-mobile-title mt-7 font-bold leading-[1.08] tracking-[-0.065em] text-ink-900">Seu dinheiro.<br />Suas escolhas.<br /><span className="text-primary-600">Seu próximo passo.</span></h1><p className="landing-mobile-description mt-6 leading-relaxed text-ink-600">Aprenda a cuidar do seu dinheiro enquanto vive a vida. Um registro, uma descoberta e uma conquista de cada vez.</p></div><div><Link to="/onboarding" className="btn-primary w-full text-sm">Começar minha jornada <ArrowRight className="h-4 w-4" /></Link><p className="mt-3 text-xs text-ink-600">No seu ritmo. Sem julgamentos. Sem complicação.</p><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink-200 pt-4 text-[11px] font-medium text-ink-700"><span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary-600" />Prática no dia a dia</span><span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary-600" />Dados no seu dispositivo</span></div></div></div> : <div className="flex h-full flex-col justify-center gap-6 py-4"><div><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-[11px] font-semibold text-primary-700"><Sparkles className="h-3.5 w-3.5" />{page === 1 ? 'O começo de algo bom' : current.badge}</span><h1 className="landing-mobile-title mt-6 font-bold leading-[1.08] tracking-[-0.065em] text-ink-900">{page === 1 ? <>Só precisa dar<br /><span className="text-primary-600">o primeiro passo.</span></> : <>{current.title}<br /><span className="text-primary-600">{current.highlight}</span></>}</h1><p className="landing-mobile-description mt-4 leading-relaxed text-ink-600">{page === 1 ? 'Você não precisa saber tudo para começar. O Viso Smart ajuda a descobrir seus hábitos aos poucos.' : current.description}</p></div><div className="landing-mobile-features rounded-2xl border border-primary-100 bg-white p-3 shadow-card">{page === 1 && <div className="flex justify-center"><GrowthMark small /></div>}{features.map(({ icon: Icon, title, text, color }) => <div key={title} className="flex items-center gap-2.5 py-1.5"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span><div><p className="text-xs font-semibold">{title}</p><p className="text-[11px] text-ink-600">{text}</p></div></div>)}</div><Link to="/onboarding" className="btn-primary w-full text-sm">Começar minha jornada <ArrowRight className="h-4 w-4" /></Link></div>}
    </main>
    <nav aria-label="Páginas de apresentação" className="flex shrink-0 items-center gap-2 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"><button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Página anterior" className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 text-primary-700 disabled:opacity-40"><ChevronLeft className="h-5 w-5" /></button><div className="flex flex-1 items-center justify-center" role="group" aria-label={`Página ${page + 1} de 4`}>{[0, 1, 2, 3].map((index) => <button key={index} type="button" onClick={() => setPage(index)} aria-label={`Ir para página ${index + 1}`} aria-current={index === page ? 'page' : undefined} className="flex h-11 w-9 items-center justify-center"><span className={`h-2 rounded-full transition-all ${index === page ? 'w-5 bg-primary-600' : 'w-2 bg-ink-300'}`} /></button>)}</div><button type="button" onClick={() => setPage(Math.min(3, page + 1))} disabled={page === 3} aria-label="Próxima página" className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 text-primary-700 disabled:opacity-40"><ChevronRight className="h-5 w-5" /></button></nav>
  </div>;
}

export function Landing() {
  const [page, setPage] = useState(0);
  const current = pages[page];
  const goTo = (next: number) => { setPage(Math.max(0, Math.min(pages.length - 1, next))); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <><MobileLanding /><div className="landing-desktop hidden h-dvh flex-col overflow-hidden bg-ink-50 lg:flex">
    <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-4 sm:px-10"><Brand /><span className="flex items-center gap-1.5 text-xs font-medium text-ink-500"><ShieldCheck className="h-4 w-4" />Sem cadastro</span></header>
    <main className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 items-center gap-8 px-6 py-6 sm:px-10 lg:grid-cols-2 lg:gap-10">
      <motion.div key={page} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-[11px] font-semibold text-primary-700"><Sparkles className="h-3.5 w-3.5" />{current.badge}</span>
        <h1 className="mt-6 text-[42px] font-bold leading-[1.08] tracking-[-0.065em] text-ink-900 sm:text-6xl">{page === 0 ? <>Seu dinheiro.<br />Suas escolhas.<br /></> : <>{current.title}<br /></>}<span className="text-primary-600">{current.highlight}</span></h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ink-500">{current.description}</p>
        <Link to="/onboarding" className="btn-primary mt-8 w-full text-sm sm:w-auto sm:px-7">Começar minha jornada <ArrowRight className="h-4 w-4" /></Link>
        <p className="mt-3 text-xs text-ink-500">{current.note}</p>
        {page === 0 && <div className="mt-9 flex flex-wrap gap-4 border-t border-ink-200 pt-5 text-xs font-medium text-ink-600"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary-600" />Prática no dia a dia</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary-600" />Dados no seu dispositivo</span></div>}
        <nav aria-label="Páginas de apresentação" className="mt-6 flex items-center gap-2">
          <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Página anterior" className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 text-primary-700 disabled:opacity-40"><ChevronLeft className="h-5 w-5" /></button>
          <div className="flex flex-1 items-center justify-center" role="group" aria-label={`Página ${page + 1} de ${pages.length}`}>
            {pages.map((item, index) => <button key={item.badge} type="button" onClick={() => goTo(index)} aria-label={`Ir para página ${index + 1}: ${item.badge}`} aria-current={index === page ? 'page' : undefined} className="flex h-11 w-11 items-center justify-center"><span className={`h-2 rounded-full transition-all ${index === page ? 'w-5 bg-primary-600' : 'w-2 bg-ink-300'}`} /></button>)}
          </div>
          <button type="button" onClick={() => goTo(page + 1)} disabled={page === pages.length - 1} aria-label="Próxima página" className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 text-primary-700 disabled:opacity-40"><ChevronRight className="h-5 w-5" /></button>
        </nav>
      </motion.div>
      <FeatureCard page={page} />
    </main>
    <footer className="mx-auto w-full max-w-6xl shrink-0 px-6 pb-3 text-center text-[11px] text-ink-500">Viso Smart · Seu dinheiro, do seu jeito.</footer>
  </div></>;
}
