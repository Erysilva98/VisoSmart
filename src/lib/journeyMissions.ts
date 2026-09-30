import type { AppState, Challenge, ProfileType, JourneyPreferences } from '@/types';

export function monthlyMissions(profile: ProfileType, month: string, focus: JourneyPreferences['focus'] = 'understand'): Challenge[] {
  const seeds = [
    { key: 'categories', titulo: 'Descubra seus tipos de gasto', descricao: 'Classifique gastos reais em duas categorias do mês. Use os que já aconteceram.', xp: 25, categoria: '/gastos' },
    { key: 'learn', titulo: 'Aprenda e coloque em perspectiva', descricao: 'Conclua ou revise duas etapas diferentes neste mês, respondendo às perguntas.', xp: 30, categoria: '/aprender' },
    { key: 'budget', titulo: 'Escolha um limite possível', descricao: 'Defina ou revise um limite de gasto neste mês.', xp: 25, categoria: '/orcamentos' },
    focus === 'save'
      ? { key: 'goal', titulo: 'Dê um próximo passo na sua meta', descricao: 'Crie uma meta ou ajuste o dinheiro reservado neste mês. Não precisa guardar um valor novo.', xp: 25, categoria: '/metas' }
      : { key: 'review', titulo: 'Investigue para onde foi', descricao: 'Use a busca, o filtro de categoria ou o filtro de tipo no Extrato deste mês.', xp: 25, categoria: '/gastos' },
  ];
  const order = profile === 'explorer' ? ['categories', 'learn', focus === 'save' ? 'goal' : 'review', 'budget'] : ['budget', focus === 'save' ? 'goal' : 'review', 'categories', 'learn'];
  return seeds.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)).map((item) => ({ ...item, id: `journey-${item.key}_${month}`, validacao: item.key, perfil: profile, mes: month, concluido: false, nivelMinimo: 1 }));
}
export function missionProgress(challenge: Challenge, state: Pick<AppState, 'transactions' | 'lessonProgress' | 'budgets' | 'goals' | 'learningActions' | 'lessonReviews'>) {
  const thisMonth = (date?: string) => date?.slice(0, 7) === challenge.mes;
  const expenses = state.transactions.filter((item) => item.tipo === 'despesa' && thisMonth(item.data));
  let current = 0;
  let target = 1;
  switch (challenge.validacao) {
    case 'categories': target = 2; current = new Set(expenses.map((item) => item.categoria)).size; break;
    case 'learn': target = 2; current = new Set([...state.lessonProgress.filter((item) => item.lessonId.startsWith('trail-') && item.concluido && thisMonth(item.concluidoEm)).map((item) => item.lessonId), ...Object.entries(state.lessonReviews ?? {}).filter(([id, date]) => id.startsWith('trail-') && thisMonth(date)).map(([id]) => id)]).size; break;
    case 'budget': current = Number(thisMonth(state.learningActions?.budget) && state.budgets.some((item) => item.categoria !== 'investimentos_economia' && item.limite > 0)); break;
    case 'goal': current = Number(thisMonth(state.learningActions?.goal) && state.goals.length > 0); break;
    case 'review': current = Number(thisMonth(state.learningActions?.filter)); break;
  }
  return { current: Math.min(current, target), target };
}
