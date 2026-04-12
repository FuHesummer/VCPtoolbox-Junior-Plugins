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

| 插件 | 类型 | 说明 |
|------|------|------|
| *待添加* | - | - |

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

在 manifest 中声明配置项，AdminPanel 会自动为你生成配置表单：

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
    },
    "MODE": {
      "type": "string",
      "description": "运行模式",
      "default": "normal",
      "enum": ["normal", "debug", "silent"]
    }
  }
}
```

配置值存储在插件目录下的 `config.env` 文件中（key=value 格式）。

### 自定义管理界面

如果 config.env 表单不够用（需要列表编辑、可视化配置等），可以自带管理页面：

```
Plugin/MyPlugin/
└── admin/
    └── index.html
```

AdminPanel 会自动检测到这个目录，在插件配置页显示"高级设置"按钮，点击后弹窗加载你的页面。

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
            background: #1e293b;
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
    </style>
</head>
<body>
    <h2>MyPlugin 高级设置</h2>
    <div id="app"></div>

    <script>
        const API = '/admin_api';

        // 你可以调用后端 API
        async function loadConfig() {
            const res = await fetch(`${API}/plugins`);
            const plugins = await res.json();
            const myPlugin = plugins.find(p => p.manifest.name === 'MyPlugin');
            // ...
        }

        loadConfig();
    </script>
</body>
</html>
```

**可用 API**：
- `GET /admin_api/plugins` — 获取所有插件列表及配置
- `POST /admin_api/plugins/:name/config` — 保存插件 config.env
- `GET /admin_api/plugins/:name/admin-assets/:file` — 加载管理页面的静态资源

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
