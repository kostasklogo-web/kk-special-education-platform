import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardCheck, FileText, Target, type LucideIcon } from "lucide-react";
import { buildAttendanceHref } from "@/lib/attendance/search-params";
import { buildReportsHref } from "@/lib/progress-reports/search-params";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { buildScheduleHref } from "@/lib/schedule/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";
import { buildTherapyGoalsHref } from "@/lib/therapy-goals/search-params";

type Step = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
};

export function ChildWorkflowTimeline({
  childId,
  counts,
}: {
  childId: string;
  counts: { goals: number; sessions: number; sessionNotes: number; reports: number };
}) {
  const ymd = todayAthensYmd();
  const steps: Step[] = [
    {
      id: "goals",
      label: "Στόχοι",
      href: buildTherapyGoalsHref({ childId }),
      icon: Target,
      count: counts.goals,
    },
    {
      id: "sessions",
      label: "Συνεδρίες",
      href: buildScheduleHref({ view: "list", dateYmd: ymd, filters: { childId } }),
      icon: CalendarDays,
    },
    {
      id: "attendance",
      label: "Παρουσίες",
      href: buildAttendanceHref({ view: "day", dateYmd: ymd, filters: { childId } }),
      icon: ClipboardCheck,
    },
    {
      id: "notes",
      label: "Σημειώσεις",
      href: buildSessionNotesHref({ dateYmd: ymd, filters: { childId } }),
      icon: FileText,
      count: counts.sessionNotes,
    },
    {
      id: "reports",
      label: "Αναφορές",
      href: buildReportsHref({ childId }),
      icon: BarChart3,
      count: counts.reports,
    },
  ];

  return (
    <nav aria-label="Ροή εργασιών φακέλου" className="relative">
      <div className="absolute left-4 right-4 top-5 hidden h-0.5 bg-gradient-to-r from-clinical-100 via-clinical-200 to-clinical-100 sm:block" aria-hidden />
      <ol className="relative grid gap-2 sm:grid-cols-5 sm:gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.id} className="relative flex flex-col items-stretch text-center sm:items-center">
              <Link
                href={step.href}
                className="group flex min-h-[44px] flex-col items-center justify-center rounded-2xl border border-transparent px-2 py-3 transition hover:border-clinical-100 hover:bg-clinical-50/40 sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
              >
                <span className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-clinical-200 bg-white text-clinical-800 shadow-sm ring-4 ring-white sm:h-11 sm:w-11">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-xs font-semibold text-clinical-800 group-hover:underline sm:text-[13px]">{step.label}</span>
                {typeof step.count === "number" ? (
                  <span className="mt-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-ink-muted">
                    {step.count}
                  </span>
                ) : null}
              </Link>
              {i < steps.length - 1 ? (
                <span className="my-1 block h-px w-full max-w-[8rem] self-center bg-border sm:hidden" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
