import { describe, expect, it } from "vitest";
import { clampFontSize, collectTags, parseTagInput } from "../src/components/noteUi";

describe("note UI helpers", () => {
  it("clamps font size controls to the supported range", () => {
    expect(clampFontSize(10)).toBe(14);
    expect(clampFontSize(18)).toBe(18);
    expect(clampFontSize(99)).toBe(22);
  });

  it("parses tags from comma and whitespace separated input", () => {
    expect(parseTagInput("灵感, 产品  灵感，设计、体验")).toEqual([
      "灵感",
      "产品",
      "设计",
      "体验"
    ]);
  });

  it("collects unique sorted tags from summaries", () => {
    expect(
      collectTags([
        {
          excerpt: "",
          folderId: null,
          id: "1",
          isFavorite: false,
          status: "active",
          tags: ["beta", "alpha"],
          title: "One",
          updatedAt: "2026-06-16T00:00:00.000Z"
        },
        {
          excerpt: "",
          folderId: null,
          id: "2",
          isFavorite: false,
          status: "active",
          tags: ["alpha"],
          title: "Two",
          updatedAt: "2026-06-16T00:00:00.000Z"
        }
      ])
    ).toEqual(["alpha", "beta"]);
  });
});
