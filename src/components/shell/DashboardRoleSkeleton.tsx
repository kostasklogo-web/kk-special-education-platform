import { DashboardCard } from "@/components/shell/DashboardCard";
import { EmptyState } from "@/components/shell/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import type { RoleCode } from "@/lib/auth/roles";
import {
  isManagement,
  primaryRoleCode,
  roleLabelEl,
} from "@/lib/auth/roles";

type DashboardRoleSkeletonProps = {
  roleCodes: RoleCode[];
};

export function DashboardRoleSkeleton({ roleCodes }: DashboardRoleSkeletonProps) {
  const primary = primaryRoleCode(roleCodes);

  if (!primary) {
    return (
      <div>
        <PageHeader
          title="Αρχική"
          description="Ο λογαριασμός σας είναι ενεργός, αλλά δεν έχει αντιστοιχιστεί επίσημος ρόλος στο κέντρο. Ζητήστε από τη διοίκηση να ολοκληρωθεί η ανάθεση ρόλων."
        />
        <EmptyState
          title="Αναμονή πρόσβασης"
          description="Μόλις ενεργοποιηθεί ρόλος (π.χ. γονέας, θεραπευτής), θα εμφανιστούν εδώ οι σχετικές πληροφορίες. Προς το παρόν δεν φορτώνονται δεδομένα."
        />
      </div>
    );
  }

  const variant = primary;

  const management = isManagement(roleCodes);

  const title = management
    ? "Πίνακας διοίκησης"
    : variant === "RECEPTION"
      ? "Πίνακας γραμματείας"
      : variant === "SUPERVISOR"
        ? "Πίνακας επόπτη"
        : variant === "THERAPIST"
          ? "Πίνακας θεραπευτή"
          : variant === "PARENT"
            ? "Ο χώρος σας"
            : "Αρχική";

  const description = primary
    ? `Προβολή για ρόλο: ${roleLabelEl(primary)}. Εδώ θα εμφανίζονται συνοπτικά στοιχεία και ειδοποιήσεις όταν ολοκληρωθεί η λειτουργική υλοποίηση.`
    : "Δεν έχει αντιστοιχιστεί ρόλος στο λογαριασμό σας. Επικοινωνήστε με τη διοίκηση του κέντρου.";

  const cards =
    variant === "PARENT"
      ? [
          {
            title: "Τα παιδιά μου",
            subtitle: "Σύνοψη",
            body: "Θα εμφανίζονται εγκεκριμένες πληροφορίες για τα παιδιά που σχετίζονται με το προφίλ σας.",
          },
          {
            title: "Αναφορές",
            subtitle: "Δημοσιευμένο υλικό",
            body: "Πρόσβαση μόνο σε αναφορές που έχουν επισημαντεί ως ορατές σε γονείς.",
          },
          {
            title: "Ρυθμίσεις",
            subtitle: "Λογαριασμός",
            body: "Προτιμήσεις ειδοποιήσεων και στοιχεία επικοινωνίας (υπό υλοποίηση).",
          },
        ]
      : variant === "THERAPIST"
        ? [
            {
              title: "Σημερινό πρόγραμμα",
              subtitle: "Συνεδρίες",
              body: "Θα εμφανίζονται οι συνεδρίες που σας έχουν ανατεθεί.",
            },
            {
              title: "Στόχοι & σημειώσεις",
              subtitle: "Κλινική εργασία",
              body: "Γρήγορη πρόσβαση σε στόχους και σημειώσεις για τα παιδιά της ομάδας σας.",
            },
            {
              title: "Παρουσίες",
              subtitle: "Καταγραφή",
              body: "Καταχώριση παρουσίας για τις συνεδρίες σας.",
            },
          ]
        : variant === "SUPERVISOR"
          ? [
              {
                title: "Ομάδα εποπτείας",
                subtitle: "Θεραπευτές",
                body: "Θα εμφανίζονται οι θεραπευτές που έχουν ανατεθεί στην εποπτεία σας.",
              },
              {
                title: "Κλινική επισκόπηση",
                subtitle: "Στόχοι & σημειώσεις",
                body: "Σύνοψη στόχων και σημειώσεων για τα σχετικά παιδιά.",
              },
              {
                title: "Αναφορές",
                subtitle: "Ποιότητα",
                body: "Πρόσβαση σε αναφορές προόδου στο πλαίσιο της εποπτείας.",
              },
            ]
          : variant === "RECEPTION"
            ? [
                {
                  title: "Ροή ημέρας",
                  subtitle: "Ραντεβού & αίθουσες",
                  body: "Επισκόπηση κρατήσεων και διαθεσιμότητας αιθουσών.",
                },
                {
                  title: "Εγγραφές",
                  subtitle: "Παιδιά & γονείς",
                  body: "Γρήγορη πρόσβαση σε νέες εγγραφές και ενημερώσεις στοιχείων.",
                },
                {
                  title: "Παρουσίες",
                  subtitle: "Κέντρο",
                  body: "Κατάσταση παρουσιών ανά κέντρο και αίθουσα.",
                },
              ]
            : [
                {
                  title: "Οργανισμός & κέντρα",
                  subtitle: "Διακυβέρνηση",
                  body: "Σύνοψη οργανισμών και κέντρων στα οποία έχετε πλήρη διαχειριστική πρόσβαση.",
                },
                {
                  title: "Πρόσβαση & ρόλοι",
                  subtitle: "Ασφάλεια",
                  body: "Διαχείριση μελών και ρόλων (θα συνδεθεί με τη ροή διαχείρισης χρηστών).",
                },
                {
                  title: "Συμμόρφωση",
                  subtitle: "GDPR / αρχεία",
                  body: "Σύνδεση με πολιτικές διατήρησης και έλεγχο πρόσβασης σε ευαίσθητα δεδομένα.",
                },
              ];

  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <DashboardCard key={c.title} title={c.title} subtitle={c.subtitle}>
            {c.body}
          </DashboardCard>
        ))}
      </div>
      <EmptyState
        title="Δεν υπάρχουν δεδομένα προς εμφάνιση"
        description="Αυτή η προβολή είναι σκελετός για το MVP. Δεν φορτώνονται πραγματικά δεδομένα από τη βάση μέχρι να ολοκληρωθούν οι αντίστοιχες λειτουργίες."
      />
    </div>
  );
}
