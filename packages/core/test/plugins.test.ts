import { describe, expect, it } from "vitest";
import { PluginRegistry, createDefaultPluginRegistry } from "../src";

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
});
