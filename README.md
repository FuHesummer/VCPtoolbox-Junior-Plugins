# VCPtoolbox-Junior Plugins

> [VCPtoolbox-Junior](https://github.com/FuHesummer/VCPtoolbox-Junior) 可选插件集合

---

## 安装插件

**方式一：管理面板（推荐）**

打开 AdminPanel → 插件管理 → 插件商店 → 一键安装。

**方式二：手动安装**

```bash
# 克隆插件仓库
git clone https://github.com/FuHesummer/VCPtoolbox-Junior-Plugins.git plugins-repo

# 安装你需要的插件
cp -r plugins-repo/EmojiListGenerator /path/to/VCPtoolbox-Junior/Plugin/

# 如果插件有 package.json，安装依赖
cd /path/to/VCPtoolbox-Junior/Plugin/EmojiListGenerator
npm install --production

# 重启服务，插件自动发现
```

> **注意**：通过管理面板安装的插件会自动处理依赖安装，无需手动 `npm install`。

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
├── config.env.example            # 配置模板（推荐）
├── README.md                     # 插件说明（推荐）
├── admin/                        # 自定义管理界面（可选）
│   └── index.html
└── ...
```

### npm 依赖管理（重要）

**如果插件使用了任何第三方 npm 包（axios、cheerio、dayjs 等），必须在插件目录下创建 `package.json`。**

```json
{
  "name": "vcptoolbox-plugin-myplugin",
  "private": true,
  "dependencies": {
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  }
}
```

**要点：**
- `"private": true` 防止意外发布到 npm
- 只声明插件**直接使用**的第三方包
- Node.js 内置模块（fs, path, crypto 等）不需要列出
- **不要提交 `node_modules/` 目录**
- 管理面板安装插件时会自动执行 `npm install`
- 如果插件只用内置模块，不需要 package.json

**为什么必须这样做？** VCPToolBox 支持多种部署方式（SEA 单可执行文件、Docker 等），核心代码会被打包成 bundle。插件是运行时动态加载的，无法访问 bundle 内的包，必须通过 package.json 声明并安装到自己的 node_modules 中。

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

### 启用与禁用

- `plugin-manifest.json` 存在 → 插件启用
- 重命名为 `plugin-manifest.json.block` → 插件禁用
- AdminPanel 提供一键切换按钮

---

## 贡献插件

1. Fork 本仓库
2. 创建插件目录 `YourPlugin/`
3. 编写 `plugin-manifest.json` + 入口文件 + README.md
4. **如果用了第三方 npm 包，必须包含 `package.json`**
5. 提交 PR

**要求**：
- manifest 字段完整（name, displayName, version, description, pluginType, entryPoint）
- 包含 README.md 说明用途和配置方法
- 有第三方 npm 依赖时必须包含 `package.json`
- 不包含密钥、token 等敏感信息
- 不提交 `node_modules/` 目录
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
