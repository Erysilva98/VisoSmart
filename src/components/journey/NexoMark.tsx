import { useId } from 'react';
import { Compass, Route } from 'lucide-react';
import type { ProfileType } from '@/types';

/** Nexo Trail: a continuous N path with an independent arrival point. */
export function NexoMark({ className = '' }: { className?: string }) {
  const gradient = useId();
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
    <defs><linearGradient id={gradient} x1="20" y1="80" x2="78" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#7A63FE" /><stop offset="1" stopColor="#56B8FF" /></linearGradient></defs>
    <path d="M22 77 32 31 Q33 26 37 31 L65 70 Q69 76 71 68 L77 42" stroke={`url(#${gradient})`} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="81" cy="22" r="9" fill="#56B8FF" />
  </svg>;
}

export function ProfileMark({ profile, className = '' }: { profile: ProfileType; className?: string }) {
  if (profile === 'explorer') return <Compass aria-hidden="true" className={className} strokeWidth={1.8} />;
  if (profile === 'equilibrado') return <Route aria-hidden="true" className={className} strokeWidth={1.8} />;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><circle cx="5" cy="19" r="2" /><path d="M7 19h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h3M16 4l2 2 4-4" /></svg>;
}
