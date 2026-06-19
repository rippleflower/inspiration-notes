import type { PluginInstallView, PluginSecurityIssue } from "@inspiration-notes/core";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";
import {
  formatPermission,
  formatRisk,
  summarizePluginSecurityIssueCount
} from "../plugins/pluginUi";
import { ToolbarButton } from "./ToolbarButton";

interface PluginPanelProps {
  isReady: boolean;
  plugins: PluginInstallView[];
  securityIssues: PluginSecurityIssue[];
  onInstall(pluginId: string): void;
  onSetEnabled(pluginId: string, enabled: boolean): void;
  onUninstall(pluginId: string): void;
}

export function PluginPanel({
  isReady,
  onInstall,
  onSetEnabled,
  onUninstall,
  plugins,
  securityIssues
}: PluginPanelProps) {
  const enabledCount = plugins.filter((plugin) => plugin.enabled).length;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>插件</Text>
        <Text style={styles.status}>
          {isReady
            ? `${enabledCount}/${plugins.length} 已启用 · 仅允许内置插件`
            : "正在读取插件状态"}
        </Text>
      </View>

      <SecuritySummary issues={securityIssues} />

      {plugins.map((plugin) => (
        <View key={plugin.id} style={styles.pluginCard}>
          <View style={styles.pluginCopy}>
            <View style={styles.pluginTitleRow}>
              <Text style={styles.pluginName}>{plugin.name}</Text>
              <Text style={[styles.riskBadge, riskBadgeStyle(plugin.riskLevel)]}>
                {formatRisk(plugin.riskLevel)}
              </Text>
            </View>
            <Text style={styles.pluginMeta}>
              {plugin.source === "built-in" ? "内置插件" : plugin.source} · {plugin.commandCount} 个命令
            </Text>
            <Text style={styles.pluginDescription}>{plugin.description}</Text>
            <Text style={styles.pluginPermissions}>
              权限：{plugin.permissions.map(formatPermission).join("、")}
            </Text>
            {plugin.securityNotes.map((note) => (
              <Text key={note} style={styles.securityNote}>
                · {note}
              </Text>
            ))}
          </View>

          <View style={styles.actions}>
            {!plugin.installed ? (
              <ToolbarButton
                accessibilityLabel={`安装插件 ${plugin.name}`}
                label="安装"
                onPress={() => onInstall(plugin.id)}
                testID={`install-plugin-${plugin.id}`}
              />
            ) : (
              <>
                <ToolbarButton
                  accessibilityLabel={`${plugin.enabled ? "停用" : "启用"}插件 ${plugin.name}`}
                  active={plugin.enabled}
                  label={plugin.enabled ? "已启用" : "启用"}
                  onPress={() => onSetEnabled(plugin.id, !plugin.enabled)}
                  testID={`toggle-plugin-${plugin.id}`}
                />
                <ToolbarButton
                  accessibilityLabel={`卸载插件 ${plugin.name}`}
                  label="卸载"
                  onPress={() => onUninstall(plugin.id)}
                  testID={`uninstall-plugin-${plugin.id}`}
                  variant="danger"
                />
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function SecuritySummary({ issues }: { issues: PluginSecurityIssue[] }) {
  if (issues.length === 0) {
    return (
      <View style={styles.safeSummary}>
        <Text style={styles.safeSummaryText}>
          {summarizePluginSecurityIssueCount(0)}：没有发现未知、重复或来源异常的插件记录。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.issueSummary}>
      <Text style={styles.issueTitle}>{summarizePluginSecurityIssueCount(issues.length)}</Text>
      {issues.map((issue) => (
        <Text key={`${issue.code}-${issue.id}`} style={styles.issueText}>
          {issue.severity.toUpperCase()} · {issue.message}
        </Text>
      ))}
    </View>
  );
}

function riskBadgeStyle(riskLevel: string) {
  if (riskLevel === "high") {
    return styles.riskHigh;
  }

  if (riskLevel === "medium") {
    return styles.riskMedium;
  }

  return styles.riskLow;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  header: {
    gap: spacing.xs
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  pluginCard: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  pluginCopy: {
    gap: spacing.xs
  },
  pluginDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  pluginMeta: {
    color: colors.accentDeep,
    fontSize: 12,
    fontWeight: "700"
  },
  pluginName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  pluginPermissions: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 18
  },
  pluginTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  issueSummary: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  issueText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17
  },
  issueTitle: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700"
  },
  riskBadge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  riskHigh: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger
  },
  riskLow: {
    backgroundColor: colors.successSoft,
    color: colors.success
  },
  riskMedium: {
    backgroundColor: colors.warningSoft,
    color: colors.warning
  },
  safeSummary: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md
  },
  safeSummaryText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700"
  },
  securityNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  status: {
    color: colors.muted,
    fontSize: 13
  },
  title: {
    ...typography.label,
    color: colors.primary
  }
});
