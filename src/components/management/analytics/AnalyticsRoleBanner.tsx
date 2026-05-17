"use client";

import { Shield } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import {
  analyticsAccessLabel,
  canViewFullManagementAnalytics,
} from "@/lib/management/analytics/permissions";

type Props = { roleCodes: RoleCode[] };

export function AnalyticsRoleBanner({ roleCodes }: Props) {
  const full = canViewFullManagementAnalytics(roleCodes);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted/40 px-4 py-3 text-sm">
      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
      <div>
        <p className="font-semibold text-ink">Δικαιώματα — {analyticsAccessLabel(roleCodes)}</p>
        <p className="mt-1 text-ink-muted">
          {full ? (
            <>
              <strong className="text-ink">Διοίκηση / CEO:</strong> πλήρη οικονομικά, ετήσιες αναφορές και
              συγκρίσεις ετών.
            </>
          ) : (
            <>
              <strong className="text-ink">Γραμματεία:</strong> ημερήσιες/εβδομαδιαίες λειτουργικές αναφορές, KPI
              θεραπευτών και ροή περιστατικών — χωρίς πλήρη οικονομική ανάλυση.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-ink-muted">Θεραπευτές δεν έχουν πρόσβαση σε αυτή τη σελίδα (GDPR).</p>
      </div>
    </div>
  );
}
