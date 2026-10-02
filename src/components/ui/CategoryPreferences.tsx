import { Check } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';
import { CategoryIcon } from './CategoryIcon';

export function CategoryPreferences({ options, selected, onChange, compact = false }: { options: CategoryId[]; selected: CategoryId[]; onChange: (value: CategoryId[]) => void; compact?: boolean }) {
  return <div className="category-preferences"><div className={`grid grid-cols-2 sm:grid-cols-3 ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2'}`}>{options.map((id) => {
    const active = selected.includes(id);
    return <button type="button" key={id} aria-pressed={active} onClick={() => onChange(active ? selected.filter((item) => item !== id) : [...selected, id])} className={`relative flex flex-col items-center justify-center rounded-xl border px-2 ${compact ? 'min-h-[60px] gap-0.5 py-1 sm:min-h-20 sm:gap-1.5 sm:py-3' : 'min-h-20 gap-1.5 py-3'} ${active ? 'border-primary-400 bg-primary-50' : 'border-ink-200 bg-white'}`}><CategoryIcon category={id} compact /><span className="text-center text-[11px] font-medium leading-tight">{CATEGORIES[id].nome}</span>{active && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary-700" />}</button>;
  })}</div><p className={`${compact ? 'mt-1.5' : 'mt-2'} text-[11px] text-ink-500`}>Apenas as selecionadas aparecem ao registrar. Você pode mudar suas categorias no Perfil.</p></div>;
}
