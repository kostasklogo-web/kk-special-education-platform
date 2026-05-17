import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessRoomsModule, canWriteRooms } from "@/lib/auth/rooms-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { getRoomById } from "@/lib/data/rooms/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { RoomFormClient } from "@/components/rooms/room-form-client";
import { updateRoomAction } from "@/app/(shell)/rooms/actions";

type EditRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessRoomsModule(ctx.roleCodes)) {
    redirect("/");
  }
  if (!canWriteRooms(ctx.roleCodes)) {
    redirect(`/rooms/${id}`);
  }

  const { room, error: rErr } = await getRoomById(id);
  if (rErr) {
    return (
      <div>
        <PageHeader title="Επεξεργασία αίθουσας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {rErr}
        </div>
      </div>
    );
  }
  if (!room) {
    notFound();
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId || organizationId !== room.organization_id) {
    return (
      <div>
        <PageHeader title="Επεξεργασία αίθουσας" />
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
        title="Επεξεργασία αίθουσας"
        description={room.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/rooms/${id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ακύρωση
            </Link>
            <Link
              href="/rooms"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
          </div>
        }
      />

      {cErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {cErr}
        </div>
      ) : null}

      <RoomFormClient
        mode="edit"
        action={updateRoomAction}
        organizationId={organizationId}
        centers={centers}
        roomId={room.id}
        defaultValues={{
          center_id: room.center_id,
          name: room.name,
          room_code: room.room_code,
          capacity: room.capacity,
          room_type: room.room_type,
          status: room.status,
          description: room.description,
        }}
      />
    </div>
  );
}
