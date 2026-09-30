import { useStore } from '@/store/useStore';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { Dialog } from './Dialog';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '@/types';

export function SpendingCalendar({ month, items, hidden = false, compact = false, onAdd, onViewStatement }: { month: Date; items: Transaction[]; hidden?: boolean; compact?: boolean; onAdd: (date: string) => void; onViewStatement: () => void }) {
  const recordLearningAction = useStore((state) => state.recordLearningAction);
  const [selected, setSelected] = useState<number | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const lastClick = useRef<{ day: number; time: number } | null>(null);
  const detailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (detailTimer.current) clearTimeout(detailTimer.current); }, []);
  const addOnDay = (day: number) => {
    if (detailTimer.current) clearTimeout(detailTimer.current);
    setShowDayDetails(false);
    lastClick.current = null;
    onAdd(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  const selectDay = (day: number) => {
    setSelected(day);
    recordLearningAction('calendar');
    const now = performance.now();
    if (lastClick.current?.day === day && now - lastClick.current.time <= 500) {
      addOnDay(day);
    } else {
      lastClick.current = { day, time: now };
      if (compact) {
        if (detailTimer.current) clearTimeout(detailTimer.current);
        detailTimer.current = setTimeout(() => setShowDayDetails(true), 520);
      }
    }
  };
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const forDay = (day: number) => items.filter((item) => Number(item.data.slice(8, 10)) === day);
  const money = (value: number) => hidden ? '••••' : formatCurrency(value);
  const records = selected === null ? items.slice(0, 3) : forDay(selected);
  const recordList = <>{records.map((item) => <div key={item.id} className="mt-3 flex items-center gap-2 text-xs"><CategoryIcon category={item.categoria} compact /><div className="min-w-0 flex-1"><p className="truncate">{item.descricao || CATEGORIES[item.categoria].nome}</p><p className="mt-0.5 text-[10px] text-ink-500">{formatDate(item.data)} · {item.tipo === 'transferencia' ? item.origem === 'meta_aporte' ? 'Reserva para meta' : 'Saque da meta' : item.tipo === 'receita' ? 'Receita' : 'Despesa'}</p></div><span className={item.tipo === 'transferencia' ? 'text-primary-700' : item.tipo === 'receita' ? 'text-income' : 'text-expense'}>{!hidden && (item.tipo === 'receita' || item.origem === 'meta_saque' ? '+' : '−')}{money(item.valor)}</span></div>)}{records.length === 0 && <p className="mt-2 text-xs text-ink-500">Nenhum registro neste dia. Toque duas vezes na data para adicionar.</p>}</>;
  return <section className={`rounded-2xl border border-ink-200/70 bg-white ${compact ? 'calendar-compact px-3 py-2' : 'p-3 sm:p-4'}`} aria-label="Calendário do mês">
    <header className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Calendário do mês</h2><button type="button" onClick={onViewStatement} className="flex min-h-10 shrink-0 items-center text-[11px] font-medium text-primary-700">Ver extrato<ChevronRight className="h-3 w-3" /></button></header>{!compact && <p className="text-[11px] text-ink-500">Um toque mostra os registros. Dois toques rápidos no mesmo dia adicionam uma transação.</p>}
    <div className={`${compact ? 'mt-0.5 gap-x-1 gap-y-0' : 'mt-3 gap-1'} grid grid-cols-7`}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => <span key={day} className={`py-1 text-center text-[10px] ${index === 0 || index === 6 ? 'font-semibold text-red-400' : 'text-ink-500'}`}>{day}</span>)}
      {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
      {Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        const entries = forDay(day);
        const categories = [...new Set(entries.map((item) => item.categoria))];
        const weekend = (offset + day - 1) % 7 === 0 || (offset + day - 1) % 7 === 6;
        return <button key={day} type="button" aria-pressed={selected === day} aria-label={`${day}: ${entries.length} registros. Dois toques para adicionar`} onClick={() => selectDay(day)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); recordLearningAction('calendar'); setSelected(day); addOnDay(day); } }} aria-keyshortcuts="Enter Space" title="Dois cliques ou Enter para adicionar" className={`touch-manipulation flex min-w-0 flex-col items-center justify-center rounded-lg border text-xs transition-colors ${compact ? 'calendar-day gap-0 py-0.5' : 'min-h-[66px] gap-1 py-1.5'} ${selected === day ? 'border-primary-400 bg-primary-50' : 'border-transparent hover:bg-ink-50'}`}><span className={weekend && selected !== day ? 'font-semibold text-red-400' : undefined}>{day}</span><div className="flex flex-wrap items-center justify-center gap-0.5">{categories[0] && <CategoryIcon category={categories[0]} compact />}{categories.length > 1 && <span className="text-[8px] text-ink-500">+{categories.length - 1}</span>}</div><span className="flex gap-1" aria-hidden="true">{entries.some((item) => item.tipo === 'receita') && <span className="h-1 w-1 rounded-full bg-income" />}{entries.some((item) => item.tipo === 'despesa') && <span className="h-1 w-1 rounded-full bg-expense" />}{entries.some((item) => item.tipo === 'transferencia') && <span className="h-1 w-1 rounded-full bg-primary-500" />}</span></button>;
      })}
    </div>
    {compact ? <p className="mt-1 text-center text-[10px] text-ink-500">Toque para ver · dois toques para registrar</p> : <><div className="mt-2 flex gap-3 text-[10px] text-ink-500"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-income" />Receitas</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-expense" />Despesas</span></div><div className="mt-3 border-t border-ink-100 pt-3" aria-live="polite"><h3 className="text-xs font-semibold">{selected === null ? 'Últimos registros' : `Registros do dia ${selected}`}</h3>{recordList}</div></>}
    {compact && selected !== null && showDayDetails && <Dialog title={`Registros do dia ${selected}`} onClose={() => { setShowDayDetails(false); setSelected(null); }}>{recordList}<button type="button" onClick={onViewStatement} className="text-link mt-3">Ver extrato<ChevronRight className="h-3 w-3" /></button></Dialog>}
  </section>;
}
