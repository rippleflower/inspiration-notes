import { describe, expect, it } from "vitest";
import { countWords, extractExcerpt, extractTitle } from "../src";

describe("markdown helpers", () => {
  it("extracts a stable title and excerpt", () => {
    const markdown = "# 标题\n\n这是一个 **重要** 灵感。";

    expect(extractTitle(markdown)).toBe("标题");
    expect(extractExcerpt(markdown)).toContain("这是一个 重要 灵感");
  });

  it("counts CJK characters and latin words", () => {
    expect(countWords("灵感 note taking")).toBe(4);
  });
});
