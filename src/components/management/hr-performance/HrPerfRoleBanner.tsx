import type { RoleCode } from "@/lib/auth/roles";
import { hrPerformanceAccessLabel } from "@/lib/management/hr-performance/permissions";
import { Shield } from "lucide-react";

type Props = { roleCodes: RoleCode[] };

export function HrPerfRoleBanner({ roleCodes }: Props) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm">
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" aria-hidden />
      <div>
        <p className="font-semibold text-ink">Πρόσβαση & απορρήτου</p>
        <p className="text-ink-muted">{hrPerformanceAccessLabel(roleCodes)}</p>
        <p className="mt-1 text-xs text-ink-muted">
          HR σημειώσεις, κλινικά δεδομένα, αξιολογήσεις διοίκησης και bonus διαχωρίζονται. Θεραπευτές δεν βλέπουν
          οικονομικά κίνητρα συναδέλφων.
        </p>
      </div>
    </div>
  );
}
