import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, TrendingUp, Plus, Trash2, X, BookOpen, ChevronRight, ArrowLeftRight, Home, Bike, Plane, Sparkles, Target, Landmark, WalletCards, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/format';
import { getLessonsForProfile } from '@/data/lessons';

/** A Carteira mantém somente investimentos, sem depender do módulo removido de patrimônio. */
export function Investments() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.onboarding.profile);
  const investments = useStore((s) => s.investments);
  const lessonProgress = useStore((s) => s.lessonProgress);
  const addInvestment = useStore((s) => s.addInvestment);
  const deleteInvestment = useStore((s) => s.deleteInvestment);
  const updateInvestment = useStore((s) => s.updateInvestment);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'disponivel' | 'reserva' | 'investimento'>('investimento');
  const [considerarDisponivel, setConsiderarDisponivel] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [transferValue, setTransferValue] = useState('');
  const total = investments.reduce((sum, item) => sum + item.valor, 0);
  const available = investments.filter((item) => item.considerarDisponivel).reduce((sum, item) => sum + item.valor, 0);
  const showLearningCard = profile === 'estrategista' || profile === 'mestre';
  const lessons = profile ? getLessonsForProfile(profile) : [];
  const completedLessons = lessonProgress.filter((item) => item.concluido && lessons.some((lesson) => lesson.id === item.lessonId)).length;
  const getItemAppearance = (item: typeof investments[number]) => {
    if (item.metaId) {
      const goalIcons = { Home, Bike, Plane, BookOpen, Sparkles };
      return { Icon: goalIcons[item.icone as keyof typeof goalIcons] || Target, bg: 'bg-violet-100', color: 'text-violet-600', label: 'Meta protegida' };
    }
    if (item.tipo === 'disponivel') return { Icon: WalletCards, bg: 'bg-emerald-100', color: 'text-emerald-600', label: 'Saldo disponível' };
    if (item.tipo === 'reserva') return { Icon: ShieldCheck, bg: 'bg-sky-100', color: 'text-sky-600', label: 'Reserva protegida' };
    return { Icon: Landmark, bg: 'bg-amber-100', color: 'text-amber-600', label: 'Investimento' };
  };
  const getGroup = (item: typeof investments[number]) => {
    if (item.metaId) return 'Metas';
    if (item.tipo === 'disponivel') return 'Saldo';
    if (item.tipo === 'reserva') return 'Reservas';
    return 'Investimentos';
  };
  const groupOrder = ['Saldo', 'Metas', 'Reservas', 'Investimentos'];
  const groupedInvestments = [...investments].sort((first, second) => groupOrder.indexOf(getGroup(first)) - groupOrder.indexOf(getGroup(second)));

  function handleAdd() {
    const amount = Number(valor.replace(',', '.'));
    if (!nome.trim() || !Number.isFinite(amount) || amount <= 0) return;
    addInvestment({ nome: nome.trim(), valor: amount, tipo, considerarDisponivel });
    setNome('');
    setValor('');
    setShowForm(false);
  }

  return (
    <Layout title="Carteira">
      <section className="p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl text-white mb-4">
        <div className="flex items-center gap-2 mb-1"><PiggyBank className="w-5 h-5" /><p className="text-sm opacity-90">Patrimônio financeiro</p></div>
        <p className="text-3xl font-extrabold">{formatCurrency(total)}</p>
        <p className="text-xs opacity-75 mt-2">Saldo disponível para usar: {formatCurrency(available)}</p>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink-900">Minhas carteiras</h2>
          {!showForm && <div className="flex gap-3"><button onClick={() => setShowTransfer(true)} disabled={investments.length < 2} className="text-sm text-ink-500 disabled:text-ink-300"><ArrowLeftRight className="w-4 h-4 inline mr-1" />Transferir</button><button onClick={() => setShowForm(true)} className="text-sm text-primary-600 font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button></div>}
        </div>

        {investments.length === 0 && !showForm && <p className="text-sm text-ink-400 text-center py-7">Nenhum investimento cadastrado.</p>}
        <AnimatePresence>
          {groupedInvestments.map((investment, index, items) => {
            const appearance = getItemAppearance(investment);
            const ItemIcon = appearance.Icon;
            const group = getGroup(investment);
            const previousGroup = index ? getGroup(items[index - 1]) : null;
            return (
            <div key={investment.id}>{group !== previousGroup && <h3 className="mb-2 mt-3 text-xs font-bold uppercase tracking-wide text-ink-500 first:mt-0">{group}</h3>}<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 p-3 mb-2 bg-ink-50 rounded-xl">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${appearance.bg}`}><ItemIcon className={`w-4 h-4 ${appearance.color}`} /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink-900 truncate">{investment.nome}</p><p className="text-xs text-ink-500">{investment.tipo === 'reserva' ? 'Reserva protegida' : investment.tipo === 'disponivel' ? 'Saldo disponível' : 'Investimento'} · {investment.considerarDisponivel ? 'Disponível' : 'Protegido'}</p></div>
              <span className="text-sm font-bold text-ink-900">{formatCurrency(investment.valor)}</span>
              <button onClick={() => deleteInvestment(investment.id)} aria-label={`Excluir ${investment.nome}`} className="p-1.5 text-ink-300 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
            </motion.div></div>
            );
          })}
        </AnimatePresence>

        {showForm && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-ink-50 rounded-xl space-y-3">
          <div className="flex justify-between items-center"><h3 className="text-sm font-bold">Novo investimento</h3><button onClick={() => setShowForm(false)} aria-label="Fechar" className="text-ink-400"><X className="w-4 h-4" /></button></div>
          <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Nome do investimento" className="input" />
          <input value={valor} onChange={(event) => setValor(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Valor (R$)" inputMode="decimal" className="input" />
          <select value={tipo} onChange={(event) => { const value = event.target.value as typeof tipo; setTipo(value); if (value === 'disponivel') setConsiderarDisponivel(true); }} className="input"><option value="investimento">Investimento</option><option value="reserva">Reserva de emergência</option><option value="disponivel">Saldo em conta</option></select>
          <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={considerarDisponivel} onChange={(event) => setConsiderarDisponivel(event.target.checked)} /> Considerar no saldo disponível</label>
          <button onClick={handleAdd} disabled={!nome.trim() || !valor} className="btn-primary w-full">Salvar investimento</button>
        </motion.div>}
      </section>

      {showTransfer && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"><div className="flex justify-between items-center"><h2 className="font-bold">Transferir entre carteiras</h2><button onClick={() => setShowTransfer(false)}><X className="text-ink-400" /></button></div><select value={originId} onChange={(event) => setOriginId(event.target.value)} className="input mt-4"><option value="">Origem</option>{investments.map((item) => <option key={item.id} value={item.id}>{item.nome} — {formatCurrency(item.valor)}</option>)}</select><select value={destinationId} onChange={(event) => setDestinationId(event.target.value)} className="input mt-3"><option value="">Destino</option>{investments.filter((item) => item.id !== originId).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><input value={transferValue} onChange={(event) => setTransferValue(event.target.value.replace(/[^0-9.,]/g, ''))} inputMode="decimal" placeholder="Valor (R$)" className="input mt-3"/><button disabled={!originId || !destinationId || !Number(transferValue.replace(',', '.')) || originId === destinationId} onClick={() => { const amount = Number(transferValue.replace(',', '.')); const origin = investments.find((item) => item.id === originId); const destination = investments.find((item) => item.id === destinationId); if (!origin || !destination || amount <= 0 || amount > origin.valor) return; updateInvestment(origin.id, { valor: origin.valor - amount }); updateInvestment(destination.id, { valor: destination.valor + amount }); setShowTransfer(false); setOriginId(''); setDestinationId(''); setTransferValue(''); }} className="btn-primary w-full mt-4">Transferir</button></div></div>}

      {showLearningCard && (
        <button type="button" onClick={() => navigate('/aprender')} className="w-full mt-4 text-left bg-white rounded-2xl shadow-card p-4 hover:bg-primary-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-amber-600" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink-900">Aprender sobre investimentos</p>
              <p className="text-sm text-ink-500">{completedLessons}/{lessons.length} aulas concluídas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-400" />
          </div>
        </button>
      )}
    </Layout>
  );
}
