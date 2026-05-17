"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useSecretaryTasks } from "./TasksChargeProvider";
import {
  openTasksForChild,
  openTasksLinkedToAppointment,
  openTasksLinkedToDiagnosis,
  openTasksLinkedToPayment,
  openTasksLinkedToReport,
  openTasksLinkedToMeeting,
  taskBadgeLabel,
  taskBadgeTone,
  TASK_BADGE_CLASS,
  worstOpenTaskForChild,
} from "@/lib/secretary/tasks/task-queries";
import type { EntityLink } from "./entity-link-types";

type Props = {
  link: EntityLink;
  className?: string;
};

export function EntityLinkedTasksBadge({ link, className = "" }: Props) {
  const today = todayAthensYmd();
  const tasks = useSecretaryTasks();

  const open = (() => {
    switch (link.kind) {
      case "child":
        return openTasksForChild(tasks, link.childId, today);
      case "payment":
        return openTasksLinkedToPayment(tasks, link.paymentId, today);
      case "appointment":
        return openTasksLinkedToAppointment(tasks, link.appointmentId, today);
      case "diagnosis":
        return openTasksLinkedToDiagnosis(tasks, link.diagnosisId, today);
      case "report":
        return openTasksLinkedToReport(tasks, link.reportId, today);
      case "meeting":
        return openTasksLinkedToMeeting(tasks, link.meetingId, today);
    }
  })();

  if (open.length === 0) return null;

  const worst =
    link.kind === "child"
      ? worstOpenTaskForChild(tasks, link.childId, today)
      : open[0];
  const label = taskBadgeLabel(open.length, worst);
  const tone = worst ? taskBadgeTone(worst) : "neutral";

  const href = (() => {
    switch (link.kind) {
      case "child":
        return `/secretary/tasks?child=${encodeURIComponent(link.childId)}`;
      case "payment":
        return `/secretary/tasks?payment=${link.paymentId}`;
      case "appointment":
        return `/secretary/tasks?appointment=${link.appointmentId}`;
      case "diagnosis":
        return `/secretary/tasks?diagnosis=${link.diagnosisId}`;
      case "report":
        return `/secretary/tasks?report=${link.reportId}`;
      case "meeting":
        return `/secretary/tasks?meeting=${link.meetingId}`;
    }
  })();

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold hover:opacity-90 ${TASK_BADGE_CLASS[tone]} ${className}`}
      title={open.map((t) => t.title).join(" · ")}
    >
      <ListTodo className="h-3 w-3" />
      {label}
    </Link>
  );
}
