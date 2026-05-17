import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { buildReportsHref } from "@/lib/progress-reports/search-params";
import { buildScheduleHref } from "@/lib/schedule/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";
import { buildTherapyGoalsHref } from "@/lib/therapy-goals/search-params";

export { buildReportsHref, buildScheduleHref, buildSessionNotesHref, buildTherapyGoalsHref };

export function buildClinicalReportsHref(childId: string): string {
  return buildReportsHref({ childId });
}

export function buildClinicalGoalsHref(childId: string, goalId?: string): string {
  if (goalId) return `/therapy-goals/${goalId}`;
  return buildTherapyGoalsHref({ childId });
}

export function buildClinicalSessionNotesHref(childId: string, noteId?: string): string {
  const base = buildSessionNotesHref({
    dateYmd: todayAthensYmd(),
    filters: { childId },
  });
  return noteId ? `${base}&note=${noteId}` : base;
}

export function buildClinicalScheduleHref(childId: string): string {
  return buildScheduleHref({
    view: "list",
    dateYmd: todayAthensYmd(),
    filters: { childId },
  });
}

export function secretaryChildContextHref(childId: string): string {
  return `/secretary/schedule?child=${encodeURIComponent(childId)}`;
}
