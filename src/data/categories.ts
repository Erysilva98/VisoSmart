import type { CategoryId, CategoryDefinition } from '@/types';

export interface CategoryConfig { id: CategoryId; nome: string; icon: string; cor: string; tipo: 'despesa' | 'receita' | 'ambos' | 'objetivo'; legacy?: boolean; deleted?: boolean; }

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  saldo_inicial: { id: 'saldo_inicial', nome: 'Saldo inicial', icon: 'Wallet', cor: '#15803d', tipo: 'receita', legacy: true },
  metas: { id: 'metas', nome: 'Metas', icon: 'PiggyBank', cor: '#426BFF', tipo: 'objetivo' },
  saque: { id: 'saque', nome: 'Saque', icon: 'ArrowDownToLine', cor: '#426BFF', tipo: 'objetivo' },
  mesada: { id: 'mesada', nome: 'Mesada', icon: 'HandCoins', cor: '#15803d', tipo: 'receita' },
  estagio: { id: 'estagio', nome: 'Estágio', icon: 'BriefcaseBusiness', cor: '#426BFF', tipo: 'receita' },
  bolsa: { id: 'bolsa', nome: 'Bolsa acadêmica', icon: 'GraduationCap', cor: '#7C6BFF', tipo: 'receita' },
  freelas: { id: 'freelas', nome: 'Freelas e bicos', icon: 'Laptop', cor: '#0f766e', tipo: 'receita' },
  presentes: { id: 'presentes', nome: 'Presentes', icon: 'Gift', cor: '#be185d', tipo: 'receita' },
  compras: { id: 'compras', nome: 'Lojas', icon: 'ShoppingBag', cor: '#8b5cf6', tipo: 'despesa' },
  mercado: { id: 'mercado', nome: 'Mercado', icon: 'ShoppingBasket', cor: '#16a34a', tipo: 'despesa' },
  celular: { id: 'celular', nome: 'Celular', icon: 'Smartphone', cor: '#426BFF', tipo: 'despesa' },
  assinaturas: { id: 'assinaturas', nome: 'Apps e assinaturas', icon: 'PlaySquare', cor: '#0891b2', tipo: 'despesa' },
  jogos: { id: 'jogos', nome: 'Jogos', icon: 'Gamepad2', cor: '#6366f1', tipo: 'despesa' },
  alimentacao: { id: 'alimentacao', nome: 'Alimentação', icon: 'UtensilsCrossed', cor: '#f97316', tipo: 'despesa' },
  transporte: { id: 'transporte', nome: 'Transporte', icon: 'BusFront', cor: '#3b82f6', tipo: 'despesa' },
  moradia: { id: 'moradia', nome: 'Contas', icon: 'Home', cor: '#8b5cf6', tipo: 'despesa' },
  lazer: { id: 'lazer', nome: 'Passeios', icon: 'PartyPopper', cor: '#ec4899', tipo: 'despesa' },
  saude: { id: 'saude', nome: 'Saúde', icon: 'HeartPulse', cor: '#ef4444', tipo: 'despesa' },
  educacao: { id: 'educacao', nome: 'Estudos', icon: 'BookOpen', cor: '#14b8a6', tipo: 'despesa' },
  cartao_credito: { id: 'cartao_credito', nome: 'Cartão (registro antigo)', icon: 'CreditCard', cor: '#64748b', tipo: 'despesa', legacy: true },
  investimentos_economia: { id: 'investimentos_economia', nome: 'Dinheiro para guardar', icon: 'PiggyBank', cor: '#16a34a', tipo: 'objetivo' },
  salario: { id: 'salario', nome: 'Salário', icon: 'Banknote', cor: '#16a34a', tipo: 'receita' },
  outros: { id: 'outros', nome: 'Outros', icon: 'CircleDot', cor: '#6b7280', tipo: 'ambos' },
};

export const DESPESA_CATEGORIES: CategoryId[] = ['alimentacao', 'transporte', 'lazer', 'educacao', 'compras', 'mercado', 'celular', 'assinaturas', 'jogos', 'saude', 'moradia', 'outros'];
export const RECEITA_CATEGORIES: CategoryId[] = ['mesada', 'estagio', 'bolsa', 'freelas', 'salario', 'presentes', 'outros'];
export function getCategory(id: CategoryId): CategoryConfig { return CATEGORIES[id]; }



const DEFAULTS = { ...CATEGORIES };
const DEFAULT_EXPENSES = [...DESPESA_CATEGORIES];
const DEFAULT_INCOME = [...RECEITA_CATEGORIES];
export const MAX_CATEGORIES_PER_TYPE = 30;
export function categoryOptions(type: 'receita' | 'despesa', definitions: CategoryDefinition[] = []): CategoryId[] {
  const configs = { ...DEFAULTS };
  for (const definition of definitions) configs[definition.id] = { ...configs[definition.id], ...definition };
  return [...new Set([...(type === 'receita' ? DEFAULT_INCOME : DEFAULT_EXPENSES), ...definitions.filter((item) => item.id.startsWith('custom_') && (item.tipo === type || item.tipo === 'ambos')).map((item) => item.id)])].filter((id) => !configs[id]?.deleted);
}
/** Stable IDs preserve historical records when names change. */
export function syncCategories(definitions: CategoryDefinition[] = []) {
  for (const id of Object.keys(CATEGORIES) as CategoryId[]) delete CATEGORIES[id];
  Object.assign(CATEGORIES, DEFAULTS);
  DESPESA_CATEGORIES.splice(0, DESPESA_CATEGORIES.length, ...DEFAULT_EXPENSES);
  RECEITA_CATEGORIES.splice(0, RECEITA_CATEGORIES.length, ...DEFAULT_INCOME);
  for (const definition of definitions) {
    if (definition.id === 'saldo_inicial') continue;
    CATEGORIES[definition.id] = { ...CATEGORIES[definition.id], ...definition };
    if (definition.id.startsWith('custom_')) {
      if (definition.tipo === 'despesa') DESPESA_CATEGORIES.push(definition.id);
      if (definition.tipo === 'receita') RECEITA_CATEGORIES.push(definition.id);
    }
  }
  DESPESA_CATEGORIES.splice(0, DESPESA_CATEGORIES.length, ...categoryOptions('despesa', definitions));
  RECEITA_CATEGORIES.splice(0, RECEITA_CATEGORIES.length, ...categoryOptions('receita', definitions));
}
