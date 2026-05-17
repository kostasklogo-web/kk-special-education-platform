"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ReportRequest } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllReports, REPORTS_UPDATED_EVENT } from "@/lib/secretary/reports/store";

const ReportsCtx = createContext<ReportRequest[] | null>(null);

export function ReportsChargeProvider({ children }: { children: ReactNode }) {
  const today = todayAthensYmd();
  const [reports, setReports] = useState<ReportRequest[]>([]);

  useEffect(() => {
    const refresh = () => setReports(getAllReports(today));
    refresh();
    window.addEventListener(REPORTS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(REPORTS_UPDATED_EVENT, refresh);
  }, [today]);

  return <ReportsCtx.Provider value={reports}>{children}</ReportsCtx.Provider>;
}

export function useReportRequests(): ReportRequest[] {
  const ctx = useContext(ReportsCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllReports(todayAthensYmd());
  }
  return ctx;
}
