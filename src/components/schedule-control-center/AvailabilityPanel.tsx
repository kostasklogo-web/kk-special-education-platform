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
}: AvailabilityPanelProps) {
  return (
    <>
      <section className="rounded-lg border border-border bg-surface-card p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink">Διαθεσιμότητα ανά ειδικότητα</p>
          <span className="text-[10px] text-ink-faint">Επόμενο κενό ≥45′ / ≥90′ (επιλεγμένη ημέρα)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="py-1.5 pr-2">Ειδικότητα</th>
                <th className="py-1.5 pr-2">Θεραπευτές</th>
                <th className="py-1.5 pr-2">Επόμενο 45′</th>
                <th className="py-1.5 pr-2">Επόμενο 90′</th>
              </tr>
            </thead>
            <tbody>
              {specialtyRows.map((row) => (
                <tr key={row.code} className="border-b border-border/70">
                  <td className="py-1.5 pr-2 font-medium text-ink">{row.name}</td>
                  <td className="max-w-[12rem] py-1.5 pr-2 text-xs text-ink-muted">{row.therapists}</td>
                  <td className="py-1.5 pr-2 tabular-nums text-ink">{row.next45El}</td>
                  <td className="py-1.5 pr-2 tabular-nums text-ink">{row.next90El}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="availability-panel"
        className="rounded-lg border border-clinical-300/70 bg-gradient-to-br from-clinical-50/50 to-white p-3 shadow-sm"
      >
        <p className="text-base font-bold text-clinical-950">Πίνακας διαθεσιμότητας</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-clinical-800/90">Γραμματεία · επιλεγμένη ημέρα</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <label className="block text-xs text-ink-muted">
            Ειδικότητα
            <select
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2 text-sm"
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
          <label className="block text-xs text-ink-muted">
            Θεραπευτής
            <select
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2 text-sm"
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
          <label className="block text-xs text-ink-muted">
            Διάρκεια
            <select
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2 text-sm"
              value={freeDurationNeedValue}
              onChange={(e) => onDurationNeed(Number(e.target.value) as 45 | 50 | 90)}
            >
              <option value={45}>45′ ατομικό</option>
              <option value={50}>50′ ψυχ./διεύθυνση</option>
              <option value={90}>90′ ομαδικό</option>
            </select>
          </label>
        </div>
      </section>

      <section
        id="suggested-slots-panel"
        className="rounded-lg border border-clinical-200/90 bg-gradient-to-br from-clinical-50/40 to-white p-3 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-clinical-950">Προτεινόμενες διαθέσιμες ώρες</p>
            <p className="mt-1 text-sm text-ink-muted">
              {suggestedSlots.length} πρόταση/ες · διάρκεια {freeDurationNeed}′ · {formatAthensLongDateFromYmd(dateYmd)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-clinical-200 bg-white px-3 py-1 text-xs font-medium text-clinical-900">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Επίδειξη
          </span>
        </div>
        {suggestedSlots.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Δεν βρέθηκαν προτεινόμενα κενά με τα τρέχοντα φίλτρα.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wide text-ink-faint">
                  <th className="py-1.5 pr-2">Θεραπευτής</th>
                  <th className="py-1.5 pr-2">Ειδικότητα</th>
                  <th className="py-1.5 pr-2">Ώρα</th>
                  <th className="py-1.5 pr-2">Αίθουσα</th>
                  <th className="py-1.5 pr-2">Καταλληλότητα</th>
                </tr>
              </thead>
              <tbody>
                {suggestedSlots.map((s, i) => (
                  <tr key={`${s.therapistUserId}-${s.startMs}-${i}`} className="border-b border-border/60">
                    <td className="py-1.5 pr-2 font-medium text-ink">{s.therapistName}</td>
                    <td className="py-1.5 pr-2 text-ink-muted">{s.specialtyNameEl}</td>
                    <td className="py-1.5 pr-2 tabular-nums font-semibold text-clinical-900">
                      {formatAthensHmFromUtcMs(s.startMs)}–{formatAthensHmFromUtcMs(s.endMs)}
                    </td>
                    <td className="py-1.5 pr-2 text-ink">{s.roomAvailabilityEl}</td>
                    <td className="py-1.5 pr-2">
                      <span className="inline-block rounded-md bg-clinical-100 px-2 py-0.5 text-[11px] font-medium text-clinical-950">
                        {s.suitabilityEl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
});
