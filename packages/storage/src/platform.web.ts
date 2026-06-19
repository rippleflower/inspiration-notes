import type {
  Note,
  NoteId,
  PluginInstallRecord,
  PluginInstallationStore
} from "@inspiration-notes/core";
import { filterAndSortNotes, type NoteListFilter, type NoteRepository } from "./repository";
import { copyRecord } from "./pluginInstallations";

const dbName = "inspiration-notes";
const dbVersion = 2;
const notesStoreName = "notes";
const pluginInstallationsStoreName = "pluginInstallations";
const localStorageNotesKey = "inspiration-notes:notes";
const localStoragePluginInstallationsKey = "inspiration-notes:plugin-installations";

export function createPlatformNoteRepository(): NoteRepository {
  if (typeof indexedDB === "undefined") {
    return new LocalStorageNoteRepository();
  }

  return new IndexedDbNoteRepository();
}

export function createPlatformPluginInstallationStore(): PluginInstallationStore {
  if (typeof indexedDB === "undefined") {
    return new LocalStoragePluginInstallationStore();
  }

  return new IndexedDbPluginInstallationStore();
}

class LocalStorageNoteRepository implements NoteRepository {
  async deleteHard(id: NoteId): Promise<void> {
    const notes = this.readNotes().filter((note) => note.id !== id);
    this.writeNotes(notes);
  }

  async getById(id: NoteId): Promise<Note | null> {
    return this.readNotes().find((note) => note.id === id) ?? null;
  }

  async list(filter?: NoteListFilter) {
    return filterAndSortNotes(this.readNotes(), filter);
  }

  async save(note: Note): Promise<void> {
    const notes = this.readNotes();
    const index = notes.findIndex((existing) => existing.id === note.id);

    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }

    this.writeNotes(notes);
  }

  private readNotes(): Note[] {
    if (typeof localStorage === "undefined") {
      return [];
    }

    const raw = localStorage.getItem(localStorageNotesKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Note[]) : [];
    } catch {
      return [];
    }
  }

  private writeNotes(notes: Note[]): void {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(localStorageNotesKey, JSON.stringify(notes));
  }
}

class LocalStoragePluginInstallationStore implements PluginInstallationStore {
  async load(): Promise<PluginInstallRecord[]> {
    if (typeof localStorage === "undefined") {
      return [];
    }

    const raw = localStorage.getItem(localStoragePluginInstallationsKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PluginInstallRecord[]).map(copyRecord) : [];
    } catch {
      return [];
    }
  }

  async save(records: PluginInstallRecord[]): Promise<void> {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(
      localStoragePluginInstallationsKey,
      JSON.stringify(records.map(copyRecord))
    );
  }
}

class IndexedDbNoteRepository implements NoteRepository {
  async deleteHard(id: NoteId): Promise<void> {
    const db = await openNotesDb();
    await transaction(db, notesStoreName, "readwrite", (store) => store.delete(id));
  }

  async getById(id: NoteId): Promise<Note | null> {
    const db = await openNotesDb();
    const note = await transaction<Note | undefined>(db, notesStoreName, "readonly", (store) =>
      store.get(id)
    );

    return note ?? null;
  }

  async list(filter?: NoteListFilter) {
    const db = await openNotesDb();
    const notes = await transaction<Note[]>(db, notesStoreName, "readonly", (store) =>
      store.getAll()
    );

    return filterAndSortNotes(notes, filter);
  }

  async save(note: Note): Promise<void> {
    const db = await openNotesDb();
    await transaction(db, notesStoreName, "readwrite", (store) => store.put(note));
  }
}

class IndexedDbPluginInstallationStore implements PluginInstallationStore {
  async load(): Promise<PluginInstallRecord[]> {
    const db = await openNotesDb();
    const records = await transaction<PluginInstallRecord[]>(
      db,
      pluginInstallationsStoreName,
      "readonly",
      (store) => store.getAll()
    );

    return records.map(copyRecord);
  }

  async save(records: PluginInstallRecord[]): Promise<void> {
    const db = await openNotesDb();
    await replaceAll(db, pluginInstallationsStoreName, records.map(copyRecord));
  }
}

function openNotesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(notesStoreName)) {
        const store = db.createObjectStore(notesStoreName, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(pluginInstallationsStoreName)) {
        db.createObjectStore(pluginInstallationsStoreName, { keyPath: "id" });
      }
    };
  });
}

function transaction<T>(
  db: IDBDatabase,
  storeName: string,
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

function replaceAll<T extends { id: string }>(
  db: IDBDatabase,
  storeName: string,
  records: T[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    store.clear();

    for (const record of records) {
      store.put(record);
    }

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}
