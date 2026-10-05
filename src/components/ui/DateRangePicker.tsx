import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog } from './Dialog';
import { dateRangeLabel, localDayKey, parseDateRange, parseDay, type DateRange } from '@/lib/dateRange';

export function DateRangePicker({ value, month, onApply, onClose }: { value: DateRange | null; month: Date; onApply: (value: DateRange | null) => void; onClose: () => void }) {
  const [mode, setMode] = useState<'day' | 'range'>(value && value.from !== value.to ? 'range' : 'day');
  const [from, setFrom] = useState(value?.from ?? '');
  const [to, setTo] = useState(value?.to ?? '');
  const [waitingEnd, setWaitingEnd] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(parseDay(value?.from) ?? month);
  const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const selected = parseDateRange(from, mode === 'day' ? from : to);
  const valid = Boolean(parseDay(from) && (mode === 'day' || parseDay(to)));
  const today = localDayKey(new Date());
  function select(day: string) {
    if (mode === 'day') { setFrom(day); setTo(day); return; }
    if (!waitingEnd) { setFrom(day); setTo(''); setWaitingEnd(true); }
    else { const range = parseDateRange(from, day)!; setFrom(range.from); setTo(range.to); setWaitingEnd(false); }
  }
  return <Dialog title="Selecionar período" onClose={onClose}>
    <div className="mb-3 grid grid-cols-2 gap-2" role="group" aria-label="Tipo de período">{([['day', 'Um dia'], ['range', 'Intervalo']] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={mode === id} onClick={() => { setMode(id); setWaitingEnd(false); if (id === 'day') setTo(from); }} className={`min-h-11 rounded-xl border text-sm font-semibold ${mode === id ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-ink-200 text-ink-600'}`}>{label}</button>)}</div>
    <div className={`grid gap-2 ${mode === 'range' ? 'grid-cols-2' : ''}`}>
      <label className="min-w-0 text-xs font-semibold">{mode === 'day' ? 'Data' : 'De'}<input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setWaitingEnd(false); if (mode === 'day') setTo(event.target.value); const date = parseDay(event.target.value); if (date) setVisibleMonth(date); }} className="input mt-1 min-w-0 px-2 py-2 text-xs" /></label>
      {mode === 'range' && <label className="min-w-0 text-xs font-semibold">Até<input type="date" value={to} onChange={(event) => { setTo(event.target.value); setWaitingEnd(false); }} className="input mt-1 min-w-0 px-2 py-2 text-xs" /></label>}
    </div>
    <div className="mt-3 flex items-center justify-between"><button type="button" aria-label="Mês anterior" onClick={() => setVisibleMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-primary-50"><ChevronLeft className="h-5 w-5" /></button><p className="text-sm font-semibold capitalize">{first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p><button type="button" aria-label="Próximo mês" onClick={() => setVisibleMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 hover:bg-primary-50"><ChevronRight className="h-5 w-5" /></button></div>
    <div className="grid grid-cols-7 gap-0.5" aria-label="Calendário do período">
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={index} className="py-2 text-center text-[11px] text-ink-500">{day}</span>)}
      {Array.from({ length: first.getDay() }, (_, index) => <span key={`blank-${index}`} />)}
      {Array.from({ length: days }, (_, index) => { const date = localDayKey(new Date(first.getFullYear(), first.getMonth(), index + 1)); const endpoint = date === from || date === to; const inRange = selected && date >= selected.from && date <= selected.to; return <button type="button" key={date} aria-label={parseDay(date)!.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={Boolean(endpoint || inRange)} aria-current={date === today ? 'date' : undefined} onClick={() => select(date)} className={`flex min-h-10 min-w-0 items-center justify-center rounded-lg text-xs ${endpoint ? 'bg-primary-600 font-bold text-white' : inRange ? 'bg-primary-50 text-primary-800' : date === today ? 'font-bold text-primary-700 ring-1 ring-inset ring-primary-200' : 'hover:bg-ink-50'}`}>{index + 1}</button>; })}
    </div>
    <p role="status" className="mt-3 text-xs text-ink-600">{mode === 'range' && waitingEnd ? 'Agora escolha o último dia do intervalo.' : valid && selected ? `Exibir ${dateRangeLabel(selected, true)}${mode === 'range' ? ', incluindo as duas datas.' : '.'}` : mode === 'day' ? 'Escolha o dia que deseja consultar.' : 'Escolha o primeiro e o último dia do intervalo.'}</p>
    <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => onApply(null)} className="btn-secondary px-2 text-xs">Limpar período</button><button type="button" disabled={!valid || waitingEnd} onClick={() => { if (valid && selected) onApply(selected); }} className="btn-primary px-2 text-xs">Aplicar</button></div>
  </Dialog>;
}
