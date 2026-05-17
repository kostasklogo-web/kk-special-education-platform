import type { AlertLevel, CommunicationLog, CommunicationStatus } from "@/lib/secretary/types";
import {
  isDoctorCommunication,
  isParentCommunication,
  isSchoolCommunication,
} from "./catalog";

export function daysBetweenYmd(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T12:00:00.000Z`) - Date.parse(`${from}T12:00:00.000Z`)) / 86400000
  );
}

export function computeCommunicationStatus(
  log: Pick<CommunicationLog, "status" | "followUpDate" | "nextActionRequired">,
  todayYmd: string
): CommunicationStatus {
  if (log.status === "cancelled" || log.status === "completed") return log.status;
  if (log.status === "waiting_response") return "waiting_response";
  if (log.nextActionRequired && log.followUpDate) {
    const days = daysBetweenYmd(log.followUpDate, todayYmd);
    if (days > 0) return "overdue_followup";
    if (log.status === "needs_followup") return "needs_followup";
  }
  return log.status;
}

export function alertLevelForCommunication(log: CommunicationLog, todayYmd: string): AlertLevel {
  const status = computeCommunicationStatus(log, todayYmd);
  if (status === "completed" || status === "cancelled") return "green";
  if (status === "overdue_followup") return log.priority === "urgent" ? "red" : "red";
  if (status === "waiting_response") return "yellow";
  if (log.priority === "urgent") return "red";
  if (status === "needs_followup") return "yellow";
  if (log.priority === "high") return "yellow";
  return "green";
}

export function enrichCommunication(log: CommunicationLog, todayYmd: string): CommunicationLog {
  const status = computeCommunicationStatus(log, todayYmd);
  return {
    ...log,
    status,
    alertLevel: alertLevelForCommunication({ ...log, status }, todayYmd),
  };
}

export function isOpenFollowUp(log: CommunicationLog, todayYmd: string): boolean {
  const s = computeCommunicationStatus(log, todayYmd);
  return ["needs_followup", "waiting_response", "overdue_followup"].includes(s);
}

export type CommunicationDashboardMetrics = {
  today: number;
  openFollowUps: number;
  waitingResponse: number;
  parentComms: number;
  schoolComms: number;
  doctorComms: number;
  urgent: number;
  overdueFollowUps: number;
  completedThisWeek: number;
};

function weekStartYmd(todayYmd: string): string {
  const d = new Date(`${todayYmd}T12:00:00.000Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function computeCommunicationDashboardMetrics(
  logs: CommunicationLog[],
  todayYmd: string
): CommunicationDashboardMetrics {
  const weekStart = weekStartYmd(todayYmd);
  const enriched = logs.map((l) => enrichCommunication(l, todayYmd));

  return {
    today: enriched.filter((l) => l.communicationDate === todayYmd).length,
    openFollowUps: enriched.filter((l) => isOpenFollowUp(l, todayYmd)).length,
    waitingResponse: enriched.filter((l) => l.status === "waiting_response").length,
    parentComms: enriched.filter((l) => isParentCommunication(l.communicationTypeCode)).length,
    schoolComms: enriched.filter((l) => isSchoolCommunication(l.communicationTypeCode)).length,
    doctorComms: enriched.filter((l) => isDoctorCommunication(l.communicationTypeCode)).length,
    urgent: enriched.filter(
      (l) => l.priority === "urgent" && l.status !== "completed" && l.status !== "cancelled"
    ).length,
    overdueFollowUps: enriched.filter((l) => l.status === "overdue_followup").length,
    completedThisWeek: enriched.filter(
      (l) =>
        l.status === "completed" &&
        l.communicationDate >= weekStart &&
        l.communicationDate <= todayYmd
    ).length,
  };
}
