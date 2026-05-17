import type { DiagnosisDashboardMetrics } from "@/lib/secretary/diagnoses/calculations";
import { AlertBadge } from "@/components/secretary/AlertBadge";

type QuickFilter =
  | "active"
  | "exp60"
  | "exp30"
  | "exp7"
  | "expired"
  | "renewal_pending"
  | "missing_file"
  | "multi"
  | "renewed_month"
  | null;

type Props = {
  metrics: DiagnosisDashboardMetrics;
  activeFilter: QuickFilter;
  onFilter: (f: QuickFilter) => void;
};

export function DiagnosisDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: QuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "active", label: "Ενεργά έγγραφα", value: metrics.activeCount, helper: "Σε παρακολούθηση", level: "green" },
    { key: "exp60", label: "Λήγουν 60 ημ.", value: metrics.expiring60, helper: "Προειδοποίηση", level: "yellow" },
    { key: "exp30", label: "Λήγουν 30 ημ.", value: metrics.expiring30, helper: "Εντονή προσοχή", level: "yellow" },
    { key: "exp7", label: "Λήγουν 7 ημ.", value: metrics.expiring7, helper: "Επείγον", level: "red" },
    { key: "expired", label: "Ληγμένα", value: metrics.expired, helper: "Άμεση ενέργεια", level: "red" },
    {
      key: "renewal_pending",
      label: "Follow-up ανανέωσης",
      value: metrics.renewalPending,
      helper: "Εκκρεμεί ενέργεια",
      level: metrics.renewalPending > 0 ? "yellow" : "green",
    },
    {
      key: "missing_file",
      label: "Χωρίς αρχείο",
      value: metrics.missingFile,
      helper: "Λείπει upload",
      level: metrics.missingFile > 0 ? "yellow" : "green",
    },
    {
      key: "multi",
      label: "Πολλαπλά έγγραφα",
      value: metrics.multiDocChildren,
      helper: "Παιδιά με >1",
      level: "green",
    },
    {
      key: "renewed_month",
      label: "Ανανεώθηκαν (μήνας)",
      value: metrics.renewedThisMonth,
      helper: "Ολοκληρωμένες",
      level: "green",
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
