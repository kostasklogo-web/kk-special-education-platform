"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DiagnosisDocument } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { DIAGNOSES_UPDATED_EVENT, getAllDiagnoses } from "@/lib/secretary/diagnoses/store";

const DiagnosesCtx = createContext<DiagnosisDocument[] | null>(null);

export function DiagnosesChargeProvider({ children }: { children: ReactNode }) {
  const today = todayAthensYmd();
  const [docs, setDocs] = useState<DiagnosisDocument[]>([]);

  useEffect(() => {
    const refresh = () => setDocs(getAllDiagnoses(today));
    refresh();
    window.addEventListener(DIAGNOSES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(DIAGNOSES_UPDATED_EVENT, refresh);
  }, [today]);

  return <DiagnosesCtx.Provider value={docs}>{children}</DiagnosesCtx.Provider>;
}

export function useDiagnosisDocuments(): DiagnosisDocument[] {
  const ctx = useContext(DiagnosesCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllDiagnoses(todayAthensYmd());
  }
  return ctx;
}
