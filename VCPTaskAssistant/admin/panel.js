// VCPTaskAssistant 管理面板（native 模式 · v3 · 可视化任务编辑器）
// 走解耦路径：/admin_api/plugins/VCPTaskAssistant/api/*
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[VCPTaskAssistant] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted } = P.Vue;
  const { showToast } = P;

  // style 每次覆盖（黄金规则 3）
  const styleId = 'task-assistant-style';
  const oldStyle = document.getElementById(styleId);
  if (oldStyle) oldStyle.remove();
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    .ta-page .ta-help { background: var(--card-bg); border: 1px solid var(--border-color); border-left: 4px solid var(--button-bg, #6366f1); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.7; color: var(--primary-text); }
    .ta-page .ta-help summary { cursor: pointer; font-weight: 600; color: var(--button-bg, #6366f1); list-style: none; display: flex; align-items: center; gap: 6px; user-select: none; }
    .ta-page .ta-help summary::-webkit-details-marker { display: none; }
    .ta-page .ta-help summary::before { content: '▶'; font-size: 0.7em; transition: transform 0.2s; }
    .ta-page .ta-help[open] summary::before { transform: rotate(90deg); }
    .ta-page .ta-help code { background: var(--background-color); padding: 1px 6px; border-radius: 3px; color: var(--primary-text); font-family: monospace; font-size: 0.85em; }
    .ta-page .ta-help h4 { margin: 12px 0 6px; font-size: 0.9rem; color: var(--primary-text); }
    .ta-page .ta-help ul { margin: 4px 0; padding-left: 20px; }
    .ta-page .ta-help li { margin: 3px 0; }

    .ta-page .ta-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .ta-page .ta-global-switch { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: var(--card-bg); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
    .ta-page .ta-global-switch:hover { transform: translateY(-1px); }
    .ta-page .ta-global-switch.on { background: rgba(34, 197, 94, 0.12); border-color: #22c55e; color: #16a34a; }
    .ta-page .ta-global-switch.off { color: var(--secondary-text); }
    .ta-page .ta-global-switch[disabled] { opacity: 0.5; cursor: not-allowed; }
    .ta-page .ta-info-bar { font-size: 0.8rem; color: var(--secondary-text); }

    .ta-page .ta-task-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
    .ta-page .ta-task-head { display: grid; grid-template-columns: 14px 1fr auto; gap: 14px; align-items: start; padding: 14px 16px; }
    .ta-page .ta-task-head.draft { background: var(--accent-bg, rgba(99, 102, 241, 0.06)); border-bottom: 1px solid var(--border-color); }
    .ta-page .ta-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--secondary-text); opacity: 0.3; margin-top: 6px; }
    .ta-page .ta-dot.active { background: #22c55e; opacity: 1; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
    .ta-page .ta-dot.paused { background: #f59e0b; opacity: 0.9; }
    .ta-page .ta-dot.running { background: #3b82f6; opacity: 1; animation: ta-pulse 1.2s ease-in-out infinite; }
    .ta-page .ta-dot.draft { background: var(--button-bg, #6366f1); opacity: 1; }
    @keyframes ta-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .ta-page .ta-task-info .ta-name { font-size: 0.95rem; font-weight: 600; color: var(--primary-text); margin-bottom: 4px; }
    .ta-page .ta-task-info .ta-type-badge { display: inline-block; font-size: 0.68rem; padding: 2px 7px; margin-left: 8px; border-radius: 10px; font-weight: 500; }
    .ta-page .ta-task-info .ta-type-badge.forum_patrol { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
    .ta-page .ta-task-info .ta-type-badge.custom_prompt { background: rgba(245, 158, 11, 0.12); color: #d97706; }
    .ta-page .ta-task-info .ta-meta { font-size: 0.78rem; color: var(--secondary-text); display: flex; gap: 14px; flex-wrap: wrap; margin-top: 3px; }
    .ta-page .ta-task-info .ta-meta code { background: var(--background-color); padding: 1px 6px; border-radius: 3px; font-family: monospace; font-size: 0.72rem; color: var(--primary-text); }
    .ta-page .ta-task-info .ta-runtime { font-size: 0.75rem; color: var(--secondary-text); margin-top: 6px; opacity: 0.9; }
    .ta-page .ta-task-info .ta-runtime.err { color: #ef4444; }
    .ta-page .ta-actions { display: flex; gap: 6px; align-items: flex-start; }

    /* 编辑表单 inline 展开 */
    .ta-page .ta-edit-form { border-top: 1px solid var(--border-color); padding: 16px; background: var(--background-color); display: flex; flex-direction: column; gap: 14px; }
    .ta-page .ta-edit-form.draft-form { border-top: none; background: var(--card-bg); padding: 20px; border: 2px dashed var(--button-bg, #6366f1); border-radius: 10px; margin-bottom: 14px; }
    .ta-page .ta-edit-form h3 { margin: 0 0 2px; font-size: 0.95rem; color: var(--primary-text); display: flex; align-items: center; gap: 8px; }
    .ta-page .ta-form-row { display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap; }
    .ta-page .ta-form-row > label { min-width: 100px; font-size: 0.82rem; color: var(--secondary-text); padding-top: 8px; display: flex; align-items: center; gap: 5px; }
    .ta-page .ta-form-row > label.ta-inline { min-width: auto; padding-top: 0; }
    .ta-page .ta-form-row .ta-field { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px; }
    .ta-page .ta-form-row input[type="text"], .ta-page .ta-form-row input[type="number"], .ta-page .ta-form-row input[type="datetime-local"], .ta-page .ta-form-row select { padding: 7px 10px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 5px; color: var(--primary-text); font-size: 0.85rem; font-family: inherit; }
    .ta-page .ta-form-row textarea { padding: 9px 11px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 5px; color: var(--primary-text); font-size: 0.83rem; font-family: 'JetBrains Mono', monospace; line-height: 1.55; resize: vertical; min-height: 100px; }
    .ta-page .ta-form-row .ta-hint { font-size: 0.73rem; color: var(--secondary-text); opacity: 0.85; }
    .ta-page .ta-form-row .ta-inline-group { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

    .ta-page .ta-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 8px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 5px; min-height: 36px; align-items: center; }
    .ta-page .ta-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px 3px 10px; background: var(--accent-bg, rgba(99, 102, 241, 0.1)); border-radius: 12px; font-size: 0.78rem; color: var(--button-bg, #6366f1); font-weight: 500; }
    .ta-page .ta-chip-x { background: transparent; border: none; color: currentColor; cursor: pointer; font-size: 1.1em; line-height: 1; padding: 0 2px; opacity: 0.6; }
    .ta-page .ta-chip-x:hover { opacity: 1; }
    .ta-page .ta-chip.random { background: rgba(245, 158, 11, 0.15); color: #d97706; }

    .ta-page .ta-agent-picker { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 6px; }
    .ta-page .ta-agent-picker select, .ta-page .ta-agent-picker input { flex: 1; min-width: 120px; padding: 6px 10px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 5px; color: var(--primary-text); font-size: 0.82rem; }

    .ta-page .ta-advanced { border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; background: var(--card-bg); }
    .ta-page .ta-advanced summary { cursor: pointer; font-size: 0.85rem; color: var(--secondary-text); font-weight: 500; list-style: none; display: flex; align-items: center; gap: 6px; }
    .ta-page .ta-advanced summary::-webkit-details-marker { display: none; }
    .ta-page .ta-advanced summary::before { content: '▶'; font-size: 0.7em; transition: transform 0.2s; }
    .ta-page .ta-advanced[open] summary::before { transform: rotate(90deg); }
    .ta-page .ta-advanced > div { padding-top: 12px; display: flex; flex-direction: column; gap: 12px; }

    .ta-page .ta-form-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; padding-top: 6px; border-top: 1px dashed var(--border-color); }
    .ta-page .ta-form-actions .ta-err { margin-right: auto; color: #ef4444; font-size: 0.82rem; }

    .ta-page .ta-empty-hint { padding: 16px 18px; background: var(--card-bg); border: 1px dashed var(--border-color); border-radius: 10px; color: var(--secondary-text); font-size: 0.85rem; line-height: 1.7; }

    .ta-page .ta-toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; vertical-align: -4px; }
    .ta-page .ta-toggle-switch input { opacity: 0; width: 0; height: 0; }
    .ta-page .ta-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--border-color); border-radius: 20px; transition: 0.2s; }
    .ta-page .ta-toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .ta-page .ta-toggle-switch input:checked + .ta-toggle-slider { background: #22c55e; }
    .ta-page .ta-toggle-switch input:checked + .ta-toggle-slider:before { transform: translateX(16px); }
  `;
  document.head.appendChild(styleEl);

  const API_BASE = '/admin_api/plugins/VCPTaskAssistant/api';
  const DRAFT_ID = '__NEW__';
  const DEFAULT_FORUM_PROMPT = '[论坛小助手:]现在是论坛时间~ 你可以选择分享一个感兴趣的话题/趣味性话题/亦或者分享一些互联网新鲜事/或者发起一个最近几天想要讨论的话题作为新帖子；或者单纯只是先阅读一些别人的你感兴趣帖子，然后做出你的回复(先读帖再回复是好习惯)~\n\n以下是完整的论坛帖子列表:\n{{forum_post_list}}';

  // ========== 时间格式转换 ==========
  function isoToLocal(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function localToIso(local) {
    if (!local) return null;
    const d = new Date(local);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // ========== Draft ↔ Task 序列化 ==========
  function createBlankDraft(type) {
    const t = type === 'custom_prompt' ? 'custom_prompt' : 'forum_patrol';
    return {
      id: null,
      name: t === 'custom_prompt' ? '新通用任务' : '新论坛巡航任务',
      type: t,
      enabled: true,
      schedule: { mode: 'interval', intervalMinutes: 60, runAt: null, cronValue: '', jitterSeconds: 0 },
      scheduleRunAtLocal: '',
      targets: { agents: [] },
      dispatch: { channel: 'AgentAssistant', temporaryContact: true, injectTools: ['VCPForum'], maid: 'VCP系统', taskDelegation: false },
      injectToolsText: 'VCPForum',
      payload: t === 'custom_prompt'
        ? { promptTemplate: '' }
        : { promptTemplate: DEFAULT_FORUM_PROMPT, includeForumPostList: true, forumListPlaceholder: '{{forum_post_list}}', maxPosts: 200 }
    };
  }

  function createDraftFromTask(task) {
    const sched = task.schedule || {};
    const disp = task.dispatch || {};
    const payload = task.payload || {};
    const injectTools = Array.isArray(disp.injectTools) ? disp.injectTools : [];
    return {
      id: task.id,
      name: task.name || '',
      type: task.type === 'custom_prompt' ? 'custom_prompt' : 'forum_patrol',
      enabled: task.enabled !== false,
      schedule: {
        mode: sched.mode || 'interval',
        intervalMinutes: Math.max(10, parseInt(sched.intervalMinutes, 10) || 60),
        runAt: sched.runAt || null,
        cronValue: sched.cronValue || '',
        jitterSeconds: parseInt(sched.jitterSeconds, 10) || 0
      },
      scheduleRunAtLocal: isoToLocal(sched.runAt),
      targets: { agents: Array.isArray(task.targets && task.targets.agents) ? [...task.targets.agents] : [] },
      dispatch: {
        channel: disp.channel || 'AgentAssistant',
        temporaryContact: disp.temporaryContact !== false,
        injectTools: [...injectTools],
        maid: disp.maid || 'VCP系统',
        taskDelegation: !!disp.taskDelegation
      },
      injectToolsText: injectTools.join(', '),
      payload: task.type === 'custom_prompt'
        ? { promptTemplate: payload.promptTemplate || '' }
        : {
            promptTemplate: payload.promptTemplate || DEFAULT_FORUM_PROMPT,
            includeForumPostList: payload.includeForumPostList !== false,
            forumListPlaceholder: payload.forumListPlaceholder || '{{forum_post_list}}',
            maxPosts: parseInt(payload.maxPosts, 10) || 200
          }
    };
  }

  function serializeDraft(draft) {
    const mode = draft.schedule.mode;
    const runAt = mode === 'once' ? localToIso(draft.scheduleRunAtLocal) : null;
    const cronValue = mode === 'cron' ? (draft.schedule.cronValue || '').trim() : null;
    const injectTools = String(draft.injectToolsText || '')
      .split(/[,，、\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const payload = draft.type === 'custom_prompt'
      ? { promptTemplate: String(draft.payload.promptTemplate || '') }
      : {
          promptTemplate: String(draft.payload.promptTemplate || ''),
          includeForumPostList: draft.payload.includeForumPostList !== false,
          forumListPlaceholder: String(draft.payload.forumListPlaceholder || '{{forum_post_list}}'),
          maxPosts: Math.max(1, parseInt(draft.payload.maxPosts, 10) || 200)
        };

    return {
      name: String(draft.name || '').trim(),
      type: draft.type,
      enabled: !!draft.enabled,
      schedule: {
        mode,
        intervalMinutes: Math.max(10, parseInt(draft.schedule.intervalMinutes, 10) || 60),
        runAt,
        cronValue,
        jitterSeconds: Math.max(0, parseInt(draft.schedule.jitterSeconds, 10) || 0)
      },
      targets: { agents: draft.targets.agents.filter(Boolean) },
      dispatch: {
        channel: draft.dispatch.channel || 'AgentAssistant',
        temporaryContact: draft.dispatch.temporaryContact !== false,
        injectTools,
        maid: draft.dispatch.maid || 'VCP系统',
        taskDelegation: !!draft.dispatch.taskDelegation
      },
      payload
    };
  }

  const TYPE_LABEL = { forum_patrol: '论坛巡航', custom_prompt: '通用提示词' };

  const TaskAssistantPage = {
    name: 'TaskAssistantPage',
    template: /* html */ `
      <div class="page ta-page">
        <PageHeader title="任务派发中心" subtitle="VCPTaskAssistant 定时任务配置 + 手动触发" icon="schedule">
          <template #actions>
            <button class="btn btn-ghost" @click="load" :disabled="loading">
              <span class="material-symbols-outlined">{{ loading ? 'hourglass_top' : 'refresh' }}</span>
              刷新
            </button>
            <button class="btn" @click="startNew" :disabled="!!draft">
              <span class="material-symbols-outlined">add</span>
              新建任务
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <details class="ta-help" open>
            <summary>这是什么？怎么用？</summary>
            <div style="margin-top: 8px;">
              <p style="margin: 0 0 8px;">
                <strong>任务派发中心</strong>：按你配置的时间表，自动向指定 Agent 派发提示词，让 Agent 自主执行。
                适合论坛定时巡航、日报推送、自动化触发等场景。
              </p>
              <h4>两种任务类型</h4>
              <ul>
                <li><strong>论坛巡航</strong> —— 预读取 VCP 论坛帖子列表，用
                  <code v-pre>{{forum_post_list}}</code> 占位符嵌入到提示词里送给 Agent，让它读帖回帖发帖</li>
                <li><strong>通用提示词</strong> —— 直接把你写的文本发给 Agent，不做论坛预读取</li>
              </ul>
              <h4>四种调度模式</h4>
              <ul>
                <li><strong>间隔执行</strong> —— 每 N 分钟跑一次（最少 10 分钟）</li>
                <li><strong>一次性</strong> —— 到指定时间跑一次，跑完自动禁用</li>
                <li><strong>手动触发</strong> —— 不自动跑，只能点"触发"按钮</li>
                <li><strong>Cron 表达式</strong> —— 标准 5 字段 cron（分 时 日 月 星期）</li>
              </ul>
              <h4>目标 Agent</h4>
              <ul>
                <li>可选多个 Agent，任务会向每个都派发一次</li>
                <li>支持 <code>randomN</code> 标签（如 <code>random3</code>）+ 多个候选 → 每次随机挑 N 个</li>
              </ul>
              <h4>注意</h4>
              <ul>
                <li>全局调度关闭时，所有定时任务都不会触发（手动"触发"按钮仍可用）</li>
                <li>任务首次保存后 id 不可改，只能改名字</li>
              </ul>
            </div>
          </details>

          <EmptyState v-if="loading && !loaded" icon="hourglass_top" message="加载任务配置..." />

          <div v-else-if="error" class="card" style="padding: 18px; color: var(--danger-text, #c0392b);">
            {{ error }}
            <div style="margin-top: 8px; font-size: 0.82rem; color: var(--secondary-text);">
              请确认 VCPTaskAssistant 插件已启用。数据文件位于
              <code>{{ dataFile || 'Plugin/VCPTaskAssistant/task-center-data.json' }}</code>。
            </div>
          </div>

          <template v-else>
            <div class="ta-toolbar">
              <button class="ta-global-switch" :class="globalEnabled ? 'on' : 'off'" @click="toggleGlobal" :disabled="togglingGlobal">
                <span class="material-symbols-outlined">{{ globalEnabled ? 'power' : 'power_off' }}</span>
                <span>全局调度：{{ globalEnabled ? '已启用' : '已停用' }}</span>
              </button>
              <div class="ta-info-bar">
                活跃定时器 <strong>{{ activeTimerCount }}</strong> · 共
                <strong>{{ tasks.length }}</strong> 任务（<strong>{{ activeCount }}</strong> 启用）
              </div>
            </div>

            <!-- 新建任务 draft 表单 -->
            <div v-if="draft && draft.id === null" class="ta-edit-form draft-form">
              <h3>
                <span class="ta-dot draft"></span>
                新建任务
              </h3>
              <task-edit-form
                :draft="draft"
                :available-agents="availableAgents"
                :saving="saving"
                :save-error="saveError"
                @save="saveTask"
                @cancel="cancelEdit"
              />
            </div>

            <div v-if="!draft && tasks.length === 0" class="ta-empty-hint">
              当前没有配置任何任务。点击右上角
              <strong>新建任务</strong> 开始配置嘛。
            </div>

            <article v-for="task in tasks" :key="task.id" class="ta-task-card">
              <div class="ta-task-head">
                <span class="ta-dot" :class="dotClass(task)"></span>
                <div class="ta-task-info">
                  <div class="ta-name">
                    {{ task.name || '未命名任务' }}
                    <span class="ta-type-badge" :class="task.type">{{ typeLabel(task.type) }}</span>
                  </div>
                  <div class="ta-meta">
                    <span><code>{{ scheduleLabel(task.schedule) }}</code></span>
                    <span>目标：{{ targetsLabel(task.targets) }}</span>
                    <span v-if="task.runtime && task.runtime.nextRunTime">下次：{{ humanTime(task.runtime.nextRunTime) }}</span>
                  </div>
                  <div v-if="task.runtime" class="ta-runtime" :class="task.runtime.lastError ? 'err' : ''">
                    <template v-if="task.runtime.running">
                      <span class="material-symbols-outlined" style="font-size: 0.95em; vertical-align: -2px;">play_circle</span>
                      运行中...
                    </template>
                    <template v-else-if="task.runtime.lastRunTime">
                      上次 {{ humanTime(task.runtime.lastRunTime) }} · {{ task.runtime.lastResult || '--' }}
                    </template>
                    <template v-else>
                      从未执行
                    </template>
                    <span v-if="task.runtime.runCount > 0" style="opacity: 0.75; margin-left: 10px;">
                      共 {{ task.runtime.runCount }} 次（成功 {{ task.runtime.successCount }} · 失败 {{ task.runtime.errorCount }}）
                    </span>
                  </div>
                </div>
                <div class="ta-actions">
                  <button class="btn btn-small" @click="trigger(task)" :disabled="busy[task.id] || (task.runtime && task.runtime.running)">
                    <span class="material-symbols-outlined" style="font-size: 1em;">bolt</span>
                    触发
                  </button>
                  <button class="btn btn-small btn-ghost" @click="toggle(task)" :disabled="busy[task.id]">
                    <span class="material-symbols-outlined" style="font-size: 1em;">{{ task.enabled ? 'pause' : 'play_arrow' }}</span>
                    {{ task.enabled ? '暂停' : '启用' }}
                  </button>
                  <button class="btn btn-small btn-ghost" @click="startEdit(task)" :disabled="isEditing(task.id)">
                    <span class="material-symbols-outlined" style="font-size: 1em;">edit</span>
                    {{ isEditing(task.id) ? '编辑中' : '编辑' }}
                  </button>
                </div>
              </div>

              <!-- inline 编辑表单 -->
              <div v-if="isEditing(task.id)" class="ta-edit-form">
                <task-edit-form
                  :draft="draft"
                  :available-agents="availableAgents"
                  :saving="saving"
                  :save-error="saveError"
                  @save="saveTask"
                  @cancel="cancelEdit"
                  @delete="deleteTask"
                />
              </div>
            </article>
          </template>
        </div>
      </div>
    `,
    components: {
      // 编辑表单子组件（声明在内部避免全局污染）
      'task-edit-form': {
        props: ['draft', 'availableAgents', 'saving', 'saveError'],
        emits: ['save', 'cancel', 'delete'],
        template: /* html */ `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="ta-form-row">
              <label>名称 *</label>
              <div class="ta-field">
                <input type="text" v-model="draft.name" placeholder="任务名称" />
              </div>
            </div>

            <div class="ta-form-row">
              <label>类型 *</label>
              <div class="ta-field">
                <select v-model="draft.type" @change="onTypeChange">
                  <option value="forum_patrol">论坛巡航（预读取论坛帖子列表）</option>
                  <option value="custom_prompt">通用提示词（直接发送自定义文本）</option>
                </select>
              </div>
            </div>

            <div class="ta-form-row">
              <label>调度 *</label>
              <div class="ta-field">
                <div class="ta-inline-group">
                  <select v-model="draft.schedule.mode" style="flex: 0 0 auto;">
                    <option value="interval">间隔执行</option>
                    <option value="once">一次性</option>
                    <option value="manual">手动触发</option>
                    <option value="cron">Cron 表达式</option>
                  </select>
                  <template v-if="draft.schedule.mode === 'interval'">
                    <span style="color: var(--secondary-text);">每</span>
                    <input type="number" min="10" v-model.number="draft.schedule.intervalMinutes" style="width: 80px;" />
                    <span style="color: var(--secondary-text);">分钟（最少 10）</span>
                  </template>
                  <template v-else-if="draft.schedule.mode === 'once'">
                    <input type="datetime-local" v-model="draft.scheduleRunAtLocal" />
                  </template>
                  <template v-else-if="draft.schedule.mode === 'cron'">
                    <input type="text" v-model="draft.schedule.cronValue" placeholder="0 */2 * * *" style="flex: 1; font-family: monospace;" />
                  </template>
                  <span v-else style="color: var(--secondary-text); font-size: 0.82rem;">
                    需手动点"触发"按钮执行
                  </span>
                </div>
                <div v-if="draft.schedule.mode === 'cron'" class="ta-hint">
                  示例：<code>*/30 * * * *</code> 每 30 分钟 · <code>0 9 * * 1-5</code> 工作日每天 9:00
                </div>
              </div>
            </div>

            <div class="ta-form-row" style="align-items: flex-start;">
              <label>目标 Agent *</label>
              <div class="ta-field">
                <div class="ta-chips">
                  <span v-if="draft.targets.agents.length === 0" style="color: var(--secondary-text); font-size: 0.78rem;">
                    还没选 Agent，从下方添加
                  </span>
                  <span v-for="(a, i) in draft.targets.agents" :key="i" class="ta-chip" :class="{ random: /^random\\d+$/i.test(a) }">
                    {{ a }}
                    <button class="ta-chip-x" @click="removeAgent(i)" type="button">×</button>
                  </span>
                </div>
                <div class="ta-agent-picker">
                  <select v-model="agentPickerValue" @change="addAgentFromPicker">
                    <option value="">从 Agent 管理选择...</option>
                    <option v-for="a in availableAgents" :key="a" :value="a" :disabled="draft.targets.agents.includes(a)">
                      {{ a }}
                    </option>
                  </select>
                  <input type="text" v-model="agentInput" @keydown.enter.prevent="addAgentManually" placeholder="手动输入 Agent 名或 random3" />
                  <button class="btn btn-small" type="button" @click="addAgentManually">+</button>
                </div>
                <div class="ta-hint">
                  提示：<code>random3</code> + 多个候选 → 每次随机挑 3 个执行
                </div>
              </div>
            </div>

            <div class="ta-form-row">
              <label>
                {{ draft.type === 'forum_patrol' ? '提示词模板' : '提示词内容' }}
                <span style="color: #ef4444;">*</span>
              </label>
              <div class="ta-field">
                <textarea v-model="draft.payload.promptTemplate" :placeholder="promptPlaceholder" rows="8"></textarea>
                <div v-if="draft.type === 'forum_patrol'" class="ta-hint">
                  可用占位符：<code v-pre>{{forum_post_list}}</code> 会被替换为当前论坛帖子列表
                </div>
              </div>
            </div>

            <div v-if="draft.type === 'forum_patrol'" class="ta-form-row">
              <label class="ta-inline">
                <input type="checkbox" v-model="draft.payload.includeForumPostList" />
                预读论坛
              </label>
              <div v-if="draft.payload.includeForumPostList" class="ta-inline-group" style="flex: 1;">
                <span style="color: var(--secondary-text); font-size: 0.82rem;">占位符</span>
                <input type="text" v-model="draft.payload.forumListPlaceholder" style="flex: 0 0 180px; font-family: monospace;" />
                <span style="color: var(--secondary-text); font-size: 0.82rem;">最多</span>
                <input type="number" min="1" v-model.number="draft.payload.maxPosts" style="width: 80px;" />
                <span style="color: var(--secondary-text); font-size: 0.82rem;">帖</span>
              </div>
            </div>

            <details class="ta-advanced">
              <summary>高级派发选项</summary>
              <div>
                <div class="ta-form-row">
                  <label>调用身份</label>
                  <div class="ta-field">
                    <input type="text" v-model="draft.dispatch.maid" placeholder="VCP系统" />
                    <div class="ta-hint">派发时在工具调用中标识的 maid 字段（Agent 能看到谁在派发）</div>
                  </div>
                </div>
                <div class="ta-form-row">
                  <label>注入工具</label>
                  <div class="ta-field">
                    <input type="text" v-model="draft.injectToolsText" placeholder="VCPForum, VCPTavern" />
                    <div class="ta-hint">英文逗号分隔，这些工具会临时注入给目标 Agent</div>
                  </div>
                </div>
                <div class="ta-form-row">
                  <label class="ta-inline">
                    <input type="checkbox" v-model="draft.dispatch.temporaryContact" />
                    临时联系人
                  </label>
                  <label class="ta-inline">
                    <input type="checkbox" v-model="draft.dispatch.taskDelegation" />
                    任务委托
                  </label>
                  <label class="ta-inline">
                    <input type="checkbox" v-model="draft.enabled" />
                    启用该任务
                  </label>
                </div>
              </div>
            </details>

            <div class="ta-form-actions">
              <span v-if="saveError" class="ta-err">{{ saveError }}</span>
              <button v-if="draft.id" class="btn btn-danger" type="button" @click="$emit('delete')">
                <span class="material-symbols-outlined" style="font-size: 1em;">delete</span>
                删除
              </button>
              <button class="btn btn-ghost" type="button" @click="$emit('cancel')">取消</button>
              <button class="btn" type="button" @click="$emit('save')" :disabled="saving">
                <span class="material-symbols-outlined" style="font-size: 1em;">{{ saving ? 'hourglass_top' : 'save' }}</span>
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        `,
        setup(props) {
          const agentInput = P.Vue.ref('');
          const agentPickerValue = P.Vue.ref('');

          const promptPlaceholder = P.Vue.computed(() =>
            props.draft.type === 'forum_patrol'
              ? '例：[论坛小助手]:\\n看看最近论坛在聊什么~\\n\\n{{forum_post_list}}'
              : '例：你好，请查询今天的天气...'
          );

          function onTypeChange() {
            // 类型切换时重置 payload 为对应默认值
            if (props.draft.type === 'custom_prompt') {
              props.draft.payload = { promptTemplate: props.draft.payload.promptTemplate || '' };
            } else {
              props.draft.payload = {
                promptTemplate: props.draft.payload.promptTemplate || DEFAULT_FORUM_PROMPT,
                includeForumPostList: true,
                forumListPlaceholder: '{{forum_post_list}}',
                maxPosts: 200
              };
            }
          }

          function addAgentFromPicker() {
            const v = agentPickerValue.value;
            if (v && !props.draft.targets.agents.includes(v)) {
              props.draft.targets.agents.push(v);
            }
            agentPickerValue.value = '';
          }

          function addAgentManually() {
            const v = agentInput.value.trim();
            if (!v) return;
            if (!props.draft.targets.agents.includes(v)) {
              props.draft.targets.agents.push(v);
            }
            agentInput.value = '';
          }

          function removeAgent(i) {
            props.draft.targets.agents.splice(i, 1);
          }

          return { agentInput, agentPickerValue, promptPlaceholder, onTypeChange, addAgentFromPicker, addAgentManually, removeAgent };
        }
      }
    },
    setup() {
      const loading = ref(false);
      const loaded = ref(false);
      const error = ref('');
      const tasks = ref([]);
      const globalEnabled = ref(false);
      const activeTimerCount = ref(0);
      const dataFile = ref('');
      const togglingGlobal = ref(false);
      const saving = ref(false);
      const busy = ref({});
      const draft = ref(null);
      const saveError = ref('');
      const availableAgents = ref([]);

      const activeCount = computed(() => tasks.value.filter(t => t.enabled).length);

      function dotClass(task) {
        if (task.runtime && task.runtime.running) return 'running';
        if (task.enabled && globalEnabled.value) return 'active';
        return 'paused';
      }

      function typeLabel(type) { return TYPE_LABEL[type] || type; }

      function scheduleLabel(schedule) {
        if (!schedule || typeof schedule !== 'object') return '未设置时间';
        const mode = schedule.mode;
        if (mode === 'interval') return '每 ' + (schedule.intervalMinutes || 60) + ' 分钟';
        if (mode === 'once') return '一次性 · ' + (schedule.runAt ? humanTime(schedule.runAt) : '未指定时间');
        if (mode === 'cron') return 'Cron: ' + (schedule.cronValue || '未设置表达式');
        if (mode === 'manual') return '手动触发';
        return mode || '未知';
      }

      function targetsLabel(targets) {
        const agents = targets && Array.isArray(targets.agents) ? targets.agents : [];
        if (agents.length === 0) return '未配置目标';
        if (agents.length > 3) return agents.slice(0, 3).join(' · ') + ' 等 ' + agents.length + ' 个';
        return agents.join(' · ');
      }

      function humanTime(iso) {
        if (!iso) return '--';
        if (typeof iso !== 'string') return String(iso);
        if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
        try {
          const d = new Date(iso);
          const diff = d.getTime() - Date.now();
          const abs = Math.abs(diff);
          if (abs < 60000) return diff > 0 ? '马上' : '刚刚';
          const mins = Math.round(abs / 60000);
          if (mins < 60) return diff > 0 ? mins + ' 分钟后' : mins + ' 分钟前';
          const hours = Math.round(mins / 60);
          if (hours < 24) return diff > 0 ? hours + ' 小时后' : hours + ' 小时前';
          return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } catch (_) {
          return iso;
        }
      }

      function isEditing(taskId) {
        return draft.value && draft.value.id === taskId;
      }

      async function loadAvailableAgents() {
        try {
          const res = await fetch('/admin_api/agents/map', { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          const names = new Set();
          if (data && typeof data === 'object') {
            for (const key of Object.keys(data)) {
              const entry = data[key];
              if (typeof entry === 'string') {
                names.add(key);
              } else if (entry && typeof entry === 'object') {
                names.add(key);
                if (entry.chineseName) names.add(entry.chineseName);
              }
            }
          }
          availableAgents.value = [...names].sort();
        } catch (e) {
          console.warn('[VCPTaskAssistant] 加载 Agent 列表失败:', e.message);
        }
      }

      async function load() {
        loading.value = true;
        error.value = '';
        try {
          const res = await fetch(API_BASE + '/config', { credentials: 'include' });
          if (!res.ok) throw new Error('配置 API 返回 ' + res.status);
          const payload = await res.json();
          if (!payload.success) throw new Error(payload.error || '未知错误');
          tasks.value = Array.isArray(payload.tasks) ? payload.tasks : [];
          globalEnabled.value = !!payload.globalEnabled;
          activeTimerCount.value = payload.activeTimerCount || 0;
          dataFile.value = payload.dataFile || '';
          loaded.value = true;
        } catch (e) {
          error.value = e.message || '加载失败';
        } finally {
          loading.value = false;
        }
      }

      function startNew() {
        draft.value = createBlankDraft('forum_patrol');
        saveError.value = '';
      }

      function startEdit(task) {
        draft.value = createDraftFromTask(task);
        saveError.value = '';
      }

      function cancelEdit() {
        draft.value = null;
        saveError.value = '';
      }

      function validateDraft(d) {
        if (!d.name || !d.name.trim()) return '任务名称不能为空';
        if (!d.targets.agents.length) return '至少选择一个目标 Agent';
        if (!String(d.payload.promptTemplate || '').trim()) return '提示词不能为空';
        if (d.schedule.mode === 'once' && !d.scheduleRunAtLocal) return '一次性任务必须指定执行时间';
        if (d.schedule.mode === 'cron' && !(d.schedule.cronValue && d.schedule.cronValue.trim())) return '请填写 Cron 表达式';
        if (d.schedule.mode === 'interval' && (d.schedule.intervalMinutes || 0) < 10) return '间隔最少 10 分钟';
        return null;
      }

      async function saveTask() {
        if (!draft.value) return;
        const err = validateDraft(draft.value);
        if (err) {
          saveError.value = err;
          return;
        }
        const payload = serializeDraft(draft.value);
        saving.value = true;
        saveError.value = '';
        try {
          const isNew = !draft.value.id;
          const url = isNew ? (API_BASE + '/task') : (API_BASE + '/task/' + encodeURIComponent(draft.value.id));
          const method = isNew ? 'POST' : 'PUT';
          const res = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) throw new Error(data.error || '保存失败 ' + res.status);
          showToast(isNew ? '任务已创建' : '任务已更新', 'success');
          draft.value = null;
          await load();
        } catch (e) {
          saveError.value = e.message;
        } finally {
          saving.value = false;
        }
      }

      async function deleteTask() {
        if (!draft.value || !draft.value.id) return;
        if (!confirm('确定删除任务「' + (draft.value.name || draft.value.id) + '」？此操作不可撤销。')) return;
        try {
          const res = await fetch(API_BASE + '/task/' + encodeURIComponent(draft.value.id), {
            method: 'DELETE', credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) throw new Error(data.error || '删除失败 ' + res.status);
          showToast('任务已删除', 'success');
          draft.value = null;
          await load();
        } catch (e) {
          showToast('删除失败：' + e.message, 'error');
        }
      }

      async function trigger(task) {
        busy.value = { ...busy.value, [task.id]: true };
        try {
          const res = await fetch(API_BASE + '/trigger/' + encodeURIComponent(task.id), {
            method: 'POST', credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) throw new Error(data.error || '触发失败 ' + res.status);
          showToast('已触发任务：' + task.name, 'success');
          await load();
        } catch (e) {
          showToast('触发失败：' + e.message, 'error');
        } finally {
          busy.value = { ...busy.value, [task.id]: false };
        }
      }

      async function toggle(task) {
        busy.value = { ...busy.value, [task.id]: true };
        try {
          const res = await fetch(API_BASE + '/toggle/' + encodeURIComponent(task.id), {
            method: 'POST', credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) throw new Error(data.error || '切换失败 ' + res.status);
          showToast(data.enabled ? '任务已启用' : '任务已暂停', 'success');
          await load();
        } catch (e) {
          showToast('切换失败：' + e.message, 'error');
        } finally {
          busy.value = { ...busy.value, [task.id]: false };
        }
      }

      async function toggleGlobal() {
        togglingGlobal.value = true;
        try {
          const res = await fetch(API_BASE + '/toggle-global', {
            method: 'POST', credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) throw new Error(data.error || '切换失败 ' + res.status);
          globalEnabled.value = data.globalEnabled;
          showToast('全局调度已' + (data.globalEnabled ? '启用' : '停用'), 'success');
          await load();
        } catch (e) {
          showToast('切换失败：' + e.message, 'error');
        } finally {
          togglingGlobal.value = false;
        }
      }

      onMounted(() => {
        load();
        loadAvailableAgents();
      });

      return {
        loading, loaded, error, tasks, globalEnabled, activeTimerCount, dataFile, togglingGlobal, busy,
        saving, draft, saveError, availableAgents,
        activeCount, dotClass, typeLabel, scheduleLabel, targetsLabel, humanTime, isEditing,
        load, startNew, startEdit, cancelEdit, saveTask, deleteTask, trigger, toggle, toggleGlobal
      };
    }
  };

  P.register('VCPTaskAssistant', TaskAssistantPage);
})();
