import type { BuiltInPlugin, PluginCatalogItem } from "./types";
import { PluginRegistry } from "./registry";

export const writingToolsPlugin: BuiltInPlugin = {
  id: "writing-tools",
  name: "写作工具",
  description: "提供每日模板、Markdown 导出声明、预览扩展和基础清理 transform。",
  permissions: ["read-active-note", "write-active-note", "transform-markdown", "export-markdown"],
  riskLevel: "low",
  securityNotes: [
    "仅执行应用内置代码，不加载远程脚本。",
    "只读写当前选中的 Markdown 笔记。",
    "不会访问网络、账号凭证或系统文件。"
  ],
  commands: [
    {
      id: "insert-daily-template",
      requiredPermissions: ["read-active-note", "write-active-note"],
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
};

export const builtinPluginCatalog: PluginCatalogItem[] = [
  {
    plugin: writingToolsPlugin,
    source: "built-in",
    installedByDefault: true
  }
];

export function createDefaultPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();

  for (const item of builtinPluginCatalog) {
    registry.register(item.plugin);
  }

  return registry;
}
