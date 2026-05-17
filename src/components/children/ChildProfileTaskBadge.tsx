"use client";

import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";

type Props = { childId: string };

export function ChildProfileTaskBadge({ childId }: Props) {
  return <EntityLinkedTasksBadge link={{ kind: "child", childId }} />;
}
