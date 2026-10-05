import { useEffect, useState } from 'react';
import { Check, Pencil, Plus } from 'lucide-react';
import { CATEGORIES, DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '@/data/categories';
import { useStore } from '@/store/useStore';
import { FOCUS_LABELS } from '@/lib/personalization';
import type { CategoryDefinition, CategoryId, JourneyPreferences, TransactionType } from '@/types';
import { unusedCategoryStyles } from '@/data/categoryPalette';
import { CATEGORY_ICONS } from '@/data/categoryIcons';
import { Dialog } from './Dialog';

const ICON_NAMES: Record<string, string> = { Wallet: 'Carteira', UtensilsCrossed: 'Alimentação', BusFront: 'Transporte', Home: 'Casa', PartyPopper: 'Lazer', HeartPulse: 'Saúde', BookOpen: 'Estudos', CreditCard: 'Cartão', PiggyBank: 'Economia', Banknote: 'Renda', CircleDot: 'Outros', HandCoins: 'Mesada', BriefcaseBusiness: 'Trabalho', GraduationCap: 'Bolsa', Laptop: 'Tecnologia', Gift: 'Presente', ShoppingBag: 'Compras', PlaySquare: 'Assinatura', Gamepad2: 'Jogos', ShoppingBasket: 'Cesta', Smartphone: 'Celular', ArrowDownToLine: 'Saque', Coffee: 'Café', Pizza: 'Pizza', Sandwich: 'Lanche', IceCreamBowl: 'Sorvete', Shirt: 'Roupas', Footprints: 'Calçados', Scissors: 'Cabelo e cuidados', Sparkles: 'Beleza', Dumbbell: 'Academia', Bike: 'Bicicleta', CarFront: 'Carro', Fuel: 'Combustível', TrainFront: 'Trem', Plane: 'Viagem', Ticket: 'Ingressos', Clapperboard: 'Cinema', Music: 'Música', Headphones: 'Fones', Camera: 'Fotografia', PawPrint: 'Pets', Stethoscope: 'Consultas', Pill: 'Medicamentos', NotebookPen: 'Material escolar', Printer: 'Impressões', Wifi: 'Internet', Zap: 'Energia', Droplets: 'Água', Wrench: 'Reparos', Package: 'Entregas', ShoppingCart: 'Carrinho', ReceiptText: 'Contas e taxas', Landmark: 'Banco', Coins: 'Moedas', BadgePercent: 'Descontos', HandHeart: 'Doações', Trees: 'Passeios ao ar livre' };

export function CategoryManager({ onClose }: { onClose: () => void }) {
  const state = useStore();
  const [definitions, setDefinitions] = useState<CategoryDefinition[]>(state.categoryDefinitions ?? []);
  const [preferences, setPreferences] = useState<JourneyPreferences>(state.preferences ?? { experience: 0, incomeCategories: [...RECEITA_CATEGORIES], expenseCategories: [...DESPESA_CATEGORIES], focus: 'understand' });
  const [type, setType] = useState<TransactionType>('despesa');
  const [editing, setEditing] = useState<CategoryDefinition | null>(null);
  const [error, setError] = useState('');
  const recordPractice = state.recordPractice;
  useEffect(() => { recordPractice(type === 'receita' ? 'manageIncome' : 'manageExpense'); }, [type, recordPractice]);
  const key = type === 'despesa' ? 'expenseCategories' : 'incomeCategories';
  const options = Array.from(new Set([...(type === 'despesa' ? DESPESA_CATEGORIES : RECEITA_CATEGORIES), ...definitions.filter((item) => item.tipo === type).map((item) => item.id)]));
  const config = (id: CategoryId) => definitions.find((item) => item.id === id) ?? CATEGORIES[id];
  const allDefinitions = [...new Map([...Object.values(CATEGORIES), ...definitions].map((item) => [item.id, item])).values()];
  const available = unusedCategoryStyles(allDefinitions, Object.keys(CATEGORY_ICONS), editing?.id);
  const existing = editing && allDefinitions.find((item) => item.id === editing.id);
  const iconOptions = existing && !available.icons.includes(existing.icon) ? [existing.icon, ...available.icons] : available.icons;
  const colorOptions = existing && !available.colors.some((color) => color.value.toLowerCase() === existing.cor.toLowerCase()) ? [{ name: 'Cor atual', value: existing.cor }, ...available.colors] : available.colors;
  function createCategory() {
    const unused = unusedCategoryStyles(allDefinitions, Object.keys(CATEGORY_ICONS));
    if (!unused.colors.length || !unused.icons.length) { setError('Todas as opções estão em uso. Edite uma categoria existente para liberar uma cor ou ícone.'); return; }
    setError('');
    setEditing({ id: `custom_${crypto.randomUUID()}`, nome: '', tipo: type, cor: unused.colors[0].value, icon: unused.icons[0] });
  }
  function toggle(id: CategoryId) {
    setPreferences({ ...preferences, [key]: preferences[key].includes(id) ? preferences[key].filter((item) => item !== id) : [...preferences[key], id] });
  }
  function saveCategory() {
    if (!editing) return;
    const name = editing.nome.trim();
    if (!name || name.length > 40 || !/^#[\da-f]{6}$/i.test(editing.cor)) { setError('Informe um nome de até 40 caracteres e uma cor válida.'); return; }
    if (options.some((id) => id !== editing.id && config(id).nome.trim().toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) { setError('Já existe uma categoria com esse nome.'); return; }
    if (!colorOptions.some((color) => color.value.toLowerCase() === editing.cor.toLowerCase()) || !iconOptions.includes(editing.icon)) { setError('Escolha uma cor e um ícone disponíveis.'); return; }
    setDefinitions([...definitions.filter((item) => item.id !== editing.id), { ...editing, nome: name }]);
    if (!options.includes(editing.id)) setPreferences({ ...preferences, [key]: [...preferences[key], editing.id] });
    setEditing(null); setError('');
  }
  return <Dialog title="Minhas categorias" onClose={onClose}>
    {editing ? <div className="space-y-4">
      <label className="block text-xs font-semibold">Nome da categoria<input autoFocus className="input mt-2" maxLength={40} value={editing.nome} onChange={(event) => setEditing({ ...editing, nome: event.target.value })} /></label>
      <fieldset><legend className="mb-2 text-xs font-semibold">Cor</legend><div className="grid grid-cols-6 gap-1">{colorOptions.map((color) => <button type="button" key={color.value} aria-label={color.name} title={color.name} aria-pressed={editing.cor.toLowerCase() === color.value.toLowerCase()} onClick={() => setEditing({ ...editing, cor: color.value })} className={`flex h-11 items-center justify-center rounded-xl border ${editing.cor.toLowerCase() === color.value.toLowerCase() ? 'border-primary-500 bg-primary-50' : 'border-transparent'}`}><span className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: color.value }}>{editing.cor.toLowerCase() === color.value.toLowerCase() && <Check className="h-4 w-4 rounded-full bg-white text-ink-900" />}</span></button>)}</div></fieldset>
      <fieldset><legend className="mb-2 text-xs font-semibold">Ícones disponíveis</legend><div className="grid max-h-52 grid-cols-5 gap-2 overflow-y-auto p-0.5">{iconOptions.map((name) => { const Icon = CATEGORY_ICONS[name]; return <button type="button" key={name} aria-label={ICON_NAMES[name]} title={ICON_NAMES[name]} aria-pressed={editing.icon === name} onClick={() => setEditing({ ...editing, icon: name })} className={`flex min-h-11 items-center justify-center rounded-xl border ${editing.icon === name ? 'border-primary-500 bg-primary-50' : 'border-ink-200'}`}><Icon className="h-5 w-5" style={{ color: editing.cor }} /></button>; })}</div></fieldset>
      {error && <p role="alert" className="text-xs text-expense">{error}</p>}
      <div className="flex gap-2"><button type="button" onClick={() => { setEditing(null); setError(''); }} className="btn-secondary flex-1">Cancelar</button><button type="button" onClick={saveCategory} className="btn-primary flex-1">Aplicar categoria</button></div>
    </div> : <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">{(['despesa', 'receita'] as const).map((value) => <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)} className={`min-h-11 rounded-xl border text-sm ${type === value ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-ink-200'}`}>{value === 'despesa' ? 'Despesas' : 'Entradas'}</button>)}</div>
      <p className="text-xs leading-relaxed text-ink-500">Só as categorias marcadas aparecem no registro rápido. Desmarcar remove dos seus atalhos e preserva os registros antigos.</p>
      <div className="space-y-1">{options.map((id) => { const item = config(id); const active = preferences[key].includes(id); const Icon = CATEGORY_ICONS[item.icon] ?? CATEGORY_ICONS.CircleDot; return <div key={id} className="flex items-center gap-1 rounded-xl border border-ink-100 px-2">
        <button type="button" aria-pressed={active} onClick={() => toggle(id)} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left text-xs"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${item.cor}18`, color: item.cor }}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1 break-words">{item.nome}</span><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${active ? 'border-primary-600 bg-primary-600 text-white' : 'border-ink-300'}`}>{active && <Check className="h-3 w-3" />}</span></button>
        <button type="button" aria-label={`Editar ${item.nome}`} onClick={() => setEditing({ ...item })} className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-500"><Pencil className="h-3.5 w-3.5" /></button>
      </div>; })}</div>
      <button type="button" onClick={createCategory} className="text-link"><Plus className="h-4 w-4" />Nova categoria</button>
      {error && <p role="alert" className="text-xs text-expense">{error}</p>}
      <label className="block text-xs font-semibold">Meu objetivo<select value={preferences.focus} onChange={(event) => setPreferences({ ...preferences, focus: event.target.value as JourneyPreferences['focus'] })} className="input mt-2">{Object.entries(FOCUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <button type="button" onClick={() => { state.saveCategoryPreferences(definitions, preferences); onClose(); }} className="btn-primary w-full">Salvar categorias</button>
    </div>}
  </Dialog>;
}
