import { notFound } from "next/navigation";
import { ParentDetailBody } from "@/components/parents/parent-detail-body";
import { canMutateParents } from "@/lib/auth/parents-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  getParentById,
  listChildrenEligibleForParent,
  listLinkedChildrenForParent,
} from "@/lib/data/parents/queries";

type ParentProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ParentProfilePage({ params }: ParentProfilePageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  const canMutate = canMutateParents(ctx.roleCodes);
  const readOnly = !canMutate && ctx.roleCodes.some((c) => ["SUPERVISOR", "THERAPIST"].includes(c));

  const [{ parent, error: e1 }, { links, error: e2 }] = await Promise.all([
    getParentById(id),
    listLinkedChildrenForParent(id),
  ]);

  if (!parent || e1) {
    notFound();
  }

  const { children: eligibleChildren, error: e3 } = canMutate
    ? await listChildrenEligibleForParent(id, parent.organization_id)
    : { children: [], error: null };

  const loadWarnings = [e2, e3].filter(Boolean) as string[];

  return (
    <div>
      {loadWarnings.length > 0 ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {loadWarnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}
      <ParentDetailBody
        parent={parent}
        links={links}
        eligibleChildren={eligibleChildren}
        canMutate={canMutate}
        readOnlyNotice={readOnly}
      />
    </div>
  );
}
