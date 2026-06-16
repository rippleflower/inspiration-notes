import { describe, expect, it } from "vitest";
import {
  createNote,
  restoreNote,
  softDeleteNote,
  toggleFavorite,
  updateNoteContent,
  updateNoteTags
} from "../src";

describe("notes", () => {
  it("creates notes from markdown", () => {
    const note = createNote({
      content: "# 一个想法\n\n快速记录它。",
      id: "note-1",
      now: new Date("2026-06-16T00:00:00.000Z")
    });

    expect(note.title).toBe("一个想法");
    expect(note.excerpt).toContain("一个想法");
    expect(note.status).toBe("active");
    expect(note.localVersion).toBe(1);
  });

  it("updates content and increments the local version", () => {
    const note = createNote({ content: "Old", id: "note-1" });
    const updated = updateNoteContent(note, "# New");

    expect(updated.title).toBe("New");
    expect(updated.localVersion).toBe(2);
  });

  it("soft deletes and restores notes", () => {
    const note = createNote({ id: "note-1" });
    const deleted = softDeleteNote(note);
    const restored = restoreNote(deleted);

    expect(deleted.status).toBe("deleted");
    expect(deleted.deletedAt).not.toBeNull();
    expect(restored.status).toBe("active");
    expect(restored.deletedAt).toBeNull();
  });

  it("deduplicates tags and toggles favorite state", () => {
    const note = createNote({ id: "note-1" });
    const tagged = updateNoteTags(note, [" idea ", "idea", "", "work"]);
    const favorite = toggleFavorite(tagged);

    expect(tagged.tags).toEqual(["idea", "work"]);
    expect(favorite.isFavorite).toBe(true);
  });
});
