import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessRoomsModule, canWriteRooms } from "@/lib/auth/rooms-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { RoomFormClient } from "@/components/rooms/room-form-client";
import { createRoomAction } from "@/app/(shell)/rooms/actions";

export default async function NewRoomPage() {
  const ctx = await getSessionContext();
  if (!canAccessRoomsModule(ctx.roleCodes)) {
    redirect("/");
  }
  if (!canWriteRooms(ctx.roleCodes)) {
    redirect("/rooms");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέα αίθουσα" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const { centers, error: cErr } = await listCentersForOrganization(organizationId);

  return (
    <div>
      <PageHeader
        title="Νέα αίθουσα"
        description="Η αίθουσα συνδέεται με κέντρο και χρησιμοποιείται στο πρόγραμμα συνεδριών."
        actions={
          <Link
            href="/rooms"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Λίστα αιθουσών
          </Link>
        }
      />

      {cErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {cErr}
        </div>
      ) : null}

      <RoomFormClient mode="create" action={createRoomAction} organizationId={organizationId} centers={centers} />
    </div>
  );
}
