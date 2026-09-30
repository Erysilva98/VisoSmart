/** Valor digitado em reais: aceita 12,50, 12.50 e 1.234,56. */
export function parseAmount(value: string): number {
  const trimmed = value.trim();
  if (!/^(?:\d+(?:[.,]\d{1,2})?|\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?)$/.test(trimmed)) return NaN;
  const normalized = trimmed.includes(',') || /^\d{1,3}(?:\.\d{3})+$/.test(trimmed)
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const amount = Number(normalized);
  return Number.isSafeInteger(Math.round(amount * 100)) ? amount : NaN;
}
