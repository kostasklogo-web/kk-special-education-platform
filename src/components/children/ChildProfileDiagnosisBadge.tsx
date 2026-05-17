"use client";

import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";

type Props = { childId: string };

export function ChildProfileDiagnosisBadge({ childId }: Props) {
  return <ChildDiagnosisBadge childId={childId} />;
}
