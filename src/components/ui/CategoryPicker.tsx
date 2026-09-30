import { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';
import { CategoryIcon } from './CategoryIcon';

export function CategoryPicker({ value, options, onChange }: { value: CategoryId; options: CategoryId[]; onChange: (value: CategoryId) => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div>
    <p id={`${id}-label`} className="mb-2 text-xs font-semibold">Categoria</p>
    <button type="button" aria-label={`Categoria: ${CATEGORIES[value].nome}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">
      <CategoryIcon category={value} compact /><span className="min-w-0 flex-1 break-words">{CATEGORIES[value].nome}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div id={id} role="group" aria-labelledby={`${id}-label`} className="mt-2 grid max-h-60 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-ink-200 bg-white p-2" onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); const trigger = event.currentTarget.previousElementSibling as HTMLButtonElement; trigger?.focus(); } }}>
      {options.map((category) => <button key={category} type="button" aria-pressed={category === value} onClick={(event) => { onChange(category); setOpen(false); (event.currentTarget.parentElement?.previousElementSibling as HTMLButtonElement)?.focus(); }} className={`flex min-h-12 min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${category === value ? 'bg-primary-50 text-primary-800' : 'hover:bg-ink-50'}`}><CategoryIcon category={category} compact /><span className="min-w-0 flex-1 break-words">{CATEGORIES[category].nome}</span>{category === value && <Check className="h-3 w-3 shrink-0" />}</button>)}
    </div>}
  </div>;
}
