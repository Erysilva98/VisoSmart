import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Brand } from '@/components/journey/Journey';
import { ProfileMark } from '@/components/journey/NexoMark';
import { CategoryPreferences } from '@/components/ui/CategoryPreferences';
import { useStore } from '@/store/useStore';
import { parseAmount } from '@/lib/money';
import { FOCUS_LABELS, initialBalanceValue, profileForExperience } from '@/lib/personalization';
import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '@/data/categories';
import { PROFILES } from '@/data/profiles';
import type { CategoryId, JourneyPreferences } from '@/types';

const TITLES = ['Como você cuida do seu dinheiro hoje?', 'De onde vem seu dinheiro?', 'Em que você costuma gastar?', 'O que você mais quer melhorar agora?', 'Quanto você tem para começar?'];
export function Onboarding() {
  const state = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<0 | 1 | 2 | null>(state.preferences?.experience ?? null);
  const [pattern, setPattern] = useState<'regular' | 'irregular'>(state.incomePattern ?? 'irregular');
  const [income, setIncome] = useState<CategoryId[]>(state.preferences?.incomeCategories ?? []);
  const [expense, setExpense] = useState<CategoryId[]>(state.preferences?.expenseCategories ?? []);
  const [focus, setFocus] = useState<JourneyPreferences['focus'] | null>(state.preferences?.focus ?? null);
  const [balance, setBalance] = useState(state.onboarding.completed ? String(initialBalanceValue(state.transactions, state.openingBalance)) : '');
  const [result, setResult] = useState(false);
  const submitted = useRef(false);
  const amount = balance.trim() ? parseAmount(balance) : 0;
  const valid = [experience !== null, income.length > 0, expense.length > 0, focus !== null, Number.isFinite(amount) && amount >= 0][step];
  const profile = profileForExperience(experience ?? 0);
  const config = PROFILES[profile];
  function finish() {
    if (submitted.current || experience === null || !focus || !income.length || !expense.length || !Number.isFinite(amount) || amount < 0) return;
    submitted.current = true;
    state.setMoneyContext(amount, pattern);
    state.completeOnboarding([2, 5, 8][experience], { experience, focus, incomeCategories: income, expenseCategories: expense });
    window.scrollTo(0, 0);
    navigate('/#/dashboard', { replace: true });
  }
  return <div className={`min-h-screen bg-ink-50 px-4 py-5 ${!result && (step === 1 || step === 2) ? `onboarding-category-step ${step === 1 ? 'onboarding-income-step' : 'onboarding-expense-step'}` : ''}`}><header className="mx-auto flex max-w-xl items-center justify-between py-3"><Link to={state.onboarding.completed ? '/dashboard' : '/'} aria-label="Nexo início"><Brand /></Link><span className="text-xs text-ink-500">{result ? 'Seu ponto de partida' : `${step + 1} de 5`}</span></header><main className={`mx-auto mt-4 max-w-xl rounded-2xl border border-ink-200 bg-white p-5 sm:p-7 ${!result && (step === 1 || step === 2) ? 'onboarding-category-card' : ''}`}>{result ? <><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ color: config.cor, backgroundColor: config.corLight }}><ProfileMark profile={profile} className="h-7 w-7" /></span><h1 className="text-2xl font-semibold">Seu perfil: {config.nome}</h1><p className="mt-3 text-sm leading-relaxed text-ink-600">{config.objetivo}. Esse é um ponto de partida, não uma nota sobre você.</p><ul className="my-5 space-y-3 text-xs text-ink-600">{[`Suas ${income.length} categorias de entrada e ${expense.length} de despesa ficam disponíveis no registro rápido.`, `Seu foco: ${focus ? FOCUS_LABELS[focus].toLowerCase() : ''}.`, 'Quatro missões por mês e uma trilha com etapas curtas.', 'O valor informado aparece no Extrato como sua primeira entrada de saldo.'].map((text) => <li key={text} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary-700" />{text}</li>)}</ul><button type="button" onClick={finish} className="btn-primary w-full">Começar minha jornada</button><button onClick={() => setResult(false)} className="mt-2 min-h-11 w-full text-xs text-primary-700">Revisar respostas</button></> : <><div role="progressbar" aria-label="Questionário" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1} className="mb-5 h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-primary-400" style={{ width: `${(step + 1) * 20}%` }} /></div><h1 className="mb-4 text-xl font-semibold">{TITLES[step]}</h1>
    {step === 0 && <><p className="mb-4 text-xs leading-relaxed text-ink-500">Sua experiência define o perfil e a ordem das práticas, sem bloquear as funções do app.</p>{[{ id: 0 as const, text: 'Estou começando e quero entender meus hábitos' }, { id: 1 as const, text: 'Já acompanho alguns gastos, mas quero me organizar' }, { id: 2 as const, text: 'Já planejo e quero comparar escolhas e melhorar' }].map((item) => <button key={item.id} type="button" aria-pressed={experience === item.id} onClick={() => setExperience(item.id)} className={`mb-2 min-h-14 w-full rounded-xl border p-3 text-left text-sm ${experience === item.id ? 'border-primary-400 bg-primary-50' : 'border-ink-200'}`}>{item.text}</button>)}</>}
    {step === 1 && <><CategoryPreferences options={RECEITA_CATEGORIES} selected={income} onChange={setIncome} compact /><fieldset className="mt-2"><legend className="mb-1 text-xs font-semibold">Com que frequência?</legend><div className="grid grid-cols-2 gap-2">{[{ id: 'regular' as const, label: 'Regularmente' }, { id: 'irregular' as const, label: 'Varia ou é de vez em quando' }].map((item) => <button type="button" key={item.id} aria-pressed={pattern === item.id} onClick={() => setPattern(item.id)} className={`min-h-11 rounded-xl border p-1.5 text-xs ${pattern === item.id ? 'border-primary-400 bg-primary-50' : 'border-ink-200'}`}>{item.label}</button>)}</div></fieldset></>}
    {step === 2 && <><p className="mb-3 text-xs text-ink-500">Escolha as categorias que você realmente usa ou paga.</p><CategoryPreferences options={DESPESA_CATEGORIES} selected={expense} onChange={setExpense} compact /></>}
    {step === 3 && <><p className="mb-3 text-xs text-ink-500">Seu objetivo orienta as missões e a sugestão de próximo passo.</p>{(Object.entries(FOCUS_LABELS) as [JourneyPreferences['focus'], string][]).map(([id, label]) => <button key={id} type="button" aria-pressed={focus === id} onClick={() => setFocus(id)} className={`mb-2 min-h-14 w-full rounded-xl border p-3 text-left text-sm ${focus === id ? 'border-primary-400 bg-primary-50' : 'border-ink-200'}`}>{label}</button>)}</>}
    {step === 4 && <><label className="block text-xs font-semibold">Dinheiro disponível (R$)<input autoFocus value={balance} onChange={(event) => setBalance(event.target.value)} inputMode="decimal" placeholder="0,00" className="input mt-2 text-2xl" /></label><p className="mt-3 text-xs leading-relaxed text-ink-500">Vai aparecer no Extrato como “Saldo inicial”. Inclua o dinheiro que você já tem, inclusive o reservado para metas; não inclua bens, investimentos nem valores a receber. Se não souber, pode começar com zero.</p>{state.onboarding.completed && <p className="mt-3 text-xs text-primary-700">Estamos revisando seu saldo de partida. Não repita entradas que já estão no Extrato.</p>}</>}
    <div className="mt-6 flex gap-2">{step > 0 && <button type="button" aria-label="Pergunta anterior" onClick={() => setStep(step - 1)} className="btn-secondary"><ArrowLeft className="h-4 w-4" /></button>}<button type="button" disabled={!valid} onClick={() => { if (step === 4) setResult(true); else setStep(step + 1); window.scrollTo(0, 0); }} className="btn-primary flex-1">{step === 4 ? 'Descobrir meu perfil' : 'Continuar'}<ArrowRight className="h-4 w-4" /></button></div></>}</main></div>;
}
