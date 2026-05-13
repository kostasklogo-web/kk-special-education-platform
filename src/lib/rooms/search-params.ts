import type { RoomFilters } from "@/lib/data/rooms/types";

export type RoomsPageSearch = {
  filters: RoomFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export function parseRoomsSearchParams(
  raw: Record<string, string | string[] | undefined>
): RoomsPageSearch {
  const filters: RoomFilters = {
    centerId: firstString(raw.center) || null,
    roomType: firstString(raw.type) || null,
    status: firstString(raw.status) || null,
  };
  return { filters };
}

export function buildRoomsHref(filters?: RoomFilters): string {
  const p = new URLSearchParams();
  const f = filters;
  if (f?.centerId) p.set("center", f.centerId);
  if (f?.roomType) p.set("type", f.roomType);
  if (f?.status) p.set("status", f.status);
  const qs = p.toString();
  return qs ? `/rooms?${qs}` : "/rooms";
}
