import Link from "next/link";
import type { ScheduleConflict } from "@/lib/secretary/types";
import type { ChildWarning } from "@/lib/secretary/child-warnings";
import { AlertTriangle, CreditCard, FileWarning, ListTodo, Clock, UserX, DoorOpen } from "lucide-react";

const CHILD_ICON = { payment: CreditCard, diagnosis: FileWarning, task: ListTodo, report: FileWarning } as const;

const CONFLICT_ICONS: Record<string, typeof AlertTriangle> = {
  therapist: UserX,
  room: DoorOpen,
  child: AlertTriangle,
  hours: Clock,
};

export function AppointmentWarningBadges({
  conflicts,
  childWarnings,
  compact = false,
}: {
  conflicts: ScheduleConflict[];
  childWarnings: ChildWarning[];
  compact?: boolean;
}) {
  const payment = childWarnings.filter((w) => w.kind === "payment");
  const diagnosis = childWarnings.filter((w) => w.kind === "diagnosis");
  const task = childWarnings.filter((w) => w.kind === "task");
  const report = childWarnings.filter((w) => w.kind === "report");

  const items: {
    key: string;
    label: string;
    className: string;
    Icon: typeof CreditCard;
    title?: string;
    href?: string;
  }[] = [];

  for (const c of conflicts) {
    const Icon = CONFLICT_ICONS[c.kind] ?? AlertTriangle;
    const isRed = c.alertLevel === "red";
    items.push({
      key: c.id,
      label: compact ? (isRed ? "!" : "⚠") : isRed ? "Σύγκρουση" : "Προσοχή",
      title: c.message,
      className: isRed
        ? "bg-red-600 text-white border-red-700"
        : "bg-amber-100 text-amber-950 border-amber-300",
      Icon,
    });
  }

  if (payment.length > 0) {
    const level = payment.some((p) => p.level === "red") ? "red" : "yellow";
    items.push({
      key: "payment",
      label: compact ? "€" : "Πληρωμή",
      title: payment[0]?.title,
      className:
        level === "red"
          ? "bg-red-100 text-red-900 border-red-300"
          : "bg-amber-100 text-amber-950 border-amber-300",
      Icon: CHILD_ICON.payment,
    });
  }
  if (diagnosis.length > 0) {
    const level = diagnosis.some((d) => d.level === "red") ? "red" : "yellow";
    items.push({
      key: "diagnosis",
      label: compact ? "Δ" : "Διάγνωση",
      title: `${diagnosis[0]?.title} — άνοιγμα γνωματεύσεων`,
      href: "/secretary/diagnoses",
      className:
        level === "red"
          ? "bg-red-100 text-red-900 border-red-300"
          : "bg-amber-100 text-amber-950 border-amber-300",
      Icon: CHILD_ICON.diagnosis,
    });
  }
  if (report.length > 0) {
    const level = report.some((r) => r.level === "red") ? "red" : report.some((r) => r.level === "green") ? "green" : "yellow";
    items.push({
      key: "report",
      label: compact ? "Α" : "Αναφορά",
      title: `${report[0]?.title} — αιτήματα αναφορών`,
      href: "/secretary/reports",
      className:
        level === "red"
          ? "bg-red-100 text-red-900 border-red-300"
          : level === "green"
            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
            : "bg-amber-100 text-amber-950 border-amber-300",
      Icon: CHILD_ICON.report,
    });
  }
  if (task.length > 0) {
    items.push({
      key: "task",
      label: compact ? "Ε" : "Εργασία",
      title: task[0]?.title,
      className: "bg-amber-100 text-amber-950 border-amber-300",
      Icon: CHILD_ICON.task,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1" role="list" aria-label="Προειδοποιήσεις">
      {items.map(({ key, label, className, Icon, title, href }) => {
        const inner = (
          <>
            <Icon className="h-3 w-3 shrink-0" aria-hidden />
            {label}
          </>
        );
        const cls = `inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`;
        return href ? (
          <Link key={key} href={href} role="listitem" title={title} className={`${cls} hover:opacity-90`}>
            {inner}
          </Link>
        ) : (
          <span key={key} role="listitem" title={title} className={cls}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}
