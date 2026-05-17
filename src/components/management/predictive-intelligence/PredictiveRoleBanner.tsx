"use client";

import { Brain } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { predictiveIntelAccessLabel } from "@/lib/management/predictive-intelligence/permissions";

type Props = { roleCodes: RoleCode[] };

export function PredictiveRoleBanner({ roleCodes }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted/40 px-4 py-3 text-sm">
      <Brain className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
      <div>
        <p className="font-semibold text-ink">{predictiveIntelAccessLabel(roleCodes)}</p>
        <p className="mt-1 text-ink-muted">
          Πρόσβλεψη λειτουργικής και κλινικής συνέχειας — μόνο CEO, Διοίκηση και Κλινική Διεύθυνση.
          Θεραπευτές, γραμματεία και επόπτες δεν έχουν πρόσβαση.
        </p>
      </div>
    </div>
  );
}
