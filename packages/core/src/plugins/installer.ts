import { PluginRegistry } from "./registry";
import type {
  PluginCatalogItem,
  PluginInstallRecord,
  PluginInstallationStore,
  PluginInstallView,
  PluginOrchestrationState,
  PluginSecurityIssue
} from "./types";

export class InMemoryPluginInstallationStore implements PluginInstallationStore {
  private records: PluginInstallRecord[] = [];

  async load(): Promise<PluginInstallRecord[]> {
    return this.records.map(copyRecord);
  }

  async save(records: PluginInstallRecord[]): Promise<void> {
    this.records = records.map(copyRecord);
  }
}

export class PluginInstaller {
  constructor(
    private readonly catalog: PluginCatalogItem[],
    private readonly store: PluginInstallationStore
  ) {}

  async ensureDefaultsInstalled(now = new Date()): Promise<void> {
    const audit = await this.loadTrustedRecords();
    const records = audit.records;
    let hasChanged = audit.changed;

    for (const item of this.catalog) {
      if (!item.installedByDefault || records.some((record) => record.id === item.plugin.id)) {
        continue;
      }

      records.push(createInstallRecord(item, now, true));
      hasChanged = true;
    }

    if (hasChanged) {
      await this.store.save(records);
    }
  }

  async install(pluginId: string, now = new Date()): Promise<void> {
    const item = this.requireCatalogItem(pluginId);
    const { records } = await this.loadTrustedRecords();
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
    const { records: trustedRecords } = await this.loadTrustedRecords();
    const records = trustedRecords.filter((record) => record.id !== pluginId);
    await this.store.save(records);
  }

  async setEnabled(pluginId: string, enabled: boolean, now = new Date()): Promise<void> {
    this.requireCatalogItem(pluginId);
    const { records } = await this.loadTrustedRecords();
    const existing = records.find((record) => record.id === pluginId);

    if (!existing) {
      throw new Error(`Plugin is not installed: ${pluginId}`);
    }

    existing.enabled = enabled;
    existing.updatedAt = toIso(now);
    await this.store.save(records);
  }

  async listInstallable(): Promise<PluginInstallView[]> {
    const { records } = await this.loadTrustedRecords();

    return this.catalog.map((item) => {
      const record = records.find((candidate) => candidate.id === item.plugin.id);

      return {
        commandCount: item.plugin.commands?.length ?? 0,
        description: item.plugin.description,
        enabled: record?.enabled ?? false,
        id: item.plugin.id,
        installed: Boolean(record),
        name: item.plugin.name,
        permissions: item.plugin.permissions,
        riskLevel: item.plugin.riskLevel,
        securityNotes: item.plugin.securityNotes,
        source: item.source
      };
    });
  }

  async createRegistry(): Promise<PluginRegistry> {
    const registry = new PluginRegistry();
    const { records } = await this.loadTrustedRecords();
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

  async orchestrate(): Promise<PluginOrchestrationState> {
    const audit = await this.loadTrustedRecords();

    if (audit.changed) {
      await this.store.save(audit.records);
    }

    const plugins = this.createInstallViews(audit.records);
    const registry = await this.createRegistryFromRecords(audit.records);

    return {
      issues: audit.issues,
      plugins,
      registry
    };
  }

  private requireCatalogItem(pluginId: string): PluginCatalogItem {
    const item = this.catalog.find((candidate) => candidate.plugin.id === pluginId);

    if (!item) {
      throw new Error(`Unknown installable plugin: ${pluginId}`);
    }

    return item;
  }

  private async loadTrustedRecords(): Promise<{
    changed: boolean;
    issues: PluginSecurityIssue[];
    records: PluginInstallRecord[];
  }> {
    const rawRecords = await this.store.load();
    const issues: PluginSecurityIssue[] = [];
    const records: PluginInstallRecord[] = [];
    const seenIds = new Set<string>();
    let changed = false;

    for (const rawRecord of rawRecords) {
      const record = rawRecord as PluginInstallRecord;
      const item = this.catalog.find((candidate) => candidate.plugin.id === record.id);

      if (!item) {
        issues.push({
          code: "unknown-plugin",
          id: String(record.id),
          message: `Removed unknown plugin install record: ${String(record.id)}`,
          severity: "high"
        });
        changed = true;
        continue;
      }

      if (seenIds.has(record.id)) {
        issues.push({
          code: "duplicate-install-record",
          id: record.id,
          message: `Removed duplicate plugin install record: ${record.id}`,
          severity: "medium"
        });
        changed = true;
        continue;
      }

      if (record.source !== item.source) {
        issues.push({
          code: "source-mismatch",
          id: record.id,
          message: `Removed plugin install record with mismatched source: ${record.id}`,
          severity: "high"
        });
        changed = true;
        continue;
      }

      if (typeof record.enabled !== "boolean") {
        issues.push({
          code: "invalid-enabled-flag",
          id: record.id,
          message: `Disabled plugin install record with invalid enabled flag: ${record.id}`,
          severity: "medium"
        });
        records.push({
          ...record,
          enabled: false,
          source: item.source
        });
        seenIds.add(record.id);
        changed = true;
        continue;
      }

      records.push({
        enabled: record.enabled,
        id: record.id,
        installedAt: record.installedAt,
        source: item.source,
        updatedAt: record.updatedAt
      });
      seenIds.add(record.id);
    }

    return {
      changed,
      issues,
      records
    };
  }

  private createInstallViews(records: PluginInstallRecord[]): PluginInstallView[] {
    return this.catalog.map((item) => {
      const record = records.find((candidate) => candidate.id === item.plugin.id);

      return {
        commandCount: item.plugin.commands?.length ?? 0,
        description: item.plugin.description,
        enabled: record?.enabled ?? false,
        id: item.plugin.id,
        installed: Boolean(record),
        name: item.plugin.name,
        permissions: item.plugin.permissions,
        riskLevel: item.plugin.riskLevel,
        securityNotes: item.plugin.securityNotes,
        source: item.source
      };
    });
  }

  private async createRegistryFromRecords(records: PluginInstallRecord[]): Promise<PluginRegistry> {
    const registry = new PluginRegistry();
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

function copyRecord(record: PluginInstallRecord): PluginInstallRecord {
  return { ...record };
}
