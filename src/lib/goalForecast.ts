import type { Goal } from '@/types';
import { localDayKey, parseDay } from './dateRange';

/** A planning estimate, without returns or automatic transfers. */
export function goalForecast(goal: Goal, now = new Date()) {
  const remainingCents = Math.max(0, Math.round(goal.valorAlvo * 100) - Math.round(goal.valorAtual * 100));
  let deadline = parseDay(goal.prazo?.slice(0, 10));
  if (!deadline && Number.isInteger(goal.meses) && goal.meses! > 0) {
    const created = new Date(goal.criadaEm);
    if (Number.isFinite(created.getTime())) {
      const end = new Date(created.getFullYear(), created.getMonth() + goal.meses!, 1, 12);
      const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
      deadline = new Date(end.getFullYear(), end.getMonth(), Math.min(created.getDate(), lastDay), 12);
    }
  }
  const deadlineKey = deadline ? localDayKey(deadline) : null;
  if (remainingCents === 0) return { status: 'complete' as const, remaining: 0, deadline: deadlineKey, contributions: 0, monthly: 0 };
  if (!deadline) return { status: 'unscheduled' as const, remaining: remainingCents / 100, deadline: null, contributions: 0, monthly: null };
  if (deadlineKey! < localDayKey(now)) return { status: 'overdue' as const, remaining: remainingCents / 100, deadline: deadlineKey, contributions: 0, monthly: null };
  const monthDifference = (deadline.getFullYear() - now.getFullYear()) * 12 + deadline.getMonth() - now.getMonth();
  const contributions = Math.max(1, monthDifference + (deadline.getDate() > now.getDate() ? 1 : 0));
  return { status: 'active' as const, remaining: remainingCents / 100, deadline: deadlineKey, contributions, monthly: Math.ceil(remainingCents / contributions) / 100 };
}
