"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getChildById } from "@/lib/data/children/queries";
import { getParentById } from "@/lib/data/parents/queries";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { createClient } from "@/lib/supabase/server";
import {
  childParentLinkSchema,
  formatZodErrors,
  parentFormSchema,
} from "@/lib/validation/parent-form";

export type ParentFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: ParentFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function formDataToParentObject(formData: FormData) {
  return {
    organization_id: gv(formData, "organization_id"),
    first_name: gv(formData, "first_name"),
    last_name: gv(formData, "last_name"),
    phone: gv(formData, "phone"),
    email: gv(formData, "email"),
    address_line: gv(formData, "address_line"),
    notes: gv(formData, "notes"),
  };
}

function parseRelationship(formData: FormData): "mother" | "father" | "guardian" | "other" {
  const v = gv(formData, "relationship");
  if (v === "mother" || v === "father" || v === "guardian" || v === "other") return v;
  return "guardian";
}

function parsePrimary(formData: FormData): boolean {
  return gv(formData, "is_primary") === "on" || gv(formData, "is_primary") === "true";
}

export async function createParentAction(
  _prev: ParentFormState,
  formData: FormData
): Promise<ParentFormState> {
  const raw = formDataToParentObject(formData);
  const parsed = parentFormSchema.safeParse(raw);

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
    phone: parsed.data.phone,
    email: parsed.data.email,
    address_line: parsed.data.address_line,
    notes: parsed.data.notes,
  };

  const { data, error } = await supabase.from("parents").insert(insertRow).select("id").single();

  if (error) {
    console.error("createParentAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε δικαιώματα (RLS) ή μοναδικότητα email.",
      fieldErrors: {},
    };
  }

  const linkChildId = gv(formData, "link_child_id");
  if (linkChildId) {
    const { child } = await getChildById(linkChildId);
    if (
      child &&
      child.organization_id === parsed.data.organization_id &&
      parsePrimary(formData)
    ) {
      await supabase
        .from("child_parent_relationships")
        .update({ is_primary: false })
        .eq("child_id", linkChildId)
        .is("deleted_at", null);
    }
    if (child && child.organization_id === parsed.data.organization_id) {
      const { error: linkErr } = await supabase.from("child_parent_relationships").insert({
        child_id: linkChildId,
        parent_id: data.id,
        relationship: parseRelationship(formData),
        is_primary: parsePrimary(formData),
      });
      if (linkErr) {
        console.error("createParentAction link", linkErr.message);
      }
    }
  }

  revalidatePath("/parents");
  revalidatePath(`/parents/${data.id}`);
  if (linkChildId) {
    revalidatePath(`/children/${linkChildId}`);
  }
  redirect(`/parents/${data.id}`);
}

export async function updateParentAction(
  _prev: ParentFormState,
  formData: FormData
): Promise<ParentFormState> {
  const parentId = gv(formData, "parent_id");
  if (!parentId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό γονέα." };
  }

  const { parent, error: loadErr } = await getParentById(parentId);
  if (loadErr || !parent) {
    return { ...initial, ok: false, message: "Ο γονέας δεν βρέθηκε ή δεν επιτρέπεται η πρόσβαση." };
  }

  const raw = formDataToParentObject(formData);
  const parsed = parentFormSchema.safeParse({
    ...raw,
    organization_id: parent.organization_id,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("parents")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address_line: parsed.data.address_line,
      notes: parsed.data.notes,
    })
    .eq("id", parentId);

  if (error) {
    console.error("updateParentAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε δικαιώματα (RLS).",
      fieldErrors: {},
    };
  }

  revalidatePath("/parents");
  revalidatePath(`/parents/${parentId}`);
  revalidatePath(`/parents/${parentId}/edit`);
  redirect(`/parents/${parentId}`);
}

async function executeParentChildLink(formData: FormData): Promise<ParentFormState> {
  const parsed = childParentLinkSchema.safeParse({
    child_id: gv(formData, "child_id"),
    parent_id: gv(formData, "parent_id"),
    relationship: parseRelationship(formData),
    is_primary: parsePrimary(formData),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Μη έγκυρα δεδομένα σύνδεσης.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { child } = await getChildById(parsed.data.child_id);
  const { parent } = await getParentById(parsed.data.parent_id);

  if (!child || !parent || child.organization_id !== parent.organization_id) {
    return {
      ok: false,
      message: "Το παιδί και ο γονέας πρέπει να ανήκουν στον ίδιο οργανισμό.",
      fieldErrors: {},
    };
  }

  const supabase = await createClient();

  if (parsed.data.is_primary) {
    await supabase
      .from("child_parent_relationships")
      .update({ is_primary: false })
      .eq("child_id", parsed.data.child_id)
      .is("deleted_at", null);
  }

  const { error } = await supabase.from("child_parent_relationships").insert({
    child_id: parsed.data.child_id,
    parent_id: parsed.data.parent_id,
    relationship: parsed.data.relationship,
    is_primary: parsed.data.is_primary,
  });

  if (error) {
    console.error("executeParentChildLink", error.message);
    return {
      ok: false,
      message: "Η σύνδεση απέτυχε. Ίσως υπάρχει ήδη ενεργή σχέση για αυτό το ζεύγος.",
      fieldErrors: {},
    };
  }

  revalidatePath("/parents");
  revalidatePath(`/parents/${parsed.data.parent_id}`);
  revalidatePath(`/children/${parsed.data.child_id}`);
  return { ok: true, message: "Η σύνδεση ολοκληρώθηκε επιτυχώς.", fieldErrors: {} };
}

export async function linkParentToChildAction(
  _prev: ParentFormState,
  formData: FormData
): Promise<ParentFormState> {
  return executeParentChildLink(formData);
}

export async function linkChildToParentAction(
  _prev: ParentFormState,
  formData: FormData
): Promise<ParentFormState> {
  return executeParentChildLink(formData);
}

export async function unlinkParentRelationshipAction(
  _prev: ParentFormState,
  formData: FormData
): Promise<ParentFormState> {
  const relationshipId = gv(formData, "relationship_id");
  if (!relationshipId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό σχέσης." };
  }

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from("child_parent_relationships")
    .select("id, child_id, parent_id")
    .eq("id", relationshipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ...initial, ok: false, message: "Η σχέση δεν βρέθηκε ή έχει ήδη αφαιρεθεί." };
  }

  const { error } = await supabase
    .from("child_parent_relationships")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", relationshipId);

  if (error) {
    console.error("unlinkParentRelationshipAction", error.message);
    return {
      ok: false,
      message: "Η αφαίρεση σύνδεσης απέτυχε (RLS).",
      fieldErrors: {},
    };
  }

  const r = row as { child_id: string; parent_id: string };
  revalidatePath("/parents");
  revalidatePath(`/parents/${r.parent_id}`);
  revalidatePath(`/children/${r.child_id}`);
  return { ok: true, message: "Η σύνδεση αφαιρέθηκε.", fieldErrors: {} };
}
