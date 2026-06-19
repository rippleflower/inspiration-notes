import type { NoteSummary } from "@inspiration-notes/storage";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";
import { type ActiveView, primaryNavigationItems } from "./navigation";

interface NoteSidebarProps {
  activeId: string | null;
  activeView: ActiveView;
  availableTags: string[];
  notes: NoteSummary[];
  query: string;
  selectedTag: string | null;
  onCreateNote(): void;
  onQueryChange(query: string): void;
  onSelectNote(id: string): void;
  onSelectTag(tag: string | null): void;
  onViewChange(view: ActiveView): void;
}

export function NoteSidebar({
  activeId,
  activeView,
  availableTags,
  notes,
  onCreateNote,
  onQueryChange,
  onSelectNote,
  onSelectTag,
  onViewChange,
  query,
  selectedTag
}: NoteSidebarProps) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>灵感笔记</Text>
        <Text style={styles.caption}>离线优先 Markdown 工作台</Text>
      </View>

      <TextInput
        accessibilityLabel="搜索笔记"
        onChangeText={onQueryChange}
        placeholder="搜索标题、摘要或标签"
        placeholderTextColor={colors.muted}
        style={styles.search}
        testID="note-search-input"
        value={query}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onCreateNote}
        style={styles.primaryButton}
        testID="create-note-button"
      >
        <Text style={styles.primaryButtonText}>新建灵感</Text>
      </Pressable>

      <View style={styles.navGroup}>
        {primaryNavigationItems.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => onViewChange(item.id)}
            style={[styles.navButton, activeView === item.id && styles.navButtonActive]}
            testID={`nav-${item.id}`}
          >
            <Text style={[styles.navItem, activeView === item.id && styles.navItemActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeView === "tags" && (
        <View style={styles.filterPanel}>
          <Text style={styles.panelTitle}>标签筛选</Text>
          <View style={styles.chipRow}>
            <TagChip active={!selectedTag} label="全部标签" onPress={() => onSelectTag(null)} />
            {availableTags.map((tag) => (
              <TagChip
                active={selectedTag === tag}
                key={tag}
                label={`#${tag}`}
                onPress={() => onSelectTag(tag)}
              />
            ))}
          </View>
          {availableTags.length === 0 && <Text style={styles.emptyHint}>还没有标签。</Text>}
        </View>
      )}

      {activeView === "folders" && (
        <View style={styles.filterPanel}>
          <Text style={styles.panelTitle}>文件夹</Text>
          <TagChip active label="未分类" onPress={() => undefined} />
        </View>
      )}

      <View style={styles.list}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>这里还没有笔记</Text>
            <Text style={styles.emptyHint}>切换筛选条件，或新建一条灵感。</Text>
            <Pressable accessibilityRole="button" onPress={onCreateNote} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>新建灵感</Text>
            </Pressable>
          </View>
        ) : (
          notes.map((note) => (
            <Pressable
              accessibilityRole="button"
              key={note.id}
              onPress={() => onSelectNote(note.id)}
              style={[styles.noteCard, activeId === note.id && styles.activeNoteCard]}
              testID={`note-card-${note.id}`}
            >
              <View style={styles.noteHeader}>
                <Text numberOfLines={1} style={styles.noteTitle}>
                  {note.isFavorite ? "★ " : ""}
                  {note.title}
                </Text>
                <Text style={styles.noteTime}>{formatUpdatedAt(note.updatedAt)}</Text>
              </View>
              <Text numberOfLines={2} style={styles.noteExcerpt}>
                {note.excerpt || "空白笔记"}
              </Text>
              {note.tags.length > 0 && (
                <View style={styles.noteTags}>
                  {note.tags.slice(0, 4).map((tag) => (
                    <Text key={tag} style={styles.noteTag}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              )}
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

function TagChip({ active, label, onPress }: { active: boolean; label: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.tagChip, active && styles.tagChipActive]}
    >
      <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const styles = StyleSheet.create({
  activeNoteCard: {
    borderColor: colors.accentDeep,
    borderWidth: 2
  },
  brand: {
    ...typography.heading,
    color: colors.primary
  },
  brandBlock: {
    gap: spacing.xs
  },
  caption: {
    color: colors.muted,
    fontSize: 13
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  emptyButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentDeep,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  emptyButtonText: {
    color: colors.canvas,
    fontWeight: "700"
  },
  emptyHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  emptyState: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  filterPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  list: {
    gap: spacing.sm
  },
  navButton: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  navButtonActive: {
    backgroundColor: colors.accentSoft
  },
  navGroup: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md
  },
  navItem: {
    ...typography.label,
    color: colors.primary
  },
  navItemActive: {
    color: colors.accentDeep
  },
  noteCard: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  noteExcerpt: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  noteHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  noteTag: {
    backgroundColor: colors.chip,
    borderRadius: 999,
    color: colors.accentDeep,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  noteTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  noteTime: {
    color: colors.muted,
    fontSize: 12
  },
  noteTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: 15,
    fontWeight: "700"
  },
  panelTitle: {
    ...typography.label,
    color: colors.primary
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.accentDeep,
    borderRadius: 999,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: colors.canvas,
    fontWeight: "700"
  },
  search: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  sidebar: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  tagChip: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  tagChipActive: {
    backgroundColor: colors.accentDeep,
    borderColor: colors.accentDeep
  },
  tagChipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700"
  },
  tagChipTextActive: {
    color: colors.canvas
  }
});
