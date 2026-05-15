"use client";

import { memo } from "react";
import { CalendarPlus, Clock, Users } from "lucide-react";

type Props = {
  createHighlight: "45" | "90" | "suggest" | null;
  on45: () => void;
  on90: () => void;
  onSuggest: () => void;
  layout?: "inline" | "stack";
};

const BTN =
  "inline-flex min-h-[30px] w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold leading-tight";

export const ReceptionActions = memo(function ReceptionActions({
  createHighlight,
  on45,
  on90,
  onSuggest,
  layout = "inline",
}: Props) {
  const stack = layout === "stack";
  return (
    <div
      className={
        stack
          ? "mb-2 flex flex-col gap-1"
          : "flex flex-wrap items-center gap-1.5 rounded-lg border border-clinical-200 bg-clinical-50/40 px-2 py-1.5"
      }
    >
      <button
        type="button"
        onClick={on45}
        className={`${BTN} ${stack ? "" : "flex-1 sm:flex-none"} ${
          createHighlight === "45"
            ? "border-clinical-600 bg-clinical-600 text-white"
            : "border-clinical-300 bg-white text-clinical-900 hover:bg-clinical-50"
        }`}
      >
        <CalendarPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Νέα 45λεπτη συνεδρία
      </button>
      <button
        type="button"
        onClick={on90}
        className={`${BTN} ${stack ? "" : "flex-1 sm:flex-none"} ${
          createHighlight === "90"
            ? "border-indigo-700 bg-indigo-700 text-white"
            : "border-indigo-300 bg-white text-indigo-950 hover:bg-indigo-50"
        }`}
      >
        <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Νέα 90λεπτη ομάδα
      </button>
      <button
        type="button"
        onClick={onSuggest}
        className={`${BTN} ${stack ? "" : "flex-1 sm:flex-none"} ${
          createHighlight === "suggest"
            ? "border-clinical-600 bg-clinical-600 text-white"
            : "border-border bg-white text-ink hover:bg-surface-muted"
        }`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Πρότεινε διαθέσιμη ώρα
      </button>
    </div>
  );
});
