// VCPTavern 管理面板（native 模式）
// 通过 /admin_api/plugins/VCPTavern/api/presets/* 管理预设 JSON
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[VCPTavern] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted, watch } = P.Vue;
  const { pluginApi, showToast, formatTime } = P;
  const api = pluginApi('VCPTavern');

  const styleId = 'vcptavern-style';
  if (!document.getElementById(styleId)) {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
      .tavern-page .two-col { display: grid; grid-template-columns: minmax(240px, 300px) 1fr; gap: 16px; align-items: start; }
      @media (max-width: 900px) { .tavern-page .two-col { grid-template-columns: 1fr; } }
      .tavern-page .sidebar { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px; max-height: 70vh; overflow-y: auto; }
      .tavern-page .preset-item { padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .tavern-page .preset-item:hover { background: var(--background-color); }
      .tavern-page .preset-item.active { background: var(--accent-bg); color: var(--button-bg); }
      .tavern-page .preset-item.active .hint { color: var(--button-bg); opacity: 0.7; }
      .tavern-page .preset-item .name { font-size: 0.88rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .tavern-page .preset-item .hint { font-size: 0.7rem; opacity: 0.55; font-family: monospace; }
      .tavern-page .editor { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .tavern-page .editor .name-input { width: 100%; padding: 8px 12px; background: var(--input-bg, var(--background-color)); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-size: 0.92rem; font-weight: 500; }
      .tavern-page .editor .json-area { width: 100%; min-height: 420px; padding: 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 0.82rem; line-height: 1.55; resize: vertical; }
      .tavern-page .editor .json-area.invalid { border-color: #e74c3c; }
      .tavern-page .editor-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
      .tavern-page .editor-actions .status { margin-right: auto; color: var(--secondary-text); font-size: 0.82rem; }
      .tavern-page .editor-actions .status.error { color: #e74c3c; }
      .tavern-page .usage-hint { background: var(--background-color); padding: 10px 12px; border-radius: 6px; font-size: 0.8rem; color: var(--secondary-text); line-height: 1.5; }
      .tavern-page .usage-hint code { color: var(--primary-text); font-family: monospace; background: var(--card-bg); padding: 1px 5px; border-radius: 3px; }
    `;
    document.head.appendChild(el);
  }

  const VCPTavernPage = {
    name: 'VCPTavernPage',
    template: /* html */ `
      <div class="page tavern-page">
        <PageHeader title="Tavern 预设" subtitle="VCPTavern 消息预处理器的 JSON 预设管理（通过 {{'{'}}{{'{'}} VCPTavern::预设名 {{'}'}}{{'}'}} 在 system prompt 触发）" icon="local_bar">
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
          <div class="usage-hint" style="margin-bottom: 16px;">
            用法：在 Agent 的 system prompt 里写 <code>{{'{'}}{{'{'}} VCPTavern::预设名 {{'}'}}{{'}'}}</code>，VCPTavern 会自动替换为对应预设的内容。预设名仅允许英文/数字/下划线/连字符。
          </div>

          <EmptyState v-if="loading && names.length === 0" icon="hourglass_top" message="加载预设..." />

          <div v-else class="two-col">
            <aside class="sidebar">
              <EmptyState v-if="names.length === 0" icon="local_bar" message="暂无预设，点击右上角新建" />
              <div v-else
                v-for="name in names"
                :key="name"
                class="preset-item"
                :class="{ active: name === selectedName }"
                @click="select(name)"
              >
                <span class="name">{{ name }}</span>
                <span v-if="isNew(name)" class="hint">新</span>
              </div>
            </aside>

            <section v-if="selectedName" class="editor">
              <input
                v-model="editingName"
                class="name-input"
                placeholder="预设名（英文/数字/_-）"
                :readonly="!isNew(selectedName)"
                :title="isNew(selectedName) ? '可编辑' : '已存在的预设名不可修改，如需重命名请新建'"
              />
              <textarea
                v-model="editingContent"
                class="json-area"
                :class="{ invalid: jsonError }"
                spellcheck="false"
                placeholder='{"system":"xxx","messages":[...]}'
              ></textarea>

              <div class="editor-actions">
                <span class="status" :class="{ error: jsonError }">
                  {{ statusMsg }}
                </span>
                <button class="btn btn-ghost" @click="format" :disabled="jsonError || !editingContent">
                  <span class="material-symbols-outlined">code</span>
                  格式化
                </button>
                <button v-if="!isNew(selectedName)" class="btn btn-danger" @click="del">
                  <span class="material-symbols-outlined">delete</span>
                  删除
                </button>
                <button class="btn" @click="save" :disabled="saving || !!jsonError || !editingName">
                  <span class="material-symbols-outlined">{{ saving ? 'hourglass_top' : 'save' }}</span>
                  保存
                </button>
              </div>
            </section>

            <EmptyState v-else icon="arrow_back" message="选择左侧预设编辑，或新建一个" />
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
      const editingContent = ref('');
      const pendingNew = ref(new Set());

      const jsonError = computed(() => {
        if (!editingContent.value.trim()) return null;
        try { JSON.parse(editingContent.value); return null; }
        catch (e) { return e.message; }
      });
      const statusMsg = computed(() => {
        if (jsonError.value) return 'JSON 语法错误：' + jsonError.value;
        if (saving.value) return '保存中...';
        return '';
      });

      function isNew(name) { return pendingNew.value.has(name); }

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
        if (pendingNew.value.has(name)) {
          editingContent.value = '';
          return;
        }
        try {
          const data = await api.get(`/presets/${encodeURIComponent(name)}`);
          editingContent.value = JSON.stringify(data, null, 2);
        } catch (e) {
          showToast('加载预设失败：' + e.message, 'error');
          editingContent.value = '';
        }
      }

      function newPreset() {
        let idx = 1;
        let name = '新预设';
        while (names.value.includes(name) || pendingNew.value.has(name)) {
          name = `新预设_${idx++}`;
        }
        pendingNew.value.add(name);
        names.value = [...names.value, name];
        editingName.value = name;
        editingContent.value = '{\n  \n}';
        selectedName.value = name;
      }

      async function save() {
        if (jsonError.value) { showToast('JSON 格式无效', 'error'); return; }
        const finalName = editingName.value.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!finalName) { showToast('预设名无效，只允许英文/数字/下划线/连字符', 'error'); return; }

        saving.value = true;
        try {
          const data = JSON.parse(editingContent.value || '{}');
          await api.post(`/presets/${encodeURIComponent(finalName)}`, data);
          showToast(`预设已保存：${finalName}`, 'success');

          if (isNew(selectedName.value) && selectedName.value !== finalName) {
            pendingNew.value.delete(selectedName.value);
            names.value = names.value.filter(n => n !== selectedName.value);
          } else if (isNew(selectedName.value)) {
            pendingNew.value.delete(selectedName.value);
          }

          if (!names.value.includes(finalName)) names.value = [...names.value, finalName].sort();
          selectedName.value = finalName;
          editingName.value = finalName;
        } catch (e) {
          showToast('保存失败：' + e.message, 'error');
        } finally {
          saving.value = false;
        }
      }

      async function del() {
        if (!confirm(`确定删除预设「${selectedName.value}」？此操作不可撤销。`)) return;
        try {
          await api.delete(`/presets/${encodeURIComponent(selectedName.value)}`);
          showToast('预设已删除', 'success');
          names.value = names.value.filter(n => n !== selectedName.value);
          selectedName.value = '';
          editingName.value = '';
          editingContent.value = '';
        } catch (e) {
          showToast('删除失败：' + e.message, 'error');
        }
      }

      function format() {
        try {
          editingContent.value = JSON.stringify(JSON.parse(editingContent.value), null, 2);
          showToast('已格式化', 'success');
        } catch (e) {
          showToast('JSON 无效，无法格式化', 'error');
        }
      }

      onMounted(load);
      return { loading, saving, names, selectedName, editingName, editingContent, jsonError, statusMsg, isNew, load, select, newPreset, save, del, format };
    },
  };

  P.register('VCPTavern', VCPTavernPage);
})();
