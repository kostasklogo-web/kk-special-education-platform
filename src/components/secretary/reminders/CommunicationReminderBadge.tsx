"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import type { CommunicationLog } from "@/lib/secretary/types";
import {
  isReminderCommunication,
  reminderPageHref,
} from "@/lib/secretary/reminders/reminder-communication";

type Props = { log: CommunicationLog; className?: string };

export function CommunicationReminderBadge({ log, className = "" }: Props) {
  if (!isReminderCommunication(log)) return null;

  return (
    <Link
      href={reminderPageHref(log)}
      className={`inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 hover:bg-amber-100 ${className}`}
      title="Καταγραφή από υπενθύμιση"
    >
      <Bell className="h-2.5 w-2.5" />
      Υπενθύμιση
    </Link>
  );
}
