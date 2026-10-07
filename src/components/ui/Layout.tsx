import { ProfileMark } from '@/components/journey/NexoMark';
import { useStore } from '@/store/useStore';
import { PROFILES } from '@/data/profiles';
import { useEffect, type ReactNode } from 'react';
import type { PracticeAction } from '@/types';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { Brand } from '@/components/journey/Journey';

interface LayoutProps { children: ReactNode; title?: string; headerRight?: ReactNode; showHeader?: boolean; showNav?: boolean; compact?: boolean; }
export function Layout({ children, title = 'Visão geral', headerRight, showHeader = true, showNav = true, compact = false }: LayoutProps) {
  const profile = useStore((state) => state.onboarding.profile);
  const config = PROFILES[profile ?? 'explorer'];
  const location = useLocation();
  const recordPractice = useStore((state) => state.recordPractice);
  useEffect(() => {
    const action: PracticeAction | undefined = ({ '/orcamentos': 'viewLimits', '/metas': 'viewGoals' } as Record<string, PracticeAction>)[location.pathname];
    if (action) recordPractice(action);
  }, [location.pathname, recordPractice]);
  const isHome = useLocation().pathname === '/dashboard';
  const isLearn = useLocation().pathname === '/aprender';
  const isListPage = location.pathname === '/gastos' || location.pathname === '/metas' || location.pathname === '/orcamentos';
  const isProfile = location.pathname === '/perfil';
  return <div className={`${isHome ? 'home-shell' : isListPage ? 'list-page-shell' : isProfile ? 'profile-page-shell min-h-screen' : 'min-h-screen'} bg-ink-50`}>
    {showHeader && <header className={`sticky top-0 z-30 border-b border-ink-200/70 bg-white/90 backdrop-blur-xl safe-top ${showNav ? 'md:ml-56' : ''}`}><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-8"><div className="md:hidden"><Link to="/dashboard" aria-label="NYX início" className="inline-flex min-h-11 items-center"><Brand /></Link></div><div className="hidden items-center gap-2 text-xs text-ink-500 md:flex"><span>Meu espaço</span><span className="text-ink-300">/</span><span className="font-medium text-ink-800">{title}</span></div>{headerRight ?? <Link to="/perfil" className="flex min-h-11 items-center gap-2 rounded-full border border-ink-200/80 bg-white py-1.5 pl-2 pr-3 text-xs font-semibold"><span style={{ color: config.cor }}><ProfileMark profile={config.id} className="h-4 w-4" /></span>{config.nome}</Link>}</div></header>}
    <div className={`${showNav ? 'md:ml-56' : ''} ${isListPage ? 'list-page-body' : ''}`}><motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={`mx-auto w-full ${compact ? 'max-w-[1040px] px-4 py-3 sm:px-6 sm:py-4' : 'max-w-[1280px] px-5 py-6 sm:px-8 sm:py-8'} ${isListPage ? 'list-page-main' : isProfile ? 'profile-page-main' : ''} ${showNav ? (isHome ? 'home-main md:pb-10' : isLearn ? 'learn-main md:pb-10' : 'pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-10') : ''}`}>{children}</motion.main></div>
    {showNav && <BottomNav />}
  </div>;
}
