import { z } from "zod";

export const therapyGoalStatusSchema = z.enum([
  "active",
  "in_progress",
  "met",
  "on_hold",
  "cancelled",
]);

export const therapyGoalPrioritySchema = z.enum(["high", "medium", "low"]);

const dateYmd = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v === "" || !v ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Μη έγκυρη ημερομηνία (YYYY-MM-DD).");

export const therapyGoalFormSchema = z
  .object({
    organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
    child_id: z.string().uuid("Επιλέξτε παιδί."),
    treatment_plan_id: z.string().uuid("Επιλέξτε θεραπευτικό πλάνο."),
    discipline_code: z.string().min(1, "Επιλέξτε ειδικότητα."),
    therapist_user_id: z.string().uuid("Επιλέξτε υπεύθυνο θεραπευτή."),
    title: z.string().min(1, "Συμπληρώστε τίτλο στόχου.").max(500),
    description: z
      .string()
      .max(12000)
      .optional()
      .nullable()
      .transform((v) => (v === "" || v === undefined ? null : v)),
    success_criterion: z.string().max(12000).default(""),
    start_date: dateYmd,
    target_completion_date: dateYmd,
    status: therapyGoalStatusSchema,
    priority: therapyGoalPrioritySchema,
    observations: z.string().max(12000).default(""),
  })
  .refine(
    (d) => {
      if (!d.start_date || !d.target_completion_date) return true;
      return d.target_completion_date >= d.start_date;
    },
    { message: "Η εκτιμώμενη ολοκλήρωση πρέπει να είναι μετά ή ίση με την έναρξη.", path: ["target_completion_date"] }
  );

export type TherapyGoalFormInput = z.infer<typeof therapyGoalFormSchema>;

export function formatTherapyGoalZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
