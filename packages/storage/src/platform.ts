import { createInMemoryNoteRepository } from "./memory";
import type { NoteRepository } from "./repository";

export function createPlatformNoteRepository(): NoteRepository {
  return createInMemoryNoteRepository();
}
