import { z } from "zod";

export const employmentStatusSchema = z.enum(["active", "inactive", "on_leave"]);

const staffRoleFormSchema = z.enum(["ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST", "ORG_OWNER"]);

export const staffFormSchema = z.object({
  organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
  user_id: z.string().uuid().optional(),
  first_name: z.string().min(1, "Συμπληρώστε όνομα.").max(120),
  last_name: z.string().min(1, "Συμπληρώστε επώνυμο.").max(120),
  work_email: z
    .string()
    .max(320)
    .default("")
    .refine((s) => s.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()), "Μη έγκυρο email."),
  phone: z.string().max(80).default(""),
  role_code: staffRoleFormSchema,
  primary_center_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : String(v)),
    z.string().uuid("Μη έγκυρο κέντρο.").nullable()
  ),
  discipline_code: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : String(v)),
    z.string().max(64).nullable()
  ),
  supervisor_user_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : String(v)),
    z.string().uuid("Μη έγκυρος επόπτης.").nullable()
  ),
  employment_status: employmentStatusSchema,
  hire_date: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v === undefined || v === null || v === "" ? null : String(v)))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Μη έγκυρη ημερομηνία (YYYY-MM-DD)."),
  observations: z.string().max(8000).default(""),
});

export const staffFormCreateSchema = staffFormSchema.extend({
  user_id: z.string().uuid("Επιλέξτε χρήστη από τη λίστα."),
});

export const staffFormUpdateSchema = staffFormSchema.extend({
  staff_id: z.string().uuid("Λείπει αναγνωριστικό προσωπικού."),
  user_id: z.string().uuid(),
});

export type StaffFormInput = z.infer<typeof staffFormSchema>;

export function formatStaffZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
