import { z } from "zod";

export const centerFormSchema = z.object({
  organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
  name: z.string().min(1, "Συμπληρώστε όνομα κέντρου.").max(300),
  address_line: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  city: z.string().max(200).default(""),
  phone: z.string().max(80).optional().nullable().transform((v) => (v === "" || v === undefined ? null : v)),
  contact_email: z
    .string()
    .max(320)
    .default("")
    .refine((s) => s.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()), "Μη έγκυρο email."),
  description: z.string().max(8000).default(""),
  is_active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const centerFormUpdateSchema = centerFormSchema.extend({
  center_id: z.string().uuid("Λείπει αναγνωριστικό κέντρου."),
});

export type CenterFormInput = z.infer<typeof centerFormSchema>;

export function formatCenterZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
