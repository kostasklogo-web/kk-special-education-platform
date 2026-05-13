import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChildFormClient } from "@/components/children/child-form-client";
import { PageHeader } from "@/components/shell/PageHeader";
import { updateChildAction } from "@/app/(shell)/children/actions";
import { canAccessChildForms } from "@/lib/auth/children-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  getChildWithCenter,
  listCentersForOrganization,
} from "@/lib/data/children/queries";

type EditChildPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditChildPage({ params }: EditChildPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessChildForms(ctx.roleCodes)) {
    redirect(`/children/${id}`);
  }

  const { item, error } = await getChildWithCenter(id);
  if (error || !item) {
    notFound();
  }

  const { centers, error: cErr } = await listCentersForOrganization(item.organization_id);

  return (
    <div>
      <PageHeader
        title="Επεξεργασία παιδιού"
        description={`${item.first_name} ${item.last_name} · Ο οργανισμός δεν αλλάζει από αυτή τη φόρμα.`}
        actions={
          <Link
            href={`/children/${id}`}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Ακύρωση
          </Link>
        }
      />
      {cErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {cErr}
        </div>
      ) : null}
      <ChildFormClient
        mode="edit"
        action={updateChildAction}
        organizationId={item.organization_id}
        centers={centers}
        defaultValues={{
          childId: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          date_of_birth: item.date_of_birth,
          gender: item.gender,
          primary_center_id: item.primary_center_id,
          enrollment_start_date: item.enrollment_start_date,
          status: item.status,
          preferred_language: item.preferred_language,
          school_name: item.school_name,
          school_grade: item.school_grade,
          notes: item.notes,
        }}
      />
    </div>
  );
}
