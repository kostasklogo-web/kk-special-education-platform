import type { ReminderChannel, ReminderMessageContext, ReminderTemplateCode } from "./types";
import { getTemplate } from "./templates";
import { isShortMessageChannel } from "./config";
import { normalizeReminderContext } from "./normalize-context";

/** Replace {key} and legacy {{key}} placeholders. */
export function renderTemplateBody(body: string, context: ReminderMessageContext): string {
  const map = normalizeReminderContext(context);
  return body
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => map[key] ?? "—")
    .replace(/\{(\w+)\}/g, (_, key: string) => map[key] ?? "—");
}

export function renderReminderMessage(
  templateCode: ReminderTemplateCode,
  context: ReminderMessageContext,
  channel: ReminderChannel = "sms"
): string {
  const tpl = getTemplate(templateCode);
  const body = isShortMessageChannel(channel) ? tpl.bodyShort : tpl.bodyLong;
  return renderTemplateBody(body, context);
}
