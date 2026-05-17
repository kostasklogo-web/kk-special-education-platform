"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllMeetings, MEETINGS_UPDATED_EVENT } from "@/lib/secretary/meetings/store";

const MeetingsCtx = createContext<SecretaryMeeting[] | null>(null);

export function MeetingsChargeProvider({ children }: { children: ReactNode }) {
  const today = todayAthensYmd();
  const [meetings, setMeetings] = useState<SecretaryMeeting[]>([]);

  useEffect(() => {
    const refresh = () => setMeetings(getAllMeetings(today));
    refresh();
    window.addEventListener(MEETINGS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MEETINGS_UPDATED_EVENT, refresh);
  }, [today]);

  return <MeetingsCtx.Provider value={meetings}>{children}</MeetingsCtx.Provider>;
}

export function useMeetings(): SecretaryMeeting[] {
  const ctx = useContext(MeetingsCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllMeetings(todayAthensYmd());
  }
  return ctx;
}
