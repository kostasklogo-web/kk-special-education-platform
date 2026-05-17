/**
 * Soft-delete / archive helpers — never hard-delete sensitive records in UI flows.
 */

export type ArchivableEntity = {
  archived?: boolean;
  deletedAt?: string | null;
};

export function markArchived<T extends ArchivableEntity>(
  entity: T,
  archivedByLabel: string
): T & { archived: true; archivedAt: string; archivedByLabel: string } {
  const now = new Date().toISOString();
  return {
    ...entity,
    archived: true,
    deletedAt: now,
    archivedAt: now,
    archivedByLabel,
  } as T & { archived: true; archivedAt: string; archivedByLabel: string };
}

export function isActiveRecord(entity: ArchivableEntity): boolean {
  return !entity.archived && !entity.deletedAt;
}

export function softDeleteBlockedMessage(entityLabel: string): string {
  return `Η μόνιμη διαγραφή «${entityLabel}» δεν επιτρέπεται για λόγους GDPR. Χρησιμοποιήστε αρχειοθέτηση.`;
}
