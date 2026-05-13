"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { canManageStaffRoles, canWriteStaffRecord } from "@/lib/auth/staff-permissions";
import type { RoleCode } from "@/lib/auth/roles";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getStaffById } from "@/lib/data/staff/queries";
import { createClient } from "@/lib/supabase/server";
import {
  formatStaffZodErrors,
  staffFormCreateSchema,
  staffFormUpdateSchema,
} from "@/lib/validation/staff-form";

export type StaffFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: StaffFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function optUuid(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

async function roleIdForCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: RoleCode
): Promise<string | null> {
  const { data } = await supabase.from("roles").select("id").eq("code", code).maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function createStaffAction(_prev: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteStaffRecord(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα δημιουργίας εγγραφής προσωπικού.", fieldErrors: {} };
  }

  const raw = {
    organization_id: gv(formData, "organization_id"),
    user_id: gv(formData, "user_id"),
    first_name: gv(formData, "first_name"),
    last_name: gv(formData, "last_name"),
    work_email: gv(formData, "work_email"),
    phone: gv(formData, "phone"),
    role_code: gv(formData, "role_code") || "THERAPIST",
    primary_center_id: gv(formData, "primary_center_id"),
    discipline_code: gv(formData, "discipline_code"),
    supervisor_user_id: gv(formData, "supervisor_user_id"),
    employment_status: gv(formData, "employment_status") || "active",
    hire_date: gv(formData, "hire_date"),
    observations: gv(formData, "observations"),
  };

  const parsed = staffFormCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatStaffZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const newRoleId = await roleIdForCode(supabase, parsed.data.role_code);
  if (!newRoleId) {
    return { ok: false, message: "Μη έγκυρος ρόλος συστήματος.", fieldErrors: {} };
  }

  const supId = parsed.data.supervisor_user_id;
  if (supId && supId === parsed.data.user_id) {
    return { ok: false, message: "Ο επόπτης δεν μπορεί να είναι το ίδιο πρόσωπο.", fieldErrors: {} };
  }

  const insertPayload = {
    organization_id: parsed.data.organization_id,
    user_id: parsed.data.user_id,
    first_name: parsed.data.first_name.trim(),
    last_name: parsed.data.last_name.trim(),
    work_email: parsed.data.work_email.trim(),
    phone: parsed.data.phone.trim(),
    primary_center_id: parsed.data.primary_center_id,
    discipline_code: parsed.data.discipline_code,
    supervisor_user_id: supId,
    employment_status: parsed.data.employment_status,
    hire_date: parsed.data.hire_date,
    observations: parsed.data.observations.trim(),
  };

  const { data: created, error: insErr } = await supabase.from("staff").insert(insertPayload).select("id").single();

  if (insErr) {
    console.error("createStaffAction", insErr.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ίσως υπάρχει ήδη εγγραφή για αυτόν τον χρήστη.",
      fieldErrors: {},
    };
  }

  if (canManageStaffRoles(ctx.roleCodes)) {
    const { error: urErr } = await supabase
      .from("user_roles")
      .update({ role_id: newRoleId })
      .eq("organization_id", parsed.data.organization_id)
      .eq("user_id", parsed.data.user_id)
      .is("deleted_at", null);

    if (urErr) {
      console.error("createStaffAction user_roles", urErr.message);
    }
  }

  revalidatePath("/staff");
  redirect(`/staff/${created.id}`);
}

export async function updateStaffAction(_prev: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteStaffRecord(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα επεξεργασίας.", fieldErrors: {} };
  }

  const raw = {
    staff_id: gv(formData, "staff_id"),
    user_id: gv(formData, "user_id"),
    organization_id: gv(formData, "organization_id"),
    first_name: gv(formData, "first_name"),
    last_name: gv(formData, "last_name"),
    work_email: gv(formData, "work_email"),
    phone: gv(formData, "phone"),
    role_code: gv(formData, "role_code") || "THERAPIST",
    primary_center_id: gv(formData, "primary_center_id"),
    discipline_code: gv(formData, "discipline_code"),
    supervisor_user_id: gv(formData, "supervisor_user_id"),
    employment_status: gv(formData, "employment_status") || "active",
    hire_date: gv(formData, "hire_date"),
    observations: gv(formData, "observations"),
  };

  const parsed = staffFormUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatStaffZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const { item: existing, error: loadErr } = await getStaffById(parsed.data.staff_id);
  if (loadErr || !existing) {
    return { ...initial, ok: false, message: "Η εγγραφή δεν βρέθηκε." };
  }
  if (existing.user_id !== parsed.data.user_id) {
    return { ok: false, message: "Αναντιστοιχία χρήστη.", fieldErrors: {} };
  }

  if (
    !canManageStaffRoles(ctx.roleCodes) &&
    existing.role_code !== null &&
    parsed.data.role_code !== existing.role_code
  ) {
    return {
      ok: false,
      message: "Μόνο η διοίκηση μπορεί να αλλάξει ρόλο.",
      fieldErrors: { role_code: "Μη επιτρεπτή αλλαγή ρόλου." },
    };
  }

  const supId = parsed.data.supervisor_user_id;
  if (supId && supId === parsed.data.user_id) {
    return { ok: false, message: "Ο επόπτης δεν μπορεί να είναι το ίδιο πρόσωπο.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const { error: upErr } = await supabase
    .from("staff")
    .update({
      first_name: parsed.data.first_name.trim(),
      last_name: parsed.data.last_name.trim(),
      work_email: parsed.data.work_email.trim(),
      phone: parsed.data.phone.trim(),
      primary_center_id: parsed.data.primary_center_id,
      discipline_code: parsed.data.discipline_code,
      supervisor_user_id: supId,
      employment_status: parsed.data.employment_status,
      hire_date: parsed.data.hire_date,
      observations: parsed.data.observations.trim(),
    })
    .eq("id", parsed.data.staff_id)
    .is("deleted_at", null);

  if (upErr) {
    console.error("updateStaffAction", upErr.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  if (canManageStaffRoles(ctx.roleCodes) && existing.user_role_id) {
    const newRoleId = await roleIdForCode(supabase, parsed.data.role_code);
    if (newRoleId && newRoleId !== existing.role_id) {
      const { error: rErr } = await supabase
        .from("user_roles")
        .update({ role_id: newRoleId })
        .eq("id", existing.user_role_id)
        .is("deleted_at", null);
      if (rErr) {
        console.error("updateStaffAction user_roles", rErr.message);
        return {
          ok: false,
          message: "Τα στοιχεία αποθηκεύτηκαν, αλλά η αλλαγή ρόλου απέτυχε.",
          fieldErrors: {},
        };
      }
    }
  }

  revalidatePath("/staff");
  revalidatePath(`/staff/${parsed.data.staff_id}`);
  revalidatePath(`/staff/${parsed.data.staff_id}/edit`);
  redirect(`/staff/${parsed.data.staff_id}`);
}
