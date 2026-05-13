import type { RoomStatus, RoomType } from "@/lib/data/rooms/types";

export const ROOM_TYPE_LABELS_EL: Record<RoomType, string> = {
  speech_therapy: "Λογοθεραπείας",
  occupational_therapy: "Εργοθεραπείας",
  psychotherapy: "Ψυχοθεραπείας",
  group_program: "Ομαδικού Προγράμματος",
  assessment: "Αξιολόγησης",
  office: "Γραφείο",
  other: "Άλλο",
};

export const ROOM_STATUS_LABELS_EL: Record<RoomStatus, string> = {
  active: "Ενεργή",
  inactive: "Ανενεργή",
  maintenance: "Υπό Συντήρηση",
};

export function roomTypeLabelEl(code: RoomType | string): string {
  return ROOM_TYPE_LABELS_EL[code as RoomType] ?? code;
}

export function roomStatusLabelEl(code: RoomStatus | string): string {
  return ROOM_STATUS_LABELS_EL[code as RoomStatus] ?? code;
}
