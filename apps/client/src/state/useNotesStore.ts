import { create } from "zustand";
import type { NoteSummary } from "@inspiration-notes/storage";

interface NotesState {
  activeId: string | null;
  hasHydrated: boolean;
  query: string;
  summaries: NoteSummary[];
  setActiveId(id: string | null): void;
  setHasHydrated(value: boolean): void;
  setQuery(query: string): void;
  setSummaries(summaries: NoteSummary[]): void;
}

export const useNotesStore = create<NotesState>((set) => ({
  activeId: null,
  hasHydrated: false,
  query: "",
  summaries: [],
  setActiveId: (activeId) => set({ activeId }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  setQuery: (query) => set({ query }),
  setSummaries: (summaries) => set({ summaries })
}));
