import type { PluginInstallView } from "@inspiration-notes/core";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";
import { ToolbarButton } from "./ToolbarButton";

interface PluginPanelProps {
  isReady: boolean;
  plugins: PluginInstallView[];
  onInstall(pluginId: string): void;
  onSetEnabled(pluginId: string, enabled: boolean): void;
  onUninstall(pluginId: string): void;
}

export function PluginPanel({
  isReady,
  onInstall,
  onSetEnabled,
  onUninstall,
  plugins
}: PluginPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>插件</Text>
        <Text style={styles.status}>{isReady ? "本地安装管理已就绪" : "正在读取插件状态"}</Text>
      </View>

      {plugins.map((plugin) => (
        <View key={plugin.id} style={styles.pluginCard}>
          <View style={styles.pluginCopy}>
            <Text style={styles.pluginName}>{plugin.name}</Text>
            <Text style={styles.pluginMeta}>
              {plugin.source === "built-in" ? "内置插件" : plugin.source} · {plugin.commandCount} 个命令
            </Text>
            <Text style={styles.pluginDescription}>{plugin.description}</Text>
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
  status: {
    color: colors.muted,
    fontSize: 13
  },
  title: {
    ...typography.label,
    color: colors.primary
  }
});
