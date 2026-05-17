const KEY_PREFIX = "secretary-complete-today";

function storageKey(dateYmd: string): string {
  return `${KEY_PREFIX}-${dateYmd}`;
}

export function loadCompletedTodayIds(dateYmd: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(dateYmd));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function saveCompletedTodayIds(dateYmd: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(dateYmd), JSON.stringify([...ids]));
}

export function toggleCompletedToday(dateYmd: string, itemId: string): Set<string> {
  const next = loadCompletedTodayIds(dateYmd);
  if (next.has(itemId)) next.delete(itemId);
  else next.add(itemId);
  saveCompletedTodayIds(dateYmd, next);
  return next;
}

export function clearCompletedToday(dateYmd: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(dateYmd));
}

export function markAllCompletedToday(dateYmd: string, itemIds: string[]): Set<string> {
  const next = new Set([...loadCompletedTodayIds(dateYmd), ...itemIds]);
  saveCompletedTodayIds(dateYmd, next);
  return next;
}
