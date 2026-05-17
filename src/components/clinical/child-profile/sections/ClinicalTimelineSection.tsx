"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ClinicalTimelineEvent, ClinicalTimelineEventKind } from "@/lib/clinical/child-profile/types";
import { TIMELINE_KIND_LABELS } from "@/lib/clinical/child-profile/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalBadge } from "../clinical-ui";

const FILTER_OPTIONS: { value: ClinicalTimelineEventKind | "all"; label: string }[] = [
  { value: "all", label: "Όλα" },
  { value: "evaluation", label: "Αξιολογήσεις" },
  { value: "session_note", label: "Σημειώσεις θεραπείας" },
  { value: "report", label: "Αναφορές" },
  { value: "goal", label: "Στόχοι" },
  { value: "therapeutic_change", label: "Αλλαγές στόχων" },
  { value: "supervision", label: "Εποπτεία" },
  { value: "interdisciplinary", label: "Διεπιστημονικά" },
  { value: "parent_guidance", label: "Καθοδήγηση γονέων" },
  { value: "school_collaboration", label: "Σχολείο" },
];

const KIND_TONE: Partial<Record<ClinicalTimelineEventKind, "clinical" | "violet" | "warning" | "success">> = {
  evaluation: "clinical",
  supervision: "violet",
  interdisciplinary: "violet",
  therapeutic_change: "warning",
  school_collaboration: "success",
};

export function ClinicalTimelineSection({ events }: { events: ClinicalTimelineEvent[] }) {
  const [filter, setFilter] = useState<ClinicalTimelineEventKind | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.kind === filter);
  }, [events, filter]);

  return (
    <section className="space-y-4">
      <p className="text-sm text-ink-muted">
        Χρονολογική ροή κλινικών γεγονότων — αξιολογήσεις, σημειώσεις, αναφορές, εποπτεία, διεπιστημονικές
        αποφάσεις και συνεργασία σχολείου.
      </p>
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === opt.value
                ? "bg-clinical-600 text-white"
                : "border border-border bg-white text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-muted">
          Δεν υπάρχουν γεγονότα για το επιλεγμένο φίλτρο.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l-2 border-clinical-200 pl-6">
          {filtered.map((ev) => (
            <li key={ev.id} className="relative pb-6">
              <span className="absolute -left-[1.65rem] top-1 flex h-3 w-3 rounded-full bg-clinical-600 ring-4 ring-white" />
              <article className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <ClinicalBadge tone={KIND_TONE[ev.kind] ?? "neutral"}>
                      {TIMELINE_KIND_LABELS[ev.kind]}
                    </ClinicalBadge>
                    <h4 className="font-semibold text-ink">{ev.title}</h4>
                  </div>
                  <time className="shrink-0 text-xs text-ink-muted" dateTime={ev.occurredAt}>
                    {formatDateEl(ev.occurredAt.slice(0, 10))}
                  </time>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{ev.summary}</p>
                {(ev.disciplineLabel || ev.therapistName) && (
                  <p className="mt-1 text-xs text-ink-faint">
                    {[ev.disciplineLabel, ev.therapistName].filter(Boolean).join(" · ")}
                  </p>
                )}
                {typeof ev.meta?.linkedGoals === "number" && ev.meta.linkedGoals > 0 ? (
                  <p className="mt-1 text-xs text-clinical-700">
                    Συνδεδεμένοι στόχοι: {ev.meta.linkedGoals}
                  </p>
                ) : null}
                {ev.href ? (
                  <Link href={ev.href} className="mt-2 inline-block text-xs font-bold text-clinical-700">
                    Λεπτομέρειες →
                  </Link>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
