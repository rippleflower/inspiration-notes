import { describe, expect, it } from "vitest";
import { createInMemoryPluginInstallationStore } from "../src";

describe("PluginInstallationStore contract", () => {
  it("saves and loads plugin installation records", async () => {
    const store = createInMemoryPluginInstallationStore();

    await store.save([
      {
        enabled: true,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      }
    ]);

    expect(await store.load()).toEqual([
      {
        enabled: true,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      }
    ]);
  });

  it("returns copies so callers cannot mutate persisted state by reference", async () => {
    const store = createInMemoryPluginInstallationStore();

    await store.save([
      {
        enabled: true,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      }
    ]);

    const records = await store.load();
    records[0].enabled = false;

    expect(await store.load()).toMatchObject([{ enabled: true }]);
  });
});
