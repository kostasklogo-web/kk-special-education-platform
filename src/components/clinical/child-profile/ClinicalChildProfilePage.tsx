import { TrackRecentChildVisit } from "@/components/platform/TrackRecentChildVisit";
import { ClinicalAccessDenied } from "@/components/clinical/access/ClinicalAccessDenied";
import { ClinicalChildProfileShell } from "./ClinicalChildProfileShell";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { canMutateSchedule } from "@/lib/auth/schedule-permissions";
import { canWriteTherapyGoals } from "@/lib/auth/therapy-goals-permissions";
import { canViewClinicalChildProfile } from "@/lib/clinical/child-profile/permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { loadClinicalAccessScope } from "@/lib/clinical/access/load-clinical-access-scope";
import {
  assertClinicalChildAccess,
  clinicalAccessDeniedMessage,
} from "@/lib/clinical/access/resolve-clinical-access";
import { logClinicalAccessAttempt } from "@/lib/clinical/access/clinical-access-audit";
import { loadClinicalChildProfileBundle } from "@/lib/data/clinical-child-profile/load-bundle";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
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

  const { organizationId } = await getDefaultOrganizationIdForUser();
  const orgId = organizationId ?? "";
  const accessScope = await loadClinicalAccessScope({
    organizationId: orgId,
    userId: ctx.user?.id ?? null,
    roleCodes: ctx.roleCodes,
  });

  const access = await assertClinicalChildAccess(accessScope, childId, "read");

  if (!access.allowed) {
    logClinicalAccessAttempt({
      organizationId: orgId,
      userId: ctx.user?.id ?? null,
      childId,
      resourceType: "child_profile",
      action: "denied",
      denialReason: access.reason,
    });
    return <ClinicalAccessDenied message={clinicalAccessDeniedMessage(access)} />;
  }

  logClinicalAccessAttempt({
    organizationId: orgId,
    userId: ctx.user?.id ?? null,
    childId,
    resourceType: "child_profile",
    action: "view",
    metadata: { mode: access.mode },
  });

  const { bundle, source, notice } = await loadClinicalChildProfileBundle(childId);
  const isPrototype = source !== "database";

  const canMutate = canMutateChildren(ctx.roleCodes) && !isPrototype;
  const { parents: eligibleParents } =
    canMutate && bundle.child.organization_id
      ? await listEligibleParentsForChild(childId, bundle.child.organization_id).catch(() => ({
          parents: [],
        }))
      : { parents: [] };

  const loadWarnings = [...(notice ? [notice] : [])];

  const childLabel =
    [bundle.child.first_name, bundle.child.last_name].filter(Boolean).join(" ").trim() || "Φάκελος παιδιού";

  return (
    <>
      <TrackRecentChildVisit childId={childId} label={childLabel} />
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
    </>
  );
}
