"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { useDiagnosisDocuments } from "./DiagnosesChargeProvider";
import { DIAGNOSIS_BADGE_CLASS } from "@/lib/secretary/diagnoses/diagnosis-queries";
import { DIAGNOSIS_STATUS_LABELS } from "@/lib/secretary/diagnoses/labels";

type Props = { task: SecretaryTask; className?: string };

/** Badge on task rows linked to a diagnosis document or diagnosis follow-up type. */
export function TaskDiagnosisBadge({ task, className = "" }: Props) {
  const docs = useDiagnosisDocuments();
  const isDiagnosisTask =
    task.taskTypeCode === "diagnosis_followup" ||
    !!task.linkedDiagnosisId ||
    task.notes.includes("milestone:");

  if (!isDiagnosisTask && !task.childId) return null;

  const doc = task.linkedDiagnosisId
    ? docs.find((d) => d.id === task.linkedDiagnosisId)
    : docs.find(
        (d) =>
          d.childId === task.childId &&
          !d.archived &&
          d.renewalRequired &&
          !d.renewedAt
      );

  const tone =
    doc?.status === "expired"
      ? "red"
      : doc && ["expiring_7", "expiring_30"].includes(doc.status)
        ? "yellow"
        : "yellow";

  const href = task.linkedDiagnosisId
    ? `/secretary/diagnoses?doc=${task.linkedDiagnosisId}`
    : task.childId
      ? `/secretary/diagnoses?child=${encodeURIComponent(task.childLabel ?? "")}`
      : "/secretary/diagnoses";

  const label = doc
    ? DIAGNOSIS_STATUS_LABELS[doc.status].slice(0, 12)
    : "Γνωμάτευση";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${DIAGNOSIS_BADGE_CLASS[tone]} ${className}`}
      title={doc ? `${doc.documentType} · ${doc.expiryDate}` : task.title}
    >
      <Stethoscope className="h-2.5 w-2.5" />
      {label}
    </Link>
  );
}
