"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { formatAthensLongDateFromYmd } from "@/lib/schedule/athens-civil";
import { formatAthensHmFromUtcMs, type SuggestedSlotEl } from "@/lib/schedule/control-center-prototype-utils";
import type { CONTROL_CENTER_DEMO_DISCIPLINES, CONTROL_CENTER_DEMO_THERAPISTS } from "@/lib/demo/schedule-control-center-data";

type DisciplineRow = (typeof CONTROL_CENTER_DEMO_DISCIPLINES)[number];
type TherapistRow = (typeof CONTROL_CENTER_DEMO_THERAPISTS)[number];

export type SpecialtyAvailabilityRow = {
  code: string;
  name: string;
  therapists: string;
  next45El: string;
  next90El: string;
};

type AvailabilityPanelProps = {
  specialtyRows: SpecialtyAvailabilityRow[];
  suggestedSlots: SuggestedSlotEl[];
  freeDurationNeed: 45 | 50 | 90;
  disciplines: readonly DisciplineRow[];
  therapists: readonly TherapistRow[];
  freeSpecialtyFilter: string;
  freeTherapistFilter: string;
  freeDurationNeedValue: 45 | 50 | 90;
  onSpecialtyFilter: (v: string) => void;
  onTherapistFilter: (v: string) => void;
  onDurationNeed: (v: 45 | 50 | 90) => void;
  dateYmd: string;
  embedded?: boolean;
};

export const AvailabilityPanel = memo(function AvailabilityPanel({
  specialtyRows,
  suggestedSlots,
  freeDurationNeed,
  disciplines,
  therapists,
  freeSpecialtyFilter,
  freeTherapistFilter,
  freeDurationNeedValue,
  onSpecialtyFilter,
  onTherapistFilter,
  onDurationNeed,
  dateYmd,
  embedded = false,
}: AvailabilityPanelProps) {
  const wrap = embedded ? "" : "rounded-lg border border-border bg-surface-card p-3 shadow-sm";

  return (
  <>
      <div className={embedded ? "space-y-2" : wrap}>
        <p className={embedded ? "text-[10px] font-bold text-ink" : "text-sm font-bold text-ink"}>
          Ειδικότητες — επόμενο κενό
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[10px]">
            <thead>
              <tr className="border-b border-border text-[9px] uppercase tracking-wide text-ink-faint">
                <th className="py-1 pr-1">Ειδ.</th>
                <th className="py-1 pr-1">45′</th>
                <th className="py-1 pr-1">90′</th>
              </tr>
            </thead>
            <tbody>
              {specialtyRows.map((row) => (
                <tr key={row.code} className="border-b border-border/60">
                  <td className="max-w-[5.5rem] truncate py-0.5 pr-1 font-medium text-ink" title={row.name}>
                    {row.name}
                  </td>
                  <td className="py-0.5 pr-1 tabular-nums text-emerald-900">{row.next45El}</td>
                  <td className="py-0.5 pr-1 tabular-nums text-indigo-900">{row.next90El}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={embedded ? "space-y-1.5 border-t border-border/60 pt-1.5" : "mt-3 rounded-lg border border-clinical-300/70 bg-gradient-to-br from-clinical-50/50 to-white p-3 shadow-sm"}>
        <p className="text-[10px] font-bold text-clinical-950">Φίλτρα προτάσεων</p>
        <div className="grid gap-1.5">
          <label className="block text-[10px] text-ink-muted">
            Ειδικότητα
            <select
              className="mt-0.5 w-full rounded border border-border bg-white px-1.5 py-1 text-[11px]"
              value={freeSpecialtyFilter}
              onChange={(e) => onSpecialtyFilter(e.target.value)}
            >
              <option value="">Όλες</option>
              {disciplines
                .filter((d) => d.code !== "brk")
                .map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name_el}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-[10px] text-ink-muted">
            Θεραπευτής
            <select
              className="mt-0.5 w-full rounded border border-border bg-white px-1.5 py-1 text-[11px]"
              value={freeTherapistFilter}
              onChange={(e) => onTherapistFilter(e.target.value)}
            >
              <option value="">Όλοι</option>
              {therapists.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] text-ink-muted">
            Διάρκεια
            <select
              className="mt-0.5 w-full rounded border border-border bg-white px-1.5 py-1 text-[11px]"
              value={freeDurationNeedValue}
              onChange={(e) => onDurationNeed(Number(e.target.value) as 45 | 50 | 90)}
            >
              <option value={45}>45′ ατομικό</option>
              <option value={50}>50′ ψυχ./διεύθυνση</option>
              <option value={90}>90′ ομαδικό</option>
            </select>
          </label>
        </div>
      </div>

      <section
        id="suggested-slots-panel"
        className={embedded ? "space-y-1.5 border-t border-border/60 pt-1.5" : "rounded-lg border border-clinical-200/90 bg-gradient-to-br from-clinical-50/40 to-white p-3 shadow-sm"}
      >
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-[10px] font-bold text-clinical-950">Προτεινόμενες ώρες</p>
            <p className="text-[9px] text-ink-muted">
              {suggestedSlots.length} · {freeDurationNeed}′ · {formatAthensLongDateFromYmd(dateYmd)}
            </p>
          </div>
          <span className="inline-flex items-center gap-0.5 rounded-full border border-clinical-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-clinical-900">
            <Sparkles className="h-3 w-3" aria-hidden />
            Demo
          </span>
        </div>
        <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto">
          {suggestedSlots.map((s, i) => (
            <li
              key={`${s.therapistUserId}-${s.startMs}-${i}`}
              className="rounded border border-clinical-200/80 bg-white px-1.5 py-1 text-[10px] leading-snug"
            >
              <p className="font-bold tabular-nums text-clinical-950">
                {formatAthensHmFromUtcMs(s.startMs)}–{formatAthensHmFromUtcMs(s.endMs)}
              </p>
              <p className="truncate font-medium text-ink">{s.therapistName}</p>
              <p className="text-ink-muted">
                {s.specialtyNameEl} · <span className="font-semibold text-ink">{s.roomAvailabilityEl}</span>
              </p>
              <p className="text-[9px] text-clinical-800">{s.suitabilityEl}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
});
