"use client";

import { Shield, Users } from "lucide-react";
import {
  canViewFullFinances,
  canViewLimitedFinances,
  financesAccessLabel,
} from "@/lib/secretary/finances/permissions";
import type { RoleCode } from "@/lib/auth/roles";

type Props = { roleCodes: RoleCode[] };

export function FinancesRoleBanner({ roleCodes }: Props) {
  const full = canViewFullFinances(roleCodes);
  const limited = canViewLimitedFinances(roleCodes);

  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="font-semibold text-ink">Δικαιώματα πρόσβασης — {financesAccessLabel(roleCodes)}</p>
          <ul className="list-inside list-disc space-y-1 text-ink-muted">
            <li>
              <strong className="text-ink">Γραμματεία (RECEPTION):</strong> εισπράξεις, υπόλοιπα γονέων,
              καταχώριση πληρωμών — χωρίς πλήρη P&amp;L / μισθοδοσία.
            </li>
            <li>
              <strong className="text-ink">Διοίκηση / CEO (ORG_OWNER, ORG_ADMIN):</strong> πλήρης οικονομική
              εικόνα, ταμειακές ροές, έξοδα, alerts.
            </li>
            <li className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden />
              <strong className="text-ink">Θεραπευτές:</strong> δεν έχουν πρόσβαση σε οικονομικά δεδομένα.
            </li>
          </ul>
          {limited ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
              Βλέπετε περιορισμένη προβολή. Ευαίσθητες κατηγορίες (μισθοδοσία, συνολικό αποτέλεσμα) είναι
              συνοπτικές ή κρυφές.
            </p>
          ) : null}
          {full ? (
            <p className="text-xs text-ink-muted">Πλήρης προβολή πρωτοτύπου — όλες οι ενότητες ενεργές.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
