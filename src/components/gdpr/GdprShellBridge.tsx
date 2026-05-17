"use client";

import type { RoleCode } from "@/lib/auth/roles";
import { GdprProvider } from "./GdprProvider";

type Props = {
  children: React.ReactNode;
  organizationId: string;
  userId: string | null;
  userEmail: string | null | undefined;
  roleCodes: RoleCode[];
};

export function GdprShellBridge({
  children,
  organizationId,
  userId,
  userEmail,
  roleCodes,
}: Props) {
  const userLabel = userEmail?.split("@")[0] ?? "Χρήστης";

  return (
    <GdprProvider
      organizationId={organizationId}
      userId={userId}
      userLabel={userLabel}
      roleCodes={roleCodes}
    >
      {children}
    </GdprProvider>
  );
}
