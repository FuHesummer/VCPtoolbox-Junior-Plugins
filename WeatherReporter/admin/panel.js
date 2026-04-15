// WeatherReporter 管理面板（native 模式）
// 调用主项目 /admin_api/weather 展示当前天气 + 未来预报
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[WeatherReporter] __VCPPanel 未就绪'); return; }

  const { ref, computed, onMounted } = P.Vue;
  const { showToast } = P;

  const styleId = 'weather-reporter-style';
  if (!document.getElementById(styleId)) {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
      .weather-page .weather-grid { display: grid; grid-template-columns: minmax(280px, 360px) 1fr; gap: 16px; align-items: start; }
      @media (max-width: 900px) { .weather-page .weather-grid { grid-template-columns: 1fr; } }
      .weather-page .current-card { padding: 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; }
      .weather-page .current-temp { font-size: 2.8rem; font-weight: 300; color: var(--primary-text); line-height: 1; }
      .weather-page .current-temp .unit { font-size: 1.1rem; opacity: 0.55; margin-left: 4px; }
      .weather-page .current-desc { font-size: 0.95rem; color: var(--secondary-text); margin-top: 4px; }
      .weather-page .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
      .weather-page .stat { background: var(--background-color); padding: 10px; border-radius: 8px; text-align: center; }
      .weather-page .stat .label { font-size: 0.72rem; color: var(--secondary-text); opacity: 0.75; margin-bottom: 3px; }
      .weather-page .stat .value { font-size: 0.95rem; color: var(--primary-text); font-weight: 500; }
      .weather-page .forecast-card { padding: 16px 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; }
      .weather-page .forecast-list { display: flex; flex-direction: column; }
      .weather-page .forecast-item { display: grid; grid-template-columns: 110px 1fr auto; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.88rem; }
      .weather-page .forecast-item:last-child { border-bottom: none; }
      .weather-page .forecast-item .date { color: var(--secondary-text); }
      .weather-page .forecast-item .text { color: var(--primary-text); }
      .weather-page .forecast-item .range { color: var(--primary-text); font-variant-numeric: tabular-nums; font-weight: 500; }
      .weather-page .error-banner { padding: 16px; background: rgba(220, 60, 60, 0.08); border: 1px solid rgba(220, 60, 60, 0.3); border-radius: 8px; color: var(--danger-text, #c0392b); }
      .weather-page .error-banner small { display: block; margin-top: 6px; opacity: 0.7; font-size: 0.8rem; }
    `;
    document.head.appendChild(el);
  }

  const WeatherPage = {
    name: 'WeatherPage',
    template: /* html */ `
      <div class="page weather-page">
        <PageHeader title="天气预报" subtitle="实时天气 + 未来预报" icon="partly_cloudy_day">
          <template #actions>
            <button class="btn btn-ghost" @click="load" :disabled="loading">
              <span class="material-symbols-outlined">{{ loading ? 'hourglass_top' : 'refresh' }}</span>
              刷新
            </button>
          </template>
        </PageHeader>

        <div class="content" style="padding: 0 24px 24px;">
          <EmptyState v-if="loading && !data" icon="hourglass_top" message="加载天气数据中..." />

          <div v-else-if="error" class="error-banner">
            {{ error }}
            <small>请确认 WeatherReporter 插件已启用并配置了 API Key（VarCity / WeatherKey / WeatherUrl）。</small>
          </div>

          <div v-else-if="data" class="weather-grid">
            <section class="current-card">
              <div class="current-temp">
                {{ data.temp ?? '--' }}<span class="unit">°C</span>
              </div>
              <div class="current-desc">{{ data.text || '未知' }}</div>
              <div class="stat-row">
                <div class="stat"><div class="label">湿度</div><div class="value">{{ data.humidity ?? '--' }}%</div></div>
                <div class="stat"><div class="label">风速</div><div class="value">{{ data.windSpeed ?? '--' }} km/h</div></div>
                <div class="stat"><div class="label">气压</div><div class="value">{{ data.pressure ?? '--' }} hPa</div></div>
              </div>
            </section>

            <section v-if="hasForecast" class="forecast-card">
              <h3 style="margin: 0 0 12px; font-size: 0.95rem; font-weight: 600; color: var(--primary-text);">
                未来预报
              </h3>
              <div class="forecast-list">
                <div v-for="(f, idx) in data.forecast" :key="idx" class="forecast-item">
                  <span class="date">{{ f.date }}</span>
                  <span class="text">{{ f.text }}</span>
                  <span class="range">{{ f.tempMin }}~{{ f.tempMax }}°C</span>
                </div>
              </div>
            </section>

            <EmptyState v-else icon="info" message="暂无未来预报数据（可能未配置 forecastDays）" />
          </div>
        </div>
      </div>
    `,
    setup() {
      const loading = ref(false);
      const error = ref('');
      const data = ref(null);
      const hasForecast = computed(() => Array.isArray(data.value?.forecast) && data.value.forecast.length > 0);

      async function load() {
        loading.value = true;
        error.value = '';
        try {
          const res = await fetch('/admin_api/weather', { credentials: 'include' });
          if (!res.ok) throw new Error(`天气 API 返回 ${res.status}`);
          data.value = await res.json();
        } catch (e) {
          error.value = e.message || '加载失败';
          if (data.value) showToast('刷新失败：' + e.message, 'error');
        } finally {
          loading.value = false;
        }
      }

      onMounted(load);
      return { loading, error, data, hasForecast, load };
    },
  };

  P.register('WeatherReporter', WeatherPage);
})();
