import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '@/components/journey/Journey';
import { useStore } from '@/store/useStore';
import { parseAmount } from '@/lib/money';

export function Onboarding() {
  const state = useStore();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<'regular' | 'irregular'>('irregular');
  const [balance, setBalance] = useState('');
  const value = balance.trim() ? parseAmount(balance) : 0;
  return <div className="min-h-screen bg-ink-50 p-5"><header className="mx-auto max-w-md py-4"><Link to="/" aria-label="Nexo início"><Brand /></Link></header><main className="mx-auto mt-6 max-w-md rounded-2xl border border-ink-200 bg-white p-5"><h1 className="text-2xl font-semibold">Vamos começar pelo seu dia a dia</h1><p className="mt-3 text-sm leading-relaxed text-ink-500">Não é uma prova. Você pode ajustar essas informações depois.</p><form className="mt-5 space-y-5" onSubmit={(event) => { event.preventDefault(); if (!Number.isFinite(value) || value < 0) return; state.setMoneyContext(value, pattern); state.completeOnboarding(0); navigate('/dashboard', { replace: true }); }}><fieldset><legend className="mb-2 text-sm font-semibold">Como você recebe dinheiro?</legend>{[{ id: 'regular' as const, text: 'Todo mês ou toda semana' }, { id: 'irregular' as const, text: 'De vez em quando ou com valor variável' }].map((item) => <button key={item.id} type="button" aria-pressed={pattern === item.id} onClick={() => setPattern(item.id)} className={`mb-2 min-h-12 w-full rounded-xl border p-3 text-left text-sm ${pattern === item.id ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-ink-200'}`}>{item.text}</button>)}</fieldset><label className="block text-sm font-semibold">Quanto você já tem? <span className="font-normal text-ink-500">(opcional)</span><input value={balance} onChange={(event) => setBalance(event.target.value)} inputMode="decimal" placeholder="0,00" className="input mt-2" /></label><p className="text-xs leading-relaxed text-ink-500">Esse é seu saldo inicial, não uma nova receita. Não inclua bens ou investimentos. Se não souber, deixe em branco.</p><button disabled={!Number.isFinite(value) || value < 0} className="btn-primary w-full">Começar a registrar</button></form></main></div>;
}
