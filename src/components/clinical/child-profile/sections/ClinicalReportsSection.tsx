import Link from "next/link";
import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import { classifyReportKind } from "@/lib/clinical/child-profile/derive";
import { buildClinicalReportsHref } from "@/lib/clinical/child-profile/links";
import { progressReportStatusLabelEl } from "@/lib/ui/progress-report-labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalEmpty, ClinicalPanel } from "../clinical-ui";

const DRAFT_STATUSES = new Set(["draft", "pending", "pending_review"]);
const APPROVED_STATUSES = new Set(["approved", "published", "final"]);

export function ClinicalReportsSection({
  childId,
  reports,
}: {
  childId: string;
  reports: ProgressReportListItem[];
}) {
  const evaluationReports = reports.filter((r) => classifyReportKind(r) === "evaluation");
  const progressReports = reports.filter((r) => classifyReportKind(r) === "progress");
  const drafts = reports.filter((r) => DRAFT_STATUSES.has(r.status));
  const approved = reports.filter((r) => APPROVED_STATUSES.has(r.status));
  const historical = reports.filter(
    (r) => !DRAFT_STATUSES.has(r.status) && !APPROVED_STATUSES.has(r.status)
  );

  return (
    <section className="space-y-6">
      <p className="text-sm text-ink-muted">
        Κλινικές αναφορές — πρόχειρα, εγκεκριμένα και ιστορικό.{" "}
        <Link href={buildClinicalReportsHref(childId)} className="font-bold text-clinical-700 underline">
          Άνοιγμα module
        </Link>
      </p>
      <ReportGroup title="Αναφορές αξιολόγησης" items={evaluationReports} childId={childId} />
      <ReportGroup title="Αναφορές προόδου" items={progressReports} childId={childId} />
      <ReportGroup title="Πρόχεια" items={drafts} childId={childId} emptyLabel="Χωρίς πρόχειρα." />
      <ReportGroup title="Εγκεκριμένες" items={approved} childId={childId} emptyLabel="Χωρίς εγκεκριμένες." />
      <ReportGroup title="Ιστορικό" items={historical} childId={childId} emptyLabel="—" />
    </section>
  );
}

function ReportGroup({
  title,
  items,
  childId,
  emptyLabel = "—",
}: {
  title: string;
  items: ProgressReportListItem[];
  childId: string;
  emptyLabel?: string;
}) {
  return (
    <ClinicalPanel title={title}>
      {items.length === 0 ? (
        <ClinicalEmpty>{emptyLabel}</ClinicalEmpty>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{r.title}</p>
                {r.summary ? <p className="text-xs text-ink-muted line-clamp-2">{r.summary}</p> : null}
              </div>
              <div className="text-right text-xs text-ink-muted">
                <p>{progressReportStatusLabelEl(r.status)}</p>
                <p>{formatDateEl(r.updated_at.slice(0, 10))}</p>
                <Link href={buildClinicalReportsHref(childId)} className="font-bold text-clinical-700">
                  Άνοιγμα
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ClinicalPanel>
  );
}
