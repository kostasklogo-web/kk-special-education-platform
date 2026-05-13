import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "expected",
  "present",
  "absent",
  "cancel_parent",
  "cancel_therapist",
  "cancel_center",
  "to_makeup",
  "made_up",
]);

export const attendanceFormSchema = z
  .object({
    session_id: z.string().uuid("Μη έγκυρη συνεδρία."),
    status: attendanceStatusSchema,
    notes: z
      .string()
      .max(8000)
      .optional()
      .nullable()
      .transform((v) => (v === "" || v === undefined ? null : v)),
    actual_starts_at: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === "" || !v ? null : v))
      .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Μη έγκυρη ώρα έναρξης."),
    actual_ends_at: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === "" || !v ? null : v))
      .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Μη έγκυρη ώρα λήξης."),
  })
  .refine(
    (d) => {
      if (!d.actual_starts_at || !d.actual_ends_at) return true;
      return new Date(d.actual_ends_at) > new Date(d.actual_starts_at);
    },
    { message: "Η ώρα λήξης πρέπει να είναι μετά την έναρξη.", path: ["actual_ends_at"] }
  );

export type AttendanceFormInput = z.infer<typeof attendanceFormSchema>;

export function formatAttendanceZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
