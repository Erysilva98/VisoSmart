import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';

export function CategoryIcon({ category, compact = false }: { category: CategoryId; compact?: boolean }) {
  const config = CATEGORIES[category];
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[config.icon] || Icons.CircleDot;
  return <span className={`flex shrink-0 items-center justify-center rounded-xl ${compact ? 'h-7 w-7' : 'h-9 w-9'}`} style={{ backgroundColor: `${config.cor}18` }}><Icon className={compact ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'} style={{ color: config.cor }} aria-hidden="true" /></span>;
}
