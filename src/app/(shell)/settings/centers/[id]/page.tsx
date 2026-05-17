import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessSettingsAndCentersModule,
  canManageCenters,
} from "@/lib/auth/settings-centers-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { roleLabelEl } from "@/lib/auth/roles";
import type { RoleCode } from "@/lib/auth/roles";
import {
  getCenterById,
  listRoomsForCenter,
  listStaffForPrimaryCenter,
} from "@/lib/data/centers/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { centerStatusLabelEl } from "@/lib/ui/center-labels";
import { roomStatusLabelEl } from "@/lib/ui/room-labels";

type CenterDetailPageProps = {
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

export default async function CenterDetailPage({ params }: CenterDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessSettingsAndCentersModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { center, error } = await getCenterById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή κέντρου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!center) {
    notFound();
  }

  const canEdit = canManageCenters(ctx.roleCodes);

  const [roomsRes, staffRes] = await Promise.all([
    listRoomsForCenter(center.id),
    listStaffForPrimaryCenter({ organizationId: center.organization_id, centerId: center.id }),
  ]);

  return (
    <div>
      <PageHeader
        title="Προβολή κέντρου"
        description={center.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/settings/centers"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
            {canEdit ? (
              <Link
                href={`/settings/centers/${center.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
          </div>
        }
      />

      <dl className="mx-auto mb-8 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailBlock label="Όνομα κέντρου" value={center.name} />
        <DetailBlock
          label="Διεύθυνση"
          value={center.address_line?.trim() ? center.address_line : "—"}
          multiline
        />
        <DetailBlock label="Πόλη" value={center.city.trim() ? center.city : "—"} />
        <DetailBlock label="Τηλέφωνο" value={center.phone?.trim() ? center.phone : "—"} />
        <DetailBlock label="Email" value={center.contact_email.trim() ? center.contact_email : "—"} />
        <DetailBlock
          label="Περιγραφή"
          value={center.description.trim() ? center.description : "—"}
          multiline
        />
        <DetailBlock label="Ζώνη ώρας" value={center.timezone} />
        <DetailBlock label="Κατάσταση" value={centerStatusLabelEl(center.is_active)} />
      </dl>

      <section className="mx-auto mb-8 max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <h2 className="text-base font-semibold text-ink">Συνδεδεμένες αίθουσες</h2>
        <p className="mt-1 text-xs text-ink-muted">Αίθουσες που ανήκουν σε αυτό το κέντρο (module Αίθουσες).</p>
        {roomsRes.error ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {roomsRes.error}
          </p>
        ) : roomsRes.items.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Δεν υπάρχουν αίθουσες.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {roomsRes.items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <Link href={`/rooms/${r.id}`} className="font-medium text-clinical-700 hover:underline">
                  {r.name}
                </Link>
                <span className="text-xs text-ink-muted">
                  {r.room_code.trim() ? `${r.room_code} · ` : ""}
                  {roomStatusLabelEl(r.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <h2 className="text-base font-semibold text-ink">Προσωπικό με κύριο κέντρο εδώ</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Μέλη προσωπικού με πεδίο «κύριο κέντρο» = αυτό το κέντρο (MVP).
        </p>
        {staffRes.error ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {staffRes.error}
          </p>
        ) : staffRes.items.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Δεν υπάρχουν εγγραφές.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {staffRes.items.map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <Link href={`/staff/${s.id}`} className="font-medium text-clinical-700 hover:underline">
                  {`${s.first_name} ${s.last_name}`.trim() || "—"}
                </Link>
                {s.role_code ? (
                  <span className="text-ink-muted"> · {roleLabelEl(s.role_code as RoleCode)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
