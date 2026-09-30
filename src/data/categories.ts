import type { CategoryId } from '@/types';

export interface CategoryConfig { id: CategoryId; nome: string; icon: string; cor: string; tipo: 'despesa' | 'receita' | 'ambos' | 'objetivo'; legacy?: boolean; }

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  mesada: { id: 'mesada', nome: 'Mesada', icon: 'HandCoins', cor: '#15803d', tipo: 'receita' },
  estagio: { id: 'estagio', nome: 'Estágio', icon: 'BriefcaseBusiness', cor: '#2476ce', tipo: 'receita' },
  bolsa: { id: 'bolsa', nome: 'Bolsa acadêmica', icon: 'GraduationCap', cor: '#7c5cff', tipo: 'receita' },
  freelas: { id: 'freelas', nome: 'Freelas e bicos', icon: 'Laptop', cor: '#0f766e', tipo: 'receita' },
  presentes: { id: 'presentes', nome: 'Presentes', icon: 'Gift', cor: '#be185d', tipo: 'receita' },
  compras: { id: 'compras', nome: 'Roupas e compras', icon: 'ShoppingBag', cor: '#8b5cf6', tipo: 'despesa' },
  assinaturas: { id: 'assinaturas', nome: 'Apps e assinaturas', icon: 'PlaySquare', cor: '#0891b2', tipo: 'despesa' },
  jogos: { id: 'jogos', nome: 'Jogos', icon: 'Gamepad2', cor: '#6366f1', tipo: 'despesa' },
  alimentacao: { id: 'alimentacao', nome: 'Alimentação', icon: 'UtensilsCrossed', cor: '#f97316', tipo: 'despesa' },
  transporte: { id: 'transporte', nome: 'Transporte', icon: 'BusFront', cor: '#3b82f6', tipo: 'despesa' },
  moradia: { id: 'moradia', nome: 'Casa e contas', icon: 'Home', cor: '#8b5cf6', tipo: 'despesa' },
  lazer: { id: 'lazer', nome: 'Rolês e lazer', icon: 'PartyPopper', cor: '#ec4899', tipo: 'despesa' },
  saude: { id: 'saude', nome: 'Saúde', icon: 'HeartPulse', cor: '#ef4444', tipo: 'despesa' },
  educacao: { id: 'educacao', nome: 'Estudos', icon: 'BookOpen', cor: '#14b8a6', tipo: 'despesa' },
  cartao_credito: { id: 'cartao_credito', nome: 'Cartão (registro antigo)', icon: 'CreditCard', cor: '#64748b', tipo: 'despesa', legacy: true },
  investimentos_economia: { id: 'investimentos_economia', nome: 'Dinheiro para guardar', icon: 'PiggyBank', cor: '#16a34a', tipo: 'objetivo' },
  salario: { id: 'salario', nome: 'Salário', icon: 'Banknote', cor: '#16a34a', tipo: 'receita' },
  outros: { id: 'outros', nome: 'Outros', icon: 'CircleDot', cor: '#6b7280', tipo: 'ambos' },
};

export const DESPESA_CATEGORIES: CategoryId[] = ['alimentacao', 'transporte', 'lazer', 'educacao', 'compras', 'assinaturas', 'jogos', 'saude', 'moradia', 'outros'];
export const RECEITA_CATEGORIES: CategoryId[] = ['mesada', 'estagio', 'bolsa', 'freelas', 'salario', 'presentes', 'outros'];
export function getCategory(id: CategoryId): CategoryConfig { return CATEGORIES[id]; }


