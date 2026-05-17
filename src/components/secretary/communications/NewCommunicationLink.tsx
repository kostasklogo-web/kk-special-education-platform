"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

export type NewCommunicationParams = {
  childId?: string | null;
  childLabel?: string | null;
  appointment?: string | null;
  payment?: string | null;
  diagnosis?: string | null;
  report?: string | null;
  task?: string | null;
};

export function buildNewCommunicationHref(params: NewCommunicationParams): string {
  const q = new URLSearchParams();
  q.set("action", "create");
  if (params.childId) q.set("childId", params.childId);
  if (params.childLabel) q.set("child", params.childLabel);
  if (params.appointment) q.set("appointment", params.appointment);
  if (params.payment) q.set("payment", params.payment);
  if (params.diagnosis) q.set("diagnosis", params.diagnosis);
  if (params.report) q.set("report", params.report);
  if (params.task) q.set("task", params.task);
  return `/secretary/communications?${q.toString()}`;
}

const sizeClasses = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-xs",
  lg: "min-h-[44px] px-4 text-sm",
} as const;

type Props = {
  params: NewCommunicationParams;
  className?: string;
  size?: keyof typeof sizeClasses;
};

/** Quick link to open the create-communication modal with optional entity prefill. */
export function NewCommunicationLink({ params, className = "", size = "md" }: Props) {
  return (
    <Link
      href={buildNewCommunicationHref(params)}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-white font-semibold text-clinical-700 shadow-sm hover:bg-clinical-50 ${sizeClasses[size]} ${className}`}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      Νέα Επικοινωνία
    </Link>
  );
}
