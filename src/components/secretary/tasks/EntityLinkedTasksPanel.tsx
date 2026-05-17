"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useSecretaryTasks } from "./TasksChargeProvider";
import { EntityLinkedTasksBadge } from "./EntityLinkedTasksBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import type { EntityLink } from "@/components/secretary/tasks/entity-link-types";
import {
  openTasksForChild,
  openTasksLinkedToAppointment,
  openTasksLinkedToDiagnosis,
  openTasksLinkedToPayment,
  openTasksLinkedToReport,
  openTasksLinkedToMeeting,
} from "@/lib/secretary/tasks/task-queries";

type Props = {
  link: EntityLink;
  title?: string;
};

export function EntityLinkedTasksPanel({ link, title = "Σχετικές εκκρεμότητες" }: Props) {
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
      default:
        return [];
    }
  })();

  if (open.length === 0) return null;

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <ListTodo className="h-4 w-4 text-sky-700" />
          {title}
        </div>
        <EntityLinkedTasksBadge link={link} />
      </div>
      <ul className="space-y-1.5">
        {open.slice(0, 4).map((t) => (
          <li key={t.id}>
            <Link
              href={`/secretary/tasks?task=${t.id}`}
              className="flex items-center justify-between gap-2 rounded-md border border-sky-100 bg-white px-2 py-1.5 hover:bg-sky-50"
            >
              <span className="min-w-0 truncate font-medium text-ink">{t.title}</span>
              <TaskStatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
