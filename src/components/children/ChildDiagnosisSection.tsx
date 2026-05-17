"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Stethoscope } from "lucide-react";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { DiagnosisStatusBadge } from "@/components/secretary/diagnoses/DiagnosisStatusBadge";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";
import { formatDateEl } from "@/lib/ui/child-labels";
import type { DiagnosisDocument } from "@/lib/secretary/types";

type Props = { childId: string; childLabel: string };

export function ChildDiagnosisSection({ childId, childLabel }: Props) {
  const all = useDiagnosisDocuments();
  const forChild = useMemo(
    () => all.filter((d) => d.childId === childId && !d.archived).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)),
    [all, childId]
  );

  const active = forChild.filter((d) => !["renewed", "no_renewal_required"].includes(d.status));
  const expiring = forChild.filter((d) =>
    ["expiring_60", "expiring_30", "expiring_7", "renewal_in_progress"].includes(d.status)
  );
  const expired = forChild.filter((d) => d.status === "expired");

  if (forChild.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface-muted/20 p-4 text-center text-sm text-ink-muted">
        Δεν υπάρχουν καταχωρημένα διαγνωστικά έγγραφα.
        <Link href="/secretary/diagnoses" className="ml-1 font-semibold text-clinical-700 hover:underline">
          Προσθήκη →
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-lg font-bold text-ink">Γνωματεύσεις & έγγραφα</h2>
            <p className="text-xs text-ink-muted">
              {active.length} ενεργά · {expiring.length} λήγουν · {expired.length} ληγμένα
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/secretary/diagnoses?child=${encodeURIComponent(childLabel)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Διαχείριση →
          </Link>
        </div>
      </div>

      {expired.length > 0 ? (
        <DocGroup title="Ληγμένα" docs={expired} childId={childId} childLabel={childLabel} tone="red" />
      ) : null}
      {expiring.length > 0 ? (
        <DocGroup title="Λήγουν / ανανέωση" docs={expiring} childId={childId} childLabel={childLabel} tone="amber" />
      ) : null}
      <DocGroup title="Ενεργά έγγραφα" docs={active} childId={childId} childLabel={childLabel} tone="neutral" />

      <EntityLinkedTasksPanel link={{ kind: "child", childId }} />
    </section>
  );
}

function DocGroup({
  title,
  docs,
  childId,
  childLabel,
  tone,
}: {
  title: string;
  docs: DiagnosisDocument[];
  childId: string;
  childLabel: string;
  tone: "red" | "amber" | "neutral";
}) {
  const border =
    tone === "red" ? "border-red-200" : tone === "amber" ? "border-amber-200" : "border-border";
  return (
    <div className={`mb-4 rounded-lg border ${border} p-3`}>
      <p className="mb-2 text-xs font-semibold uppercase text-ink-muted">{title}</p>
      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{d.documentType}</p>
              <p className="text-xs text-ink-muted">
                Λήξη {formatDateEl(d.expiryDate)} · {d.daysUntilExpiry} ημέρες
              </p>
              {d.fileName ? (
                <p className="text-xs text-ink-faint">📎 {d.fileName}</p>
              ) : (
                <p className="text-xs text-amber-700">Χωρίς αρχείο</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <DiagnosisStatusBadge status={d.status} />
              <Link
                href={`/secretary/diagnoses?doc=${d.id}`}
                className="text-xs font-semibold text-clinical-700 hover:underline"
              >
                Λεπτομέρειες
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
