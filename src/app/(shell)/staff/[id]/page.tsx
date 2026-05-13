import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessStaffModule,
  canWriteStaffRecord,
} from "@/lib/auth/staff-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { roleLabelEl } from "@/lib/auth/roles";
import {
  getProfileNamesByIds,
  getStaffById,
  listSessionsForStaffTherapist,
  listSupervisionForUser,
} from "@/lib/data/staff/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { employmentStatusLabelEl } from "@/lib/ui/staff-labels";
import { formatDateEl } from "@/lib/ui/child-labels";

type StaffDetailPageProps = {
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

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessStaffModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { item, error } = await getStaffById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προφίλ μέλους προσωπικού" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!item) {
    notFound();
  }

  const canWrite = canWriteStaffRecord(ctx.roleCodes);
  const fullName = `${item.first_name} ${item.last_name}`.trim() || "—";

  const supervisionRes = await listSupervisionForUser({
    organizationId: item.organization_id,
    userId: item.user_id,
  });
  const supIds = new Set<string>();
  for (const r of supervisionRes.rows) {
    supIds.add(r.supervisor_user_id);
    supIds.add(r.supervisee_user_id);
  }
  const { names: supNames, error: nameErr } = await getProfileNamesByIds([...supIds]);

  const sessionsRes = await listSessionsForStaffTherapist({
    organizationId: item.organization_id,
    therapistUserId: item.user_id,
  });

  return (
    <div>
      <PageHeader
        title="Προφίλ μέλους προσωπικού"
        description={fullName}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/staff"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
            {canWrite ? (
              <Link
                href={`/staff/${item.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
          </div>
        }
      />

      <dl className="mx-auto mb-8 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailBlock label="Όνομα" value={item.first_name.trim() ? item.first_name : "—"} />
        <DetailBlock label="Επώνυμο" value={item.last_name.trim() ? item.last_name : "—"} />
        <DetailBlock label="Email" value={item.work_email.trim() ? item.work_email : "—"} />
        <DetailBlock label="Τηλέφωνο" value={item.phone.trim() ? item.phone : "—"} />
        <DetailBlock label="Ρόλος" value={item.role_code ? roleLabelEl(item.role_code) : "—"} />
        <DetailBlock label="Κέντρο / Τοποθεσία" value={item.center_name ?? "—"} />
        <DetailBlock
          label="Ειδικότητα / Τομέας"
          value={item.discipline_name_el ?? item.discipline_code ?? "—"}
        />
        <DetailBlock label="Επόπτης" value={item.supervisor_name ?? "—"} />
        <DetailBlock label="Κατάσταση" value={employmentStatusLabelEl(item.employment_status)} />
        <DetailBlock label="Ημερομηνία έναρξης" value={item.hire_date ? formatDateEl(item.hire_date) : "—"} />
        <DetailBlock
          label="Παρατηρήσεις"
          value={item.observations.trim() ? item.observations : "—"}
          multiline
        />
      </dl>

      <section className="mx-auto mb-8 max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <h2 className="text-base font-semibold text-ink">Σχέση εποπτείας (επίσημη καταχώρηση)</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Συνδέσεις από τον πίνακα εποπτείας. Λεπτομερείς σημειώσεις εποπτείας θα προστεθούν σε επόμενη έκδοση.
        </p>
        {supervisionRes.error || nameErr ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {supervisionRes.error ?? nameErr}
          </p>
        ) : supervisionRes.rows.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Δεν υπάρχουν καταχωρημένες σχέσεις εποπτείας.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {supervisionRes.rows.map((r) => {
              const sup = supNames.get(r.supervisor_user_id) ?? r.supervisor_user_id;
              const sub = supNames.get(r.supervisee_user_id) ?? r.supervisee_user_id;
              return (
                <li key={r.id} className="rounded-lg border border-border px-3 py-2">
                  <span className="text-ink-muted">Επόπτης:</span> {sup}
                  <span className="mx-2 text-ink-muted">→</span>
                  <span className="text-ink-muted">Εποπτευόμενος:</span> {sub}
                  <span className="ml-2 text-xs text-ink-faint">
                    ({formatDateEl(r.starts_on)}
                    {r.ends_on ? ` — ${formatDateEl(r.ends_on)}` : ""})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-3xl rounded-xl border border-dashed border-border bg-surface-muted/20 p-6">
        <h2 className="text-base font-semibold text-ink">Επέκταση εποπτείας</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Σενάρια εβδομαδιαίας εποπτείας, αρχεία και βαθμολόγηση θα προστεθούν μετά το MVP (χωρίς αλλαγή στη βάση
          εδώ).
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <h2 className="text-base font-semibold text-ink">Ανατεθειμένες συνεδρίες (ως θεραπευτής)</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Εμφανίζονται μόνο για ρόλους με κλινική συνεδρία· εύρος ±14 ημέρες / +42 ημέρες από σήμερα (Αθήνα).
        </p>
        {sessionsRes.error ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {sessionsRes.error}
          </p>
        ) : sessionsRes.items.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Δεν βρέθηκαν συνεδρίες στο εύρος ή ο ρόλος δεν εφαρμόζεται.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {sessionsRes.items.map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <Link href={`/schedule/${s.id}`} className="font-medium text-clinical-700 hover:underline">
                  {new Intl.DateTimeFormat("el-GR", {
                    timeZone: "Europe/Athens",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(s.starts_at))}
                </Link>
                <span className="text-ink-muted"> · {s.child_name}</span>
                <span className="text-ink-muted"> · {s.discipline_name_el ?? s.discipline_code}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
