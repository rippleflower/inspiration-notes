import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme/tokens";

export function ToolbarButton({
  active = false,
  accessibilityLabel,
  disabled = false,
  label,
  onPress,
  testID,
  variant = "default"
}: {
  active?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
  label: string;
  onPress(): void;
  testID?: string;
  variant?: "default" | "danger" | "success";
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        active && styles.buttonActive,
        variant === "danger" && styles.buttonDanger,
        variant === "success" && styles.buttonSuccess,
        disabled && styles.buttonDisabled
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.buttonText,
          active && styles.buttonTextActive,
          variant === "danger" && styles.buttonTextDanger,
          variant === "success" && styles.buttonTextSuccess,
          disabled && styles.buttonTextDisabled
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  buttonActive: {
    backgroundColor: colors.accentDeep,
    borderColor: colors.accentDeep
  },
  buttonDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success
  },
  buttonText: {
    color: colors.primary,
    fontWeight: "700"
  },
  buttonTextActive: {
    color: colors.canvas
  },
  buttonTextDanger: {
    color: colors.danger
  },
  buttonTextDisabled: {
    color: colors.muted
  },
  buttonTextSuccess: {
    color: colors.success
  }
});
