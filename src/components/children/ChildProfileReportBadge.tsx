"use client";

import { ChildReportBadge } from "@/components/secretary/reports/ChildReportBadge";

type Props = { childId: string };

export function ChildProfileReportBadge({ childId }: Props) {
  return <ChildReportBadge childId={childId} />;
}
