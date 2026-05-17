import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { ShellCommunicationBridge } from "@/components/secretary/reminders/ShellCommunicationBridge";
import { GdprShellBridge } from "@/components/gdpr/GdprShellBridge";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getSecretaryDemoBundle } from "@/lib/data/secretary/queries";

export default async function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getSessionContext();
  const { organizationId: layoutOrgId } = await getDefaultOrganizationIdForUser();
  const gdprOrganizationId = layoutOrgId ?? "";
  const secretaryEnabled = canAccessSecretaryModule(ctx.roleCodes);

  let communicationBundle = null;
  if (secretaryEnabled) {
    const { organizationId } = await getDefaultOrganizationIdForUser();
    const org = organizationId ?? "";
    const data = getSecretaryDemoBundle(org);
    communicationBundle = {
      organizationId: org,
      appointments: data.appointments,
      payments: data.payments,
      diagnoses: data.diagnoses,
      reports: data.reports,
      consents: data.consents,
    };
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AppSidebar roleCodes={ctx.roleCodes} />
      <div className="flex min-h-screen flex-1 flex-col md:pl-[var(--shell-sidebar)]">
        <AppHeader roleCodes={ctx.roleCodes} userEmail={ctx.user?.email} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <GdprShellBridge
            organizationId={gdprOrganizationId}
            userId={ctx.user?.id ?? null}
            userEmail={ctx.user?.email}
            roleCodes={ctx.roleCodes}
          >
            <ShellCommunicationBridge enabled={secretaryEnabled} bundle={communicationBundle}>
              {children}
            </ShellCommunicationBridge>
          </GdprShellBridge>
        </main>
      </div>
    </div>
  );
}

