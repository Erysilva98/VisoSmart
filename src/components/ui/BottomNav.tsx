import { NavLink, Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Home, ReceiptText, ShieldCheck, Target, UserRound } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PROFILES } from '@/data/profiles';
import { Brand } from '@/components/journey/Journey';

const menu = [
  { label: 'Início', path: '/dashboard', icon: Home },
  { label: 'Extrato', path: '/gastos', icon: ReceiptText },
  { label: 'Aprender', path: '/aprender', icon: BookOpen },
  { label: 'Metas', path: '/metas', icon: Target },
  { label: 'Perfil', path: '/perfil', icon: UserRound },
];
export function BottomNav() {
  const profile = useStore((s) => s.onboarding.profile);
  if (!profile) return null;
  const config = PROFILES[profile];
  return <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-200/80 bg-white/95 backdrop-blur-xl safe-bottom md:top-0 md:right-auto md:w-56 md:border-r md:border-t-0 md:bg-white">
    <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 md:h-full md:max-w-none md:flex-col md:items-stretch md:justify-start md:px-4 md:py-7">
      <Link to="/dashboard" aria-label="Nexo início" className="mb-4 hidden px-3 md:block"><Brand /></Link>
      <p className="mb-7 hidden px-3 text-xs leading-relaxed text-ink-500 md:block">Seu futuro começa no dia a dia</p>
      {menu.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 transition-colors md:mb-1 md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 ${isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}><Icon className="h-5 w-5" strokeWidth={1.8} /><span className="text-[11px] font-semibold md:text-sm">{label}</span></NavLink>)}
      <div className="mt-auto hidden pt-12 md:block"><div className="rounded-2xl border border-ink-200/70 p-4"><span className="mb-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: config.cor }} /><p className="text-sm font-semibold">Seu ritmo. Sua jornada.</p><p className="mt-2 text-xs leading-relaxed text-ink-500">Um pouco de prática hoje. Mais confiança amanhã.</p><Link to="/aprender" className="text-link mt-2">Continuar aprendendo <ChevronRight className="h-3 w-3" /></Link></div><p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-ink-500"><ShieldCheck className="h-3.5 w-3.5" />Seus dados ficam com você</p></div>
    </div>
  </nav>;
}
