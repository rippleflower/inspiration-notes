import Markdown from "react-native-markdown-display";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface MarkdownPreviewProps {
  content: string;
  fontSize: number;
}

export function MarkdownPreview({ content, fontSize }: MarkdownPreviewProps) {
  return (
    <View style={styles.previewShell}>
      <View style={styles.paneHeader}>
        <Text style={styles.paneLabel}>Preview</Text>
        <Text style={styles.paneHint}>实时渲染</Text>
      </View>
      <ScrollView style={styles.preview}>
        <Markdown
          style={{
            ...markdownStyles,
            body: {
              ...markdownStyles.body,
              fontSize,
              lineHeight: Math.round(fontSize * 1.5)
            }
          }}
        >
          {content || "还没有内容。"}
        </Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  preview: {
    backgroundColor: "transparent",
    flex: 1,
    minHeight: 300,
    padding: spacing.lg
  },
  previewShell: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 360,
    overflow: "hidden"
  }
});

const markdownStyles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.primary
  },
  heading1: {
    ...typography.heading,
    color: colors.primary,
    marginBottom: spacing.md
  },
  link: {
    color: colors.secondaryAccent
  }
});
