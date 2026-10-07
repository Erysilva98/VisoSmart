import type { ActivityRequirement, AppState } from '@/types';

export function practiceProgress(requirements: ActivityRequirement[], state: Pick<AppState, 'practiceEvents'>, since = -1, month?: string) {
  const matches = (requirement: ActivityRequirement) => (state.practiceEvents ?? []).filter((event) => event.sequence > since
      && (!month || event.month === month && event.at.slice(0, 7) === month)
      && requirement.actions.includes(event.action)
      && (!requirement.entity || event.entity === requirement.entity));
  return requirements.map((requirement) => {
    let events = matches(requirement);
    if (requirement.group) {
      const partners = requirements.filter((item) => item.group === requirement.group && item !== requirement);
      events = events.filter((event) => event.entity && partners.every((partner) => matches(partner).some((candidate) => candidate.entity === event.entity)));
    }
    const target = requirement.count ?? 1;
    const countEvents = (items: typeof events) => requirement.distinct ? new Set(items.map((event) => event.entity).filter(Boolean)).size : items.length;
    const count = requirement.sameMonth ? Math.max(0, ...[...new Set(events.map((event) => event.month))].map((period) => countEvents(events.filter((event) => event.month === period)))) : countEvents(events);
    return { ...requirement, current: Math.min(count, target), target };
  });
}

export function lessonPracticeProgress(lesson: { id: string; requirements?: ActivityRequirement[] }, state: Pick<AppState, 'practiceEvents' | 'lessonStarts'>) {
  const start = state.lessonStarts?.[lesson.id];
  return practiceProgress(lesson.requirements ?? [], start === undefined ? { practiceEvents: [] } : state, start);
}
