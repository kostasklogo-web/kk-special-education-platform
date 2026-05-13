import { z } from "zod";

const optionalEmail = z.preprocess(
  (v) => (v === undefined || v === null ? "" : v),
  z
    .union([z.literal(""), z.string().email("Μη έγκυρο email.")])
    .transform((v) => (v === "" ? null : v))
);

export const parentFormSchema = z.object({
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
  phone: z
    .string()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  email: optionalEmail,
  address_line: z
    .string()
    .max(500)
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

export type ParentFormInput = z.infer<typeof parentFormSchema>;

export const childParentLinkSchema = z.object({
  child_id: z.string().uuid("Μη έγκυρο παιδί."),
  parent_id: z.string().uuid("Μη έγκυρος γονέας."),
  relationship: z.enum(["mother", "father", "guardian", "other"], {
    errorMap: () => ({ message: "Μη έγκυρη σχέση." }),
  }),
  is_primary: z.boolean().optional().default(false),
});

export function formatZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
