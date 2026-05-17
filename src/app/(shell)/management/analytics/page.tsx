import { getSessionContext } from "@/lib/auth/get-session-context";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { AnalyticsWorkspace } from "@/components/management/analytics/AnalyticsWorkspace";
import { canViewManagementAnalytics } from "@/lib/management/analytics/permissions";

export default async function ManagementAnalyticsPage() {
  const ctx = await getSessionContext();

  if (!canViewManagementAnalytics(ctx.roleCodes)) {
    redirect("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Διοίκηση"
        title="Αναλυτικά Στοιχεία"
        description="Ημερήσιες, εβδομαδιαίες, μηνιαίες και ετήσιες αναφορές — οικονομικά, KPI θεραπευτών και ροή περιστατικών με συγκρίσεις περιόδων."
      />
      <AnalyticsWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
