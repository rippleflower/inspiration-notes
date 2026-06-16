import { extractExcerpt, extractTitle } from "./markdown";

export type NoteId = string;

export type NoteStatus = "active" | "deleted";

export interface Note {
  id: NoteId;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  folderId: string | null;
  isFavorite: boolean;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  localVersion: number;
}

export interface CreateNoteInput {
  content?: string;
  folderId?: string | null;
  id?: NoteId;
  now?: Date;
  tags?: string[];
}

export function createNote(input: CreateNoteInput = {}): Note {
  const now = toIso(input.now);
  const content = input.content ?? "";

  return {
    id: input.id ?? createId(),
    title: extractTitle(content),
    content,
    excerpt: extractExcerpt(content),
    tags: input.tags ?? [],
    folderId: input.folderId ?? null,
    isFavorite: false,
    status: "active",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    localVersion: 1
  };
}

export function updateNoteContent(note: Note, content: string, now = new Date()): Note {
  return {
    ...note,
    content,
    title: extractTitle(content),
    excerpt: extractExcerpt(content),
    updatedAt: toIso(now),
    localVersion: note.localVersion + 1
  };
}

export function toggleFavorite(note: Note, now = new Date()): Note {
  return {
    ...note,
    isFavorite: !note.isFavorite,
    updatedAt: toIso(now),
    localVersion: note.localVersion + 1
  };
}

export function updateNoteTags(note: Note, tags: string[], now = new Date()): Note {
  return {
    ...note,
    tags: Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))),
    updatedAt: toIso(now),
    localVersion: note.localVersion + 1
  };
}

export function softDeleteNote(note: Note, now = new Date()): Note {
  return {
    ...note,
    status: "deleted",
    deletedAt: toIso(now),
    updatedAt: toIso(now),
    localVersion: note.localVersion + 1
  };
}

export function restoreNote(note: Note, now = new Date()): Note {
  return {
    ...note,
    status: "active",
    deletedAt: null,
    updatedAt: toIso(now),
    localVersion: note.localVersion + 1
  };
}

function createId(): NoteId {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function toIso(date = new Date()): string {
  return date.toISOString();
}
