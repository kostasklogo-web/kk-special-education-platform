import Link from "next/link";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { parseControlCenterDate } from "@/lib/schedule/control-center-date-param";
import { ScheduleControlCenter } from "@/components/schedule-control-center";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Στατικό πρωτότυπο: χωρίς Supabase — πλήρης ημέρα ορατή χωρίς κάθετο scroll. */
export default async function ScheduleControlCenterPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = parseControlCenterDate(raw);
  const dateYmd = parsed || todayAthensYmd();

  return (
    <div className="flex h-[calc(100dvh-3.75rem)] min-h-0 flex-col gap-0.5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-0.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clinical-700">Κεντρικός Πίνακας</p>
          <h1 className="text-base font-semibold tracking-tight text-ink">Έλεγχος προγράμματος</h1>
        </div>
        <Link
          href="/schedule"
          className="inline-flex h-8 items-center rounded-md border border-border bg-white px-3 text-xs font-medium text-ink hover:bg-surface-muted"
        >
          Κλασικό πρόγραμμα
        </Link>
      </div>
      <ScheduleControlCenter dateYmd={dateYmd} />
    </div>
  );
}
