export type SyncStatus = "local-only" | "queued" | "synced" | "conflict";

export interface SyncMetadata {
  noteId: string;
  status: SyncStatus;
  remoteVersion: number | null;
  lastSyncedAt: string | null;
}

export function createLocalOnlySyncMetadata(noteId: string): SyncMetadata {
  return {
    noteId,
    status: "local-only",
    remoteVersion: null,
    lastSyncedAt: null
  };
}

export function markQueued(metadata: SyncMetadata): SyncMetadata {
  return {
    ...metadata,
    status: "queued"
  };
}

export function markConflict(metadata: SyncMetadata): SyncMetadata {
  return {
    ...metadata,
    status: "conflict"
  };
}
