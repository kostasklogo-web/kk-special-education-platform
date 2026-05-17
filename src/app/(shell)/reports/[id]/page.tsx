import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessSessionNotesModule } from "@/lib/auth/session-notes-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getProgressReportById } from "@/lib/data/progress-reports/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatDateEl } from "@/lib/ui/child-labels";
import { progressReportStatusLabelEl } from "@/lib/ui/progress-report-labels";

type ReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { item, error } = await getProgressReportById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Αναφορά προόδου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!item) {
    notFound();
  }

  const period =
    item.period_start || item.period_end
      ? `${item.period_start ? formatDateEl(item.period_start) : "—"} → ${item.period_end ? formatDateEl(item.period_end) : "—"}`
      : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Αναφορά προόδου"
        title={item.title}
        description="Προβολή εγγραφής (MVP). Η επεξεργασία και η δημοσίευση προς γονείς θα συνδεθούν με ροή ελέγχου στη συνέχεια."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/reports"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα αναφορών
            </Link>
            <Link
              href={`/children/${item.child_id}`}
              className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Προφίλ παιδιού
            </Link>
          </div>
        }
      />

      <dl className="mx-auto max-w-2xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailRow label="Παιδί" value={item.child_name} />
        <DetailRow label="Κατάσταση" value={progressReportStatusLabelEl(item.status)} />
        <DetailRow label="Περίοδος αναφοράς" value={period} />
        <DetailRow label="Περίληψη" value={item.summary?.trim() ? item.summary : "—"} multiline />
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className={`text-sm text-ink sm:col-span-2 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}
