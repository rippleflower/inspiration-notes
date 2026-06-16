import { createNote, softDeleteNote, updateNoteContent, updateNoteTags } from "@inspiration-notes/core";
import { describe, expect, it } from "vitest";
import { createInMemoryNoteRepository, type NoteRepository } from "../src";

describe("NoteRepository contract", () => {
  it("saves, lists, fetches, filters, and hard deletes notes", async () => {
    const repository = createInMemoryNoteRepository();
    const first = createNote({
      content: "# First\n\nAlpha",
      id: "first",
      now: new Date("2026-06-16T00:00:00.000Z")
    });
    const second = updateNoteTags(
      createNote({
        content: "# Second\n\nBeta",
        id: "second",
        now: new Date("2026-06-17T00:00:00.000Z")
      }),
      ["work"],
      new Date("2026-06-17T00:01:00.000Z")
    );

    await repository.save(first);
    await repository.save(second);

    expect(await repository.getById("first")).toMatchObject({ title: "First" });
    expect((await repository.list()).map((note) => note.id)).toEqual(["second", "first"]);
    expect((await repository.list({ query: "alpha" })).map((note) => note.id)).toEqual(["first"]);
    expect((await repository.list({ tag: "work" })).map((note) => note.id)).toEqual(["second"]);

    await repository.deleteHard("first");
    expect(await repository.getById("first")).toBeNull();
  });

  it("omits deleted notes unless requested", async () => {
    const repository: NoteRepository = createInMemoryNoteRepository();
    const note = softDeleteNote(updateNoteContent(createNote({ id: "deleted" }), "Deleted"));

    await repository.save(note);

    expect(await repository.list()).toEqual([]);
    expect(await repository.list({ includeDeleted: true })).toHaveLength(1);
  });
});
