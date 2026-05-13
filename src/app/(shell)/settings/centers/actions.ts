"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { canManageCenters } from "@/lib/auth/settings-centers-permissions";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getCenterById } from "@/lib/data/centers/queries";
import { createClient } from "@/lib/supabase/server";
import {
  centerFormSchema,
  centerFormUpdateSchema,
  formatCenterZodErrors,
} from "@/lib/validation/center-form";

export type CenterFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: CenterFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

export async function createCenterAction(_prev: CenterFormState, formData: FormData): Promise<CenterFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canManageCenters(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα δημιουργίας κέντρου.", fieldErrors: {} };
  }

  const raw = {
    organization_id: gv(formData, "organization_id"),
    name: gv(formData, "name"),
    address_line: gv(formData, "address_line"),
    city: gv(formData, "city"),
    phone: gv(formData, "phone"),
    contact_email: gv(formData, "contact_email"),
    description: gv(formData, "description"),
    is_active: gv(formData, "is_active") || "true",
  };

  const parsed = centerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatCenterZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("centers")
    .insert({
      organization_id: parsed.data.organization_id,
      name: parsed.data.name.trim(),
      address_line: parsed.data.address_line,
      city: parsed.data.city.trim(),
      phone: parsed.data.phone,
      contact_email: parsed.data.contact_email.trim(),
      description: parsed.data.description.trim(),
      is_active: parsed.data.is_active,
      timezone: "Europe/Athens",
    })
    .select("id")
    .single();

  if (error) {
    console.error("createCenterAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/settings/centers");
  revalidatePath("/settings");
  redirect(`/settings/centers/${created.id}`);
}

export async function updateCenterAction(_prev: CenterFormState, formData: FormData): Promise<CenterFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canManageCenters(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα επεξεργασίας κέντρου.", fieldErrors: {} };
  }

  const raw = {
    center_id: gv(formData, "center_id"),
    organization_id: gv(formData, "organization_id"),
    name: gv(formData, "name"),
    address_line: gv(formData, "address_line"),
    city: gv(formData, "city"),
    phone: gv(formData, "phone"),
    contact_email: gv(formData, "contact_email"),
    description: gv(formData, "description"),
    is_active: gv(formData, "is_active") || "true",
  };

  const parsed = centerFormUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatCenterZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const { center: existing, error: loadErr } = await getCenterById(parsed.data.center_id);
  if (loadErr || !existing) {
    return { ...initial, ok: false, message: "Το κέντρο δεν βρέθηκε." };
  }
  if (existing.organization_id !== parsed.data.organization_id) {
    return { ok: false, message: "Αναντιστοιχία οργανισμού.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("centers")
    .update({
      name: parsed.data.name.trim(),
      address_line: parsed.data.address_line,
      city: parsed.data.city.trim(),
      phone: parsed.data.phone,
      contact_email: parsed.data.contact_email.trim(),
      description: parsed.data.description.trim(),
      is_active: parsed.data.is_active,
    })
    .eq("id", parsed.data.center_id)
    .is("deleted_at", null);

  if (error) {
    console.error("updateCenterAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/settings/centers");
  revalidatePath(`/settings/centers/${parsed.data.center_id}`);
  revalidatePath(`/settings/centers/${parsed.data.center_id}/edit`);
  revalidatePath("/children");
  revalidatePath("/schedule");
  revalidatePath("/rooms");
  redirect(`/settings/centers/${parsed.data.center_id}`);
}
