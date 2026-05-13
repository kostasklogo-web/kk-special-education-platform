import { z } from "zod";

export const sessionNoteStatusSchema = z.enum(["draft", "finalized"]);

const uuidArray = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (v === undefined || v === null || v === "") return [];
    return [String(v)];
  },
  z.array(z.string().uuid("Μη έγκυρος στόχος.")).max(40, "Έως 40 συνδεδεμένοι στόχοι.")
);

export const sessionNoteFormSchema = z.object({
  session_id: z.string().uuid("Επιλέξτε έγκυρη συνεδρία."),
  status: sessionNoteStatusSchema,
  linked_goal_ids: uuidArray.default([]),
  goals_worked: z.string().max(12000).default(""),
  activities: z.string().max(12000).default(""),
  child_response: z.string().max(12000).default(""),
  observations: z.string().max(12000).default(""),
  suggestions_next: z.string().max(12000).default(""),
  visible_to_supervisor: z.boolean(),
  visible_to_parent: z.boolean(),
  body: z.string().max(16000).default(""),
});

export type SessionNoteFormInput = z.infer<typeof sessionNoteFormSchema>;

export function formatSessionNoteZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
