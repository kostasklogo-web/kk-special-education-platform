"use client";

import { memo, type ReactNode } from "react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import type { WindowMs } from "@/lib/schedule/control-center-prototype-utils";
import type { SuggestedSlotEl } from "@/lib/schedule/control-center-prototype-utils";
import {
  CONTROL_CENTER_DEMO_DISCIPLINES,
  CONTROL_CENTER_DEMO_ROOMS,
  CONTROL_CENTER_DEMO_THERAPISTS,
} from "@/lib/demo/schedule-control-center-data";
import { AvailabilityPanel, type SpecialtyAvailabilityRow } from "./AvailabilityPanel";
import { AppointmentCreationPanel, type AppointmentDraftState } from "./AppointmentCreationPanel";
import { disciplineVisual } from "./cell-visual";
import { InspectorPanel } from "./InspectorPanel";
import { ReceptionActions } from "./ReceptionActions";
import { RoomAvailabilityPanel } from "./RoomAvailabilityPanel";

export const CC_RIGHT_SIDEBAR_W = 252;

type RightSidebarProps = {
  selected: ControlBoardBlock | null;
  statusLabel: string;
  therapistNames: Record<string, string>;
  createHighlight: "45" | "90" | "suggest" | null;
  on45: () => void;
  on90: () => void;
  onSuggest: () => void;
  appointmentDraft: AppointmentDraftState;
  onDraftChange: (patch: Partial<AppointmentDraftState>) => void;
  blocksForAvailability: ControlBoardBlock[];
  specialtyRows: SpecialtyAvailabilityRow[];
  suggestedSlots: SuggestedSlotEl[];
  freeDurationNeed: 45 | 50 | 90;
  freeSpecialtyFilter: string;
  freeTherapistFilter: string;
  onSpecialtyFilter: (v: string) => void;
  onTherapistFilter: (v: string) => void;
  onDurationNeed: (v: 45 | 50 | 90) => void;
  dateYmd: string;
  win: WindowMs;
  roomsForPanel: readonly (typeof CONTROL_CENTER_DEMO_ROOMS)[number][];
  roomConflicts: Set<string>;
};

const LEGEND_CODES = ["slt", "ot", "psy", "lead", "sped", "oel", "okd", "par", "sup", "brk"] as const;

export const RightSidebar = memo(function RightSidebar({
  selected,
  statusLabel,
  therapistNames,
  createHighlight,
  on45,
  on90,
  onSuggest,
  appointmentDraft,
  onDraftChange,
  blocksForAvailability,
  specialtyRows,
  suggestedSlots,
  freeDurationNeed,
  freeSpecialtyFilter,
  freeTherapistFilter,
  onSpecialtyFilter,
  onTherapistFilter,
  onDurationNeed,
  dateYmd,
  win,
  roomsForPanel,
  roomConflicts,
}: RightSidebarProps) {
  return (
    <aside
      className="flex h-full w-[252px] min-w-[252px] max-w-[252px] shrink-0 flex-col gap-1 overflow-y-auto overflow-x-hidden border-l border-slate-200 bg-slate-50/60 py-0.5 pl-1.5 pr-1"
      aria-label="Εργαλεία λειτουργίας"
    >
      <SidebarSection title="Επιθεωρητής">
        <InspectorPanel selected={selected} statusLabel={statusLabel} therapistNames={therapistNames} />
      </SidebarSection>

      <SidebarSection title="Νέα εγγραφή">
        <ReceptionActions layout="stack" createHighlight={createHighlight} on45={on45} on90={on90} onSuggest={onSuggest} />
        <AppointmentCreationPanel
          draft={appointmentDraft}
          onChange={onDraftChange}
          blocks={blocksForAvailability}
          highlightMode={createHighlight}
          onScrollToAvailability={onSuggest}
          embedded
        />
      </SidebarSection>

      <SidebarSection title="Διαθεσιμότητα" id="cc-availability-panel">
        <div className="mb-1 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-0.5 text-[9px] text-ink-muted">
            <span className="h-2 w-2 rounded border border-slate-600 bg-[repeating-linear-gradient(-45deg,#e2e8f0,#e2e8f0_3px,#94a3b8_3px,#94a3b8_6px)]" />
            Διάλ. 15′
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9px] text-ink-muted">
            <span className="h-2 w-2 rounded border border-amber-600 bg-amber-100" />
            Διάλ. 10′
          </span>
          {LEGEND_CODES.filter((c) => c !== "brk").map((code) => {
            const vis = disciplineVisual({
              id: "lg",
              source: "demo",
              starts_at: new Date(0).toISOString(),
              ends_at: new Date(60_000).toISOString(),
              therapistUserIds: [],
              title: "",
              subtitle: "",
              roomLabel: null,
              centerLabel: null,
              disciplineCode: code,
              disciplineNameEl: null,
              sessionKind: "individual",
              status: "scheduled",
            });
            const label = CONTROL_CENTER_DEMO_DISCIPLINES.find((d) => d.code === code)?.name_el ?? code;
            return (
              <span key={code} className="inline-flex items-center gap-0.5 text-[9px] text-ink-muted">
                <span className={`h-2 w-2 shrink-0 rounded border ${vis.wrap}`} />
                <span className="truncate">{label}</span>
              </span>
            );
          })}
        </div>
        <AvailabilityPanel
          specialtyRows={specialtyRows}
          suggestedSlots={suggestedSlots}
          freeDurationNeed={freeDurationNeed}
          disciplines={CONTROL_CENTER_DEMO_DISCIPLINES}
          therapists={CONTROL_CENTER_DEMO_THERAPISTS}
          freeSpecialtyFilter={freeSpecialtyFilter}
          freeTherapistFilter={freeTherapistFilter}
          freeDurationNeedValue={freeDurationNeed}
          onSpecialtyFilter={onSpecialtyFilter}
          onTherapistFilter={onTherapistFilter}
          onDurationNeed={onDurationNeed}
          dateYmd={dateYmd}
          embedded
        />
      </SidebarSection>

      <SidebarSection title="Αίθουσες">
        <RoomAvailabilityPanel
          rooms={roomsForPanel}
          blocks={blocksForAvailability}
          dateYmd={dateYmd}
          win={win}
          conflictRoomIds={roomConflicts}
          embedded
        />
      </SidebarSection>
    </aside>
  );
});

function SidebarSection({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="shrink-0 rounded border border-border/80 bg-white p-1.5 shadow-sm">
      <h2 className="mb-1 text-[9px] font-bold uppercase tracking-wide text-ink-faint">{title}</h2>
      {children}
    </section>
  );
}
