import type { BuiltInPlugin, PluginCommand, PluginContext } from "./types";

export class PluginRegistry {
  private readonly plugins = new Map<string, BuiltInPlugin>();
  private readonly commands = new Map<string, PluginCommand>();

  register(plugin: BuiltInPlugin): void {
    assertUnique(plugin.id, this.plugins, "plugin");
    assertPluginPermissions(plugin);

    for (const command of plugin.commands ?? []) {
      assertUnique(command.id, this.commands, "command");
    }

    this.plugins.set(plugin.id, plugin);

    for (const command of plugin.commands ?? []) {
      this.commands.set(command.id, command);
    }
  }

  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  listPlugins(): BuiltInPlugin[] {
    return Array.from(this.plugins.values());
  }

  listCommands(): PluginCommand[] {
    return Array.from(this.commands.values());
  }

  async runCommand(commandId: string, context: PluginContext): Promise<void> {
    const command = this.commands.get(commandId);

    if (!command) {
      throw new Error(`Unknown plugin command: ${commandId}`);
    }

    await command.run(context);
  }
}

function assertUnique<T>(id: string, map: Map<string, T>, label: string): void {
  if (map.has(id)) {
    throw new Error(`Duplicate ${label} id: ${id}`);
  }
}

function assertPluginPermissions(plugin: BuiltInPlugin): void {
  const pluginPermissions = new Set(plugin.permissions);

  for (const command of plugin.commands ?? []) {
    for (const permission of command.requiredPermissions ?? []) {
      if (!pluginPermissions.has(permission)) {
        throw new Error(
          `Plugin ${plugin.id} command ${command.id} requests undeclared permission: ${permission}`
        );
      }
    }
  }
}
