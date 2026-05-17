"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CommunicationLog } from "@/lib/secretary/types";
import type {
  AutomationQueueItem,
  CommunicationConsent,
  ReminderChannel,
  ReminderDashboardStats,
  ReminderEntityType,
  ReminderLogEntry,
  ReminderRecord,
  ReminderStatus,
  ReminderTemplateCode,
} from "@/lib/secretary/reminders/types";
import { renderReminderMessage } from "@/lib/secretary/reminders/render-message";
import { getTemplate } from "@/lib/secretary/reminders/templates";
import {
  buildAutomationQueue,
  computeReminderDashboardStats,
} from "@/lib/secretary/reminders/automation-queue";
import type {
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import { enrichReminders } from "@/lib/secretary/reminders/calculations";
import type { EnrichedReminder } from "@/lib/secretary/reminders/normalize";
import { notifyRemindersUpdated } from "@/lib/secretary/reminders/store";
import { recipientMapFromConsents } from "@/lib/demo/secretary-reminders-demo";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { autoGenerateFromCommunicationLog } from "@/lib/secretary/tasks/auto-generate";
import { autoLogFromReminder } from "@/lib/secretary/communications/auto-log";
import { normalizeCommunicationLog } from "@/lib/secretary/communications/normalize";
import { upsertCommunication } from "@/lib/secretary/communications/store";

const STORAGE_KEY = "secretary-reminders-v1";

type ReminderProviderInput = {
  organizationId: string;
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  reports: ReportRequest[];
  tasks?: SecretaryTask[];
  consents: CommunicationConsent[];
  initialReminders?: ReminderRecord[];
  initialCommunicationLogs?: CommunicationLog[];
};

import type { OpenReminderPayload } from "./reminder-payload";
export type { OpenReminderPayload };

type ReminderContextValue = {
  organizationId: string;
  consents: CommunicationConsent[];
  reminders: ReminderRecord[];
  enrichedReminders: EnrichedReminder[];
  logs: ReminderLogEntry[];
  communicationLogs: CommunicationLog[];
  queue: AutomationQueueItem[];
  stats: ReminderDashboardStats;
  getConsentForChild: (childId: string | null) => CommunicationConsent | null;
  openPayload: OpenReminderPayload | null;
  openReminder: (payload: OpenReminderPayload) => void;
  closeReminder: () => void;
  updateReminderBody: (reminderId: string, body: string) => void;
  copyMessage: (reminderId: string, message: string, channel: ReminderChannel) => Promise<void>;
  markSent: (reminderId: string, channel: ReminderChannel, message?: string) => void;
  markCompleted: (reminderId: string, byLabel?: string) => void;
  scheduleReminder: (reminderId: string, scheduledForIso: string) => void;
  cancelReminder: (reminderId: string) => void;
  bulkMarkSent: (ids: string[], channel: ReminderChannel) => void;
  bulkCancel: (ids: string[]) => void;
  createReminderFromPayload: (
    payload: OpenReminderPayload,
    channel: ReminderChannel,
    status: ReminderStatus
  ) => ReminderRecord;
  historyForChild: (childId: string) => ReminderRecord[];
  enrichedForChild: (childId: string) => EnrichedReminder[];
  historyForParentName: (name: string) => ReminderRecord[];
  appendCommunicationLog: (entry: CommunicationLog) => void;
};

const ReminderCtx = createContext<ReminderContextValue | null>(null);

function loadStored(): { reminders: ReminderRecord[]; logs: ReminderLogEntry[]; comms: CommunicationLog[] } {
  if (typeof window === "undefined") return { reminders: [], logs: [], comms: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { reminders: [], logs: [], comms: [] };
    return JSON.parse(raw) as { reminders: ReminderRecord[]; logs: ReminderLogEntry[]; comms: CommunicationLog[] };
  } catch {
    return { reminders: [], logs: [], comms: [] };
  }
}

function persist(data: { reminders: ReminderRecord[]; logs: ReminderLogEntry[]; comms: CommunicationLog[] }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  notifyRemindersUpdated();
}

export function ReminderProvider({
  children,
  organizationId,
  appointments,
  payments,
  diagnoses,
  reports,
  tasks = [],
  consents,
  initialReminders = [],
  initialCommunicationLogs = [],
}: ReminderProviderInput & { children: ReactNode }) {
  const today = todayAthensYmd();
  const [stored] = useState(() => loadStored());
  const [reminders, setReminders] = useState<ReminderRecord[]>(() => [
    ...initialReminders,
    ...stored.reminders,
  ]);
  const [logs, setLogs] = useState<ReminderLogEntry[]>(stored.logs);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([
    ...initialCommunicationLogs,
    ...stored.comms,
  ]);
  const [openPayload, setOpenPayload] = useState<OpenReminderPayload | null>(null);

  const recipientMap = useMemo(() => recipientMapFromConsents(consents), [consents]);

  const queue = useMemo(
    () =>
      buildAutomationQueue({
        appointments,
        payments,
        diagnoses,
        reports,
        tasks,
        recipientByChildId: new Map(
          [...recipientMap.entries()].map(([id, v]) => [id, { name: v.name }])
        ),
        existingReminders: reminders,
      }),
    [appointments, payments, diagnoses, reports, tasks, recipientMap, reminders]
  );

  const enrichedReminders = useMemo(
    () => enrichReminders(reminders, today),
    [reminders, today]
  );

  const stats = useMemo(() => computeReminderDashboardStats(queue, reminders), [queue, reminders]);

  const getConsentForChild = useCallback(
    (childId: string | null) => {
      if (!childId) return null;
      return consents.find((x) => x.childId === childId) ?? null;
    },
    [consents]
  );

  const createReminderFromPayload = useCallback(
    (payload: OpenReminderPayload, channel: ReminderChannel, status: ReminderStatus): ReminderRecord => {
      const body = renderReminderMessage(payload.templateCode, payload.context, channel);
      const rec: ReminderRecord = {
        id: `rem-${Date.now()}`,
        organizationId,
        templateCode: payload.templateCode,
        templateLabel: getTemplate(payload.templateCode).nameEl,
        channel,
        status,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        recipientEmail: payload.recipientEmail,
        childId: payload.childId,
        childLabel: payload.childLabel,
        parentId: null,
        entityType: payload.entityType,
        entityId: payload.entityId,
        messageBody: body,
        scheduledFor: null,
        sentAt: status === "sent" ? new Date().toISOString() : null,
        copiedAt: status === "copied" ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      };
      setReminders((prev) => [rec, ...prev]);
      setLogs((l) => [
        ...l,
        {
          id: `rlog-${Date.now()}`,
          reminderId: rec.id,
          action: "created",
          channel,
          statusAfter: status,
          messageSnapshot: body,
          communicationLogId: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      return rec;
    },
    [organizationId]
  );

  useEffect(() => {
    const today = todayAthensYmd();
    for (const entry of stored.comms) {
      try {
        const normalized = normalizeCommunicationLog(
          entry as Partial<CommunicationLog> &
            Pick<CommunicationLog, "id" | "contactPerson" | "summary">,
          today
        );
        upsertCommunication(normalized, today);
      } catch {
        /* skip invalid legacy rows */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time migration from reminder storage
  }, []);

  useEffect(() => {
    persist({ reminders, logs, comms: communicationLogs });
  }, [reminders, logs, communicationLogs]);

  const applyUpdate = useCallback(
    (
      id: string,
      patch: Partial<ReminderRecord>,
      logAction: ReminderLogEntry["action"],
      channel: ReminderChannel | null
    ) => {
      setReminders((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
        const updated = next.find((r) => r.id === id);
        if (!updated) return next;

        let commId: string | null = null;
        if (logAction === "copied" || logAction === "sent" || logAction === "phone_logged") {
          const today = todayAthensYmd();
          const entry = autoLogFromReminder(updated, channel, logAction, today);
          const normalized = normalizeCommunicationLog(
            entry as Partial<CommunicationLog> &
              Pick<CommunicationLog, "id" | "contactPerson" | "summary">,
            today
          );
          const saved = upsertCommunication(normalized, today);
          commId = saved.id;
          setCommunicationLogs((c) => [saved, ...c.filter((x) => x.id !== saved.id)]);
        }

        setLogs((l) => [
          ...l,
          {
            id: `rlog-${Date.now()}`,
            reminderId: id,
            action: logAction,
            channel,
            statusAfter: updated.status,
            messageSnapshot: updated.messageBody,
            communicationLogId: commId,
            createdAt: new Date().toISOString(),
          },
        ]);
        return next;
      });
    },
    []
  );

  const updateReminderBody = useCallback((reminderId: string, body: string) => {
    setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, messageBody: body } : r)));
  }, []);

  const copyMessage = useCallback(
    async (reminderId: string, message: string, channel: ReminderChannel) => {
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        /* ignore */
      }
      applyUpdate(
        reminderId,
        { status: "copied", copiedAt: new Date().toISOString(), channel, messageBody: message },
        "copied",
        channel
      );
    },
    [applyUpdate]
  );

  const markSent = useCallback(
    (reminderId: string, channel: ReminderChannel, message?: string) => {
      const patch: Partial<ReminderRecord> = {
        status: "sent",
        sentAt: new Date().toISOString(),
        channel,
      };
      if (message !== undefined) patch.messageBody = message;
      applyUpdate(reminderId, patch, channel === "phone_call" ? "phone_logged" : "sent", channel);
    },
    [applyUpdate]
  );

  const scheduleReminder = useCallback(
    (reminderId: string, scheduledForIso: string) => {
      applyUpdate(reminderId, { status: "scheduled", scheduledFor: scheduledForIso }, "scheduled", null);
    },
    [applyUpdate]
  );

  const cancelReminder = useCallback(
    (reminderId: string) => {
      applyUpdate(reminderId, { status: "cancelled" }, "cancelled", null);
    },
    [applyUpdate]
  );

  const markCompleted = useCallback(
    (reminderId: string, byLabel = "Γραμματεία") => {
      setReminders((prev) => {
        const next = prev.map((r) =>
          r.id === reminderId
            ? {
                ...r,
                status: "completed" as ReminderStatus,
                sentAt: r.sentAt ?? new Date().toISOString(),
              }
            : r
        );
        const updated = next.find((r) => r.id === reminderId);
        if (updated) {
          setLogs((l) => [
            ...l,
            {
              id: `rlog-${Date.now()}`,
              reminderId,
              action: "sent" as const,
              channel: updated.channel,
              statusAfter: "completed",
              messageSnapshot: updated.messageBody,
              communicationLogId: null,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
        return next;
      });
    },
    []
  );

  const bulkMarkSent = useCallback(
    (ids: string[], channel: ReminderChannel) => {
      ids.forEach((id) => markSent(id, channel));
    },
    [markSent]
  );

  const bulkCancel = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => cancelReminder(id));
    },
    [cancelReminder]
  );

  const appendCommunicationLog = useCallback((entry: CommunicationLog) => {
    const today = todayAthensYmd();
    const normalized = normalizeCommunicationLog(
      entry as Partial<CommunicationLog> & Pick<CommunicationLog, "id" | "contactPerson" | "summary">,
      today
    );
    const saved = upsertCommunication(normalized, today);
    setCommunicationLogs((c) => [saved, ...c.filter((x) => x.id !== saved.id)]);
    if (saved.nextActionRequired || saved.nextAction?.trim() || saved.followUpDate) {
      autoGenerateFromCommunicationLog(saved, today);
    }
  }, []);

  const value: ReminderContextValue = {
    organizationId,
    consents,
    reminders,
    enrichedReminders,
    logs,
    communicationLogs,
    queue,
    stats,
    getConsentForChild,
    openPayload,
    openReminder: setOpenPayload,
    closeReminder: () => setOpenPayload(null),
    updateReminderBody,
    copyMessage,
    markSent,
    markCompleted,
    scheduleReminder,
    cancelReminder,
    bulkMarkSent,
    bulkCancel,
    createReminderFromPayload,
    historyForChild: (childId) => reminders.filter((r) => r.childId === childId),
    enrichedForChild: (childId) => enrichedReminders.filter((r) => r.childId === childId),
    historyForParentName: (name) =>
      reminders.filter((r) => r.recipientName.toLowerCase() === name.toLowerCase()),
    appendCommunicationLog,
  };

  return <ReminderCtx.Provider value={value}>{children}</ReminderCtx.Provider>;
}

export function useReminders(): ReminderContextValue {
  const ctx = useContext(ReminderCtx);
  if (!ctx) throw new Error("useReminders must be used within ReminderProvider");
  return ctx;
}


