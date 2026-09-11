import { useMemo, useState } from 'react';
import { BarChart3, Lightbulb, Settings2, Trash2, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import { getGastosPorCategoria, getReceitasMes } from '@/lib/analytics';
import type { Budget, CategoryId } from '@/types';
import {
  ESSENTIAL_CATEGORIES,
  GOAL_CATEGORIES,
  LIFESTYLE_CATEGORIES,
  recommendBudgetStrategy,
} from '@/lib/budgetStrategy';

const BUDGET_CATEGORIES = [
  CATEGORIES.investimentos_economia,
  ...Object.values(CATEGORIES).filter((category) => category.tipo === 'despesa'),
];

type GroupId = 'essential' | 'goals' | 'lifestyle';

const GROUPS: { id: GroupId; title: string; categories: CategoryId[] }[] = [
  { id: 'essential', title: 'Essencial', categories: ESSENTIAL_CATEGORIES },
  { id: 'goals', title: 'Objetivos e reserva', categories: GOAL_CATEGORIES },
  { id: 'lifestyle', title: 'Qualidade de vida', categories: LIFESTYLE_CATEGORIES },
];

function getGroupForCategory(category: CategoryId) {
  return GROUPS.find((group) => group.categories.includes(category));
}

function getGroupLimit(group: GroupId, strategy: ReturnType<typeof recommendBudgetStrategy>) {
  if (group === 'essential') return strategy.essentialLimit;
  if (group === 'goals') return strategy.goalsLimit;
  return strategy.lifestyleLimit;
}

function CategoryIcon({ category }: { category: CategoryId }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[CATEGORIES[category].icon] || Icons.CircleDot;
  return <Icon className="h-4 w-4 shrink-0" style={{ color: CATEGORIES[category].cor }} />;
}

export function Budgets() {
  const { budgets, transactions, onboarding, setBudget, deleteBudget } = useStore();
  const [defineOpen, setDefineOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [limit, setLimit] = useState('');
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editLimit, setEditLimit] = useState('');

  const income = getReceitasMes(transactions);
  const spending = useMemo(
    () => new Map(getGastosPorCategoria(transactions).map((item) => [item.categoria, item.valor])),
    [transactions],
  );
  const strategy = recommendBudgetStrategy(onboarding.profile || 'explorer', income, spending);
  const allocated = budgets.reduce((sum, budget) => sum + budget.limite, 0);
  const available = Math.max(0, income - allocated);
  const manualMaximum = income * 2;
  const overIncome = allocated > income;

  const groupAllocated = (group: GroupId, excluded?: CategoryId) => budgets
    .filter((budget) => budget.categoria !== excluded && getGroupForCategory(budget.categoria)?.id === group)
    .reduce((sum, budget) => sum + budget.limite, 0);

  const maximumFor = (category: CategoryId) => {
    const group = getGroupForCategory(category);
    if (!group) return income;
    return Math.max(0, getGroupLimit(group.id, strategy) - groupAllocated(group.id, category));
  };

  const saveBudget = () => {
    if (!selectedCategory) return;
    const value = Number(limit.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0 || value > manualMaximum) return;
    setBudget(selectedCategory, value);
    setSelectedCategory(null);
    setLimit('');
    setDefineOpen(false);
  };

  const applyStrategy = () => {
    GROUPS.forEach((group) => {
      const amount = getGroupLimit(group.id, strategy) / group.categories.length;
      group.categories.forEach((category) => setBudget(category, amount));
    });
    setRulesOpen(false);
  };

  const removeBudget = (category: CategoryId) => {
    const group = getGroupForCategory(category);
    deleteBudget(category);
    if (!group || income <= 0) return;

    const remaining = budgets.filter(
      (budget) => budget.categoria !== category && group.categories.includes(budget.categoria),
    );
    if (!remaining.length) return;

    const redistributedLimit = getGroupLimit(group.id, strategy) / remaining.length;
    remaining.forEach((budget) => setBudget(budget.categoria, redistributedLimit));
  };

  const openEdit = (budget: Budget) => {
    setEditing(budget);
    setEditLimit(String(budget.limite));
  };

  const saveEdit = () => {
    if (!editing) return;
    const value = Number(editLimit.replace(',', '.'));
    if (!Number.isFinite(value) || value < 0 || value > manualMaximum) return;
    setBudget(editing.categoria, value);
    setEditing(null);
  };

  return (
    <Layout>
      <main className="space-y-4 pb-6">
        <section className="rounded-3xl bg-primary-600 p-5 text-white shadow-card">
          <p className="text-sm font-medium">Renda registrada neste mês</p>
          <strong className="mt-1 block text-3xl">{formatCurrency(income)}</strong>
          <p className="mt-2 text-sm text-primary-50">Planeje por categoria e acompanhe o limite ao registrar cada despesa.</p>
        </section>

        <section className="overflow-hidden rounded-3xl bg-white shadow-card">
          <button type="button" onClick={() => setDefineOpen((open) => !open)} className="flex w-full items-center gap-3 p-5 text-left">
            <Settings2 className="h-5 w-5 text-primary-600" />
            <span className="flex-1 font-bold text-ink-900">Definir orçamento</span>
            <Lightbulb className="h-5 w-5 text-amber-500" onClick={(event) => { event.stopPropagation(); setRulesOpen(true); }} />
            <Icons.ChevronDown className={`h-5 w-5 transition-transform ${defineOpen ? 'rotate-180' : ''}`} />
          </button>
          {defineOpen && (
            <div className="border-t border-ink-100 p-5">
              <p className="mb-3 text-sm text-ink-600">Escolha uma categoria e distribua o valor disponível no grupo recomendado.</p>
              <div className="grid grid-cols-4 gap-2">
                {BUDGET_CATEGORIES.filter((category) => !budgets.some((budget) => budget.categoria === category.id)).map((category) => {
                  const Icon = (Icons as unknown as Record<string, LucideIcon>)[category.icon] || Icons.CircleDot;
                  return <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`flex min-h-16 items-center justify-center rounded-xl border ${selectedCategory === category.id ? 'border-primary-500 bg-primary-50' : 'border-ink-100 bg-ink-50'}`} aria-label={category.nome}><Icon className="h-5 w-5" style={{ color: category.cor }} /></button>;
                })}
              </div>
              {selectedCategory && (
                <div className="mt-4 space-y-3">
                  <p className="font-semibold text-ink-900">{CATEGORIES[selectedCategory].nome}</p>
                  <input value={limit} onChange={(event) => setLimit(event.target.value)} inputMode="decimal" placeholder={`Até ${formatCurrency(manualMaximum)}`} className="w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-primary-500" />
                  <p className="text-sm text-ink-600">Sugestão no grupo: <b className="text-primary-600">{formatCurrency(maximumFor(selectedCategory))}</b> · máximo manual: <b>{formatCurrency(manualMaximum)}</b></p>
                  <button type="button" onClick={saveBudget} className="w-full rounded-xl bg-primary-600 py-3 font-bold text-white disabled:bg-primary-300" disabled={!limit || Number(limit.replace(',', '.')) > manualMaximum}>Definir orçamento</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className={`rounded-3xl bg-white p-5 shadow-card ${overIncome ? 'ring-2 ring-red-200' : ''}`}>
          <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600" /><h1 className="font-bold text-ink-900">Acompanhamento do mês</h1></div>
          <div className={`mb-2 flex justify-between text-sm ${overIncome ? 'text-red-600' : 'text-ink-600'}`}><span>Renda distribuída</span><span>{formatCurrency(allocated)} / {formatCurrency(income)}</span></div>
          <div className="mb-5 h-3 overflow-hidden rounded-full bg-ink-100">
            <div className={`h-full ${overIncome ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${income ? Math.min(100, (allocated / income) * 100) : 0}%` }} />
          </div>
          {overIncome && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">O plano ultrapassa a renda registrada neste mês. Reduza algum limite para equilibrar o orçamento.</p>}

          {budgets.length === 0 ? <p className="py-7 text-center text-sm text-ink-500">Defina categorias para acompanhar seu orçamento.</p> : GROUPS.map((group) => {
            const groupBudgets = budgets.filter((budget) => group.categories.includes(budget.categoria));
            if (!groupBudgets.length) return null;
            return <section key={group.id} className="mb-6 last:mb-0">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-ink-900">{group.title}</h2><span className="text-xs text-ink-500">{formatCurrency(groupAllocated(group.id))} de {formatCurrency(getGroupLimit(group.id, strategy))}</span></div>
              <div className="space-y-5">{groupBudgets.map((budget) => {
                const category = CATEGORIES[budget.categoria];
                const spent = spending.get(budget.categoria) || 0;
                const maximum = maximumFor(budget.categoria);
                const percent = budget.limite ? Math.min(100, (spent / budget.limite) * 100) : 0;
                return <article key={budget.categoria}>
                  <div className="mb-2 flex items-center gap-2"><CategoryIcon category={budget.categoria} /><span className="flex-1 font-medium text-ink-900">{category.nome}</span><button type="button" onClick={() => openEdit(budget)} className="text-sm text-ink-600 underline-offset-2 hover:underline" aria-label={`Editar limite de ${category.nome}`}>{category.id === 'investimentos_economia' ? formatCurrency(budget.limite) : `${formatCurrency(spent)} / ${formatCurrency(budget.limite)}`}</button></div>
                  {category.id !== 'investimentos_economia' && <><div className="h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: category.cor }} /></div><p className="mt-1 text-xs text-ink-500">{Math.round(percent)}% do limite utilizado</p></>}
                  {category.id === 'investimentos_economia' && <p className="mb-2 text-xs text-primary-700">Valor programado para investir e economizar.</p>}
                  <div className="mt-2 flex items-center gap-3"><input className="budget-slider flex-1" type="range" min="0" max={Math.max(1, manualMaximum)} value={Math.min(budget.limite, Math.max(1, manualMaximum))} onChange={(event) => setBudget(budget.categoria, Number(event.target.value))} style={{ color: category.cor, background: '#e5e7eb' }} aria-label={`Limite de ${category.nome}`} /><button type="button" onClick={() => removeBudget(budget.categoria)} className="text-red-500" aria-label={`Remover orçamento de ${category.nome}`}><Trash2 className="h-5 w-5" /></button></div>
                </article>;
              })}</div>
            </section>;
          })}
          {available > 0 && <p className="mt-4 text-sm text-ink-600">Ainda há <b className="text-primary-600">{formatCurrency(available)}</b> da renda sem distribuição.</p>}
        </section>
      </main>

      {rulesOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4"><section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"><div className="mb-4 flex items-start gap-3"><div className="flex-1"><h2 className="font-bold text-ink-900">Estratégia recomendada</h2><p className="text-xs text-ink-500">Baseada no seu perfil e nos gastos atuais.</p></div><button type="button" onClick={() => setRulesOpen(false)} aria-label="Fechar"><X className="h-5 w-5 text-ink-400" /></button></div><div className="mb-4 rounded-2xl bg-primary-50 p-4"><p className="font-bold text-primary-800">{strategy.title}</p><p className="mt-1 text-sm text-primary-700">{strategy.explanation}</p></div>{([{ title: 'Essencial', value: strategy.essential, amount: strategy.essentialLimit }, { title: 'Objetivos e reserva', value: strategy.goals, amount: strategy.goalsLimit }, { title: 'Qualidade de vida', value: strategy.lifestyle, amount: strategy.lifestyleLimit }]).map((item) => <div key={item.title} className="mb-2 rounded-xl bg-ink-50 p-3"><div className="flex justify-between text-sm font-semibold"><span>{item.title}</span><span>{item.value}%</span></div><div className="mt-2 flex justify-between text-xs text-ink-500"><span>Recomendado: {formatCurrency(item.amount)}</span><span className="text-primary-600">Atual: {formatCurrency(groupAllocated(item.title === 'Essencial' ? 'essential' : item.title === 'Objetivos e reserva' ? 'goals' : 'lifestyle'))}</span></div></div>)}<button type="button" onClick={applyStrategy} disabled={!income} className="mt-3 w-full rounded-xl bg-primary-600 py-3 font-bold text-white disabled:bg-primary-300">Aplicar estratégia</button></section></div>}
      {editing && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4"><section className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"><div className="mb-4 flex items-center gap-2"><CategoryIcon category={editing.categoria} /><h2 className="flex-1 font-bold">Editar limite</h2><button type="button" onClick={() => setEditing(null)} aria-label="Fechar"><X className="h-5 w-5 text-ink-400" /></button></div><p className="mb-3 text-sm text-ink-600">Sugestão no grupo: {formatCurrency(maximumFor(editing.categoria))} · máximo manual: {formatCurrency(manualMaximum)}</p><input value={editLimit} onChange={(event) => setEditLimit(event.target.value)} inputMode="decimal" className="w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-primary-500" /><button type="button" disabled={Number(editLimit.replace(',', '.')) > manualMaximum} onClick={saveEdit} className="mt-3 w-full rounded-xl bg-primary-600 py-3 font-bold text-white disabled:bg-primary-300">Salvar limite</button></section></div>}
    </Layout>
  );
}
