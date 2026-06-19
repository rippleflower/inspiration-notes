import { describe, expect, it } from "vitest";
import {
  InMemoryPluginInstallationStore,
  PluginInstaller,
  PluginRegistry,
  builtinPluginCatalog,
  createDefaultPluginRegistry
} from "../src";

describe("PluginRegistry", () => {
  it("registers and runs commands", async () => {
    const registry = new PluginRegistry();
    let content = "Before";

    registry.register({
      description: "Test plugin",
      id: "test-plugin",
      name: "Test Plugin",
      permissions: ["read-active-note", "write-active-note"],
      riskLevel: "low",
      securityNotes: ["Test-only plugin."],
      commands: [
        {
          id: "append",
          requiredPermissions: ["read-active-note", "write-active-note"],
          title: "Append",
          run: (context) => context.replaceActiveContent(`${context.getActiveContent()} After`)
        }
      ]
    });

    await registry.runCommand("append", {
      getActiveContent: () => content,
      replaceActiveContent: (next) => {
        content = next;
      }
    });

    expect(content).toBe("Before After");
  });

  it("rejects duplicate plugin and command ids", () => {
    const registry = new PluginRegistry();

    registry.register({
      description: "Duplicate plugin",
      id: "duplicate",
      name: "Duplicate",
      permissions: [],
      riskLevel: "low",
      securityNotes: [],
      commands: [{ id: "command", title: "Command", run: () => undefined }]
    });

    expect(() =>
      registry.register({
        description: "Again",
        id: "duplicate",
        name: "Again",
        permissions: [],
        riskLevel: "low",
        securityNotes: []
      })
    ).toThrow("Duplicate plugin id");
    expect(() =>
      registry.register({
        description: "Other",
        id: "other",
        name: "Other",
        permissions: [],
        riskLevel: "low",
        securityNotes: [],
        commands: [{ id: "command", title: "Command", run: () => undefined }]
      })
    ).toThrow("Duplicate command id");
  });

  it("rejects commands that request undeclared permissions", () => {
    const registry = new PluginRegistry();

    expect(() =>
      registry.register({
        description: "Bad plugin",
        id: "bad-plugin",
        name: "Bad Plugin",
        permissions: ["read-active-note"],
        riskLevel: "high",
        securityNotes: ["Test plugin."],
        commands: [
          {
            id: "bad-command",
            requiredPermissions: ["write-active-note"],
            title: "Bad Command",
            run: () => undefined
          }
        ]
      })
    ).toThrow("requests undeclared permission");
  });

  it("ships with the milestone-one built-in plugin set", () => {
    const registry = createDefaultPluginRegistry();

    expect(registry.listPlugins()).toHaveLength(1);
    expect(registry.listCommands().map((command) => command.id)).toContain(
      "insert-daily-template"
    );
  });

  it("installs default plugins and builds an enabled registry", async () => {
    const installer = new PluginInstaller(builtinPluginCatalog, new InMemoryPluginInstallationStore());

    await installer.ensureDefaultsInstalled(new Date("2026-06-18T00:00:00.000Z"));

    const plugins = await installer.listInstallable();
    const registry = await installer.createRegistry();

    expect(plugins).toMatchObject([
      {
        enabled: true,
        id: "writing-tools",
        installed: true
      }
    ]);
    expect(registry.hasCommand("insert-daily-template")).toBe(true);
  });

  it("disables, re-enables, and uninstalls plugins", async () => {
    const installer = new PluginInstaller(builtinPluginCatalog, new InMemoryPluginInstallationStore());

    await installer.install("writing-tools");
    await installer.setEnabled("writing-tools", false);

    expect((await installer.createRegistry()).hasCommand("insert-daily-template")).toBe(false);

    await installer.setEnabled("writing-tools", true);

    expect((await installer.createRegistry()).hasCommand("insert-daily-template")).toBe(true);

    await installer.uninstall("writing-tools");

    const [plugin] = await installer.listInstallable();
    expect(plugin).toMatchObject({ enabled: false, installed: false });
  });

  it("orchestrates enabled plugins with declared permissions and security metadata", async () => {
    const installer = new PluginInstaller(builtinPluginCatalog, new InMemoryPluginInstallationStore());

    await installer.ensureDefaultsInstalled(new Date("2026-06-18T00:00:00.000Z"));

    const state = await installer.orchestrate();
    const [plugin] = state.plugins;

    expect(state.issues).toEqual([]);
    expect(plugin).toMatchObject({
      enabled: true,
      permissions: ["read-active-note", "write-active-note", "transform-markdown", "export-markdown"],
      riskLevel: "low"
    });
    expect(state.registry.hasCommand("insert-daily-template")).toBe(true);
  });

  it("cleans unknown, duplicated, mismatched, and malformed install records", async () => {
    const store = new InMemoryPluginInstallationStore();
    const installer = new PluginInstaller(builtinPluginCatalog, store);

    await store.save([
      {
        enabled: true,
        id: "unknown-plugin",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      },
      {
        enabled: true,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "remote" as "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      },
      {
        enabled: "yes" as unknown as boolean,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      },
      {
        enabled: true,
        id: "writing-tools",
        installedAt: "2026-06-18T00:00:00.000Z",
        source: "built-in",
        updatedAt: "2026-06-18T00:00:00.000Z"
      }
    ]);

    const state = await installer.orchestrate();

    expect(state.issues.map((issue) => issue.code)).toEqual([
      "unknown-plugin",
      "source-mismatch",
      "invalid-enabled-flag",
      "duplicate-install-record"
    ]);
    expect(state.registry.hasCommand("insert-daily-template")).toBe(false);
    expect(await store.load()).toMatchObject([
      {
        enabled: false,
        id: "writing-tools",
        source: "built-in"
      }
    ]);
  });
});
