/** Sunday-first cells; other selected months open on their first week. */
export function calendarDays(month: Date, weekOnly: boolean, today = new Date()): (number | null)[] {
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const anchor = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth() ? today.getDate() : 1;
  const start = weekOnly ? Math.floor((offset + anchor - 1) / 7) * 7 : 0;
  return Array.from({ length: weekOnly ? 7 : Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = start + index - offset + 1;
    return day > 0 && day <= count ? day : null;
  });
}
