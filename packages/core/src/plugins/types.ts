export interface PluginContext {
  getActiveContent(): string;
  replaceActiveContent(content: string): void;
}

export interface PluginCommand {
  id: string;
  requiredPermissions?: PluginPermission[];
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
  permissions: PluginPermission[];
  riskLevel: PluginRiskLevel;
  securityNotes: string[];
  commands?: PluginCommand[];
  importExportExtensions?: ImportExportExtension[];
  previewExtensions?: PreviewExtension[];
  transforms?: MarkdownTransform[];
}

export type PluginSource = "built-in";
export type PluginRiskLevel = "low" | "medium" | "high";
export type PluginPermission =
  | "read-active-note"
  | "write-active-note"
  | "transform-markdown"
  | "export-markdown";

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
  permissions: PluginPermission[];
  riskLevel: PluginRiskLevel;
  securityNotes: string[];
  source: PluginSource;
}

export type PluginSecurityIssueCode =
  | "duplicate-install-record"
  | "invalid-enabled-flag"
  | "source-mismatch"
  | "unknown-plugin";

export interface PluginSecurityIssue {
  code: PluginSecurityIssueCode;
  id: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface PluginOrchestrationState {
  issues: PluginSecurityIssue[];
  plugins: PluginInstallView[];
  registry: PluginRegistryLike;
}

export interface PluginRegistryLike {
  hasCommand(commandId: string): boolean;
  listCommands(): PluginCommand[];
  runCommand(commandId: string, context: PluginContext): Promise<void>;
}

export interface PluginInstallationStore {
  load(): Promise<PluginInstallRecord[]>;
  save(records: PluginInstallRecord[]): Promise<void>;
}
