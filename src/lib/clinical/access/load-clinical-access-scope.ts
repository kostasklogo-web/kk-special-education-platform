import "server-only";

import type { RoleCode } from "@/lib/auth/roles";
import {
  resolveClinicalAccessOrgId,
  resolveClinicalAccessUserId,
  shouldUseClinicalAccessDemoFallback,
} from "@/lib/clinical/access/clinical-access-demo-fallback";
import { listSuperviseeUserIds } from "@/lib/data/staff/queries";
import {
  listAssignedChildIdsForTherapist,
  listChildIdsInSupervisorScope,
} from "@/lib/data/therapist-assignments/queries";
import type { ClinicalAccessScope } from "./types";

const MGMT: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SUP: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];
const THER: RoleCode[] = ["THERAPIST"];

function isTherapistOnly(roleCodes: RoleCode[]): boolean {
  return (
    roleCodes.some((r) => THER.includes(r)) &&
    !roleCodes.some((r) => [...MGMT, ...SUP, "RECEPTION"].includes(r))
  );
}

function isSupervisorOnly(roleCodes: RoleCode[]): boolean {
  return (
    roleCodes.includes("SUPERVISOR") &&
    !roleCodes.some((r) => MGMT.includes(r))
  );
}

export async function loadClinicalAccessScope(params: {
  organizationId: string;
  userId: string | null;
  roleCodes: RoleCode[];
}): Promise<ClinicalAccessScope> {
  const organizationId = resolveClinicalAccessOrgId(params.organizationId);
  const userId = resolveClinicalAccessUserId(params.userId);
  const { roleCodes } = params;

  let assignedChildIds: string[] = [];
  let supervisorScopedChildIds: string[] = [];
  const parentChildIds: string[] = [];

  try {
    if (userId && isTherapistOnly(roleCodes)) {
      assignedChildIds = await listAssignedChildIdsForTherapist({
        organizationId,
        therapistUserId: userId,
      });
    } else if (userId && roleCodes.some((r) => THER.includes(r))) {
      assignedChildIds = await listAssignedChildIdsForTherapist({
        organizationId,
        therapistUserId: userId,
      });
    }

    if (userId && (isSupervisorOnly(roleCodes) || roleCodes.includes("SUPERVISOR"))) {
      const { ids: superviseeIds } = await listSuperviseeUserIds({
        organizationId,
        supervisorUserId: userId,
      });
      supervisorScopedChildIds = await listChildIdsInSupervisorScope({
        organizationId,
        supervisorUserId: userId,
        superviseeUserIds: [...superviseeIds],
      });
    }
  } catch {
    assignedChildIds = [];
    supervisorScopedChildIds = [];
  }

  if (
    (assignedChildIds.length === 0 || supervisorScopedChildIds.length === 0) &&
    userId &&
    (await shouldUseClinicalAccessDemoFallback())
  ) {
    try {
      if (isTherapistOnly(roleCodes) || roleCodes.some((r) => THER.includes(r))) {
        assignedChildIds = await listAssignedChildIdsForTherapist({
          organizationId,
          therapistUserId: userId,
        });
      }
      if (isSupervisorOnly(roleCodes) || roleCodes.includes("SUPERVISOR")) {
        const { ids: superviseeIds } = await listSuperviseeUserIds({
          organizationId,
          supervisorUserId: userId,
        });
        supervisorScopedChildIds = await listChildIdsInSupervisorScope({
          organizationId,
          supervisorUserId: userId,
          superviseeUserIds: [...superviseeIds],
        });
      }
    } catch {
      /* keep empty */
    }
  }

  return {
    organizationId,
    userId,
    roleCodes,
    assignedChildIds,
    supervisorScopedChildIds,
    parentChildIds,
  };
}
