import type { NoteSummary } from "@inspiration-notes/storage";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";
import { primaryNavigationItems } from "./navigation";

interface NoteSidebarProps {
  activeId: string | null;
  notes: NoteSummary[];
  query: string;
  onCreateNote(): void;
  onSelectNote(id: string): void;
  onQueryChange(query: string): void;
}

export function NoteSidebar({
  activeId,
  notes,
  onCreateNote,
  onQueryChange,
  onSelectNote,
  query
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
        value={query}
      />

      <Pressable accessibilityRole="button" onPress={onCreateNote} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>新建灵感</Text>
      </Pressable>

      <View style={styles.navGroup}>
        {primaryNavigationItems.map((item) => (
          <Text key={item} style={styles.navItem}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.list}>
        {notes.map((note) => (
          <Pressable
            accessibilityRole="button"
            key={note.id}
            onPress={() => onSelectNote(note.id)}
            style={[styles.noteCard, activeId === note.id && styles.activeNoteCard]}
          >
            <Text numberOfLines={1} style={styles.noteTitle}>
              {note.isFavorite ? "★ " : ""}
              {note.title}
            </Text>
            <Text numberOfLines={2} style={styles.noteExcerpt}>
              {note.excerpt || "空白笔记"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeNoteCard: {
    borderColor: colors.accent
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
  list: {
    gap: spacing.sm
  },
  navGroup: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  navItem: {
    ...typography.label,
    color: colors.primary
  },
  noteCard: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  noteExcerpt: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  noteTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: colors.background,
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
    gap: spacing.lg
  }
});
