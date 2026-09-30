import { BookOpen, Compass, Flag, Gem, Medal, Sprout, Target, TrendingUp } from 'lucide-react';
import type { AppState } from '@/types';

export type JourneyState = Pick<AppState, 'transactions' | 'goals' | 'budgets' | 'lessonProgress'>;
export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function getPracticeDays(state: JourneyState): Set<string> {
  return new Set([...state.transactions.map((t) => t.data), ...state.lessonProgress.filter((l) => l.concluido && l.concluidoEm).map((l) => l.concluidoEm!)]
    .filter((date) => Number.isFinite(new Date(date).getTime()))
    .map((date) => localDay(new Date(date))));
}
export function getAchievements(state: JourneyState) {
  const days = getPracticeDays(state).size;
  const lessons = state.lessonProgress.filter((l) => l.concluido).length;
  const categories = new Set(state.transactions.filter((t) => t.tipo === 'despesa').map((t) => t.categoria)).size;
  return [
    { id: 'first', title: 'Primeiro passo', description: 'Registre sua primeira transação.', icon: Sprout, current: Math.min(state.transactions.length, 1), target: 1, color: '#008755', background: '#e4f6ed' },
    { id: 'curious', title: 'Mente curiosa', description: 'Conclua 3 aulas com prática.', icon: BookOpen, current: Math.min(lessons, 3), target: 3, color: '#3268cc', background: '#eaf1ff' },
    { id: 'dream', title: 'Sonho no papel', description: 'Crie uma meta para você.', icon: Flag, current: Math.min(state.goals.length, 1), target: 1, color: '#a46d00', background: '#fff6dc' },
    { id: 'explore', title: 'Olhar atento', description: 'Registre gastos em 3 categorias.', icon: Compass, current: Math.min(categories, 3), target: 3, color: '#7c3aed', background: '#f1eaff' },
    { id: 'habit', title: 'Criando um hábito', description: 'Pratique em 7 dias diferentes.', icon: Medal, current: Math.min(days, 7), target: 7, color: '#008755', background: '#e4f6ed' },
    { id: 'goal', title: 'Eu consegui!', description: 'Alcance o valor de uma meta.', icon: Gem, current: state.goals.some((g) => g.valorAlvo > 0 && g.valorAtual >= g.valorAlvo) ? 1 : 0, target: 1, color: '#a46d00', background: '#fff6dc' },
  ];
}
export function getSkills(state: JourneyState) {
  return [
    { title: 'Entender meu dinheiro', detail: '5 movimentações registradas', icon: Compass, current: Math.min(5, state.transactions.length), target: 5, color: '#008755' },
    { title: 'Aprender na prática', detail: '3 aulas concluídas', icon: BookOpen, current: Math.min(3, state.lessonProgress.filter((l) => l.concluido).length), target: 3, color: '#3268cc' },
    { title: 'Planejar um objetivo', detail: 'Uma meta e um limite definidos', icon: Target, current: Number(state.goals.length > 0) + Number(state.budgets.length > 0), target: 2, color: '#a46d00' },
    { title: 'Construir consistência', detail: 'Prática em 7 dias diferentes', icon: TrendingUp, current: Math.min(7, getPracticeDays(state).size), target: 7, color: '#7c3aed' },
  ];
}
