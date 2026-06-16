import { StyleSheet, TextInput } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface MarkdownEditorProps {
  content: string;
  onChange(content: string): void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  return (
    <TextInput
      accessibilityLabel="Markdown 编辑器"
      multiline
      onChangeText={onChange}
      placeholder="# 记录一个灵感"
      placeholderTextColor={colors.muted}
      spellCheck={false}
      style={styles.editor}
      textAlignVertical="top"
      value={content}
    />
  );
}

const styles = StyleSheet.create({
  editor: {
    ...typography.body,
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.primary,
    flex: 1,
    minHeight: 320,
    padding: spacing.lg
  }
});
