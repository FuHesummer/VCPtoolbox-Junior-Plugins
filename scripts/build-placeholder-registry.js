#!/usr/bin/env node
/**
 * build-placeholder-registry.js
 *
 * 扫描插件仓库所有 plugin-manifest.json，生成 placeholder-registry.json
 *
 * 用途：AdminPanel（VCPtoolbox-Junior-Panel）的 PromptEditor 查询此 registry，
 * 识别「未安装插件提供的占位符」，给用户友好提示 + 一键安装修复。
 *
 * 数据来源：
 *   1. manifest.capabilities.systemPromptPlaceholders — 插件手工声明
 *   2. manifest.capabilities.invocationCommands — 自动推断 VCP<manifest.name>
 *   3. 特殊 pattern 规则（EmojiListGenerator / TimelineOrganizer 等动态命名场景）
 *
 * 运行：node scripts/build-placeholder-registry.js
 * 输出：placeholder-registry.json（仓库根目录）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['scripts', 'node_modules', 'docs', '.git', '.github']);

function inferCategory(m) {
  const name = (m.name || '').toLowerCase();
  const type = m.pluginType;
  if (type === 'static') return 'data-provider';
  if (type === 'service' || type === 'hybridservice') return 'service';
  if (/image|gen|draw|flux|doubao|zimage|comfy|novelai|gemini/i.test(name)) return 'image-generation';
  if (/video|suno|music/i.test(name)) return 'media-generation';
  if (/search|fetch|crawl|wiki|serp|tavily|kegg|arxiv|pubmed|ncbi/i.test(name)) return 'information-retrieval';
  if (/weather|dailyhot|hot/i.test(name)) return 'data-source';
  if (/shell|executor|file|cos|backup|operator|everything/i.test(name)) return 'system-integration';
  if (/agent|message|assistant|dream|task/i.test(name)) return 'agent-collab';
  if (/forum|bilibili|xiaohongshu/i.test(name)) return 'social';
  if (/tarot|random|calc|japanese|helper/i.test(name)) return 'utility';
  if (/chrome|bridge|capture|screenshot/i.test(name)) return 'browser';
  return 'tool';
}

function inferIcon(category) {
  return {
    'data-provider': 'database',
    'service': 'cloud_sync',
    'image-generation': 'image',
    'media-generation': 'video_camera_front',
    'information-retrieval': 'search',
    'data-source': 'rss_feed',
    'system-integration': 'terminal',
    'agent-collab': 'smart_toy',
    'social': 'forum',
    'utility': 'build',
    'browser': 'web',
    'tool': 'extension',
  }[category] || 'extension';
}

function main() {
  const plugins = {};

  const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !EXCLUDE_DIRS.has(d.name));

  for (const d of dirs) {
    // 优先 plugin-manifest.json，没有则 fallback 到 .block（仓库里默认禁用但可装的插件）
    const enabledPath = path.join(ROOT, d.name, 'plugin-manifest.json');
    const blockedPath = path.join(ROOT, d.name, 'plugin-manifest.json.block');
    let manifestPath = null;
    let disabledByDefault = false;
    if (fs.existsSync(enabledPath)) {
      manifestPath = enabledPath;
    } else if (fs.existsSync(blockedPath)) {
      manifestPath = blockedPath;
      disabledByDefault = true;
    } else {
      continue;
    }

    let m;
    try {
      m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch (e) {
      console.warn(`[skip] ${d.name}: manifest JSON 解析失败 — ${e.message}`);
      continue;
    }

    if (!m.name) {
      console.warn(`[skip] ${d.name}: manifest 缺 name 字段`);
      continue;
    }

    const category = inferCategory(m);
    const entry = {
      displayName: m.displayName || m.name,
      description: (m.description || '').trim(),
      pluginType: m.pluginType || 'unknown',
      category,
      icon: inferIcon(category),
      directoryName: d.name,
      version: m.version || null,
      disabledByDefault,
      placeholders: [],
    };

    // 1. manifest.capabilities.systemPromptPlaceholders — 手工声明
    const sp = (m.capabilities && m.capabilities.systemPromptPlaceholders) || [];
    for (const ph of sp) {
      if (!ph.placeholder) continue;
      const name = String(ph.placeholder).replace(/^\{\{|\}\}$/g, '').trim();
      if (!name) continue;
      entry.placeholders.push({
        name,
        kind: 'static-placeholder',
        description: ph.description || '',
        source: 'manifest.systemPromptPlaceholders',
      });
    }

    // 2. invocationCommands → 自动推断 VCP<manifest.name>
    const cmds = (m.capabilities && m.capabilities.invocationCommands) || [];
    const describedCmds = cmds.filter(c => c && c.description);
    if (describedCmds.length > 0) {
      entry.placeholders.push({
        name: `VCP${m.name}`,
        kind: 'tool-description',
        description: `${entry.displayName} 的工具调用描述（${describedCmds.length} 个命令自动聚合）`,
        source: 'auto:invocationCommands',
        commandCount: describedCmds.length,
        commands: describedCmds.map(c => c.command || '').filter(Boolean).slice(0, 5),
      });
    }

    // 3. manifest.capabilities.tvsVariables — TVS 工具指南协议（v2.1+）
    // 字段名：key（Var<XXX>）+ file（tvs/xxx.txt）+ description
    const tvs = (m.capabilities && m.capabilities.tvsVariables) || [];
    for (const v of tvs) {
      const varKey = v.key || v.varName;
      if (!varKey) continue;
      entry.placeholders.push({
        name: varKey,
        kind: 'tvs-variable',
        description: v.description || `${entry.displayName} 的 TVS 工具指南（tvs/${v.file || '?'}）`,
        source: 'manifest.tvsVariables',
        tvsFile: v.file || null,
      });
    }

    // 只收集有占位符的插件（对前端有意义）
    if (entry.placeholders.length > 0) {
      plugins[m.name] = entry;
    }
  }

  // 特殊 pattern 规则：动态命名占位符不能直接列举，走正则匹配
  const patternRules = [
    {
      pattern: '^.+表情包$',
      flags: '',
      plugin: 'EmojiListGenerator',
      displayName: '表情包清单生成器',
      kind: 'emoji-list',
      description: '{{XXX表情包}} 形式的占位符来自 EmojiListGenerator —— 扫描 image/XXX表情包/ 目录生成图片 URL 清单。需先装此插件并在图床放表情包图片。',
      icon: 'emoji_emotions',
      category: 'data-provider',
    },
    {
      pattern: '^VarTimeline[A-Za-z\\u4e00-\\u9fa5]+$',
      flags: '',
      plugin: 'TimelineOrganizer',
      displayName: 'Agent 时间线编辑器',
      kind: 'agent-timeline',
      description: '{{VarTimelineXxx}}（Xxx 为 Agent 名）来自 TimelineOrganizer —— 编辑 Agent 生平时间线并一键生成 TVStxt/TimelineXxx.txt。Junior 核心插件，默认已装。',
      icon: 'timeline',
      category: 'agent-collab',
      isCorePlugin: true,
    },
  ];

  const stats = {
    pluginCount: Object.keys(plugins).length,
    placeholderCount: Object.values(plugins).reduce((a, p) => a + p.placeholders.length, 0),
    patternRuleCount: patternRules.length,
    totalScannedDirs: dirs.length,
  };

  const output = {
    '$schema': './docs/placeholder-registry-schema.json',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    generator: 'scripts/build-placeholder-registry.js',
    description: 'VCPtoolbox-Junior-Plugins 占位符注册表 — AdminPanel PromptEditor 查询此文件识别未装插件提供的占位符，给用户友好提示「此变量来自 XXX 插件」+ 一键安装',
    stats,
    plugins,
    patternRules,
  };

  const outPath = path.join(ROOT, 'placeholder-registry.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');

  console.log('✅ 生成 placeholder-registry.json');
  console.log(`   扫描目录: ${stats.totalScannedDirs}`);
  console.log(`   收录插件: ${stats.pluginCount}`);
  console.log(`   占位符数: ${stats.placeholderCount}`);
  console.log(`   pattern 规则: ${stats.patternRuleCount}`);
}

main();
