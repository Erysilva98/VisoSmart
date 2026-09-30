import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, Compass, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Brand, GrowthMark } from '@/components/journey/Journey';

export function Landing() {
  return <div className="min-h-screen bg-ink-50">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10"><Brand /><span className="flex items-center gap-1.5 text-xs font-medium text-ink-500"><ShieldCheck className="h-4 w-4" />Sem cadastro</span></header>
    <main className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-12 pt-8 sm:px-10 lg:min-h-[75vh] lg:grid-cols-2 lg:gap-16 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-[11px] font-semibold text-primary-700"><Sparkles className="h-3.5 w-3.5" />Pequenos passos, grandes conquistas.</span>
        <h1 className="mt-6 text-[42px] font-bold leading-[1.08] tracking-[-0.065em] text-ink-900 sm:text-6xl">Seu dinheiro.<br />Suas escolhas.<br /><span className="text-primary-600">Seu próximo passo.</span></h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ink-500">Aprenda a cuidar do seu dinheiro enquanto vive a vida. Um registro, uma descoberta e uma conquista de cada vez.</p>
        <Link to="/onboarding" className="btn-primary mt-8 w-full text-sm sm:w-auto sm:px-7">Começar minha jornada <ArrowRight className="h-4 w-4" /></Link>
        <p className="mt-3 text-xs text-ink-500">No seu ritmo. Sem julgamentos. Sem complicação.</p>
        <div className="mt-9 flex flex-wrap gap-4 border-t border-ink-200 pt-5 text-xs font-medium text-ink-600"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary-600" />Prática no dia a dia</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary-600" />Dados no seu dispositivo</span></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative rounded-[32px] border border-primary-100 bg-primary-50 px-5 pb-7 pt-5 sm:px-8">
        <div className="flex items-center justify-between"><span className="eyebrow text-primary-700">O começo de algo bom</span><span className="h-2 w-2 rounded-full bg-primary-500" /></div><div className="flex justify-center"><GrowthMark /></div>
        <div className="relative -mt-1 rounded-2xl border border-white bg-white/95 p-5 shadow-soft"><p className="text-xs font-semibold text-primary-700">Você não precisa saber tudo para começar.</p><h2 className="mt-2 text-xl font-bold">Só precisa dar o primeiro passo.</h2><div className="mt-5 space-y-4">{[{ icon: Compass, title: 'Descubra seus hábitos', text: 'Entenda para onde seu dinheiro vai.', color: 'bg-primary-50 text-primary-600' }, { icon: BookOpen, title: 'Aprenda fazendo', text: 'Aulas curtas. Missões na vida real.', color: 'bg-accent-50 text-accent-600' }, { icon: Target, title: 'Conquiste o que importa', text: 'Transforme seus sonhos em metas.', color: 'bg-amber-50 text-amber-600' }].map(({ icon: Icon, title, text, color }) => <div key={title} className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] text-ink-500">{text}</p></div></div>)}</div></div>
      </motion.div>
    </main>
    <footer className="mx-auto max-w-6xl px-6 pb-7 text-center text-[11px] text-ink-500">Nexo · Aprenda. Organize. Evolua.</footer>
  </div>;
}
