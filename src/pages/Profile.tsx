import { CategoryManager } from '@/components/ui/CategoryManager';
import { ProfileJourney } from '@/components/journey/ProfileJourney';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, SlidersHorizontal, Tags, Trash2 } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Dialog } from '@/components/ui/Dialog';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/format';

export function Profile() {
  const state = useStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const archived = state.investments.filter((item) => !item.metaId);
  async function exportData() {
    setExporting(true); setMessage('');
    try {
      const { downloadFinancialReport } = await import('@/lib/financialReport');
      downloadFinancialReport(useStore.getState());
    } catch { setMessage('Erro ao gerar PDF. Tente novamente.'); }
    finally { setExporting(false); }
  }
  return <Layout title="Meu perfil" compact><h1 className="mb-4 text-xl font-semibold">Seu dinheiro, do seu jeito</h1><ProfileJourney />{message && <p role="alert" className="mb-3 text-xs text-expense">{message}</p>}<div className="mb-3 grid grid-cols-2 gap-2" aria-label="Preferencias do perfil"><button type="button" onClick={() => setPreferencesOpen(true)} className="flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-3 text-center text-xs font-semibold text-primary-700 hover:bg-primary-50"><Tags className="h-4 w-4 shrink-0" /><span>Minhas categorias e objetivo</span></button><Link to="/orcamentos" className="flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-3 text-center text-xs font-semibold text-primary-700 hover:bg-primary-50"><SlidersHorizontal className="h-4 w-4 shrink-0" /><span>Meus limites de gastos</span></Link></div><section className="mt-3 rounded-2xl border border-ink-200 bg-white p-4"><h2 className="text-sm font-semibold">Seus dados</h2><p className="mt-2 text-xs leading-relaxed text-ink-500">Os registros ficam neste dispositivo. Limpar os dados do navegador pode apagá-los. Baixe um PDF com saldo inicial, metas e percentuais, gráfico de despesas e todos os registros.</p><button type="button" onClick={exportData} disabled={exporting} className="text-link"><Download className="h-4 w-4" />{exporting ? 'Gerando PDF...' : 'Baixar relatório em PDF'}</button></section>{(archived.length > 0 || state.plannedExpenses.length > 0 || state.creditCards.length > 0) && <details className="mt-3 rounded-2xl border border-ink-200 bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Dados da versão anterior</summary><p className="mt-3 text-xs leading-relaxed text-ink-500">Carteira, cartões e previsões foram desanexados. Os dados antigos foram preservados neste dispositivo. Compromissos antigos não são descontados do saldo; registre os pagamentos reais no extrato uma única vez.</p>{archived.map((item) => <p key={item.id} className="mt-2 flex justify-between gap-2 text-xs"><span>{item.nome}</span><span>{formatCurrency(item.valor)}</span></p>)}<p className="mt-2 text-xs text-ink-500">{state.plannedExpenses.length} compromissos e {state.creditCards.length} cartões arquivados.</p></details>}<button type="button" onClick={() => setReset(true)} className="mx-auto mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-semibold text-expense transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"><Trash2 className="h-4 w-4" />Apagar meus dados</button>{preferencesOpen && <CategoryManager onClose={() => setPreferencesOpen(false)} />}{reset && <Dialog title="Apagar todos os dados?" onClose={() => setReset(false)}><p className="text-sm text-ink-500">Essa ação remove registros, metas e histórico deste dispositivo e não pode ser desfeita.</p><div className="mt-4 flex gap-2"><button className="btn-secondary flex-1" onClick={() => setReset(false)}>Cancelar</button><button disabled={busy} className="btn flex-1 bg-expense p-3 text-white" onClick={async () => { setBusy(true); try { await state.resetApp(); navigate('/'); } catch { setMessage('Não foi possível apagar. Tente novamente.'); setReset(false); } finally { setBusy(false); } }}>Apagar</button></div></Dialog>}</Layout>;
}
