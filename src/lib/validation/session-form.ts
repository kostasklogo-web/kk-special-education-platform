import { z } from "zod";

export const sessionKindSchema = z.enum([
  "individual",
  "group",
  "assessment",
  "parent_counseling",
  "supervision",
]);

export const sessionStatusSchema = z.enum([
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
  "absence",
  "to_reschedule",
]);

export const sessionFormSchema = z
  .object({
    organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
    center_id: z.string().uuid("Επιλέξτε κέντρο."),
    room_id: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === "" || !v ? null : v))
      .refine((v) => v === null || z.string().uuid().safeParse(v).success, "Μη έγκυρη αίθουσα."),
    child_id: z.string().uuid("Επιλέξτε παιδί."),
    therapist_user_id: z.string().uuid("Επιλέξτε θεραπευτή."),
    discipline_code: z.string().min(1, "Επιλέξτε ειδικότητα."),
    session_kind: sessionKindSchema,
    status: sessionStatusSchema,
    starts_at: z.string().min(1, "Λείπει ημερομηνία/ώρα έναρξης."),
    ends_at: z.string().min(1, "Λείπει ημερομηνία/ώρα λήξης."),
    internal_notes: z
      .string()
      .max(8000)
      .optional()
      .nullable()
      .transform((v) => (v === "" || v === undefined ? null : v)),
  })
  .refine((d) => new Date(d.ends_at) > new Date(d.starts_at), {
    message: "Η ώρα λήξης πρέπει να είναι μετά την έναρξη.",
    path: ["ends_at"],
  });

export type SessionFormInput = z.infer<typeof sessionFormSchema>;

export function formatZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
