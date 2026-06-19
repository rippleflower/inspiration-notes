import type { Note, NoteId } from "@inspiration-notes/core";
import { filterAndSortNotes, type NoteListFilter, type NoteRepository } from "./repository";
export {
  createInMemoryPluginInstallationStore,
  InMemoryPluginInstallationStore
} from "./pluginInstallations";

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes = new Map<NoteId, Note>();

  async deleteHard(id: NoteId): Promise<void> {
    this.notes.delete(id);
  }

  async getById(id: NoteId): Promise<Note | null> {
    return this.notes.get(id) ?? null;
  }

  async list(filter?: NoteListFilter) {
    return filterAndSortNotes(Array.from(this.notes.values()), filter);
  }

  async save(note: Note): Promise<void> {
    this.notes.set(note.id, note);
  }
}

export function createInMemoryNoteRepository(): NoteRepository {
  return new InMemoryNoteRepository();
}
