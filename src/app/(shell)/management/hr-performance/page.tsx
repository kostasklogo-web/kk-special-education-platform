import { getSessionContext } from "@/lib/auth/get-session-context";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { HrPerfWorkspace } from "@/components/management/hr-performance/HrPerfWorkspace";
import { canViewHrPerformance } from "@/lib/management/hr-performance/permissions";

export default async function HrPerformancePage() {
  const ctx = await getSessionContext();

  if (!canViewHrPerformance(ctx.roleCodes)) {
    redirect("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Διοίκηση"
        title="HR Απόδοση & Incentives"
        description="Κλινικά ασφαλής απόδοση και κίνητρα για πολυεπιστημονική θεραπεία — τεκμηρίωση, αξιοπιστία, συνεργασία (όχι πωλήσεις)."
      />
      <HrPerfWorkspace roleCodes={ctx.roleCodes} userId={ctx.user?.id ?? null} />
    </div>
  );
}
