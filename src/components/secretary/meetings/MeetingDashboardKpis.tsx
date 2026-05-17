"use client";

import { AlertBadge } from "@/components/secretary/AlertBadge";
import type { MeetingDashboardMetrics } from "@/lib/secretary/meetings/calculations";

export type MeetingQuickFilter =
  | "today"
  | "supervision"
  | "emergency"
  | "minutes"
  | "followup"
  | "completed_week"
  | "overdue"
  | "clinical"
  | "admin"
  | "clinical_risk"
  | "hr_risk"
  | "open_decisions"
  | null;

type Props = {
  metrics: MeetingDashboardMetrics;
  activeFilter: MeetingQuickFilter;
  onFilter: (f: MeetingQuickFilter) => void;
};

export function MeetingDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: MeetingQuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "today", label: "Σήμερα", value: metrics.today, helper: "Συναντήσεις", level: "yellow" },
    { key: "supervision", label: "Εποπτείες", value: metrics.upcomingSupervision, helper: "Προσεχείς", level: "yellow" },
    { key: "emergency", label: "Έκτακτες", value: metrics.pendingEmergency, helper: "Άμεση προτεραιότητα", level: "red" },
    { key: "minutes", label: "Πρακτικά", value: metrics.awaitingMinutes, helper: "Εκκρεμούν", level: "yellow" },
    { key: "followup", label: "Follow-up", value: metrics.pendingFollowUpTasks, helper: "Ενέργειες", level: "yellow" },
    { key: "completed_week", label: "Ολοκλ. εβδ.", value: metrics.completedThisWeek, helper: "Τελείωσαν", level: "green" },
    { key: "overdue", label: "Εκπρόθεσμα", value: metrics.overdueFollowUp, helper: "Follow-up", level: "red" },
    { key: "clinical", label: "Κλινικές", value: metrics.clinical, helper: "Ανοιχτές", level: "yellow" },
    { key: "admin", label: "Διοικητικές", value: metrics.administrative, helper: "Ανοιχτές", level: "yellow" },
    { key: "clinical_risk", label: "Κλιν. κίνδυνος", value: metrics.clinicalRisk, helper: "Σημαία", level: "red" },
    { key: "hr_risk", label: "HR κίνδυνος", value: metrics.hrRisk, helper: "Σημαία", level: "red" },
    { key: "open_decisions", label: "Αποφάσεις", value: metrics.openDecisions, helper: "Ανοιχτές", level: "yellow" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onFilter(activeFilter === c.key ? null : c.key)}
          className={`rounded-lg border p-3 text-left shadow-sm transition ${
            activeFilter === c.key
              ? "border-clinical-600 ring-2 ring-clinical-500/30"
              : "border-border bg-surface-card hover:bg-surface-muted/40"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{c.label}</p>
            <AlertBadge level={c.level} />
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-ink">{c.value}</p>
          <p className="text-xs text-ink-faint">{c.helper}</p>
        </button>
      ))}
    </div>
  );
}
