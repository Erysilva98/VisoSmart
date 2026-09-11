import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, TrendingUp, Plus, Trash2, X, BookOpen, ChevronRight } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const total = investments.reduce((sum, item) => sum + item.valor, 0);
  const showLearningCard = profile === 'estrategista' || profile === 'mestre';
  const lessons = profile ? getLessonsForProfile(profile) : [];
  const completedLessons = lessonProgress.filter((item) => item.concluido && lessons.some((lesson) => lesson.id === item.lessonId)).length;

  function handleAdd() {
    const amount = Number(valor.replace(',', '.'));
    if (!nome.trim() || !Number.isFinite(amount) || amount <= 0) return;
    addInvestment({ nome: nome.trim(), valor: amount });
    setNome('');
    setValor('');
    setShowForm(false);
  }

  return (
    <Layout title="Carteira">
      <section className="p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl text-white mb-4">
        <div className="flex items-center gap-2 mb-1"><PiggyBank className="w-5 h-5" /><p className="text-sm opacity-90">Total investido</p></div>
        <p className="text-3xl font-extrabold">{formatCurrency(total)}</p>
        <p className="text-xs opacity-75 mt-2">Valor registrado na sua carteira.</p>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink-900">Investimentos</h2>
          {!showForm && <button onClick={() => setShowForm(true)} className="text-sm text-primary-600 font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>}
        </div>

        {investments.length === 0 && !showForm && <p className="text-sm text-ink-400 text-center py-7">Nenhum investimento cadastrado.</p>}
        <AnimatePresence>
          {investments.map((investment) => (
            <motion.div key={investment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 p-3 mb-2 bg-ink-50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-600" /></div>
              <p className="flex-1 min-w-0 text-sm font-medium text-ink-900 truncate">{investment.nome}</p>
              <span className="text-sm font-bold text-ink-900">{formatCurrency(investment.valor)}</span>
              <button onClick={() => deleteInvestment(investment.id)} aria-label={`Excluir ${investment.nome}`} className="p-1.5 text-ink-300 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>

        {showForm && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-ink-50 rounded-xl space-y-3">
          <div className="flex justify-between items-center"><h3 className="text-sm font-bold">Novo investimento</h3><button onClick={() => setShowForm(false)} aria-label="Fechar" className="text-ink-400"><X className="w-4 h-4" /></button></div>
          <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Nome do investimento" className="input" />
          <input value={valor} onChange={(event) => setValor(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Valor (R$)" inputMode="decimal" className="input" />
          <button onClick={handleAdd} disabled={!nome.trim() || !valor} className="btn-primary w-full">Salvar investimento</button>
        </motion.div>}
      </section>

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
