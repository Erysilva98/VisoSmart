export interface DateRange { from: string; to: string }

export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Date-only values are local calendar days, never UTC instants. */
export function parseDay(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 100) return null;
  const date = new Date(year, month - 1, day, 12);
  return localDayKey(date) === value ? date : null;
}

export function parseDateRange(from?: string | null, to?: string | null): DateRange | null {
  const first = from || to;
  const last = to || from;
  if (!parseDay(first) || !parseDay(last)) return null;
  return first! <= last! ? { from: first!, to: last! } : { from: last!, to: first! };
}

export function dateRangeLabel(range: DateRange, includeYear = false): string {
  const label = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}${includeYear ? `/${day.slice(0, 4)}` : ''}`;
  return range.from === range.to ? label(range.from) : `${label(range.from)} – ${label(range.to)}`;
}
