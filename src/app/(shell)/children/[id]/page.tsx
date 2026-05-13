import { notFound } from "next/navigation";
import { ChildDetailBody } from "@/components/children/child-detail-body";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { canMutateSchedule } from "@/lib/auth/schedule-permissions";
import { canWriteTherapyGoals } from "@/lib/auth/therapy-goals-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  countFilesForChild,
  countProgressReportsForChild,
  countSessionNotesForChild,
  countSessionsForChild,
  countTherapyGoalsForChild,
  getChildWithCenter,
  listParentLinksForChild,
  listTherapyProgramsForChild,
} from "@/lib/data/children/queries";
import { listEligibleParentsForChild } from "@/lib/data/parents/queries";

type ChildProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChildProfilePage({ params }: ChildProfilePageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  const canMutate = canMutateChildren(ctx.roleCodes);

  const [
    { item, error: e1 },
    { links, error: e2 },
    { programs, error: e3 },
    goals,
    sessions,
    notes,
    reports,
    files,
  ] = await Promise.all([
    getChildWithCenter(id),
    listParentLinksForChild(id),
    listTherapyProgramsForChild(id),
    countTherapyGoalsForChild(id),
    countSessionsForChild(id),
    countSessionNotesForChild(id),
    countProgressReportsForChild(id),
    countFilesForChild(id),
  ]);

  if (!item || e1) {
    notFound();
  }

  const { parents: eligibleParents } = canMutate
    ? await listEligibleParentsForChild(id, item.organization_id)
    : { parents: [] };

  const loadWarnings = [e2, e3].filter(Boolean) as string[];

  return (
    <ChildDetailBody
      child={item}
      parentLinks={links}
      eligibleParents={eligibleParents}
      programs={programs}
      counts={{
        goals,
        sessions,
        sessionNotes: notes,
        reports,
        files,
      }}
      canMutate={canMutate}
      canScheduleSessions={canMutateSchedule(ctx.roleCodes)}
      canWriteTherapyGoals={canWriteTherapyGoals(ctx.roleCodes)}
      loadWarnings={loadWarnings}
    />
  );
}
