"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { useDiagnosisDocuments } from "./DiagnosesChargeProvider";
import {
  DIAGNOSIS_BADGE_CLASS,
  diagnosisBadgeForChild,
} from "@/lib/secretary/diagnoses/diagnosis-queries";

type Props = {
  childId: string;
  className?: string;
  compact?: boolean;
};

/** Worst diagnosis status badge for a child (profile, schedule, tasks, reports). */
export function ChildDiagnosisBadge({ childId, className = "", compact = false }: Props) {
  const docs = useDiagnosisDocuments();
  const badge = diagnosisBadgeForChild(docs, childId);
  if (!badge) return null;

  return (
    <Link
      href={badge.href}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold hover:opacity-90 ${DIAGNOSIS_BADGE_CLASS[badge.tone]} ${className}`}
      title={badge.title}
    >
      <Stethoscope className="h-3 w-3 shrink-0" aria-hidden />
      {compact ? (badge.tone === "red" || badge.tone === "dark_red" ? "!" : "Δ") : badge.label}
    </Link>
  );
}
