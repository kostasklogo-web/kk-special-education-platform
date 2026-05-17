"use client";

import { MessageCircle } from "lucide-react";
import { useReminders } from "./ReminderProvider";
import type { OpenReminderPayload } from "./reminder-payload";

type Props = {
  payload: OpenReminderPayload;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "sm" | "md";
};

export function CommunicationButton({
  payload,
  label = "Επικοινωνία",
  variant = "secondary",
  className = "",
  size = "md",
}: Props) {
  const { openReminder } = useReminders();

  const height = size === "sm" ? "min-h-[36px] text-xs" : "min-h-[44px] text-sm";
  const variantCls =
    variant === "primary"
      ? "bg-clinical-600 text-white hover:bg-clinical-700 border-transparent shadow-sm"
      : variant === "ghost"
        ? "border-border bg-white text-clinical-800 hover:bg-clinical-50"
        : "border-clinical-600/80 bg-white text-clinical-800 hover:bg-clinical-50";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openReminder(payload);
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 font-bold ${height} ${variantCls} ${className}`}
    >
      <MessageCircle className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      {label}
    </button>
  );
}
