import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import type { ScheduleConflict } from "@/lib/secretary/types";
import type { DashboardActionRow, DashboardModuleKey } from "./master-model";

export type UrgencyBucket = "urgent_now" | "today" | "this_week" | "waiting";

export type CommandCenterItem = DashboardActionRow & {
  urgency: UrgencyBucket;
  sortScore: number;
  dueYmd: string | null;
  moduleLabel: string;
  copyMessage: string;
  isOverdue: boolean;
};

export const URGENCY_BUCKET_META: Record<
  UrgencyBucket,
  { title: string; description: string; emptyHint: string }
> = {
  urgent_now: {
    title: "Επείγον τώρα",
    description: "Χρειάζεται άμεση ενέργεια πριν από οτιδήποτε άλλο.",
    emptyHint: "Δεν υπάρχουν επείγοντα θέματα αυτή τη στιγμή.",
  },
  today: {
    title: "Σήμερα",
    description: "Ολοκληρώστε σήμερα για να μείνει η μέρα ελεγχόμενη.",
    emptyHint: "Τα σημερινά θέματα ολοκληρώθηκαν ή δεν υπάρχουν.",
  },
  this_week: {
    title: "Αυτή την εβδομάδα",
    description: "Προγραμματίστε ή ξεκινήστε μέσα στην εβδομάδα.",
    emptyHint: "Δεν υπάρχουν θέματα για αυτή την εβδομάδα.",
  },
  waiting: {
    title: "Σε αναμονή",
    description: "Αναμένετε απάντηση ή ενέργεια από τρίτους.",
    emptyHint: "Δεν υπάρχουν θέματα σε αναμονή.",
  },
};

const MODULE_LABELS: Record<DashboardModuleKey, string> = {
  schedule: "Ραντεβού",
  intake: "Νέο αίτημα",
  payments: "Πληρωμή",
  tasks: "Εργασία",
  communications: "Επικοινωνία",
  diagnoses: "Διάγνωση",
  reports: "Αναφορά",
  reminders: "Υπενθύμιση",
  meetings: "Συνάντηση",
  gdpr: "GDPR",
};

const BUCKET_ORDER: UrgencyBucket[] = ["urgent_now", "today", "this_week", "waiting"];

function parseDueYmd(dueLabel: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueLabel)) return dueLabel;
  return null;
}

function priorityScore(priority: string): number {
  if (priority === "urgent") return 100;
  if (priority === "high") return 70;
  if (priority === "normal") return 40;
  return 20;
}

function toneScore(tone: DashboardActionRow["tone"]): number {
  if (tone === "dark_red") return 90;
  if (tone === "red") return 75;
  if (tone === "orange") return 55;
  if (tone === "yellow") return 35;
  return 10;
}

function buildCopyMessage(row: DashboardActionRow): string {
  const child = row.childLabel ?? "το παιδί";
  const parent = row.parentLabel ? `Αγαπητέ/ή ${row.parentLabel}, ` : "";
  switch (row.module) {
    case "payments":
      return `${parent}σας ενημερώνουμε για εκκρεμή πληρωμή σχετικά με ${child}. Με εκτίμηση, Η ομάδα μας.`;
    case "reminders":
      return `${parent}υπενθύμιση για ${row.title.toLowerCase()} — ${child}.`;
    case "diagnoses":
      return `${parent}σχετικά με ανανέωση εγγράφου για ${child}. Παρακαλούμε επικοινωνήστε μαζί μας.`;
    case "reports":
      return `${parent}ενημέρωση για αίτημα αναφοράς — ${child}.`;
    case "schedule":
      return `${parent}υπενθύμιση για το ραντεβού σας (${row.dueLabel}) — ${child}.`;
    default:
      return `${parent}σχετικά με ${row.title} — ${child}.`;
  }
}

export function assignUrgencyBucket(
  row: DashboardActionRow,
  todayYmd: string,
  weekEndYmd: string
): UrgencyBucket {
  const dueYmd = parseDueYmd(row.dueLabel);
  const status = row.statusLabel.toLowerCase();

  if (
    row.tone === "dark_red" ||
    row.tone === "red" ||
    row.priority === "urgent" ||
    status.includes("overdue") ||
    status.includes("ληγ") ||
    status.includes("expired") ||
    row.listId === "overduePayments"
  ) {
    return "urgent_now";
  }

  if (
    row.listId === "todaySchedule" ||
    row.listId === "remindersToSend" ||
    row.dueLabel === "Σήμερα" ||
    dueYmd === todayYmd
  ) {
    return "today";
  }

  if (
    status.includes("waiting") ||
    status.includes("αναμον") ||
    row.statusLabel === "waiting_response"
  ) {
    return "waiting";
  }

  if (dueYmd && dueYmd > todayYmd && dueYmd <= weekEndYmd) {
    return "this_week";
  }

  if (dueYmd && dueYmd < todayYmd) {
    return "urgent_now";
  }

  if (dueYmd && dueYmd <= weekEndYmd) {
    return "this_week";
  }

  return "today";
}

export function toCommandCenterItem(
  row: DashboardActionRow,
  todayYmd: string,
  weekEndYmd: string
): CommandCenterItem {
  const dueYmd = parseDueYmd(row.dueLabel);
  const urgency = assignUrgencyBucket(row, todayYmd, weekEndYmd);
  const isOverdue =
    urgency === "urgent_now" &&
    (row.tone === "red" || row.tone === "dark_red" || (dueYmd !== null && dueYmd < todayYmd));

  const sortScore =
    toneScore(row.tone) +
    priorityScore(row.priority) +
    (urgency === "urgent_now" ? 50 : urgency === "today" ? 30 : 0) +
    (isOverdue ? 40 : 0);

  return {
    ...row,
    urgency,
    sortScore,
    dueYmd,
    moduleLabel: MODULE_LABELS[row.module],
    copyMessage: buildCopyMessage(row),
    isOverdue,
  };
}

export type CommandCenterGrouped = Record<UrgencyBucket, CommandCenterItem[]>;

export function buildCommandCenterQueue(
  rows: DashboardActionRow[],
  todayYmd: string,
  conflicts: ScheduleConflict[]
): { grouped: CommandCenterGrouped; all: CommandCenterItem[]; conflictItems: CommandCenterItem[] } {
  const weekEndYmd = addDaysAthensCalendar(todayYmd, 7);
  const seen = new Set<string>();
  const unique: DashboardActionRow[] = [];

  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    unique.push(r);
  }

  const conflictItems: CommandCenterItem[] = conflicts
    .filter((c) => c.alertLevel === "red" || c.alertLevel === "yellow")
    .slice(0, 6)
    .map((c, i) =>
      toCommandCenterItem(
        {
          id: `conflict-${c.id}`,
          listId: "conflicts",
          module: "schedule",
          title: c.message,
          childLabel: null,
          parentLabel: null,
          priority: c.alertLevel === "red" ? "urgent" : "high",
          dueLabel: todayYmd,
          statusLabel: "Σύγκρουση",
          tone: c.alertLevel === "red" ? "red" : "orange",
          href: "/secretary/schedule",
          childId: null,
          entityId: c.appointmentId ?? `conflict-${i}`,
          searchText: c.message.toLowerCase(),
        },
        todayYmd,
        weekEndYmd
      )
    )
    .map((item) => ({ ...item, urgency: "urgent_now" as const, sortScore: item.sortScore + 100 }));

  const items = unique.map((r) => toCommandCenterItem(r, todayYmd, weekEndYmd));

  const grouped: CommandCenterGrouped = {
    urgent_now: [],
    today: [],
    this_week: [],
    waiting: [],
  };

  for (const item of [...conflictItems, ...items]) {
    grouped[item.urgency].push(item);
  }

  for (const bucket of BUCKET_ORDER) {
    grouped[bucket].sort((a, b) => {
      if (b.sortScore !== a.sortScore) return b.sortScore - a.sortScore;
      const ad = a.dueYmd ?? "9999-99-99";
      const bd = b.dueYmd ?? "9999-99-99";
      return ad.localeCompare(bd);
    });
  }

  const all = BUCKET_ORDER.flatMap((b) => grouped[b]);
  return { grouped, all, conflictItems };
}

export { BUCKET_ORDER, MODULE_LABELS };
