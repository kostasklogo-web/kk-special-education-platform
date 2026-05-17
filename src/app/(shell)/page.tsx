import Link from "next/link";
import { PlatformModuleCards } from "@/components/platform/PlatformModuleCards";
import { PlatformQuickNavPanel } from "@/components/platform/PlatformQuickNavPanel";
import { PlatformSecretaryTodayStrip } from "@/components/platform/PlatformSecretaryTodayStrip";
import { OperationalDashboardContent } from "@/components/platform/OperationalDashboardContent";
import { PageHeader } from "@/components/shell/PageHeader";
import { TherapistCaseloadPanel } from "@/components/platform/TherapistCaseloadPanel";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { buildTherapistCaseloadItems } from "@/lib/clinical/access/build-caseload-items";
import { getDefaultOrganizationIdForUser, listChildren } from "@/lib/data/children/queries";
import { listActiveAssignmentsForTherapist } from "@/lib/data/therapist-assignments/queries";
import { formatAthensLongDateFromYmd, todayAthensYmd } from "@/lib/schedule/athens-civil";

/** Unified platform entry — operational shell landing at `/`. */
function isTherapistHomeScoped(roleCodes: Awaited<ReturnType<typeof getSessionContext>>["roleCodes"]) {
  return (
    roleCodes.includes("THERAPIST") &&
    !roleCodes.some((r) => ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR", "RECEPTION"].includes(r))
  );
}

export default async function PlatformHomePage() {
  const ctx = await getSessionContext();
  const todayLabel = formatAthensLongDateFromYmd(todayAthensYmd());

  let caseloadPanel = null;
  if (isTherapistHomeScoped(ctx.roleCodes) && ctx.user?.id) {
    const { organizationId } = await getDefaultOrganizationIdForUser();
    const orgId = organizationId ?? "";
    const assignments = await listActiveAssignmentsForTherapist({
      organizationId: orgId,
      therapistUserId: ctx.user.id,
    });
    const { items: children } = await listChildren({});
    const caseloadItems = buildTherapistCaseloadItems(assignments, children);
    caseloadPanel = (
      <TherapistCaseloadPanel items={caseloadItems} isPrototype={assignments.length > 0} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Λειτουργική πλατφόρμα"
        title="Κεντρικός Πίνακας"
        description="Ενιαίο περιβάλλον λειτουργίας — πρόγραμμα, παιδιά, κλινική τεκμηρίωση, γραμματεία και διοίκηση από ένα σημείο."
        meta={<span className="text-sm text-ink-muted">{todayLabel}</span>}
        actions={
          <Link
            href="/schedule/control-center"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-clinical-600 bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
          >
            Πίνακας προγράμματος
          </Link>
        }
      />

      {caseloadPanel}
      <PlatformModuleCards roleCodes={ctx.roleCodes} />
      <PlatformQuickNavPanel />
      <PlatformSecretaryTodayStrip roleCodes={ctx.roleCodes} />
      <OperationalDashboardContent embedded />
    </div>
  );
}
