"use client";

import { ShieldAlert } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import {
  canViewFullOperationsIntelligence,
  opsIntelAccessLabel,
} from "@/lib/management/operations-intelligence/permissions";

type Props = { roleCodes: RoleCode[] };

export function OpsIntelRoleBanner({ roleCodes }: Props) {
  const full = canViewFullOperationsIntelligence(roleCodes);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted/40 px-4 py-3 text-sm">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
      <div>
        <p className="font-semibold text-ink">Δικαιώματα — {opsIntelAccessLabel(roleCodes)}</p>
        <p className="mt-1 text-ink-muted">
          {full ? (
            <>
              <strong className="text-ink">CEO / Διοίκηση / ΚΔ:</strong> πλήρη λειτουργική, οικονομική και
              εποπτευτική intelligence.
            </>
          ) : (
            <>
              <strong className="text-ink">Επόπτης:</strong> κλινικά, προγραμματισμός, εποπτεία — χωρίς πλήρη
              οικονομική operational intelligence.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Γραμματεία και θεραπευτές δεν έχουν πρόσβαση (εμπιστευτικά δεδομένα).
        </p>
      </div>
    </div>
  );
}
