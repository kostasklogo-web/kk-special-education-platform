import { redirect } from "next/navigation";
import { isParentOnly } from "@/lib/auth/children-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";

export default async function ParentsModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getSessionContext();
  if (isParentOnly(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
