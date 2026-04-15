# Coding Style Guide — VCPtoolbox-Junior-Plugins

> 此文件定义插件仓库的编码规范，所有 LLM 工具和插件作者在修改/新增插件时必须遵守。
> 提交到 Git，团队共享。

## General
- Prefer small, reviewable changes; avoid unrelated refactors.
- Keep functions short (<50 lines); avoid deep nesting (≤3 levels).
- Name things explicitly; no single-letter variables except loop counters.
- Handle errors explicitly; never swallow errors silently.
- One plugin = one directory at repo root（PascalCase 目录名）

## Plugin Manifest
- 发布时 manifest 必须为 `plugin-manifest.json.block`（禁用态），用户安装后改名启用
- `configSchema` 必填字段类型：`string` / `integer` / `float` / `boolean`
- 敏感配置（API key / secret）写进 `configSchema`，不要硬编码在代码里
- 声明 `capabilities.tvsVariables` 时：key 以 `Var` 开头，file 以 `.txt` 结尾

## JavaScript / Node.js
- CommonJS（`module.exports`），不引入 ESM-only 依赖
- 异步用 async/await，避免回调地狱
- 插件私有 npm 依赖写进自己的 `package.json`（Junior 加载时自动 `npm install`）
- 不要假设主项目在特定路径 → 用 `__dirname` 拼相对路径

## Admin 页面（native 模式）
- 通过 `window.__VCPPanel` 访问 Vue + 主面板工具（不要 `import 'vue'`）
- 插件专属样式用 IIFE 注入 `<style id="your-plugin-style">`
- 沿用主面板 CSS 变量（`--button-bg` / `--card-bg` 等）保持视觉一致

## Git Commits
- Conventional Commits + emoji 前缀（示例见最近 commits）
- 中文 commit 首行 ≤ 72 字符
- Atomic：一次 commit 一个主题

## Security
- Never log secrets (tokens/keys/cookies/JWT)
- Validate all `req.body` / `req.params` at plugin admin router 入口
- 文件路径操作必须 `path.normalize()` + 前缀校验

## Compatibility
- 改 manifest 关键字段（name / pluginType / entryPoint）要兼顾历史安装用户
- 新增 `capabilities.*` 字段是向后兼容的（主项目会忽略未识别字段）
