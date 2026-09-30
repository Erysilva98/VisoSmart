import { CATEGORIES } from '@/data/categories';
import { formatCurrency } from '@/lib/format';
import type { CategoryId } from '@/types';

export function ExpenseDonut({ categories, hidden, compact = false, onSelect }: { categories: { categoria: CategoryId; valor: number }[]; hidden: boolean; compact?: boolean; onSelect: (category: CategoryId) => void }) {
  const total = categories.reduce((sum, item) => sum + Math.round(item.valor * 100), 0);
  let start = -Math.PI / 2;
  const paths = categories.map((item) => {
    const angle = total ? Math.round(item.valor * 100) / total * Math.PI * 2 : 0;
    const end = start + Math.min(angle, Math.PI * 2 - 0.00001);
    const point = (radius: number, position: number) => `${100 + radius * Math.cos(position)} ${100 + radius * Math.sin(position)}`;
    const d = `M ${point(92, start)} A 92 92 0 ${angle > Math.PI ? 1 : 0} 1 ${point(92, end)} L ${point(53, end)} A 53 53 0 ${angle > Math.PI ? 1 : 0} 0 ${point(53, start)} Z`;
    start += angle;
    return { ...item, d, percent: total ? Math.round(item.valor * 100) / total * 100 : 0 };
  });
  const visible = compact ? [...paths].sort((a, b) => b.valor - a.valor).slice(0, 3) : paths;
  return <div className={`grid grid-cols-[minmax(75px,0.8fr)_minmax(0,1.6fr)] items-center gap-3 ${compact ? 'donut-compact' : 'pb-2'}`}>
    {hidden ? <p className="text-center text-xs text-ink-500">Valores ocultos</p> : <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-48" aria-label="Gastos por categoria: selecione uma fatia">
      {paths.map((item) => <path key={item.categoria} d={item.d} fill={CATEGORIES[item.categoria].cor} stroke="white" strokeWidth={2} role="button" tabIndex={0} aria-label={`${CATEGORIES[item.categoria].nome}: ${item.percent.toFixed(1).replace('.', ',')}%, ${formatCurrency(item.valor)}. Ver despesas`} onClick={() => onSelect(item.categoria)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.categoria); } }} className="cursor-pointer transition-opacity hover:opacity-80 focus:opacity-60 focus:outline-none"><title>{CATEGORIES[item.categoria].nome}</title></path>)}
    </svg>}
    <div>{visible.map((item) => <button key={item.categoria} type="button" onClick={() => onSelect(item.categoria)} className={`flex w-full items-center gap-2 rounded-lg text-left hover:bg-ink-50 ${compact ? 'min-h-8 py-0.5' : 'min-h-12 py-1'}`}>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORIES[item.categoria].cor }} />
      <span className="min-w-0 flex-1 break-words text-[11px] sm:text-xs">{CATEGORIES[item.categoria].nome}</span>
      <span className="shrink-0 text-right"><span className="block text-xs font-semibold">{hidden ? '••••' : `${Math.round(item.percent)}%`}</span><span className="block text-[10px] text-ink-500">{hidden ? '••••' : formatCurrency(item.valor)}</span></span>
    </button>)}{compact && paths.length > 3 && <p className="mt-0.5 text-[10px] text-ink-500">+ {paths.length - 3} categorias no gráfico</p>}</div>
  </div>;
}
