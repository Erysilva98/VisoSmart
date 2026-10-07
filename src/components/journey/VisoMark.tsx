import { useId } from 'react';
import { Compass, Route } from 'lucide-react';
import type { ProfileType } from '@/types';

/** Eye and rising arrow: clarity, planning and progress. */
export function VisoMark({ className = '' }: { className?: string }) {
  const gradient = useId();
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
    <defs><linearGradient id={gradient} x1="20" y1="76" x2="78" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#7C6BFF" /><stop offset="0.48" stopColor="#FFFFFF" /><stop offset="1" stopColor="#31CFFF" /></linearGradient></defs>
    <path d="M16 55 Q37 23 62 44 M16 55 C39 87 66 72 82 24" stroke={`url(#${gradient})`} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 29 84 20 87 39" fill="#31CFFF" stroke="#31CFFF" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="42" cy="53" r="10" fill={`url(#${gradient})`} />
  </svg>;
}

export function ProfileMark({ profile, className = '' }: { profile: ProfileType; className?: string }) {
  if (profile === 'explorer') return <Compass aria-hidden="true" className={className} strokeWidth={1.8} />;
  if (profile === 'equilibrado') return <Route aria-hidden="true" className={className} strokeWidth={1.8} />;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><circle cx="5" cy="19" r="2" /><path d="M7 19h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h3M16 4l2 2 4-4" /></svg>;
}
