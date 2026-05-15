import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import type { WindowMs } from "@/lib/schedule/control-center-prototype-utils";
import type { CellRect } from "./cell-layout";

export type TherapistColumnDef = { userId: string; displayName: string };

/** Shared props for appointment cells rendered on the grid. */
export type ScheduleCellBaseProps = {
  block: ControlBoardBlock;
  rect: CellRect;
  isSelected: boolean;
  conflictReasons: string[] | undefined;
  zIndex: number;
  onSelect: (id: string) => void;
};

export type TherapistColumnKind = "main45" | "side50";

export type TherapistColumnProps = {
  columnKind: TherapistColumnKind;
  column: TherapistColumnDef;
  colWidth: number;
  blocks: ControlBoardBlock[];
  dateYmd: string;
  win: WindowMs;
  conflictMap: Map<string, string[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showStructuredBreakShading: boolean;
  freeOverlays?: { startMs: number; endMs: number }[];
  hideHeader?: boolean;
};
