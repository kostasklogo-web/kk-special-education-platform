"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import type { CommunicationLog } from "@/lib/secretary/types";
import { isDiagnosisCommunication } from "@/lib/secretary/diagnoses/diagnosis-queries";

type Props = { log: CommunicationLog; className?: string };

export function CommunicationDiagnosisBadge({ log, className = "" }: Props) {
  if (!isDiagnosisCommunication(log)) return null;

  const href = log.linkedDiagnosisId
    ? `/secretary/diagnoses?doc=${log.linkedDiagnosisId}`
    : log.childId
      ? `/secretary/communications?childId=${log.childId}`
      : "/secretary/communications";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-0.5 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-900 hover:bg-violet-100 ${className}`}
      title="Επικοινωνία σχετική με γνωμάτευση"
    >
      <Stethoscope className="h-2.5 w-2.5" />
      Γνωμάτευση
    </Link>
  );
}
