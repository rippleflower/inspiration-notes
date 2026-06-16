import {
  countWords,
  createDefaultPluginRegistry,
  createNote,
  restoreNote,
  softDeleteNote,
  toggleFavorite,
  updateNoteContent
} from "@inspiration-notes/core";
import { createPlatformNoteRepository } from "@inspiration-notes/storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { NoteSidebar } from "./NoteSidebar";
import { useNotesStore } from "../state/useNotesStore";
import { colors, spacing, typography } from "../theme/tokens";

const welcomeMarkdown = `# 欢迎使用灵感笔记

用 Markdown 快速记下一个想法。

- 离线优先
- 实时预览
- 后续接入 Supabase 三端同步
`;

export function NoteShell() {
  const repository = useMemo(() => createPlatformNoteRepository(), []);
  const pluginRegistry = useMemo(() => createDefaultPluginRegistry(), []);
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const activeId = useNotesStore((state) => state.activeId);
  const hasHydrated = useNotesStore((state) => state.hasHydrated);
  const query = useNotesStore((state) => state.query);
  const summaries = useNotesStore((state) => state.summaries);
  const setActiveId = useNotesStore((state) => state.setActiveId);
  const setHasHydrated = useNotesStore((state) => state.setHasHydrated);
  const setQuery = useNotesStore((state) => state.setQuery);
  const setSummaries = useNotesStore((state) => state.setSummaries);
  const activeSummary = summaries.find((note) => note.id === activeId) ?? null;

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const existing = await repository.list();

      if (existing.length === 0) {
        const welcome = createNote({ content: welcomeMarkdown });
        await repository.save(welcome);
      }

      const nextSummaries = await repository.list({ query });
      const nextActiveId = nextSummaries[0]?.id ?? null;
      const activeNote = nextActiveId ? await repository.getById(nextActiveId) : null;

      if (isMounted) {
        setSummaries(nextSummaries);
        setActiveId(nextActiveId);
        setContent(activeNote?.content ?? "");
        setHasHydrated(true);
      }
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [query, repository, setActiveId, setHasHydrated, setSummaries]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  async function refreshSummaries(nextActiveId = activeId) {
    setSummaries(await repository.list({ query }));
    setActiveId(nextActiveId);
  }

  async function selectNote(id: string) {
    const note = await repository.getById(id);

    if (!note) {
      return;
    }

    setActiveId(id);
    setContent(note.content);
  }

  async function createNewNote() {
    const note = createNote({ content: "# 未命名灵感\n\n" });
    await repository.save(note);
    setContent(note.content);
    await refreshSummaries(note.id);
  }

  function updateContent(nextContent: string) {
    setContent(nextContent);

    if (!activeId) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      void saveActiveNote(nextContent);
    }, 220);
  }

  async function saveActiveNote(nextContent: string) {
    if (!activeId) {
      return;
    }

    const note = await repository.getById(activeId);

    if (!note) {
      return;
    }

    await repository.save(updateNoteContent(note, nextContent));
    await refreshSummaries(activeId);
    setIsSaving(false);
  }

  async function toggleActiveFavorite() {
    if (!activeId) {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      await repository.save(toggleFavorite(note));
      await refreshSummaries(activeId);
    }
  }

  async function moveActiveToTrash() {
    if (!activeId) {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      await repository.save(note.status === "deleted" ? restoreNote(note) : softDeleteNote(note));
      await refreshSummaries();
    }
  }

  async function insertDailyTemplate() {
    let nextContent = content;

    await pluginRegistry.runCommand("insert-daily-template", {
      getActiveContent: () => content,
      replaceActiveContent: (value) => {
        nextContent = value;
      }
    });

    updateContent(nextContent);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, !isWide && styles.contentCompact]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.sidebarWrap, !isWide && styles.sidebarCompact]}>
          <NoteSidebar
            activeId={activeId}
            notes={summaries}
            onCreateNote={createNewNote}
            onQueryChange={setQuery}
            onSelectNote={selectNote}
            query={query}
          />
        </View>

        <View style={styles.editorPane}>
          <View style={styles.toolbar}>
            <View>
              <Text style={styles.kicker}>{hasHydrated ? "本地已就绪" : "正在载入本地数据"}</Text>
              <Text style={styles.title}>{activeSummary?.title ?? "没有选中的笔记"}</Text>
            </View>
            <View style={styles.actions}>
              <ToolbarButton label="模板" onPress={insertDailyTemplate} />
              <ToolbarButton
                label={activeSummary?.isFavorite ? "已收藏" : "收藏"}
                onPress={toggleActiveFavorite}
              />
              <ToolbarButton label="回收站" onPress={moveActiveToTrash} />
            </View>
          </View>

          {!isWide && (
            <View style={styles.modeSwitch}>
              <ToolbarButton active={mode === "edit"} label="编辑" onPress={() => setMode("edit")} />
              <ToolbarButton
                active={mode === "preview"}
                label="预览"
                onPress={() => setMode("preview")}
              />
            </View>
          )}

          <View style={[styles.workspace, !isWide && styles.workspaceCompact]}>
            {(isWide || mode === "edit") && (
              <MarkdownEditor content={content} onChange={updateContent} />
            )}
            {(isWide || mode === "preview") && <MarkdownPreview content={content} />}
          </View>

          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{countWords(content)} 字词</Text>
            <Text style={styles.statusText}>{isSaving ? "保存中" : "离线保存"}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ToolbarButton({
  active = false,
  label,
  onPress
}: {
  active?: boolean;
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.toolbarButton, active && styles.toolbarButtonActive]}
    >
      <Text style={[styles.toolbarButtonText, active && styles.toolbarButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  content: {
    flexDirection: "row",
    gap: spacing.xl,
    minHeight: "100%",
    padding: spacing.xl
  },
  contentCompact: {
    flexDirection: "column",
    padding: spacing.md
  },
  editorPane: {
    flex: 1,
    gap: spacing.lg,
    minWidth: 0
  },
  kicker: {
    ...typography.label,
    color: colors.accent,
    textTransform: "uppercase"
  },
  modeSwitch: {
    flexDirection: "row",
    gap: spacing.sm
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sidebarCompact: {
    width: "100%"
  },
  sidebarWrap: {
    width: 280
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusText: {
    color: colors.muted,
    fontSize: 13
  },
  title: {
    ...typography.heading,
    color: colors.primary
  },
  toolbar: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  toolbarButton: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  toolbarButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  toolbarButtonText: {
    color: colors.primary,
    fontWeight: "700"
  },
  toolbarButtonTextActive: {
    color: colors.background
  },
  workspace: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg
  },
  workspaceCompact: {
    flexDirection: "column"
  }
});
