import type { TaskDashboardMetrics } from "@/lib/secretary/tasks/calculations";
import { AlertBadge } from "@/components/secretary/AlertBadge";

type QuickFilter =
  | "open"
  | "due_today"
  | "overdue"
  | "urgent"
  | "waiting_response"
  | "completed_week"
  | "report"
  | "payment"
  | "diagnosis"
  | "school_doctor"
  | null;

type Props = {
  metrics: TaskDashboardMetrics;
  activeFilter: QuickFilter;
  onFilter: (f: QuickFilter) => void;
};

export function TaskDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: QuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "open", label: "Ανοιχτές", value: metrics.open, helper: "Ενεργές", level: "green" },
    { key: "due_today", label: "Σήμερα", value: metrics.dueToday, helper: "Προθεσμία σήμερα", level: metrics.dueToday > 0 ? "yellow" : "green" },
    { key: "overdue", label: "Εκπρόθεσμες", value: metrics.overdue, helper: "Χρειάζονται άμεση ενέργεια", level: metrics.overdue > 0 ? "red" : "green" },
    { key: "urgent", label: "Επείγουσες", value: metrics.urgent, helper: "Υψηλή προτεραιότητα", level: metrics.urgent > 0 ? "red" : "green" },
    { key: "waiting_response", label: "Αναμονή απάντησης", value: metrics.waitingResponse, helper: "Εκκρεμεί εξωτερική", level: metrics.waitingResponse > 0 ? "yellow" : "green" },
    { key: "completed_week", label: "Ολοκληρώθηκαν (εβδ.)", value: metrics.completedThisWeek, helper: "Τρέχουσα εβδομάδα", level: "green" },
    { key: "report", label: "Αναφορές", value: metrics.reportRelated, helper: "Σχετικές εργασίες", level: metrics.reportRelated > 0 ? "yellow" : "green" },
    { key: "payment", label: "Πληρωμές", value: metrics.paymentRelated, helper: "Follow-up οφειλών", level: metrics.paymentRelated > 0 ? "red" : "green" },
    { key: "diagnosis", label: "Διαγνώσεις", value: metrics.diagnosisRelated, helper: "Ανανέωση", level: metrics.diagnosisRelated > 0 ? "yellow" : "green" },
    { key: "school_doctor", label: "Σχολείο / γιατρός", value: metrics.schoolDoctorComm, helper: "Επικοινωνίες", level: metrics.schoolDoctorComm > 0 ? "yellow" : "green" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <button
          key={c.key ?? "none"}
          type="button"
          onClick={() => onFilter(activeFilter === c.key ? null : c.key)}
          className={`rounded-lg border bg-surface-card p-3 text-left shadow-sm transition ${
            activeFilter === c.key ? "border-clinical-600 ring-2 ring-clinical-200" : "border-border hover:bg-surface-muted/40"
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
