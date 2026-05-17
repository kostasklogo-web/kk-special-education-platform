"use client";

import {
  Bell,
  CalendarPlus,
  ClipboardList,
  Download,
  MessageCircle,
  Printer,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import type { SecretaryScheduleTypeCode } from "@/lib/secretary/schedule-catalog";

export type ScheduleQuickAction = {
  typeCode?: SecretaryScheduleTypeCode;
  label: string;
  icon: typeof CalendarPlus;
  variant?: "primary" | "secondary";
};

const QUICK_CREATE: ScheduleQuickAction[] = [
  { label: "Νέο Ραντεβού", icon: CalendarPlus, variant: "primary" },
  { typeCode: "evaluation", label: "Νέα Αξιολόγηση", icon: Stethoscope },
  { typeCode: "history_taking", label: "Νέα Λήψη Ιστορικού", icon: ClipboardList },
  { typeCode: "parent_info", label: "Νέο Ενημερωτικό", icon: UserPlus },
  { typeCode: "supervision", label: "Νέα Εποπτεία", icon: Users },
  { typeCode: "school_comm", label: "Νέα Επικοινωνία", icon: MessageCircle },
];

type Props = {
  readOnly?: boolean;
  onQuickCreate: (typeCode?: SecretaryScheduleTypeCode) => void;
  onSendReminder: () => void;
  onPrint: () => void;
  onExport: () => void;
};

export function ScheduleToolbar({
  readOnly,
  onQuickCreate,
  onSendReminder,
  onPrint,
  onExport,
}: Props) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-white p-3 shadow-sm">
      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          {QUICK_CREATE.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.variant === "primary";
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => onQuickCreate(action.typeCode)}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${
                  isPrimary
                    ? "bg-clinical-600 text-white hover:bg-clinical-700"
                    : "border border-border bg-surface-muted/50 text-ink hover:bg-surface-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-2">
        <button
          type="button"
          onClick={onSendReminder}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-clinical-600/80 bg-clinical-50 px-3 text-xs font-bold text-clinical-800 sm:flex-none"
        >
          <Bell className="h-3.5 w-3.5" aria-hidden />
          Αποστολή Υπενθύμισης
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-ink hover:bg-surface-muted sm:flex-none"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          Εκτύπωση Ημερήσιου
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-ink hover:bg-surface-muted sm:flex-none"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Εξαγωγή Excel
        </button>
      </div>
    </div>
  );
}
