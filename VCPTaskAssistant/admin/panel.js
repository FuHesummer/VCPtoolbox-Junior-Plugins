// VCPTaskAssistant 管理面板（native 模式）
// 调用主项目 /admin_api/task-assistant/* 管理定时任务
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[VCPTaskAssistant] __VCPPanel 未就绪'); return; }

  const { ref, onMounted } = P.Vue;
  const { showToast } = P;

  const styleId = 'task-assistant-style';
  if (!document.getElementById(styleId)) {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
      .ta-page .task-card { display: grid; grid-template-columns: 14px 1fr auto; gap: 14px; align-items: center; padding: 14px 16px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 8px; }
      .ta-page .task-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--secondary-text); opacity: 0.3; }
      .ta-page .task-dot.active { background: #22c55e; opacity: 1; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
      .ta-page .task-dot.paused { background: #f59e0b; opacity: 0.9; }
      .ta-page .task-info .name { font-size: 0.92rem; font-weight: 600; color: var(--primary-text); margin-bottom: 3px; }
      .ta-page .task-info .meta { font-size: 0.76rem; color: var(--secondary-text); display: flex; gap: 12px; flex-wrap: wrap; }
      .ta-page .task-info .meta code { background: var(--background-color); padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--primary-text); }
      .ta-page .task-actions { display: flex; gap: 6px; }
    `;
    document.head.appendChild(el);
  }

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
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <EmptyState v-if="loading && tasks.length === 0" icon="hourglass_top" message="加载任务配置..." />

          <div v-else-if="error" class="card" style="padding: 18px; color: var(--danger-text, #c0392b);">
            {{ error }}
            <div style="margin-top: 6px; font-size: 0.82rem; color: var(--secondary-text);">
              请确认 VCPTaskAssistant 插件已启用。任务配置的编辑请前往对应的 config 文件。
            </div>
          </div>

          <EmptyState v-else-if="tasks.length === 0" icon="event_busy" message="暂无配置的任务" />

          <div v-else>
            <div style="color: var(--secondary-text); font-size: 0.82rem; margin-bottom: 10px;">
              共 {{ tasks.length }} 个任务 · {{ activeCount }} 启用 · {{ tasks.length - activeCount }} 暂停
            </div>

            <article v-for="(task, i) in tasks" :key="i" class="task-card">
              <span class="task-dot" :class="task.enabled ? 'active' : 'paused'"></span>
              <div class="task-info">
                <div class="name">{{ task.name || '未命名任务' }}</div>
                <div class="meta">
                  <span v-if="task.schedule"><code>{{ task.schedule }}</code></span>
                  <span v-else style="opacity: 0.6;">未设置时间</span>
                  <span>{{ task.target || '未指定目标' }}</span>
                </div>
              </div>
              <div class="task-actions">
                <button class="btn btn-small" @click="trigger(i)" :disabled="busy[i]">
                  <span class="material-symbols-outlined" style="font-size: 1em;">bolt</span>
                  触发
                </button>
                <button class="btn btn-small btn-ghost" @click="toggle(i)" :disabled="busy[i]">
                  <span class="material-symbols-outlined" style="font-size: 1em;">
                    {{ task.enabled ? 'pause' : 'play_arrow' }}
                  </span>
                  {{ task.enabled ? '暂停' : '启用' }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    `,
    setup() {
      const loading = ref(false);
      const error = ref('');
      const tasks = ref([]);
      const busy = ref({});

      const activeCount = P.Vue.computed(() => tasks.value.filter(t => t.enabled).length);

      async function load() {
        loading.value = true;
        error.value = '';
        try {
          const res = await fetch('/admin_api/task-assistant/config', { credentials: 'include' });
          if (!res.ok) throw new Error(`任务 API 返回 ${res.status}`);
          const cfg = await res.json();
          tasks.value = Array.isArray(cfg.tasks) ? cfg.tasks : [];
        } catch (e) {
          error.value = e.message || '加载失败';
        } finally {
          loading.value = false;
        }
      }

      async function trigger(i) {
        busy.value[i] = true;
        try {
          const res = await fetch(`/admin_api/task-assistant/trigger/${i}`, {
            method: 'POST', credentials: 'include',
          });
          if (!res.ok) throw new Error(`触发失败 ${res.status}`);
          showToast(`已触发任务：${tasks.value[i]?.name || `#${i}`}`, 'success');
        } catch (e) {
          showToast('触发失败：' + e.message, 'error');
        } finally {
          busy.value[i] = false;
        }
      }

      async function toggle(i) {
        busy.value[i] = true;
        try {
          const res = await fetch(`/admin_api/task-assistant/toggle/${i}`, {
            method: 'POST', credentials: 'include',
          });
          if (!res.ok) throw new Error(`切换失败 ${res.status}`);
          showToast('已切换任务状态', 'success');
          await load();
        } catch (e) {
          showToast('切换失败：' + e.message, 'error');
        } finally {
          busy.value[i] = false;
        }
      }

      onMounted(load);
      return { loading, error, tasks, busy, activeCount, load, trigger, toggle };
    },
  };

  P.register('VCPTaskAssistant', TaskAssistantPage);
})();
