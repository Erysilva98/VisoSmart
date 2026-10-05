import type { ActivityRequirement, AppState, Challenge, ProfileType, JourneyPreferences } from '@/types';
import { practiceProgress } from './practice';

export const MONTHLY_THEMES = ['Conheça seu dinheiro', 'Organize suas categorias', 'Crie limites possíveis', 'Escolhas conscientes', 'Pequenos gastos e recorrências', 'Transforme desejo em meta', 'Observe seus hábitos', 'Planeje com o que recebeu', 'Revise seu mês', 'Tome decisões melhores', 'Prepare o próximo mês', 'Feche o ciclo e evolua'];
type Context = Pick<AppState, 'transactions' | 'budgets' | 'goals'>;
type MissionState = Pick<AppState, 'transactions' | 'lessonProgress' | 'budgets' | 'goals' | 'learningActions' | 'lessonReviews' | 'practiceEvents'>;

// Four different competencies per cycle, not the same tasks with larger quotas.
// Keys after the title are explicit activity requirements (AND), never inferred from routes.
const BANK = {
  explorer: [
    ['Confira seus primeiros registros|records', 'Dê nome aos gastos|categories', 'Descubra a maior categoria|top', 'Confira antes de corrigir|review'],
    ['Escolha atalhos úteis|configure', 'Explore um motivo de gasto|category', 'Confira a classificação|category|review', 'Reconheça suas fontes|incomeConfig'],
    ['Combine seu primeiro teto|limit', 'Veja o gasto da categoria|category', 'Descubra a margem|inspectLimit', 'Relacione margem e saldo|limits|home'],
    ['Localize uma escolha do mês|records', 'Veja o conjunto da categoria|top', 'Compare dois motivos|compare', 'Dê forma a um desejo|goal'],
    ['Procure uma repetição|search', 'Agrupe as cobranças|category', 'Confira o valor de uma delas|review', 'Dê atenção a esse gasto|limit'],
    ['Escolha um objetivo possível|goal', 'Confira custo e prazo|goalDetails', 'Veja o que pode guardar|contribution', 'Descubra quanto falta|goalDetails|home'],
    ['Observe dias diferentes|days', 'Investigue o calendário|calendar|statement', 'Reconheça o maior grupo|top', 'Prepare uma pequena mudança|limit'],
    ['Confira o que chegou|income', 'Diferencie as origens|incomeConfig', 'Relacione entradas e saldo|income|home', 'Procure possíveis duplicações|income|search'],
    ['Abra seu mês|statement', 'Investigue seu maior gasto|top', 'Confira um limite|inspectLimit', 'Escolha um teto para acompanhar|limit'],
    ['Mantenha registros confiáveis|records', 'Encontre uma escolha de consumo|category|review', 'Coloque seu objetivo na conversa|goalDetails', 'Compare gasto e plano|category|inspectLimit'],
    ['Revise seus atalhos|configure', 'Escolha um gasto para observar|category', 'Prepare um limite possível|limit', 'Confira o objetivo para continuar|goalDetails'],
    ['Visite outro período|periods', 'Revise seus motivos de gasto|configure', 'Veja o caminho da sua meta|goalDetails', 'Confira o fechamento do mês|home|income'],
  ],
  equilibrado: [
    ['Faça uma amostra do histórico|records', 'Compare dois grupos|compare', 'Crie um teto com referência|category|limit', 'Conecte saldo e objetivo|home|goal'],
    ['Reduza atrito no registro|configure', 'Compare sua classificação|compare|review', 'Investigue a categoria principal|top|search', 'Confira a coerência dos dados|review|income'],
    ['Acompanhe duas prioridades|twoLimits', 'Compare gasto e intenção|category|inspectLimit', 'Contextualize a margem|limits|home', 'Revise o teto com evidências|search|adjust'],
    ['Compare escolhas do mês|compare', 'Investigue um gasto específico|search|review', 'Relacione consumo e objetivo|category|goalDetails', 'Transforme a decisão em limite|home|limit'],
    ['Encontre uma possível recorrência|search|review', 'Confira o total da categoria|category', 'Compare cobranças entre meses|periods|search', 'Acompanhe um custo recorrente|category|limit'],
    ['Especifique seu objetivo|goal', 'Confronte prazo e saldo|goalDetails|home', 'Avalie um aporte viável|contribution', 'Confira reserva e histórico|goalDetails|statement'],
    ['Olhe dias de rotinas diferentes|days', 'Confira a data de um registro|calendar|review', 'Compare categorias do período|compare', 'Reveja um teto após investigar|search|adjust'],
    ['Analise entradas registradas|income', 'Organize as fontes de renda|incomeConfig|configure', 'Compare meses com cuidado|income|periods', 'Conecte recursos e plano|home|goalDetails'],
    ['Investigue a maior categoria|top|review', 'Compare com o limite|category|inspectLimit', 'Confira sua reserva|goalDetails|home', 'Concretize a próxima mudança|limit'],
    ['Escolha uma prioridade com dados|compare', 'Defina um teto para ela|category|limit', 'Acompanhe dias e gastos|calendar|category', 'Revise o resultado e o plano|inspectLimit|home'],
    ['Leia períodos anteriores|periods|search', 'Prepare limites para prioridades|twoLimits', 'Confira o plano da meta|goalDetails', 'Avalie o que cabe reservar|home|contribution'],
    ['Revise a organização dos dados|configure|review', 'Reavalie duas prioridades|twoLimits', 'Contextualize o avanço da meta|goalDetails|home', 'Conclua sua revisão com evidências|category|search'],
  ],
  construtor: [
    ['Audite uma amostra do histórico|search|review', 'Confronte classificações|compare|review', 'Explique a concentração de gastos|top|search', 'Relacione evidências e recursos|income|home'],
    ['Audite a estrutura de despesas|expenseConfig|compare', 'Separe fontes e saldo inicial|incomeConfig|income', 'Otimize os atalhos de registro|configure', 'Confira a aplicação da estrutura|records|category'],
    ['Selecione prioridades com evidência|compare|top', 'Defina tetos estratégicos|twoLimits', 'Contextualize o consumo dos tetos|inspectLimit|calendar', 'Recalibre após comparar períodos|periods|adjust'],
    ['Investigue uma escolha ajustável|search|review', 'Analise o contexto da categoria|category|home', 'Cruze consumo e objetivo|category|goalDetails', 'Materialize uma intervenção|limit'],
    ['Investigue recorrências sem presumir|search|review', 'Compare impacto entre períodos|periods|category', 'Confronte custo e prioridade|category|goalDetails', 'Crie acompanhamento para o custo|limit'],
    ['Parametrize um objetivo real|goal', 'Confronte ritmo e recursos|goalDetails|income|home', 'Avalie uma alocação sustentável|inspectLimit|contribution', 'Revise o avanço com contexto|goalDetails|statement'],
    ['Audite o calendário|days', 'Confira datas e informações|calendar|review', 'Investigue inconsistências|search|review', 'Compare comportamento entre meses|periods|compare'],
    ['Revise a taxonomia das entradas|incomeConfig|configure', 'Investigue a origem dos recursos|income|category', 'Analise a variação por período|income|periods', 'Decida com recursos realizados|home|goalDetails|contribution'],
    ['Investigue a concentração do mês|top|review', 'Confronte a intenção do limite|category|inspectLimit', 'Audite as movimentações do grupo|category|search|review', 'Converta evidência em intervenção|home|limit'],
    ['Escolha onde uma mudança importa|compare|top', 'Compare contexto e histórico|periods|search', 'Recalibre uma prioridade|category|adjust', 'Avalie resultado e disponibilidade|inspectLimit|home'],
    ['Leia o comportamento recente|periods|compare', 'Reavalie seus tetos estratégicos|twoLimits', 'Revise ritmo e capacidade|goalDetails|contribution', 'Prepare uma próxima ação concreta|home|limit'],
    ['Audite categorias e origens|expenseConfig|incomeConfig|configure', 'Reavalie prioridades de controle|twoLimits|periods', 'Revise objetivos e disponibilidade|goalDetails|home', 'Confira a revisão e organize o próximo ciclo|periods|configure'],
  ],
};

export function monthlyMissions(profile: ProfileType, month: string, _focus: JourneyPreferences['focus'] = 'understand', context: Context = { transactions: [], budgets: [], goals: [] }): Challenge[] {
  void _focus; // Monthly competencies follow the seasonal theme for every focus.
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return [];
  const normalized = profile === 'explorer' || profile === 'equilibrado' ? profile : 'construtor';
  const index = Number(month.slice(5)) - 1;
  const expenses = context.transactions.filter((item) => item.tipo === 'despesa' && item.data.slice(0, 7) === month);
  const totals = new Map<string, number>();
  for (const expense of expenses) totals.set(expense.categoria, (totals.get(expense.categoria) ?? 0) + expense.valor);
  const top = [...totals].sort((a, b) => b[1] - a[1])[0]?.[0] as Challenge['contextCategory'];
  const past = context.transactions.filter((item) => item.data.slice(0, 7) < month && item.origem !== 'saldo_inicial' && item.tipo !== 'transferencia');
  const observedMonths = Math.max(1, new Set(past.map((item) => item.data.slice(0, 7))).size);
  const target = Math.min(3, Math.max(1, Math.ceil(past.length / observedMonths / 4)));
  const hasRecords = context.transactions.some((item) => item.data.slice(0, 7) === month && item.tipo !== 'transferencia');
  const hasGoal = context.goals.length > 0;
  const hasLimit = context.budgets.some((item) => item.categoria !== 'investimentos_economia' && item.limite > 0);
  const limitTarget = Math.min(2, Math.max(1, new Set(context.budgets.map((item) => item.categoria).concat(expenses.map((item) => item.categoria))).size));
  const req = (actions: ActivityRequirement['actions'], label: string, route: string, extra: Partial<ActivityRequirement> = {}): ActivityRequirement => ({ actions, label, route, ...extra });
  const categoryRoute = `/gastos?month=${month}${top ? `&category=${top}` : ''}`;
  const goal = req(['createGoal', 'inspectGoal'], hasGoal ? 'Abrir Detalhes de uma meta' : 'Criar uma meta com custo e prazo possíveis', '/metas');
  const limit = req(['saveLimit'], 'Salvar um limite possível para uma categoria', '/orcamentos');
  const kinds: Record<string, ActivityRequirement[]> = {
    home: [req(['home'], 'Conferir o saldo no Início', '/dashboard')],
    statement: [req(['statement'], 'Consultar os registros do mês', `/gastos?month=${month}`)],
    records: hasRecords ? [req(['record', 'inspectRecord'], `Conferir ou registrar ${target} movimentação(ões) real(is) diferente(s). Não duplique registros.`, `/gastos?month=${month}`, { count: Math.min(target, Math.max(1, context.transactions.filter((item) => item.data.slice(0, 7) === month).length)), distinct: true })] : [req(['statement'], 'Consultar seu Extrato; ainda não precisa registrar nada', `/gastos?month=${month}`), req(['expenseCategories'], 'No +, escolher uma categoria e conhecer o registro. Pode fechar sem salvar.', '/gastos?add=1')],
    categories: [req(['categoryFilter'], 'Consultar duas categorias diferentes, mesmo que estejam vazias', `/gastos?month=${month}`, { count: 2, distinct: true })],
    compare: [req(['categoryFilter'], 'Comparar duas categorias no mesmo período', `/gastos?month=${month}`, { count: 2, distinct: true })],
    category: [req(['categoryFilter'], 'Aplicar um filtro de categoria no Extrato', categoryRoute)],
    top: [req(['chart', 'categoryFilter'], top ? 'Abrir a categoria de maior gasto indicada nesta missão' : 'Explorar uma categoria pelo filtro; sem gastos, não há uma maior ainda', categoryRoute, top ? { entity: top } : {})],
    review: hasRecords ? [req(['inspectRecord', 'edit'], 'Abrir um registro e conferir os dados. Corrigir somente se houver erro.', `/gastos?month=${month}`)] : [req(['statement'], 'Conferir que ainda não há registros; não invente uma compra', `/gastos?month=${month}`)],
    search: [req(['search'], 'Buscar uma descrição ou categoria no Extrato', `/gastos?month=${month}`)],
    income: [req(['typeFilter'], 'Filtrar Entradas e conferir somente valores recebidos', `/gastos?month=${month}&type=receita`, { entity: 'receita' })],
    configure: [req(['saveCategories'], 'Revisar e salvar as categorias rápidas', '/perfil')],
    incomeConfig: [req(['manageIncome'], 'Abrir Entradas em Minhas categorias', '/perfil')],
    expenseConfig: [req(['manageExpense'], 'Abrir Despesas em Minhas categorias', '/perfil')],
    limit: [limit],
    limits: [req(['viewLimits'], 'Consultar Meus limites', '/orcamentos')],
    inspectLimit: hasLimit ? [req(['inspectLimit'], 'Abrir Ajustar e comparar gasto com limite', '/orcamentos')] : [limit],
    adjust: hasLimit ? [req(['inspectLimit', 'updateLimit'], 'Revisar um limite existente e ajustar só se os dados pedirem', '/orcamentos')] : [limit],
    twoLimits: [req(['saveLimit', 'inspectLimit'], `Definir ou revisar ${limitTarget} categoria(s) relevante(s) em Meus limites`, '/orcamentos', { count: limitTarget, distinct: true })],
    goal: [goal],
    goalDetails: hasGoal ? [req(['inspectGoal'], 'Abrir Detalhes e conferir valor, prazo e progresso', '/metas')] : [goal, req(['inspectGoal'], 'Depois de criar, abrir Detalhes da meta', '/metas')],
    contribution: [...(hasGoal ? [] : [goal]), req(['contribution', 'planContribution'], 'Abrir Guardar e avaliar a disponibilidade. Aportar só se couber; pode fechar sem reservar.', '/metas')],
    calendar: [req(['calendar'], 'Selecionar um dia no calendário do mês', `/dashboard?month=${month}`)],
    days: [req(['calendar'], 'Consultar dois dias diferentes do mês', `/dashboard?month=${month}`, { count: 2, distinct: true })],
    periods: [req(['month'], 'Consultar dois meses diferentes pelo seletor; períodos vazios também contam', '/dashboard', { count: 2, distinct: true })],
  };
  return BANK[normalized][index].map((spec, position) => {
    const [titulo, ...keys] = spec.split('|');
    const requirements = keys.flatMap((key) => kinds[key]);
    if (keys.includes('category') && keys.some((key) => ['limit', 'inspectLimit', 'adjust'].includes(key))) {
      requirements.forEach((rule) => { if (rule.actions.some((action) => ['categoryFilter', 'saveLimit', 'inspectLimit', 'updateLimit'].includes(action))) rule.group = 'category-limit'; });
    }
    const templateId = `${normalized}-${String(index + 1).padStart(2, '0')}-${position + 1}`;
    return { id: `journey-v2-${templateId}_${month}`, templateId, titulo, descricao: requirements.map((item) => item.label).join('. '), requirements, theme: MONTHLY_THEMES[index], contextCategory: keys.includes('top') ? top : undefined, xp: (normalized === 'explorer' ? 20 : normalized === 'equilibrado' ? 25 : 30) + position * 5, perfil: normalized, mes: month, concluido: false, nivelMinimo: 1, categoria: requirements[0].route, validacao: 'practice' };
  });
}

export function missionProgress(challenge: Challenge, state: MissionState) {
  if (challenge.requirements) {
    const steps = practiceProgress(challenge.requirements, state, -1, challenge.mes);
    return { current: challenge.started ? steps.reduce((sum, item) => sum + item.current, 0) : 0, target: steps.reduce((sum, item) => sum + item.target, 0) };
  }
  // Compatibility for archived v1 missions; the new generator never issues these again.
  const thisMonth = (date?: string) => date?.slice(0, 7) === challenge.mes;
  const expenses = state.transactions.filter((item) => item.tipo === 'despesa' && thisMonth(item.data));
  let current = 0;
  let target = 1;
  switch (challenge.validacao) {
    case 'categories': target = 2; current = new Set(expenses.map((item) => item.categoria)).size; break;
    case 'learn': target = 2; current = new Set([...state.lessonProgress.filter((item) => item.concluido && thisMonth(item.concluidoEm)).map((item) => item.lessonId), ...Object.entries(state.lessonReviews ?? {}).filter(([, date]) => thisMonth(date)).map(([id]) => id)]).size; break;
    case 'budget': current = Number(thisMonth(state.learningActions?.budget) && state.budgets.some((item) => item.limite > 0)); break;
    case 'goal': current = Number(thisMonth(state.learningActions?.goal) && state.goals.length > 0); break;
    case 'review': current = Number(thisMonth(state.learningActions?.filter)); break;
  }
  return { current: Math.min(current, target), target };
}
