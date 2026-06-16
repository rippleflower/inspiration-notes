import ReactMarkdown from "react-markdown";
import { ScrollView, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface MarkdownPreviewProps {
  content: string;
  fontSize: number;
}

export function MarkdownPreview({ content, fontSize }: MarkdownPreviewProps) {
  return (
    <ScrollView style={styles.preview}>
      <div
        style={{
          ...webMarkdownStyle,
          fontSize,
          lineHeight: `${Math.round(fontSize * 1.5)}px`
        }}
      >
        <ReactMarkdown>{content || "还没有内容。"}</ReactMarkdown>
      </div>
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

const webMarkdownStyle = {
  color: colors.primary,
  fontFamily: typography.body.fontFamily,
  fontSize: typography.body.fontSize,
  lineHeight: `${typography.body.lineHeight}px`
};
