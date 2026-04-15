# Development Workflow Rules — VCPtoolbox-Junior-Plugins

> 此文件定义插件仓库的 LLM 开发工作流强制规则。
> 所有 LLM 工具在执行任务时必须遵守，不可跳过任何步骤。

## Full Flow (MUST follow, no exceptions)

### feat (新插件 / 新能力)
1. 理解需求，明确属于哪个插件（或新建一个目录）
2. 阅读该插件现有 manifest / 源码，理解既有约定
3. 实现代码 + 更新 `plugin-manifest.json(.block)` capabilities 声明
4. 若涉及协议变更（adminNav、tvsVariables 等）→ 同步更新 `PLUGIN_DEVELOPER_GUIDE.md`
5. 本地 `cp -r` 到主项目 Plugin/ 重启验证
6. 回写插件仓库（保留 .block 禁用态发布）
7. 自查 manifest 格式 + 依赖声明

### fix (插件 bug 修复)
1. 复现问题（主项目 Plugin/ 下）
2. 定位根因，留意是否是 Junior 协议变化引起
3. 修复代码
4. 主项目验证通过后回写插件仓库

### sync (与 Junior 协议对齐)
- Junior 主项目协议演化（如 v2.0 native、v2.1 tvsVariables）→ 扫描本仓库所有插件，识别需要适配的
- 按主项目 `docs/PLUGIN_PROTOCOL.md` 更新 manifest
- PLUGIN_DEVELOPER_GUIDE.md 同步协议版本号

## Context Logging (决策记录)

当你做出以下决策时，MUST 追加到 `.context/current/branches/<当前分支>/session.log`：

1. **方案选择**：选 A 不选 B 时，记录原因
2. **Bug 发现与修复**：根因 + 修复方法 + 教训
3. **新协议引入**：manifest 新增字段的设计理由
4. **批量改动**：扫描式修改多个插件时的判定规则

追加格式：

## <ISO-8601 时间>
**Decision**: <你选择了什么>
**Alternatives**: <被排除的方案>
**Reason**: <为什么>
**Risk**: <潜在风险>

## Release Notes

- 发布新协议版本时，在 `PLUGIN_DEVELOPER_GUIDE.md` 末尾更新「协议版本」+「最后更新」
- 废弃字段要在 README 标注 deprecated 并保留至少一个版本的兼容期
