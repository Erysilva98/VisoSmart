import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Brand } from '@/components/journey/Journey';

interface LayoutProps { children: ReactNode; title?: string; headerRight?: ReactNode; showHeader?: boolean; showNav?: boolean; compact?: boolean; }
export function XpProgressInfo() {
  return <div className="text-sm leading-relaxed text-ink-500"><p className="mb-2 font-semibold text-ink-900">Cada prática conta</p><p>Você ganha XP ao registrar movimentações, criar metas e concluir aulas e desafios. Os pontos celebram sua participação. As habilidades mostram o que você já colocou em prática.</p></div>;
}
export function Layout({ children, title = 'Visão geral', headerRight, showHeader = true, showNav = true, compact = false }: LayoutProps) {
  return <div className="min-h-screen bg-ink-50">
    {showHeader && <header className={`sticky top-0 z-30 border-b border-ink-200/70 bg-white/90 backdrop-blur-xl safe-top ${showNav ? 'md:ml-56' : ''}`}><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-8"><div className="md:hidden"><Link to="/dashboard" aria-label="Nexo início" className="inline-flex min-h-11 items-center"><Brand /></Link></div><div className="hidden items-center gap-2 text-xs text-ink-500 md:flex"><span>Meu espaço</span><span className="text-ink-300">/</span><span className="font-medium text-ink-800">{title}</span></div>{headerRight ?? <Link to="/perfil" className="flex min-h-11 items-center gap-2 rounded-full border border-ink-200/80 bg-white py-1.5 pl-2 pr-3 text-xs font-semibold"><UserRound className="h-4 w-4 text-primary-700" />Meu perfil</Link>}</div></header>}
    <div className={showNav ? 'md:ml-56' : ''}><motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={`mx-auto w-full ${compact ? 'max-w-[1040px] px-4 py-3 sm:px-6 sm:py-4' : 'max-w-[1280px] px-5 py-6 sm:px-8 sm:py-8'} ${showNav ? 'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10' : ''}`}>{children}</motion.main></div>
    {showNav && <BottomNav />}
  </div>;
}
