/**
 * Minimal child registry for lists when Supabase is unavailable (client-safe).
 */

import { DEMO_PRIMARY_CENTER_ID, getDemoOrganizationId } from "@/lib/config/demo";
import type { ChildListItem } from "@/lib/data/children/types";
import { DEMO_CLINICAL_CHILD_B_ID, DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";

function stubChild(
  id: string,
  firstName: string,
  lastName: string
): ChildListItem {
  const org = getDemoOrganizationId();
  return {
    id,
    organization_id: org,
    primary_center_id: DEMO_PRIMARY_CENTER_ID,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: "2018-01-01",
    gender: "male",
    preferred_language: "el",
    status: "active",
    school_name: null,
    school_grade: null,
    enrollment_start_date: "2024-09-01",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    center: { id: DEMO_PRIMARY_CENTER_ID, name: "Κέντρο Demo" },
  };
}

export function getDemoChildrenListStubs(): ChildListItem[] {
  return [
    stubChild(DEMO_CLINICAL_CHILD_ID, "Νίκος", "Παπαδόπουλος"),
    stubChild(DEMO_CLINICAL_CHILD_B_ID, "Ελένη", "Demo"),
  ];
}
