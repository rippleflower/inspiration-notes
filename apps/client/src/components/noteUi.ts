import type { NoteSummary } from "@inspiration-notes/storage";

export type ActiveView = "all" | "favorites" | "tags" | "folders" | "trash";

export const fontSizeRange = {
  default: 16,
  max: 22,
  min: 14,
  step: 1
} as const;

export const viewLabels: Record<ActiveView, string> = {
  all: "全部笔记",
  favorites: "收藏",
  tags: "标签",
  folders: "文件夹",
  trash: "回收站"
};

export const primaryNavigationItems = Object.entries(viewLabels).map(([id, label]) => ({
  id: id as ActiveView,
  label
}));

export function clampFontSize(size: number): number {
  return Math.min(fontSizeRange.max, Math.max(fontSizeRange.min, size));
}

export function parseTagInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[\s,，、]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

export function formatTagInput(tags: string[]): string {
  return tags.join(", ");
}

export function collectTags(notes: NoteSummary[]): string[] {
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort((left, right) =>
    left.localeCompare(right)
  );
}
