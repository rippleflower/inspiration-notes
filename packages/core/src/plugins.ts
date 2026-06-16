export interface PluginContext {
  getActiveContent(): string;
  replaceActiveContent(content: string): void;
}

export interface PluginCommand {
  id: string;
  title: string;
  run(context: PluginContext): void | Promise<void>;
}

export interface MarkdownTransform {
  id: string;
  transform(markdown: string): string;
}

export interface PreviewExtension {
  id: string;
  markdownSyntax: string;
  description: string;
}

export interface ImportExportExtension {
  id: string;
  mimeType: string;
  direction: "import" | "export";
}

export interface BuiltInPlugin {
  id: string;
  name: string;
  commands?: PluginCommand[];
  importExportExtensions?: ImportExportExtension[];
  previewExtensions?: PreviewExtension[];
  transforms?: MarkdownTransform[];
}

export class PluginRegistry {
  private readonly plugins = new Map<string, BuiltInPlugin>();
  private readonly commands = new Map<string, PluginCommand>();

  register(plugin: BuiltInPlugin): void {
    assertUnique(plugin.id, this.plugins, "plugin");

    for (const command of plugin.commands ?? []) {
      assertUnique(command.id, this.commands, "command");
    }

    this.plugins.set(plugin.id, plugin);

    for (const command of plugin.commands ?? []) {
      this.commands.set(command.id, command);
    }
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

export function createDefaultPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();

  registry.register({
    id: "writing-tools",
    name: "Writing Tools",
    commands: [
      {
        id: "insert-daily-template",
        title: "插入每日模板",
        run: (context) => {
          const current = context.getActiveContent();
          const template = "# 今日灵感\n\n## 线索\n\n- \n\n## 下一步\n\n- ";
          context.replaceActiveContent(current ? `${current}\n\n${template}` : template);
        }
      }
    ],
    importExportExtensions: [
      {
        id: "markdown-export",
        mimeType: "text/markdown",
        direction: "export"
      }
    ],
    previewExtensions: [
      {
        id: "tag-highlight",
        markdownSyntax: "#tag",
        description: "Highlight inline tags in preview."
      }
    ],
    transforms: [
      {
        id: "trim-trailing-space",
        transform: (markdown) => markdown.replace(/[ \t]+$/gm, "")
      }
    ]
  });

  return registry;
}

function assertUnique<T>(id: string, map: Map<string, T>, label: string): void {
  if (map.has(id)) {
    throw new Error(`Duplicate ${label} id: ${id}`);
  }
}
