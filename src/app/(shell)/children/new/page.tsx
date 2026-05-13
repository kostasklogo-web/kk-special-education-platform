import Link from "next/link";
import { redirect } from "next/navigation";
import { ChildFormClient } from "@/components/children/child-form-client";
import { PageHeader } from "@/components/shell/PageHeader";
import { createChildAction } from "@/app/(shell)/children/actions";
import { canAccessChildForms } from "@/lib/auth/children-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  getDefaultOrganizationIdForUser,
  listCentersForOrganization,
} from "@/lib/data/children/queries";

export default async function NewChildPage() {
  const ctx = await getSessionContext();
  if (!canAccessChildForms(ctx.roleCodes)) {
    redirect("/children");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          title="Προσθήκη παιδιού"
          description="Απαιτείται ενεργή συμμετοχή σε οργανισμό για τη δημιουργία εγγραφής."
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          {orgErr ?? "Δεν βρέθηκε οργανισμός για το λογαριασμό σας. Επικοινωνήστε με τη διοίκηση."}
        </div>
        <Link href="/children" className="mt-4 inline-block text-sm font-medium text-clinical-700">
          ← Επιστροφή στη λίστα
        </Link>
      </div>
    );
  }

  const { centers, error: cErr } = await listCentersForOrganization(organizationId);

  return (
    <div>
      <PageHeader
        title="Προσθήκη παιδιού"
        description="Συμπληρώστε τα βασικά στοιχεία. Τα δεδομένα αποθηκεύονται απευθείας στη βάση· η πρόσβαση ελέγχεται από RLS."
        actions={
          <Link
            href="/children"
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
      <ChildFormClient mode="create" action={createChildAction} organizationId={organizationId} centers={centers} />
    </div>
  );
}
