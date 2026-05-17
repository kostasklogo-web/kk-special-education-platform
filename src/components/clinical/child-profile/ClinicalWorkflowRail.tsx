"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, FileText, Target } from "lucide-react";
import type { ClinicalProfileTab } from "@/lib/clinical/child-profile/types";
import {
  buildClinicalGoalsHref,
  buildClinicalReportsHref,
  buildClinicalScheduleHref,
  buildClinicalSessionNotesHref,
} from "@/lib/clinical/child-profile/links";

type Step = {
  id: ClinicalProfileTab | "sessions";
  label: string;
  href: string;
  icon: typeof Target;
  count?: number;
};

export function ClinicalWorkflowRail({
  childId,
  counts,
  onNavigate,
}: {
  childId: string;
  counts: { goals: number; sessionNotes: number; reports: number };
  onNavigate?: (tab: ClinicalProfileTab) => void;
}) {
  const steps: Step[] = [
    { id: "goals", label: "Στόχοι", href: buildClinicalGoalsHref(childId), icon: Target, count: counts.goals },
    {
      id: "sessions",
      label: "Συνεδρίες",
      href: buildClinicalScheduleHref(childId),
      icon: CalendarDays,
    },
    {
      id: "notes",
      label: "Σημειώσεις",
      href: buildClinicalSessionNotesHref(childId),
      icon: FileText,
      count: counts.sessionNotes,
    },
    {
      id: "reports",
      label: "Αναφορές",
      href: buildClinicalReportsHref(childId),
      icon: BarChart3,
      count: counts.reports,
    },
  ];

  const tabIds = new Set<ClinicalProfileTab>(["goals", "notes", "reports"]);

  return (
    <nav aria-label="Κλινική ροή εργασίας" className="rounded-xl border border-clinical-100 bg-clinical-50/40 p-3">
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-clinical-800">
        Γρήγορη πρόσβαση — κλινική εργασία
      </p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const useTab = onNavigate && tabIds.has(step.id as ClinicalProfileTab);
          const inner = (
            <>
              <Icon className="mb-1.5 h-5 w-5 text-clinical-700" aria-hidden />
              <span className="text-xs font-bold text-ink">{step.label}</span>
              {typeof step.count === "number" ? (
                <span className="mt-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                  {step.count}
                </span>
              ) : null}
            </>
          );
          return (
            <li key={step.id}>
              {useTab ? (
                <button
                  type="button"
                  onClick={() => onNavigate(step.id as ClinicalProfileTab)}
                  className="flex min-h-[72px] w-full flex-col items-center justify-center rounded-xl border border-white/80 bg-white px-2 py-3 text-center shadow-sm transition hover:border-clinical-200 hover:shadow"
                >
                  {inner}
                </button>
              ) : (
                <Link
                  href={step.href}
                  className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border border-white/80 bg-white px-2 py-3 text-center shadow-sm transition hover:border-clinical-200 hover:shadow"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
