import { ClinicalChildProfileShell } from "./ClinicalChildProfileShell";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { canMutateSchedule } from "@/lib/auth/schedule-permissions";
import { canWriteTherapyGoals } from "@/lib/auth/therapy-goals-permissions";
import { canViewClinicalChildProfile } from "@/lib/clinical/child-profile/permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { loadClinicalChildProfileBundle } from "@/lib/data/clinical-child-profile/load-bundle";
import { listEligibleParentsForChild } from "@/lib/data/parents/queries";
import { notFound } from "next/navigation";

type Props = {
  childId: string;
};

export async function ClinicalChildProfilePage({ childId }: Props) {
  const ctx = await getSessionContext();

  if (!canViewClinicalChildProfile(ctx.roleCodes)) {
    notFound();
  }

  const { bundle, source, notice } = await loadClinicalChildProfileBundle(childId);
  const isPrototype = source !== "database";

  const canMutate = canMutateChildren(ctx.roleCodes) && !isPrototype;
  const { parents: eligibleParents } =
    canMutate && bundle.child.organization_id
      ? await listEligibleParentsForChild(childId, bundle.child.organization_id).catch(() => ({
          parents: [],
        }))
      : { parents: [] };

  const loadWarnings = [
    ...(notice ? [notice] : []),
    ...(source === "database" ? [] : []),
  ];

  return (
    <ClinicalChildProfileShell
      bundle={bundle}
      roleCodes={ctx.roleCodes}
      canMutate={canMutate}
      canScheduleSessions={canMutateSchedule(ctx.roleCodes) && !isPrototype}
      canWriteGoals={canWriteTherapyGoals(ctx.roleCodes) && !isPrototype}
      eligibleParents={eligibleParents}
      loadWarnings={loadWarnings}
      isPrototype={isPrototype}
      dataSource={source}
    />
  );
}
