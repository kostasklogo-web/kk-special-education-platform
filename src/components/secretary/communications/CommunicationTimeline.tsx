"use client";

import type { CommunicationLog } from "@/lib/secretary/types";
import { formatDateEl } from "@/lib/ui/child-labels";
import { CommunicationStatusBadge } from "./CommunicationStatusBadge";
import { CommunicationPriorityBadge } from "./CommunicationPriorityBadge";
import { CommunicationDiagnosisBadge } from "@/components/secretary/diagnoses/CommunicationDiagnosisBadge";
import { CommunicationReportBadge } from "@/components/secretary/reports/CommunicationReportBadge";

type Props = {
  logs: CommunicationLog[];
  onSelect: (log: CommunicationLog) => void;
};

export function CommunicationTimeline({ logs, onSelect }: Props) {
  if (logs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-ink-muted">
        Δεν υπάρχουν καταχωρήσεις στο χρονολόγιο.
      </p>
    );
  }

  const byChild = new Map<string, CommunicationLog[]>();
  for (const log of logs) {
    const key = log.childLabel ?? log.contactPerson;
    const list = byChild.get(key) ?? [];
    list.push(log);
    byChild.set(key, list);
  }

  return (
    <div className="space-y-6">
      {[...byChild.entries()].map(([label, items]) => (
        <section key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-ink">{label}</h3>
          <ol className="relative border-l-2 border-clinical-200 pl-6">
            {items.map((c) => (
              <li key={c.id} className="mb-4 last:mb-0">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-clinical-600" />
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className="w-full rounded-lg border border-border/80 bg-surface-muted/20 p-3 text-left hover:bg-surface-muted/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink-muted">
                      {formatDateEl(c.communicationDate)}
                      {c.communicationTime ? ` · ${c.communicationTime}` : ""}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <CommunicationDiagnosisBadge log={c} />
                      <CommunicationReportBadge log={c} />
                      <CommunicationStatusBadge status={c.status} />
                      <CommunicationPriorityBadge priority={c.priority} />
                    </div>
                  </div>
                  <p className="mt-1 font-medium text-ink">{c.communicationTypeLabel}</p>
                  <p className="text-sm text-ink-muted">
                    {c.contactPerson} · {c.reason}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink">{c.summary}</p>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
