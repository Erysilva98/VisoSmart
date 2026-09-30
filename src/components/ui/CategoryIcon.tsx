import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';

import { CATEGORY_ICONS } from '@/data/categoryIcons';


export function CategoryIcon({ category, compact = false }: { category: CategoryId; compact?: boolean }) {
  const config = CATEGORIES[category];
  const Icon = CATEGORY_ICONS[config.icon] || CATEGORY_ICONS.CircleDot;
  return <span className={`flex shrink-0 items-center justify-center rounded-xl ${compact ? 'h-7 w-7' : 'h-9 w-9'}`} style={{ backgroundColor: `${config.cor}18` }}><Icon className={compact ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'} style={{ color: config.cor }} aria-hidden="true" /></span>;
}
