import type { Note, NoteId } from "@inspiration-notes/core";
import { filterAndSortNotes, type NoteListFilter, type NoteRepository } from "./repository";

const dbName = "inspiration-notes";
const dbVersion = 1;
const storeName = "notes";

export function createPlatformNoteRepository(): NoteRepository {
  return new IndexedDbNoteRepository();
}

class IndexedDbNoteRepository implements NoteRepository {
  async deleteHard(id: NoteId): Promise<void> {
    const db = await openNotesDb();
    await transaction(db, "readwrite", (store) => store.delete(id));
  }

  async getById(id: NoteId): Promise<Note | null> {
    const db = await openNotesDb();
    const note = await transaction<Note | undefined>(db, "readonly", (store) => store.get(id));

    return note ?? null;
  }

  async list(filter?: NoteListFilter) {
    const db = await openNotesDb();
    const notes = await transaction<Note[]>(db, "readonly", (store) => store.getAll());

    return filterAndSortNotes(notes, filter);
  }

  async save(note: Note): Promise<void> {
    const db = await openNotesDb();
    await transaction(db, "readwrite", (store) => store.put(note));
  }
}

function openNotesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };
  });
}

function transaction<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = operation(tx.objectStore(storeName));

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
  });
}
