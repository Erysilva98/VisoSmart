export type ProfileType = 'explorer' | 'equilibrado' | 'construtor' | 'estrategista' | 'mestre';

export type TransactionType = 'receita' | 'despesa';

export type CategoryId =
  | `custom_${string}`
  | 'saldo_inicial'
  | 'mesada' | 'estagio' | 'bolsa' | 'freelas' | 'presentes' | 'compras' | 'assinaturas' | 'jogos'
  | 'alimentacao'
  | 'transporte'
  | 'moradia'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'cartao_credito'
  | 'investimentos_economia'
  | 'mercado'
  | 'celular'
  | 'metas'
  | 'saque'
  | 'salario'
  | 'outros';

export interface Transaction {
  id: string;
  tipo: TransactionType | 'transferencia';
  valor: number;
  categoria: CategoryId;
  data: string; // ISO date string
  descricao?: string;
  origem?: 'saldo_inicial' | 'divida' | 'prevista' | 'cartao' | 'fixa' | 'recorrente' | 'meta_aporte' | 'meta_saque';
  metaId?: string;
}

export type PlannedExpenseType = 'divida' | 'fixa' | 'recorrente' | 'avulsa' | 'outro';
export type Recurrence = 'unica' | 'mensal' | 'quinzenal' | 'semanal' | 'anual' | 'parcelada';

export interface PlannedExpense {
  id: string;
  titulo: string;
  categoria: CategoryId;
  valor: number;
  tipo: PlannedExpenseType;
  dataInicio: string;
  vencimento: string;
  recorrencia: Recurrence;
  repeticoes?: number;
  totalParcelas?: number;
  parcelaAtual?: number;
  observacao?: string;
  status: 'ativo' | 'finalizado';
  pagamentos: string[];
  ignorados?: string[];
  encerradoEm?: string;
}

export interface CreditCard {
  id: string;
  nome: string;
  bandeira?: string;
  cor: string;
  limite?: number;
  diaFechamento: number;
  diaVencimento: number;
  observacao?: string;
}

export interface CreditCardExpense {
  id: string;
  cardId: string;
  titulo: string;
  categoria: CategoryId;
  valor: number;
  dataCompra: string;
  tipo: 'unica' | 'parcelada' | 'recorrente';
  parcelas?: number;
  parcelaAtual?: number;
  observacao?: string;
  pagamentos: string[];
}

export interface Goal {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  /** Ícone escolhido para representar visualmente o objetivo. */
  icone?: string;
  /** Item correspondente criado na Carteira para receber os aportes. */
  investimentoId?: string;
  categoria?: CategoryId;
  prazo?: string;
  meses?: number;
  criadaEm: string;
}

/** Registro independente da Carteira; não representa bens ou patrimônio. */
export interface Investment {
  id: string;
  nome: string;
  valor: number;
  criadoEm: string;
  tipo?: 'disponivel' | 'reserva' | 'investimento';
  considerarDisponivel?: boolean;
  /** Meta associada: permanece protegida e fora do saldo disponível. */
  metaId?: string;
  icone?: string;
}

export interface Challenge {
  started?: boolean;
  requirements?: ActivityRequirement[];
  theme?: string;
  templateId?: string;
  contextCategory?: CategoryId;
  id: string;
  titulo: string;
  descricao: string;
  xp: number;
  perfil: ProfileType;
  concluido: boolean;
  mes: string; // YYYY-MM
  nivelMinimo?: number;
  categoria?: string;
  validacao?: string;
  teste?: boolean;
}

export interface ChallengeHistoryEntry {
  templateId: string;
  perfil: ProfileType;
  mes: string;
}

export interface LessonProgress {
  lessonId: string;
  concluido: boolean;
  concluidoEm?: string;
}

export interface OnboardingState {
  completed: boolean;
  score: number;
  profile: ProfileType | null;
  initialProfile?: ProfileType | null;
}

export interface Budget {
  categoria: CategoryId;
  limite: number;
}

export interface JourneyPreferences {
  experience: 0 | 1 | 2;
  incomeCategories: CategoryId[];
  expenseCategories: CategoryId[];
  focus: 'understand' | 'organize' | 'save';
}
export type LearningAction = 'filter' | 'calendar' | 'budget' | 'goal' | 'expenseCategories' | 'incomeCategories' | 'chart' | 'profile';

export type PracticeAction = LearningAction | 'home' | 'statement' | 'search' | 'categoryFilter' | 'typeFilter'
  | 'inspectExpense' | 'combinedFilter'
  | 'month' | 'record' | 'income' | 'expense' | 'edit' | 'inspectRecord' | 'undo'
  | 'viewLimits' | 'inspectLimit' | 'saveLimit' | 'updateLimit' | 'viewGoals' | 'inspectGoal'
  | 'createGoal' | 'contribution' | 'planContribution' | 'saveCategories' | 'editCategory'
  | 'manageIncome' | 'manageExpense' | 'exportReport' | 'dataHelp' | 'privacy' | 'lesson';
export interface PracticeEvent {
  sequence: number;
  action: PracticeAction;
  at: string;
  month: string;
  entity?: string;
}
/** Each requirement accepts one of its actions; a lesson requires every requirement. */
export interface ActivityRequirement {
  actions: PracticeAction[];
  label: string;
  route: string;
  count?: number;
  distinct?: boolean;
  entity?: string;
  sameMonth?: boolean;
  group?: string;
}

export interface AppState {
  practiceEvents?: PracticeEvent[];
  practiceSequence?: number;
  lessonStarts?: Record<string, number>;
  lessonAnswers?: Record<string, number>;
  categoryDefinitions?: CategoryDefinition[];
  lessonReviews?: Record<string, string>;
  preferences?: JourneyPreferences;
  learningActions?: Partial<Record<LearningAction, string>>;
  openingBalance?: number;
  incomePattern?: 'regular' | 'irregular';
  onboarding: OnboardingState;
  transactions: Transaction[];
  goals: Goal[];
  investments: Investment[];
  challenges: Challenge[];
  challengeHistory: ChallengeHistoryEntry[];
  lessonProgress: LessonProgress[];
  budgets: Budget[];
  plannedExpenses: PlannedExpense[];
  creditCards: CreditCard[];
  creditCardExpenses: CreditCardExpense[];
  xp: number;
  cardOrder: string[];
  disabledCards: string[];
}

export interface CategoryDefinition { id: CategoryId; nome: string; icon: string; cor: string; tipo: TransactionType | "ambos" | "objetivo"; deleted?: boolean; }
