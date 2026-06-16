import type { Note, NoteId, NoteStatus } from "@inspiration-notes/core";

export interface NoteListFilter {
  folderId?: string | null;
  includeDeleted?: boolean;
  query?: string;
  tag?: string;
}

export interface NoteSummary {
  id: NoteId;
  title: string;
  excerpt: string;
  tags: string[];
  folderId: string | null;
  isFavorite: boolean;
  status: NoteStatus;
  updatedAt: string;
}

export interface NoteRepository {
  deleteHard(id: NoteId): Promise<void>;
  getById(id: NoteId): Promise<Note | null>;
  list(filter?: NoteListFilter): Promise<NoteSummary[]>;
  save(note: Note): Promise<void>;
}

export function toNoteSummary(note: Note): NoteSummary {
  return {
    id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    tags: note.tags,
    folderId: note.folderId,
    isFavorite: note.isFavorite,
    status: note.status,
    updatedAt: note.updatedAt
  };
}

export function filterAndSortNotes(notes: Note[], filter: NoteListFilter = {}): NoteSummary[] {
  const query = filter.query?.trim().toLocaleLowerCase();

  return notes
    .filter((note) => filter.includeDeleted || note.status === "active")
    .filter((note) => filter.folderId === undefined || note.folderId === filter.folderId)
    .filter((note) => !filter.tag || note.tags.includes(filter.tag))
    .filter((note) => {
      if (!query) {
        return true;
      }

      return (
        note.title.toLocaleLowerCase().includes(query) ||
        note.excerpt.toLocaleLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLocaleLowerCase().includes(query))
      );
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map(toNoteSummary);
}
