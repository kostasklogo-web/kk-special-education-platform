import Link from "next/link";
import { redirect } from "next/navigation";
import { ParentFormClient } from "@/components/parents/parent-form-client";
import { PageHeader } from "@/components/shell/PageHeader";
import { createParentAction } from "@/app/(shell)/parents/actions";
import { canMutateParents } from "@/lib/auth/parents-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getChildById, getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";

type NewParentPageProps = {
  searchParams: Promise<{ linkChildId?: string }>;
};

export default async function NewParentPage({ searchParams }: NewParentPageProps) {
  const ctx = await getSessionContext();
  if (!canMutateParents(ctx.roleCodes)) {
    redirect("/parents");
  }

  const sp = await searchParams;
  const linkChildId = sp.linkChildId?.trim() || null;

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Προσθήκη γονέα" description="Απαιτείται ενεργός οργανισμός." />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
        <Link href="/parents" className="mt-4 inline-block text-sm font-medium text-clinical-700">
          ← Επιστροφή
        </Link>
      </div>
    );
  }

  let linkNotice: string | null = null;
  if (linkChildId) {
    const { child } = await getChildById(linkChildId);
    if (!child || child.organization_id !== organizationId) {
      linkNotice = "Το παιδί δεν βρέθηκε ή ανήκει σε άλλο οργανισμό· η αυτόματη σύνδεση θα παραληφθεί.";
    }
  }

  return (
    <div>
      <PageHeader
        title="Προσθήκη γονέα / κηδεμόνα"
        description={
          linkChildId
            ? "Μετά την αποθήκευση, ο γονέας θα συνδεθεί με το επιλεγμένο παιδί με τη σχέση που ορίζετε."
            : "Καταχώριση νέου προφίλ γονέα στον οργανισμό σας."
        }
        actions={
          <Link
            href={linkChildId ? `/children/${linkChildId}` : "/parents"}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Ακύρωση
          </Link>
        }
      />
      {linkNotice ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {linkNotice}
        </div>
      ) : null}
      <ParentFormClient
        mode="create"
        action={createParentAction}
        organizationId={organizationId}
        linkChildId={linkNotice ? null : linkChildId}
      />
    </div>
  );
}
