import Markdown from "react-native-markdown-display";
import { ScrollView, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface MarkdownPreviewProps {
  content: string;
  fontSize: number;
}

export function MarkdownPreview({ content, fontSize }: MarkdownPreviewProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  preview: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 320,
    padding: spacing.lg
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
