"use client";

import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildChildCommunicationPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import type { ChildListItem, ParentLinkRow } from "@/lib/data/children/types";

type Props = {
  child: Pick<ChildListItem, "id" | "first_name" | "last_name">;
  parentLinks: ParentLinkRow[];
};

export function ChildDetailCommunicationButton({ child, parentLinks }: Props) {
  const { consents } = useReminders();
  const payload = buildChildCommunicationPayload(child, parentLinks, consents);

  return <CreateReminderButton payload={payload} variant="secondary" />;
}
