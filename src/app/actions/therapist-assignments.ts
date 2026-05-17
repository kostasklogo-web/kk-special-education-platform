"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { assertClinicalChildAccess } from "@/lib/clinical/access/resolve-clinical-access";
import { loadClinicalAccessScope } from "@/lib/clinical/access/load-clinical-access-scope";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import {
  createTherapistAssignment,
  endTherapistAssignment,
} from "@/lib/data/therapist-assignments/queries";
import type {
  CreateTherapistAssignmentInput,
  EndTherapistAssignmentInput,
} from "@/lib/data/therapist-assignments/types";

async function requireAssignPermission(childId: string) {
  const ctx = await getSessionContext();
  const { organizationId } = await getDefaultOrganizationIdForUser();
  const orgId = organizationId ?? "";
  const scope = await loadClinicalAccessScope({
    organizationId: orgId,
    userId: ctx.user?.id ?? null,
    roleCodes: ctx.roleCodes,
  });
  const access = await assertClinicalChildAccess(scope, childId, "assign");
  if (!access.allowed) {
    return { ok: false as const, error: access.messageEl };
  }
  return { ok: true as const, orgId, userId: ctx.user?.id ?? null, scope };
}

export async function assignTherapistToChildAction(
  input: Omit<CreateTherapistAssignmentInput, "organizationId">
) {
  const gate = await requireAssignPermission(input.childId);
  if (!gate.ok) return gate;

  const { assignment, error } = await createTherapistAssignment(
    {
      ...input,
      organizationId: gate.orgId,
      assignedByUserId: input.assignedByUserId ?? gate.userId,
    },
    gate.userId
  );

  revalidatePath("/children");
  revalidatePath(`/children/${input.childId}`);
  revalidatePath("/");

  if (error) return { ok: false as const, error };
  return { ok: true as const, assignment };
}

export async function endTherapistAssignmentAction(
  childId: string,
  input: EndTherapistAssignmentInput
) {
  const gate = await requireAssignPermission(childId);
  if (!gate.ok) return gate;

  const { assignment, error } = await endTherapistAssignment(
    gate.orgId,
    input,
    gate.userId
  );

  revalidatePath("/children");
  revalidatePath(`/children/${childId}`);
  revalidatePath("/");

  if (error) return { ok: false as const, error };
  return { ok: true as const, assignment };
}
