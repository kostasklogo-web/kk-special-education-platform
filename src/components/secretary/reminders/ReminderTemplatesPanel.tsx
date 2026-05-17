"use client";

import { useEffect, useState } from "react";
import type { RoleCode } from "@/lib/auth/roles";
import { canEditReminderTemplates } from "@/lib/secretary/reminders/permissions";
import {
  listAllTemplates,
  saveTemplateOverride,
  type ReminderTemplateDef,
} from "@/lib/secretary/reminders/templates";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";

type Props = { roleCodes: RoleCode[] };

export function ReminderTemplatesPanel({ roleCodes }: Props) {
  const canEdit = canEditReminderTemplates(roleCodes);
  const [templates, setTemplates] = useState<ReminderTemplateDef[]>([]);
  const [editing, setEditing] = useState<ReminderTemplateCode | null>(null);
  const [draft, setDraft] = useState("");

  const refresh = () => setTemplates(listAllTemplates());

  useEffect(() => {
    refresh();
    const onUp = () => refresh();
    window.addEventListener("secretary-reminder-templates-updated", onUp);
    return () => window.removeEventListener("secretary-reminder-templates-updated", onUp);
  }, []);

  if (templates.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">Πρότυπα μηνυμάτων</h2>
        {!canEdit ? (
          <p className="text-xs text-ink-muted">Προβολή μόνο — επεξεργασία από CEO/διοίκηση</p>
        ) : null}
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {templates.map((t) => (
          <li key={t.code} className="rounded-lg border border-border p-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-ink">{t.nameEl}</p>
              <span className="text-[10px] uppercase text-ink-faint">{t.category}</span>
            </div>
            {editing === t.code ? (
              <div className="mt-2 space-y-2">
                <textarea
                  className="w-full rounded border px-2 py-1 text-xs"
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded bg-clinical-700 px-2 py-1 text-xs font-semibold text-white"
                    onClick={() => {
                      saveTemplateOverride(t.code, { bodyShort: draft });
                      setEditing(null);
                      refresh();
                    }}
                  >
                    Αποθήκευση
                  </button>
                  <button
                    type="button"
                    className="text-xs text-ink-muted"
                    onClick={() => setEditing(null)}
                  >
                    Ακύρωση
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{t.bodyShort}</p>
            )}
            {canEdit && editing !== t.code ? (
              <button
                type="button"
                className="mt-1 text-xs font-semibold text-clinical-700"
                onClick={() => {
                  setEditing(t.code);
                  setDraft(t.bodyShort);
                }}
              >
                Επεξεργασία
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
