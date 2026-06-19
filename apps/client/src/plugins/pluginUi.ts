export function formatPermission(permission: string): string {
  const labels: Record<string, string> = {
    "export-markdown": "导出 Markdown",
    "read-active-note": "读取当前笔记",
    "transform-markdown": "转换 Markdown",
    "write-active-note": "写入当前笔记"
  };

  return labels[permission] ?? permission;
}

export function formatRisk(riskLevel: string): string {
  const labels: Record<string, string> = {
    high: "高风险",
    low: "低风险",
    medium: "中风险"
  };

  return labels[riskLevel] ?? riskLevel;
}

export function summarizePluginSecurityIssueCount(issueCount: number): string {
  return issueCount === 0 ? "安全自检通过" : `已清理 ${issueCount} 个异常插件记录`;
}
