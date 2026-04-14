# VCPtoolbox-Junior 插件开发者指南

> 面向**插件作者**：如何开发一个具备完整管理面板能力的插件，并通过 VCP 商店发布。
>
> 主项目地址：[VCPtoolbox-Junior](https://github.com/FuHesummer/VCPtoolbox-Junior)
> 插件仓库：[VCPtoolbox-Junior-Plugins](https://github.com/FuHesummer/VCPtoolbox-Junior-Plugins)

---

## 0. 插件能力总览

VCPtoolbox-Junior 插件可以同时具备 **6 类能力**（按需任选）：

| 能力 | manifest 字段 | 用途 |
|------|--------------|------|
| AI 工具调用 | `capabilities.invocationCommands` | 让 AI 通过 `<<<[TOOL_REQUEST]>>>` 协议触发 |
| 系统提示词注入（动态） | `capabilities.systemPromptPlaceholders` | 用 `{{VCPxxx}}` 在 prompt 里注入动态值（如实时数据） |
| **TVS 工具指南注入（静态）** ⭐ | `capabilities.tvsVariables` | 插件自带 `tvs/*.txt` 工具使用指南，安装时自动复制 + 注入 `{{VarXxx}}` |
| 后台常驻服务 | `pluginType: 'service'` 或 `'hybridservice'` | 启动时 `initialize()`，长期运行 |
| 仪表盘卡片 | `dashboardCards: [...]` | AdminPanel 仪表盘上展示自己的小卡片 |
| **管理面板 API** ⭐ | `module.exports.pluginAdminRouter` | 暴露 Express.Router，供前端页面调用 |
| **管理面板页面** ⭐ | `adminNav: { type, entry }` | 在主面板侧边栏添加入口 + 提供独立页面 |

带 ⭐ 的是 Junior 新增的"插件 admin 扩展协议"，本指南重点讲解。

---

## 1. 最小插件结构

```
YourPlugin/
├── plugin-manifest.json       # 启用态（或 .json.block 禁用态）
├── plugin-manifest.json.block # 商店发布标准（用户安装后改名启用）
├── index.js                   # 入口（manifest 里的 entryPoint.script）
├── package.json               # 依赖（自动 npm install）
├── config.env.example         # 配置模板
├── README.md
└── admin/                     # 可选：管理面板资源
    └── panel.js               # native 模式入口（或 index.html for iframe）
```

发布到云仓库时，**保留 `plugin-manifest.json.block`**（禁用态），用户在 PluginStore 安装后通过开关启用，避免装即跑的副作用。

---

## 2. manifest 关键字段

```json
{
  "manifestVersion": "1.0.0",
  "name": "AgentDream",
  "displayName": "梦系统插件",
  "version": "1.0.0",
  "description": "...",
  "author": "你的名字",
  "pluginType": "hybridservice",
  "entryPoint": { "script": "index.js" },
  "communication": { "protocol": "direct" },

  "configSchema": {
    "API_KEY": "string",
    "MAX_RETRY": "integer"
  },

  "adminNav": {
    "title": "管理页面标题",
    "icon": "material_symbol_name",
    "type": "native",
    "entry": "panel.js"
  },

  "capabilities": {
    "invocationCommands": [
      { "command": "DoSomething", "description": "..." }
    ]
  }
}
```

`adminNav` 字段会被 `SideBar.vue` 自动读取，在「插件」分组添加导航项。

---

## 3. 开发管理面板后端 API（`pluginAdminRouter`）

让插件暴露 RESTful 接口供自己的前端页面（或其他工具）调用。

### 3.1 编写 router

```js
// index.js
const express = require('express');

const pluginAdminRouter = express.Router();
pluginAdminRouter.use(express.json({ limit: '2mb' }));

pluginAdminRouter.get('/items', async (req, res) => {
    const items = await loadItems();
    res.json({ success: true, items });
});

pluginAdminRouter.post('/items/:id/approve', async (req, res) => {
    await approveItem(req.params.id);
    res.json({ success: true });
});

module.exports = {
    initialize: async (config, deps) => { /* ... */ },
    shutdown: async () => { /* ... */ },
    pluginAdminRouter,        // ← 暴露给主项目挂载
};
```

### 3.2 自动挂载

主项目 `Plugin.js` 的 `getPluginAdminRouter(name)` 在初始化后自动从 `serviceModules` 拿到这个 router。

[adminPanelRoutes.js](https://github.com/FuHesummer/VCPtoolbox-Junior/blob/main/routes/adminPanelRoutes.js) 提供通用动态路由：

```
GET  /admin_api/plugins/<PluginName>/api/*
POST /admin_api/plugins/<PluginName>/api/*
...
```

所有方法都会自动分发到你的 `pluginAdminRouter`。

> **adminServer 兜底代理**：独立的 6006 端口（adminServer）通过通用反代转发到主服务，无需额外挂载。

### 3.3 安全 / 鉴权

- **鉴权自动**：所有 `/admin_api/*` 已被主项目鉴权中间件保护，路由处理器拿到的请求都是已登录用户。
- **路径穿越**：自己处理文件路径时记得 `path.normalize()` + 前缀校验。
- **输入校验**：用 `req.body` / `req.params` 时做必要的类型/范围校验。

---

## 4. 开发管理面板页面（Native 模式 ⭐ 推荐）

**Native 模式 = 插件提供 Vue 组件，主面板原生挂载**，视觉/响应式/路由与主面板页面完全等价。

### 4.1 manifest 声明

```json
{
  "adminNav": {
    "title": "梦境审批",
    "icon": "bedtime",
    "type": "native",
    "entry": "panel.js"
  }
}
```

### 4.2 编写 `admin/panel.js`

```js
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[YourPlugin] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted } = P.Vue;
  const { pluginApi, showToast, formatTime, markdown } = P;
  const api = pluginApi('YourPluginName');

  const YourPage = {
    name: 'YourPage',
    template: /* html */ `
      <div class="page">
        <PageHeader title="..." subtitle="..." icon="...">
          <template #actions>
            <button class="btn btn-ghost" @click="reload">
              <span class="material-symbols-outlined">refresh</span>
              刷新
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <EmptyState v-if="items.length === 0" icon="inbox" message="暂无数据" />
          <article v-else v-for="item in items" :key="item.id" class="card" style="margin-bottom: 8px;">
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <button class="btn btn-small" @click="approve(item.id)">批准</button>
          </article>
        </div>
      </div>
    `,
    setup() {
      const items = ref([]);

      async function reload() {
        try { items.value = await api.get('/items'); }
        catch (e) { showToast('加载失败：' + e.message, 'error'); }
      }

      async function approve(id) {
        try {
          await api.post(`/items/${id}/approve`);
          showToast('已批准', 'success');
          await reload();
        } catch (e) { showToast('操作失败：' + e.message, 'error'); }
      }

      onMounted(reload);
      return { items, reload, approve };
    },
  };

  P.register('YourPluginName', YourPage);
})();
```

### 4.3 `window.__VCPPanel` API 速查

| 属性 / 方法 | 用途 |
|------------|------|
| `Vue` | 主面板 Vue 3 实例，含 `ref/computed/onMounted/watch/...` |
| `pluginApi(name)` | 返回 `{ get, post, patch, delete }`，自动加 `/admin_api/plugins/<name>/api` 前缀 |
| `apiFetch(path, opts)` | 主面板通用 fetch（自动鉴权 cookie + JSON 序列化） |
| `showToast(msg, kind)` | 弹通知，kind: `'success' \| 'error' \| 'warn' \| 'info'` |
| `formatTime(input)` | 格式化时间为 `YYYY-MM-DD HH:mm` |
| `formatBytes(n)` / `formatCompact(n)` | 字节 / 紧凑数字格式化 |
| `markdown(text)` | 主面板的 markdown 渲染（粉色主题行内 code 等） |
| `register(name, component)` | 注册组件，主面板会动态挂载 |

### 4.4 主面板提供的全局组件

`<PageHeader>` `<EmptyState>` `<BaseModal>` 已在 [main.ts](https://github.com/FuHesummer/VCPtoolbox-Junior/blob/main/AdminPanel-Vue/src/main.ts) 全局注册，插件 template 可直接使用。

### 4.5 样式策略

- **主面板 CSS 变量直接可用**：`--button-bg` / `--primary-text` / `--card-bg` / `--accent-bg` ... 全套粉色主题。
- **通用 class 直接可用**：`.card` / `.btn` / `.btn-ghost` / `.btn-danger` / `.btn-small` / `.chip` 等。
- **专属样式**：在 `panel.js` 顶层动态注入 `<style id="myplugin-style">`（参考 [AgentDream/admin/panel.js](AgentDream/admin/panel.js) 末尾）。

### 4.6 调试技巧

- 改了 `panel.js` 后 **Ctrl+Shift+R 硬刷新** 主面板（admin-assets 端点已加 no-cache）。
- 浏览器 DevTools 里看 `[VCPPanel] Plugin component registered: <name>` 日志确认组件注册成功。
- 用 `window.__VCPPanel.getComponent('<name>')` 在 console 检查组件对象。

---

## 5. Iframe 模式（兼容 / 隔离场景）

如果不想用 Vue / 想用其他技术栈 / 需要严格沙盒：

```json
{
  "adminNav": { "title": "...", "icon": "...", "type": "iframe" }
}
```

在 `admin/index.html` 写完整 HTML，主面板会用 `<iframe src="/admin_api/plugins/<name>/admin-page">` 加载。

---

## 5.5. TVS 工具指南协议（`tvsVariables`）

如果插件有一份"给 AI 看的工具使用说明"（类似 MCP 的 tool description），应通过 `tvsVariables` 让 Junior 自动管理，**不要让用户手动复制 txt 文件 + 改 `config.env`**。

### 5.5.1 目录结构

```
YourPlugin/
├── plugin-manifest.json.block
├── index.js
└── tvs/                 # ← 新增：TVS 工具指南目录（约定名）
    └── yourplugin.txt   # ← 给 AI 看的工具使用说明
```

### 5.5.2 manifest 声明

```json
{
  "capabilities": {
    "tvsVariables": [
      {
        "key": "VarYourPlugin",
        "file": "tvs/yourplugin.txt",
        "description": "你的插件工具使用指南（AdminPanel 显示用）"
      }
    ]
  }
}
```

### 5.5.3 字段约束

| 字段 | 约束 |
|------|------|
| `key` | 必须以 `Var` 开头（如 `VarDreamTool`、`VarFileTool`） |
| `file` | 必须以 `.txt` 结尾，相对于插件根目录 |
| `description` | AdminPanel / TVS 编辑器显示用，可选 |

### 5.5.4 Junior 自动行为

| 阶段 | 行为 |
|------|------|
| **首次安装 / 启动**（TVStxt 无同名文件）| 把 `<plugin>/tvs/yourplugin.txt` **移动**到主项目 `TVStxt/yourplugin.txt`（插件目录文件消失，TVStxt 成为唯一真相）<br>注入 `process.env.VarYourPlugin = 'yourplugin.txt'` |
| **重启 / reload**（TVStxt 已有文件）| **不覆盖** TVStxt 下的文件（保留用户在 AdminPanel TvsEditor 里的修改）<br>只重新注入 `process.env` |
| **AI 使用** | Agent 提示词里 `{{VarYourPlugin}}` 会展开为 TVStxt 下文件的内容 |
| **卸载（通过 PluginStore）** | 删除 TVStxt 下的文件 + 清理 `process.env`（插件目录紧接着会被整体删除）|
| **冲突** | 同名 `Var` 被多个插件声明 → 启动 WARN 跳过冲突项 |

**"移动"而非"复制"的设计理由**：
- TVStxt/ 是唯一真相，用户通过 AdminPanel 编辑不会被下次启动覆盖
- 插件目录下 tvs/ 的文件仅用于"首次种子"，首次注册后就交给 TVStxt 管理
- 卸载时插件和 TVStxt/ 对应文件一起清理，干净彻底

### 5.5.5 Agent prompt 里怎么用

用户在 Agent 的 `.txt` 提示词里加一行：

```
{{VarYourPlugin}}
```

插件安装后会自动展开，卸载后展开为空字符串（不报错）。

### 5.5.6 禁忌

- ❌ 不要在 `config.env` 里手动声明协议化的 `Var*`（会与插件注册冲突）
- ❌ 不要直接往 Junior 的 `TVStxt/` 塞文件（插件 reload 时会被清理）
- ❌ `key` 不要和现有系统变量冲突（`VarToolList` / `VarDailyNoteGuide` / `VarForum` 等）

---

## 6. 开发 → 测试 → 发布流程

```bash
# 1. 在主项目 Plugin/ 下开发（直接看效果）
cp -r 你的插件源码 /path/to/VCPtoolbox-Junior/Plugin/YourPlugin/

# 2. 重启 server.js + adminServer.js 让插件被发现
# 3. AdminPanel 侧边栏「插件」分组应出现你的入口
# 4. 调试通过后

# 5. 复制到本仓库（VCPtoolbox-Junior-Plugins）
cp -r /path/to/VCPtoolbox-Junior/Plugin/YourPlugin/ ./YourPlugin/

# 6. 把 plugin-manifest.json 重命名为 .block（发布禁用态）
mv ./YourPlugin/plugin-manifest.json ./YourPlugin/plugin-manifest.json.block

# 7. PR 提交到本仓库 / 或 push 自己 fork 的源
```

用户安装：通过主项目 AdminPanel 的 PluginStore 一键安装 → 自动复制到主项目 Plugin/ → 启用 → 用。

---

## 7. 参考实现

| 插件 | 演示能力 |
|------|---------|
| [AgentDream/](AgentDream/) | hybridservice + pluginAdminRouter + adminNav.type='native' + **tvsVariables (tvs/dreamtool.txt)** + dreampost prompt 模板 |
| [VCPForum/](VCPForum/) | synchronous + **tvsVariables (tvs/ToolForum.txt)** + 论坛发帖/回帖/读帖 |
| [DailyHot/](DailyHot/) | static + systemPromptPlaceholders + dashboardCards + 56+ 数据源聚合 |

---

## 8. 协议禁忌

- ❌ 不要在 `pluginAdminRouter` 处理器里假设运行环境是某个特定 HTTP server（adminServer 会反代）
- ❌ 不要在 `panel.js` 里 `import 'vue'`（用 `window.__VCPPanel.Vue`）
- ❌ 不要发布 `plugin-manifest.json`（启用态），发 `.block`（禁用态）
- ❌ 不要在插件目录里硬编码 API key / token，用 `config.env.example` + 用户配置
- ❌ 不要假设主项目存在某个特定路径（用 `__dirname` 拼相对路径）
- ❌ 不要在 manifest 之外向主面板硬塞导航/路由（用 `adminNav`，主面板自动注入）
- ❌ 不要让用户手动往 `config.env` 加 `Var*` 或往 `TVStxt/` 放文件（用 `tvsVariables` 协议）

---

**协议版本**：v2.1（Junior 引入 native 模式 + pluginAdminRouter + tvsVariables 协议）
**最后更新**：2026-04-14
