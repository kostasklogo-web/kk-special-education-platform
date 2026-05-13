import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { isParentOnly } from "@/lib/auth/children-permissions";

export default async function ChildrenModuleLayout({
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
