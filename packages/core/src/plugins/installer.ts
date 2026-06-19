import { PluginRegistry } from "./registry";
import type {
  PluginCatalogItem,
  PluginInstallRecord,
  PluginInstallationStore,
  PluginInstallView
} from "./types";

export class InMemoryPluginInstallationStore implements PluginInstallationStore {
  private records: PluginInstallRecord[] = [];

  async load(): Promise<PluginInstallRecord[]> {
    return [...this.records];
  }

  async save(records: PluginInstallRecord[]): Promise<void> {
    this.records = records.map((record) => ({ ...record }));
  }
}

export class PluginInstaller {
  constructor(
    private readonly catalog: PluginCatalogItem[],
    private readonly store: PluginInstallationStore
  ) {}

  async ensureDefaultsInstalled(now = new Date()): Promise<void> {
    const records = await this.store.load();
    let changed = false;

    for (const item of this.catalog) {
      if (!item.installedByDefault || records.some((record) => record.id === item.plugin.id)) {
        continue;
      }

      records.push(createInstallRecord(item, now, true));
      changed = true;
    }

    if (changed) {
      await this.store.save(records);
    }
  }

  async install(pluginId: string, now = new Date()): Promise<void> {
    const item = this.requireCatalogItem(pluginId);
    const records = await this.store.load();
    const existing = records.find((record) => record.id === pluginId);

    if (existing) {
      existing.enabled = true;
      existing.updatedAt = toIso(now);
    } else {
      records.push(createInstallRecord(item, now, true));
    }

    await this.store.save(records);
  }

  async uninstall(pluginId: string): Promise<void> {
    this.requireCatalogItem(pluginId);
    const records = (await this.store.load()).filter((record) => record.id !== pluginId);
    await this.store.save(records);
  }

  async setEnabled(pluginId: string, enabled: boolean, now = new Date()): Promise<void> {
    this.requireCatalogItem(pluginId);
    const records = await this.store.load();
    const existing = records.find((record) => record.id === pluginId);

    if (!existing) {
      throw new Error(`Plugin is not installed: ${pluginId}`);
    }

    existing.enabled = enabled;
    existing.updatedAt = toIso(now);
    await this.store.save(records);
  }

  async listInstallable(): Promise<PluginInstallView[]> {
    const records = await this.store.load();

    return this.catalog.map((item) => {
      const record = records.find((candidate) => candidate.id === item.plugin.id);

      return {
        commandCount: item.plugin.commands?.length ?? 0,
        description: item.plugin.description,
        enabled: record?.enabled ?? false,
        id: item.plugin.id,
        installed: Boolean(record),
        name: item.plugin.name,
        source: item.source
      };
    });
  }

  async createRegistry(): Promise<PluginRegistry> {
    const registry = new PluginRegistry();
    const records = await this.store.load();
    const enabledIds = new Set(
      records.filter((record) => record.enabled).map((record) => record.id)
    );

    for (const item of this.catalog) {
      if (enabledIds.has(item.plugin.id)) {
        registry.register(item.plugin);
      }
    }

    return registry;
  }

  private requireCatalogItem(pluginId: string): PluginCatalogItem {
    const item = this.catalog.find((candidate) => candidate.plugin.id === pluginId);

    if (!item) {
      throw new Error(`Unknown installable plugin: ${pluginId}`);
    }

    return item;
  }
}

function createInstallRecord(
  item: PluginCatalogItem,
  now: Date,
  enabled: boolean
): PluginInstallRecord {
  const timestamp = toIso(now);

  return {
    enabled,
    id: item.plugin.id,
    installedAt: timestamp,
    source: item.source,
    updatedAt: timestamp
  };
}

function toIso(date: Date): string {
  return date.toISOString();
}
