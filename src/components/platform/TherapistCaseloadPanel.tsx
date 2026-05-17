import Link from "next/link";
import type { TherapistCaseloadItem } from "@/lib/clinical/access/caseload-types";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";

export type { TherapistCaseloadItem };

type Props = {
  items: TherapistCaseloadItem[];
  isPrototype?: boolean;
};

export function TherapistCaseloadPanel({ items, isPrototype }: Props) {
  return (
    <section className="rounded-2xl border border-clinical-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-clinical-700">Κλινική caseload</p>
          <h2 className="text-lg font-bold text-ink">Τα παιδιά μου</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Μόνο παιδιά με <strong>ενεργή ανάθεση</strong> — όχι από ιστορικό συνεδριών.
          </p>
        </div>
        {isPrototype ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            Πρωτότυπο
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          Δεν έχετε ενεργές αναθέσεις. Ζητήστε ανάθεση από τον επόπτη.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60">
          {items.map((a) => (
            <li key={a.assignmentId} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
              <div>
                <p className="font-semibold text-ink">{a.childLabel}</p>
                <p className="text-xs text-ink-muted">
                  {a.disciplineLabel ?? "Ειδικότητα"} · από {a.startsAtLabel}
                </p>
              </div>
              <Link
                href={`/children/${a.childId}`}
                className="text-sm font-semibold text-clinical-700 hover:text-clinical-800"
              >
                Κλινικός φάκελος →
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isPrototype && items.length === 0 ? (
        <Link
          href={`/children/${DEMO_CLINICAL_CHILD_ID}`}
          className="mt-3 inline-flex text-sm font-semibold text-clinical-700"
        >
          Πρωτότυπο κλινικού προφίλ (demo) →
        </Link>
      ) : null}
    </section>
  );
}
