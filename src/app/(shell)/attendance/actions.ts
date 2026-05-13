"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canRecordAttendanceForSession } from "@/lib/auth/attendance-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { sessionStatusFromAttendanceStatus } from "@/lib/data/attendance/session-status-sync";
import type { AttendanceStatus } from "@/lib/data/attendance/types";
import { createClient } from "@/lib/supabase/server";
import { attendanceFormSchema, formatAttendanceZodErrors } from "@/lib/validation/attendance-form";

export type AttendanceFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: AttendanceFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

export async function upsertAttendanceAction(
  _prev: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }

  const raw = {
    session_id: gv(formData, "session_id"),
    status: gv(formData, "status") || "expected",
    notes: gv(formData, "notes"),
    actual_starts_at: gv(formData, "actual_starts_at"),
    actual_ends_at: gv(formData, "actual_ends_at"),
  };

  const parsed = attendanceFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatAttendanceZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data: sessionRow, error: sessionErr } = await supabase
    .from("sessions")
    .select("id, organization_id, therapist_user_id, deleted_at")
    .eq("id", parsed.data.session_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (sessionErr || !sessionRow) {
    return { ...initial, ok: false, message: "Η συνεδρία δεν βρέθηκε." };
  }

  const s = sessionRow as {
    id: string;
    organization_id: string;
    therapist_user_id: string;
  };

  const orgOk = await userBelongsToOrganization(s.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  if (
    !canRecordAttendanceForSession(ctx.roleCodes, ctx.user.id, s.therapist_user_id)
  ) {
    return {
      ok: false,
      message: "Δεν έχετε δικαίωμα καταχώρησης παρουσίας για αυτή τη συνεδρία.",
      fieldErrors: {},
    };
  }

  const checkedInAt =
    parsed.data.status !== "expected" ? new Date().toISOString() : null;

  const upsertPayload = {
    session_id: parsed.data.session_id,
    status: parsed.data.status,
    notes: parsed.data.notes,
    actual_starts_at: parsed.data.actual_starts_at,
    actual_ends_at: parsed.data.actual_ends_at,
    recorded_by_user_id: ctx.user.id,
    checked_in_at: checkedInAt,
  };

  const { error: upErr } = await supabase.from("attendance").upsert(upsertPayload, {
    onConflict: "session_id",
  });

  if (upErr) {
    console.error("upsertAttendanceAction", upErr.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δεδομένα.",
      fieldErrors: {},
    };
  }

  const nextSessionStatus = sessionStatusFromAttendanceStatus(
    parsed.data.status as AttendanceStatus
  );
  if (nextSessionStatus) {
    const { error: sessErr } = await supabase
      .from("sessions")
      .update({ status: nextSessionStatus })
      .eq("id", parsed.data.session_id);

    if (sessErr) {
      console.error("upsertAttendanceAction session update", sessErr.message);
      return {
        ok: false,
        message:
          "Η παρουσία αποθηκεύτηκε, αλλά η ενημέρωση κατάστασης συνεδρίας απέτυχε. Επικοινωνήστε με τη γραμματεία.",
        fieldErrors: {},
      };
    }
  }

  revalidatePath("/attendance");
  revalidatePath(`/attendance/${parsed.data.session_id}`);
  revalidatePath(`/attendance/${parsed.data.session_id}/edit`);
  revalidatePath("/schedule");
  revalidatePath(`/schedule/${parsed.data.session_id}`);
  redirect(`/attendance/${parsed.data.session_id}`);
}
