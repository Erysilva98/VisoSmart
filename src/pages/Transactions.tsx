import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { FAB } from '@/components/ui/FAB';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, formatDate, getMonthName, isSameMonth } from '@/lib/format';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CategoryId, Transaction } from '@/types';

export function Transactions() {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'receita' | 'despesa'>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const location = useLocation();
  const transactions = useStore((s) => s.transactions);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    const requested = location.state as { filter?: 'receita' | 'despesa'; categoria?: CategoryId; month?: string } | null;
    const requestedFilter = requested?.filter;
    if (requestedFilter) setFilter(requestedFilter);
    setCategoryFilter(requested?.categoria ?? null);
    if (requested?.month) {
      const [year, month] = requested.month.split('-').map(Number);
      if (year && month) setSelectedMonth(new Date(year, month - 1, 1));
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.data);
      if (date.getFullYear() !== selectedMonth.getFullYear() || date.getMonth() !== selectedMonth.getMonth()) return false;
      if (filter !== 'all' && t.tipo !== filter) return false;
      if (categoryFilter && t.categoria !== categoryFilter) return false;
      if (search && !t.descricao?.toLowerCase().includes(search.toLowerCase()) &&
          !CATEGORIES[t.categoria].nome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter, categoryFilter, search, selectedMonth]);

  const monthTx = transactions.filter((t) => {
    const date = new Date(t.data);
    return date.getFullYear() === selectedMonth.getFullYear() && date.getMonth() === selectedMonth.getMonth();
  });
  const monthDespesas = monthTx.filter((t) => t.tipo === 'despesa').reduce((a, t) => a + t.valor, 0);
  const monthReceitas = monthTx.filter((t) => t.tipo === 'receita').reduce((a, t) => a + t.valor, 0);

  return (
    <Layout title="Extrato">
      <div className="flex items-center justify-between mb-3 bg-white rounded-xl shadow-card p-2">
        <button type="button" onClick={() => setSelectedMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="p-1.5 text-ink-500" aria-label="Mês anterior"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-semibold text-ink-800 capitalize">{selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        <button type="button" onClick={() => setSelectedMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="p-1.5 text-ink-500" aria-label="Próximo mês"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-primary-50 rounded-2xl">
          <p className="text-xs text-primary-700 font-medium">Receitas do mês</p>
          <p className="text-lg font-bold text-primary-700">{formatCurrency(monthReceitas)}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-2xl">
          <p className="text-xs text-danger font-medium">Despesas do mês</p>
          <p className="text-lg font-bold text-danger">{formatCurrency(monthDespesas)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card">
          {(['all', 'receita', 'despesa'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-primary-600 text-white' : 'text-ink-500'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Icons.Receipt}
          title="Nenhuma transação"
          description="Toque no botão + para registrar seu primeiro gasto ou receita."
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((t, i) => {
              const cat = CATEGORIES[t.categoria as CategoryId];
              const Icon = (Icons as unknown as Record<string, LucideIcon>)[cat.icon] || Icons.CircleDot;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setEditing(t)}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-card group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.cor + '20' }}>
                    <Icon className="w-5 h-5" style={{ color: cat.cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {t.descricao || cat.nome}
                    </p>
                    <p className="text-xs text-ink-400">{cat.nome} • {formatDate(t.data)}</p>
                  </div>
                  <span className={`text-sm font-bold ${t.tipo === 'receita' ? 'text-primary-600' : 'text-ink-900'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                  </span>
                  <button
                    onClick={(event) => { event.stopPropagation(); deleteTransaction(t.id); }}
                    className="p-1.5 text-ink-300 hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <FAB onClick={() => setShowAdd(true)} />
      <QuickAddModal open={showAdd} onClose={() => setShowAdd(false)} />
      {editing && <TransactionEditor transaction={editing} onClose={() => setEditing(null)} onSave={(transaction) => { updateTransaction(editing.id, transaction); setEditing(null); }} onDelete={() => { deleteTransaction(editing.id); setEditing(null); }} />}
    </Layout>
  );
}

function TransactionEditor({ transaction, onClose, onSave, onDelete }: { transaction: Transaction; onClose: () => void; onSave: (transaction: Omit<Transaction, 'id'>) => void; onDelete: () => void }) {
  const [form, setForm] = useState({ tipo: transaction.tipo, categoria: transaction.categoria, valor: String(transaction.valor).replace('.', ','), data: transaction.data.slice(0, 10), descricao: transaction.descricao ?? '' });
  const canSave = Number(form.valor.replace(',', '.')) > 0;
  return <div className="fixed inset-0 z-[70] bg-black/40 p-4 flex items-center justify-center"><motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-md max-h-[82vh] overflow-y-auto bg-white rounded-3xl p-5 shadow-xl"><div className="flex items-center justify-between mb-4"><h2 className="font-bold text-ink-900">Editar transação</h2><button onClick={onClose} className="text-ink-400"><X /></button></div><div className="grid gap-3"><select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value as Transaction['tipo'] })} className="input"><option value="despesa">Despesa</option><option value="receita">Receita</option></select><input value={form.valor} inputMode="decimal" onChange={(event) => setForm({ ...form, valor: event.target.value.replace(/[^0-9.,]/g, '') })} className="input" placeholder="Valor"/><select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value as CategoryId })} className="input">{Object.values(CATEGORIES).filter((category) => category.tipo === 'ambos' || category.tipo === form.tipo).map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select><input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} className="input"/><input value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="input" placeholder="Descrição opcional"/></div><button disabled={!canSave} onClick={() => onSave({ tipo: form.tipo, categoria: form.categoria, valor: Number(form.valor.replace(',', '.')), data: `${form.data}T12:00:00`, descricao: form.descricao || undefined, origem: transaction.origem })} className="btn-primary w-full mt-4">Salvar alteração</button><button onClick={onDelete} className="w-full text-danger text-sm font-medium mt-3">Excluir</button></motion.section></div>;
}


