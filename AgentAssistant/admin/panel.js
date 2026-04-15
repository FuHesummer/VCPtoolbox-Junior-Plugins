// AgentAssistant 管理面板（native 模式）
// 调用 /admin_api/plugins/AgentAssistant/api/config 读写 config.json
// Master-Detail 布局：左侧 Agent 列表 + 右侧详情编辑
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[AgentAssistant] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted } = P.Vue;
  const { pluginApi, showToast } = P;
  const api = pluginApi('AgentAssistant');

  const styleId = 'aa-style';
  // 总是重建 style（避免 panel.js 改版后旧 CSS 残留）
  const oldStyle = document.getElementById(styleId);
  if (oldStyle) oldStyle.remove();
  {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
      .aa-page .layout { display: grid; grid-template-columns: 280px 1fr; gap: 14px; align-items: start; }
      @media (max-width: 1100px) { .aa-page .layout { grid-template-columns: 1fr; } }

      .aa-page .sidebar { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; display: flex; flex-direction: column; max-height: 72vh; }
      .aa-page .sidebar-header { padding: 10px 12px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--secondary-text); }
      .aa-page .sidebar-list { flex: 1; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 2px; }
      .aa-page .agent-entry { padding: 9px 10px; border-radius: 6px; cursor: pointer; border: 1px solid transparent; display: flex; flex-direction: column; gap: 2px; transition: all 0.12s; }
      .aa-page .agent-entry:hover { background: var(--background-color); }
      .aa-page .agent-entry.active { background: var(--accent-bg); color: var(--button-bg); }
      .aa-page .agent-entry.active .sub { color: var(--button-bg); opacity: 0.75; }
      .aa-page .agent-entry.active .pill { background: rgba(255,255,255,0.25); color: var(--button-bg); }
      .aa-page .agent-entry .top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
      .aa-page .agent-entry .main { font-size: 0.89rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .aa-page .agent-entry .pill { font-size: 0.66rem; padding: 1px 6px; border-radius: 10px; background: var(--background-color); color: var(--secondary-text); opacity: 0.85; }
      .aa-page .agent-entry .sub { font-size: 0.72rem; color: var(--secondary-text); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .aa-page .tabs { display: flex; gap: 2px; background: var(--background-color); padding: 4px; border-radius: 8px; margin-bottom: 14px; width: fit-content; }
      .aa-page .tab-btn { padding: 6px 14px; border: none; background: transparent; color: var(--secondary-text); font-size: 0.85rem; cursor: pointer; border-radius: 5px; font-family: inherit; }
      .aa-page .tab-btn:hover { color: var(--primary-text); }
      .aa-page .tab-btn.active { background: var(--card-bg); color: var(--primary-text); font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

      .aa-page .editor-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px; }
      .aa-page .section { margin-bottom: 18px; }
      .aa-page .section:last-child { margin-bottom: 0; }
      .aa-page .section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
      .aa-page .section-head .icon { color: var(--secondary-text); opacity: 0.75; font-size: 1.15em; }
      .aa-page .section-head h3 { margin: 0; font-size: 0.92rem; font-weight: 600; color: var(--primary-text); }

      .aa-page .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 600px) { .aa-page .grid-2 { grid-template-columns: 1fr; } }

      .aa-page .field { display: flex; flex-direction: column; gap: 4px; }
      .aa-page .field label { font-size: 0.78rem; color: var(--secondary-text); display: flex; justify-content: space-between; align-items: baseline; }
      .aa-page .field label .hint { color: var(--secondary-text); opacity: 0.6; font-size: 0.72rem; font-weight: 400; }
      .aa-page .field input, .aa-page .field textarea {
        padding: 7px 10px; background: var(--input-bg, var(--background-color)); border: 1px solid var(--border-color);
        border-radius: 6px; color: var(--primary-text); font-size: 0.86rem; font-family: inherit; transition: border-color 0.15s;
      }
      .aa-page .field textarea { min-height: 68px; resize: vertical; line-height: 1.5; font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 0.82rem; }
      .aa-page .field input:focus, .aa-page .field textarea:focus { border-color: var(--accent-bg); outline: none; }

      .aa-page .footer-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; padding-top: 14px; margin-top: 18px; border-top: 1px solid var(--border-color); }
      .aa-page .dirty-tag { color: var(--accent-bg); font-size: 0.8rem; margin-right: auto; display: flex; align-items: center; gap: 5px; }

      .aa-page .empty-agent { padding: 60px 20px; text-align: center; color: var(--secondary-text); }
      .aa-page .empty-agent .material-symbols-outlined { font-size: 3rem; opacity: 0.35; display: block; margin-bottom: 8px; }

      /* 注意：BaseModal 使用 Teleport to="body"，内容不在 .aa-page 里，选择器不要带 .aa-page 前缀 */
      .aa-import-grid { display: flex; flex-wrap: wrap; gap: 8px; max-height: 55vh; overflow-y: auto; padding: 2px; }
      .aa-import-chip { position: relative; padding: 10px 18px; border: 1.5px solid var(--border-color); border-radius: 999px; cursor: pointer; transition: all 0.15s ease; background: var(--card-bg); color: var(--primary-text); font-size: 0.9rem; font-weight: 500; user-select: none; display: inline-flex; align-items: center; gap: 6px; line-height: 1; }
      .aa-import-chip:hover { border-color: var(--accent-bg); background: var(--accent-bg); color: var(--button-bg); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
      .aa-import-chip:active { transform: translateY(0); }
      .aa-import-chip.disabled { opacity: 0.45; cursor: not-allowed; color: var(--secondary-text); }
      .aa-import-chip.disabled:hover { border-color: var(--border-color); background: var(--card-bg); color: var(--secondary-text); transform: none; box-shadow: none; }
      .aa-import-chip .aa-check { color: #16a34a; font-size: 1em; }
      .aa-import-chip.disabled .aa-check { opacity: 0.85; }
    `;
    document.head.appendChild(el);
  }

  function emptyAgent() {
    return {
      baseName: '',
      chineseName: '',
      modelId: '',
      systemPrompt: 'You are a helpful AI assistant named {{MaidName}}.',
      description: '',
      maxOutputTokens: 40000,
      temperature: 0.7,
    };
  }

  const AgentAssistantPage = {
    name: 'AgentAssistantPage',
    template: /* html */ `
      <div class="page aa-page">
        <PageHeader title="Agent 通讯配置" subtitle="管理 AgentAssistant 的专属 Agent 列表 + 全局对话/委托参数" icon="hub">
          <template #actions>
            <button class="btn btn-ghost" @click="load" :disabled="loading || saving">
              <span class="material-symbols-outlined">refresh</span>
              重载
            </button>
            <button class="btn" @click="save" :disabled="loading || saving || !dirty">
              <span class="material-symbols-outlined">{{ saving ? 'hourglass_top' : 'save' }}</span>
              {{ dirty ? '保存' : '已保存' }}
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <div class="tabs">
            <button class="tab-btn" :class="{ active: tab === 'agents' }" @click="tab = 'agents'">
              <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 1.1em; margin-right: 4px;">group</span>
              Agent 列表 ({{ config.agents.length }})
            </button>
            <button class="tab-btn" :class="{ active: tab === 'global' }" @click="tab = 'global'">
              <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 1.1em; margin-right: 4px;">settings</span>
              全局参数
            </button>
          </div>

          <EmptyState v-if="loading && !loaded" icon="hourglass_top" message="加载配置中..." />

          <div v-else-if="tab === 'agents'" class="layout">
            <aside class="sidebar">
              <div class="sidebar-header">
                <span>共 {{ config.agents.length }} 个</span>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-small btn-ghost" @click="openImport" style="padding: 3px 9px;" title="从主面板 Agent 管理导入">
                    <span class="material-symbols-outlined" style="font-size: 1em;">download</span>
                    导入
                  </button>
                  <button class="btn btn-small" @click="addAgent" style="padding: 3px 9px;">
                    <span class="material-symbols-outlined" style="font-size: 1em;">add</span>
                    新建
                  </button>
                </div>
              </div>
              <div class="sidebar-list">
                <EmptyState v-if="config.agents.length === 0" icon="person_add" message="暂无 Agent" />
                <div
                  v-for="(agent, i) in config.agents"
                  :key="i"
                  class="agent-entry"
                  :class="{ active: i === selectedIdx }"
                  @click="selectedIdx = i"
                >
                  <div class="top">
                    <span class="main">{{ agent.chineseName || agent.baseName || '未命名' }}</span>
                    <span class="pill">{{ agent.baseName || '-' }}</span>
                  </div>
                  <div class="sub">{{ agent.modelId || '未设置模型' }}</div>
                </div>
              </div>
            </aside>

            <section v-if="activeAgent" class="editor-card">
              <div class="section">
                <div class="section-head">
                  <span class="material-symbols-outlined icon">badge</span>
                  <h3>身份信息</h3>
                </div>
                <div class="grid-2">
                  <div class="field">
                    <label>中文名 <span class="hint">必填，作为 Agent 标识</span></label>
                    <input v-model="activeAgent.chineseName" placeholder="如：Nova" />
                  </div>
                  <div class="field">
                    <label>Base 名 <span class="hint">英文大写</span></label>
                    <input v-model="activeAgent.baseName" placeholder="如：NOVA" />
                  </div>
                  <div class="field" style="grid-column: 1 / -1;">
                    <label>模型 ID <span class="hint">必填</span></label>
                    <input v-model="activeAgent.modelId" placeholder="如：gemini-2.5-flash" />
                  </div>
                  <div class="field" style="grid-column: 1 / -1;">
                    <label>角色描述 <span class="hint">简短一句话介绍</span></label>
                    <input v-model="activeAgent.description" placeholder="如：擅长数据分析的研究型助手" />
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-head">
                  <span class="material-symbols-outlined icon">tune</span>
                  <h3>模型参数</h3>
                </div>
                <div class="grid-2">
                  <div class="field">
                    <label>Max Output Tokens</label>
                    <input type="number" v-model.number="activeAgent.maxOutputTokens" min="1" />
                  </div>
                  <div class="field">
                    <label>Temperature <span class="hint">0 ~ 2</span></label>
                    <input type="number" step="0.1" min="0" max="2" v-model.number="activeAgent.temperature" />
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-head">
                  <span class="material-symbols-outlined icon">description</span>
                  <h3>System Prompt</h3>
                </div>
                <div class="field">
                  <label>
                    <span>可用 <code v-pre style="background: var(--background-color); padding: 1px 5px; border-radius: 3px; font-size: 0.78rem;">{{MaidName}}</code> 占位</span>
                  </label>
                  <textarea v-model="activeAgent.systemPrompt" rows="8" placeholder="You are a helpful AI assistant."></textarea>
                </div>
              </div>

              <div class="footer-actions">
                <span v-if="dirty" class="dirty-tag">
                  <span class="material-symbols-outlined" style="font-size: 1em;">edit</span>
                  有未保存改动
                </span>
                <button class="btn btn-danger btn-small" @click="removeAgent(selectedIdx)">
                  <span class="material-symbols-outlined" style="font-size: 1em;">delete</span>
                  删除此 Agent
                </button>
              </div>
            </section>

            <section v-else class="editor-card">
              <div class="empty-agent">
                <span class="material-symbols-outlined">arrow_back</span>
                <div>在左侧选择或新建一个 Agent</div>
              </div>
            </section>
          </div>

          <div v-else-if="tab === 'global'" class="editor-card">
            <div class="section">
              <div class="section-head">
                <span class="material-symbols-outlined icon">chat</span>
                <h3>对话上下文</h3>
              </div>
              <div class="grid-2">
                <div class="field">
                  <label>历史轮数上限</label>
                  <input type="number" min="1" max="100" v-model.number="config.maxHistoryRounds" />
                </div>
                <div class="field">
                  <label>上下文 TTL（小时）</label>
                  <input type="number" min="1" v-model.number="config.contextTtlHours" />
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-head">
                <span class="material-symbols-outlined icon">assignment</span>
                <h3>异步委托模式</h3>
              </div>
              <div class="grid-2">
                <div class="field">
                  <label>最大轮数</label>
                  <input type="number" min="1" v-model.number="config.delegationMaxRounds" />
                </div>
                <div class="field">
                  <label>超时（毫秒）</label>
                  <input type="number" min="1000" step="1000" v-model.number="config.delegationTimeout" />
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-head">
                <span class="material-symbols-outlined icon">text_snippet</span>
                <h3>系统级 Prompt 模板</h3>
              </div>
              <div class="field">
                <label>全局系统提示词 <span class="hint">拼接到所有 Agent 的 system 末尾</span></label>
                <textarea v-model="config.globalSystemPrompt" rows="4" placeholder="留空则不附加"></textarea>
              </div>
              <div class="field" style="margin-top: 12px;">
                <label>委托模式 Prompt</label>
                <textarea v-model="config.delegationSystemPrompt" rows="6" placeholder="留空使用内置模板"></textarea>
              </div>
              <div class="field" style="margin-top: 12px;">
                <label>心跳续推 Prompt</label>
                <textarea v-model="config.delegationHeartbeatPrompt" rows="3" placeholder="留空使用内置模板"></textarea>
              </div>
            </div>
          </div>

          <div v-if="loaded" class="footer-actions" style="margin-top: 14px;">
            <span v-if="dirty" class="dirty-tag">
              <span class="material-symbols-outlined" style="font-size: 1em;">edit</span>
              有未保存改动
            </span>
            <button class="btn btn-ghost" @click="load" :disabled="saving">重载</button>
            <button class="btn" @click="save" :disabled="saving || !dirty">
              <span class="material-symbols-outlined">{{ saving ? 'hourglass_top' : 'save' }}</span>
              保存配置
            </button>
          </div>
        </div>

        <BaseModal v-model="showImportModal" title="从 Agent 管理导入" width="560px">
          <div v-if="loadingAgents" style="padding: 32px; text-align: center; color: var(--secondary-text);">
            <span class="material-symbols-outlined" style="font-size: 2rem; opacity: 0.4;">hourglass_top</span>
            <div>加载 Agent 列表中...</div>
          </div>
          <div v-else-if="availableAgents.length === 0" style="padding: 32px; text-align: center; color: var(--secondary-text);">
            主面板 Agent 管理中暂无 Agent
          </div>
          <div v-else>
            <p style="margin: 0 0 14px; font-size: 0.85rem; color: var(--secondary-text);">
              点击下方 Agent 气泡导入（复用中文名 + 系统提示词），模型 ID / 参数需导入后手动补全。
            </p>
            <div class="aa-import-grid">
              <div
                v-for="agent in availableAgents"
                :key="agent.name"
                class="aa-import-chip"
                :class="{ disabled: agent.alreadyImported }"
                :title="agent.alreadyImported ? '已导入，不可重复' : ('导入 ' + agent.name)"
                @click="!agent.alreadyImported && importFromAgent(agent)"
              >
                <span v-if="agent.alreadyImported" class="material-symbols-outlined aa-check">check_circle</span>
                {{ agent.name }}
              </div>
            </div>
          </div>
        </BaseModal>
      </div>
    `,
    setup() {
      const loading = ref(false);
      const saving = ref(false);
      const loaded = ref(false);
      const tab = ref('agents');
      const selectedIdx = ref(0);
      const config = ref({
        maxHistoryRounds: 7, contextTtlHours: 24,
        delegationMaxRounds: 15, delegationTimeout: 300000,
        globalSystemPrompt: '', delegationSystemPrompt: '', delegationHeartbeatPrompt: '',
        agents: [],
      });
      const snapshot = ref('');

      const activeAgent = computed(() => config.value.agents[selectedIdx.value] || null);
      const dirty = computed(() => JSON.stringify(config.value) !== snapshot.value);

      async function load() {
        loading.value = true;
        try {
          const res = await api.get('/config');
          if (!res.success) throw new Error(res.error || '加载失败');
          config.value = res.config;
          snapshot.value = JSON.stringify(config.value);
          loaded.value = true;
          if (selectedIdx.value >= config.value.agents.length) selectedIdx.value = 0;
        } catch (e) {
          showToast('加载失败：' + e.message, 'error');
        } finally {
          loading.value = false;
        }
      }

      async function save() {
        saving.value = true;
        try {
          const res = await api.post('/config', config.value);
          if (!res.success) throw new Error(res.error || '保存失败');
          config.value = res.config;
          snapshot.value = JSON.stringify(config.value);
          showToast('配置已保存，Agent 已热重载', 'success');
        } catch (e) {
          showToast('保存失败：' + e.message, 'error');
        } finally {
          saving.value = false;
        }
      }

      function addAgent() {
        config.value.agents.push(emptyAgent());
        selectedIdx.value = config.value.agents.length - 1;
        tab.value = 'agents';
      }

      function removeAgent(i) {
        if (!confirm(`确定删除「${config.value.agents[i]?.chineseName || 'Agent #' + (i + 1)}」？`)) return;
        config.value.agents.splice(i, 1);
        if (selectedIdx.value >= config.value.agents.length) {
          selectedIdx.value = Math.max(0, config.value.agents.length - 1);
        }
      }

      // 从主面板 Agent 管理导入
      const showImportModal = ref(false);
      const loadingAgents = ref(false);
      const availableAgents = ref([]);

      async function openImport() {
        showImportModal.value = true;
        loadingAgents.value = true;
        try {
          const res = await fetch('/admin_api/agents/map', { credentials: 'include' });
          if (!res.ok) throw new Error(`Agent map API 返回 ${res.status}`);
          const map = await res.json();
          const usedNames = new Set(config.value.agents.map(a => a.chineseName).filter(Boolean));
          availableAgents.value = Object.entries(map).map(([name, path]) => ({
            name,
            path: String(path || '').replace(/\\/g, '/'),
            filePath: path,
            alreadyImported: usedNames.has(name),
          }));
        } catch (e) {
          showToast('获取 Agent 列表失败：' + e.message, 'error');
          availableAgents.value = [];
        } finally {
          loadingAgents.value = false;
        }
      }

      async function importFromAgent(agent) {
        try {
          // 取 .txt 内容作为 systemPrompt
          const encodedPath = encodeURIComponent(agent.filePath);
          const res = await fetch(`/admin_api/agents/${encodedPath}`, { credentials: 'include' });
          let systemPrompt = '';
          if (res.ok) {
            const data = await res.json();
            systemPrompt = typeof data === 'string' ? data : (data.content || data.text || '');
          } else {
            console.warn('[AgentAssistant] 读取 Agent 文件失败，降级为默认模板');
            systemPrompt = `You are a helpful AI assistant named {{MaidName}}.`;
          }

          const newAgent = emptyAgent();
          newAgent.chineseName = agent.name;
          newAgent.baseName = agent.name.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'AGENT';
          newAgent.systemPrompt = systemPrompt || newAgent.systemPrompt;
          newAgent.description = `从主面板 Agent 导入（${agent.path}）`;

          config.value.agents.push(newAgent);
          selectedIdx.value = config.value.agents.length - 1;
          tab.value = 'agents';
          showImportModal.value = false;
          showToast(`已导入「${agent.name}」，请补全 modelId 和模型参数后保存`, 'success');
        } catch (e) {
          showToast('导入失败：' + e.message, 'error');
        }
      }

      onMounted(load);
      return {
        loading, saving, loaded, tab, config, selectedIdx, activeAgent, dirty,
        load, save, addAgent, removeAgent,
        showImportModal, loadingAgents, availableAgents, openImport, importFromAgent,
      };
    },
  };

  P.register('AgentAssistant', AgentAssistantPage);
})();
