"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { canWriteTherapyGoals } from "@/lib/auth/therapy-goals-permissions";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getTherapyGoalById } from "@/lib/data/therapy-goals/queries";
import { createClient } from "@/lib/supabase/server";
import {
  formatTherapyGoalZodErrors,
  therapyGoalFormSchema,
} from "@/lib/validation/therapy-goal-form";

export type TherapyGoalFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: TherapyGoalFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

async function validatePlanMatchesChildAndOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  treatmentPlanId: string,
  childId: string,
  organizationId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("treatment_plans")
    .select("id, child_id, organization_id")
    .eq("id", treatmentPlanId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return "Το θεραπευτικό πλάνο δεν βρέθηκε.";
  }
  const p = data as { child_id: string; organization_id: string };
  if (p.child_id !== childId) {
    return "Το πλάνο δεν αντιστοιχεί στο επιλεγμένο παιδί.";
  }
  if (p.organization_id !== organizationId) {
    return "Το πλάνο δεν ανήκει στον οργανισμό.";
  }
  return null;
}

export async function createTherapyGoalAction(
  _prev: TherapyGoalFormState,
  formData: FormData
): Promise<TherapyGoalFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteTherapyGoals(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα δημιουργίας στόχου.", fieldErrors: {} };
  }

  const raw = {
    organization_id: gv(formData, "organization_id"),
    child_id: gv(formData, "child_id"),
    treatment_plan_id: gv(formData, "treatment_plan_id"),
    discipline_code: gv(formData, "discipline_code"),
    therapist_user_id: gv(formData, "therapist_user_id"),
    title: gv(formData, "title"),
    description: gv(formData, "description"),
    success_criterion: gv(formData, "success_criterion"),
    start_date: gv(formData, "start_date"),
    target_completion_date: gv(formData, "target_completion_date"),
    status: gv(formData, "status") || "active",
    priority: gv(formData, "priority") || "medium",
    observations: gv(formData, "observations"),
  };

  const parsed = therapyGoalFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatTherapyGoalZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const planErr = await validatePlanMatchesChildAndOrg(
    supabase,
    parsed.data.treatment_plan_id,
    parsed.data.child_id,
    parsed.data.organization_id
  );
  if (planErr) {
    return { ok: false, message: planErr, fieldErrors: {} };
  }

  const insertRow = {
    organization_id: parsed.data.organization_id,
    child_id: parsed.data.child_id,
    treatment_plan_id: parsed.data.treatment_plan_id,
    discipline_code: parsed.data.discipline_code,
    therapist_user_id: parsed.data.therapist_user_id,
    title: parsed.data.title,
    description: parsed.data.description,
    success_criterion: parsed.data.success_criterion,
    start_date: parsed.data.start_date,
    target_completion_date: parsed.data.target_completion_date,
    status: parsed.data.status,
    priority: parsed.data.priority,
    observations: parsed.data.observations,
  };

  const { data: created, error } = await supabase.from("therapy_goals").insert(insertRow).select("id").single();

  if (error) {
    console.error("createTherapyGoalAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δεδομένα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/therapy-goals");
  revalidatePath(`/children/${parsed.data.child_id}`);
  redirect(`/therapy-goals/${created.id}`);
}

export async function updateTherapyGoalAction(
  _prev: TherapyGoalFormState,
  formData: FormData
): Promise<TherapyGoalFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteTherapyGoals(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα επεξεργασίας στόχου.", fieldErrors: {} };
  }

  const goalId = gv(formData, "goal_id");
  if (!goalId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό στόχου." };
  }

  const { goal: existing, error: loadErr } = await getTherapyGoalById(goalId);
  if (loadErr || !existing) {
    return { ...initial, ok: false, message: "Ο στόχος δεν βρέθηκε." };
  }

  const raw = {
    organization_id: existing.organization_id,
    child_id: gv(formData, "child_id"),
    treatment_plan_id: gv(formData, "treatment_plan_id"),
    discipline_code: gv(formData, "discipline_code"),
    therapist_user_id: gv(formData, "therapist_user_id"),
    title: gv(formData, "title"),
    description: gv(formData, "description"),
    success_criterion: gv(formData, "success_criterion"),
    start_date: gv(formData, "start_date"),
    target_completion_date: gv(formData, "target_completion_date"),
    status: gv(formData, "status") || "active",
    priority: gv(formData, "priority") || "medium",
    observations: gv(formData, "observations"),
  };

  const parsed = therapyGoalFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatTherapyGoalZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const planErr = await validatePlanMatchesChildAndOrg(
    supabase,
    parsed.data.treatment_plan_id,
    parsed.data.child_id,
    parsed.data.organization_id
  );
  if (planErr) {
    return { ok: false, message: planErr, fieldErrors: {} };
  }

  const { error } = await supabase
    .from("therapy_goals")
    .update({
      child_id: parsed.data.child_id,
      treatment_plan_id: parsed.data.treatment_plan_id,
      discipline_code: parsed.data.discipline_code,
      therapist_user_id: parsed.data.therapist_user_id,
      title: parsed.data.title,
      description: parsed.data.description,
      success_criterion: parsed.data.success_criterion,
      start_date: parsed.data.start_date,
      target_completion_date: parsed.data.target_completion_date,
      status: parsed.data.status,
      priority: parsed.data.priority,
      observations: parsed.data.observations,
    })
    .eq("id", goalId)
    .is("deleted_at", null);

  if (error) {
    console.error("updateTherapyGoalAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/therapy-goals");
  revalidatePath(`/therapy-goals/${goalId}`);
  revalidatePath(`/therapy-goals/${goalId}/edit`);
  revalidatePath(`/children/${parsed.data.child_id}`);
  redirect(`/therapy-goals/${goalId}`);
}
