import { create } from "zustand";
import type { NoteSummary } from "@inspiration-notes/storage";
import { fontSizeRange, type ActiveView } from "../components/noteUi";

interface NotesState {
  activeId: string | null;
  activeView: ActiveView;
  fontSize: number;
  hasHydrated: boolean;
  query: string;
  selectedTag: string | null;
  summaries: NoteSummary[];
  setActiveId(id: string | null): void;
  setActiveView(view: ActiveView): void;
  setFontSize(size: number): void;
  setHasHydrated(value: boolean): void;
  setQuery(query: string): void;
  setSelectedTag(tag: string | null): void;
  setSummaries(summaries: NoteSummary[]): void;
}

export const useNotesStore = create<NotesState>((set) => ({
  activeId: null,
  activeView: "all",
  fontSize: fontSizeRange.default,
  hasHydrated: false,
  query: "",
  selectedTag: null,
  summaries: [],
  setActiveId: (activeId) => set({ activeId }),
  setActiveView: (activeView) =>
    set({
      activeView,
      selectedTag: null
    }),
  setFontSize: (fontSize) => set({ fontSize }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  setQuery: (query) => set({ query }),
  setSelectedTag: (selectedTag) => set({ activeView: "tags", selectedTag }),
  setSummaries: (summaries) => set({ summaries })
}));
