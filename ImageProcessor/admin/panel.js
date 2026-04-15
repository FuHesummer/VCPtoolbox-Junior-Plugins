// ImageProcessor 管理面板（native 模式）
// 通过 /admin_api/plugins/ImageProcessor/api/* 访问 SQLite 多模态缓存
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[ImageProcessor] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted, watch } = P.Vue;
  const { pluginApi, showToast, formatTime } = P;
  const api = pluginApi('ImageProcessor');

  const styleId = 'image-processor-style';
  if (!document.getElementById(styleId)) {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
      .ip-page .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
      .ip-page .search-input { flex: 1; min-width: 240px; padding: 8px 12px; background: var(--input-bg, var(--background-color)); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); font-size: 0.88rem; }
      .ip-page .search-input:focus { border-color: var(--accent-bg); outline: none; }
      .ip-page .stats { font-size: 0.82rem; color: var(--secondary-text); margin-right: auto; }
      .ip-page .cache-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
      .ip-page .cache-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.15s; }
      .ip-page .cache-card:hover { border-color: var(--accent-bg); }
      .ip-page .cache-card .preview { aspect-ratio: 4 / 3; background: var(--background-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .ip-page .cache-card .preview img { width: 100%; height: 100%; object-fit: cover; }
      .ip-page .cache-card .preview .icon { color: var(--secondary-text); opacity: 0.5; font-size: 2rem; }
      .ip-page .cache-card .desc { font-size: 0.82rem; color: var(--primary-text); line-height: 1.4; max-height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .ip-page .cache-card .meta { font-size: 0.7rem; color: var(--secondary-text); display: flex; justify-content: space-between; opacity: 0.8; }
      .ip-page .cache-card .actions { display: flex; gap: 4px; }
      .ip-page .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px; font-size: 0.85rem; color: var(--secondary-text); }
      .ip-page .pagination .page-btn { padding: 5px 11px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-text); cursor: pointer; font-size: 0.82rem; }
      .ip-page .pagination .page-btn:hover:not(:disabled) { border-color: var(--accent-bg); }
      .ip-page .pagination .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .ip-page .pagination .page-btn.active { background: var(--accent-bg); color: var(--button-bg); border-color: var(--accent-bg); }
    `;
    document.head.appendChild(el);
  }

  const ImageProcessorPage = {
    name: 'ImageProcessorPage',
    template: /* html */ `
      <div class="page ip-page">
        <PageHeader title="多模态缓存" subtitle="ImageProcessor 插件的 SQLite 缓存管理（图片/音视频的 LLM 描述缓存）" icon="imagesmode">
          <template #actions>
            <button class="btn btn-ghost" @click="load()" :disabled="loading">
              <span class="material-symbols-outlined">{{ loading ? 'hourglass_top' : 'refresh' }}</span>
              刷新
            </button>
            <button class="btn btn-danger" @click="clearAll" :disabled="loading || total === 0">
              <span class="material-symbols-outlined">delete_sweep</span>
              清空缓存
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <div class="toolbar">
            <input
              v-model="searchInput"
              @keyup.enter="doSearch"
              class="search-input"
              placeholder="按描述搜索（回车触发）..."
            />
            <button class="btn" @click="doSearch">
              <span class="material-symbols-outlined">search</span>
              搜索
            </button>
            <span class="stats">共 {{ total }} 条缓存 · 第 {{ page }}/{{ totalPages }} 页</span>
          </div>

          <EmptyState v-if="loading && items.length === 0" icon="hourglass_top" message="加载缓存中..." />
          <EmptyState v-else-if="items.length === 0" icon="inbox" :message="search ? '没有匹配的缓存项' : '暂无缓存数据'" />

          <div v-else class="cache-grid">
            <article v-for="item in items" :key="item.hash" class="cache-card">
              <div class="preview">
                <img v-if="isImage(item)" :src="buildDataUrl(item)" :alt="item.description" @error="onImgError($event)" />
                <span v-else class="material-symbols-outlined icon">
                  {{ mimeIcon(item.mimeType) }}
                </span>
              </div>
              <div class="desc" :title="item.description">{{ item.description || '无描述' }}</div>
              <div class="meta">
                <span>{{ (item.mimeType || '').split('/')[0] || '?' }}</span>
                <span>{{ fmtTime(item.timestamp) }}</span>
              </div>
              <div class="actions">
                <button class="btn btn-small btn-ghost" style="flex: 1;" @click="copyHash(item.hash)">
                  <span class="material-symbols-outlined" style="font-size: 0.95em;">content_copy</span>
                  Hash
                </button>
                <button class="btn btn-small btn-danger" @click="remove(item.hash)">
                  <span class="material-symbols-outlined" style="font-size: 0.95em;">delete</span>
                </button>
              </div>
            </article>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button class="page-btn" @click="go(page - 1)" :disabled="page === 1">‹</button>
            <button
              v-for="p in visiblePages"
              :key="p"
              class="page-btn"
              :class="{ active: p === page }"
              @click="go(p)"
            >{{ p }}</button>
            <button class="page-btn" @click="go(page + 1)" :disabled="page === totalPages">›</button>
          </div>
        </div>
      </div>
    `,
    setup() {
      const loading = ref(false);
      const items = ref([]);
      const total = ref(0);
      const page = ref(1);
      const pageSize = ref(20);
      const searchInput = ref('');
      const search = ref('');

      const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
      const visiblePages = computed(() => {
        const out = [];
        const tp = totalPages.value;
        const cur = page.value;
        const start = Math.max(1, cur - 2);
        const end = Math.min(tp, start + 4);
        for (let p = start; p <= end; p++) out.push(p);
        return out;
      });

      async function load(p) {
        loading.value = true;
        if (p) page.value = p;
        try {
          const res = await api.get(`/multimodal-cache?page=${page.value}&pageSize=${pageSize.value}&search=${encodeURIComponent(search.value)}`);
          if (!res.success) throw new Error(res.error || '加载失败');
          items.value = res.items || [];
          total.value = res.total || 0;
        } catch (e) {
          showToast('加载失败：' + e.message, 'error');
        } finally {
          loading.value = false;
        }
      }

      function doSearch() {
        search.value = searchInput.value.trim();
        load(1);
      }

      function go(p) {
        if (p < 1 || p > totalPages.value) return;
        load(p);
      }

      async function remove(hash) {
        if (!confirm('确定删除这条缓存项？此操作不可撤销。')) return;
        try {
          await api.delete(`/multimodal-cache/${encodeURIComponent(hash)}`);
          showToast('已删除', 'success');
          await load();
        } catch (e) {
          showToast('删除失败：' + e.message, 'error');
        }
      }

      async function clearAll() {
        if (!confirm(`将清空全部 ${total.value} 条缓存，确定继续？`)) return;
        try {
          const res = await api.post('/multimodal-cache/clear');
          showToast(`已清空 ${res.deleted || 0} 条`, 'success');
          await load(1);
        } catch (e) {
          showToast('清空失败：' + e.message, 'error');
        }
      }

      function copyHash(hash) {
        navigator.clipboard?.writeText(hash).then(
          () => showToast('Hash 已复制', 'success'),
          () => showToast('复制失败', 'error')
        );
      }

      function isImage(item) {
        return (item.mimeType || '').startsWith('image/') && item.base64Preview;
      }
      function buildDataUrl(item) {
        return `data:${item.mimeType};base64,${item.base64Preview}`;
      }
      function onImgError(e) {
        e.target.style.display = 'none';
      }
      function mimeIcon(mime) {
        if (!mime) return 'description';
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('audio/')) return 'music_note';
        if (mime.startsWith('video/')) return 'movie';
        return 'description';
      }
      function fmtTime(ts) {
        if (!ts) return '';
        const n = typeof ts === 'number' ? ts : Number(ts);
        const ms = n > 1e12 ? n : n * 1000;
        return formatTime ? formatTime(ms) : new Date(ms).toLocaleDateString();
      }

      onMounted(() => load(1));
      return {
        loading, items, total, page, totalPages, visiblePages, searchInput, search,
        load, doSearch, go, remove, clearAll, copyHash,
        isImage, buildDataUrl, onImgError, mimeIcon, fmtTime,
      };
    },
  };

  P.register('ImageProcessor', ImageProcessorPage);
})();
