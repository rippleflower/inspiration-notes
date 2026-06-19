import { describe, expect, it } from "vitest";
import {
  formatPermission,
  formatRisk,
  summarizePluginSecurityIssueCount
} from "../src/plugins/pluginUi";

describe("plugin UI helpers", () => {
  it("formats plugin permissions and risks for the management panel", () => {
    expect(formatPermission("read-active-note")).toBe("读取当前笔记");
    expect(formatPermission("write-active-note")).toBe("写入当前笔记");
    expect(formatRisk("low")).toBe("低风险");
  });

  it("summarizes plugin security audit results", () => {
    expect(summarizePluginSecurityIssueCount(0)).toBe("安全自检通过");
    expect(summarizePluginSecurityIssueCount(2)).toBe("已清理 2 个异常插件记录");
  });
});
