// SkillBridge 管理面板（native 模式 · 双栏布局 · VCP 面板风格）
(function () {
  const P = window.__VCPPanel;
  if (!P) { console.error('[SkillBridge] __VCPPanel 未就绪'); return; }

  const { ref, onMounted, computed, watch, h, nextTick } = P.Vue;
  const { showToast } = P;

  const styleId = 'skillbridge-style';
  const old = document.getElementById(styleId);
  if (old) old.remove();
  const s = document.createElement('style');
  s.id = styleId;
  s.textContent = `
    .sb-page { display: flex; gap: 18px; height: calc(100vh - 120px); min-height: 560px; }

    /* ===== Left sidebar ===== */
    .sb-page .sb-sidebar { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
    .sb-page .sb-sidebar h3 { margin: 0; font-size: 0.95rem; color: var(--primary-text); display: flex; justify-content: space-between; align-items: baseline; font-weight: 600; }
    .sb-page .sb-sidebar h3 .sb-count { font-size: 0.72rem; color: var(--secondary-text); font-weight: normal; }
    .sb-page .sb-search { padding: 8px 12px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--primary-text); font-size: 0.85rem; font-family: inherit; width: 100%; box-sizing: border-box; }
    .sb-page .sb-search:focus { outline: none; border-color: var(--button-bg, #6366f1); }

    .sb-page .sb-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 2px; list-style: none; margin: 0; }
    .sb-page .sb-item { display: grid; grid-template-columns: 36px 1fr auto; gap: 10px; align-items: center; padding: 9px 12px; background: var(--tertiary-bg, var(--card-bg)); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.15s; }
    .sb-page .sb-item:hover { transform: translateX(2px); box-shadow: 0 2px 8px rgba(180, 120, 140, 0.1); border-color: var(--button-bg, #6366f1); }
    .sb-page .sb-item.active { background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(180, 120, 160, 0.08)); border-color: var(--button-bg, #6366f1); box-shadow: 0 0 0 1px var(--button-bg, #6366f1) inset; }
    .sb-page .sb-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 0.85rem; background: linear-gradient(135deg, #818cf8, #6366f1); }
    .sb-page .sb-item-info { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .sb-page .sb-item-name { font-size: 0.88rem; color: var(--primary-text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sb-page .sb-item-meta { font-size: 0.72rem; color: var(--secondary-text); }
    .sb-page .sb-status { width: 7px; height: 7px; border-radius: 50%; }
    .sb-page .sb-status.ok { background: #22c55e; }
    .sb-page .sb-status.missing { background: #ef4444; }

    /* Sidebar actions */
    .sb-page .sb-sidebar-actions { display: flex; gap: 6px; }

    /* ===== Right main ===== */
    .sb-page .sb-main { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0; overflow: hidden; }
    .sb-page .sb-empty { background: var(--card-bg); border: 1px dashed var(--border-color); border-radius: 10px; padding: 60px 20px; text-align: center; color: var(--secondary-text); font-size: 0.88rem; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
    .sb-page .sb-empty .material-symbols-outlined { font-size: 48px; opacity: 0.3; }

    /* Modal */
    .sb-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .sb-modal { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; width: 600px; max-width: 90vw; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
    .sb-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: var(--background-color); }
    .sb-modal-head h4 { margin: 0; font-size: 0.92rem; font-weight: 600; color: var(--primary-text); }
    .sb-modal-body { padding: 16px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    .sb-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-color); }
    .sb-input { padding: 8px 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--primary-text); font-size: 0.85rem; font-family: inherit; width: 100%; box-sizing: border-box; }
    .sb-input:focus { outline: none; border-color: var(--button-bg, #6366f1); }
    .sb-textarea { padding: 10px 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--primary-text); font-size: 0.82rem; font-family: 'JetBrains Mono', monospace; line-height: 1.5; resize: vertical; min-height: 200px; width: 100%; box-sizing: border-box; }
    .sb-textarea:focus { outline: none; border-color: var(--button-bg, #6366f1); }
    .sb-label { font-size: 0.8rem; font-weight: 500; color: var(--primary-text); margin-bottom: 2px; }
    .sb-edit-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 8px; }

    /* Toolbar */
    .sb-page .sb-toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 10px 14px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; }
    .sb-page .sb-toolbar .sb-title { font-size: 0.95rem; font-weight: 600; color: var(--primary-text); margin-right: auto; display: flex; gap: 10px; align-items: baseline; }
    .sb-page .sb-toolbar .sb-title .sb-meta { font-size: 0.74rem; color: var(--secondary-text); font-weight: normal; }

    /* Buttons */
    .sb-page .sb-btn { padding: 7px 12px; background: var(--button-bg, #6366f1); color: #fff; border: 1px solid var(--button-bg, #6366f1); border-radius: 6px; cursor: pointer; font-size: 0.82rem; font-weight: 500; transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px; font-family: inherit; }
    .sb-page .sb-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .sb-page .sb-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; filter: none; }
    .sb-page .sb-btn .material-symbols-outlined { font-size: 18px; }
    .sb-page .sb-btn.ghost { background: transparent; color: var(--primary-text); border-color: var(--border-color); }
    .sb-page .sb-btn.ghost:hover { background: var(--accent-bg, rgba(99, 102, 241, 0.08)); border-color: var(--button-bg, #6366f1); color: var(--button-bg, #6366f1); }
    .sb-page .sb-btn.danger { background: transparent; color: var(--primary-text); border-color: var(--border-color); }
    .sb-page .sb-btn.danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
    .sb-page .sb-btn.compact { padding: 5px 9px; font-size: 0.78rem; }

    /* Detail panels */
    .sb-page .sb-detail { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 2px 2px 8px; }
    .sb-page .sb-section { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
    .sb-page .sb-section-head { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; background: var(--background-color); border-bottom: 1px solid var(--border-color); }
    .sb-page .sb-section-title { font-size: 0.85rem; font-weight: 600; color: var(--primary-text); display: flex; align-items: center; gap: 6px; }
    .sb-page .sb-section-title .material-symbols-outlined { font-size: 17px; color: var(--button-bg, #6366f1); }
    .sb-page .sb-section-body { padding: 12px 14px; font-size: 0.82rem; color: var(--primary-text); line-height: 1.6; }

    /* Info grid */
    .sb-page .sb-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .sb-page .sb-info-item { background: var(--background-color); border-radius: 8px; padding: 10px 12px; }
    .sb-page .sb-info-label { font-size: 0.72rem; color: var(--secondary-text); margin-bottom: 3px; }
    .sb-page .sb-info-value { font-size: 0.88rem; font-weight: 500; color: var(--primary-text); }

    /* Content preview */
    .sb-page .sb-content-preview { max-height: 400px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; white-space: pre-wrap; line-height: 1.6; color: var(--secondary-text); background: var(--background-color); border-radius: 8px; padding: 12px; }

    /* Subdirs tags */
    .sb-page .sb-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .sb-page .sb-tag { font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; background: var(--accent-bg, rgba(99, 102, 241, 0.1)); color: var(--button-bg, #6366f1); display: flex; align-items: center; gap: 3px; }
    .sb-page .sb-tag .material-symbols-outlined { font-size: 13px; }

    /* Tabs */
    .sb-page .sb-tabs { display: flex; gap: 2px; background: var(--background-color); border-radius: 8px; padding: 2px; }
    .sb-page .sb-tab { padding: 6px 12px; border: none; background: transparent; color: var(--secondary-text); font-size: 0.8rem; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .sb-page .sb-tab.active { background: var(--button-bg, #6366f1); color: #fff; }
    .sb-page .sb-tab:hover:not(.active) { background: var(--accent-bg, rgba(99,102,241,0.08)); }
  `;
  document.head.appendChild(s);

  const API = '/admin_api/plugins/SkillBridge/api';

  P.register('SkillBridge', {
    setup() {
      const activeTab = ref('skill');
      const skills = ref([]);
      const loading = ref(false);
      const selected = ref(null);
      const detail = ref(null);
      const detailLoading = ref(false);
      const rescanning = ref(false);
      const search = ref('');
      const showContent = ref(false);
      const editing = ref(false);
      const editContent = ref('');
      const showCreateModal = ref(false);
      const newSkillName = ref('');
      const newSkillContent = ref('');
      const creating = ref(false);

      const filtered = computed(() => {
        const q = search.value.toLowerCase().trim();
        if (!q) return skills.value;
        return skills.value.filter(s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
      });

      async function loadSkills() {
        loading.value = true;
        try {
          const res = await fetch(`${API}/skills?type=${activeTab.value}`, { credentials: 'include' });
          const data = await res.json();
          if (data.success) skills.value = data.skills;
        } catch (e) { showToast('加载失败: ' + e.message, 'error'); }
        finally { loading.value = false; }
      }

      async function selectSkill(name) {
        selected.value = name;
        detailLoading.value = true;
        showContent.value = false;
        try {
          const res = await fetch(`${API}/skills/${encodeURIComponent(name)}?type=${activeTab.value}`, { credentials: 'include' });
          const data = await res.json();
          if (data.success) detail.value = data.skill;
        } catch (e) { showToast('加载详情失败', 'error'); }
        finally { detailLoading.value = false; }
      }

      async function deleteSkill(name) {
        if (!confirm(`确认删除技能 "${name}"？\n此操作不可恢复！`)) return;
        try {
          const res = await fetch(`${API}/skills/${encodeURIComponent(name)}?type=${activeTab.value}`, { method: 'DELETE', credentials: 'include' });
          const data = await res.json();
          if (data.success) {
            showToast(`已删除 ${name}`, 'success');
            selected.value = null;
            detail.value = null;
            await loadSkills();
          } else showToast('删除失败: ' + data.error, 'error');
        } catch (e) { showToast('删除出错: ' + e.message, 'error'); }
      }

      async function rescan() {
        rescanning.value = true;
        try {
          const res = await fetch(`${API}/rescan?type=${activeTab.value}`, { method: 'POST', credentials: 'include' });
          const data = await res.json();
          if (data.success) {
            showToast('索引已重新生成', 'success');
            await loadSkills();
            if (selected.value) await selectSkill(selected.value);
          } else showToast('扫描失败: ' + data.error, 'error');
        } catch (e) { showToast('扫描出错', 'error'); }
        finally { rescanning.value = false; }
      }

      async function createSkill() {
        const name = newSkillName.value.trim();
        const typeLabel = activeTab.value === 'skill' ? '技能包' : '工作流';
        if (!name) { showToast(`请输入${typeLabel}名称`, 'error'); return; }
        creating.value = true;
        try {
          const res = await fetch(`${API}/skills?type=${activeTab.value}`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content: newSkillContent.value || '', type: activeTab.value })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`${typeLabel} "${name}" 已创建`, 'success');
            showCreateModal.value = false;
            newSkillName.value = '';
            newSkillContent.value = '';
            await loadSkills();
            selectSkill(name);
          } else showToast('创建失败: ' + data.error, 'error');
        } catch (e) { showToast('创建出错: ' + e.message, 'error'); }
        finally { creating.value = false; }
      }

      function startEdit() {
        if (!detail.value) return;
        editContent.value = detail.value.fullContent || '';
        editing.value = true;
      }

      async function saveEdit() {
        if (!detail.value) return;
        try {
          const res = await fetch(`${API}/skills/${encodeURIComponent(detail.value.name)}?type=${activeTab.value}`, {
            method: 'PUT', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: editContent.value })
          });
          const data = await res.json();
          if (data.success) {
            showToast('SKILL.md 已保存', 'success');
            editing.value = false;
            await selectSkill(detail.value.name);
          } else showToast('保存失败: ' + data.error, 'error');
        } catch (e) { showToast('保存出错: ' + e.message, 'error'); }
      }

      function getInitial(name) {
        return name ? name.charAt(0).toUpperCase() : '?';
      }

      onMounted(loadSkills);

      return () => h('div', { class: 'sb-page' }, [
        // === Left sidebar ===
        h('div', { class: 'sb-sidebar' }, [
          h('h3', [
            activeTab.value === 'skill' ? 'Skill 技能包' : 'Workflow 工作流',
            h('span', { class: 'sb-count' }, `${filtered.value.length} / ${skills.value.length}`)
          ]),
          h('div', { class: 'sb-tabs' }, [
            h('button', {
              class: 'sb-tab' + (activeTab.value === 'skill' ? ' active' : ''),
              onClick: () => { if (activeTab.value !== 'skill') { activeTab.value = 'skill'; selected.value = null; detail.value = null; loadSkills(); } }
            }, '\u{1F4DA} 技能包'),
            h('button', {
              class: 'sb-tab' + (activeTab.value === 'workflow' ? ' active' : ''),
              onClick: () => { if (activeTab.value !== 'workflow') { activeTab.value = 'workflow'; selected.value = null; detail.value = null; loadSkills(); } }
            }, '\u{1F504} 工作流')
          ]),
          h('input', {
            class: 'sb-search', type: 'text', placeholder: '搜索技能…',
            value: search.value,
            onInput: e => { search.value = e.target.value; }
          }),
          h('div', { class: 'sb-sidebar-actions' }, [
            h('button', { class: 'sb-btn compact ghost', onClick: () => { showCreateModal.value = true; } }, [
              h('span', { class: 'material-symbols-outlined' }, 'add'),
              '新建'
            ]),
            h('button', { class: 'sb-btn compact', style: 'flex:1;', disabled: rescanning.value, onClick: rescan }, [
              h('span', { class: 'material-symbols-outlined' }, 'refresh'),
              rescanning.value ? '扫描中…' : '重新扫描'
            ])
          ]),
          h('div', { class: 'sb-list' },
            loading.value
              ? [h('div', { style: 'text-align:center; padding:20px; color:var(--secondary-text);' }, '加载中…')]
              : filtered.value.length === 0
                ? [h('div', { style: 'text-align:center; padding:20px; color:var(--secondary-text); font-size:0.82rem;' }, search.value ? '无匹配结果' : (activeTab.value === 'skill' ? 'SKILL/ 目录为空' : 'WORKFLOW/ 目录为空'))]
                : filtered.value.map(sk =>
                    h('div', {
                      class: 'sb-item' + (selected.value === sk.name ? ' active' : ''),
                      key: sk.name,
                      onClick: () => selectSkill(sk.name)
                    }, [
                      h('div', { class: 'sb-avatar' }, getInitial(sk.name)),
                      h('div', { class: 'sb-item-info' }, [
                        h('div', { class: 'sb-item-name' }, sk.name),
                        h('div', { class: 'sb-item-meta' }, `${sk.fileCount} 个文件`)
                      ]),
                      h('div', { class: 'sb-status ' + (sk.hasSkillMd ? 'ok' : 'missing') })
                    ])
                  )
          )
        ]),

        // === Right main ===
        h('div', { class: 'sb-main' }, [
          // No selection
          !selected.value && h('div', { class: 'sb-empty' }, [
            h('span', { class: 'material-symbols-outlined' }, 'psychology'),
            h('div', activeTab.value === 'skill' ? '选择左侧技能包查看详情' : '选择左侧工作流查看详情'),
            h('div', { style: 'font-size:0.78rem; max-width:400px; margin-top:8px;' },
              activeTab.value === 'skill'
                ? 'SkillBridge 扫描 SKILL/ 目录下的技能预设，生成可折叠索引供 AI 按需感知。'
                : 'SkillBridge 扫描 WORKFLOW/ 目录下的工作流预设，生成可折叠索引供 AI 按需编排。')
          ]),

          // Detail loading
          selected.value && detailLoading.value && h('div', { class: 'sb-empty' }, '加载中…'),

          // Detail view
          selected.value && !detailLoading.value && detail.value && [
            // Toolbar
            h('div', { class: 'sb-toolbar' }, [
              h('div', { class: 'sb-title' }, [
                detail.value.name,
                h('span', { class: 'sb-meta' }, detail.value.hasSkillMd ? 'SKILL.md ✓' : 'SKILL.md 缺失')
              ]),
              h('button', { class: 'sb-btn ghost compact', onClick: () => { showContent.value = !showContent.value; editing.value = false; } }, [
                h('span', { class: 'material-symbols-outlined' }, showContent.value ? 'visibility_off' : 'code'),
                showContent.value ? '收起' : '查看'
              ]),
              h('button', { class: 'sb-btn ghost compact', onClick: startEdit }, [
                h('span', { class: 'material-symbols-outlined' }, 'edit'),
                '编辑'
              ]),
              h('button', { class: 'sb-btn danger compact', onClick: () => deleteSkill(detail.value.name) }, [
                h('span', { class: 'material-symbols-outlined' }, 'delete'),
                '删除'
              ])
            ]),

            h('div', { class: 'sb-detail' }, [
              // Info grid
              h('div', { class: 'sb-section' }, [
                h('div', { class: 'sb-section-head' }, [
                  h('span', { class: 'sb-section-title' }, [
                    h('span', { class: 'material-symbols-outlined' }, 'info'),
                    '基本信息'
                  ])
                ]),
                h('div', { class: 'sb-section-body' }, [
                  h('div', { class: 'sb-info-grid' }, [
                    h('div', { class: 'sb-info-item' }, [
                      h('div', { class: 'sb-info-label' }, '文件数'),
                      h('div', { class: 'sb-info-value' }, `${detail.value.fileCount}`)
                    ]),
                    h('div', { class: 'sb-info-item' }, [
                      h('div', { class: 'sb-info-label' }, 'SKILL.md'),
                      h('div', { class: 'sb-info-value', style: detail.value.hasSkillMd ? 'color:#22c55e' : 'color:#ef4444' },
                        detail.value.hasSkillMd ? '存在' : '缺失')
                    ]),
                    h('div', { class: 'sb-info-item' }, [
                      h('div', { class: 'sb-info-label' }, '最后修改'),
                      h('div', { class: 'sb-info-value' },
                        detail.value.lastModified ? new Date(detail.value.lastModified).toLocaleString() : '-')
                    ]),
                    h('div', { class: 'sb-info-item' }, [
                      h('div', { class: 'sb-info-label' }, '子目录'),
                      h('div', { class: 'sb-info-value' }, `${detail.value.subdirs?.length || 0} 个`)
                    ])
                  ])
                ])
              ]),

              // Description
              detail.value.description && h('div', { class: 'sb-section' }, [
                h('div', { class: 'sb-section-head' }, [
                  h('span', { class: 'sb-section-title' }, [
                    h('span', { class: 'material-symbols-outlined' }, 'description'),
                    '描述'
                  ])
                ]),
                h('div', { class: 'sb-section-body', style: 'line-height:1.7;' }, detail.value.description)
              ]),

              // Subdirs
              detail.value.subdirs?.length > 0 && h('div', { class: 'sb-section' }, [
                h('div', { class: 'sb-section-head' }, [
                  h('span', { class: 'sb-section-title' }, [
                    h('span', { class: 'material-symbols-outlined' }, 'folder'),
                    '目录结构'
                  ])
                ]),
                h('div', { class: 'sb-section-body' }, [
                  h('div', { class: 'sb-tags' },
                    detail.value.subdirs.map(d =>
                      h('span', { class: 'sb-tag', key: d }, [
                        h('span', { class: 'material-symbols-outlined' }, 'folder'),
                        d
                      ])
                    )
                  )
                ])
              ]),

              // SKILL.md content (read-only)
              showContent.value && !editing.value && detail.value.fullContent && h('div', { class: 'sb-section' }, [
                h('div', { class: 'sb-section-head' }, [
                  h('span', { class: 'sb-section-title' }, [
                    h('span', { class: 'material-symbols-outlined' }, 'code'),
                    'SKILL.md 内容'
                  ]),
                  h('span', { style: 'font-size:0.72rem; color:var(--secondary-text);' },
                    `${detail.value.fullContent.length} 字符`)
                ]),
                h('div', { class: 'sb-section-body' }, [
                  h('div', { class: 'sb-content-preview' }, detail.value.fullContent)
                ])
              ]),

              // SKILL.md editor
              editing.value && h('div', { class: 'sb-section' }, [
                h('div', { class: 'sb-section-head' }, [
                  h('span', { class: 'sb-section-title' }, [
                    h('span', { class: 'material-symbols-outlined' }, 'edit_note'),
                    '编辑 SKILL.md'
                  ])
                ]),
                h('div', { class: 'sb-section-body' }, [
                  h('textarea', {
                    class: 'sb-textarea',
                    value: editContent.value,
                    onInput: e => { editContent.value = e.target.value; },
                    style: 'min-height: 300px;'
                  }),
                  h('div', { class: 'sb-edit-actions' }, [
                    h('button', { class: 'sb-btn ghost compact', onClick: () => { editing.value = false; } }, '取消'),
                    h('button', { class: 'sb-btn compact', onClick: saveEdit }, [
                      h('span', { class: 'material-symbols-outlined' }, 'save'),
                      '保存'
                    ])
                  ])
                ])
              ])
            ])
          ]
        ]),

        // Create modal
        showCreateModal.value && h('div', { class: 'sb-modal-overlay', onClick: e => { if (e.target === e.currentTarget) showCreateModal.value = false; } }, [
          h('div', { class: 'sb-modal' }, [
            h('div', { class: 'sb-modal-head' }, [
              h('h4', activeTab.value === 'skill' ? '新建 Skill 技能包' : '新建 Workflow 工作流'),
              h('button', { class: 'sb-btn ghost compact', onClick: () => { showCreateModal.value = false; } }, [
                h('span', { class: 'material-symbols-outlined' }, 'close')
              ])
            ]),
            h('div', { class: 'sb-modal-body' }, [
              h('div', [
                h('div', { class: 'sb-label' }, (activeTab.value === 'skill' ? '技能包' : '工作流') + '名称（目录名）'),
                h('input', {
                  class: 'sb-input', type: 'text', placeholder: activeTab.value === 'skill' ? 'my-custom-skill' : 'my-custom-workflow',
                  value: newSkillName.value,
                  onInput: e => { newSkillName.value = e.target.value; }
                })
              ]),
              h('div', [
                h('div', { class: 'sb-label' }, 'SKILL.md 内容（可选，后续可编辑）'),
                h('textarea', {
                  class: 'sb-textarea', placeholder: '---\ndescription: 技能描述...\n---\n\n# 技能内容\n...',
                  value: newSkillContent.value,
                  onInput: e => { newSkillContent.value = e.target.value; }
                })
              ])
            ]),
            h('div', { class: 'sb-modal-foot' }, [
              h('button', { class: 'sb-btn ghost', onClick: () => { showCreateModal.value = false; } }, '取消'),
              h('button', { class: 'sb-btn', disabled: creating.value || !newSkillName.value.trim(), onClick: createSkill }, [
                h('span', { class: 'material-symbols-outlined' }, 'add'),
                creating.value ? '创建中…' : '创建'
              ])
            ])
          ])
        ])
      ]);
    }
  });
})();
