import type { ClientIntake, SecretaryDashboardData } from "@/lib/secretary/types";
import { countByStatuses } from "./store";

export function mergeDashboardWithIntakes(
  base: SecretaryDashboardData,
  intakes: ClientIntake[]
): SecretaryDashboardData {
  const newInquiries = intakes.filter(
    (i) =>
      !["active_case", "active_client", "closed", "closed_unsuitable"].includes(i.leadStatus) &&
      i.completeness !== "draft"
  ).length;

  const pendingEval = countByStatuses(intakes, ["evaluation_scheduled", "awaiting_contact", "new_interest"]);
  const pendingHistory = countByStatuses(intakes, ["history_scheduled"]);
  const pendingParentInfo = countByStatuses(intakes, ["parent_info_scheduled"]);
  const kpis = base.kpis.map((k) => {
    switch (k.id) {
      case "new_inquiries":
        return { ...k, value: newInquiries, helper: `${newInquiries} ενεργά αιτήματα` };
      case "pending_eval":
        return { ...k, value: pendingEval, helper: "Προς αξιολόγηση / επικοινωνία" };
      case "pending_intake":
        return {
          ...k,
          value: pendingHistory + pendingParentInfo,
          helper: `Ιστορικό: ${pendingHistory} · Ενημερωτικό: ${pendingParentInfo}`,
        };
      default:
        return k;
    }
  });

  const urgentFromIntakes = intakes
    .filter((i) => i.urgencyLevel === "urgent" && i.leadStatus !== "closed_unsuitable")
    .slice(0, 3)
    .map((i) => ({
      id: `urgent-intake-${i.id}`,
      title: "Επείγον νέο αίτημα",
      detail: `${i.childFirstName} ${i.childLastName} — ${i.mainReason.slice(0, 60)}`,
      alertLevel: "red" as const,
      href: "/secretary/new-case",
    }));

  return {
    ...base,
    kpis,
    urgentAlerts: [...urgentFromIntakes, ...base.urgentAlerts].slice(0, 6),
  };
}
