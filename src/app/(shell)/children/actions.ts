"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getChildById } from "@/lib/data/children/queries";
import { createClient } from "@/lib/supabase/server";
import { childFormSchema, formatZodErrors } from "@/lib/validation/child-form";

export type ChildFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: ChildFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function formDataToObject(formData: FormData) {
  return {
    organization_id: gv(formData, "organization_id"),
    first_name: gv(formData, "first_name"),
    last_name: gv(formData, "last_name"),
    date_of_birth: gv(formData, "date_of_birth"),
    gender: gv(formData, "gender"),
    primary_center_id: gv(formData, "primary_center_id"),
    enrollment_start_date: gv(formData, "enrollment_start_date"),
    status: gv(formData, "status") || "active",
    preferred_language: gv(formData, "preferred_language") || "el",
    school_name: gv(formData, "school_name"),
    school_grade: gv(formData, "school_grade"),
    notes: gv(formData, "notes"),
  };
}

export async function createChildAction(
  _prev: ChildFormState,
  formData: FormData
): Promise<ChildFormState> {
  const raw = formDataToObject(formData);
  const parsed = childFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const okOrg = await userBelongsToOrganization(parsed.data.organization_id);
  if (!okOrg) {
    return {
      ok: false,
      message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.",
      fieldErrors: {},
    };
  }

  const supabase = await createClient();
  const insertRow = {
    organization_id: parsed.data.organization_id,
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    date_of_birth: parsed.data.date_of_birth,
    gender: parsed.data.gender,
    primary_center_id: parsed.data.primary_center_id,
    enrollment_start_date: parsed.data.enrollment_start_date,
    status: parsed.data.status,
    preferred_language: parsed.data.preferred_language,
    school_name: parsed.data.school_name,
    school_grade: parsed.data.school_grade,
    notes: parsed.data.notes,
  };

  const { data, error } = await supabase.from("children").insert(insertRow).select("id").single();

  if (error) {
    console.error("createChildAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε τα δεδομένα ή δικαιώματα (RLS).",
      fieldErrors: {},
    };
  }

  revalidatePath("/children");
  redirect(`/children/${data.id}`);
}

export async function updateChildAction(
  _prev: ChildFormState,
  formData: FormData
): Promise<ChildFormState> {
  const childId = String(formData.get("child_id") ?? "");
  if (!childId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό παιδιού." };
  }

  const { child, error: loadErr } = await getChildById(childId);
  if (loadErr || !child) {
    return { ...initial, ok: false, message: "Το παιδί δεν βρέθηκε ή δεν επιτρέπεται η πρόσβαση." };
  }

  const raw = formDataToObject(formData);
  const parsed = childFormSchema.safeParse({
    ...raw,
    organization_id: child.organization_id,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const updateRow = {
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    date_of_birth: parsed.data.date_of_birth,
    gender: parsed.data.gender,
    primary_center_id: parsed.data.primary_center_id,
    enrollment_start_date: parsed.data.enrollment_start_date,
    status: parsed.data.status,
    preferred_language: parsed.data.preferred_language,
    school_name: parsed.data.school_name,
    school_grade: parsed.data.school_grade,
    notes: parsed.data.notes,
  };

  const { error } = await supabase.from("children").update(updateRow).eq("id", childId);

  if (error) {
    console.error("updateChildAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε δικαιώματα (RLS) ή δεδομένα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/children");
  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/edit`);
  redirect(`/children/${childId}`);
}
