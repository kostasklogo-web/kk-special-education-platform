import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  mondayOfAthensWeek,
} from "@/lib/schedule/athens-civil";

export function athensWeekRangeFromWeekContaining(dateYmd: string): { fromIso: string; toIso: string } {
  const mon = mondayOfAthensWeek(dateYmd);
  const sun = addDaysAthensCalendar(mon, 6);
  return {
    fromIso: athensStartOfDayUtcIso(mon),
    toIso: athensEndOfDayUtcIso(sun),
  };
}

export function athensDayRange(dateYmd: string): { fromIso: string; toIso: string } {
  return {
    fromIso: athensStartOfDayUtcIso(dateYmd),
    toIso: athensEndOfDayUtcIso(dateYmd),
  };
}
