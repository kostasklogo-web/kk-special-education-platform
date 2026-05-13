import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { getTherapyGoalById, listTreatmentPlansForOrganization } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { TherapyGoalFormClient } from "@/components/therapy-goals/therapy-goal-form-client";
import { updateTherapyGoalAction } from "@/app/(shell)/therapy-goals/actions";

type EditTherapyGoalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTherapyGoalPage({ params }: EditTherapyGoalPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessTherapyGoalsModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canWriteTherapyGoals(ctx.roleCodes)) {
    redirect(`/therapy-goals/${id}`);
  }

  const { goal, error: gErr } = await getTherapyGoalById(id);
  if (gErr) {
    return (
      <div>
        <PageHeader title="Επεξεργασία στόχου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {gErr}
        </div>
      </div>
    );
  }
  if (!goal) {
    notFound();
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Επεξεργασία στόχου" />
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
        title="Επεξεργασία στόχου"
        description={goal.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/therapy-goals/${id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ακύρωση
            </Link>
            <Link
              href="/therapy-goals"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
          </div>
        }
      />

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      ) : null}

      <TherapyGoalFormClient
        mode="edit"
        action={updateTherapyGoalAction}
        organizationId={organizationId}
        childOptions={childrenRes.children}
        treatmentPlans={plansRes.plans}
        disciplines={disciplinesRes.disciplines}
        therapists={therapistsRes.therapists}
        goalId={goal.id}
        defaultValues={{
          child_id: goal.child_id,
          treatment_plan_id: goal.treatment_plan_id ?? "",
          discipline_code: goal.discipline_code,
          therapist_user_id: goal.therapist_user_id,
          title: goal.title,
          description: goal.description,
          success_criterion: goal.success_criterion,
          start_date: goal.start_date,
          target_completion_date: goal.target_completion_date,
          status: goal.status,
          priority: goal.priority,
          observations: goal.observations,
        }}
      />
    </div>
  );
}
