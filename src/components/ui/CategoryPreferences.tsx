import { Check } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';
import { CategoryIcon } from './CategoryIcon';

export function CategoryPreferences({ options, selected, onChange }: { options: CategoryId[]; selected: CategoryId[]; onChange: (value: CategoryId[]) => void }) {
  return <div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map((id) => {
    const active = selected.includes(id);
    return <button type="button" key={id} aria-pressed={active} onClick={() => onChange(active ? selected.filter((item) => item !== id) : [...selected, id])} className={`relative flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 ${active ? 'border-primary-400 bg-primary-50' : 'border-ink-200 bg-white'}`}><CategoryIcon category={id} compact /><span className="text-center text-[11px] font-medium">{CATEGORIES[id].nome}</span>{active && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary-700" />}</button>;
  })}</div><p className="mt-2 text-[11px] text-ink-500">Apenas as selecionadas aparecem ao registrar. Você pode mudar suas categorias no Perfil.</p></div>;
}
