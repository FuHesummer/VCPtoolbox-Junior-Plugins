# SemanticGroupEditor — 语义词元组编辑工具

AI 可调用的 RAG 语义词元组（semantic_groups.json）查询与批量更新工具。与 RAGDiaryPlugin 的语义分组功能配合使用。

## 双轨分发

- **本体核心**：`VCPtoolbox-Junior/Plugin/SemanticGroupEditor/`（装本体即带）
- **独立副本**：本插件仓库（方便其他上游兼容项目引用）

## AI 工具命令

- `QueryGroups` — 查询所有语义词元组（返回 JSON）
- `UpdateGroups` — 更新或新建语义组
  - 单次：`groupname` + `groupwords`（英文逗号分隔）
  - 批量：`command1` / `command2` ... 数字后缀

## 占位符

通过 invocationCommands 聚合生成 `{{VCPSemanticGroupEditor}}` 系统占位符（工具使用指南）。
