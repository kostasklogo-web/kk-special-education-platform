import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { DemoDebugPanel } from "@/components/shell/DemoDebugPanel";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { isDemoDebugPanelVisible } from "@/lib/config/demo";

export default async function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getSessionContext();

  return (
    <div className="flex min-h-screen bg-surface">
      <AppSidebar roleCodes={ctx.roleCodes} />
      <div className="flex min-h-screen flex-1 flex-col md:pl-[var(--shell-sidebar)]">
        <AppHeader roleCodes={ctx.roleCodes} userEmail={ctx.user?.email} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
          {isDemoDebugPanelVisible() ? <DemoDebugPanel /> : null}
        </main>
      </div>
    </div>
  );
}
