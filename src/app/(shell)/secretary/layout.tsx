import { redirect } from "next/navigation";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";

export default async function SecretaryLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!canAccessSecretaryModule(ctx.roleCodes)) {
    redirect("/");
  }

  return <div className="min-h-0 flex-1">{children}</div>;
}
