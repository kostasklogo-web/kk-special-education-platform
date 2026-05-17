import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { canViewFinancesModule } from "@/lib/secretary/finances/permissions";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { FinancesWorkspace } from "@/components/secretary/finances/FinancesWorkspace";

export default async function SecretaryFinancesPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/finances", ctx.roleCodes);

  if (!canViewFinancesModule(ctx.roleCodes)) {
    redirect("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Οικονομικά"
        description="Επιχειρησιακή οικονομική διαχείριση — ταμειακή ροή, budget, ανάλυση εσόδων, πρόβλεψη και intelligence για Νίκαια & Εύοσμος."
      />
      <FinancesWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
