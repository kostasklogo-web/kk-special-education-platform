"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useCommunicationsLog } from "@/components/secretary/communications/CommunicationsLogProvider";
import { isOpenFollowUp } from "@/lib/secretary/communications/calculations";
import {
  isDoctorCommunication,
  isParentCommunication,
  isSchoolCommunication,
} from "@/lib/secretary/communications/catalog";
import { CommunicationTimeline } from "@/components/secretary/communications/CommunicationTimeline";
import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";
import { CommunicationStatusBadge } from "@/components/secretary/communications/CommunicationStatusBadge";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { COMMUNICATION_TYPE_LABELS } from "@/lib/secretary/labels";
import type { CommunicationTypeCode } from "@/lib/secretary/types";

type Props = {
  childId: string;
  childLabel: string;
};

export function ChildCommunicationSection({ childId, childLabel }: Props) {
  const today = todayAthensYmd();
  const logs = useCommunicationsLog();
  const forChild = useMemo(
    () => logs.filter((c) => c.childId === childId),
    [logs, childId]
  );
  const openFollowUps = forChild.filter((c) => isOpenFollowUp(c, today));
  const schoolCount = forChild.filter((c) => isSchoolCommunication(c.communicationTypeCode)).length;
  const doctorCount = forChild.filter((c) => isDoctorCommunication(c.communicationTypeCode)).length;
  const parentCount = forChild.filter((c) => isParentCommunication(c.communicationTypeCode)).length;

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of forChild) {
      const label =
        COMMUNICATION_TYPE_LABELS[c.communicationTypeCode as CommunicationTypeCode] ??
        c.communicationTypeLabel;
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [forChild]);

  const schoolDoctorHistory = useMemo(
    () =>
      forChild.filter(
        (c) =>
          isSchoolCommunication(c.communicationTypeCode) ||
          isDoctorCommunication(c.communicationTypeCode) ||
          c.communicationTypeCode === "teacher_call"
      ),
    [forChild]
  );

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-lg font-bold text-ink">Επικοινωνίες</h2>
            <p className="text-xs text-ink-muted">
              {forChild.length} καταχωρήσεις · {openFollowUps.length} ανοιχτά follow-up
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChildDiagnosisBadge childId={childId} compact />
          <NewCommunicationLink params={{ childId, childLabel }} size="sm" />
          <Link
            href={`/secretary/communications?childId=${encodeURIComponent(childId)}`}
            className="inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-clinical-700 hover:underline"
          >
            Όλες →
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-900">
          Γονείς: {parentCount}
        </span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-900">
          Σχολεία: {schoolCount}
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-900">
          Γιατροί: {doctorCount}
        </span>
      </div>

      {byType.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase text-ink-muted">Ιστορικό ανά τύπο</p>
          <div className="flex flex-wrap gap-1.5">
            {byType.map(([label, count]) => (
              <span
                key={label}
                className="rounded-md border border-border bg-surface-muted/40 px-2 py-1 text-xs font-medium text-ink"
              >
                {label}: {count}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {openFollowUps.length > 0 ? (
        <ul className="mb-4 space-y-1.5">
          <p className="text-xs font-semibold uppercase text-ink-muted">Ανοιχτά follow-up</p>
          {openFollowUps.map((c) => (
            <li key={c.id}>
              <Link
                href={`/secretary/communications?comm=${c.id}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm hover:bg-amber-50"
              >
                <span className="font-medium">{c.summary.slice(0, 80)}</span>
                <CommunicationStatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mb-2 text-xs font-semibold uppercase text-ink-muted">Χρονολόγιο επικοινωνιών</p>
      {forChild.length > 0 ? (
        <div className="max-h-[480px] overflow-y-auto pr-1">
          <CommunicationTimeline
            logs={forChild}
            onSelect={(c) => {
              window.location.href = `/secretary/communications?comm=${c.id}`;
            }}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-ink-muted">
          Δεν υπάρχουν καταχωρήσεις επικοινωνίας για αυτό το παιδί.
        </p>
      )}

      {schoolDoctorHistory.length > 0 ? (
        <details className="mt-4 rounded-lg border border-border bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Επικοινωνίες σχολείου / γιατρού / δασκάλου ({schoolDoctorHistory.length})
          </summary>
          <ul className="mt-2 space-y-2 text-sm">
            {schoolDoctorHistory.map((c) => (
              <li key={c.id} className="border-b border-border/50 pb-2 last:border-0">
                <Link href={`/secretary/communications?comm=${c.id}`} className="font-medium hover:underline">
                  {c.communicationTypeLabel} — {c.communicationDate}
                </Link>
                <p className="line-clamp-2 text-ink-muted">{c.summary}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
