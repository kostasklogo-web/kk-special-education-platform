import { z } from "zod";

export const childFormSchema = z.object({
  organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
  first_name: z
    .string()
    .trim()
    .min(1, "Το όνομα είναι υποχρεωτικό.")
    .max(120, "Το όνομα είναι πολύ μεγάλο."),
  last_name: z
    .string()
    .trim()
    .min(1, "Το επώνυμο είναι υποχρεωτικό.")
    .max(120, "Το επώνυμο είναι πολύ μεγάλο."),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v))
    .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Μη έγκυρη ημερομηνία γέννησης."),
  gender: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.enum(["male", "female", "other", "unspecified"]).nullable()
  ),
  primary_center_id: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, "Μη έγκυρο κέντρο."),
  enrollment_start_date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v))
    .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Μη έγκυρη ημερομηνία έναρξης."),
  status: z.enum(["active", "on_hold", "discharged"], {
    errorMap: () => ({ message: "Μη έγκυρη κατάσταση." }),
  }),
  preferred_language: z.enum(["el", "en"], {
    errorMap: () => ({ message: "Μη έγκυρη γλώσσα προτίμησης." }),
  }),
  school_name: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  school_grade: z
    .string()
    .max(80)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  notes: z
    .string()
    .max(4000)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
});

export type ChildFormInput = z.infer<typeof childFormSchema>;

export function formatZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
