const headingPattern = /^#\s+(.+)$/m;

export function extractTitle(markdown: string): string {
  const headingMatch = markdown.match(headingPattern);
  const candidate = headingMatch?.[1] ?? markdown.split(/\r?\n/).find(Boolean);
  const title = candidate?.replace(/[#*_`>[\]]/g, "").trim();

  return title && title.length > 0 ? title.slice(0, 80) : "未命名笔记";
}

export function extractExcerpt(markdown: string, maxLength = 140): string {
  const normalized = markdown
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}…`
    : normalized;
}

export function countWords(markdown: string): number {
  const cjk = markdown.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latin = markdown
    .replace(/[\u4e00-\u9fff]/g, " ")
    .match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;

  return cjk + latin;
}
