"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { SECRETARY_DEMO_APPOINTMENTS, SECRETARY_DEMO_REPORTS } from "@/lib/demo/secretary-demo-data";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { useReportRequests } from "@/components/secretary/reports/ReportsChargeProvider";
import { PAYMENTS_UPDATED_EVENT } from "@/lib/secretary/payments/store";
import { DIAGNOSES_UPDATED_EVENT } from "@/lib/secretary/diagnoses/store";
import { runAutoTaskGeneration } from "@/lib/secretary/tasks/auto-generate";
import { getAllTasks, TASKS_UPDATED_EVENT } from "@/lib/secretary/tasks/store";

const TasksChargeCtx = createContext<SecretaryTask[] | null>(null);

type Props = { children: ReactNode };

/** Syncs secretary tasks (demo + localStorage) and runs cross-module auto-generation. */
export function TasksChargeProvider({ children }: Props) {
  const today = todayAthensYmd();
  const payments = usePaymentCharges();
  const diagnoses = useDiagnosisDocuments();
  const reports = useReportRequests();
  const [tasks, setTasks] = useState<SecretaryTask[]>([]);

  const refresh = () => {
    runAutoTaskGeneration({
      payments,
      diagnoses,
      appointments: SECRETARY_DEMO_APPOINTMENTS,
      reports: reports.length > 0 ? reports : SECRETARY_DEMO_REPORTS,
      todayYmd: today,
    });
    setTasks(getAllTasks(today));
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(TASKS_UPDATED_EVENT, onUpdate);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, onUpdate);
    window.addEventListener(DIAGNOSES_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, onUpdate);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, onUpdate);
      window.removeEventListener(DIAGNOSES_UPDATED_EVENT, onUpdate);
    };
  }, [payments, diagnoses, reports, today]);

  return <TasksChargeCtx.Provider value={tasks}>{children}</TasksChargeCtx.Provider>;
}

export function useSecretaryTasks(): SecretaryTask[] {
  const ctx = useContext(TasksChargeCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllTasks(todayAthensYmd());
  }
  return ctx;
}
