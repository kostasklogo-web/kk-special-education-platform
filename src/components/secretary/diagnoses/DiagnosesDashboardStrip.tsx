"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useDiagnosisDocuments } from "./DiagnosesChargeProvider";
import { dashboardDiagnosisSummary } from "@/lib/secretary/diagnoses/diagnosis-queries";
import { AlertBadge } from "@/components/secretary/AlertBadge";

export function DiagnosesDashboardStrip() {
  const today = todayAthensYmd();
  const docs = useDiagnosisDocuments();
  const { metrics, dueToday } = dashboardDiagnosisSummary(docs, today);

  if (metrics.activeCount === 0 && metrics.expired === 0 && metrics.expiring30 === 0) {
    return null;
  }

  const cards = [
    {
      label: "Λήγουν 60 ημ.",
      value: metrics.expiring60,
      level: "yellow" as const,
      href: "/secretary/diagnoses",
      filter: "exp60",
    },
    {
      label: "Λήγουν 30 ημ.",
      value: metrics.expiring30,
      level: "yellow" as const,
      href: "/secretary/diagnoses",
      filter: "exp30",
    },
    {
      label: "Λήγουν 7 ημ.",
      value: metrics.expiring7,
      level: "red" as const,
      href: "/secretary/diagnoses",
      filter: "exp7",
    },
    {
      label: "Ληγμένα",
      value: metrics.expired,
      level: "red" as const,
      href: "/secretary/diagnoses",
      filter: "expired",
    },
    {
      label: "Follow-up ανανέωσης",
      value: metrics.renewalPending,
      level: metrics.renewalPending > 0 ? ("yellow" as const) : ("green" as const),
      href: "/secretary/diagnoses",
      filter: "renewal_pending",
    },
    {
      label: "Χωρίς αρχείο",
      value: metrics.missingFile,
      level: metrics.missingFile > 0 ? ("yellow" as const) : ("green" as const),
      href: "/secretary/diagnoses",
      filter: "missing_file",
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-sm font-bold text-ink">Γνωματεύσεις & λήξεις</h2>
            <p className="text-xs text-ink-muted">
              {dueToday.length > 0
                ? `${dueToday.length} χρειάζονται επικοινωνία/υπενθύμιση σήμερα`
                : `${metrics.activeCount} ενεργά έγγραφα σε παρακολούθηση`}
            </p>
          </div>
        </div>
        <Link
          href="/secretary/diagnoses"
          className="text-xs font-semibold text-clinical-700 hover:underline"
        >
          Διαχείριση →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={`${c.href}?quick=${c.filter}`}
            className="rounded-lg border border-border bg-white p-2.5 text-left transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-[10px] font-semibold uppercase leading-tight text-ink-muted">{c.label}</p>
              <AlertBadge level={c.level} />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-ink">{c.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
