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
  description: string;
  commands?: PluginCommand[];
  importExportExtensions?: ImportExportExtension[];
  previewExtensions?: PreviewExtension[];
  transforms?: MarkdownTransform[];
}

export type PluginSource = "built-in";

export interface PluginCatalogItem {
  plugin: BuiltInPlugin;
  source: PluginSource;
  installedByDefault?: boolean;
}

export interface PluginInstallRecord {
  enabled: boolean;
  id: string;
  installedAt: string;
  source: PluginSource;
  updatedAt: string;
}

export interface PluginInstallView {
  commandCount: number;
  description: string;
  enabled: boolean;
  id: string;
  installed: boolean;
  name: string;
  source: PluginSource;
}

export interface PluginInstallationStore {
  load(): Promise<PluginInstallRecord[]>;
  save(records: PluginInstallRecord[]): Promise<void>;
}
