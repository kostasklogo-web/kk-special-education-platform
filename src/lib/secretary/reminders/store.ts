export const REMINDERS_UPDATED_EVENT = "secretary-reminders-updated";

export function notifyRemindersUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REMINDERS_UPDATED_EVENT));
}
