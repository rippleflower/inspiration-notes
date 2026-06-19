import {
  countWords,
  createNote,
  restoreNote,
  softDeleteNote,
  toggleFavorite,
  updateNoteContent,
  updateNoteTags,
  type Note
} from "@inspiration-notes/core";
import { createPlatformNoteRepository, type NoteSummary } from "@inspiration-notes/storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { NoteSidebar } from "./NoteSidebar";
import { PluginPanel } from "./PluginPanel";
import { ToolbarButton } from "./ToolbarButton";
import {
  clampFontSize,
  collectTags,
  fontSizeRange,
  formatTagInput,
  layoutModeItems,
  parseTagInput,
  resolveIsLandscapeLayout,
  type LayoutMode
} from "./noteUi";
import { useInstalledPlugins } from "../plugins/useInstalledPlugins";
import { useNotesStore } from "../state/useNotesStore";
import { colors, spacing, typography } from "../theme/tokens";
import { filterSummariesForView } from "../workspace/filters";

const welcomeMarkdown = `# 欢迎使用灵感笔记

用 Markdown 快速记下一个想法。

- 离线优先
- 实时预览
- 后续接入 Supabase 三端同步
`;

export function NoteShell() {
  const repository = useMemo(() => createPlatformNoteRepository(), []);
  const {
    installPlugin,
    isReady: pluginsReady,
    plugins,
    registry: pluginRegistry,
    securityIssues,
    setPluginEnabled,
    uninstallPlugin
  } = useInstalledPlugins();
  const { width } = useWindowDimensions();
  const layoutMode = useNotesStore((state) => state.layoutMode);
  const setLayoutMode = useNotesStore((state) => state.setLayoutMode);
  const isLandscapeLayout = resolveIsLandscapeLayout(layoutMode, width);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allSummaries, setAllSummaries] = useState<NoteSummary[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [showPluginPanel, setShowPluginPanel] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const activeId = useNotesStore((state) => state.activeId);
  const activeView = useNotesStore((state) => state.activeView);
  const fontSize = useNotesStore((state) => state.fontSize);
  const hasHydrated = useNotesStore((state) => state.hasHydrated);
  const query = useNotesStore((state) => state.query);
  const selectedTag = useNotesStore((state) => state.selectedTag);
  const summaries = useNotesStore((state) => state.summaries);
  const setActiveId = useNotesStore((state) => state.setActiveId);
  const setActiveView = useNotesStore((state) => state.setActiveView);
  const setFontSize = useNotesStore((state) => state.setFontSize);
  const setHasHydrated = useNotesStore((state) => state.setHasHydrated);
  const setQuery = useNotesStore((state) => state.setQuery);
  const setSelectedTag = useNotesStore((state) => state.setSelectedTag);
  const setSummaries = useNotesStore((state) => state.setSummaries);
  const availableTags = useMemo(
    () => collectTags(allSummaries.filter((note) => note.status === "active")),
    [allSummaries]
  );

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const existing = await repository.list({ includeDeleted: true });

      if (existing.length === 0) {
        const welcome = createNote({ content: welcomeMarkdown, tags: ["开始"] });
        await repository.save(welcome);
      }

      if (isMounted) {
        await refreshWorkspace(activeId);
        setHasHydrated(true);
      }
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [activeView, query, repository, selectedTag, setHasHydrated]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  async function refreshWorkspace(preferredId: string | null = activeId) {
    const all = await repository.list({ includeDeleted: true });
    const visible = filterSummariesForView(all, activeView, selectedTag, query);
    const nextActiveId =
      preferredId && visible.some((note) => note.id === preferredId)
        ? preferredId
        : visible[0]?.id ?? null;
    const note = nextActiveId ? await repository.getById(nextActiveId) : null;

    setAllSummaries(all);
    setSummaries(visible);
    setActiveId(nextActiveId);
    setActiveNote(note);
    setContent(note?.content ?? "");
    setTagDraft(formatTagInput(note?.tags ?? []));
    setIsSaving(false);
  }

  async function selectNote(id: string) {
    const note = await repository.getById(id);

    if (!note) {
      return;
    }

    setActiveId(id);
    setActiveNote(note);
    setContent(note.content);
    setTagDraft(formatTagInput(note.tags));
  }

  async function createNewNote() {
    const note = createNote({ content: "# 未命名灵感\n\n", tags: selectedTag ? [selectedTag] : [] });
    await repository.save(note);
    setActiveView("all");
    setContent(note.content);
    await refreshWorkspace(note.id);
  }

  function updateContent(nextContent: string) {
    setContent(nextContent);

    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setIsSaving(true);
    saveTimer.current = setTimeout(() => {
      void saveContentImmediately(nextContent);
    }, 220);
  }

  async function saveContentImmediately(nextContent: string) {
    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    const note = await repository.getById(activeId);

    if (!note) {
      return;
    }

    const updated = updateNoteContent(note, nextContent);
    await repository.save(updated);
    await refreshWorkspace(updated.id);
  }

  async function toggleActiveFavorite() {
    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      await repository.save(toggleFavorite(note));
      await refreshWorkspace(activeId);
    }
  }

  async function moveActiveToTrash() {
    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      await repository.save(softDeleteNote(note));
      await refreshWorkspace(null);
    }
  }

  async function restoreActiveNote() {
    if (!activeId || activeNote?.status !== "deleted") {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      await repository.save(restoreNote(note));
      setActiveView("all");
      await refreshWorkspace(note.id);
    }
  }

  async function permanentlyDeleteActiveNote() {
    if (!activeId || activeNote?.status !== "deleted") {
      return;
    }

    await repository.deleteHard(activeId);
    await refreshWorkspace(null);
  }

  async function saveTags() {
    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    const note = await repository.getById(activeId);

    if (note) {
      const updated = updateNoteTags(note, parseTagInput(tagDraft));
      await repository.save(updated);
      await refreshWorkspace(updated.id);
    }
  }

  async function insertDailyTemplate() {
    if (!activeId || activeNote?.status === "deleted") {
      return;
    }

    let nextContent = content;

    await pluginRegistry.runCommand("insert-daily-template", {
      getActiveContent: () => content,
      replaceActiveContent: (value) => {
        nextContent = value;
      }
    });

    setContent(nextContent);
    await saveContentImmediately(nextContent);
  }

  function changeFontSize(delta: number) {
    setFontSize(clampFontSize(fontSize + delta));
  }

  const title = activeNote?.title ?? "没有选中的笔记";
  const isDeleted = activeNote?.status === "deleted";
  const canInsertDailyTemplate = pluginRegistry.hasCommand("insert-daily-template");
  const activeNotesCount = allSummaries.filter((note) => note.status === "active").length;
  const deletedNotesCount = allSummaries.filter((note) => note.status === "deleted").length;
  const favoriteNotesCount = allSummaries.filter(
    (note) => note.status === "active" && note.isFavorite
  ).length;
  const enabledPluginCount = plugins.filter((plugin) => plugin.enabled).length;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.skyOrb} />
        <View style={styles.appFrame}>
          <AppHeader
            activeNotesCount={activeNotesCount}
            deletedNotesCount={deletedNotesCount}
            enabledPluginCount={enabledPluginCount}
            favoriteNotesCount={favoriteNotesCount}
            hasHydrated={hasHydrated}
            layoutMode={layoutMode}
            onCreateNote={createNewNote}
            onLayoutModeChange={setLayoutMode}
            title={title}
          />

          <View style={[styles.body, !isLandscapeLayout && styles.bodyCompact]}>
            <View style={[styles.sidebarWrap, !isLandscapeLayout && styles.sidebarCompact]}>
              <NoteSidebar
                activeId={activeId}
                activeView={activeView}
                availableTags={availableTags}
                notes={summaries}
                onCreateNote={createNewNote}
                onQueryChange={setQuery}
                onSelectNote={selectNote}
                onSelectTag={setSelectedTag}
                onViewChange={setActiveView}
                query={query}
                selectedTag={selectedTag}
              />
            </View>

            <View style={styles.editorPane}>
              <View style={styles.toolbar}>
                <View style={styles.titleBlock}>
                  <Text style={styles.kicker}>
                    {hasHydrated ? "本地已就绪" : "正在载入本地数据"}
                  </Text>
                  <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.actions}>
                  {isDeleted ? (
                    <>
                      <ToolbarButton
                        accessibilityLabel="恢复当前笔记"
                        label="恢复"
                        onPress={restoreActiveNote}
                        testID="restore-note-button"
                        variant="success"
                      />
                      <ToolbarButton
                        accessibilityLabel="永久删除当前笔记"
                        label="永久删除"
                        onPress={permanentlyDeleteActiveNote}
                        testID="delete-note-button"
                        variant="danger"
                      />
                    </>
                  ) : (
                    <>
                      <ToolbarButton
                        accessibilityLabel="插入模板"
                        disabled={!activeNote || !canInsertDailyTemplate}
                        label="模板"
                        onPress={insertDailyTemplate}
                        testID="insert-template-button"
                      />
                      <ToolbarButton
                        accessibilityLabel="切换收藏当前笔记"
                        disabled={!activeNote}
                        label={activeNote?.isFavorite ? "已收藏" : "收藏笔记"}
                        onPress={toggleActiveFavorite}
                        testID="favorite-note-button"
                      />
                      <ToolbarButton
                        accessibilityLabel="移到回收站当前笔记"
                        disabled={!activeNote}
                        label="移到回收站"
                        onPress={moveActiveToTrash}
                        testID="trash-note-button"
                      />
                    </>
                  )}
                </View>
              </View>

              <View style={styles.secondaryToolbar}>
                <View style={styles.fontControls}>
                  <ToolbarButton
                    accessibilityLabel="减小字体"
                    label="A-"
                    onPress={() => changeFontSize(-fontSizeRange.step)}
                    testID="decrease-font-button"
                  />
                  <Text style={styles.fontSizeText}>{fontSize}px</Text>
                  <ToolbarButton
                    accessibilityLabel="增大字体"
                    label="A+"
                    onPress={() => changeFontSize(fontSizeRange.step)}
                    testID="increase-font-button"
                  />
                </View>

                {!isLandscapeLayout && (
                  <View style={styles.modeSwitch}>
                    <ToolbarButton
                      active={mode === "edit"}
                      label="编辑"
                      onPress={() => setMode("edit")}
                    />
                    <ToolbarButton
                      active={mode === "preview"}
                      label="预览"
                      onPress={() => setMode("preview")}
                    />
                  </View>
                )}

                <ToolbarButton
                  accessibilityLabel="打开或关闭插件中心"
                  active={showPluginPanel}
                  label={
                    securityIssues.length > 0
                      ? `插件中心 · ${securityIssues.length} 个警告`
                      : "插件中心"
                  }
                  onPress={() => setShowPluginPanel((value) => !value)}
                  testID="toggle-plugin-panel-button"
                  variant={securityIssues.length > 0 ? "danger" : "default"}
                />
              </View>

              {activeNote && !isDeleted && (
                <View style={styles.tagEditor}>
                  <Text style={styles.tagLabel}>标签</Text>
                  <TextInput
                    accessibilityLabel="编辑标签"
                    onChangeText={setTagDraft}
                    onSubmitEditing={saveTags}
                    placeholder="用逗号或空格分隔，例如：灵感 产品"
                    placeholderTextColor={colors.muted}
                    style={styles.tagInput}
                    testID="tag-input"
                    value={tagDraft}
                  />
                  <ToolbarButton
                    accessibilityLabel="保存当前笔记标签"
                    label="保存标签"
                    onPress={saveTags}
                    testID="save-tags-button"
                  />
                </View>
              )}

              {showPluginPanel && (
                <PluginPanel
                  isReady={pluginsReady}
                  onInstall={installPlugin}
                  onSetEnabled={setPluginEnabled}
                  onUninstall={uninstallPlugin}
                  plugins={plugins}
                  securityIssues={securityIssues}
                />
              )}

              <View style={[styles.workspace, !isLandscapeLayout && styles.workspaceCompact]}>
                {(isLandscapeLayout || mode === "edit") && (
                  <MarkdownEditor content={content} fontSize={fontSize} onChange={updateContent} />
                )}
                {(isLandscapeLayout || mode === "preview") && (
                  <MarkdownPreview content={content} fontSize={fontSize} />
                )}
              </View>

              <View style={styles.statusBar}>
                <Text style={styles.statusText}>{countWords(content)} 字词</Text>
                <Text style={styles.statusText}>
                  {isSaving ? "保存中" : isDeleted ? "回收站" : "离线保存"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AppHeader({
  activeNotesCount,
  deletedNotesCount,
  enabledPluginCount,
  favoriteNotesCount,
  hasHydrated,
  layoutMode,
  onCreateNote,
  onLayoutModeChange,
  title
}: {
  activeNotesCount: number;
  deletedNotesCount: number;
  enabledPluginCount: number;
  favoriteNotesCount: number;
  hasHydrated: boolean;
  layoutMode: LayoutMode;
  onCreateNote(): void;
  onLayoutModeChange(mode: LayoutMode): void;
  title: string;
}) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.headerCopy}>
        <Text style={styles.productEyebrow}>APP WORKSPACE</Text>
        <Text style={styles.appTitle}>灵感笔记</Text>
        <Text style={styles.appSubtitle}>
          一个离线优先的 Markdown 灵感工作台，可手动切换竖屏与横屏排列。当前打开：{title}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.statsRow}>
          <MetricPill label="活跃" value={activeNotesCount} />
          <MetricPill label="收藏" value={favoriteNotesCount} />
          <MetricPill label="插件" value={enabledPluginCount} />
          <MetricPill label="回收站" value={deletedNotesCount} tone="muted" />
        </View>
        <View style={styles.headerActions}>
          <View style={styles.layoutSwitch} accessibilityLabel="App 布局模式">
            {layoutModeItems.map((item) => (
              <ToolbarButton
                active={layoutMode === item.id}
                key={item.id}
                label={item.label}
                onPress={() => onLayoutModeChange(item.id)}
              />
            ))}
          </View>
          <View style={styles.readyPill}>
            <View style={[styles.readyDot, !hasHydrated && styles.readyDotPending]} />
            <Text style={styles.readyText}>{hasHydrated ? "本地数据已连接" : "载入本地数据"}</Text>
          </View>
          <ToolbarButton label="新建灵感" onPress={onCreateNote} />
        </View>
      </View>
    </View>
  );
}

function MetricPill({
  label,
  tone = "accent",
  value
}: {
  label: string;
  tone?: "accent" | "muted";
  value: number;
}) {
  return (
    <View style={[styles.metricPill, tone === "muted" && styles.metricPillMuted]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appFrame: {
    alignSelf: "center",
    gap: spacing.xl,
    maxWidth: 1480,
    width: "100%",
    zIndex: 1
  },
  appHeader: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
    justifyContent: "space-between",
    padding: spacing.xl
  },
  appSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 620
  },
  appTitle: {
    color: colors.primary,
    fontFamily: typography.heading.fontFamily,
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  body: {
    flexDirection: "row",
    gap: spacing.xl
  },
  bodyCompact: {
    flexDirection: "column"
  },
  content: {
    minHeight: "100%",
    padding: spacing.xl
  },
  editorPane: {
    flex: 1,
    gap: spacing.lg,
    minWidth: 0
  },
  fontControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  fontSizeText: {
    color: colors.primary,
    fontWeight: "700",
    minWidth: 42,
    textAlign: "center"
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end"
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 280
  },
  headerRight: {
    alignItems: "flex-end",
    gap: spacing.md
  },
  kicker: {
    ...typography.label,
    color: colors.accentDeep,
    textTransform: "uppercase"
  },
  layoutSwitch: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "flex-end"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  metricPill: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  metricPillMuted: {
    backgroundColor: colors.panel
  },
  metricValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800"
  },
  modeSwitch: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  productEyebrow: {
    ...typography.label,
    color: colors.accentDeep,
    letterSpacing: 1.8
  },
  readyDot: {
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 8,
    width: 8
  },
  readyDotPending: {
    backgroundColor: colors.warning
  },
  readyPill: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  readyText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  secondaryToolbar: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  skyOrb: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    height: 420,
    opacity: 0.85,
    position: "absolute",
    right: -120,
    top: -150,
    width: 420
  },
  sidebarCompact: {
    width: "100%"
  },
  sidebarWrap: {
    width: 320
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end"
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusText: {
    color: colors.muted,
    fontSize: 13
  },
  tagEditor: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md
  },
  tagInput: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.primary,
    flex: 1,
    minWidth: 180,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  tagLabel: {
    ...typography.label,
    color: colors.primary
  },
  title: {
    ...typography.heading,
    color: colors.primary
  },
  titleBlock: {
    flexShrink: 1
  },
  toolbar: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
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
