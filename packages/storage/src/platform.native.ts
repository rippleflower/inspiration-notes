import type { Note, NoteId } from "@inspiration-notes/core";
import * as SQLite from "expo-sqlite";
import { filterAndSortNotes, type NoteListFilter, type NoteRepository } from "./repository";

const databaseName = "inspiration-notes.db";

export function createPlatformNoteRepository(): NoteRepository {
  return new SQLiteNoteRepository();
}

class SQLiteNoteRepository implements NoteRepository {
  private database: Promise<SQLite.SQLiteDatabase> | null = null;

  async deleteHard(id: NoteId): Promise<void> {
    const db = await this.open();
    await db.runAsync("delete from notes where id = ?", id);
  }

  async getById(id: NoteId): Promise<Note | null> {
    const db = await this.open();
    const row = await db.getFirstAsync<{ payload: string }>(
      "select payload from notes where id = ? limit 1",
      id
    );

    return row ? deserializeNote(row.payload) : null;
  }

  async list(filter?: NoteListFilter) {
    const db = await this.open();
    const rows = await db.getAllAsync<{ payload: string }>(
      "select payload from notes order by updated_at desc"
    );
    const notes = rows.map((row) => deserializeNote(row.payload));

    return filterAndSortNotes(notes, filter);
  }

  async save(note: Note): Promise<void> {
    const db = await this.open();

    await db.runAsync(
      `insert into notes (id, updated_at, status, payload)
       values (?, ?, ?, ?)
       on conflict(id) do update set
         updated_at = excluded.updated_at,
         status = excluded.status,
         payload = excluded.payload`,
      note.id,
      note.updatedAt,
      note.status,
      JSON.stringify(note)
    );
  }

  private async open(): Promise<SQLite.SQLiteDatabase> {
    if (!this.database) {
      this.database = SQLite.openDatabaseAsync(databaseName).then(async (db) => {
        await db.execAsync(`
          create table if not exists notes (
            id text primary key not null,
            updated_at text not null,
            status text not null,
            payload text not null
          );
          create index if not exists notes_updated_at_idx on notes(updated_at);
          create index if not exists notes_status_idx on notes(status);
        `);

        return db;
      });
    }

    return this.database;
  }
}

function deserializeNote(payload: string): Note {
  return JSON.parse(payload) as Note;
}
