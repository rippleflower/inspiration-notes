import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface MarkdownEditorProps {
  content: string;
  fontSize: number;
  onChange(content: string): void;
}

export function MarkdownEditor({ content, fontSize, onChange }: MarkdownEditorProps) {
  return (
    <View style={styles.editorShell}>
      <View style={styles.paneHeader}>
        <Text style={styles.paneLabel}>Markdown</Text>
        <Text style={styles.paneHint}>离线自动保存</Text>
      </View>
      <TextInput
        accessibilityLabel="Markdown 编辑器"
        multiline
        onChangeText={onChange}
        placeholder="# 记录一个灵感"
        placeholderTextColor={colors.muted}
        spellCheck={false}
        style={[styles.editor, { fontSize, lineHeight: Math.round(fontSize * 1.5) }]}
        textAlignVertical="top"
        value={content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editorShell: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 360,
    overflow: "hidden"
  },
  editor: {
    ...typography.body,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: colors.primary,
    flex: 1,
    minHeight: 300,
    padding: spacing.lg
  },
  paneHeader: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  paneHint: {
    color: colors.muted,
    fontSize: 12
  },
  paneLabel: {
    ...typography.label,
    color: colors.primary
  }
});
