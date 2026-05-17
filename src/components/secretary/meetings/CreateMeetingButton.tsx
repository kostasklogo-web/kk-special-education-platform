"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { SecretaryAppointment, SecretaryMeeting } from "@/lib/secretary/types";
import { SECRETARY_DEMO_APPOINTMENTS } from "@/lib/demo/secretary-demo-data";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { CreateMeetingModal } from "./CreateMeetingModal";

type Props = {
  prefill?: Partial<SecretaryMeeting>;
  appointments?: SecretaryAppointment[];
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "sm" | "md";
  onCreated?: () => void;
};

export function CreateMeetingButton({
  prefill,
  appointments = SECRETARY_DEMO_APPOINTMENTS,
  label = "Συνάντηση",
  variant = "secondary",
  className = "",
  size = "md",
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const today = todayAthensYmd();

  const height = size === "sm" ? "min-h-[36px] text-xs" : "min-h-[44px] text-sm";
  const variantCls =
    variant === "primary"
      ? "bg-clinical-600 text-white hover:bg-clinical-700 border-transparent shadow-sm"
      : variant === "ghost"
        ? "border-border bg-white text-clinical-800 hover:bg-clinical-50"
        : "border-clinical-600/80 bg-white text-clinical-800 hover:bg-clinical-50";

  return (
    <>
      <button
        type="button"
        title="Προγραμματισμός συνάντησης / εποπτείας"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 font-bold ${height} ${variantCls} ${className}`}
      >
        <Users className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
        {label}
      </button>
      {open ? (
        <CreateMeetingModal
          todayYmd={today}
          appointments={appointments}
          prefill={prefill}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            onCreated?.();
          }}
        />
      ) : null}
    </>
  );
}
