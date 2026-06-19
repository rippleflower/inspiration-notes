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
      id: "test-plugin",
      name: "Test Plugin",
      commands: [
        {
          id: "append",
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
      id: "duplicate",
      name: "Duplicate",
      commands: [{ id: "command", title: "Command", run: () => undefined }]
    });

    expect(() => registry.register({ id: "duplicate", name: "Again" })).toThrow(
      "Duplicate plugin id"
    );
    expect(() =>
      registry.register({
        id: "other",
        name: "Other",
        commands: [{ id: "command", title: "Command", run: () => undefined }]
      })
    ).toThrow("Duplicate command id");
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
});
