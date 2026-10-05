import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleHelp, Info, SlidersHorizontal, Tags, Trash2 } from 'lucide-react';
import { ProfileInfoDialog } from '@/components/ui/ProfileInfoDialog';
import { CategoryManager } from '@/components/ui/CategoryManager';
import { ProfileJourney } from '@/components/journey/ProfileJourney';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { useStore } from '@/store/useStore';
import { APP_BUILD, APP_VERSION } from '@/lib/appVersion';
import { formatCurrency } from '@/lib/format';

export function Profile() {
  const state = useStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<'about' | 'help' | null>(null);
  const archived = state.investments.filter((item) => !item.metaId);
  return <Layout title="Meu perfil" compact>
    <h1 className="sr-only">Meu perfil</h1>
    <ProfileJourney />
    {message && <p role="alert" className="mb-3 text-xs text-expense">{message}</p>}
    <div className="mb-3 grid grid-cols-2 gap-2" aria-label="Preferências do perfil"><button type="button" onClick={() => { state.recordLearningAction('profile'); setPreferencesOpen(true); }} className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-2 text-center text-xs font-semibold text-primary-700 hover:bg-primary-50"><Tags className="h-4 w-4 shrink-0" /><span>Minhas categorias</span></button><Link to="/orcamentos" className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-2 text-center text-xs font-semibold text-primary-700 hover:bg-primary-50"><SlidersHorizontal className="h-4 w-4 shrink-0" /><span>Meus limites</span></Link></div>
    {(archived.length > 0 || state.plannedExpenses.length > 0 || state.creditCards.length > 0) && <details className="mt-2 rounded-2xl border border-ink-200 bg-white px-4 py-2"><summary className="min-h-10 cursor-pointer pt-3 text-xs font-semibold">Dados antigos</summary><p className="mt-2 text-xs text-ink-500">Dados de funções antigas foram preservados neste dispositivo.</p>{archived.map((item) => <p key={item.id} className="mt-2 flex justify-between gap-2 text-xs"><span>{item.nome}</span><span>{formatCurrency(item.valor)}</span></p>)}<p className="mt-2 text-xs text-ink-500">{state.plannedExpenses.length} compromissos · {state.creditCards.length} cartões</p></details>}
    <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setInfo('about')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white text-xs font-semibold text-primary-700 hover:bg-primary-50"><Info className="h-4 w-4" />Sobre</button><button type="button" onClick={() => setInfo('help')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white text-xs font-semibold text-primary-700 hover:bg-primary-50"><CircleHelp className="h-4 w-4" />Ajudar</button></div>
    <button type="button" onClick={() => setReset(true)} className="mx-auto mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-xs font-semibold text-expense"><Trash2 className="h-4 w-4" />Apagar meus dados</button>
    <footer className="mt-4 pb-2 text-center text-[10px] leading-relaxed text-ink-500"><p>Desenvolvido por Erimilson Silva</p><p>NYX · Versão {APP_VERSION} · Build {APP_BUILD}</p></footer>
    {preferencesOpen && <CategoryManager onClose={() => setPreferencesOpen(false)} />}
    {info && <ProfileInfoDialog kind={info} onClose={() => setInfo(null)} />}
    {reset && <Dialog title="Apagar todos os dados?" onClose={() => setReset(false)}><p className="text-sm text-ink-500">Isso remove registros, metas e histórico deste dispositivo. Não pode ser desfeito.</p><div className="mt-4 flex gap-2"><button type="button" className="btn-secondary flex-1" onClick={() => setReset(false)}>Cancelar</button><button type="button" disabled={busy} className="btn flex-1 bg-expense p-3 text-white" onClick={async () => { setBusy(true); try { await state.resetApp(); navigate('/'); } catch { setMessage('Não foi possível apagar. Tente novamente.'); setReset(false); } finally { setBusy(false); } }}>Apagar</button></div></Dialog>}
  </Layout>;
}
