import type { SecretaryMeeting } from "@/lib/secretary/types";

export function MeetingRiskBadges({ meeting }: { meeting: SecretaryMeeting }) {
  return (
    <span className="inline-flex flex-wrap gap-0.5">
      {meeting.clinicalRiskFlag ? (
        <span className="rounded bg-red-100 px-1 py-0.5 text-[9px] font-bold uppercase text-red-900">
          Κλιν. κίνδ.
        </span>
      ) : null}
      {meeting.hrRiskFlag ? (
        <span className="rounded bg-orange-100 px-1 py-0.5 text-[9px] font-bold uppercase text-orange-900">
          HR
        </span>
      ) : null}
      {meeting.minutesMissing ? (
        <span className="rounded bg-yellow-100 px-1 py-0.5 text-[9px] font-bold uppercase text-yellow-950">
          Πρακτικά
        </span>
      ) : null}
      {meeting.isClosed ? (
        <span className="rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-bold uppercase text-zinc-700">
          Κλειστή
        </span>
      ) : null}
    </span>
  );
}
