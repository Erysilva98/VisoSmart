/** Brand indigo, violet, sky, and semantic tones, with darker accessible variants. */
const BASE_CATEGORY_PALETTE = [
  { name: 'Índigo NYX', value: '#4F6DFF' }, { name: 'Índigo profundo', value: '#4338CA' },
  { name: 'Índigo intenso', value: '#3949AB' }, { name: 'Azul noturno', value: '#091433' },
  { name: 'Roxo elétrico', value: '#7A63FE' }, { name: 'Violeta', value: '#7C3AED' },
  { name: 'Ametista', value: '#6D28D9' }, { name: 'Lavanda', value: '#8B7BD8' },
  { name: 'Azul céu', value: '#56B8FF' }, { name: 'Azul oceano', value: '#0284C7' },
  { name: 'Azul intenso', value: '#2563EB' }, { name: 'Azul petróleo', value: '#0E7490' },
  { name: 'Verde entrada', value: '#18B46B' }, { name: 'Esmeralda', value: '#059669' },
  { name: 'Verde profundo', value: '#047857' }, { name: 'Turquesa', value: '#0D9488' },
  { name: 'Vermelho gasto', value: '#F04D4D' }, { name: 'Coral', value: '#E85D75' },
  { name: 'Framboesa', value: '#DB2777' }, { name: 'Rosa profundo', value: '#9D174D' },
  { name: 'Âmbar', value: '#D97706' }, { name: 'Ouro', value: '#A16207' },
  { name: 'Laranja profundo', value: '#C2410C' }, { name: 'Ardósia', value: '#475569' },
];

// Additional shades let both groups reach 30 without repeating a category color.
export const CATEGORY_PALETTE = [...BASE_CATEGORY_PALETTE, ...BASE_CATEGORY_PALETTE.flatMap((color) => [0.18, -0.22].map((ratio) => {
  const channels = color.value.slice(1).match(/.{2}/g)!;
  const value = '#' + channels.map((channel) => {
    const base = parseInt(channel, 16);
    return Math.round(ratio > 0 ? base + (255 - base) * ratio : base * (1 + ratio)).toString(16).padStart(2, '0');
  }).join('');
  return { name: `${color.name} ${ratio > 0 ? 'suave' : 'escuro'}`, value };
}))].filter((color, index, colors) => colors.findIndex((entry) => entry.value.toLowerCase() === color.value.toLowerCase()) === index);

export function unusedCategoryStyles(categories: { id: string; cor: string; icon: string }[], icons: string[], editingId?: string) {
  const others = categories.filter((category) => category.id !== editingId);
  const colors = new Set(others.map((category) => category.cor.toLowerCase()));
  const usedIcons = new Set(others.map((category) => category.icon));
  return { colors: CATEGORY_PALETTE.filter((color) => !colors.has(color.value.toLowerCase())), icons: icons.filter((icon) => !usedIcons.has(icon)) };
}
