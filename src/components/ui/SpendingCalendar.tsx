import { useState } from 'react';
import { ChevronDown, ChevronUp, ReceiptText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CategoryIcon } from './CategoryIcon';
import { getMonthName } from '@/lib/format';
import { calendarDays } from '@/lib/calendarDays';
import { localDayKey } from '@/lib/dateRange';
import type { Transaction } from '@/types';

export function SpendingCalendar({ month, items, compact = false, weekOnly = false, expandable = false, expanded = false, onToggle, onAdd, onViewStatement, onViewDay }: { month: Date; items: Transaction[]; hidden?: boolean; compact?: boolean; weekOnly?: boolean; expandable?: boolean; expanded?: boolean; onToggle?: () => void; onAdd: (date: string) => void; onViewStatement: () => void; onViewDay: (date: string) => void }) {
  const recordPractice = useStore((state) => state.recordPractice);
  const [selected, setSelected] = useState<number | null>(null);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = localDayKey(new Date());
  const dayKey = (day: number) => localDayKey(new Date(month.getFullYear(), month.getMonth(), day));
  const forDay = (day: number) => items.filter((item) => localDayKey(new Date(item.data.length === 10 ? `${item.data}T12:00:00` : item.data)) === dayKey(day));
  function selectDay(day: number) {
    const date = dayKey(day);
    recordPractice('calendar', date, date.slice(0, 7));
    if (forDay(day).length) { onViewDay(date); return; }
    if (selected === day && date <= today) { onAdd(date); setSelected(null); }
    else setSelected(day);
  }
  return <section className={`rounded-2xl border border-ink-200/70 bg-white ${compact ? 'calendar-compact px-3 py-2' : 'p-3 sm:p-4'}`} data-weeks={Math.ceil((offset + days) / 7)} data-expanded={expanded} data-week-only={weekOnly} aria-label={`Calendário de ${getMonthName(month)}`}>
    <header className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{getMonthName(month)}</h2><div className="flex items-center gap-1">{expandable && <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls="home-calendar-days" aria-label={expanded ? 'Recolher calendário para a semana' : 'Expandir calendário do mês'} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>}<button type="button" onClick={onViewStatement} aria-label="Ver extrato do mês" className="flex min-h-10 shrink-0 items-center gap-1.5 text-[11px] font-semibold text-primary-700">Ver<ReceiptText className="h-4 w-4" /></button></div></header>
    <div id="home-calendar-days" aria-label={weekOnly ? 'Semana atual no mês selecionado' : 'Dias do mês'} className={`${compact ? 'mt-0.5 gap-x-1 gap-y-0' : 'mt-3 gap-1'} grid grid-cols-7`}>
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => <span key={day} className={`py-1 text-center text-[10px] ${index === 0 || index === 6 ? 'font-semibold text-expense' : 'text-ink-500'}`}>{day}</span>)}
      {calendarDays(month, weekOnly).map((day, index) => {
        if (day === null) return <span key={`empty-${index}`} />;
        const entries = forDay(day);
        const categories = [...new Set(entries.map((item) => item.categoria))];
        const weekend = index % 7 === 0 || index % 7 === 6;
        const isToday = dayKey(day) === today;
        return <button key={day} type="button" aria-pressed={selected === day} aria-current={isToday ? 'date' : undefined} aria-label={`${day}${isToday ? ', hoje' : ''}: ${entries.length} registros. ${entries.length ? 'Ver gastos deste dia no Extrato' : 'Selecionar dia'}`} onClick={() => selectDay(day)} className={`touch-manipulation flex min-w-0 flex-col items-center justify-center rounded-lg border text-xs transition-colors ${compact ? 'calendar-day gap-0 py-0.5' : 'min-h-[66px] gap-1 py-1.5'} ${selected === day ? 'border-primary-400 bg-primary-50' : isToday ? 'border-primary-200 bg-primary-50/70' : 'border-transparent hover:bg-ink-50'}`}><span className={isToday ? `font-bold ${weekend ? 'text-expense' : 'text-primary-700'}` : weekend ? 'font-semibold text-expense' : undefined}>{day}</span><div className="flex flex-wrap items-center justify-center gap-0.5">{categories[0] && <CategoryIcon category={categories[0]} compact />}{categories.length > 1 && <span className="text-[8px] text-ink-500">+{categories.length - 1}</span>}</div><span className="flex gap-1" aria-hidden="true">{entries.some((item) => item.tipo === 'receita') && <span className="h-1 w-1 rounded-full bg-income" />}{entries.some((item) => item.tipo === 'despesa') && <span className="h-1 w-1 rounded-full bg-expense" />}{entries.some((item) => item.tipo === 'transferencia') && <span className="h-1 w-1 rounded-full bg-primary-500" />}</span></button>;
      })}
    </div>
    <p aria-live="polite" className="mt-1 text-center text-[10px] text-ink-500">{selected === null ? 'Toque em um dia com registros para ver no Extrato' : dayKey(selected) > today ? `Dia ${selected} · registros só podem ser feitos até hoje` : `Dia ${selected} sem registros · toque novamente para registrar`}</p>
  </section>;
}
