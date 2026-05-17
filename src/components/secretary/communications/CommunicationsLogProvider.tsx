"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CommunicationLog } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import {
  COMMUNICATIONS_UPDATED_EVENT,
  getAllCommunications,
} from "@/lib/secretary/communications/store";

const CommunicationsLogCtx = createContext<CommunicationLog[] | null>(null);

type Props = { children: ReactNode };

export function CommunicationsLogProvider({ children }: Props) {
  const today = todayAthensYmd();
  const [logs, setLogs] = useState<CommunicationLog[]>(() => getAllCommunications(today));

  useEffect(() => {
    const refresh = () => setLogs(getAllCommunications(today));
    refresh();
    window.addEventListener(COMMUNICATIONS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(COMMUNICATIONS_UPDATED_EVENT, refresh);
  }, [today]);

  return (
    <CommunicationsLogCtx.Provider value={logs}>{children}</CommunicationsLogCtx.Provider>
  );
}

export function useCommunicationsLog(): CommunicationLog[] {
  const ctx = useContext(CommunicationsLogCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllCommunications(todayAthensYmd());
  }
  return ctx;
}
