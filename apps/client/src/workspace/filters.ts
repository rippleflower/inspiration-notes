import type { NoteSummary } from "@inspiration-notes/storage";
import type { ActiveView } from "../components/noteUi";

export function filterSummariesForView(
  summaries: NoteSummary[],
  activeView: ActiveView,
  selectedTag: string | null,
  query: string
): NoteSummary[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return summaries.filter((note) => {
    const matchesView =
      activeView === "all"
        ? note.status === "active"
        : activeView === "favorites"
          ? note.status === "active" && note.isFavorite
          : activeView === "tags"
            ? note.status === "active" && (!selectedTag || note.tags.includes(selectedTag))
            : activeView === "folders"
              ? note.status === "active" && note.folderId === null
              : note.status === "deleted";

    if (!matchesView) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      note.title.toLocaleLowerCase().includes(normalizedQuery) ||
      note.excerpt.toLocaleLowerCase().includes(normalizedQuery) ||
      note.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery))
    );
  });
}
