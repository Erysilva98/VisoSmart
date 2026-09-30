import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleHelp, Trash2 } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CategoryPicker } from '@/components/ui/CategoryPicker';
import { BudgetRuleCard } from '@/components/ui/BudgetRuleCard';
import { Dialog } from '@/components/ui/Dialog';
import { CATEGORIES, DESPESA_CATEGORIES } from '@/data/categories';
import { categoryOrder } from '@/lib/personalization';
import { useStore } from '@/store/useStore';
import { getTransactionView } from '@/lib/transactionView';
import { parseAmount } from '@/lib/money';
import { formatCurrency } from '@/lib/format';
import type { CategoryId } from '@/types';

export function Budgets() {
  const { transactions, budgets, preferences, setBudget, deleteBudget } = useStore();
  const [category, setCategory] = useState<CategoryId>('alimentacao');
  const [value, setValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [help, setHelp] = useState(false);
  const [message, setMessage] = useState('');
  const month = getTransactionView(transactions, { month: new Date() });
  const options = categoryOrder('despesa', preferences).filter((id) => CATEGORIES[id]?.tipo === 'despesa' && !CATEGORIES[id]?.legacy);
  const visible = showAll ? options : options.slice(0, 4);
  const amount = parseAmount(value);
  const valid = Number.isFinite(amount) && amount > 0;
  function openLimit(id: CategoryId) { setCategory(id); setValue(budgets.find((item) => item.categoria === id)?.limite.toString() ?? ''); setShowForm(true); }

  return <Layout title="Meus limites" compact>
    <header className="mb-3 flex items-center justify-between gap-2"><div><h1 className="text-lg font-semibold">Meus limites</h1><p className="text-xs text-ink-500">Escolha uma categoria para acompanhar.</p></div><button type="button" aria-label="Entender os limites" onClick={() => setHelp(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><CircleHelp className="h-5 w-5" /></button></header>
    <nav aria-label="Definir limite por categoria" className="grid grid-cols-4 gap-2">{visible.map((id) => <button key={id} type="button" onClick={() => openLimit(id)} aria-label={`Definir limite para ${CATEGORIES[id].nome}`} className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-ink-200 bg-white px-1 text-center text-[10px] font-semibold text-ink-800 hover:border-primary-300 hover:bg-primary-50"><CategoryIcon category={id} compact /><span className="line-clamp-2">{CATEGORIES[id].nome}</span></button>)}</nav>
    {options.length > 4 && <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className="mt-1 flex min-h-9 w-full items-center justify-center gap-1 text-xs font-semibold text-primary-700">{showAll ? 'Mostrar menos' : `Ver mais ${options.length - 4} categorias`}{showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>}
    {message && <p role="status" className="mb-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">{message}</p>}
    <section className="mt-3"><h2 className="mb-2 text-sm font-semibold">Limites definidos</h2><div className="grid gap-2">{budgets.filter((item) => item.categoria !== 'investimentos_economia').map((item) => { const spent = month.categories.find((entry) => entry.categoria === item.categoria)?.valor ?? 0; const remaining = Math.round((item.limite - spent) * 100) / 100; return <article key={item.categoria} className="rounded-2xl border border-ink-200 bg-white p-3"><div className="flex items-center gap-2"><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><h3 className="truncate text-xs font-semibold">{CATEGORIES[item.categoria].nome}</h3><p className={`text-[11px] ${remaining < 0 ? 'text-expense' : 'text-ink-500'}`}>{formatCurrency(spent)} / {formatCurrency(item.limite)}{remaining < 0 ? ' · acima do limite' : ''}</p></div><button type="button" onClick={() => openLimit(item.categoria)} className="min-h-9 px-2 text-xs font-semibold text-primary-700">Ajustar</button><button type="button" aria-label={`Remover limite de ${CATEGORIES[item.categoria].nome}`} onClick={() => { deleteBudget(item.categoria); setMessage('Limite removido. Seus gastos continuam no Extrato.'); }} className="flex h-9 w-8 items-center justify-center text-ink-400"><Trash2 className="h-4 w-4" /></button></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className={`h-full ${remaining < 0 ? 'bg-expense' : 'bg-primary-500'}`} style={{ width: `${item.limite > 0 ? Math.min(100, spent / item.limite * 100) : 100}%` }} /></div></article>; })}{!budgets.some((item) => item.categoria !== 'investimentos_economia') && <p className="rounded-xl bg-white px-4 py-3 text-xs text-ink-500">Toque em um ícone acima para definir seu primeiro limite.</p>}</div></section>
    {showForm && <Dialog title={`Limite de ${CATEGORIES[category].nome}`} onClose={() => setShowForm(false)}><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!valid) return; setBudget(category, amount); setShowForm(false); setMessage('Limite salvo. O alerta do Extrato acompanha seus gastos.'); }}><CategoryPicker value={category} options={[...new Set([...DESPESA_CATEGORIES, category])]} onChange={setCategory} /><label className="block text-xs font-semibold">Quanto quer gastar no máximo?<input autoFocus className="input mt-2" inputMode="decimal" placeholder="R$ 0,00" value={value} onChange={(event) => setValue(event.target.value)} /></label><p className="text-xs text-ink-500">Gastos deste mês: {formatCurrency(month.categories.find((item) => item.categoria === category)?.valor ?? 0)}.</p><button type="submit" disabled={!valid} className="btn-primary w-full">Salvar limite</button></form></Dialog>}
    {help && <Dialog title="Como funcionam os limites" onClose={() => setHelp(false)}><BudgetRuleCard /><p className="mt-3 text-xs text-ink-600">Um limite ajuda a acompanhar escolhas. Quando um gasto chega perto ou ultrapassa o valor, o triângulo no Extrato mostra um alerta.</p></Dialog>}
  </Layout>;
}
