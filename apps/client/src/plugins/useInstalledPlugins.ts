import {
  builtinPluginCatalog,
  PluginInstaller,
  PluginRegistry,
  type PluginInstallView
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
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    setPlugins(await installer.listInstallable());
    setRegistry(await installer.createRegistry());
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
    setPluginEnabled,
    uninstallPlugin
  };
}
