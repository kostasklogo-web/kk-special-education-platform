"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { worstDiagnosisForChild, diagnosisWarningSummary } from "@/lib/secretary/diagnoses/diagnosis-warnings";

type Props = { childId: string };

export function AppointmentDiagnosisWarning({ childId }: Props) {
  const docs = useDiagnosisDocuments();
  const doc = worstDiagnosisForChild(docs, childId);
  if (!doc) return null;

  const summary = diagnosisWarningSummary(doc);
  if (summary.level === "none") return null;

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        summary.level === "red"
          ? "border-red-300 bg-red-50 text-red-950"
          : "border-amber-300 bg-amber-50 text-amber-950"
      }`}
      role="alert"
    >
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-bold">{summary.title}</p>
          <p className="mt-0.5 text-xs">{summary.detail}</p>
          <Link
            href={`/secretary/diagnoses?child=${encodeURIComponent(doc.childLabel)}`}
            className="mt-2 inline-block text-xs font-semibold underline"
          >
            Άνοιγμα γνωματεύσεων →
          </Link>
        </div>
      </div>
    </div>
  );
}
