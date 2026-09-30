import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthSelector({ value, onChange }: { value: Date; onChange: (month: Date) => void }) {
  return <div className="flex items-center justify-between rounded-xl border border-ink-200/70 bg-white px-1 shadow-sm" aria-label="Selecionar mês">
    <button type="button" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50" aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></button>
    <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold capitalize text-ink-800">{value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
    <button type="button" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50" aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></button>
  </div>;
}
