import { getSessionContext } from "@/lib/auth/get-session-context";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { OpsIntelWorkspace } from "@/components/management/operations-intelligence/OpsIntelWorkspace";
import { canViewOperationsIntelligence } from "@/lib/management/operations-intelligence/permissions";

export default async function OperationsIntelligencePage() {
  const ctx = await getSessionContext();

  if (!canViewOperationsIntelligence(ctx.roleCodes)) {
    redirect("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Διοίκηση"
        title="Operational Intelligence"
        description="Λειτουργική intelligence για κέντρα πολυεπιστημονικής θεραπείας — κίνδυνοι, bottlenecks, προγραμματισμός, κλινική ροή και alerts (κανόνες workflow, όχι AI)."
      />
      <OpsIntelWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
