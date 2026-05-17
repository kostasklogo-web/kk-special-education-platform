import type { ReminderEntityType, ReminderTemplateCode, ReminderChannel } from "@/lib/secretary/reminders/types";
import type { ReminderMessageContext } from "@/lib/secretary/reminders/types";

export type OpenReminderPayload = {
  templateCode: ReminderTemplateCode;
  entityType: ReminderEntityType;
  entityId: string;
  childId: string | null;
  childLabel: string | null;
  recipientName: string;
  recipientPhone: string | null;
  recipientEmail: string | null;
  context: ReminderMessageContext;
  suggestedChannel?: ReminderChannel;
};
