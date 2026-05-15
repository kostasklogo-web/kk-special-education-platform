"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import {
  annotateConflicts,
  blockIntervalInWindowMs,
  type ControlBoardBlock,
} from "@/lib/schedule/control-center-model";
import { athensOperationalWindowMs } from "@/lib/schedule/control-center-window";
import type { SessionStatus } from "@/lib/data/sessions/types";
import {
  CONTROL_CENTER_DEMO_CENTERS,
  CONTROL_CENTER_DEMO_DISCIPLINES,
  CONTROL_CENTER_DEMO_ROOMS,
  CONTROL_CENTER_DEMO_ROOMS_PANEL,
  CONTROL_CENTER_DEMO_STATUSES,
  CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE,
  CONTROL_CENTER_DEMO_THERAPISTS,
  CONTROL_CENTER_SIDE50_THERAPIST_IDS,
  controlCenterTherapistColumnTier,
  indexControlCenterBlocksByTherapist,
  isControlCenterSide50Therapist,
  shiftControlCenterDemoBlocksToYmd,
} from "@/lib/demo/schedule-control-center-data";
import {
  computeFreeGapsWithinWindow,
  computeSuggestedSlots,
  formatAthensHmFromUtcMs,
  therapistBusyIntervals,
} from "@/lib/schedule/control-center-prototype-utils";
import type { AppointmentDraftState } from "@/components/schedule-control-center/AppointmentCreationPanel";
import type { SpecialtyAvailabilityRow } from "@/components/schedule-control-center/AvailabilityPanel";
import { RightSidebar } from "@/components/schedule-control-center/RightSidebar";
import { ScheduleGrid } from "@/components/schedule-control-center/ScheduleGrid";
import {
  ScheduleGridSlot,
  ScheduleScaleProvider,
  useScheduleScale,
} from "@/components/schedule-control-center/scale-context";
import { StickyHeader } from "@/components/schedule-control-center/StickyHeader";
import type { TherapistColumnDef } from "@/components/schedule-control-center/types";

type Props = { dateYmd: string };

function buildControlCenterHref(dateYmd: string): string {
  return `/schedule/control-center?date=${encodeURIComponent(dateYmd)}`;
}

function statusLabelEl(s: SessionStatus): string {
  const m: Record<string, string> = {
    scheduled: "Προγραμματισμένη",
    completed: "Ολοκληρωμένη",
    cancelled: "Ακυρωμένη",
    no_show: "Δεν προσήλθε",
    absence: "Απουσία",
    to_reschedule: "Προς επαναπρογραμματισμό",
  };
  return m[s] ?? s;
}

function formatAthensWeekdayLongFromYmd(ymd: string): string {
  return new Intl.DateTimeFormat("el-GR", { timeZone: "Europe/Athens", weekday: "long" }).format(new Date(`${ymd}T12:00:00.000Z`));
}

function formatAthensFullDateFromYmd(ymd: string): string {
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${ymd}T12:00:00.000Z`));
}

function ScheduleBoard({
  dateYmd,
  win,
  side50Columns,
  main45Columns,
  blocksByTherapist,
  conflictMap,
  selectedId,
  onSelect,
  showPresetBreakMarkers,
  freeOverlaysByTherapist,
}: {
  dateYmd: string;
  win: ReturnType<typeof athensOperationalWindowMs>;
  side50Columns: TherapistColumnDef[];
  main45Columns: TherapistColumnDef[];
  blocksByTherapist: Map<string, ControlBoardBlock[]>;
  conflictMap: Map<string, string[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showPresetBreakMarkers: boolean;
  freeOverlaysByTherapist: Map<string, { startMs: number; endMs: number }[]>;
}) {
  const { fitsWithoutHorizontalScroll } = useScheduleScale();

  if (side50Columns.length === 0 && main45Columns.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-xs text-ink-muted">
        Δεν υπάρχουν στήλες με τα τρέχοντα φίλτρα.
      </div>
    );
  }

  const boardW = fitsWithoutHorizontalScroll ? "w-full" : "min-w-max";

  return (
    <div className={`flex h-full flex-col ${boardW}`}>
      <StickyHeader side50Columns={side50Columns} main45Columns={main45Columns} />
      <ScheduleGrid
        dateYmd={dateYmd}
        win={win}
        side50Columns={side50Columns}
        main45Columns={main45Columns}
        blocksByTherapist={blocksByTherapist}
        conflictMap={conflictMap}
        selectedId={selectedId}
        onSelect={onSelect}
        showPresetBreakMarkers={showPresetBreakMarkers}
        freeOverlaysByTherapist={freeOverlaysByTherapist}
      />
    </div>
  );
}

export function ScheduleControlCenter({ dateYmd }: Props) {
  const initialBlocks = useMemo(() => shiftControlCenterDemoBlocksToYmd(dateYmd), [dateYmd]);
  const win = useMemo(() => athensOperationalWindowMs(dateYmd), [dateYmd]);

  const [centerId, setCenterId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [disciplineCode, setDisciplineCode] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFreeSlots, setShowFreeSlots] = useState(false);
  const [freeDurationNeed, setFreeDurationNeed] = useState<45 | 50 | 90>(45);
  const [freeSpecialtyFilter, setFreeSpecialtyFilter] = useState("");
  const [freeTherapistFilter, setFreeTherapistFilter] = useState("");
  const [freeAfterMinuteFrom13, setFreeAfterMinuteFrom13] = useState(0);
  const [showPresetBreakMarkers, setShowPresetBreakMarkers] = useState(true);
  const [createHighlight, setCreateHighlight] = useState<"45" | "90" | "suggest" | null>(null);
  const [appointmentDraft, setAppointmentDraft] = useState<AppointmentDraftState>(() => ({
    therapistUserId: "",
    disciplineCode: "",
    childLabel: "",
    roomId: "",
    dateYmd,
    startHm: "",
    durationMin: 45,
  }));

  const patchDraft = useCallback((patch: Partial<AppointmentDraftState>) => {
    setAppointmentDraft((d) => ({ ...d, ...patch, dateYmd }));
  }, [dateYmd]);

  useEffect(() => {
    setAppointmentDraft((d) => (d.dateYmd === dateYmd ? d : { ...d, dateYmd }));
  }, [dateYmd]);

  const orderedTherapists = useMemo(
    () =>
      [...CONTROL_CENTER_DEMO_THERAPISTS].sort((a, b) => {
        const t = controlCenterTherapistColumnTier(a.user_id) - controlCenterTherapistColumnTier(b.user_id);
        return t !== 0 ? t : a.display_name.localeCompare(b.display_name, "el");
      }),
    []
  );

  const filtered = useMemo(() => {
    return initialBlocks.filter((b) => {
      if (centerId) {
        const c = CONTROL_CENTER_DEMO_CENTERS.find((x) => x.id === centerId);
        if (!c) return false;
        if (b.centerId) return b.centerId === centerId;
        return b.centerLabel === c.name;
      }
      if (therapistId && !(b.therapistUserIds ?? []).includes(therapistId)) return false;
      if (roomId) {
        const r = CONTROL_CENTER_DEMO_ROOMS.find((x) => x.id === roomId);
        if (!r) return false;
        if (b.roomId) return b.roomId === roomId;
        return b.roomLabel === r.name;
      }
      if (disciplineCode && b.disciplineCode !== disciplineCode) return false;
      if (status && b.status !== status) return false;
      return blockIntervalInWindowMs(b, dateYmd) !== null;
    });
  }, [initialBlocks, centerId, therapistId, roomId, disciplineCode, status, dateYmd]);

  const blocksForAvailability = useMemo(() => {
    if (!centerId) return filtered;
    const c = CONTROL_CENTER_DEMO_CENTERS.find((x) => x.id === centerId);
    if (!c) return filtered;
    return filtered.filter((b) => (b.centerId ? b.centerId === centerId : b.centerLabel === c.name));
  }, [filtered, centerId]);

  const blocksByTherapist = useMemo(() => indexControlCenterBlocksByTherapist(filtered), [filtered]);

  const side50Columns: TherapistColumnDef[] = useMemo(() => {
    const base = orderedTherapists
      .filter((t) => isControlCenterSide50Therapist(t.user_id))
      .map((t) => ({ userId: t.user_id, displayName: t.display_name }));
    return therapistId ? base.filter((c) => c.userId === therapistId) : base;
  }, [orderedTherapists, therapistId]);

  const main45Columns: TherapistColumnDef[] = useMemo(() => {
    const base = orderedTherapists
      .filter((t) => !isControlCenterSide50Therapist(t.user_id))
      .map((t) => ({ userId: t.user_id, displayName: t.display_name }));
    return therapistId ? base.filter((c) => c.userId === therapistId) : base;
  }, [orderedTherapists, therapistId]);

  const conflictMap = useMemo(
    () => annotateConflicts(filtered, dateYmd, { exemptStructuredBreakTherapistIds: CONTROL_CENTER_SIDE50_THERAPIST_IDS }),
    [filtered, dateYmd]
  );

  const specialtyNameElByCode = useMemo(
    () => Object.fromEntries(CONTROL_CENTER_DEMO_DISCIPLINES.map((d) => [d.code, d.name_el])),
    []
  );

  const therapistNames = useMemo(
    () => Object.fromEntries(CONTROL_CENTER_DEMO_THERAPISTS.map((t) => [t.user_id, t.display_name])),
    []
  );

  const roomConflicts = useMemo(() => {
    const byRoom = new Map<string, { iv: { startMs: number; endMs: number } }[]>();
    for (const b of blocksForAvailability) {
      const rid = b.roomId ?? "";
      if (!rid) continue;
      const iv = blockIntervalInWindowMs(b, dateYmd);
      if (!iv) continue;
      const arr = byRoom.get(rid) ?? [];
      arr.push({ iv });
      byRoom.set(rid, arr);
    }
    const conflictRooms = new Set<string>();
    for (const [rid, rows] of byRoom) {
      for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
          if (rows[i].iv.startMs < rows[j].iv.endMs && rows[j].iv.startMs < rows[i].iv.endMs) {
            conflictRooms.add(rid);
          }
        }
      }
    }
    return conflictRooms;
  }, [blocksForAvailability, dateYmd]);

  const specialtyRows: SpecialtyAvailabilityRow[] = useMemo(() => {
    return CONTROL_CENTER_DEMO_DISCIPLINES.filter((d) => d.code !== "brk").map((d) => {
      const tids = CONTROL_CENTER_DEMO_THERAPISTS.filter(
        (t) => CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[t.user_id] === d.code
      ).map((t) => t.user_id);
      let next45Ms: number | null = null;
      let next90Ms: number | null = null;
      for (const tid of tids) {
        const busy = therapistBusyIntervals(tid, blocksForAvailability, dateYmd, true);
        const e45 = computeFreeGapsWithinWindow(win, busy, 45)[0];
        const e90 = computeFreeGapsWithinWindow(win, busy, 90)[0];
        if (e45 && (!next45Ms || e45.startMs < next45Ms)) next45Ms = e45.startMs;
        if (e90 && (!next90Ms || e90.startMs < next90Ms)) next90Ms = e90.startMs;
      }
      const names = CONTROL_CENTER_DEMO_THERAPISTS.filter((t) => tids.includes(t.user_id)).map((t) => t.display_name);
      return {
        code: d.code,
        name: d.name_el,
        therapists: names.length ? names.join(", ") : "—",
        next45El: next45Ms != null ? formatAthensHmFromUtcMs(next45Ms) : "—",
        next90El: next90Ms != null ? formatAthensHmFromUtcMs(next90Ms) : "—",
      };
    });
  }, [blocksForAvailability, dateYmd, win]);

  const suggestedSlots = useMemo(() => {
    const discTids =
      freeSpecialtyFilter.length > 0
        ? CONTROL_CENTER_DEMO_THERAPISTS.filter((t) => CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[t.user_id] === freeSpecialtyFilter).map(
            (t) => t.user_id
          )
        : null;
    const therapistAllow = freeTherapistFilter ? [freeTherapistFilter] : therapistId ? [therapistId] : null;
    return computeSuggestedSlots({
      blocks: blocksForAvailability,
      dateYmd,
      win,
      durationMin: freeDurationNeed,
      therapistIdsAllow: therapistAllow,
      disciplineTherapistIds: discTids?.length ? discTids : null,
      rooms: CONTROL_CENTER_DEMO_ROOMS.map((r) => ({ id: r.id, short_label: r.short_label })),
      therapistNames,
      therapistPrimarySpecialtyCode: CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE,
      specialtyNameElByCode,
      maxResults: 8,
    }).filter((s) => (s.startMs - win.startMs) / 60_000 >= freeAfterMinuteFrom13);
  }, [
    blocksForAvailability,
    dateYmd,
    win,
    freeDurationNeed,
    therapistId,
    freeSpecialtyFilter,
    freeTherapistFilter,
    freeAfterMinuteFrom13,
    therapistNames,
    specialtyNameElByCode,
  ]);

  const freeOverlaysByTherapist = useMemo(() => {
    const map = new Map<string, { startMs: number; endMs: number }[]>();
    if (!showFreeSlots) return map;
    const visibleIds = [...side50Columns, ...main45Columns].map((c) => c.userId);
    for (const tid of visibleIds) {
      if (freeSpecialtyFilter && CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[tid] !== freeSpecialtyFilter) continue;
      const busy = therapistBusyIntervals(tid, blocksForAvailability, dateYmd, false);
      const gaps = computeFreeGapsWithinWindow(win, busy, freeDurationNeed).filter(
        (g) => (g.startMs - win.startMs) / 60_000 >= freeAfterMinuteFrom13 && g.minutes >= freeDurationNeed
      );
      if (gaps.length) map.set(tid, gaps.map((g) => ({ startMs: g.startMs, endMs: g.endMs })));
    }
    return map;
  }, [
    showFreeSlots,
    side50Columns,
    main45Columns,
    blocksForAvailability,
    dateYmd,
    win,
    freeDurationNeed,
    freeSpecialtyFilter,
    freeAfterMinuteFrom13,
  ]);

  const selected = selectedId ? (filtered.find((b) => b.id === selectedId) ?? null) : null;
  const conflictBlockCount = useMemo(
    () => filtered.filter((b) => (conflictMap.get(b.id)?.length ?? 0) > 0).length,
    [filtered, conflictMap]
  );
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const scrollToAvailability = useCallback(() => {
    setCreateHighlight("suggest");
    setFreeDurationNeed(appointmentDraft.durationMin);
    document.getElementById("cc-availability-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [appointmentDraft.durationMin]);

  const prevYmd = addDaysAthensCalendar(dateYmd, -1);
  const nextYmd = addDaysAthensCalendar(dateYmd, 1);

  const roomsForPanel = useMemo(
    () => (centerId ? CONTROL_CENTER_DEMO_ROOMS_PANEL.filter((r) => r.center_id === centerId) : CONTROL_CENTER_DEMO_ROOMS_PANEL),
    [centerId]
  );

  const boardRef = useRef<HTMLDivElement>(null);
  const gridSlotRef = useRef<HTMLDivElement>(null);

  const therapistDisplayNames = useMemo(
    () => [...side50Columns, ...main45Columns].map((c) => c.displayName),
    [side50Columns, main45Columns]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-semibold capitalize text-clinical-950">{formatAthensWeekdayLongFromYmd(dateYmd)}</p>
          <p className="text-[11px] tabular-nums text-ink-muted">{formatAthensFullDateFromYmd(dateYmd)} · 13:00–21:00</p>
          <span className="hidden text-[10px] text-amber-900/90 sm:inline">Πρωτότυπο read-only</span>
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-white px-0.5">
          <Link href={buildControlCenterHref(prevYmd)} className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-surface-muted" aria-label="Προηγούμενη ημέρα">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
          <Link href={buildControlCenterHref(nextYmd)} className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-surface-muted" aria-label="Επόμενη ημέρα">
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <details className="shrink-0 rounded-md border border-border bg-surface-card text-xs shadow-sm">
        <summary className="cursor-pointer px-2 py-1 font-semibold text-ink-muted">Φίλτρα & κενά</summary>
        <div className="space-y-2 border-t border-border/60 p-2">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="Κέντρο" value={centerId} onChange={setCenterId} options={[{ v: "", l: "Όλα" }, ...CONTROL_CENTER_DEMO_CENTERS.map((c) => ({ v: c.id, l: c.name }))]} />
          <FilterSelect
            label="Θεραπευτής"
            value={therapistId}
            onChange={setTherapistId}
            options={[{ v: "", l: "Όλοι" }, ...orderedTherapists.map((t) => ({ v: t.user_id, l: t.display_name }))]}
          />
          <FilterSelect
            label="Αίθουσα"
            value={roomId}
            onChange={setRoomId}
            options={[{ v: "", l: "Όλες" }, ...CONTROL_CENTER_DEMO_ROOMS.map((r) => ({ v: r.id, l: `${r.short_label} — ${r.name}` }))]}
          />
          <FilterSelect
            label="Ειδικότητα"
            value={disciplineCode}
            onChange={setDisciplineCode}
            options={[{ v: "", l: "Όλες" }, ...CONTROL_CENTER_DEMO_DISCIPLINES.map((d) => ({ v: d.code, l: d.name_el }))]}
          />
          <FilterSelect
            label="Κατάσταση"
            value={status}
            onChange={setStatus}
            options={[{ v: "", l: "Όλες" }, ...CONTROL_CENTER_DEMO_STATUSES.map((s) => ({ v: s.value, l: s.label_el }))]}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-2 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={showFreeSlots} onChange={(e) => setShowFreeSlots(e.target.checked)} className="rounded border-border" />
            Κενά στο πλέγμα
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={showPresetBreakMarkers} onChange={(e) => setShowPresetBreakMarkers(e.target.checked)} className="rounded border-border" />
            Διάλ. 15′ (φόντο)
          </label>
          <label className="flex items-center gap-1.5 text-ink-muted">
            <span>Διάρκεια κενού</span>
            <select
              className="rounded border border-border bg-white px-1.5 py-0.5 text-xs"
              value={String(freeDurationNeed)}
              onChange={(e) => setFreeDurationNeed(Number(e.target.value) as 45 | 50 | 90)}
            >
              <option value="45">45′</option>
              <option value="50">50′</option>
              <option value="90">90′</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-ink-muted">
            <span>Μετά λεπτό</span>
            <input
              type="number"
              min={0}
              max={479}
              className="w-14 rounded border border-border bg-white px-1 py-0.5 text-xs tabular-nums"
              value={freeAfterMinuteFrom13}
              onChange={(e) => setFreeAfterMinuteFrom13(Math.min(479, Math.max(0, Number(e.target.value) || 0)))}
            />
          </label>
        </div>
        </div>
      </details>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
      <div
        ref={boardRef}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-clinical-50/40 px-2 py-0.5 text-[9px] text-ink-muted">
          <span>
            <strong className="text-ink">45′</strong> · <strong className="text-violet-950">50′</strong> · <strong>21:00</strong>
          </span>
          <span className="tabular-nums text-ink-faint">
            {filtered.length} μπλοκ · {conflictBlockCount} σύγκρ.
          </span>
        </div>
        <ScheduleScaleProvider
          boardRef={boardRef}
          gridSlotRef={gridSlotRef}
          side50Count={side50Columns.length}
          main45Count={main45Columns.length}
          visibleBlocks={filtered}
          therapistDisplayNames={therapistDisplayNames}
        >
          <ScheduleGridSlot gridSlotRef={gridSlotRef}>
            <ScheduleBoard
              dateYmd={dateYmd}
              win={win}
              side50Columns={side50Columns}
              main45Columns={main45Columns}
              blocksByTherapist={blocksByTherapist}
              conflictMap={conflictMap}
              selectedId={selectedId}
              onSelect={handleSelect}
              showPresetBreakMarkers={showPresetBreakMarkers}
              freeOverlaysByTherapist={freeOverlaysByTherapist}
            />
          </ScheduleGridSlot>
        </ScheduleScaleProvider>
      </div>

      <RightSidebar
        selected={selected}
        statusLabel={selected ? statusLabelEl(selected.status) : ""}
        therapistNames={therapistNames}
        createHighlight={createHighlight}
        on45={() => {
          setCreateHighlight("45");
          patchDraft({ durationMin: 45 });
          setFreeDurationNeed(45);
          setShowFreeSlots(true);
        }}
        on90={() => {
          setCreateHighlight("90");
          patchDraft({ durationMin: 90 });
          setFreeDurationNeed(90);
          setShowFreeSlots(true);
        }}
        onSuggest={scrollToAvailability}
        appointmentDraft={appointmentDraft}
        onDraftChange={patchDraft}
        blocksForAvailability={blocksForAvailability}
        specialtyRows={specialtyRows}
        suggestedSlots={suggestedSlots}
        freeDurationNeed={freeDurationNeed}
        freeSpecialtyFilter={freeSpecialtyFilter}
        freeTherapistFilter={freeTherapistFilter}
        onSpecialtyFilter={setFreeSpecialtyFilter}
        onTherapistFilter={setFreeTherapistFilter}
        onDurationNeed={setFreeDurationNeed}
        dateYmd={dateYmd}
        win={win}
        roomsForPanel={roomsForPanel}
        roomConflicts={roomConflicts}
      />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="block text-xs text-ink-muted">
      {label}
      <select className="mt-0.5 w-full rounded-md border border-border bg-white px-2 py-1 text-sm text-ink" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.v || "__all"} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}
