import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessTherapyGoalsModule,
  canWriteTherapyGoals,
} from "@/lib/auth/therapy-goals-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import {
  listChildrenOptionsForOrganization,
  listDisciplines,
  listTherapistsForOrganization,
} from "@/lib/data/sessions/queries";
import { listTreatmentPlansForOrganization } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { TherapyGoalFormClient } from "@/components/therapy-goals/therapy-goal-form-client";
import { createTherapyGoalAction } from "@/app/(shell)/therapy-goals/actions";

type NewTherapyGoalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function NewTherapyGoalPage({ searchParams }: NewTherapyGoalPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessTherapyGoalsModule(ctx.roleCodes)) {
    redirect("/");
  }
  if (!canWriteTherapyGoals(ctx.roleCodes)) {
    redirect("/therapy-goals");
  }

  const raw = await searchParams;
  const preChild = firstString(raw.child);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέος θεραπευτικός στόχος" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const [childrenRes, plansRes, disciplinesRes, therapistsRes] = await Promise.all([
    listChildrenOptionsForOrganization(organizationId),
    listTreatmentPlansForOrganization(organizationId),
    listDisciplines(),
    listTherapistsForOrganization(organizationId),
  ]);

  const loadErr =
    childrenRes.error ?? plansRes.error ?? disciplinesRes.error ?? therapistsRes.error;

  return (
    <div>
      <PageHeader
        title="Νέος θεραπευτικός στόχος"
        description="Ο στόχος συνδέεται με παιδί και θεραπευτικό πλάνο. Απαιτείται υπάρχον πλάνο για το παιδί."
        actions={
          <Link
            href="/therapy-goals"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Λίστα στόχων
          </Link>
        }
      />

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      ) : null}

      <TherapyGoalFormClient
        mode="create"
        action={createTherapyGoalAction}
        organizationId={organizationId}
        childOptions={childrenRes.children}
        treatmentPlans={plansRes.plans}
        disciplines={disciplinesRes.disciplines}
        therapists={therapistsRes.therapists}
        defaultValues={preChild ? { child_id: preChild } : undefined}
      />
    </div>
  );
}
