/* ============================================================
   Vantage — Kanban Board
   script.js — data is mocked, all actions are dummy.
   Drag & drop uses the native HTML5 DnD API with a custom
   floating ghost + placeholder for a polished, app-like feel.
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const TEAM = [
  { i: 'AW', n: 'Aria Whitfield' },
  { i: 'MS', n: 'Mika Sato' },
  { i: 'TK', n: 'Tom Keller' },
  { i: 'JL', n: 'Julia Lang' },
  { i: 'RN', n: 'Ren Nakata' },
  { i: 'EC', n: 'Elena Cho' },
];

const COLUMNS = [
  { id: 'backlog', name: 'Backlog', color: 'var(--text-tertiary)' },
  { id: 'todo', name: 'Todo', color: 'var(--blue)' },
  { id: 'progress', name: 'In Progress', color: 'var(--amber)' },
  { id: 'review', name: 'Review', color: 'var(--accent-1)' },
  { id: 'done', name: 'Done', color: 'var(--green)' },
];

const PRIORITY_LABEL = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };

let CARDS = {};
let cardSeq = 1;

function makeCard({ title, assignee, due, soon = false, tags = [], priority = 'medium', comments = 0, attachments = 0, column }) {
  const id = `c${cardSeq++}`;
  CARDS[id] = { id, title, assignee, due, soon, tags, priority, comments, attachments, column };
  return id;
}

function seedData() {
  CARDS = {}; cardSeq = 1;
  const cols = {
    backlog: [
      makeCard({ title: 'ダークモードのカラーパレット再設計', assignee: TEAM[1], due: '来週', tags: ['Design'], priority: 'low', comments: 2, attachments: 1, column: 'backlog' }),
      makeCard({ title: 'オンボーディングのA/Bテスト設計', assignee: TEAM[5], due: '2週間後', tags: ['Growth'], priority: 'medium', comments: 0, attachments: 0, column: 'backlog' }),
      makeCard({ title: 'サードパーティ連携の調査', assignee: TEAM[2], due: '未定', tags: ['Engineering'], priority: 'low', comments: 1, attachments: 2, column: 'backlog' }),
      makeCard({ title: 'アクセシビリティ監査', assignee: TEAM[4], due: '3週間後', tags: ['QA'], priority: 'medium', comments: 0, attachments: 0, column: 'backlog' }),
    ],
    todo: [
      makeCard({ title: 'ログイン画面のQA', assignee: TEAM[4], due: '明日', soon: true, tags: ['QA', 'Design'], priority: 'high', comments: 3, attachments: 2, column: 'todo' }),
      makeCard({ title: 'プッシュ通知の権限フロー', assignee: TEAM[2], due: '3日後', tags: ['Engineering'], priority: 'medium', comments: 1, attachments: 0, column: 'todo' }),
      makeCard({ title: 'Hero セクションのコピー確定', assignee: TEAM[0], due: '5日後', tags: ['Marketing'], priority: 'low', comments: 4, attachments: 1, column: 'todo' }),
    ],
    progress: [
      makeCard({ title: '決済フローのリファクタリング', assignee: TEAM[3], due: '2日後', soon: true, tags: ['Engineering'], priority: 'urgent', comments: 6, attachments: 3, column: 'progress' }),
      makeCard({ title: 'ダッシュボードのチャートコンポーネント', assignee: TEAM[1], due: '4日後', tags: ['Design', 'Engineering'], priority: 'high', comments: 2, attachments: 1, column: 'progress' }),
      makeCard({ title: 'API レート制限の実装', assignee: TEAM[2], due: '来週', tags: ['Engineering'], priority: 'medium', comments: 0, attachments: 0, column: 'progress' }),
    ],
    review: [
      makeCard({ title: 'プロフィール設定画面のレビュー', assignee: TEAM[0], due: '今日', soon: true, tags: ['Design'], priority: 'high', comments: 5, attachments: 2, column: 'review' }),
      makeCard({ title: '検索パフォーマンス改善 PR', assignee: TEAM[5], due: '明日', soon: true, tags: ['Engineering'], priority: 'urgent', comments: 3, attachments: 1, column: 'review' }),
    ],
    done: [
      makeCard({ title: 'マーケティングサイトのSEO対応', assignee: TEAM[0], due: '完了', tags: ['Marketing'], priority: 'low', comments: 2, attachments: 0, column: 'done' }),
      makeCard({ title: 'メール通知テンプレート', assignee: TEAM[3], due: '完了', tags: ['Design'], priority: 'low', comments: 1, attachments: 3, column: 'done' }),
      makeCard({ title: 'API 統合テスト', assignee: TEAM[2], due: '完了', tags: ['Engineering', 'QA'], priority: 'medium', comments: 0, attachments: 0, column: 'done' }),
    ],
  };
  return cols;
}

let COLUMN_CARD_IDS = seedData();

const state = { search: '', priorities: new Set(), assignee: null };

/* ============================================================
   1. Toasts
   ============================================================ */
function showToast(message) {
  const host = $('#toastHost');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${message}</span>`;
  host.appendChild(toast);
  gsap.fromTo(toast, { y: -16, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
  setTimeout(() => {
    gsap.to(toast, { y: -12, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => toast.remove() });
  }, 2800);
}

/* ============================================================
   2. Sidebar
   ============================================================ */
function initSidebar() {
  const sidebar = $('#sidebar');
  $('#sidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('is-collapsed'));
  $('#mobileSidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('is-mobile-open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    if (!sidebar.classList.contains('is-mobile-open')) return;
    if (sidebar.contains(e.target) || e.target.closest('#mobileSidebarToggle')) return;
    sidebar.classList.remove('is-mobile-open');
  });
}

/* ============================================================
   3. Generic dropdown controller
   ============================================================ */
function createDropdown(trigger, panel) {
  if (!trigger || !panel) return null;
  function open() {
    closeAllDropdowns();
    panel.classList.add('is-open');
    gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out' });
  }
  function close() {
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.16, onComplete: () => panel.classList.remove('is-open') });
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('is-open') ? close() : open();
  });
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('is-open')) return;
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return { open, close };
}

function closeAllDropdowns() {
  $$('.dropdown.is-open').forEach((panel) => {
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.14, onComplete: () => panel.classList.remove('is-open') });
  });
}

function openFloating(panel, trigger, { align = 'left' } = {}) {
  closeAllDropdowns();
  const rect = trigger.getBoundingClientRect();
  panel.style.position = 'fixed';
  panel.style.top = `${rect.bottom + 8}px`;
  const left = align === 'right' ? rect.right - panel.offsetWidth : rect.left;
  panel.style.left = `${Math.max(12, Math.min(left, window.innerWidth - panel.offsetWidth - 12))}px`;
  panel.style.right = 'auto';
  panel.classList.add('is-open');
  gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out' });
  const closeHandler = (e) => {
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.14, onComplete: () => panel.classList.remove('is-open') });
    document.removeEventListener('click', closeHandler);
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

function initTopbarPopovers() {
  createDropdown($('#notifBtn'), $('#notifDropdown'));
  createDropdown($('#profileBtn'), $('#profileDropdown'));
  $('#clearNotifs')?.addEventListener('click', () => {
    $('#notifList').style.display = 'none';
    $('#notifEmpty').classList.add('is-visible');
    $('#notifBadge').style.display = 'none';
    showToast('すべての通知を既読にしました');
  });
}

/* ============================================================
   4. Toolbar: search / priority filter / assignee filter
   ============================================================ */
function initSearch() {
  const input = $('#boardSearch');
  const clearBtn = $('#searchClear');
  input.addEventListener('input', () => {
    state.search = input.value.trim().toLowerCase();
    clearBtn.hidden = state.search.length === 0;
    applyFilters();
  });
  clearBtn.addEventListener('click', () => {
    input.value = ''; state.search = ''; clearBtn.hidden = true; input.focus();
    applyFilters();
  });
}

function initPriorityFilter() {
  createDropdown($('#priorityBtn'), $('#priorityDropdown'));
  const checkboxes = $$('#priorityList input[type="checkbox"]');
  const countBadge = $('#priorityCount');
  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.priorities.add(cb.value); else state.priorities.delete(cb.value);
      countBadge.textContent = state.priorities.size;
      countBadge.hidden = state.priorities.size === 0;
      applyFilters();
    });
  });
  $('#priorityClear')?.addEventListener('click', () => {
    checkboxes.forEach((cb) => { cb.checked = false; });
    state.priorities.clear();
    countBadge.hidden = true;
    applyFilters();
  });
}

function initAssigneeFilter() {
  const wrap = $('#assigneeFilter');
  wrap.innerHTML = TEAM.map((m, i) => `
    <button class="assignee-filter__btn" data-initials="${m.i}" data-tooltip="${m.n}" style="z-index:${TEAM.length - i}">
      <span class="avatar avatar--grad">${m.i}</span>
    </button>
  `).join('');
  $$('.assignee-filter__btn', wrap).forEach((btn) => {
    btn.addEventListener('click', () => {
      const initials = btn.getAttribute('data-initials');
      const isActive = btn.classList.contains('is-active');
      $$('.assignee-filter__btn', wrap).forEach((b) => b.classList.remove('is-active'));
      if (isActive) { state.assignee = null; }
      else { btn.classList.add('is-active'); state.assignee = initials; }
      applyFilters();
    });
  });
}

function applyFilters() {
  $$('.kanban-card').forEach((el) => {
    const id = el.getAttribute('data-id');
    const card = CARDS[id];
    if (!card) return;
    const matchesSearch = !state.search || card.title.toLowerCase().includes(state.search);
    const matchesPriority = state.priorities.size === 0 || state.priorities.has(card.priority);
    const matchesAssignee = !state.assignee || card.assignee.i === state.assignee;
    const visible = matchesSearch && matchesPriority && matchesAssignee;
    el.style.display = visible ? '' : 'none';
  });
  updateAllColumnCounts();
}

/* ============================================================
   5. Card + column rendering
   ============================================================ */
const ATTACH_ICON = '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>';
const COMMENT_ICON = '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
const CLOCK_ICON = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';

function cardTemplate(card) {
  const priorityVar = { urgent: '#ff6b6b', high: '#f2b25c', medium: '#9a85ff', low: '#63646f' }[card.priority];
  return `
    <div class="kanban-card" draggable="true" data-id="${card.id}" style="--pc:${priorityVar}">
      <div class="kanban-card__top">
        <span class="kanban-card__priority"><span class="priority-dot priority-dot--${card.priority}"></span>${PRIORITY_LABEL[card.priority]}</span>
        <button class="kanban-card__menu-btn" data-menu-trigger aria-label="メニュー">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>
        </button>
      </div>
      <p class="kanban-card__title">${card.title}</p>
      <div class="kanban-card__tags">${card.tags.map((t) => `<span class="kanban-tag">${t}</span>`).join('')}</div>
      <div class="kanban-card__footer">
        <div class="kanban-card__meta">
          <span class="kanban-card__due ${card.soon ? 'kanban-card__due--soon' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CLOCK_ICON}</svg>${card.due}</span>
          ${card.comments > 0 ? `<span class="kanban-card__meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${COMMENT_ICON}</svg>${card.comments}</span>` : ''}
          ${card.attachments > 0 ? `<span class="kanban-card__meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ATTACH_ICON}</svg>${card.attachments}</span>` : ''}
        </div>
        <span class="avatar avatar--xs avatar--grad" data-tooltip="${card.assignee.n}">${card.assignee.i}</span>
      </div>
    </div>
  `;
}

function columnTemplate(col) {
  const ids = COLUMN_CARD_IDS[col.id];
  return `
    <div class="kanban-column" data-column-id="${col.id}">
      <div class="kanban-column__header">
        <span class="kanban-column__dot" style="background:${col.color}"></span>
        <span class="kanban-column__title">${col.name}</span>
        <span class="kanban-column__count" data-count>${ids.length}</span>
        <button class="kanban-column__menu-btn" data-column-menu-trigger aria-label="カラムメニュー">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>
        </button>
      </div>
      <div class="kanban-column__list" data-list>
        ${ids.map((id) => cardTemplate(CARDS[id])).join('')}
      </div>
      <button class="kanban-column__add" data-add-trigger>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        タスクを追加
      </button>
    </div>
  `;
}

function renderBoard() {
  const board = $('#board');
  board.innerHTML = COLUMNS.map(columnTemplate).join('');
  $('#totalCount').textContent = Object.keys(CARDS).length;

  gsap.fromTo('.kanban-column',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.1 }
  );
  gsap.fromTo('.kanban-card',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.025, ease: 'power2.out', delay: 0.35 }
  );

  bindCardMenus();
  bindColumnMenus();
  bindAddButtons();
  initDragAndDrop();
  applyFilters();
}

function updateAllColumnCounts() {
  $$('.kanban-column').forEach((col) => {
    const list = $('[data-list]', col);
    const visibleCount = $$('.kanban-card', list).filter((c) => c.style.display !== 'none').length;
    $('[data-count]', col).textContent = visibleCount;
  });
}

/* ============================================================
   6. Card ••• menu + column ••• menu
   ============================================================ */
let activeCardId = null;
let activeColumnId = null;

function bindCardMenus() {
  const menu = $('#cardMenu');
  $$('[data-menu-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.kanban-card');
      activeCardId = card.getAttribute('data-id');
      openFloating(menu, btn, { align: 'right' });
    });
  });
}

function bindColumnMenus() {
  const menu = $('#columnMenu');
  $$('[data-column-menu-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const col = btn.closest('.kanban-column');
      activeColumnId = col.getAttribute('data-column-id');
      openFloating(menu, btn, { align: 'right' });
    });
  });
}

function initCardMenuActions() {
  $$('#cardMenu .dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const card = CARDS[activeCardId];
      const name = card ? card.title : 'タスク';
      $('#cardMenu').classList.remove('is-open');
      if (action === 'delete' && card) {
        const el = $(`.kanban-card[data-id="${activeCardId}"]`);
        if (el) {
          gsap.to(el, {
            opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
              el.remove();
              COLUMN_CARD_IDS[card.column] = COLUMN_CARD_IDS[card.column].filter((id) => id !== card.id);
              delete CARDS[card.id];
              updateAllColumnCounts();
              $('#totalCount').textContent = Object.keys(CARDS).length;
            }
          });
        }
      }
      const messages = {
        open: `「${name}」の詳細を開きます`,
        edit: `「${name}」を編集します`,
        duplicate: `「${name}」を複製しました`,
        delete: `「${name}」を削除しました`,
      };
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

function initColumnMenuActions() {
  $$('#columnMenu .dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const col = COLUMNS.find((c) => c.id === activeColumnId);
      const name = col ? col.name : 'カラム';
      $('#columnMenu').classList.remove('is-open');
      const messages = {
        addtop: `「${name}」の先頭にタスクを追加します`,
        sort: `「${name}」を優先度で並び替えました`,
        clear: `「${name}」をクリアしました`,
      };
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

function bindAddButtons() {
  $$('[data-add-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const col = btn.closest('.kanban-column');
      const columnId = col.getAttribute('data-column-id');
      openTaskDialog(columnId);
    });
  });
}

/* ============================================================
   7. New Task dialog
   ============================================================ */
function openTaskDialog(defaultColumn) {
  $('#taskColumn').value = defaultColumn || 'todo';
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  overlay.classList.add('is-open');
  gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
  gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#taskTitle')?.focus(), 100);
}

function initDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const closeBtn = $('#dialogClose');
  const createBtn = $('#createTaskBtn');
  const titleInput = $('#taskTitle');
  const priorityOptions = $$('.priority-option');
  let selectedPriority = 'low';

  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });
  }

  $('#newTaskBtn')?.addEventListener('click', () => openTaskDialog('todo'));
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  priorityOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      priorityOptions.forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      selectedPriority = opt.getAttribute('data-priority');
    });
  });

  createBtn?.addEventListener('click', () => {
    if (!titleInput.value.trim()) {
      gsap.fromTo(dialog, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
      return;
    }
    createBtn.classList.add('is-loading');
    setTimeout(() => {
      createBtn.classList.remove('is-loading');
      const columnId = $('#taskColumn').value;
      const id = makeCard({
        title: titleInput.value.trim(),
        assignee: TEAM[0],
        due: '未定',
        tags: [],
        priority: selectedPriority,
        comments: 0,
        attachments: 0,
        column: columnId,
      });
      COLUMN_CARD_IDS[columnId].push(id);
      const list = $(`.kanban-column[data-column-id="${columnId}"] [data-list]`);
      list.insertAdjacentHTML('beforeend', cardTemplate(CARDS[id]));
      const newEl = list.lastElementChild;
      gsap.fromTo(newEl, { opacity: 0, y: 14, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
      bindCardMenus();
      initDragAndDrop();
      updateAllColumnCounts();
      $('#totalCount').textContent = Object.keys(CARDS).length;

      titleInput.value = '';
      priorityOptions.forEach((o) => o.classList.remove('is-active'));
      $('.priority-option[data-priority="low"]').classList.add('is-active');
      selectedPriority = 'low';

      close();
      showToast('タスクを作成しました');
    }, 1000);
  });
}

/* ============================================================
   8. Command palette
   ============================================================ */
function initCommandPalette() {
  const overlay = $('#cmdkOverlay');
  const panel = $('#cmdk');
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const empty = $('#cmdkEmpty');
  const items = $$('.cmdk__item', list);

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.22, ease: 'power2.out' });
    gsap.fromTo(panel, { opacity: 0, scale: 0.96, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    gsap.to(panel, { opacity: 0, scale: 0.97, y: -6, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; input.value = ''; filter(''); } });
  }
  function filter(q) {
    q = q.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const match = item.textContent.toLowerCase().includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    empty.hidden = visible !== 0;
  }

  $('#cmdkTrigger')?.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('is-open') ? close() : open(); }
    else if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => filter(input.value));
  items.forEach((item) => item.addEventListener('click', () => {
    const msg = item.getAttribute('data-toast');
    close();
    if (msg) setTimeout(() => showToast(msg), 250);
  }));
}

/* ============================================================
   9. Drag & Drop
   ============================================================ */
let dragState = null; // { cardEl, cardId, sourceColumnId, offsetX, offsetY, lastX, ghost, placeholder }

function initDragAndDrop() {
  $$('.kanban-card').forEach((card) => {
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragend', onDragEnd);
  });
  $$('.kanban-column__list').forEach((list) => {
    list.addEventListener('dragover', onDragOver);
    list.addEventListener('drop', onDrop);
  });
}

const EMPTY_DRAG_IMAGE = (() => {
  const img = new Image();
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';
  return img;
})();

function onDragStart(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  const ghost = document.createElement('div');
  ghost.className = 'kanban-ghost';
  ghost.innerHTML = card.innerHTML;
  ghost.style.width = `${rect.width}px`;
  document.body.appendChild(ghost);
  gsap.set(ghost, { x: rect.left, y: rect.top, rotation: 0 });

  const placeholder = document.createElement('div');
  placeholder.className = 'kanban-placeholder';
  placeholder.style.height = `${rect.height}px`;
  card.parentElement.insertBefore(placeholder, card.nextSibling);

  dragState = {
    cardEl: card,
    cardId: card.getAttribute('data-id'),
    sourceColumnId: card.closest('.kanban-column').getAttribute('data-column-id'),
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    lastX: e.clientX,
    ghost,
    placeholder,
  };

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
  try { e.dataTransfer.setData('text/plain', dragState.cardId); } catch (err) { /* noop */ }

  requestAnimationFrame(() => card.classList.add('is-dragging'));
  document.addEventListener('dragover', onGlobalDrag);
}

function onGlobalDrag(e) {
  if (!dragState || (e.clientX === 0 && e.clientY === 0)) return;
  const { ghost, offsetX, offsetY, lastX } = dragState;
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  const deltaX = e.clientX - lastX;
  const rotation = Math.max(-6, Math.min(6, deltaX * 0.6));
  gsap.set(ghost, { x, y });
  gsap.to(ghost, { rotation, duration: 0.2, ease: 'power2.out' });
  dragState.lastX = e.clientX;
}

function getDragAfterElement(list, y) {
  const cards = $$('.kanban-card:not(.is-dragging)', list).filter((c) => c.style.display !== 'none');
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function onDragOver(e) {
  if (!dragState) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const list = e.currentTarget;
  const column = list.closest('.kanban-column');
  $$('.kanban-column').forEach((c) => c.classList.toggle('is-drag-over', c === column));

  const afterEl = getDragAfterElement(list, e.clientY);
  if (afterEl == null) {
    list.appendChild(dragState.placeholder);
  } else if (afterEl !== dragState.placeholder) {
    list.insertBefore(dragState.placeholder, afterEl);
  }
}

function onDrop(e) {
  if (!dragState) return;
  e.preventDefault();
  const list = e.currentTarget;
  const targetColumnId = list.closest('.kanban-column').getAttribute('data-column-id');
  const { cardEl, cardId, sourceColumnId, placeholder } = dragState;

  list.insertBefore(cardEl, placeholder);
  placeholder.remove();
  cardEl.classList.remove('is-dragging');
  gsap.fromTo(cardEl, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

  syncColumnFromDom(sourceColumnId);
  syncColumnFromDom(targetColumnId);
  updateAllColumnCounts();

  if (CARDS[cardId]) CARDS[cardId].column = targetColumnId;

  if (sourceColumnId !== targetColumnId) {
    const col = COLUMNS.find((c) => c.id === targetColumnId);
    const card = CARDS[cardId];
    showToast(`「${card ? card.title : 'タスク'}」を ${col ? col.name : ''} に移動しました`);
  }

  cleanupDrag(false);
}

function onDragEnd() {
  if (!dragState) return;
  const { cardEl, placeholder } = dragState;
  cardEl.classList.remove('is-dragging');
  if (placeholder && placeholder.parentElement) placeholder.remove();
  cleanupDrag(true);
}

function cleanupDrag(removeGhostImmediately) {
  document.removeEventListener('dragover', onGlobalDrag);
  $$('.kanban-column').forEach((c) => c.classList.remove('is-drag-over'));
  if (dragState) {
    const { ghost } = dragState;
    if (removeGhostImmediately) {
      gsap.to(ghost, { opacity: 0, scale: 0.94, duration: 0.18, ease: 'power2.in', onComplete: () => ghost.remove() });
    } else {
      gsap.to(ghost, { opacity: 0, duration: 0.15, onComplete: () => ghost.remove() });
    }
  }
  dragState = null;
}

function syncColumnFromDom(columnId) {
  const list = $(`.kanban-column[data-column-id="${columnId}"] [data-list]`);
  if (!list) return;
  COLUMN_CARD_IDS[columnId] = $$('.kanban-card', list).map((el) => el.getAttribute('data-id'));
}

/* ============================================================
   10. Load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .fromTo('.page-head', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.28)
    .fromTo('.toolbar', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.4);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  $('#boardMenuBtn')?.addEventListener('click', () => showToast('ボード設定はこのデモでは無効です'));

  initSidebar();
  initTopbarPopovers();
  initSearch();
  initPriorityFilter();
  initAssigneeFilter();
  initDialog();
  initCommandPalette();
  initCardMenuActions();
  initColumnMenuActions();

  renderBoard();
  initLoadSequence();
});
