import { getSessionContext } from "@/lib/auth/get-session-context";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { PredictiveWorkspace } from "@/components/management/predictive-intelligence/PredictiveWorkspace";
import { canViewPredictiveIntelligence } from "@/lib/management/predictive-intelligence/permissions";

export default async function PredictiveIntelligencePage() {
  const ctx = await getSessionContext();

  if (!canViewPredictiveIntelligence(ctx.roleCodes)) {
    redirect("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Διοίκηση"
        title="Predictive Intelligence"
        description="Προγνωστική λειτουργική και κλινική υποστήριξη — κίνδυνοι συνέχειας, burnout, χωρητικότητα, οικονομικά και workflow (κανόνες & τάσεις, όχι generative AI)."
      />
      <PredictiveWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
