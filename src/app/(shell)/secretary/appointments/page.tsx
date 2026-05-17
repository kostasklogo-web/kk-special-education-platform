import Link from "next/link";
import { CalendarDays, ClipboardList, Stethoscope, Users } from "lucide-react";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { SecretaryFeatureHub } from "@/components/secretary/SecretaryFeatureHub";

export default async function SecretaryAppointmentsPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/appointments", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Ραντεβού / Αξιολογήσεις"
        description="Διαχείριση αξιολογήσεων, λήψης ιστορικού, ενημέρωσης γονέων και επαναξιολογήσεων."
        actions={
          <Link
            href="/secretary/schedule?action=new"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white hover:bg-clinical-700"
          >
            Νέο ραντεβού στο πρόγραμμα
          </Link>
        }
      />
      <SecretaryFeatureHub
        title="Κέντρο ραντεβού & αξιολογήσεων"
        description="Οι λειτουργίες συνδέονται με το πρόγραμμα γραμματείας. Χρησιμοποιήστε τα παρακάτω για γρήγορη πρόσβαση ανά τύπο."
        features={[
          {
            title: "Αξιολογήσεις",
            description: "Προγραμματισμός και παρακολούθηση αρχικών & επαναξιολογήσεων.",
            href: "/secretary/schedule?type=evaluation",
            icon: Stethoscope,
            status: "preview",
            actionLabel: "Πρόγραμμα αξιολογήσεων",
          },
          {
            title: "Λήψη ιστορικού",
            description: "Ραντεβού λήψης ιστορικού και σύνδεση με intake.",
            href: "/secretary/schedule?type=history_taking",
            icon: ClipboardList,
            status: "preview",
          },
          {
            title: "Ενημέρωση γονέων",
            description: "Συναντήσεις ενημέρωσης πριν την έναρξη προγράμματος.",
            href: "/secretary/schedule?type=parent_info",
            icon: Users,
            status: "preview",
          },
          {
            title: "Επαναξιολογήσεις",
            description: "Προγραμματισμός επαναξιολόγησης & εποπτείας.",
            href: "/secretary/schedule?type=reevaluation",
            icon: CalendarDays,
            status: "planned",
          },
          {
            title: "Προσθήκη στο πρόγραμμα",
            description: "Νέο παιδί ή τροποποίηση υπάρχοντος ραντεβού.",
            href: "/secretary/schedule?action=new",
            icon: CalendarDays,
            status: "live",
            actionLabel: "Άνοιγμα προγράμματος",
          },
          {
            title: "Παύση / αφαίρεση περιστατικού",
            description: "Διακοπή θεραπείας ή αφαίρεση από ενεργό πρόγραμμα.",
            status: "planned",
          },
        ]}
      />
    </div>
  );
}
