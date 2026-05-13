import { z } from "zod";

export const roomTypeSchema = z.enum([
  "speech_therapy",
  "occupational_therapy",
  "psychotherapy",
  "group_program",
  "assessment",
  "office",
  "other",
]);

export const roomStatusSchema = z.enum(["active", "inactive", "maintenance"]);

export const roomFormSchema = z.object({
  organization_id: z.string().uuid("Μη έγκυρος οργανισμός."),
  center_id: z.string().uuid("Επιλέξτε κέντρο / τοποθεσία."),
  name: z.string().min(1, "Συμπληρώστε όνομα αίθουσας.").max(300),
  room_code: z.string().max(80).default(""),
  /** null = κενό πεδίο φόρμας· αριθμός 0–5000 */
  capacity: z
    .number({ invalid_type_error: "Η χωρητικότητα πρέπει να είναι αριθμός." })
    .int("Η χωρητικότητα πρέπει να είναι ακέραιος αριθμός.")
    .min(0, "Η χωρητικότητα δεν μπορεί να είναι αρνητική.")
    .max(5000, "Μη ρεαλιστική χωρητικότητα.")
    .nullable(),
  room_type: roomTypeSchema,
  status: roomStatusSchema,
  description: z.string().max(8000).default(""),
});

export type RoomFormInput = z.infer<typeof roomFormSchema>;

export function formatRoomZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
