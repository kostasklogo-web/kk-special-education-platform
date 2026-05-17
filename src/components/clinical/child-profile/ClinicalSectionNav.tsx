"use client";

import type { ClinicalProfileTab } from "@/lib/clinical/child-profile/types";
import { CLINICAL_PROFILE_TAB_LABELS } from "@/lib/clinical/child-profile/labels";

type Props = {
  active: ClinicalProfileTab;
  onChange: (tab: ClinicalProfileTab) => void;
  visibleTabs: ClinicalProfileTab[];
  alertCount?: number;
};

export function ClinicalSectionNav({ active, onChange, visibleTabs, alertCount = 0 }: Props) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Ενότητες κλινικού προφίλ">
      {visibleTabs.map((tab) => {
        const isActive = active === tab;
        const showBadge = tab === "alerts" && alertCount > 0;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`relative shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "border border-b-0 border-clinical-200 bg-white text-clinical-700 shadow-sm"
                : "text-ink-muted hover:bg-white/60 hover:text-ink"
            }`}
          >
            {CLINICAL_PROFILE_TAB_LABELS[tab]}
            {showBadge ? (
              <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {alertCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
