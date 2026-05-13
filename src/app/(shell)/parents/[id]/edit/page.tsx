import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ParentFormClient } from "@/components/parents/parent-form-client";
import { PageHeader } from "@/components/shell/PageHeader";
import { updateParentAction } from "@/app/(shell)/parents/actions";
import { canMutateParents } from "@/lib/auth/parents-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getParentById } from "@/lib/data/parents/queries";

type EditParentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditParentPage({ params }: EditParentPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canMutateParents(ctx.roleCodes)) {
    redirect(`/parents/${id}`);
  }

  const { parent, error } = await getParentById(id);
  if (error || !parent) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Επεξεργασία γονέα / κηδεμόνα"
        description={`${parent.first_name} ${parent.last_name}`}
        actions={
          <Link
            href={`/parents/${id}`}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Ακύρωση
          </Link>
        }
      />
      <ParentFormClient
        mode="edit"
        action={updateParentAction}
        organizationId={parent.organization_id}
        defaultValues={{
          parentId: parent.id,
          first_name: parent.first_name,
          last_name: parent.last_name,
          phone: parent.phone,
          email: parent.email,
          address_line: parent.address_line,
          notes: parent.notes,
        }}
      />
    </div>
  );
}
