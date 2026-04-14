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
├── <entry-script>.js             # 入口文件（必需）
├── config.env                    # 运行时配置（可选）
├── README.md                     # 插件说明（推荐）
├── admin/                        # 自定义管理界面（可选）
│   └── index.html
└── ...
```

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
