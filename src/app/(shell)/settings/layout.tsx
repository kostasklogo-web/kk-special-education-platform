import { redirect } from "next/navigation";
import { canAccessSettingsAndCentersModule } from "@/lib/auth/settings-centers-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";

export default async function SettingsModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getSessionContext();
  if (!canAccessSettingsAndCentersModule(ctx.roleCodes)) {
    redirect("/");
  }
  return <>{children}</>;
}
