import { Link } from 'react-router-dom';
import { categoryOrder } from '@/lib/personalization';
import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, ChevronRight, Clock3, Zap } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId, Transaction, TransactionType } from '@/types';
import { formatCurrency } from '@/lib/format';
import { parseAmount } from '@/lib/money';

interface QuickAddModalProps {
  open: boolean;
  initialDate?: string;
  onClose: () => void;
}

const QUICK_VALUES = [5, 10, 20, 50];

export function QuickAddModal({ open, onClose, initialDate }: QuickAddModalProps) {
  return <AnimatePresence>{open && <QuickAddForm initialDate={initialDate} key="quick-add" onClose={onClose} />}</AnimatePresence>;
}

function QuickAddForm({ onClose, initialDate }: { initialDate?: string; onClose: () => void }) {
  const addTransaction = useStore((s) => s.addTransaction);
  const transactions = useStore((s) => s.transactions);
  const preferences = useStore((s) => s.preferences);
  const [allCategories, setAllCategories] = useState(false);
  const [step, setStep] = useState<'categoria' | 'valor'>('categoria');
  const [tipo, setTipo] = useState<TransactionType>('despesa');
  const [categoria, setCategoria] = useState<CategoryId | null>(null);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);
  const titleId = useId();
  const amountId = useId();
  const descriptionId = useId();
  const amount = parseAmount(valor);
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const validDate = !initialDate || (/^\d{4}-\d{2}-\d{2}$/.test(initialDate) && initialDate <= localToday);
  const validAmount = Number.isFinite(amount) && amount > 0;
  const cats = categoryOrder(tipo, preferences);

  const seen = new Set<string>();
  const recent = transactions
    .filter((item) => item.tipo === tipo && cats.includes(item.categoria) && item.valor > 0 && Number.isFinite(item.valor))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .filter((item) => {
      const key = JSON.stringify([item.categoria, item.valor, item.descricao?.trim() || '']);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const visibleRecent = (step === 'valor' ? recent.filter((item) => item.categoria === categoria) : recent).slice(0, 3);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  // Mantém o foco no diálogo sem abrir o teclado ao escolher uma categoria.
  useEffect(() => {
    dialogRef.current?.focus();
    dialogRef.current?.querySelector('[data-scroll-content]')?.scrollTo(0, 0);
  }, [step]);

  function selectCategory(category: CategoryId) {
    setCategoria(category);
    setStep('valor');
  }

  function selectRecent(item: Transaction) {
    setCategoria(item.categoria);
    setValor(item.valor.toFixed(2).replace('.', ','));
    setDescricao(item.descricao ?? '');
    setShowDescription(Boolean(item.descricao));
    setStep('valor');
  }

  function changeType(nextType: TransactionType) {
    if (tipo === nextType) return;
    setTipo(nextType);
    setAllCategories(false);
    setCategoria(null);
    setValor('');
    setDescricao('');
    setShowDescription(false);
    setStep('categoria');
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!validDate || savingRef.current || !categoria || !cats.includes(categoria) || !validAmount) return;
    savingRef.current = true;
    addTransaction({
      tipo,
      valor: Math.round(amount * 100) / 100,
      categoria,
      data: `${initialDate ?? localToday}T12:00:00`,
      descricao: descricao.trim() || undefined,
    });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
          if (event.key !== 'Tab') return;
          const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]') ?? []);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault(); last?.focus();
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
            event.preventDefault(); first?.focus();
          }
        }}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink-100 px-4 py-3">
          <div className="flex items-center gap-2">
            {step === 'valor' && (
              <button type="button" onClick={() => setStep('categoria')} className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-50" aria-label="Voltar para categorias">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 id={titleId} className="font-bold text-ink-900">Nova transação</h2>
              <p className="mt-0.5 text-xs text-ink-500">{step === 'categoria' ? '1. Categoria · 2. Valor · Pronto!' : 'Um valor, um toque e pronto.'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-50" aria-label="Fechar nova transação">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <div data-scroll-content className="min-h-0 overflow-y-auto p-4 space-y-4">
            {initialDate && <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700">Data do registro: {initialDate.split('-').reverse().join('/')}</p>}
            {!validDate && <p role="alert" className="text-xs text-expense">Registre apenas dinheiro recebido ou gastos já realizados. Escolha hoje ou uma data anterior no calendário.</p>}
            <div className="flex rounded-xl bg-ink-100 p-1" aria-label="Tipo de transação">
              {(['despesa', 'receita'] as const).map((type) => (
                <button key={type} type="button" aria-pressed={tipo === type} onClick={() => changeType(type)}
                  className={`min-h-11 flex-1 rounded-lg text-sm font-semibold transition-colors ${tipo === type ? (type === 'receita' ? 'bg-white text-income shadow-sm' : 'bg-white text-expense shadow-sm') : 'text-ink-500 hover:text-ink-900'}`}>
                  {type === 'despesa' ? 'Despesa' : 'Entrada'}
                </button>
              ))}
            </div>

            {step === 'categoria' ? (
              <section aria-label="Categorias">
                <h3 className="mb-2 text-sm font-semibold text-ink-700">{preferences ? 'Minhas categorias' : 'Escolha a categoria'}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(allCategories ? cats : cats.slice(0, 6)).map((catId) => (
                    <button key={catId} type="button" aria-pressed={categoria === catId} onClick={() => selectCategory(catId)}
                      className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-2.5 transition-colors ${categoria === catId ? 'border-primary-600 bg-primary-50' : 'border-ink-100 hover:border-primary-300 hover:bg-primary-50'}`}>
                      <CategoryIcon category={catId} />
                      <span className="text-xs font-medium text-ink-700">{CATEGORIES[catId].nome}</span>
                    </button>
                  ))}
                </div>
                {cats.length === 0 && <p className="py-3 text-sm text-ink-500">Nenhuma categoria selecionada para este tipo. <Link to="/perfil" onClick={onClose} className="text-primary-700 underline">Escolher no Perfil</Link></p>}
                {cats.length > 6 && <button type="button" onClick={() => setAllCategories(!allCategories)} className="mt-1 min-h-11 w-full text-xs font-semibold text-primary-700">{allCategories ? 'Mostrar menos categorias' : 'Mais categorias'}</button>}
              </section>
            ) : categoria && (
              <>
                <button type="button" onClick={() => setStep('categoria')} aria-label={`Trocar categoria: ${CATEGORIES[categoria].nome}`} className="flex w-full items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left hover:bg-ink-50">
                  <CategoryIcon category={categoria} />
                  <span className="flex-1 text-sm font-semibold text-ink-900">{CATEGORIES[categoria].nome}</span>
                  <span className="text-xs text-ink-500">Trocar</span>
                  <ChevronRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
                </button>
                <div>
                  <label htmlFor={amountId} className="mb-2 block text-sm font-semibold text-ink-700">{tipo === 'despesa' ? 'Quanto custou?' : 'Quanto entrou?'}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-400">R$</span>
                    <input id={amountId} type="text" inputMode="decimal" autoComplete="off" maxLength={18} value={valor}
                      onChange={(event) => setValor(event.target.value)} placeholder="0,00"
                      aria-invalid={Boolean(valor && !validAmount)} aria-describedby={valor && !validAmount ? `${amountId}-error` : undefined}
                      className="input py-4 pl-12 text-3xl font-bold" />
                  </div>
                  {valor && !validAmount && <p id={`${amountId}-error`} className="mt-2 text-xs text-danger">Digite um valor maior que zero, com até 2 casas decimais.</p>}
                </div>
                <section aria-label="Valores rápidos">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-500"><Zap className="h-3.5 w-3.5" aria-hidden="true" />Valores rápidos</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_VALUES.map((value) => (
                      <button key={value} type="button" aria-pressed={amount === value} onClick={() => setValor(value.toFixed(2).replace('.', ','))}
                        className={`min-h-11 rounded-xl border text-sm font-semibold transition-colors ${amount === value ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-ink-200 text-ink-700 hover:border-primary-300 hover:bg-primary-50'}`}>
                        R$ {value}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            <section aria-label={tipo === 'despesa' ? 'Custos recentes' : 'Entradas recentes'}>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-500"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{tipo === 'despesa' ? 'Custos recentes' : 'Entradas recentes'}{step === 'valor' ? ' nesta categoria' : ''}</h3>
              {visibleRecent.length ? (
                <div className="space-y-2">
                  {visibleRecent.map((item) => (
                    <button key={item.id} type="button" onClick={() => selectRecent(item)} aria-label={`Repetir ${item.descricao || CATEGORIES[item.categoria].nome}, ${formatCurrency(item.valor)}`}
                      className="flex w-full items-center gap-2.5 rounded-xl bg-ink-50 p-2.5 text-left transition-colors hover:bg-primary-50">
                      <CategoryIcon category={item.categoria} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-ink-700">{item.descricao || CATEGORIES[item.categoria].nome}</span>
                        <span className="block text-[11px] text-ink-500">{step === 'categoria' && item.descricao ? `${CATEGORIES[item.categoria].nome} · ` : ''}Toque para repetir</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-ink-900">{formatCurrency(item.valor)}</span>
                    </button>
                  ))}
                </div>
              ) : <p className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">{step === 'categoria' ? 'Seus registros aparecerão aqui para repetir com um toque.' : 'Os próximos registros desta categoria aparecerão aqui.'}</p>}
            </section>

            {step === 'valor' && (
              showDescription ? (
                <div>
                  <label htmlFor={descriptionId} className="mb-2 block text-xs font-semibold text-ink-500">Descrição (opcional)</label>
                  <input id={descriptionId} type="text" value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Ex.: lanche na escola" className="input text-sm" />
                </div>
              ) : <button type="button" onClick={() => setShowDescription(true)} className="min-h-11 text-xs font-semibold text-ink-500 hover:text-primary-700">+ Adicionar descrição (opcional)</button>
            )}
          </div>
          {step === 'valor' && (
            <footer className="shrink-0 border-t border-ink-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="submit" disabled={!categoria || !validAmount || !validDate} className="btn-primary w-full">
                <Check className="h-5 w-5" aria-hidden="true" />
                {validAmount ? `Salvar ${formatCurrency(amount)}` : 'Escolha ou digite um valor'}
              </button>
            </footer>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
