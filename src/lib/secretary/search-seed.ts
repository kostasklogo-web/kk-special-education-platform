import type { GlobalSearchResult } from "./types";
import {
  SECRETARY_DEMO_DIAGNOSES,
  SECRETARY_DEMO_INTAKES,
  SECRETARY_DEMO_PAYMENTS,
  SECRETARY_DEMO_TASKS,
} from "@/lib/demo/secretary-demo-data";

export function buildSecretarySearchSeed(): GlobalSearchResult[] {
  const fromIntakes: GlobalSearchResult[] = SECRETARY_DEMO_INTAKES.map((i) => ({
    kind: "child",
    id: i.id,
    title: `${i.childFirstName} ${i.childLastName}`,
    subtitle: `${i.parentNames} · ${i.phonePrimary}`,
    href: "/secretary/intake",
  }));
  const fromPay: GlobalSearchResult[] = SECRETARY_DEMO_PAYMENTS.map((p) => ({
    kind: "payment",
    id: p.id,
    title: p.childLabel,
    subtitle: `Υπόλοιπο ${p.balance}€ · ${p.paymentStatus}`,
    href: "/secretary/payments",
  }));
  const fromTasks: GlobalSearchResult[] = SECRETARY_DEMO_TASKS.map((t) => ({
    kind: "task",
    id: t.id,
    title: t.title,
    subtitle: t.childLabel ?? t.taskTypeLabel,
    href: "/secretary/tasks",
  }));
  const fromDiag: GlobalSearchResult[] = SECRETARY_DEMO_DIAGNOSES.map((d) => ({
    kind: "diagnosis",
    id: d.id,
    title: d.childLabel,
    subtitle: `${d.documentType} · λήξη ${d.expiryDate}`,
    href: "/secretary/diagnoses",
  }));
  return [...fromIntakes, ...fromPay, ...fromTasks, ...fromDiag];
}
