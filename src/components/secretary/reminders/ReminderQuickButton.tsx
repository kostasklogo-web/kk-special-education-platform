"use client";

import { Bell } from "lucide-react";
import { useReminders } from "./ReminderProvider";
import type { OpenReminderPayload } from "./reminder-payload";

type Props = {
  payload: OpenReminderPayload;
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function ReminderQuickButton({
  payload,
  label = "Υπενθύμιση",
  variant = "ghost",
  className = "",
}: Props) {
  const { openReminder } = useReminders();

  const cls =
    variant === "primary"
      ? "bg-clinical-600 text-white hover:bg-clinical-700 border-transparent"
      : "border-border bg-white text-clinical-800 hover:bg-clinical-50";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openReminder(payload);
      }}
      className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${cls} ${className}`}
    >
      <Bell className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
