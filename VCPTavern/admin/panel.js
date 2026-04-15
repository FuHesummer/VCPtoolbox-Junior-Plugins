// VCPTavern 管理面板（native 模式 · v2 · 可视化规则编辑器）
// 走解耦路径：/admin_api/plugins/VCPTavern/api/presets/*
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[VCPTavern] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted, watch } = P.Vue;
  const { pluginApi, showToast } = P;
  const api = pluginApi('VCPTavern');

  // style 每次覆盖（黄金规则 3）
  const styleId = 'vcptavern-style';
  const oldStyle = document.getElementById(styleId);
  if (oldStyle) oldStyle.remove();
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    .tv-page .tv-help { background: var(--card-bg); border: 1px solid var(--border-color); border-left: 4px solid var(--button-bg, #6366f1); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.7; color: var(--primary-text); }
    .tv-page .tv-help summary { cursor: pointer; font-weight: 600; color: var(--button-bg, #6366f1); margin-bottom: 8px; list-style: none; display: flex; align-items: center; gap: 6px; user-select: none; }
    .tv-page .tv-help summary::-webkit-details-marker { display: none; }
    .tv-page .tv-help summary::before { content: '▶'; font-size: 0.7em; transition: transform 0.2s; }
    .tv-page .tv-help[open] summary::before { transform: rotate(90deg); }
    .tv-page .tv-help code { background: var(--background-color); padding: 1px 6px; border-radius: 3px; color: var(--primary-text); font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }
    .tv-page .tv-help h4 { margin: 12px 0 6px; font-size: 0.9rem; color: var(--primary-text); }
    .tv-page .tv-help ul { margin: 4px 0; padding-left: 20px; }
    .tv-page .tv-help li { margin: 3px 0; }
    .tv-page .tv-var-table { width: 100%; margin-top: 8px; border-collapse: collapse; }
    .tv-page .tv-var-table td { padding: 4px 8px; border-top: 1px dashed var(--border-color); font-size: 0.82rem; }
    .tv-page .tv-var-table td:first-child { white-space: nowrap; color: var(--button-bg, #6366f1); font-family: monospace; }

    .tv-page .tv-two-col { display: grid; grid-template-columns: minmax(220px, 280px) 1fr; gap: 16px; align-items: start; }
    @media (max-width: 960px) { .tv-page .tv-two-col { grid-template-columns: 1fr; } }

    .tv-page .tv-sidebar { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 8px; max-height: 75vh; overflow-y: auto; }
    .tv-page .tv-preset-item { padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .tv-page .tv-preset-item:hover { background: var(--background-color); }
    .tv-page .tv-preset-item.active { background: var(--accent-bg, rgba(99, 102, 241, 0.08)); border-color: var(--button-bg, #6366f1); }
    .tv-page .tv-preset-item .tv-preset-name { font-size: 0.88rem; font-weight: 500; color: var(--primary-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tv-page .tv-preset-item.active .tv-preset-name { color: var(--button-bg, #6366f1); }
    .tv-page .tv-preset-item .tv-badge { font-size: 0.68rem; padding: 1px 6px; border-radius: 3px; background: var(--background-color); color: var(--secondary-text); font-family: monospace; }

    .tv-page .tv-editor { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
    .tv-page .tv-editor .tv-name-row { display: flex; gap: 10px; align-items: center; }
    .tv-page .tv-editor .tv-name-input { flex: 1; padding: 9px 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-size: 0.95rem; font-weight: 600; }
    .tv-page .tv-editor .tv-trigger-hint { font-size: 0.78rem; color: var(--secondary-text); white-space: nowrap; }
    .tv-page .tv-editor .tv-trigger-hint code { background: var(--background-color); padding: 1px 6px; border-radius: 3px; color: var(--primary-text); font-family: monospace; }

    .tv-page .tv-view-tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--border-color); padding-bottom: 0; }
    .tv-page .tv-view-tab { padding: 8px 14px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--secondary-text); cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
    .tv-page .tv-view-tab.active { color: var(--button-bg, #6366f1); border-bottom-color: var(--button-bg, #6366f1); }
    .tv-page .tv-view-tab:hover:not(.active) { color: var(--primary-text); }

    .tv-page .tv-rule-card { background: var(--background-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; position: relative; }
    .tv-page .tv-rule-card.disabled { opacity: 0.55; }
    .tv-page .tv-rule-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .tv-page .tv-rule-head .tv-rule-index { font-size: 0.78rem; color: var(--secondary-text); font-weight: 600; min-width: 40px; }
    .tv-page .tv-rule-head select { padding: 4px 8px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--primary-text); font-size: 0.82rem; }
    .tv-page .tv-rule-head .tv-rule-spacer { flex: 1; }
    .tv-page .tv-rule-head .tv-icon-btn { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--secondary-text); transition: all 0.15s; display: flex; align-items: center; }
    .tv-page .tv-rule-head .tv-icon-btn:hover { background: var(--border-color); color: var(--primary-text); }
    .tv-page .tv-rule-head .tv-icon-btn.tv-del:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .tv-page .tv-rule-field-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 0.82rem; color: var(--secondary-text); }
    .tv-page .tv-rule-field-row label { display: flex; align-items: center; gap: 6px; }
    .tv-page .tv-rule-field-row select, .tv-page .tv-rule-field-row input[type="number"] { padding: 4px 8px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--primary-text); font-size: 0.82rem; }
    .tv-page .tv-rule-field-row input[type="number"] { width: 80px; }

    .tv-page .tv-rule-content { width: 100%; min-height: 80px; padding: 10px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 0.82rem; line-height: 1.55; resize: vertical; }

    .tv-page .tv-toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
    .tv-page .tv-toggle-switch input { opacity: 0; width: 0; height: 0; }
    .tv-page .tv-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--border-color); border-radius: 20px; transition: 0.2s; }
    .tv-page .tv-toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .tv-page .tv-toggle-switch input:checked + .tv-toggle-slider { background: #22c55e; }
    .tv-page .tv-toggle-switch input:checked + .tv-toggle-slider:before { transform: translateX(16px); }

    .tv-page .tv-add-rule { background: transparent; border: 2px dashed var(--border-color); padding: 10px; border-radius: 8px; color: var(--secondary-text); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .tv-page .tv-add-rule:hover { border-color: var(--button-bg, #6366f1); color: var(--button-bg, #6366f1); }

    .tv-page .tv-json-area { width: 100%; min-height: 380px; padding: 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 0.82rem; line-height: 1.55; resize: vertical; }
    .tv-page .tv-json-area.invalid { border-color: #ef4444; }

    .tv-page .tv-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; margin-top: 4px; }
    .tv-page .tv-actions .tv-status { margin-right: auto; color: var(--secondary-text); font-size: 0.82rem; }
    .tv-page .tv-actions .tv-status.err { color: #ef4444; }

    .tv-page .tv-type-badge { display: inline-block; font-size: 0.68rem; padding: 2px 7px; border-radius: 10px; font-weight: 500; }
    .tv-page .tv-type-badge.embed { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
    .tv-page .tv-type-badge.relative { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
    .tv-page .tv-type-badge.depth { background: rgba(245, 158, 11, 0.12); color: #d97706; }
  `;
  document.head.appendChild(styleEl);

  // ========== 规则序列化/反序列化 ==========
  // UI 的 rule 多一个 asRole 字段，存对象时合成 {role, content}，存字符串时省略
  function createEmptyRule(type) {
    if (type === 'relative') return { enabled: true, type: 'relative', target: 'system', position: 'after', asRole: 'system', content: '' };
    if (type === 'depth') return { enabled: true, type: 'depth', depth: 4, asRole: 'system', content: '' };
    return { enabled: true, type: 'embed', target: 'system', position: 'after', content: '' };
  }

  function serializeRule(rule) {
    const out = { enabled: rule.enabled !== false, type: rule.type };
    if (rule.type === 'embed') {
      out.target = rule.target || 'system';
      out.position = rule.position || 'after';
      out.content = String(rule.content || '');
    } else if (rule.type === 'relative') {
      out.target = rule.target || 'system';
      out.position = rule.position || 'after';
      const role = rule.asRole || 'system';
      out.content = { role, content: String(rule.content || '') };
    } else if (rule.type === 'depth') {
      out.depth = Math.max(1, parseInt(rule.depth, 10) || 1);
      const role = rule.asRole || 'system';
      out.content = { role, content: String(rule.content || '') };
    }
    return out;
  }

  function deserializeRule(raw) {
    const base = { enabled: raw.enabled !== false, type: ['embed', 'relative', 'depth'].includes(raw.type) ? raw.type : 'embed' };
    const isObj = raw.content && typeof raw.content === 'object' && !Array.isArray(raw.content);
    if (base.type === 'embed') {
      return {
        ...base,
        target: raw.target || 'system',
        position: raw.position || 'after',
        content: isObj ? String(raw.content.content || '') : String(raw.content || '')
      };
    }
    if (base.type === 'relative') {
      return {
        ...base,
        target: raw.target || 'system',
        position: raw.position || 'after',
        asRole: isObj ? (raw.content.role || 'system') : 'system',
        content: isObj ? String(raw.content.content || '') : String(raw.content || '')
      };
    }
    return {
      ...base,
      depth: Math.max(1, parseInt(raw.depth, 10) || 1),
      asRole: isObj ? (raw.content.role || 'system') : 'system',
      content: isObj ? String(raw.content.content || '') : String(raw.content || '')
    };
  }

  const TYPE_LABEL = { embed: '嵌入改写', relative: '相对插入', depth: '深度插入' };
  const TARGET_LABEL = { system: 'System 消息', last_user: '最后一条 User 消息', all_user: '所有 User 消息' };

  const VCPTavernPage = {
    name: 'VCPTavernPage',
    template: /* html */ `
      <div class="page tv-page">
        <PageHeader title="Tavern 预设" subtitle="消息预处理器 · 在送 LLM 前注入/改写消息" icon="local_bar">
          <template #actions>
            <button class="btn btn-ghost" @click="load" :disabled="loading">
              <span class="material-symbols-outlined">refresh</span>
              刷新
            </button>
            <button class="btn" @click="newPreset">
              <span class="material-symbols-outlined">add</span>
              新建预设
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <details class="tv-help" open>
            <summary>这是什么？怎么用？</summary>
            <div style="margin-top: 6px;">
              <p style="margin: 0 0 8px;">
                <strong>VCPTavern</strong> 是<strong>消息预处理器</strong>：在 Agent 的消息送到 LLM 之前，
                自动扫描 system prompt 里的触发占位符
                <code v-pre>{{VCPTavern::预设名}}</code>，按预设定义的
                <strong>规则</strong>改写或插入消息。适合：全局人设补丁、日期/时间上下文、最近对话回忆、最后提醒等。
              </p>
              <h4>触发方式</h4>
              <ul>
                <li>在 Agent system prompt 里写：<code v-pre>{{VCPTavern::dailychat}}</code></li>
                <li>可选显式会话 ID：<code v-pre>{{VCPTavern::dailychat::sessionXYZ}}</code>（多会话需要独立记忆时）</li>
                <li>命中后占位符自动清除，按预设 <code>rules</code> 执行注入</li>
              </ul>
              <h4>三种注入规则</h4>
              <ul>
                <li><strong><span class="tv-type-badge embed">嵌入改写</span></strong>
                  —— 直接拼接到现有 System 或最后用户消息内容的前/后（不增加消息条数）</li>
                <li><strong><span class="tv-type-badge relative">相对插入</span></strong>
                  —— 作为独立新消息插入到 System / 最后用户消息 / 所有用户消息的前或后</li>
                <li><strong><span class="tv-type-badge depth">深度插入</span></strong>
                  —— 从消息链末尾倒数第 N 条之前插入新消息（常用于最后一刻提醒）</li>
              </ul>
              <h4>支持的魔法变量</h4>
              <table class="tv-var-table">
                <tr><td v-pre>{{Date}}</td><td>当前日期（例：2026/4/15）</td></tr>
                <tr><td v-pre>{{Time}}</td><td>当前时间（例：14:30:22）</td></tr>
                <tr><td v-pre>{{Today}}</td><td>今天是星期几</td></tr>
                <tr><td v-pre>{{LastChatTime}}</td><td>上次对话时间（同预设 + 同会话维度）</td></tr>
                <tr><td v-pre>{{TimeSinceLastChat}}</td><td>距离上次对话已过去多久</td></tr>
              </table>
            </div>
          </details>

          <EmptyState v-if="loading && names.length === 0" icon="hourglass_top" message="加载预设..." />

          <div v-else class="tv-two-col">
            <aside class="tv-sidebar">
              <EmptyState v-if="names.length === 0" icon="local_bar" message="暂无预设，点击右上角新建" />
              <div v-else
                v-for="name in names"
                :key="name"
                class="tv-preset-item"
                :class="{ active: name === selectedName }"
                @click="select(name)"
              >
                <span class="tv-preset-name">{{ name }}</span>
                <span v-if="isNew(name)" class="tv-badge">新</span>
              </div>
            </aside>

            <section v-if="selectedName" class="tv-editor">
              <div class="tv-name-row">
                <input
                  v-model="editingName"
                  class="tv-name-input"
                  placeholder="预设名（英文/数字/_-）"
                  :readonly="!isNew(selectedName)"
                />
                <span class="tv-trigger-hint">
                  触发：<code>{{ triggerExample }}</code>
                </span>
              </div>

              <div class="tv-view-tabs">
                <button class="tv-view-tab" :class="{ active: viewMode === 'visual' }" @click="switchView('visual')">
                  <span class="material-symbols-outlined" style="font-size: 0.95em; vertical-align: -2px;">dashboard_customize</span>
                  可视化规则
                </button>
                <button class="tv-view-tab" :class="{ active: viewMode === 'json' }" @click="switchView('json')">
                  <span class="material-symbols-outlined" style="font-size: 0.95em; vertical-align: -2px;">code</span>
                  原始 JSON
                </button>
              </div>

              <template v-if="viewMode === 'visual'">
                <div v-if="rules.length === 0" style="padding: 20px; text-align: center; color: var(--secondary-text); font-size: 0.85rem;">
                  这个预设还没有规则。点下方"添加规则"开始配置嘛。
                </div>

                <article v-for="(rule, i) in rules" :key="i" class="tv-rule-card" :class="{ disabled: !rule.enabled }">
                  <div class="tv-rule-head">
                    <span class="tv-rule-index">#{{ i + 1 }}</span>
                    <span class="tv-type-badge" :class="rule.type">{{ typeLabel(rule.type) }}</span>
                    <select v-model="rule.type" @change="onTypeChange(rule, i)">
                      <option value="embed">嵌入改写</option>
                      <option value="relative">相对插入</option>
                      <option value="depth">深度插入</option>
                    </select>
                    <span class="tv-rule-spacer"></span>
                    <label class="tv-toggle-switch" :title="rule.enabled ? '已启用' : '已禁用'">
                      <input type="checkbox" v-model="rule.enabled" />
                      <span class="tv-toggle-slider"></span>
                    </label>
                    <button class="tv-icon-btn" @click="moveRule(i, -1)" :disabled="i === 0" title="上移">
                      <span class="material-symbols-outlined" style="font-size: 1.1em;">arrow_upward</span>
                    </button>
                    <button class="tv-icon-btn" @click="moveRule(i, 1)" :disabled="i === rules.length - 1" title="下移">
                      <span class="material-symbols-outlined" style="font-size: 1.1em;">arrow_downward</span>
                    </button>
                    <button class="tv-icon-btn tv-del" @click="removeRule(i)" title="删除此规则">
                      <span class="material-symbols-outlined" style="font-size: 1.1em;">delete</span>
                    </button>
                  </div>

                  <div class="tv-rule-field-row" v-if="rule.type === 'embed'">
                    <label>
                      目标
                      <select v-model="rule.target">
                        <option value="system">System 消息</option>
                        <option value="last_user">最后一条 User</option>
                      </select>
                    </label>
                    <label>
                      位置
                      <select v-model="rule.position">
                        <option value="before">前面拼接</option>
                        <option value="after">后面追加</option>
                      </select>
                    </label>
                  </div>

                  <div class="tv-rule-field-row" v-else-if="rule.type === 'relative'">
                    <label>
                      目标
                      <select v-model="rule.target">
                        <option value="system">System 消息</option>
                        <option value="last_user">最后一条 User</option>
                        <option value="all_user">所有 User</option>
                      </select>
                    </label>
                    <label>
                      位置
                      <select v-model="rule.position">
                        <option value="before">之前插入</option>
                        <option value="after">之后插入</option>
                      </select>
                    </label>
                    <label>
                      插入角色
                      <select v-model="rule.asRole">
                        <option value="system">system</option>
                        <option value="user">user</option>
                        <option value="assistant">assistant</option>
                      </select>
                    </label>
                  </div>

                  <div class="tv-rule-field-row" v-else-if="rule.type === 'depth'">
                    <label>
                      深度
                      <input type="number" min="1" v-model.number="rule.depth" title="从末尾倒数第几条之前插入" />
                    </label>
                    <label>
                      插入角色
                      <select v-model="rule.asRole">
                        <option value="system">system</option>
                        <option value="user">user</option>
                        <option value="assistant">assistant</option>
                      </select>
                    </label>
                    <span style="font-size: 0.76rem; opacity: 0.75;">
                      depth=1 表示插到最末位置之前，即最后一条消息上面
                    </span>
                  </div>

                  <textarea
                    v-model="rule.content"
                    class="tv-rule-content"
                    spellcheck="false"
                    placeholder="消息内容（支持 {{Date}} {{Time}} {{Today}} {{LastChatTime}} {{TimeSinceLastChat}}）"
                  ></textarea>
                </article>

                <button class="tv-add-rule" @click="addRule">
                  <span class="material-symbols-outlined">add</span>
                  添加规则
                </button>
              </template>

              <template v-else>
                <div style="font-size: 0.78rem; color: var(--secondary-text); margin: -4px 0 -6px;">
                  高级模式：直接编辑 JSON（保存时会校验格式）
                </div>
                <textarea
                  v-model="jsonContent"
                  class="tv-json-area"
                  :class="{ invalid: jsonError }"
                  spellcheck="false"
                  :placeholder='jsonPlaceholder'
                ></textarea>
              </template>

              <div class="tv-actions">
                <span class="tv-status" :class="{ err: jsonError }">
                  {{ statusMsg }}
                </span>
                <button v-if="viewMode === 'json'" class="btn btn-ghost" @click="formatJson" :disabled="!!jsonError || !jsonContent">
                  <span class="material-symbols-outlined">code</span>
                  格式化
                </button>
                <button v-if="!isNew(selectedName)" class="btn btn-danger" @click="del">
                  <span class="material-symbols-outlined">delete</span>
                  删除
                </button>
                <button class="btn" @click="save" :disabled="saving || (viewMode === 'json' && !!jsonError) || !editingName">
                  <span class="material-symbols-outlined">{{ saving ? 'hourglass_top' : 'save' }}</span>
                  保存
                </button>
              </div>
            </section>

            <EmptyState v-else icon="arrow_back" message="选择左侧预设开始编辑，或新建一个" />
          </div>
        </div>
      </div>
    `,
    setup() {
      const loading = ref(false);
      const saving = ref(false);
      const names = ref([]);
      const selectedName = ref('');
      const editingName = ref('');
      const rules = ref([]);
      const jsonContent = ref('');
      const viewMode = ref('visual');
      const pendingNew = ref(new Set());
      const rawPayload = ref({});

      const triggerExample = computed(() => '{{VCPTavern::' + (editingName.value || 'preset') + '}}');
      const jsonPlaceholder = '{\n  "rules": [\n    {\n      "enabled": true,\n      "type": "embed",\n      "target": "system",\n      "position": "after",\n      "content": "今天是 {{Today}}"\n    }\n  ]\n}';

      const jsonError = computed(() => {
        if (viewMode.value !== 'json') return null;
        if (!jsonContent.value.trim()) return null;
        try { JSON.parse(jsonContent.value); return null; }
        catch (e) { return e.message; }
      });

      const statusMsg = computed(() => {
        if (jsonError.value) return 'JSON 语法错误：' + jsonError.value;
        if (saving.value) return '保存中...';
        if (viewMode.value === 'visual' && rules.value.length > 0) {
          const active = rules.value.filter(r => r.enabled).length;
          return '共 ' + rules.value.length + ' 条规则（' + active + ' 启用）';
        }
        return '';
      });

      function isNew(name) { return pendingNew.value.has(name); }
      function typeLabel(type) { return TYPE_LABEL[type] || type; }

      async function load() {
        loading.value = true;
        try {
          const list = await api.get('/presets');
          names.value = Array.isArray(list) ? list.sort() : [];
        } catch (e) {
          showToast('加载预设列表失败：' + e.message, 'error');
        } finally {
          loading.value = false;
        }
      }

      async function select(name) {
        selectedName.value = name;
        editingName.value = name;
        viewMode.value = 'visual';
        if (pendingNew.value.has(name)) {
          rules.value = [];
          rawPayload.value = { rules: [] };
          jsonContent.value = jsonPlaceholder;
          return;
        }
        try {
          const data = await api.get('/presets/' + encodeURIComponent(name));
          rawPayload.value = data && typeof data === 'object' ? data : {};
          const rawRules = Array.isArray(data && data.rules) ? data.rules : [];
          rules.value = rawRules.map(deserializeRule);
          jsonContent.value = JSON.stringify(data, null, 2);
        } catch (e) {
          showToast('加载预设失败：' + e.message, 'error');
          rules.value = [];
          jsonContent.value = '';
        }
      }

      function switchView(mode) {
        if (mode === viewMode.value) return;
        if (mode === 'json') {
          // visual → JSON：序列化当前 rules
          const payload = { ...rawPayload.value, rules: rules.value.map(serializeRule) };
          jsonContent.value = JSON.stringify(payload, null, 2);
        } else {
          // JSON → visual：尝试解析
          if (jsonContent.value.trim()) {
            try {
              const parsed = JSON.parse(jsonContent.value);
              rawPayload.value = parsed && typeof parsed === 'object' ? parsed : {};
              const rawRules = Array.isArray(parsed && parsed.rules) ? parsed.rules : [];
              rules.value = rawRules.map(deserializeRule);
            } catch (e) {
              showToast('JSON 有误，无法切换到可视化：' + e.message, 'error');
              return;
            }
          }
        }
        viewMode.value = mode;
      }

      function onTypeChange(rule, i) {
        const fresh = createEmptyRule(rule.type);
        fresh.enabled = rule.enabled;
        fresh.content = rule.content;
        rules.value.splice(i, 1, fresh);
      }

      function addRule() {
        rules.value.push(createEmptyRule('embed'));
      }

      function removeRule(i) {
        rules.value.splice(i, 1);
      }

      function moveRule(i, delta) {
        const j = i + delta;
        if (j < 0 || j >= rules.value.length) return;
        const arr = rules.value.slice();
        [arr[i], arr[j]] = [arr[j], arr[i]];
        rules.value = arr;
      }

      function newPreset() {
        let idx = 1;
        let name = '新预设';
        while (names.value.includes(name) || pendingNew.value.has(name)) {
          name = '新预设_' + (idx++);
        }
        pendingNew.value.add(name);
        names.value = [...names.value, name];
        editingName.value = name;
        rules.value = [];
        rawPayload.value = { rules: [] };
        jsonContent.value = jsonPlaceholder;
        selectedName.value = name;
        viewMode.value = 'visual';
      }

      async function save() {
        const finalName = editingName.value.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!finalName) {
          showToast('预设名无效，只允许英文/数字/下划线/连字符', 'error');
          return;
        }

        let payload;
        if (viewMode.value === 'json') {
          if (jsonError.value) { showToast('JSON 格式无效', 'error'); return; }
          try {
            payload = JSON.parse(jsonContent.value || '{}');
          } catch (e) {
            showToast('JSON 解析失败：' + e.message, 'error');
            return;
          }
        } else {
          payload = { ...rawPayload.value, rules: rules.value.map(serializeRule) };
        }

        saving.value = true;
        try {
          await api.post('/presets/' + encodeURIComponent(finalName), payload);
          showToast('预设已保存：' + finalName, 'success');

          if (isNew(selectedName.value) && selectedName.value !== finalName) {
            pendingNew.value.delete(selectedName.value);
            names.value = names.value.filter(n => n !== selectedName.value);
          } else if (isNew(selectedName.value)) {
            pendingNew.value.delete(selectedName.value);
          }

          if (!names.value.includes(finalName)) names.value = [...names.value, finalName].sort();
          selectedName.value = finalName;
          editingName.value = finalName;
          rawPayload.value = payload;
          if (viewMode.value === 'json') {
            const rawRules = Array.isArray(payload.rules) ? payload.rules : [];
            rules.value = rawRules.map(deserializeRule);
          } else {
            jsonContent.value = JSON.stringify(payload, null, 2);
          }
        } catch (e) {
          showToast('保存失败：' + e.message, 'error');
        } finally {
          saving.value = false;
        }
      }

      async function del() {
        if (!confirm('确定删除预设「' + selectedName.value + '」？此操作不可撤销。')) return;
        try {
          await api.delete('/presets/' + encodeURIComponent(selectedName.value));
          showToast('预设已删除', 'success');
          names.value = names.value.filter(n => n !== selectedName.value);
          selectedName.value = '';
          editingName.value = '';
          rules.value = [];
          jsonContent.value = '';
          rawPayload.value = {};
        } catch (e) {
          showToast('删除失败：' + e.message, 'error');
        }
      }

      function formatJson() {
        try {
          jsonContent.value = JSON.stringify(JSON.parse(jsonContent.value), null, 2);
          showToast('已格式化', 'success');
        } catch (e) {
          showToast('JSON 无效，无法格式化', 'error');
        }
      }

      onMounted(load);

      return {
        loading, saving, names, selectedName, editingName, rules, jsonContent, viewMode, rawPayload,
        triggerExample, jsonPlaceholder, jsonError, statusMsg,
        isNew, typeLabel, load, select, switchView, onTypeChange, addRule, removeRule, moveRule,
        newPreset, save, del, formatJson
      };
    }
  };

  P.register('VCPTavern', VCPTavernPage);
})();
