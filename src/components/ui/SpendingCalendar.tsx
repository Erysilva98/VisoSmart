import { ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '@/types';

export function SpendingCalendar({ month, items, hidden = false, onAdd, onViewStatement }: { month: Date; items: Transaction[]; hidden?: boolean; onAdd: (date: string) => void; onViewStatement: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const lastClick = useRef<{ day: number; time: number } | null>(null);
  const addOnDay = (day: number) => {
    lastClick.current = null;
    onAdd(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  const selectDay = (day: number) => {
    setSelected(day);
    const now = performance.now();
    if (lastClick.current?.day === day && now - lastClick.current.time <= 500) {
      addOnDay(day);
    } else {
      lastClick.current = { day, time: now };
    }
  };
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const forDay = (day: number) => items.filter((item) => Number(item.data.slice(8, 10)) === day);
  const money = (value: number) => hidden ? '••••' : formatCurrency(value);
  return <section className="rounded-2xl border border-ink-200/70 bg-white p-3 sm:p-4" aria-label="Calendário de registros">
    <header className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Calendário de registros</h2><button type="button" onClick={onViewStatement} className="flex min-h-11 shrink-0 items-center text-[11px] font-medium text-primary-700">Ver extrato<ChevronRight className="h-3 w-3" /></button></header><p className="text-[11px] text-ink-500">Um toque mostra os registros. Dois toques rápidos no mesmo dia adicionam uma transação.</p>
    <div className="mt-3 grid grid-cols-7 gap-1">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => <span key={day} className="py-1 text-center text-[10px] text-ink-500">{day}</span>)}
      {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
      {Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        const entries = forDay(day);
        const categories = [...new Set(entries.map((item) => item.categoria))];
        return <button key={day} type="button" aria-pressed={selected === day} aria-label={`${day}: ${entries.length} registros`} onClick={() => selectDay(day)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); setSelected(day); addOnDay(day); } }} aria-keyshortcuts="Enter Space" title="Dois cliques ou Enter para adicionar" className={`touch-manipulation flex min-h-[66px] min-w-0 flex-col items-center gap-1 rounded-xl border py-1.5 text-xs transition-colors ${selected === day ? 'border-primary-400 bg-primary-50' : 'border-transparent hover:bg-ink-50'}`}><span>{day}</span><div className="flex flex-wrap items-center justify-center gap-0.5">{categories[0] && <CategoryIcon category={categories[0]} compact />}{categories.length > 1 && <span className="text-[8px] text-ink-500">+{categories.length - 1}</span>}</div><span className="flex gap-1" aria-hidden="true">{entries.some((item) => item.tipo === 'receita') && <span className="h-1 w-1 rounded-full bg-income" />}{entries.some((item) => item.tipo === 'despesa') && <span className="h-1 w-1 rounded-full bg-expense" />}</span></button>;
      })}
    </div>
    <div className="mt-2 flex gap-3 text-[10px] text-ink-500"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-income" />Receitas</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-expense" />Despesas</span></div>
    <div className="mt-3 border-t border-ink-100 pt-3" aria-live="polite"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold">{selected === null ? 'Últimos registros' : `Registros do dia ${selected}`}</h3></div>
    {(selected === null ? items.slice(0, 3) : forDay(selected)).map((item) => <div key={item.id} className="mt-3 flex items-center gap-2 text-xs"><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><p className="truncate">{item.descricao || CATEGORIES[item.categoria].nome}</p><p className="mt-0.5 text-[10px] text-ink-500">{formatDate(item.data)} · {item.tipo === 'receita' ? 'Receita' : 'Despesa'}</p></div><span className={item.tipo === 'receita' ? 'text-income' : 'text-expense'}>{!hidden && (item.tipo === 'receita' ? '+' : '−')}{money(item.valor)}</span></div>)}
    {(selected === null ? items.length === 0 : forDay(selected).length === 0) && <p className="mt-2 text-xs text-ink-500">{selected === null ? 'Nenhum registro neste mês.' : 'Nenhum registro neste dia. Você pode adicionar o primeiro.'}</p>}</div>
  </section>;
}
