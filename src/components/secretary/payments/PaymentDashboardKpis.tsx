import type { PaymentDashboardMetrics } from "@/lib/secretary/payments/calculations";
import { AlertBadge } from "@/components/secretary/AlertBadge";

type Props = {
  metrics: PaymentDashboardMetrics;
};

export function PaymentDashboardKpis({ metrics }: Props) {
  const cards = [
    {
      label: "Αναμενόμενα (μήνας)",
      value: `${metrics.expectedThisMonth}€`,
      helper: "Σύνολο χρεώσεων",
      level: "green" as const,
    },
    {
      label: "Εισπράξεις (μήνας)",
      value: `${metrics.collectedThisMonth}€`,
      helper: "Συλλέχθηκαν",
      level: "green" as const,
    },
    {
      label: "Cash flow %",
      value: `${metrics.cashFlowPct}%`,
      helper: "Εισπράξεις / αναμενόμενα",
      level:
        metrics.cashFlowPct >= 80
          ? ("green" as const)
          : metrics.cashFlowPct >= 50
            ? ("yellow" as const)
            : ("red" as const),
    },
    {
      label: "Ανεξόφλητα",
      value: `${metrics.unpaidTotal}€`,
      helper: "Συνολικό υπόλοιπο",
      level: metrics.unpaidTotal > 0 ? ("yellow" as const) : ("green" as const),
    },
    {
      label: "Καθυστερημένα",
      value: `${metrics.overdueTotal}€`,
      helper: "Μετά τη λήξη",
      level: metrics.overdueTotal > 0 ? ("red" as const) : ("green" as const),
    },
    {
      label: "Λήγουν σε 7 ημέρες",
      value: metrics.dueIn7Days,
      helper: "Χρεώσεις με υπόλοιπο",
      level: metrics.dueIn7Days > 0 ? ("yellow" as const) : ("green" as const),
    },
    {
      label: "Γονείς με καθυστέρηση",
      value: metrics.overdueParentCount,
      helper: "Μοναδικές επαφές",
      level: metrics.overdueParentCount > 0 ? ("red" as const) : ("green" as const),
    },
    {
      label: "Διοίκηση / αναστολή",
      value: metrics.managementReviewCount,
      helper: "Χρειάζεται έλεγχο",
      level: metrics.managementReviewCount > 0 ? ("red" as const) : ("green" as const),
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-surface-card p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{c.label}</p>
            <AlertBadge level={c.level} />
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-ink">{c.value}</p>
          <p className="text-xs text-ink-faint">{c.helper}</p>
        </div>
      ))}
    </div>
  );
}
