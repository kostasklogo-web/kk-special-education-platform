"use client";

import type { ReportDashboardMetrics } from "@/lib/secretary/reports/calculations";
import { AlertBadge } from "@/components/secretary/AlertBadge";

export type ReportQuickFilter =
  | "open"
  | "due_week"
  | "overdue"
  | "awaiting_therapist"
  | "awaiting_supervisor"
  | "awaiting_cd"
  | "ready"
  | "delivered_month"
  | "urgent"
  | null;

type Props = {
  metrics: ReportDashboardMetrics;
  activeFilter: ReportQuickFilter;
  onFilter: (f: ReportQuickFilter) => void;
};

export function ReportDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: ReportQuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "open", label: "Ανοιχτά αιτήματα", value: metrics.openTotal, helper: "Σε εξέλιξη", level: "yellow" },
    { key: "due_week", label: "Προθεσμία εβδομάδας", value: metrics.dueThisWeek, helper: "Λήγουν σύντομα", level: "yellow" },
    { key: "overdue", label: "Εκπρόθεσμα", value: metrics.overdue, helper: "Άμεση ενέργεια", level: "red" },
    {
      key: "awaiting_therapist",
      label: "Αναμονή θεραπευτή",
      value: metrics.awaitingTherapistDraft,
      helper: "Draft / σύνταξη",
      level: metrics.awaitingTherapistDraft > 0 ? "yellow" : "green",
    },
    {
      key: "awaiting_supervisor",
      label: "Έλεγχος επόπτη",
      value: metrics.awaitingSupervisorReview,
      helper: "Review ουρά",
      level: metrics.awaitingSupervisorReview > 0 ? "yellow" : "green",
    },
    {
      key: "awaiting_cd",
      label: "Έγκριση Κ.Δ.",
      value: metrics.awaitingClinicalDirector,
      helper: "Τελική έγκριση",
      level: metrics.awaitingClinicalDirector > 0 ? "yellow" : "green",
    },
    {
      key: "ready",
      label: "Έτοιμες παράδοσης",
      value: metrics.readyForDelivery,
      helper: "Προς αποστολή",
      level: "green",
    },
    {
      key: "delivered_month",
      label: "Παραδόθηκαν (μήνας)",
      value: metrics.deliveredThisMonth,
      helper: "Ολοκληρωμένες",
      level: "green",
    },
    {
      key: "urgent",
      label: "Επείγουσες",
      value: metrics.urgent,
      helper: "Υψηλή προτεραιότητα",
      level: metrics.urgent > 0 ? "red" : "green",
    },
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
