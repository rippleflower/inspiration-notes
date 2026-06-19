import type { PluginInstallRecord, PluginInstallationStore } from "@inspiration-notes/core";

export class InMemoryPluginInstallationStore implements PluginInstallationStore {
  private records: PluginInstallRecord[] = [];

  async load(): Promise<PluginInstallRecord[]> {
    return this.records.map(copyRecord);
  }

  async save(records: PluginInstallRecord[]): Promise<void> {
    this.records = records.map(copyRecord);
  }
}

export function createInMemoryPluginInstallationStore(): PluginInstallationStore {
  return new InMemoryPluginInstallationStore();
}

export function copyRecord(record: PluginInstallRecord): PluginInstallRecord {
  return { ...record };
}
