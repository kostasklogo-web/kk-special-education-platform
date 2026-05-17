import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessTherapyGoalsModule,
  canWriteTherapyGoals,
} from "@/lib/auth/therapy-goals-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getTherapyGoalListItemById } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { therapyGoalPriorityLabelEl, therapyGoalStatusLabelEl } from "@/lib/ui/therapy-goal-labels";
import { formatDateEl } from "@/lib/ui/child-labels";

type TherapyGoalDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className={`text-sm text-ink sm:col-span-2 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function TherapyGoalDetailPage({ params }: TherapyGoalDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessTherapyGoalsModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { item, error } = await getTherapyGoalListItemById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή στόχου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!item) {
    notFound();
  }

  const canWrite = canWriteTherapyGoals(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Προβολή στόχου"
        description={item.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/therapy-goals"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα στόχων
            </Link>
            <Link
              href={`/children/${item.child_id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Προφίλ παιδιού
            </Link>
            {canWrite ? (
              <Link
                href={`/therapy-goals/${item.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
          </div>
        }
      />

      <dl className="mx-auto max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailBlock label="Παιδί" value={item.child_name} />
        <DetailBlock label="Θεραπευτικό πλάνο" value={item.plan_title ?? "—"} />
        <DetailBlock label="Τομέας / Ειδικότητα" value={item.discipline_name_el ?? item.discipline_code} />
        <DetailBlock label="Υπεύθυνος θεραπευτής" value={item.therapist_name ?? "—"} />
        <DetailBlock label="Τίτλος στόχου" value={item.title} />
        <DetailBlock
          label="Περιγραφή στόχου"
          value={item.description?.trim() ? item.description : "—"}
          multiline
        />
        <DetailBlock
          label="Κριτήριο επιτυχίας"
          value={item.success_criterion.trim() ? item.success_criterion : "—"}
          multiline
        />
        <DetailBlock label="Ημερομηνία έναρξης" value={item.start_date ? formatDateEl(item.start_date) : "—"} />
        <DetailBlock
          label="Εκτιμώμενη ημερομηνία ολοκλήρωσης"
          value={item.target_completion_date ? formatDateEl(item.target_completion_date) : "—"}
        />
        <DetailBlock label="Κατάσταση" value={therapyGoalStatusLabelEl(item.status)} />
        <DetailBlock label="Προτεραιότητα" value={therapyGoalPriorityLabelEl(item.priority)} />
        <DetailBlock
          label="Παρατηρήσεις"
          value={item.observations.trim() ? item.observations : "—"}
          multiline
        />
        <DetailBlock
          label="Τελευταία ενημέρωση"
          value={new Intl.DateTimeFormat("el-GR", {
            timeZone: "Europe/Athens",
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(item.updated_at))}
        />
      </dl>
    </div>
  );
}
