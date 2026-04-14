# VCPtoolbox-Junior Plugins

> [VCPtoolbox-Junior](https://github.com/FuHesummer/VCPtoolbox-Junior) 可选插件集合

---

## 安装插件

将插件目录复制到主项目的 `Plugin/` 下即可：

```bash
# 克隆插件仓库
git clone https://github.com/FuHesummer/VCPtoolbox-Junior-Plugins.git plugins-repo

# 安装你需要的插件
cp -r plugins-repo/EmojiListGenerator /path/to/VCPtoolbox-Junior/Plugin/

# 重启服务，插件自动发现
```

---

## 插件列表

### AI 协作

| 插件 | 类型 | 说明 |
|------|------|------|
| AgentAssistant | hybridservice | Agent 团队协作，支持即时/定时/异步委托模式 |
| AgentDream | hybridservice | Agent 梦境系统（回顾记忆、联想式沉浸梦境） |
| AgentMessage | synchronous | 通过 WebSocket 向用户前端推送格式化消息 |
| MagiAgent | hybridservice | EVA 三贤人会议系统，多角度讨论复杂问题 |
| VCPTaskAssistant | hybridservice | 任务派发中心（定时/一次性/论坛巡航） |

### 图像/视频生成

| 插件 | 类型 | 说明 |
|------|------|------|
| GeminiImageGen | synchronous | Google Gemini 图像生成与编辑 |
| ComfyCloudGen | synchronous | Comfy Cloud 云端生成，支持 895+ 模型 |
| ComfyUIGen | synchronous | 本地 ComfyUI 工作流图像生成 |
| NovelAIGen | synchronous | NovelAI 动漫风格图片生成 |
| GrokVideo | synchronous | Grok 视频生成（文生视频/图生视频/续写/拼接） |
| VideoGenerator | asynchronous | Wan2.1 文本/图像到视频生成 |
| SunoGen | synchronous | Suno AI 原创音乐生成 |

### 搜索

| 插件 | 类型 | 说明 |
|------|------|------|
| GoogleSearch | synchronous | Google Custom Search API |
| TavilySearch | synchronous | Tavily 高级网络搜索 |
| SerpSearch | synchronous | SerpApi 多搜索引擎（Bing/DuckDuckGo/Scholar） |
| VSearch | synchronous | 语义级并发深度搜索 |
| FlashDeepSearch | synchronous | 多维度跨领域深度研究报告生成 |

### 文件/系统

| 插件 | 类型 | 说明 |
|------|------|------|
| FileOperator | synchronous | 文件系统多操作（读/写/移/删） |
| PowerShellExecutor | synchronous | PowerShell 命令执行（阻塞/后台） |
| LinuxShellExecutor | synchronous | Linux Shell 六层安全执行器 |
| VCPEverything | synchronous | Everything 毫秒级文件搜索 |
| ProjectAnalyst | synchronous | 项目文件夹分析报告生成 |
| FileServer | service | 受密码保护的文件服务 |
| ImageServer | service | 受密码保护的图片服务 |

### 浏览器/网页

| 插件 | 类型 | 说明 |
|------|------|------|
| ChromeBridge | hybridservice | Chrome 浏览器实时观察与控制 |
| UrlFetch | synchronous | 通用 URL 内容获取（文本/截图） |
| BilibiliFetch | synchronous | B站视频内容获取（字幕/弹幕/评论/截图） |
| XiaohongshuFetch | synchronous | 小红书笔记爬虫 |
| DeepWikiVCP | synchronous | DeepWiki 内容抓取转 Markdown |

### 论坛

| 插件 | 类型 | 说明 |
|------|------|------|
| VCPForum | synchronous | 本地论坛发帖/回帖 |
| VCPForumOnline | synchronous | 在线论坛完整操作（浏览/发帖/点赞/搜索/私信） |
| VCPForumOnlinePatrol | static | 定时论坛巡航（自动回复/发帖） |
| VCPForumLister | static | 论坛热门帖子列表生成 |

### 多媒体

| 插件 | 类型 | 说明 |
|------|------|------|
| ImageProcessor | messagePreprocessor | 多模态数据提取（图像/音频/视频） |
| CapturePreprocessor | messagePreprocessor | 屏幕/窗口截图预处理 |
| PyCameraCapture | synchronous | Python 摄像头捕获 |
| PyScreenshot | synchronous | Python 桌面截图 |
| MIDITranslator | hybridservice | MIDI 文件解析与生成 |

### 知识/学术

| 插件 | 类型 | 说明 |
|------|------|------|
| PaperReader | synchronous | 超文本递归阅读器（PDF 深度阅读/证据追溯） |
| ArxivDailyPapers | static | Arxiv 每日论文推送 |
| PubMedSearch | synchronous | PubMed 文献检索与分析 |
| KEGGSearch | synchronous | KEGG 生物数据库查询 |
| NCBIDatasets | synchronous | NCBI 基因组/基因数据检索 |

### 工具

| 插件 | 类型 | 说明 |
|------|------|------|
| SciCalculator | synchronous | 科学计算器 |
| Randomness | synchronous | 随机事件生成（抽牌/掷骰/牌堆管理） |
| TarotDivination | synchronous | 塔罗牌占卜 |
| JapaneseHelper | synchronous | 日语学习助手（语法解析/句型识别） |
| EmojiListGenerator | static | 表情包列表生成器 |
| ThoughtClusterManager | synchronous | 思维链文件管理（元自学习） |

### 系统服务

| 插件 | 类型 | 说明 |
|------|------|------|
| DailyHot | static | 全平台今日热榜 |
| WeatherReporter | static | 天气预报（注入 {{VCPWeatherInfo}}） |
| WeatherInfoNow | static | 实时天气简报 |
| ScheduleManager | synchronous | 用户日程管理 |
| ScheduleBriefing | static | 日程自动简报 |
| WorkspaceInjector | messagePreprocessor | 工作区目录树动态注入 |

### 桥接/集成

| 插件 | 类型 | 说明 |
|------|------|------|
| SnowBridge | hybridservice | Snow CLI 工具桥接 |
| VCPToolBridge | hybridservice | VCP 工具向外部系统导出 |
| MCPO | synchronous | MCP 工具桥接（自动发现/调用） |
| MCPOMonitor | static | MCP 服务状态监控 |
| VCPTavern | hybridservice | 上下文注入器（类 SillyTavern） |
| TencentCOSBackup | synchronous | 腾讯云 COS 备份 |

---

## 插件开发指南

### 目录结构

```
Plugin/MyPlugin/
├── plugin-manifest.json          # 插件契约（必需）
├── package.json                  # npm 依赖声明（有第三方依赖时必需）
├── <entry-script>.js             # 入口文件（必需）
├── config.env                    # 运行时配置（可选，插件专属）
├── config.env.example            # 配置模板（推荐）
├── README.md                     # 插件说明（推荐）
├── admin/                        # 自定义管理界面（可选）
│   └── index.html
└── ...                           # 其他插件文件
```

### 依赖管理（package.json）

**规则：插件使用了任何第三方 npm 包（axios / cheerio / uuid 等），必须在插件目录下创建 `package.json` 声明依赖。**

插件加载器在 `require()` 入口脚本前会自动检测：如果存在 `package.json` 但没有 `node_modules/`，会自动执行 `npm install --production`。插件商店安装/更新时也会自动触发。

**示例**：

```json
{
  "name": "vcptoolbox-plugin-myplugin",
  "private": true,
  "dependencies": {
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  }
}
```

**要点**：
- `"private": true` 防止意外发布到 npm
- 只声明插件**直接使用**的包，不列出 Node.js 内置模块（fs、path、crypto 等）
- 版本号使用 `^` 前缀，允许小版本更新
- **不要提交 `node_modules/`**（已在 `.gitignore`）
- 只用内置模块时**不需要**创建 `package.json`

**为什么必须这样做**：VCPtoolbox-Junior 支持多种打包模式（SEA 单可执行文件 / Docker），核心代码会被 esbuild 打包成单个 bundle，插件运行时动态加载无法访问 bundle 内部的包。只有声明在插件自身 `package.json` 的依赖才能正确解析。

### 配置管理（config.env）

**规则：插件专属配置（业务参数）放在插件目录的 `config.env`，不污染根 `config.env`。基础配置（API_KEY / 向量模型 / PORT）由根 `config.env` 通过 `process.env` 自动注入，插件代码直接读取即可。**

**配置优先级**：
1. 插件目录 `config.env`（Plugin 级，最高）
2. 根目录 `config.env`（全局级，通过 `process.env`）
3. manifest `defaults` / `configSchema.default`（兜底）

**发布规范**：
- 只提交 `config.env.example` 作为模板
- **不要**提交 `config.env`（含用户私有值，已在 `.gitignore`）
- 示例里不要硬编码密钥 / token

### Manifest 规范

`plugin-manifest.json` 是插件的契约文件，决定了加载行为：

```json
{
  "name": "MyPlugin",
  "displayName": "我的插件",
  "version": "1.0.0",
  "description": "插件功能描述",
  "author": "YourName",
  "pluginType": "synchronous",
  "entryPoint": {
    "type": "nodejs",
    "command": "node my-plugin.js"
  },
  "communication": {
    "protocol": "stdio",
    "timeout": 10000
  },
  "configSchema": {
    "API_KEY": {
      "type": "string",
      "description": "你的 API 密钥"
    }
  },
  "capabilities": {
    "systemPromptPlaceholders": [],
    "invocationCommands": [
      {
        "command": "MyCommand",
        "commandIdentifier": "MyCommand",
        "description": "AI 调用此命令时的说明"
      }
    ]
  }
}
```

### 插件类型

| 类型 | 执行时机 | 典型用途 | 通信方式 |
|------|----------|----------|----------|
| `static` | 启动时执行一次 | 注入系统提示词占位符 | 占位符替换 |
| `messagePreprocessor` | 每次请求前 | RAG 注入、消息修改 | direct (JS require) |
| `synchronous` | 工具调用时 | 同步工具操作 | stdio (JSON) |
| `asynchronous` | 工具调用时 | 不阻塞的后台操作 | stdio (JSON) |
| `service` | 后台常驻 | WebSocket 推送、定时任务 | direct (JS require) |
| `hybridservice` | 常驻 + 预处理 | RAG + 服务混合 | direct (JS require) |

### 通信协议

#### stdio（子进程通信）

适用于 `synchronous` / `asynchronous` 类型。插件以子进程方式运行，通过 stdin/stdout 交换 JSON：

**输入**（stdin 接收 JSON）：
```json
{
  "command": "MyCommand",
  "args": { "key": "value" },
  "context": { "projectBasePath": "/path/to/project" }
}
```

**输出**（stdout 返回 JSON）：
```json
{
  "status": "success",
  "message": "操作完成",
  "data": {}
}
```

#### direct（JS 模块直接加载）

适用于 `service` / `hybridservice` / `messagePreprocessor` 类型。插件导出一个类：

```javascript
class MyPlugin {
    constructor() {}

    /**
     * 初始化（service/hybridservice 启动时调用）
     */
    async initialize(config, dependencies) {
        // config: 合并后的配置
        // dependencies: { vectorDBManager, pluginManager, ... }
    }

    /**
     * 消息预处理（messagePreprocessor/hybridservice）
     * @param {Array} messages - 当前会话消息数组
     * @param {Object} pluginConfig - 插件配置
     * @returns {Array} 处理后的消息数组
     */
    async processMessages(messages, pluginConfig) {
        // 修改 messages 并返回
        return messages;
    }

    /**
     * 关闭（热重载/停止时调用）
     */
    shutdown() {}
}

module.exports = MyPlugin;
```

### configSchema

在 manifest 中声明配置项，AdminPanel 会**自动生成配置表单**，无需编写任何前端代码：

```json
{
  "configSchema": {
    "API_KEY": {
      "type": "string",
      "description": "API 密钥",
      "default": ""
    },
    "ENABLED": {
      "type": "boolean",
      "description": "是否启用",
      "default": true
    },
    "MAX_RETRIES": {
      "type": "number",
      "description": "最大重试次数",
      "default": 3
    }
  }
}
```

支持的类型和对应表单控件：

| type | 控件 | 说明 |
|------|------|------|
| `string` | 文本输入框 | key 名含 `api`/`key`/`secret` 时自动识别为敏感字段 |
| `number` | 数字输入框 | 支持小数 |
| `integer` | 数字输入框 | 整数步进 |
| `boolean` | toggle 开关 | true/false |

配置值存储在插件目录下的 `config.env` 文件中（key=value 格式）。

### 管理界面（两种模式）

#### 模式一：自动生成（推荐）

只要声明了 `configSchema`，AdminPanel 会自动为你渲染配置管理页面，支持：
- 按 schema 类型渲染输入控件
- 保存配置并自动热重载插件
- 一键恢复默认值

**无需创建任何额外文件，声明 configSchema 即可。**

#### 模式二：自定义管理页面

如果需要超出配置表单的复杂 UI（数据展示、图表、操作按钮等），在目录下放置 `admin/index.html` **覆盖**自动表单：

```
Plugin/MyPlugin/
└── admin/
    └── index.html
```

**优先级**：自定义 `admin/index.html` > 自动生成 configSchema 表单

**页面模板**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>MyPlugin 设置</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            padding: 24px;
            margin: 0;
        }
        .btn {
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
        .btn:hover { background: #0284c7; }
        .status.ok { color: #22c55e; }
        .status.err { color: #ef4444; }
    </style>
</head>
<body>
    <h2>MyPlugin 高级设置</h2>
    <div id="app"></div>

    <script>
        const API = '/admin_api';
        const PLUGIN_NAME = 'MyPlugin';

        async function loadConfig() {
            // 推荐：结构化配置 API
            const res = await fetch(`${API}/plugins/${PLUGIN_NAME}/config-schema`);
            const data = await res.json();
            // data.fields = { key: { type, description, default, value } }
        }

        async function saveConfig(values) {
            await fetch(`${API}/plugins/${PLUGIN_NAME}/config-values`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ values }) // { key: value, ... }
            });
        }

        loadConfig();
    </script>
</body>
</html>
```

**设计规范**：
- 背景色：`#0f172a`（深色）/ `#1e293b`（次深色）
- 文字色：`#f8fafc`（主文字）/ `#94a3b8`（次要文字）
- 强调色：`#0ea5e9`（蓝色）
- 页面运行在 iframe 内（约 80vw × 75vh），不要使用 `window.location` 导航

**可用 API**：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin_api/plugins` | GET | 获取所有插件列表及配置 |
| `/admin_api/plugins/:name/config-schema` | GET | 获取 configSchema + 当前值（结构化）|
| `/admin_api/plugins/:name/config-values` | POST | 保存结构化配置（自动合并 + 热重载）|
| `/admin_api/plugins/:name/config` | POST | 保存 config.env 原始文本（向后兼容）|
| `/admin_api/plugins/:name/admin-assets/:file` | GET | 加载管理页面静态资源 |

### 系统提示词占位符

`static` 类型插件可以通过 `systemPromptPlaceholders` 声明占位符，运行时会被替换为插件输出的内容：

```json
{
  "pluginType": "static",
  "capabilities": {
    "systemPromptPlaceholders": ["{{VCPMyData}}"]
  }
}
```

### 工具调用协议

VCP 使用中文分隔符格式进行工具调用（非 OpenAI function-calling）：

```
<<<[TOOL_REQUEST]>>>
「始」CommandName
参数内容
「末」
<<<[/TOOL_REQUEST]>>>
```

在 manifest 的 `invocationCommands` 中声明命令，AI 会按此格式调用。

### 启用与禁用

- `plugin-manifest.json` 存在 → 插件启用
- 重命名为 `plugin-manifest.json.block` → 插件禁用
- AdminPanel 提供一键切换按钮

### AdminPanel UI 扩展（dashboardCards / adminNav）

Junior 的 AdminPanel 支持插件在两处注入 UI：**仪表盘卡片** 和 **侧边栏独立页面**。相比原有的 `admin/index.html`（弹窗 iframe 模式），这两种方式让插件更深度集成进管理面板。

#### dashboardCards — 仪表盘卡片

manifest 中声明数组，每项描述一张首页仪表盘卡片：

```json
{
  "dashboardCards": [
    {
      "id": "dailyhot-summary",
      "title": "今日热榜",
      "icon": "trending_up",
      "source": "dashboard-card.html",
      "width": "1x"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 卡片唯一标识 |
| `title` | string | 卡片标题 |
| `icon` | string | Material Symbols 图标（可选，默认 `extension`）|
| `source` | string | HTML 片段文件，**相对 `admin/` 目录** |
| `width` | string | `"1x"` / `"2x"`（占 1 列或 2 列）|

**加载方式**：AdminPanel 仪表盘扫描启用插件的 `dashboardCards` → 拉取 `admin/<source>` HTML 片段 → 内联嵌入仪表盘网格。片段里的 JS 跑在主页面 context，可直接调用 `/admin_api`。

**文件要求**：`source` 是 HTML 片段（不是完整 `<html>` 文档），写法参考：

```html
<!-- Plugin/DailyHot/admin/dashboard-card.html 片段示例 -->
<div class="card-content">
  <h3 id="dh-title">加载中…</h3>
  <ul id="dh-list"></ul>
</div>
<script>
  (async () => {
    const r = await fetch('/admin_api/plugins/DailyHot/status');
    const data = await r.json();
    // …渲染到片段内的 DOM
  })();
</script>
```

#### adminNav — 侧边栏独立页面

manifest 声明 `adminNav` 对象，把插件的 `admin/index.html` 提升为 AdminPanel **一级侧边栏导航项**（而不是默认的"插件管理"里点"管理"弹 iframe）：

```json
{
  "adminNav": {
    "title": "每日热榜",
    "icon": "trending_up"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 侧边栏导航标题 |
| `icon` | string | Material Symbols 图标 |

**前提**：插件必须有 `admin/index.html`。

**加载方式**：点击导航时拉取 `admin/index.html`，提取 `<body>` 内容 **内联**到一个 `<section>` 容器（**不用 iframe**）。因此：
- 可以用主面板的 CSS 变量、字体、工具函数
- 不受 iframe 尺寸约束（全屏显示）
- JS 共享主页面 context，注意变量命名避免冲突

#### admin/index.html 两种渲染模式对比

同一个 `admin/index.html` 根据 manifest 配置会被 AdminPanel 用两种方式加载：

| 维度 | 弹窗模式（默认 / 回退） | 内联模式（`adminNav` 开启） |
|------|------------------------|----------------------------|
| 触发 | 未声明 `adminNav`，或用户关闭该开关 | 声明 `adminNav` 且用户开关启用 |
| 入口 | "插件管理"卡片的"管理"按钮 | 侧边栏独立导航项 |
| 渲染 | `<iframe src="/admin_api/plugins/<name>/admin-page">` | `fetch → 提取 <body> → 注入 <section>` |
| DOM | 完全隔离 | 共享主面板 context |
| 可用 API | 同源 fetch + postMessage | 主面板全部工具（`apiFetch`、`showMessage`、主面板的 CSS 变量）|
| 尺寸 | 模态框约 80vw × 75vh | 全屏 section，不受限 |
| 适用 | 独立工具 / 表单 / 编辑器 | 高嵌入度的管理页面 |

**兼容两种模式的写法**：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* 内联模式下样式会注入主页面，用唯一前缀避免全局污染 */
        .my-plugin-root { /* ... */ }
        .my-plugin-root .btn { /* ... */ }
    </style>
</head>
<body>
    <!-- 内联模式只提取 body 内容，所以 DOM 都放这里 -->
    <div class="my-plugin-root">
        <!-- 内容 -->
    </div>
    <script>
        // 用 IIFE 隔离，避免全局变量冲突
        (function() {
            // 两种模式下相对路径 /admin_api 都能正常工作
            fetch('/admin_api/plugins/MyPlugin/config-schema')
                .then(r => r.json())
                .then(data => { /* ... */ });
        })();
    </script>
</body>
</html>
```

**常见坑**：
- 不要 `window.myVar = ...`（内联模式下会污染主面板）
- 不要 `document.body.innerHTML = ...`（内联模式下会清空整个面板）
- 不要假设脚本在 iframe 里运行（用 try/catch 保护 DOM 操作）

#### admin/ 目录约定

```
Plugin/MyPlugin/
└── admin/
    ├── index.html            # adminNav 对应的页面 / 默认管理弹窗
    ├── dashboard-card.html   # dashboardCards 的 source 文件
    ├── style.css             # 可选静态资源
    └── app.js                # 可选 JS
```

所有 `admin/` 下的文件都通过 `/admin_api/plugins/<name>/admin-assets/<file>` 访问（有路径穿越保护）。

#### 用户侧开关

AdminPanel "插件管理" 页面为每个插件提供了 **dashboardCards / adminNav 独立开关**，用户可以按需关闭（不需要禁用整个插件）。偏好保存到项目根目录 `plugin-ui-prefs.json`：

```json
{
  "DailyHot": { "dashboardCards": true, "adminNav": true },
  "RAGDiaryPlugin": { "dashboardCards": false }
}
```

未设置时默认启用。

### 插件间依赖（requires）

当某插件在代码层依赖**另一个插件**的内部模块（如 `require('../../OtherPlugin/xxx.js')`）时，必须在 manifest 声明 `requires`：

```json
{
  "name": "LinuxLogMonitor",
  "displayName": "Linux 日志监控",
  "pluginType": "asynchronous",
  "requires": ["LinuxShellExecutor"]
}
```

**语义**：
- 数组元素是被依赖插件的 `name`（目录名）
- 插件商店**安装本插件前**会查询 `requires` 中的插件是否已安装
- 若有未安装项，商店前端**弹出确认对话框**列出待连锁安装的插件
- 用户确认 → **按依赖优先顺序**串行安装（先装依赖再装本插件）
- 用户拒绝 → 取消安装

**约束**：
- 只做**一层依赖**解析（不递归传递依赖）
- 被依赖的插件必须存在于本商店仓库；不存在时前端会报错并阻塞安装
- 卸载本插件**不会自动卸载**依赖插件（避免误杀其他插件用到的共享插件）
- 这是**安装时依赖**，不同于运行时的依赖注入（后者走 PluginManager 的 `dependencies` 参数）

**何时使用**：
- 插件 A 的代码 `require('../../PluginB/xxx')` 复用 PluginB 的工具模块
- 插件 A 需要 PluginB 的 service 已在后台运行才能工作

**何时不需要**：
- 仅通过 VCP 工具协议（`<<<[TOOL_REQUEST]>>>`）调用另一个插件 —— 运行时解耦，不算依赖
- 仅读取根项目模块（如 `KnowledgeBaseManager`） —— 基础设施，不算插件依赖

### 配置迁移（config-migrations.json）

插件版本升级时若配置项（`configSchema`）发生变更（重命名、新增、移除），需要在插件目录放置 `config-migrations.json` 声明文件，**插件商店执行更新时**会按声明自动迁移用户现有的 `config.env`，避免老用户升级后配置失效。

**文件格式**（按版本号为键）：

```json
{
  "2.0.0": {
    "renames": { "OLD_KEY": "NEW_KEY" },
    "added": { "NEW_VAR": "default_value" },
    "removed": ["DEPRECATED_VAR"]
  },
  "2.1.0": {
    "added": { "ENABLE_CACHE": "true" }
  }
}
```

**迁移字段语义**：

| 字段 | 作用 | 保留用户值 |
|------|------|-----------|
| `renames` | key 重命名 | ✓ 保留原 value 到新 key |
| `added` | 新增 key | 使用声明的默认值 |
| `removed` | 删除废弃的 key | 直接丢弃 |

**执行顺序**：系统按版本号**从旧到新依次执行**迁移动作。用户从 v1.0.0 升级到 v2.1.0 时，会顺序应用 `2.0.0` 和 `2.1.0` 的迁移。

**发布规范**：
- 不需要迁移的版本不用写进来
- 只在**有配置变更时**才需要此文件
- 与 `configSchema` 保持同步：`configSchema` 中删除的 key 必须在 `removed` 里声明

### 多运行时支持

| 运行时 | entryPoint 配置 |
|--------|----------------|
| Node.js | `{ "type": "nodejs", "command": "node xxx.js" }` |
| Python | `{ "type": "python", "command": "python xxx.py" }` |
| Binary | `{ "type": "binary", "command": "./xxx" }` |

Python 插件示例：
```json
{
  "entryPoint": {
    "type": "python",
    "command": "python my_plugin.py"
  },
  "communication": {
    "protocol": "stdio",
    "timeout": 30000
  }
}
```

---

## 贡献插件

1. Fork 本仓库
2. 创建插件目录 `YourPlugin/`
3. 编写 `plugin-manifest.json` + 入口文件 + README.md
4. 提交 PR

**要求**：
- manifest 字段完整（name, displayName, version, description, pluginType, entryPoint）
- 包含 README.md 说明用途和配置方法
- 不包含密钥、token 等敏感信息
- config.env 只放 `.example` 文件

---

## 协议

MIT License — 与主项目一致

---

## Contributors

| 贡献者 | 角色 |
|--------|------|
| [FuHe](https://github.com/FuHesummer) | 项目发起 / 架构设计 |
| 辉宝 | 项目命名 (VCPtoolbox-Junior) |
