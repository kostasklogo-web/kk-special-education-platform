import "server-only";

import { shouldUseClinicalAccessDemoFallback } from "@/lib/clinical/access/clinical-access-demo-fallback";
import {
  buildDemoClinicalChildProfileBundle,
  isSparseClinicalBundle,
} from "@/lib/demo/clinical-child-profile-demo";
import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import { getClinicalChildProfileBundle } from "./queries";

export type ClinicalProfileLoadResult = {
  bundle: ClinicalChildProfileBundle;
  source: "database" | "demo" | "demo-fallback";
  notice: string | null;
};

/**
 * Loads clinical profile data for review. Never fails hard — falls back to rich demo data.
 */
function forcePrototypeDemo(): boolean {
  const v = process.env.FORCE_CLINICAL_PROTOTYPE?.trim() ?? process.env.NEXT_PUBLIC_FORCE_CLINICAL_PROTOTYPE?.trim();
  return v === "1" || v === "true";
}

export async function loadClinicalChildProfileBundle(
  childId: string
): Promise<ClinicalProfileLoadResult> {
  if (forcePrototypeDemo()) {
    return {
      bundle: buildDemoClinicalChildProfileBundle(childId),
      source: "demo",
      notice:
        "Προβολή πρωτοτύπου με ενδεικτικά δεδομένα (FORCE_CLINICAL_PROTOTYPE).",
    };
  }

  if (await shouldUseClinicalAccessDemoFallback()) {
    return {
      bundle: buildDemoClinicalChildProfileBundle(childId),
      source: "demo",
      notice:
        "Πρωτότυπο κλινικού προφίλ — ενδεικτικά δεδομένα (Supabase μη διαθέσιμο).",
    };
  }

  const { bundle: dbBundle, error } = await getClinicalChildProfileBundle(childId);

  if (dbBundle && !error && !isSparseClinicalBundle(dbBundle)) {
    return { bundle: dbBundle, source: "database", notice: null };
  }

  const demo = buildDemoClinicalChildProfileBundle(childId);

  if (!dbBundle || error) {
    return {
      bundle: demo,
      source: "demo",
      notice:
        "Προβολή με ενδεικτικά δεδομένα (πρωτότυπο). Η σύνδεση με τη βάση δεν είναι διαθέσιμη ή το παιδί δεν βρέθηκε.",
    };
  }

  return {
    bundle: demo,
    source: "demo-fallback",
    notice:
      "Προβολή με ενδεικτικά δεδομένα (πρωτότυπο). Τα δεδομένα βάσης για αυτό το παιδί είναι ελλιπή.",
  };
}
