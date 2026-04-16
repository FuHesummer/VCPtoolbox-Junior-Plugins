# ThoughtClusterManager — 思维簇管理工具

AI 可调用的思维簇（`thinking/` 下以"簇"结尾的目录）文件创建与编辑工具。支持元自学习能力 —— AI 可以动态完善自己的思考链。

## 双轨分发

- **本体核心**：`VCPtoolbox-Junior/Plugin/ThoughtClusterManager/`（装本体即带）
- **独立副本**：本插件仓库（方便其他上游兼容项目引用）

## AI 工具命令

- `CreateClusterFile` — 创建新的思维簇文件（folderName 必须以"簇"结尾）
- `EditClusterFile` — 编辑已存在的簇文件（查找替换，targetText ≥ 15 字符）

## 支持串行调用

通过 `command1` / `command2` 数字后缀进行批量操作。

## 占位符

通过 invocationCommands 聚合生成 `{{VCPThoughtClusterManager}}` 系统占位符（工具使用指南）。
