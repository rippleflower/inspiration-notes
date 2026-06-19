import {
  builtinPluginCatalog,
  PluginInstaller,
  PluginRegistry,
  type PluginInstallView,
  type PluginSecurityIssue
} from "@inspiration-notes/core";
import { createPlatformPluginInstallationStore } from "@inspiration-notes/storage";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useInstalledPlugins() {
  const installer = useMemo(
    () => new PluginInstaller(builtinPluginCatalog, createPlatformPluginInstallationStore()),
    []
  );
  const [plugins, setPlugins] = useState<PluginInstallView[]>([]);
  const [registry, setRegistry] = useState(() => new PluginRegistry());
  const [securityIssues, setSecurityIssues] = useState<PluginSecurityIssue[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const state = await installer.orchestrate();

    setPlugins(state.plugins);
    setRegistry(state.registry as PluginRegistry);
    setSecurityIssues(state.issues);
    setIsReady(true);
  }, [installer]);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      await installer.ensureDefaultsInstalled();

      if (isMounted) {
        await refresh();
      }
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [installer, refresh]);

  const installPlugin = useCallback(
    async (pluginId: string) => {
      await installer.install(pluginId);
      await refresh();
    },
    [installer, refresh]
  );

  const setPluginEnabled = useCallback(
    async (pluginId: string, enabled: boolean) => {
      await installer.setEnabled(pluginId, enabled);
      await refresh();
    },
    [installer, refresh]
  );

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      await installer.uninstall(pluginId);
      await refresh();
    },
    [installer, refresh]
  );

  return {
    installPlugin,
    isReady,
    plugins,
    registry,
    securityIssues,
    setPluginEnabled,
    uninstallPlugin
  };
}
