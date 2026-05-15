"use client";

import { memo, type ReactNode } from "react";
import { Info, Link2 } from "lucide-react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import { blockHeadline, blockTimeRangeEl } from "./cell-visual";

type InspectorPanelProps = {
  selected: ControlBoardBlock | null;
  statusLabel: string;
  therapistNames: Record<string, string>;
};

export const InspectorPanel = memo(function InspectorPanel({
  selected,
  statusLabel,
  therapistNames,
}: InspectorPanelProps) {
  if (!selected) {
    return (
      <p className="flex gap-2 text-xs text-ink-muted">
        <Info className="h-4 w-4 shrink-0 text-clinical-600" aria-hidden />
        Επιλέξτε μπλοκ στο πλέγμα.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 text-xs text-ink-muted">
      <p className="font-medium text-ink">{blockHeadline(selected)}</p>
      {selected.subtitle ? <p className="leading-snug">{selected.subtitle}</p> : null}
      <dl className="space-y-1">
        <InspectorRow label="Ώρα" value={blockTimeRangeEl(selected)} />
        <InspectorRow label="Αίθουσα" value={selected.roomLabel ?? "—"} />
        <InspectorRow
          label="Θεραπευτές"
          value={(selected.therapistUserIds ?? []).map((id) => therapistNames[id] ?? id).join(", ")}
        />
        <InspectorRow label="Κατάσταση" value={statusLabel} />
        {selected.sessionGroupId ? (
          <InspectorRow
            label="Ομάδα"
            value={
              <span className="inline-flex items-center gap-1">
                <Link2 className="h-3 w-3 shrink-0" />
                {selected.sessionGroupId}
              </span>
            }
          />
        ) : null}
      </dl>
    </div>
  );
});

function InspectorRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="min-w-0 max-w-[58%] truncate text-right text-ink" title={typeof value === "string" ? value : undefined}>
        {value}
      </dd>
    </div>
  );
}
