import { describe, expect, it } from "vitest";
import { primaryNavigationItems } from "../src/components/navigation";

describe("primary navigation", () => {
  it("covers the milestone-one note management entry points", () => {
    expect(primaryNavigationItems).toEqual(["全部笔记", "收藏", "标签", "文件夹", "回收站"]);
  });
});
