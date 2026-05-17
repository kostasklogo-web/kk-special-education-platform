import type { CommunicationDashboardMetrics } from "@/lib/secretary/communications/calculations";
import { AlertBadge } from "@/components/secretary/AlertBadge";

type QuickFilter =
  | "today"
  | "open_followups"
  | "waiting_response"
  | "parent"
  | "school"
  | "doctor"
  | "urgent"
  | "overdue"
  | "completed_week"
  | null;

type Props = {
  metrics: CommunicationDashboardMetrics;
  activeFilter: QuickFilter;
  onFilter: (f: QuickFilter) => void;
};

export function CommunicationDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: QuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "today", label: "Σήμερα", value: metrics.today, helper: "Επικοινωνίες", level: metrics.today > 0 ? "yellow" : "green" },
    { key: "open_followups", label: "Ανοιχτά follow-up", value: metrics.openFollowUps, helper: "Ενεργές", level: metrics.openFollowUps > 0 ? "yellow" : "green" },
    { key: "waiting_response", label: "Αναμονή απάντησης", value: metrics.waitingResponse, helper: "Εκκρεμεί εξωτερική", level: metrics.waitingResponse > 0 ? "yellow" : "green" },
    { key: "parent", label: "Γονείς", value: metrics.parentComms, helper: "Συνολικά (φίλτρο)", level: "green" },
    { key: "school", label: "Σχολεία", value: metrics.schoolComms, helper: "Σχολεία / εκπαιδευτικοί", level: "green" },
    { key: "doctor", label: "Γιατροί", value: metrics.doctorComms, helper: "Εξωτερικοί", level: "green" },
    { key: "urgent", label: "Επείγουσες", value: metrics.urgent, helper: "Υψηλή προτεραιότητα", level: metrics.urgent > 0 ? "red" : "green" },
    { key: "overdue", label: "Εκπρόθεσμα follow-up", value: metrics.overdueFollowUps, helper: "Χρειάζονται άμεση ενέργεια", level: metrics.overdueFollowUps > 0 ? "red" : "green" },
    { key: "completed_week", label: "Ολοκληρώθηκαν (εβδ.)", value: metrics.completedThisWeek, helper: "Τρέχουσα εβδομάδα", level: "green" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
