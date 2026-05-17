"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  MessageSquare,
} from "lucide-react";
import type { CommandCenterItem } from "@/lib/secretary/dashboard/today-command-center";
import { useGdpr } from "@/components/gdpr/GdprProvider";

type Props = {
  item: CommandCenterItem;
  completed: boolean;
  onToggleComplete: () => void;
};

export function CommandCenterItemCard({ item, completed, onToggleComplete }: Props) {
  const gdpr = useGdpr();
  const [copied, setCopied] = useState(false);

  const borderTone =
    item.urgency === "urgent_now"
      ? "border-red-300 bg-red-50/40"
      : item.urgency === "today"
        ? "border-clinical-200 bg-white"
        : item.urgency === "this_week"
          ? "border-amber-200 bg-amber-50/30"
          : "border-border bg-surface-muted/20";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.copyMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function auditOpen() {
    if (["diagnoses", "reports", "meetings", "intake"].includes(item.module)) {
      gdpr.auditView(
        item.module as "diagnoses" | "reports" | "meetings" | "intake",
        `Άνοιγμα από κέντρο ελέγχου: ${item.title}`,
        { childId: item.childId, entityId: item.entityId }
      );
    }
  }

  return (
    <article
      className={`rounded-xl border p-3 shadow-sm transition ${borderTone} ${completed ? "opacity-55" : ""}`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
            completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-border bg-white hover:border-clinical-500"
          }`}
          aria-label={completed ? "Επαναφορά" : "Ολοκλήρωση"}
        >
          {completed ? <Check className="h-4 w-4" /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              {item.moduleLabel}
            </span>
            {item.isOverdue ? (
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900">
                Εκπρόθεσμο
              </span>
            ) : null}
          </div>
          <p className={`mt-1 font-semibold text-ink ${completed ? "line-through" : ""}`}>{item.title}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {item.childLabel ? (
              <span className="font-medium text-ink">{item.childLabel}</span>
            ) : (
              "—"
            )}
            {item.parentLabel ? ` · ${item.parentLabel}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Λήξη: <span className="font-semibold text-ink">{item.dueLabel}</span>
            {item.statusLabel ? ` · ${item.statusLabel}` : ""}
          </p>
        </div>
        <Link
          href={item.href}
          onClick={auditOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white text-ink-muted hover:text-clinical-700"
          aria-label="Άνοιγμα"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionChip
          icon={<Bell className="h-3.5 w-3.5" />}
          label="Υπενθύμιση"
          href={`/secretary/reminders${item.childLabel ? `?child=${encodeURIComponent(item.childLabel)}` : ""}`}
          primary
        />
        <ActionChip icon={<Copy className="h-3.5 w-3.5" />} label={copied ? "Αντιγράφηκε" : "Αντιγραφή"} onClick={handleCopy} />
        <ActionChip icon={<Check className="h-3.5 w-3.5" />} label="Ολοκλήρωση" onClick={onToggleComplete} />
        <ActionChip
          icon={<ClipboardList className="h-3.5 w-3.5" />}
          label="Follow-up"
          href={`/secretary/tasks?action=new&child=${item.childId ?? ""}&title=${encodeURIComponent(`Follow-up: ${item.title}`)}`}
        />
        <ActionChip
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Ραντεβού"
          href={`/secretary/schedule?action=new&child=${item.childId ?? ""}`}
        />
        <ActionChip
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="Καταγραφή"
          href={`/secretary/communications?action=new&child=${item.childId ?? ""}`}
        />
      </div>
    </article>
  );
}

function ActionChip({
  icon,
  label,
  href,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const cls = `inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ${
    primary
      ? "bg-clinical-600 text-white hover:bg-clinical-700"
      : "border border-border bg-white text-ink hover:bg-surface-muted"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}



